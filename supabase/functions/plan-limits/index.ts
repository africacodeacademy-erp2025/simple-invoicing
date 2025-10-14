import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';

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
    maxInvoicesPerMonth: 20,
    maxClients: 10,
    maxTemplates: 3,
    canUseAI: false,
    canExportPDF: true,
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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  // Return all plan limits
  return new Response(
    JSON.stringify(PLAN_LIMITS),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
});