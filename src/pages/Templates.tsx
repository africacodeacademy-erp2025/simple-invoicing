import React, { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { MinimalTemplate } from "@/components/templates/MinimalTemplate";
import { ClassicTemplate } from "@/components/templates/ClassicTemplate";
import { ModernTemplate } from "@/components/templates/ModernTemplate";
import { CorporateTemplate } from "@/components/templates/CorporateTemplate";
import { CreativeTemplate } from "@/components/templates/CreativeTemplate";
import { InvoiceData } from "@/types/invoice";
import { Badge } from "@/components/ui/badge";
import { Eye, Star, Download, FileText, FileSpreadsheet, Lock } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { TemplateService } from "@/services/template.service";
import { toast } from "@/hooks/use-toast";

const availableTemplates = [
  { id: "minimal", name: "Minimal", component: MinimalTemplate, isPremium: true },
  { id: "classic", name: "Classic", component: ClassicTemplate, isPremium: false },
  { id: "modern", name: "Modern", component: ModernTemplate, isPremium: false },
  { id: "corporate", name: "Corporate", component: CorporateTemplate, isPremium: true },
  { id: "creative", name: "Creative", component: CreativeTemplate, isPremium: true },
];

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

  const handleDownload = async (templateId: string, format: 'word' | 'excel') => {
    try {
      const response = await TemplateService.downloadTemplate(templateId, format);
      if (response.success) {
        toast({ title: "Download Started", description: `Your ${format.toUpperCase()} template is downloading.` });
      } else {
        toast({ title: "Download Failed", description: response.message, variant: "destructive" });
      }
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "An unexpected error occurred.", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">Invoice Templates</h2>
        <p className="text-muted-foreground mt-1">Preview our templates or download a free version to get started.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {availableTemplates.map((template) => (
          <Card key={template.id} className="overflow-hidden shadow-sm flex flex-col">
            <CardHeader className="p-4 border-b">
              <CardTitle className="flex items-center justify-between">
                <span>{template.name}</span>
                {template.isPremium && (
                  <Badge variant="premium"><Star className="h-3 w-3 mr-1" />Pro</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex-grow">
              <div
                className="h-[400px] bg-gray-100 dark:bg-gray-800 overflow-hidden relative group cursor-pointer"
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
                   <Button variant="outline" size="sm" className="bg-white/90 text-gray-800 hover:bg-white">
                      <Eye className="h-4 w-4 mr-2" />
                      Full Preview
                  </Button>
                </div>
              </div>
            </CardContent>
            <CardFooter className="p-3 bg-muted/30 border-t flex justify-end">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="secondary" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleDownload(template.id, 'word')} disabled={template.isPremium}>
                      <FileText className="h-4 w-4 mr-2" />
                      Word (.docx)
                      {template.isPremium && <Lock className="h-3 w-3 ml-auto" />}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDownload(template.id, 'excel')} disabled={template.isPremium}>
                      <FileSpreadsheet className="h-4 w-4 mr-2" />
                      Excel (.xlsx)
                      {template.isPremium && <Lock className="h-3 w-3 ml-auto" />}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
            </CardFooter>
          </Card>
        ))}
      </div>

      <Dialog open={!!previewTemplate} onOpenChange={(isOpen) => !isOpen && setPreviewTemplate(null)}>
        <DialogContent className="max-w-4xl h-[90vh] p-0">
          <DialogHeader className="p-4 border-b"><DialogTitle>Preview: {previewTemplate?.name}</DialogTitle></DialogHeader>
          <div className="h-full overflow-y-auto bg-gray-200 p-8">
            <div className="w-full max-w-3xl mx-auto shadow-lg">
              {previewTemplate && <previewTemplate.component invoiceData={dummyInvoiceData} />}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
