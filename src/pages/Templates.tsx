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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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

// Dummy data to populate the templates for preview
const dummyInvoiceData: InvoiceData = {
  invoiceNumber: "INV-2024-001",
  date: new Date().toISOString(),
  dueDate: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString(),
  currency: "USD",
  lineItems: [
    { id: 1, description: "Premium Web Development", quantity: 1, rate: 3500, amount: 3500 },
    { id: 2, description: "Logo Design & Branding", quantity: 1, rate: 1200, amount: 1200 },
    { id: 3, description: "SEO & Marketing Strategy", quantity: 1, rate: 800, amount: 800 },
  ],
  subtotal: 5500,
  discountRate: 10,
  discountAmount: 550,
  taxRate: 8.5,
  taxAmount: 420.75,
  total: 5370.75,
  notes: "We appreciate your business. Please contact us with any questions.",
  businessInfo: {
    name: "Innovate Solutions Inc.",
    address: "123 Tech Park, Silicon Valley, CA 94001",
    email: "hello@innovate.co",
    phone: "+1 (555) 111-2222",
    logo: "/logo-placeholder.png", // Placeholder for logo
  },
  clientInfo: {
    name: "Global Exports Ltd.",
    address: "456 Trade Center, New York, NY 10001",
    email: "accounts@globalexports.com",
  },
  bankingInfo: {
    bankName: "Global Citizens Bank",
    accountNumber: "9876-5432-1098-7654",
    swiftCode: "GCB-US-NYC",
    iban: "US99 GCB 1234 5678 9012",
  },
};

export default function Templates() {
  const [previewTemplate, setPreviewTemplate] = useState<any | null>(null);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold">Invoice Templates</h2>
        <p className="text-muted-foreground mt-1">
          Preview and choose a professional template for your invoices.
        </p>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {availableTemplates.map((template) => (
          <Card key={template.id} className="overflow-hidden shadow-sm flex flex-col">
            <CardHeader className="p-4 border-b">
              <CardTitle className="flex items-center justify-between">
                <span>{template.name}</span>
                {template.isPremium && (
                  <Badge variant="premium">
                    <Star className="h-3 w-3 mr-1" />
                    Pro
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex-grow">
              <div
                className="h-[400px] bg-gray-100 overflow-hidden relative group cursor-pointer"
                onClick={() => setPreviewTemplate(template)}
              >
                {/* Correctly positioned and scaled wrapper */}
                <div
                  className="absolute top-1/2 left-1/2 pointer-events-none transform -translate-x-1/2 -translate-y-1/2 scale-[0.4] origin-center"
                >
                  <div className="w-[800px] bg-white shadow-2xl">
                    <template.component invoiceData={dummyInvoiceData} />
                  </div>
                </div>

                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="text-white font-semibold flex items-center gap-2 bg-gray-900/50 px-4 py-2 rounded-lg">
                    <Eye className="h-5 w-5" />
                    View Full Preview
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Preview Modal */}
      <Dialog
        open={!!previewTemplate}
        onOpenChange={(isOpen) => !isOpen && setPreviewTemplate(null)}
      >
        <DialogContent className="max-w-4xl h-[90vh] p-0">
          <DialogHeader className="p-4 border-b">
            <DialogTitle>
              Preview: {previewTemplate?.name} Template
            </DialogTitle>
          </DialogHeader>
          <div className="h-full overflow-y-auto bg-gray-200 p-8">
            <div className="w-full max-w-3xl mx-auto shadow-lg">
              {previewTemplate && (
                <previewTemplate.component invoiceData={dummyInvoiceData} />
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
