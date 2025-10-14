
// src/components/PaywallModal.tsx

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Sparkles, ArrowRight, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PlanTier } from '@/services/planAccess.service';

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  feature: string;
  requiredPlan?: PlanTier;
  description?: string;
}

const PLAN_INFO = {
  free: {
    name: 'Free',
    price: '$0',
    highlights: [],
  },
  starter: {
    name: 'Starter',
    price: '$5/mo',
    highlights: [
      'Up to 20 invoices/mo',
      'Up to 10 clients',
      'PDF export',
    ],
  },
  pro: {
    name: 'Pro',
    price: '$10/mo',
    highlights: [
      'Unlimited invoices',
      'AI invoice generation',
      'PDF export',
      'All templates',
      'Priority support',
    ],
  },
  business: {
    name: 'Business',
    price: '$25/mo',
    highlights: [
      'Everything in Pro',
      'Team access',
      'Advanced analytics',
      'Custom branding',
      'Automated reminders',
    ],
  },
  enterprise: {
    name: 'Enterprise',
    price: 'Custom',
    highlights: [
      'Everything in Business',
      'API access',
      'Custom domain',
      'Dedicated support',
    ],
  },
};

export function PaywallModal({
  isOpen,
  onClose,
  feature,
  requiredPlan = 'pro',
  description,
}: PaywallModalProps) {
  const navigate = useNavigate();

  const planInfo = PLAN_INFO[requiredPlan] || PLAN_INFO.pro;

  const handleUpgrade = () => {
    onClose();
    navigate('/app/billing');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Lock className="h-8 w-8 text-primary" />
          </div>
          <DialogTitle className="text-center text-2xl">
            Upgrade to {planInfo.name}
          </DialogTitle>
          <DialogDescription className="text-center">
            {description ||
              `${feature} is a premium feature available on ${planInfo.name} plan and above.`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="rounded-lg border bg-muted/50 p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">
                {planInfo.name} Plan
              </span>
              <span className="text-lg font-bold">{planInfo.price}</span>
            </div>
            <ul className="space-y-2">
              {planInfo.highlights.map((highlight, index) => (
                <li key={index} className="flex items-center gap-2 text-sm">
                  <Sparkles className="h-4 w-4 text-primary flex-shrink-0" />
                  <span>{highlight}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-2">
            <Button
              onClick={handleUpgrade}
              className="w-full bg-primary-gradient hover:shadow-lg transition-all"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Upgrade Now
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button onClick={onClose} variant="outline" className="w-full">
              Maybe Later
            </Button>
          </div>

          <p className="text-center text-xs text-muted-foreground">
            Cancel anytime. No hidden fees.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
