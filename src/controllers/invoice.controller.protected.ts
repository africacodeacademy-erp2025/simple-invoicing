// src/controllers/invoice.controller.protected.ts
// Enhanced invoice controller with access control

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
    // Get user's profile to check plan
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('plan, subscription_status, current_period_end')
      .eq('user_id', userId)
      .single();

    const plan = userPlan || profile?.plan;

    // Check subscription status for paid plans
    const accessCheck = PlanAccessService.checkPremiumAccess(
      plan,
      profile?.subscription_status,
      profile?.current_period_end
    );

    if (!accessCheck.allowed) {
      return {
        success: false,
        error: accessCheck.reason,
        code: 'SUBSCRIPTION_EXPIRED',
      };
    }

    // Get current month invoice count
    const monthlyCount = await this.getMonthlyInvoiceCount(userId);

    // Check if user can create more invoices
    const limitCheck = await PlanAccessService.canCreateInvoice(
      userId,
      plan,
      monthlyCount
    );

    if (!limitCheck.allowed) {
      return {
        success: false,
        error: limitCheck.reason,
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
    // Get user's profile
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('plan, subscription_status, current_period_end')
      .eq('user_id', userId)
      .single();

    const plan = userPlan || profile?.plan;

    const accessCheck = PlanAccessService.canAccessFeature(plan, 'canUseRecurring');

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
  static async createInvoice(userId: string, invoiceData: any) {
    // Check if user can create invoice
    const canCreate = await this.canCreateInvoice(userId, invoiceData.userPlan);
    
    if (!canCreate.success) {
      return {
        success: false,
        error: canCreate.error,
        code: canCreate.code,
        upgradeRequired: canCreate.upgradeRequired,
      };
    }

    // Check recurring invoice permission if applicable
    if (invoiceData.is_recurring) {
      const canUseRecurring = await this.canUseRecurring(userId);
      if (!canUseRecurring.success) {
        return {
          success: false,
          error: canUseRecurring.error,
          code: canUseRecurring.code,
          upgradeRequired: canUseRecurring.upgradeRequired,
        };
      }
    }

    // Proceed with invoice creation
    const { data, error } = await supabase
      .from('invoices')
      .insert([{ ...invoiceData, user_id: userId }])
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
      .select('plan, subscription_status, current_period_end')
      .eq('user_id', userId)
      .single();

    const accessCheck = PlanAccessService.canAccessFeature(
      profile?.plan,
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