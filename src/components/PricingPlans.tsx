
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { BillingService } from "@/services/billing.service";
import { useNavigate } from "react-router-dom";

type PlanKey = "starter" | "pro";

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
];

export default function PricingPlans() {
  const { user } = useAuth();
  const { profile } = useProfile(user?.id ?? null);
  const activePlan = (profile?.plan || "free").toLowerCase();
  const navigate = useNavigate();

  const handleSelect = async (planKey: PlanKey, priceId?: string) => {
    if (planKey === "starter") return;
    if (!user) {
      const redirectUrl = `/signin?redirect=/app/billing`;
      navigate(redirectUrl);
      return;
    }
    if (!priceId) {
      alert("Missing Stripe price ID for this plan.");
      return;
    }
    await BillingService.startCheckout(priceId);
  };

  const handleManage = async () => {
    await BillingService.manageSubscription();
  }

  return (
    <div className="flex justify-center py-12 px-4 bg-background dark:bg-gray-900">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl">
        {plans.map((plan) => {
          const isCurrentPlan = activePlan.startsWith(plan.key);
          const isProPlan = plan.key === 'pro';

          let buttonText: string;
          let onButtonClick: () => void;
          let isButtonDisabled: boolean;

          if (isCurrentPlan) {
            if (isProPlan) {
              buttonText = 'Manage Subscription';
              onButtonClick = handleManage;
              isButtonDisabled = false;
            } else { // Current plan is Starter
              buttonText = 'Current Plan';
              onButtonClick = () => {};
              isButtonDisabled = true;
            }
          } else { // Not current plan
            if (isProPlan) { // Pro is an upgrade
              buttonText = 'Upgrade to Pro';
              onButtonClick = () => handleSelect(plan.key, plan.priceEnvVar);
              isButtonDisabled = false;
            } else { // Starter is not current (so user is on Pro)
              buttonText = 'Choose Plan'; 
              onButtonClick = () => {};
              isButtonDisabled = true;
            }
          }

          const buttonClassName = isButtonDisabled
            ? "bg-gray-100 text-gray-600 border border-gray-300 cursor-not-allowed dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600"
            : "bg-primary-gradient hover:opacity-90 text-white";

          return (
            <Card
              key={plan.key}
              className={`transition-transform duration-300 hover:scale-105 rounded-xl border border-gray-200 dark:border-gray-700
                          bg-white dark:bg-gray-800 shadow-lg dark:shadow-gray-900`}
            >
              <CardHeader className="text-center py-4">
                <CardTitle className="text-lg md:text-xl font-semibold flex items-center justify-center gap-2">
                  {plan.name}
                  {isCurrentPlan && (
                    <span className="text-xs px-2 py-1 bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-200 rounded-full">
                      Current
                    </span>
                  )}
                </CardTitle>
                <div className="text-2xl md:text-3xl font-bold mt-2">{plan.priceMonthly}</div>
                <p className="text-sm md:text-base text-muted-foreground mt-1">{plan.blurb}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="text-sm md:text-base list-disc pl-5 space-y-1 text-foreground dark:text-gray-200">
                  {plan.features.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
                <Button
                  className={`w-full py-2 text-sm md:text-base rounded-md transition-all duration-200 ${buttonClassName}`}
                  onClick={onButtonClick}
                  disabled={isButtonDisabled}
                >
                  {buttonText}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
