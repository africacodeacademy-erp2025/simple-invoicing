
// src/controllers/client.controller.protected.ts
import { supabase } from '@/lib/supabase';
import { PlanAccessService } from '@/services/planAccess.service';

export class ProtectedClientController {
  /**
   * Get total client count for a user
   */
  static async getClientCount(userId: string): Promise<number> {
    const { count, error } = await supabase
      .from('clients')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (error) {
      console.error('Error counting clients:', error);
      return 0;
    }

    return count ?? 0;
  }

  /**
   * Check if user can create a new client
   */
  static async canCreateClient(userId: string, userPlan?: string | null) {
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('plan, subscription_status, current_period_end')
      .eq('user_id', userId)
      .single();

    const plan = userPlan || profile?.plan;

    const premiumAccess = await PlanAccessService.checkPremiumAccess(
      plan,
      profile?.subscription_status,
      profile?.current_period_end
    );

    if (!premiumAccess.allowed) {
      return {
        success: false,
        error: premiumAccess.reason,
        code: 'SUBSCRIPTION_EXPIRED',
      };
    }

    const clientCount = await this.getClientCount(userId);
    const limitCheck = await PlanAccessService.canCreateClient(plan, clientCount);

    if (!limitCheck.allowed) {
      return {
        success: false,
        error: limitCheck.reason,
        code: 'LIMIT_REACHED',
        upgradeRequired: limitCheck.upgradeRequired,
        currentCount: clientCount,
      };
    }

    return {
      success: true,
      currentCount: clientCount,
    };
  }

  /**
   * Create client with access control
   */
  static async createClient(userId: string, clientData: any) {
    const canCreate = await this.canCreateClient(userId);
    
    if (!canCreate.success) {
      return {
        success: false,
        error: canCreate.error,
        code: canCreate.code,
        upgradeRequired: canCreate.upgradeRequired,
      };
    }

    const { data, error } = await supabase
      .from('clients')
      .insert([{ ...clientData, user_id: userId }])
      .select()
      .single();

    if (error) {
      console.error('Error creating client:', error);
      return {
        success: false,
        error: 'Failed to create client',
        code: 'DATABASE_ERROR',
      };
    }

    return {
      success: true,
      data,
      message: 'Client created successfully',
    };
  }
}
