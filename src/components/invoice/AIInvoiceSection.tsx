// src/components/invoice/AIInvoiceSection.tsx
// Example of how to protect the AI generation feature

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Sparkles, Lock } from 'lucide-react';
import { usePlanAccess } from '@/hooks/usePlanAccess';
import { PaywallModal } from '@/components/PaywallModal';
import { toast } from '@/hooks/use-toast';

interface AIInvoiceSectionProps {
  onGenerate: (prompt: string) => Promise<void>;
  isGenerating: boolean;
}

export function AIInvoiceSection({ onGenerate, isGenerating }: AIInvoiceSectionProps) {
  const [prompt, setPrompt] = useState('');
  const [showPaywall, setShowPaywall] = useState(false);
  const { canUseAIEffective, requireUpgrade } = usePlanAccess();

  const handleGenerate = async () => {
    // CRITICAL: Check access before allowing AI generation
    if (!canUseAIEffective) {
      const accessCheck = requireUpgrade('canUseAI');
      toast({
        title: 'Premium Feature',
        description: accessCheck.reason,
        variant: 'destructive',
      });
      setShowPaywall(true);
      return;
    }

    if (!prompt.trim()) {
      toast({
        title: 'Empty Prompt',
        description: 'Please describe the invoice you want to create',
        variant: 'destructive',
      });
      return;
    }

    try {
      await onGenerate(prompt);
      setPrompt('');
    } catch (error) {
      console.error('AI generation failed:', error);
    }
  };

  return (
    <>
      <Card className="relative overflow-hidden">
        {!canUseAIEffective && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex items-center justify-center">
            <div className="text-center space-y-3 p-6">
              <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Lock className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Premium Feature</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  AI invoice generation requires a Pro plan
                </p>
                <Button
                  onClick={() => setShowPaywall(true)}
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  Upgrade to Pro
                </Button>
              </div>
            </div>
          </div>
        )}

        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Invoice Generator
            {!canUseAIEffective && (
              <span className="ml-auto text-xs px-2 py-1 bg-primary/10 text-primary rounded-full font-normal">
                Pro Feature
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Describe your invoice... e.g., 'Create an invoice for web development services for TechStart Inc, 40 hours at $150/hour, due in 30 days, 10% tax'"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={4}
            disabled={!canUseAI || isGenerating}
            className="resize-none"
          />
          <Button
            onClick={handleGenerate}
            disabled={!canUseAIEffective || isGenerating || !prompt.trim()}
            className="w-full shadow-glow-primary animate-button-shine"
            size="lg"
          >
            {isGenerating ? (
              <>
                <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Invoice with AI
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <PaywallModal
        isOpen={showPaywall}
        onClose={() => setShowPaywall(false)}
        feature="AI Invoice Generation"
        requiredPlan="pro"
        description="Generate invoices from natural language descriptions using advanced AI technology. Available on Pro plan and above."
      />
    </>
  );
}
