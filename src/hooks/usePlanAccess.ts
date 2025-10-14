
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

  const hasPremiumAccess = useMemo(() => {
    if (profileLoading) return false;
    const normalizedPlan = PlanAccessService.normalizePlan(profile?.plan);
    if (normalizedPlan === 'free' || normalizedPlan === 'starter') return false;
    return isSubscriptionActive;
  }, [profile?.plan, isSubscriptionActive, profileLoading]);

  useEffect(() => {
    const fetchLimits = async () => {
      if (profileLoading) return;
      
      setLimitsLoading(true);
      try {
        const normalizedPlan = PlanAccessService.normalizePlan(profile?.plan);
        const limits = await PlanAccessService.getPlanLimits(normalizedPlan);
        setPlanLimits(limits);

        const isPaidPlan = normalizedPlan !== 'free' && normalizedPlan !== 'starter';
        if (isPaidPlan && !isSubscriptionActive) {
          const freeLimits = await PlanAccessService.getPlanLimits('free');
          setEffectivePlanLimits(freeLimits);
        } else {
          setEffectivePlanLimits(limits);
        }
      } catch (error) {
        console.error('Failed to fetch plan limits', error);
        // Fallback to free limits in case of an error
        const freeLimits = await PlanAccessService.getPlanLimits('free');
        setPlanLimits(freeLimits);
        setEffectivePlanLimits(freeLimits);
      } finally {
        setLimitsLoading(false);
      }
    };

    fetchLimits();
  }, [profile?.plan, profileLoading, isSubscriptionActive]);

  const checkFeatureAccess = useCallback(async (feature: keyof PlanLimits): Promise<AccessCheckResult> => {
    return PlanAccessService.canAccessFeature(profile?.plan, feature);
  }, [profile?.plan]);

  const requireUpgrade = useCallback(async (feature: keyof PlanLimits): Promise<AccessCheckResult> => {
    return checkFeatureAccess(feature);
  }, [checkFeatureAccess]);
  
  const features = useMemo(() => ({
    canUseAI: effectivePlanLimits?.canUseAI ?? false,
    canExportPDF: effectivePlanLimits?.canExportPDF ?? false,
    canUseRecurring: effectivePlanLimits?.canUseRecurring ?? false,
    canUseCustomBranding: effectivePlanLimits?.canUseCustomBranding ?? false,
    canUseAdvancedAnalytics: effectivePlanLimits?.canUseAdvancedAnalytics ?? false,
    canUseTeamAccess: effectivePlanLimits?.canUseTeamAccess ?? false,
    canUseAutomatedReminders: effectivePlanLimits?.canUseAutomatedReminders ?? false,
    canUseIntegrations: effectivePlanLimits?.canUseIntegrations ?? false,
    canUseAPIAccess: effectivePlanLimits?.canUseAPIAccess ?? false,
    prioritySupport: effectivePlanLimits?.prioritySupport ?? false,
  }), [effectivePlanLimits]);

  return {
    profile,
    profileLoading,
    limitsLoading,
    planLimits, // The limits of the user's subscribed plan
    effectivePlanLimits, // The limits the user can actually use right now
    isSubscriptionActive,
    hasPremiumAccess,
    checkFeatureAccess,
    requireUpgrade,
    ...features,
    isPro: profile?.plan?.toLowerCase().includes('pro'),
    isBusiness: profile?.plan?.toLowerCase().includes('business'),
    isEnterprise: profile?.plan?.toLowerCase().includes('enterprise'),
    isFree: !profile?.plan || profile.plan.toLowerCase() === 'free' || profile.plan.toLowerCase() === 'starter',
  };
}
