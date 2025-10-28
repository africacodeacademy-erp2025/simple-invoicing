// src/hooks/usePlanAccess.ts
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { PlanAccessService, AccessCheckResult, PlanLimits } from '@/services/planAccess.service';

export function usePlanAccess() {
  const { user } = useAuth();
  const { profile, profileLoading } = useProfile(user?.id ?? null);

  const [limitsLoading, setLimitsLoading] = useState(true);
  const [planLimits, setPlanLimits] = useState<PlanLimits | null>(null);
  const [effectivePlanLimits, setEffectivePlanLimits] = useState<PlanLimits | null>(null);

  const isSubscriptionActive = useMemo(() => {
    return PlanAccessService.isSubscriptionActive(
      profile?.subscription_status,
      profile?.current_period_end
    );
  }, [profile?.subscription_status, profile?.current_period_end]);

  const normalizedUserPlan = useMemo(() => {
    return PlanAccessService.normalizePlan(profile?.plan);
  }, [profile?.plan]);

  const hasPremiumAccess = useMemo(() => {
    if (profileLoading) return false;
    // Premium access is defined as being on the 'pro' plan and having an active subscription.
    return normalizedUserPlan === 'pro' && isSubscriptionActive;
  }, [normalizedUserPlan, isSubscriptionActive, profileLoading]);

  useEffect(() => {
    const fetchLimits = async () => {
      if (profileLoading) return;
      
      setLimitsLoading(true);
      try {
        const limits = await PlanAccessService.getPlanLimits(normalizedUserPlan);
        setPlanLimits(limits);

        // Determine effective limits: if not 'pro' or subscription inactive, use 'free' limits.
        const effectiveLimits = (normalizedUserPlan === 'pro' && isSubscriptionActive)
          ? limits
          : await PlanAccessService.getPlanLimits('free');
        
        setEffectivePlanLimits(effectiveLimits);

      } catch (error) {
        console.error('Failed to fetch plan limits', error);
        // Fallback to free limits in case of an error
        const freeLimits = await PlanAccessService.getPlanLimits('free');
        setPlanLimits(freeLimits); // Cache free limits even if fetching failed
        setEffectivePlanLimits(freeLimits);
      } finally {
        setLimitsLoading(false);
      }
    };

    fetchLimits();
  }, [normalizedUserPlan, profileLoading, isSubscriptionActive]);

  const checkFeatureAccess = useCallback(async (feature: keyof PlanLimits): Promise<AccessCheckResult> => {
    // Use the user's actual plan for checking feature availability, not just effective limits.
    // The reason for this is that the 'reason' and 'upgradeRequired' should reflect the user's actual plan status.
    return PlanAccessService.canAccessFeature(profile?.plan, feature);
  }, [profile?.plan]);

  const requireUpgrade = useCallback(async (feature: keyof PlanLimits): Promise<AccessCheckResult> => {
    // This function is essentially a wrapper around checkFeatureAccess,
    // providing a more direct name for UI elements that need to show upgrade prompts.
    return checkFeatureAccess(feature);
  }, [checkFeatureAccess]);
  
  // Expose all features based on effective limits
  const features = useMemo(() => {
    if (!effectivePlanLimits) return {}; // Return empty if limits are not yet loaded

    return {
      canUseAI: effectivePlanLimits.canUseAI,
      canExportPDF: effectivePlanLimits.canExportPDF,
      canUseRecurring: effectivePlanLimits.canUseRecurring,
      canUseCustomBranding: effectivePlanLimits.canUseCustomBranding,
      canUseAdvancedAnalytics: effectivePlanLimits.canUseAdvancedAnalytics,
      canUseTeamAccess: effectivePlanLimits.canUseTeamAccess,
      canUseAutomatedReminders: effectivePlanLimits.canUseAutomatedReminders,
      canUseIntegrations: effectivePlanLimits.canUseIntegrations,
      canUseAPIAccess: effectivePlanLimits.canUseAPIAccess,
      prioritySupport: effectivePlanLimits.prioritySupport,
      maxInvoicesPerMonth: effectivePlanLimits.maxInvoicesPerMonth,
      maxClients: effectivePlanLimits.maxClients,
      maxTemplates: effectivePlanLimits.maxTemplates,
    };
  }, [effectivePlanLimits]);

  return {
    profile,
    profileLoading,
    limitsLoading,
    planLimits, // The limits of the user's subscribed plan (or free if not subscribed)
    effectivePlanLimits, // The limits the user can actually use right now
    isSubscriptionActive,
    hasPremiumAccess, // True if user is on 'pro' and subscription is active
    checkFeatureAccess, // Function to check access for a specific feature
    requireUpgrade,     // Function to check access, often used for upgrade prompts
    ...features,        // Spread all the feature flags and limits
    isPro: normalizedUserPlan === 'pro',
    isFree: normalizedUserPlan === 'free',
  };
}
