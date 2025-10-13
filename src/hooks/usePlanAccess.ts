// src/hooks/usePlanAccess.ts

import { useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { PlanAccessService, AccessCheckResult, PlanLimits, PLAN_LIMITS } from '@/services/planAccess.service';

export function usePlanAccess() {
  const { user } = useAuth();
  const { profile, profileLoading } = useProfile(user?.id ?? null);

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

  const planLimits = useMemo(() => {
    return PlanAccessService.getPlanLimits(profile?.plan);
  }, [profile?.plan]);

  const effectivePlanLimits: PlanLimits = useMemo(() => {
    const normalized = PlanAccessService.normalizePlan(profile?.plan);
    if (!hasPremiumAccess) {
      // Fall back to free limits when subscription is not active
      return PLAN_LIMITS['free'];
    }
    return PLAN_LIMITS[normalized];
  }, [profile?.plan, hasPremiumAccess]);

  const checkFeatureAccess = (feature: keyof PlanLimits): AccessCheckResult => {
    return PlanAccessService.canAccessFeature(profile?.plan, feature);
  };

  const canUseAI = useMemo(() => {
    return checkFeatureAccess('canUseAI').allowed;
  }, [profile?.plan]);

  const canExportPDF = useMemo(() => {
    return checkFeatureAccess('canExportPDF').allowed;
  }, [profile?.plan]);

  const canUseRecurring = useMemo(() => {
    return checkFeatureAccess('canUseRecurring').allowed;
  }, [profile?.plan]);

  const canUseCustomBranding = useMemo(() => {
    return checkFeatureAccess('canUseCustomBranding').allowed;
  }, [profile?.plan]);

  const requireUpgrade = (feature: keyof PlanLimits): AccessCheckResult => {
    const result = checkFeatureAccess(feature);
    if (!result.allowed && result.upgradeRequired) {
      return {
        allowed: false,
        reason: result.reason,
        upgradeRequired: result.upgradeRequired,
      };
    }
    return result;
  };

  return {
    profile,
    profileLoading,
    planLimits,
    effectivePlanLimits,
    isSubscriptionActive,
    checkFeatureAccess,
    requireUpgrade,
    // Convenient boolean checks
    canUseAI,
    canExportPDF,
    canUseRecurring,
    // Effective permissions require active paid subscription when feature is premium
    canUseAIEffective: canUseAI && hasPremiumAccess,
    canExportPDFEffective: canExportPDF && hasPremiumAccess,
    canUseRecurringEffective: canUseRecurring && hasPremiumAccess,
    canUseCustomBranding,
    hasPremiumAccess,
    isPro: profile?.plan?.toLowerCase().includes('pro'),
    isBusiness: profile?.plan?.toLowerCase().includes('business'),
    isEnterprise: profile?.plan?.toLowerCase().includes('enterprise'),
    isFree: !profile?.plan || profile.plan.toLowerCase() === 'free' || profile.plan.toLowerCase() === 'starter',
  };
} 