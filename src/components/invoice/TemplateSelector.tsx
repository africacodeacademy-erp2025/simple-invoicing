// src/components/invoice/TemplateSelector.tsx
// Example of template selection with access control

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock, Check } from 'lucide-react';
import { usePlanAccess } from '@/hooks/usePlanAccess';
import { PaywallModal } from '@/components/PaywallModal';
import { PlanAccessService } from '@/services/planAccess.service';

interface Template {
  id: string;
  name: string;
  preview: string;
  isPremium: boolean;
  index: number;
}

const TEMPLATES: Template[] = [
  { id: 'modern', name: 'Modern', preview: '/templates/modern.png', isPremium: false, index: 0 },
  { id: 'corporate', name: 'Corporate', preview: '/templates/corporate.png', isPremium: true, index: 1 },
  { id: 'creative', name: 'Creative', preview: '/templates/creative.png', isPremium: true, index: 2 },
  { id: 'classic', name: 'Classic', preview: '/templates/classic.png', isPremium: true, index: 3 },
  { id: 'minimal', name: 'Minimal', preview: '/templates/minimal.png', isPremium: true, index: 4 },
];

interface TemplateSelectorProps {
  selectedTemplate: string;
  onSelectTemplate: (templateId: string) => void;
}

export function TemplateSelector({ selectedTemplate, onSelectTemplate }: TemplateSelectorProps) {
  const { planLimits, profile } = usePlanAccess();
  const [showPaywall, setShowPaywall] = useState(false);
  const [blockedTemplate, setBlockedTemplate] = useState<Template | null>(null);

  const handleTemplateClick = (template: Template) => {
    // Check if user can access this template
    const accessCheck = PlanAccessService.canUseTemplate(
      profile?.plan,
      template.index
    );

    if (!accessCheck.allowed) {
      setBlockedTemplate(template);
      setShowPaywall(true);
      return;
    }

    onSelectTemplate(template.id);
  };

  const canAccessTemplate = (template: Template) => {
    return template.index < planLimits.maxTemplates;
  };

  return (
    <>
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold mb-2">Choose a Template</h3>
          <p className="text-sm text-muted-foreground">
            You have access to {planLimits.maxTemplates === Infinity ? 'all' : planLimits.maxTemplates} template{planLimits.maxTemplates !== 1 ? 's' : ''}
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {TEMPLATES.map((template) => {
            const hasAccess = canAccessTemplate(template);
            const isSelected = selectedTemplate === template.id;

            return (
              <Card
                key={template.id}
                className={`relative cursor-pointer transition-all hover:shadow-lg ${
                  isSelected ? 'ring-2 ring-primary' : ''
                } ${!hasAccess ? 'opacity-60' : ''}`}
                onClick={() => handleTemplateClick(template)}
              >
                {!hasAccess && (
                  <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 rounded-lg flex items-center justify-center">
                    <div className="text-center space-y-2">
                      <div className="mx-auto w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <Lock className="h-4 w-4 text-primary" />
                      </div>
                      <span className="text-xs font-medium">Pro</span>
                    </div>
                  </div>
                )}

                {isSelected && hasAccess && (
                  <div className="absolute top-2 right-2 z-20 bg-primary text-primary-foreground rounded-full p-1">
                    <Check className="h-4 w-4" />
                  </div>
                )}

                <CardContent className="p-3 space-y-2">
                  <div className="aspect-[3/4] bg-muted rounded-md overflow-hidden">
                    <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                      {template.name}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{template.name}</span>
                    {template.isPremium && !hasAccess && (
                      <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full">
                        Pro
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {blockedTemplate && (
        <PaywallModal
          isOpen={showPaywall}
          onClose={() => {
            setShowPaywall(false);
            setBlockedTemplate(null);
          }}
          feature={`${blockedTemplate.name} Template`}
          requiredPlan="pro"
          description="Premium templates are available on Pro plan and above. Upgrade to access all professional invoice templates."
        />
      )}
    </>
  );
}