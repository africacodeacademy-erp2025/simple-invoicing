// src/controllers/client.controller.protected.ts
// Enhanced client controller with access control

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
    // Get user's profile
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('plan, subscription_status, current_period_end')
      .eq('user_id', userId)
      .single();

    const plan = userPlan || profile?.plan;

    // Check subscription status
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

    // Get current client count
    const clientCount = await this.getClientCount(userId);

    // Check if user can create more clients
    const limitCheck = PlanAccessService.canCreateClient(plan, clientCount);

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
    // Check if user can create client
    const canCreate = await this.canCreateClient(userId);
    
    if (!canCreate.success) {
      return {
        success: false,
        error: canCreate.error,
        code: canCreate.code,
        upgradeRequired: canCreate.upgradeRequired,
      };
    }

    // Proceed with client creation
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