// src/services/planAccess.service.ts

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

export const PLAN_LIMITS: Record<PlanTier, PlanLimits> = {
  free: {
    maxInvoicesPerMonth: 5,
    maxClients: 3,
    maxTemplates: 1,
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
  starter: {
    maxInvoicesPerMonth: 5,
    maxClients: 3,
    maxTemplates: 1,
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
    maxInvoicesPerMonth: Infinity,
    maxClients: 50,
    maxTemplates: Infinity,
    canUseAI: true,
    canExportPDF: true,
    canUseRecurring: true,
    canUseCustomBranding: false,
    canUseAdvancedAnalytics: false,
    canUseTeamAccess: false,
    canUseAutomatedReminders: false,
    canUseIntegrations: false,
    canUseAPIAccess: false,
    prioritySupport: true,
  },
  business: {
    maxInvoicesPerMonth: Infinity,
    maxClients: Infinity,
    maxTemplates: Infinity,
    canUseAI: true,
    canExportPDF: true,
    canUseRecurring: true,
    canUseCustomBranding: true,
    canUseAdvancedAnalytics: true,
    canUseTeamAccess: true,
    canUseAutomatedReminders: true,
    canUseIntegrations: true,
    canUseAPIAccess: false,
    prioritySupport: true,
  },
  enterprise: {
    maxInvoicesPerMonth: Infinity,
    maxClients: Infinity,
    maxTemplates: Infinity,
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
  },
};

export interface AccessCheckResult {
  allowed: boolean;
  reason?: string;
  upgradeRequired?: PlanTier;
}

export class PlanAccessService {
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
  static getPlanLimits(plan?: string | null): PlanLimits {
    const normalizedPlan = this.normalizePlan(plan);
    return PLAN_LIMITS[normalizedPlan];
  }

  /**
   * Check if user can access a specific feature
   */
  static canAccessFeature(
    userPlan: string | null | undefined,
    feature: keyof PlanLimits
  ): AccessCheckResult {
    const limits = this.getPlanLimits(userPlan);
    const featureValue = limits[feature];

    if (typeof featureValue === 'boolean') {
      if (featureValue) {
        return { allowed: true };
      }
      
      // Find minimum plan that allows this feature
      const upgradeRequired = this.getMinimumPlanForFeature(feature);
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
    userId: string,
    userPlan: string | null | undefined,
    currentMonthInvoiceCount: number
  ): Promise<AccessCheckResult> {
    const limits = this.getPlanLimits(userPlan);
    
    if (currentMonthInvoiceCount >= limits.maxInvoicesPerMonth) {
      const upgradeRequired = this.getMinimumPlanForLimit('maxInvoicesPerMonth', currentMonthInvoiceCount + 1);
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
  static canCreateClient(
    userPlan: string | null | undefined,
    currentClientCount: number
  ): AccessCheckResult {
    const limits = this.getPlanLimits(userPlan);
    
    if (currentClientCount >= limits.maxClients) {
      const upgradeRequired = this.getMinimumPlanForLimit('maxClients', currentClientCount + 1);
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
  static canUseTemplate(
    userPlan: string | null | undefined,
    templateIndex: number
  ): AccessCheckResult {
    const limits = this.getPlanLimits(userPlan);
    
    if (templateIndex >= limits.maxTemplates) {
      return {
        allowed: false,
        reason: `This template requires a Pro plan or higher`,
        upgradeRequired: 'pro',
      };
    }

    return { allowed: true };
  }

  /**
   * Get minimum plan that allows a specific feature
   */
  private static getMinimumPlanForFeature(feature: keyof PlanLimits): PlanTier {
    const plans: PlanTier[] = ['free', 'starter', 'pro', 'business', 'enterprise'];
    
    for (const plan of plans) {
      const limits = PLAN_LIMITS[plan];
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
  private static getMinimumPlanForLimit(
    limitKey: keyof PlanLimits,
    requiredValue: number
  ): PlanTier {
    const plans: PlanTier[] = ['free', 'starter', 'pro', 'business', 'enterprise'];
    
    for (const plan of plans) {
      const limits = PLAN_LIMITS[plan];
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

    // Check if subscription has expired
    if (currentPeriodEnd) {
      const endDate = new Date(currentPeriodEnd);
      if (endDate < new Date()) return false;
    }

    return true;
  }

  /**
   * Comprehensive access check for premium features
   */
  static checkPremiumAccess(
    userPlan: string | null | undefined,
    subscriptionStatus?: string | null,
    currentPeriodEnd?: string | null
  ): AccessCheckResult {
    const normalizedPlan = this.normalizePlan(userPlan);
    
    // Free and starter plans always have access (to free features)
    if (normalizedPlan === 'free' || normalizedPlan === 'starter') {
      return { allowed: true };
    }

    // For paid plans, check subscription status
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