import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { BillingService } from "@/services/billing.service";
import { useNavigate } from "react-router-dom";

type PlanKey = "starter" | "pro" | "business" | "enterprise";

const plans: Array<{
  key: PlanKey;
  name: string;
  priceMonthly: string;
  blurb: string;
  features: string[];
  priceEnvVar: string | undefined;
}> = [
  {
    key: "starter",
    name: "Starter",
    priceMonthly: "Free",
    blurb: "Get started with basic invoicing",
    features: ["5 invoices/month", "3 clients", "1 template"],
    priceEnvVar: undefined,
  },
  {
    key: "pro",
    name: "Pro (Growth)",
    priceMonthly: "$10/mo",
    blurb: "Everything you need to grow",
    features: [
      "Unlimited invoices",
      "Up to 50 clients",
      "All templates",
      "AI invoice generation",
      "PDF export",
      "Priority support",
    ],
    priceEnvVar: import.meta.env.VITE_STRIPE_PRICE_PRO_MONTHLY,
  },
  {
    key: "business",
    name: "Business (Advanced)",
    priceMonthly: "$25/mo",
    blurb: "Advanced capabilities for teams",
    features: [
      "Unlimited invoices & clients",
      "Team access",
      "Advanced analytics",
      "Custom branding",
      "Automated reminders",
      "Integrations",
    ],
    priceEnvVar: import.meta.env.VITE_STRIPE_PRICE_BUSINESS_MONTHLY,
  },
  {
    key: "enterprise",
    name: "Enterprise",
    priceMonthly: "Custom",
    blurb: "Tailored to your organization",
    features: ["Custom pricing", "API access", "Custom domain", "Dedicated support"],
    priceEnvVar: import.meta.env.VITE_STRIPE_PRICE_ENTERPRISE_MONTHLY,
  },
];

export default function PricingPlans() {
  const { user } = useAuth();
  const { profile } = useProfile(user?.id ?? null);
  const activePlan = (profile?.plan || "free").toLowerCase();
  const navigate = useNavigate();

  const handleSelect = async (planKey: PlanKey, priceId?: string) => {
    if (planKey === "starter") return; // no checkout needed
    if (!user) {
      navigate("/signin");
      return;
    }
    if (!priceId) {
      alert("Missing Stripe price ID for this plan.");
      return;
    }
    await BillingService.startCheckout(priceId);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {plans.map((plan) => (
        <Card key={plan.key} className="shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{plan.name}</span>
              {activePlan.startsWith(plan.key) && (
                <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">Current</span>
              )}
            </CardTitle>
            <div className="text-2xl font-bold">{plan.priceMonthly}</div>
            <p className="text-sm text-muted-foreground">{plan.blurb}</p>
          </CardHeader>
          <CardContent className="space-y-3">
            <ul className="text-sm list-disc pl-5 space-y-1">
              {plan.features.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
            <Button
              className="w-full"
              variant={plan.key === "starter" ? "outline" : "default"}
              onClick={() => handleSelect(plan.key, plan.priceEnvVar)}
              disabled={plan.key === "starter"}
            >
              {plan.key === "starter" ? "Current" : "Choose plan"}
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}


