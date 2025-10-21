import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MinimalTemplate } from "@/components/templates/MinimalTemplate";
import { ClassicTemplate } from "@/components/templates/ClassicTemplate";
import { ModernTemplate } from "@/components/templates/ModernTemplate";
import { CorporateTemplate } from "@/components/templates/CorporateTemplate";
import { CreativeTemplate } from "@/components/templates/CreativeTemplate";
import { InvoiceData } from "@/types/invoice";
import { Badge } from "@/components/ui/badge";
import { Eye, Star } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { usePlanAccess } from "@/hooks/usePlanAccess";
import { PaywallModal } from "@/components/PaywallModal";
import { toast } from "@/hooks/use-toast";

const availableTemplates = [
  {
    id: "minimal",
    name: "Minimal",
    component: MinimalTemplate,
    isPremium: true,
  },
  {
    id: "classic",
    name: "Classic",
    component: ClassicTemplate,
    isPremium: false,
  },
  {
    id: "modern",
    name: "Modern",
    component: ModernTemplate,
    isPremium: false,
  },
  {
    id: "corporate",
    name: "Corporate",
    component: CorporateTemplate,
    isPremium: true,
  },
  {
    id: "creative",
    name: "Creative",
    component: CreativeTemplate,
    isPremium: true,
  },
];

// ... (dummyInvoiceData)

export default function Templates() {
  const [previewTemplate, setPreviewTemplate] = useState<any | null>(null);
  const [showPaywall, setShowPaywall] = useState(false);
  const [paywallFeature, setPaywallFeature] = useState('');
  const [paywallPlan, setPaywallPlan] = useState<'pro' | 'business' | 'enterprise'>('pro');
  const { canUsePremiumTemplates } = usePlanAccess();

  const handlePreviewClick = (template: any) => {
    if (template.isPremium && !canUsePremiumTemplates) {
      toast({ title: "Premium Feature", description: "This template requires a Pro plan.", variant: "destructive" });
      setPaywallFeature("Premium Templates");
      setPaywallPlan("pro");
      setShowPaywall(true);
    } else {
      setPreviewTemplate(template);
    }
  };

  return (
    <div className="space-y-6">
      {/* ... (Header) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {availableTemplates.map((template) => (
          <Card key={template.id} className="overflow-hidden shadow-sm flex flex-col">
            <CardHeader className="p-4 border-b">
              <CardTitle className="flex items-center justify-between">
                <span>{template.name}</span>
                {template.isPremium && (
                  <Badge variant="premium"><Star className="h-3 w-3 mr-1" />Premium</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex-grow">
              <div className="h-[400px] bg-gray-100 overflow-hidden relative group cursor-pointer" onClick={() => handlePreviewClick(template)}>
                {/* ... (Scaled Preview) */}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="text-white font-semibold flex items-center gap-2 bg-gray-900/50 px-4 py-2 rounded-lg"><Eye className="h-5 w-5" />View Full Preview</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={!!previewTemplate} onOpenChange={(isOpen) => !isOpen && setPreviewTemplate(null)}>
        <DialogContent className="max-w-4xl h-[90vh] p-0">
          <DialogHeader className="p-4 border-b"><DialogTitle>Preview: {previewTemplate?.name} Template</DialogTitle></DialogHeader>
          <div className="h-full overflow-y-auto bg-gray-200 p-8">
            <div className="w-full max-w-3xl mx-auto shadow-lg">
              {previewTemplate && (
                <previewTemplate.component invoiceData={dummyInvoiceData} />
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <PaywallModal isOpen={showPaywall} onClose={() => setShowPaywall(false)} feature={paywallFeature} requiredPlan={paywallPlan} />
    </div>
  );
}
