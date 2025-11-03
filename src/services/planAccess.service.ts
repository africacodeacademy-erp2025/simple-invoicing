// src/services/planAccess.service.ts
import { supabase } from '../lib/supabase';

export type PlanTier = 'free' | 'pro'; // Simplified to only free and pro

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
   * This function now returns limits for 'free' and 'pro' plans only.
   */
  private static async _getOrFetchPlanLimits(): Promise<AllPlanLimits> {
    if (this._planLimits) {
      return this._planLimits;
    }

    // Mocking the fetched limits as the actual backend function 'plan-limits' is not available here.
    // In a real scenario, this would fetch from Deno.env.get("SUPABASE_URL")! + '/functions/v1/plan-limits'
    // For now, we define the limits directly based on the provided image.
    const fetchedLimits: AllPlanLimits = {
      free: {
        maxInvoicesPerMonth: 5, // From image
        maxClients: 3, // From image
        maxTemplates: 1, // From image
        canUseAI: false,
        canExportPDF: false,
        canUseRecurring: false,
        canUseCustomBranding: false,
        canUseAdvancedAnalytics: false,
        canUseTeamAccess: false,
        canUseAutomatedReminders: false,
        canUseIntegrations: false,
        canUseAPIAccess: false,
        prioritySupport: false,
      },
      pro: {
        maxInvoicesPerMonth: Infinity, // Unlimited from image
        maxClients: 50, // From image
        maxTemplates: Infinity, // All templates from image
        canUseAI: true,
        canExportPDF: true,
        canUseRecurring: true,
        canUseCustomBranding: true,
        canUseAdvancedAnalytics: true,
        canUseTeamAccess: true,
        canUseAutomatedReminders: true,
        canUseIntegrations: true,
        canUseAPIAccess: true,
        prioritySupport: true,
      }
    };

    this._planLimits = fetchedLimits;
    return this._planLimits!;
  }

  /**
   * Normalize plan string to PlanTier.
   * Maps any input to 'free' or 'pro'.
   */
  static normalizePlan(plan?: string | null): PlanTier {
    if (!plan) return 'free';
    const normalized = plan.toLowerCase().trim();
    
    if (normalized.includes('pro') || normalized.includes('growth') || normalized.includes('business') || normalized.includes('enterprise') || normalized.includes('advanced')) {
      return 'pro';
    }
    
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

    // For numerical limits, this check might need to be more sophisticated if not handled elsewhere
    // For now, assuming boolean features are the primary concern for this method.
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
    
    if (limits.maxInvoicesPerMonth !== Infinity && currentMonthInvoiceCount >= limits.maxInvoicesPerMonth) {
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
    
    if (limits.maxClients !== Infinity && currentClientCount >= limits.maxClients) {
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
    templateIndex: number // Assuming this is a 0-based index
  ): Promise<AccessCheckResult> {
    const limits = await this.getPlanLimits(userPlan);
    
    // If maxTemplates is Infinity, all templates are allowed.
    if (limits.maxTemplates === Infinity) {
      return { allowed: true };
    }

    if (templateIndex >= limits.maxTemplates) {
      const requiredValue = templateIndex + 1; // To find the plan that supports at least this many templates
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
    const plans: PlanTier[] = ['free', 'pro']; // Only consider free and pro
    
    for (const plan of plans) {
      const limits = allLimits[plan];
      const value = limits[feature];
      if (typeof value === 'boolean' && value === true) {
        return plan;
      }
    }
    
    // If no plan enables it, default to 'pro' as the highest tier
    return 'pro';
  }

  /**
   * Get minimum plan that allows a specific limit value
   */
  private static async getMinimumPlanForLimit(
    limitKey: keyof PlanLimits,
    requiredValue: number
  ): Promise<PlanTier> {
    const allLimits = await this._getOrFetchPlanLimits();
    const plans: PlanTier[] = ['free', 'pro']; // Only consider free and pro
    
    for (const plan of plans) {
      const limits = allLimits[plan];
      const value = limits[limitKey];
      // Check if the limit is not Infinity and if the plan's limit meets the requirement
      if (typeof value === 'number' && value !== Infinity && value >= requiredValue) {
        return plan;
      }
      // If the limit is Infinity, it means this plan allows unlimited, so it satisfies any requiredValue
      if (value === Infinity) {
        return plan;
      }
    }
    
    // Fallback, should ideally not be reached if 'pro' has Infinity for relevant limits
    return 'pro';
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
      // Ensure the date comparison is robust, considering timezones if necessary.
      // For simplicity, comparing dates directly.
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
    
    // If the plan is 'free', it does not have premium access.
    if (normalizedPlan === 'free') {
      return { allowed: false, reason: 'This feature requires a Pro plan.', upgradeRequired: 'pro' };
    }

    // If the plan is 'pro'
    if (normalizedPlan === 'pro') {
      if (!this.isSubscriptionActive(subscriptionStatus, currentPeriodEnd)) {
        return {
          allowed: false,
          reason: 'Your subscription has expired or is inactive. Please renew to continue using Pro features.',
          upgradeRequired: normalizedPlan, // 'pro'
        };
      }
      return { allowed: true };
    }
    
    // Fallback for any unexpected plan names, treat as free
    return { allowed: false, reason: 'Invalid plan.', upgradeRequired: 'free' };
  }
}
