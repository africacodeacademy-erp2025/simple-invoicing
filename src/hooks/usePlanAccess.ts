// src/hooks/usePlanAccess.ts

import { useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { PlanAccessService, AccessCheckResult, PlanLimits } from '@/services/planAccess.service';

export function usePlanAccess() {
  const { user } = useAuth();
  const { profile } = useProfile(user?.id ?? null);

  const planLimits = useMemo(() => {
    return PlanAccessService.getPlanLimits(profile?.plan);
  }, [profile?.plan]);

  const isSubscriptionActive = useMemo(() => {
    return PlanAccessService.isSubscriptionActive(
      profile?.subscription_status,
      profile?.current_period_end
    );
  }, [profile?.subscription_status, profile?.current_period_end]);

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
    planLimits,
    isSubscriptionActive,
    checkFeatureAccess,
    requireUpgrade,
    // Convenient boolean checks
    canUseAI,
    canExportPDF,
    canUseRecurring,
    canUseCustomBranding,
    isPro: profile?.plan?.toLowerCase().includes('pro'),
    isBusiness: profile?.plan?.toLowerCase().includes('business'),
    isEnterprise: profile?.plan?.toLowerCase().includes('enterprise'),
    isFree: !profile?.plan || profile.plan.toLowerCase() === 'free' || profile.plan.toLowerCase() === 'starter',
  };
} 