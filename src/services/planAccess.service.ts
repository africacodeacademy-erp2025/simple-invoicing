
// src/services/planAccess.service.ts
import { supabase } from '../lib/supabase';

export type PlanTier = 'free' | 'starter' | 'pro' | 'business' | 'enterprise';

export interface PlanLimits {
  maxInvoicesPerMonth: number;
  maxClients: number;
  maxTemplates: number;
  canUseAI: boolean;
  canExportPDF: boolean;
  canUseRecurring: boolean;
  canUseCustomBranding: boolean;
  canUseAdvancedAnalytics: boolean;
  canUseTeamAccess: boolean;
  canUseAutomatedReminders: boolean;
  canUseIntegrations: boolean;
  canUseAPIAccess: boolean;
  prioritySupport: boolean;
}

export type AllPlanLimits = Record<PlanTier, PlanLimits>;

export interface AccessCheckResult {
  allowed: boolean;
  reason?: string;
  upgradeRequired?: PlanTier;
}

export class PlanAccessService {
  private static _planLimits: AllPlanLimits | null = null;

  /**
   * Fetch all plan limits from the backend and cache them.
   */
  private static async _getOrFetchPlanLimits(): Promise<AllPlanLimits> {
    if (this._planLimits) {
      return this._planLimits;
    }

    const { data, error } = await supabase.functions.invoke('plan-limits');
    
    if (error) {
      console.error('Error fetching plan limits:', error);
      throw new Error('Could not fetch plan limits from the server.');
    }

    this._planLimits = data as AllPlanLimits;
    return this._planLimits!;
  }

  /**
   * Normalize plan string to PlanTier
   */
  static normalizePlan(plan?: string | null): PlanTier {
    if (!plan) return 'free';
    const normalized = plan.toLowerCase().trim();
    
    if (normalized.includes('enterprise')) return 'enterprise';
    if (normalized.includes('business') || normalized.includes('advanced')) return 'business';
    if (normalized.includes('pro') || normalized.includes('growth')) return 'pro';
    if (normalized.includes('starter')) return 'starter';
    
    return 'free';
  }

  /**
   * Get plan limits for a user's plan
   */
  static async getPlanLimits(plan?: string | null): Promise<PlanLimits> {
    const allLimits = await this._getOrFetchPlanLimits();
    const normalizedPlan = this.normalizePlan(plan);
    return allLimits[normalizedPlan];
  }

  /**
   * Check if user can access a specific feature
   */
  static async canAccessFeature(
    userPlan: string | null | undefined,
    feature: keyof PlanLimits
  ): Promise<AccessCheckResult> {
    const limits = await this.getPlanLimits(userPlan);
    const featureValue = limits[feature];

    if (typeof featureValue === 'boolean') {
      if (featureValue) {
        return { allowed: true };
      }
      
      const upgradeRequired = await this.getMinimumPlanForFeature(feature);
      return {
        allowed: false,
        reason: `This feature requires ${upgradeRequired} plan or higher`,
        upgradeRequired,
      };
    }

    return { allowed: true };
  }

  /**
   * Check if user has reached their invoice limit for the month
   */
  static async canCreateInvoice(
    userPlan: string | null | undefined,
    currentMonthInvoiceCount: number
  ): Promise<AccessCheckResult> {
    const limits = await this.getPlanLimits(userPlan);
    
    if (currentMonthInvoiceCount >= limits.maxInvoicesPerMonth) {
      const upgradeRequired = await this.getMinimumPlanForLimit('maxInvoicesPerMonth', currentMonthInvoiceCount + 1);
      return {
        allowed: false,
        reason: `You've reached your limit of ${limits.maxInvoicesPerMonth} invoices per month. Upgrade to create more.`,
        upgradeRequired,
      };
    }

    return { allowed: true };
  }

  /**
   * Check if user can create more clients
   */
  static async canCreateClient(
    userPlan: string | null | undefined,
    currentClientCount: number
  ): Promise<AccessCheckResult> {
    const limits = await this.getPlanLimits(userPlan);
    
    if (currentClientCount >= limits.maxClients) {
      const upgradeRequired = await this.getMinimumPlanForLimit('maxClients', currentClientCount + 1);
      return {
        allowed: false,
        reason: `You've reached your limit of ${limits.maxClients} clients. Upgrade to add more.`,
        upgradeRequired,
      };
    }

    return { allowed: true };
  }

  /**
   * Check if user can use a specific template
   */
  static async canUseTemplate(
    userPlan: string | null | undefined,
    templateIndex: number
  ): Promise<AccessCheckResult> {
    const limits = await this.getPlanLimits(userPlan);
    
    if (templateIndex >= limits.maxTemplates) {
      const requiredValue = templateIndex + 1;
      const upgradeRequired = await this.getMinimumPlanForLimit('maxTemplates', requiredValue);
      return {
        allowed: false,
        reason: `This template requires a ${upgradeRequired} plan or higher`,
        upgradeRequired: upgradeRequired,
      };
    }

    return { allowed: true };
  }

  /**
   * Get minimum plan that allows a specific feature
   */
  private static async getMinimumPlanForFeature(feature: keyof PlanLimits): Promise<PlanTier> {
    const allLimits = await this._getOrFetchPlanLimits();
    const plans: PlanTier[] = ['free', 'starter', 'pro', 'business', 'enterprise'];
    
    for (const plan of plans) {
      const limits = allLimits[plan];
      const value = limits[feature];
      if (typeof value === 'boolean' && value === true) {
        return plan;
      }
    }
    
    return 'enterprise';
  }

  /**
   * Get minimum plan that allows a specific limit value
   */
  private static async getMinimumPlanForLimit(
    limitKey: keyof PlanLimits,
    requiredValue: number
  ): Promise<PlanTier> {
    const allLimits = await this._getOrFetchPlanLimits();
    const plans: PlanTier[] = ['free', 'starter', 'pro', 'business', 'enterprise'];
    
    for (const plan of plans) {
      const limits = allLimits[plan];
      const value = limits[limitKey];
      if (typeof value === 'number' && value >= requiredValue) {
        return plan;
      }
    }
    
    return 'enterprise';
  }

  /**
   * Check subscription status is valid
   */
  static isSubscriptionActive(
    subscriptionStatus?: string | null,
    currentPeriodEnd?: string | null
  ): boolean {
    if (!subscriptionStatus) return false;
    
    const activeStatuses = ['active', 'trialing'];
    if (!activeStatuses.includes(subscriptionStatus)) return false;

    if (currentPeriodEnd) {
      const endDate = new Date(currentPeriodEnd);
      if (endDate < new Date()) return false;
    }

    return true;
  }

  /**
   * Comprehensive access check for premium features
   */
  static async checkPremiumAccess(
    userPlan: string | null | undefined,
    subscriptionStatus?: string | null,
    currentPeriodEnd?: string | null
  ): Promise<AccessCheckResult> {
    const normalizedPlan = this.normalizePlan(userPlan);
    
    if (normalizedPlan === 'free' || normalizedPlan === 'starter') {
      return { allowed: true };
    }

    if (!this.isSubscriptionActive(subscriptionStatus, currentPeriodEnd)) {
      return {
        allowed: false,
        reason: 'Your subscription has expired or is inactive. Please renew to continue using premium features.',
        upgradeRequired: normalizedPlan,
      };
    }

    return { allowed: true };
  }
}
