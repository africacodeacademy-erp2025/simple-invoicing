// src/controllers/invoice.controller.protected.ts
import { supabase } from '@/lib/supabase';
import { PlanAccessService } from '@/services/planAccess.service';

export class ProtectedInvoiceController {
  /**
   * Get invoice count for current month
   */
  static async getMonthlyInvoiceCount(userId: string): Promise<number> {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const { count, error } = await supabase
      .from('invoices')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', firstDayOfMonth.toISOString())
      .lte('created_at', lastDayOfMonth.toISOString());

    if (error) {
      console.error('Error counting monthly invoices:', error);
      return 0;
    }

    return count ?? 0;
  }

  /**
   * Check if user can create an invoice (with limits check)
   */
  static async canCreateInvoice(userId: string, userPlan?: string | null) {
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('plan, subscription_status, current_period_end')
      .eq('user_id', userId)
      .single();

    const plan = userPlan || profile?.plan;

    // Invoice creation is a core feature, not strictly premium, but subject to limits.
    // The checkPremiumAccess is not directly applicable here for the base ability to create an invoice.
    // The limit check below handles the plan-specific restrictions.
    // If the user's plan is 'free', they should still be able to create invoices up to the limit.
    // The feedback "saying its a premium feature" suggests a misapplication of premium checks.
    // We will rely on the limit check below, which correctly differentiates between free and pro limits.

    const monthlyCount = await this.getMonthlyInvoiceCount(userId);
    const limitCheck = await PlanAccessService.canCreateInvoice(plan, monthlyCount);

    if (!limitCheck.allowed) {
      return {
        success: false,
        error: limitCheck.reason, // This reason will be "You've reached your limit..."
        code: 'LIMIT_REACHED',
        upgradeRequired: limitCheck.upgradeRequired,
        currentCount: monthlyCount,
      };
    }

    return {
      success: true,
      currentCount: monthlyCount,
    };
  }

  /**
   * Check if user can use recurring invoices
   */
  static async canUseRecurring(userId: string, userPlan?: string | null) {
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('plan, subscription_status, current_period_end') // Fetch subscription details for premium check
      .eq('user_id', userId)
      .single();

    const plan = userPlan || profile?.plan;
    
    // Check if the plan itself is premium and subscription is active
    const premiumAccessCheck = await PlanAccessService.checkPremiumAccess(
      plan,
      profile?.subscription_status,
      profile?.current_period_end
    );

    if (!premiumAccessCheck.allowed) {
      return {
        success: false,
        error: premiumAccessCheck.reason,
        code: 'FEATURE_LOCKED', // Or 'SUBSCRIPTION_EXPIRED' if that's more specific
        upgradeRequired: premiumAccessCheck.upgradeRequired,
      };
    }

    // If premium access is allowed, then check the specific feature limit
    const accessCheck = await PlanAccessService.canAccessFeature(plan, 'canUseRecurring');

    if (!accessCheck.allowed) {
      return {
        success: false,
        error: accessCheck.reason,
        code: 'FEATURE_LOCKED',
        upgradeRequired: accessCheck.upgradeRequired,
      };
    }

    return { success: true };
  }

  /**
   * Create invoice with access control
   */
  static async createInvoice(userId: string, dataToSave: any) {
    const { userPlan, ...invoiceData } = dataToSave;

    // The primary check for invoice creation is the limit, not a general premium check.
    // The canCreateInvoice function handles the monthly invoice limit.
    const canCreate = await this.canCreateInvoice(userId, userPlan);
    
    if (!canCreate.success) {
      // If the limit is reached, return the appropriate error.
      return {
        success: false,
        error: canCreate.error,
        code: canCreate.code,
        upgradeRequired: canCreate.upgradeRequired,
      };
    }

    // Check for recurring invoice feature access if applicable
    if (invoiceData.is_recurring) {
      const canUseRecurring = await this.canUseRecurring(userId, userPlan);
      if (!canUseRecurring.success) {
        return {
          success: false,
          error: canUseRecurring.error,
          code: canUseRecurring.code,
          upgradeRequired: canUseRecurring.upgradeRequired,
        };
      }
    }

    // Transform the nested invoiceData into a flat structure for the database
    const invoiceToInsert = {
      user_id: userId,
      invoice_number: invoiceData.invoiceNumber,
      issue_date: invoiceData.date,
      due_date: invoiceData.dueDate,
      currency: invoiceData.currency,
      is_recurring: invoiceData.isRecurring,
      recurring_interval: invoiceData.recurringInterval,
      business_name: invoiceData.businessInfo.name,
      business_email: invoiceData.businessInfo.email,
      business_phone: invoiceData.businessInfo.phone,
      business_address: invoiceData.businessInfo.address,
      business_logo_url: invoiceData.businessInfo.logo,
      client_name: invoiceData.clientInfo.name,
      client_email: invoiceData.clientInfo.email,
      client_address: invoiceData.clientInfo.address,
      bank_name: invoiceData.bankingInfo.bankName,
      account_number: invoiceData.bankingInfo.accountNumber,
      swift_code: invoiceData.bankingInfo.swiftCode,
      iban: invoiceData.bankingInfo.iban,
      line_items: invoiceData.lineItems,
      tax_rate: invoiceData.taxRate,
      discount_rate: invoiceData.discountRate,
      notes: invoiceData.notes,
      subtotal: invoiceData.subtotal,
      tax_amount: invoiceData.taxAmount,
      discount_amount: invoiceData.discountAmount,
      total: invoiceData.total,
      template: invoiceData.template,
    };

    const { data, error } = await supabase
      .from('invoices')
      .insert([invoiceToInsert])
      .select()
      .single();

    if (error) {
      console.error('Error creating invoice:', error);
      return {
        success: false,
        error: 'Failed to create invoice',
        code: 'DATABASE_ERROR',
      };
    }

    return {
      success: true,
      data,
      message: 'Invoice created successfully',
    };
  }

  /**
   * Export invoice as PDF (premium feature check)
   */
  static async canExportPDF(userId: string) {
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('plan, subscription_status, current_period_end') // Fetch subscription details for premium check
      .eq('user_id', userId)
      .single();

    const plan = profile?.plan;

    // First, check if the plan itself is premium and subscription is active.
    const premiumAccessCheck = await PlanAccessService.checkPremiumAccess(
      plan,
      profile?.subscription_status,
      profile?.current_period_end
    );

    if (!premiumAccessCheck.allowed) {
      return {
        success: false,
        error: premiumAccessCheck.reason,
        code: 'FEATURE_LOCKED', // Or 'SUBSCRIPTION_EXPIRED'
        upgradeRequired: premiumAccessCheck.upgradeRequired,
      };
    }

    // If premium access is allowed, then check the specific feature limit for PDF export.
    const accessCheck = await PlanAccessService.canAccessFeature(
      plan,
      'canExportPDF'
    );

    if (!accessCheck.allowed) {
      return {
        success: false,
        error: accessCheck.reason,
        code: 'FEATURE_LOCKED',
        upgradeRequired: accessCheck.upgradeRequired,
      };
    }

    return { success: true };
  }
}
