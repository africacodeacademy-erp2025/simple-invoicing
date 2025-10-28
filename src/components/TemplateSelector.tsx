import React from "react";
import { InvoiceTemplate, TemplateInfo } from "@/types/templates";
import { Check, Lock } from "lucide-react";
import { usePlanAccess } from "@/hooks/usePlanAccess";

interface TemplateSelectorProps {
  selectedTemplate: InvoiceTemplate;
  onSelectTemplate: (template: TemplateInfo) => void;
}

const templateInfos: TemplateInfo[] = [
  {
    id: InvoiceTemplate.MODERN,
    name: "Modern",
    preview: "bg-gradient-to-br from-blue-50 to-indigo-100",
    isPremium: false,
    index: 0, // Default free template
  },
  {
    id: InvoiceTemplate.MINIMAL,
    name: "Minimal",
    preview: "bg-white border border-gray-200",
    isPremium: true,
    index: 1,
  },
  {
    id: InvoiceTemplate.CLASSIC,
    name: "Classic",
    preview: "bg-white border-2 border-gray-900",
    isPremium: true, // Mark Classic as premium
    index: 2,
  },
  {
    id: InvoiceTemplate.CREATIVE,
    name: "Creative",
    preview: "bg-gradient-to-br from-purple-50 via-blue-50 to-green-50",
    isPremium: true,
    index: 3,
  },
  {
    id: InvoiceTemplate.CORPORATE,
    name: "Corporate",
    preview: "bg-gray-50 border-t-4 border-gray-900",
    isPremium: true,
    index: 4,
  },
];

export const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  selectedTemplate,
  onSelectTemplate,
}) => {
  const { effectivePlanLimits } = usePlanAccess(); // Destructure effectivePlanLimits
  const canUsePremiumTemplates = effectivePlanLimits?.maxTemplates === Infinity || effectivePlanLimits?.maxTemplates > 1; // Logic for premium templates

  return (
    <div className="grid grid-cols-3 gap-3">
      {templateInfos.map((template) => {
        const isSelected = selectedTemplate === template.id;
        const isLocked = template.isPremium && !canUsePremiumTemplates;

        return (
          <div
            key={template.id}
            className="cursor-pointer group relative"
            onClick={() => onSelectTemplate(template)}
          >
            <div
              className={`h-20 rounded-md ${template.preview} overflow-hidden border-2 transition-all ${
                isSelected
                  ? "border-primary ring-2 ring-primary/50"
                  : "border-border group-hover:border-muted-foreground"
              }`}
            >
              {/* Skeleton representation */}
              <div className="absolute inset-2 space-y-1.5 opacity-60">
                <div className="h-2 bg-gray-400/50 rounded w-1/2"></div>
                <div className="h-1.5 bg-gray-400/30 rounded w-3/4"></div>
                <div className="h-1.5 bg-gray-400/30 rounded w-1/3"></div>
              </div>
            </div>

            {isSelected && !isLocked && (
              <div className="absolute top-1 right-1 bg-primary text-primary-foreground rounded-full p-0.5">
                <Check className="h-3 w-3" />
              </div>
            )}

            {isLocked && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 rounded-md">
                    <Lock className="h-5 w-5 text-white/80" />
                    <span className="text-xs font-bold text-white/90 mt-1">PRO</span>
                </div>
            )}

            <p
              className={`text-center text-xs font-medium mt-1.5 transition-colors ${
                isSelected && !isLocked ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {template.name}
            </p>
          </div>
        );
      })}
    </div>
  );
};
