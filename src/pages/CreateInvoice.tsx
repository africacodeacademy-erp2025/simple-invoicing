import React, { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, FileText, Eye, Palette, Save } from "lucide-react";
import { InvoiceForm } from "@/components/InvoiceForm";
import { InvoicePreview } from "@/components/InvoicePreview";
import { TemplateSelector } from "@/components/TemplateSelector";
import { InvoiceData } from "@/types/invoice";
import { InvoiceTemplate, TemplateInfo } from "@/types/templates";
import { generatePDF } from "@/utils/pdfGenerator";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { InvoiceController } from "@/controllers/invoice.controller";
import { useNavigate } from "react-router-dom";
import { usePlanAccess } from "@/hooks/usePlanAccess";
import { PaywallModal } from "@/components/PaywallModal";
import { ProtectedInvoiceController } from "@/controllers/invoice.controller.protected";
import { MinimalTemplate } from "@/components/templates/MinimalTemplate";
import { ClassicTemplate } from "@/components/templates/ClassicTemplate";
import { ModernTemplate } from "@/components/templates/ModernTemplate";
import { CorporateTemplate } from "@/components/templates/CorporateTemplate";
import { CreativeTemplate } from "@/components/templates/CreativeTemplate";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const availableTemplates = [
  { id: InvoiceTemplate.MINIMAL, name: "Minimal", component: MinimalTemplate, isPremium: true },
  { id: InvoiceTemplate.CLASSIC, name: "Classic", component: ClassicTemplate, isPremium: false },
  { id: InvoiceTemplate.MODERN, name: "Modern", component: ModernTemplate, isPremium: false },
  { id: InvoiceTemplate.CORPORATE, name: "Corporate", component: CorporateTemplate, isPremium: true },
  { id: InvoiceTemplate.CREATIVE, name: "Creative", component: CreativeTemplate, isPremium: true },
];

const CreateInvoice = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<InvoiceTemplate>(InvoiceTemplate.MODERN);
  const invoicePreviewRef = useRef<HTMLDivElement>(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

  const [showPaywall, setShowPaywall] = useState(false);
  const [paywallFeature, setPaywallFeature] = useState('');
  const [paywallPlan, setPaywallPlan] = useState<'pro' | 'business' | 'enterprise'>('pro');

  const { user } = useAuth();
  const { profile, profileLoading } = useProfile(user?.id || null);
  const navigate = useNavigate();

  const { canUsePremiumTemplates, canExportPDFEffective, canUseRecurringEffective, effectivePlanLimits } = usePlanAccess();

  const [invoiceData, setInvoiceData] = useState<InvoiceData>({
    invoiceNumber: "",
    date: new Date().toISOString().split("T")[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    currency: "",
    isRecurring: false,
    recurringInterval: "monthly",
    businessInfo: { name: "", email: "", phone: "", address: "", logo: null },
    clientInfo: { name: "", email: "", address: "" },
    bankingInfo: { bankName: "", accountNumber: "", swiftCode: "", iban: "" },
    lineItems: [],
    taxRate: 0,
    discountRate: 0,
    notes: "Thank you for your business!",
    subtotal: 0,
    taxAmount: 0,
    discountAmount: 0,
    total: 0,
  });

  const calculateTotals = useCallback((data: InvoiceData) => {
    const subtotal = data.lineItems.reduce((sum, item) => sum + item.amount, 0);
    const discountAmount = (subtotal * data.discountRate) / 100;
    const taxableAmount = subtotal - discountAmount;
    const taxAmount = (taxableAmount * data.taxRate) / 100;
    const total = taxableAmount + taxAmount;
    return { ...data, subtotal, discountAmount, taxAmount, total };
  }, []);

  const handleUpdateInvoiceData = useCallback(
    (newData: InvoiceData) => {
      const dataWithTotals = calculateTotals(newData);
      setInvoiceData(dataWithTotals);
    },
    [calculateTotals]
  );

  useEffect(() => {
    const dataWithTotals = calculateTotals(invoiceData);
    if (dataWithTotals.total !== invoiceData.total) {
      setInvoiceData(dataWithTotals);
    }
  }, [invoiceData.lineItems, invoiceData.taxRate, invoiceData.discountRate, calculateTotals]);

  const generateInvoiceNumber = useCallback((prefix?: string) => {
    const basePrefix = prefix || "INV";
    const timestamp = Date.now().toString().slice(-6);
    return `${basePrefix}-${timestamp}`;
  }, []);

  useEffect(() => {
    if (profile && !profileLoading) {
      setInvoiceData((prevData) => {
        const invoiceNumber = prevData.invoiceNumber || generateInvoiceNumber(profile.invoice_prefix);
        const currency = profile.default_currency || "USD";
        const taxRate = profile.default_tax_rate || 0;
        return {
          ...prevData,
          invoiceNumber,
          currency,
          taxRate,
          businessInfo: {
            ...prevData.businessInfo,
            name: profile.business_name || prevData.businessInfo.name,
            email: profile.email || prevData.businessInfo.email,
            phone: profile.phone || prevData.businessInfo.phone,
            address: profile.address || prevData.businessInfo.address,
            logo: profile.logo_url || prevData.businessInfo.logo,
          },
          bankingInfo: {
            ...prevData.bankingInfo,
            bankName: profile.bank_name || prevData.bankingInfo.bankName,
            accountNumber: profile.account_number || prevData.bankingInfo.accountNumber,
            swiftCode: profile.swift_code || prevData.bankingInfo.swiftCode,
            iban: profile.iban || prevData.bankingInfo.iban,
          },
        };
      });
    }
  }, [profile, profileLoading, generateInvoiceNumber]);

  const handleGeneratePDF = async () => {
    if (!canExportPDFEffective) {
      toast({ title: "Premium Feature", description: "PDF export requires Pro plan", variant: "destructive" });
      setPaywallFeature("PDF Export");
      setPaywallPlan("pro");
      setShowPaywall(true);
      return;
    }
    if (!invoicePreviewRef.current || !invoiceData.businessInfo.name || !invoiceData.clientInfo.name) {
      toast({ title: "Error", description: "Invoice data incomplete.", variant: "destructive" });
      return;
    }
    setIsGenerating(true);
    try {
      await generatePDF(invoicePreviewRef.current, invoiceData);
      toast({ title: "Success!", description: "Invoice PDF downloaded." });
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "Failed to generate PDF.", variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCreateInvoice = async () => {
    if (!user?.id) {
      toast({ title: "Error", description: "You must be logged in.", variant: "destructive" });
      return;
    }

    if (invoiceData.isRecurring && !canUseRecurringEffective) {
      toast({ title: "Premium Feature", description: "Recurring invoices require Pro plan", variant: "destructive" });
      setPaywallFeature("Recurring Invoices");
      setPaywallPlan("pro");
      setShowPaywall(true);
      return;
    }

    const limitCheck = await ProtectedInvoiceController.canCreateInvoice(user.id, profile?.plan);
    if (!limitCheck.success) {
      toast({ title: "Limit Reached", description: limitCheck.error, variant: "destructive" });
      if (limitCheck.code === "LIMIT_REACHED") {
        setPaywallFeature("Unlimited Invoices");
        setPaywallPlan(limitCheck.upgradeRequired || "pro");
        setShowPaywall(true);
      } else if (limitCheck.code === "SUBSCRIPTION_EXPIRED") {
        navigate("/app/billing");
      }
      return;
    }

    setIsSaving(true);
    try {
      const response = await InvoiceController.saveInvoice(user.id, invoiceData, selectedTemplate);
      if (response.success) {
        toast({ title: "Success!", description: "Invoice created successfully." });
        if (response.data?.id) navigate(`/app/view-invoice/${response.data.id}`);
      } else {
        toast({ title: "Error", description: response.message || "Validation error", variant: "destructive" });
      }
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "Failed to save invoice.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleSelectTemplate = (template: TemplateInfo) => {
    if (template.isPremium && !canUsePremiumTemplates) {
      toast({ title: "Premium Feature", description: "This template requires a Pro plan.", variant: "destructive" });
      setPaywallFeature("Premium Templates");
      setPaywallPlan("pro");
      setShowPaywall(true);
    } else {
      setSelectedTemplate(template.id);
    }
  };

  const SelectedTemplateComponent = availableTemplates.find(t => t.id === selectedTemplate)?.component || ModernTemplate;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Create Invoice</h1>
          <p className="text-muted-foreground mt-1">Create professional invoices in minutes</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button onClick={handleCreateInvoice} disabled={isSaving} variant="outline" className="hover:bg-green-50 hover:border-green-300 hover:text-green-700">
            {isSaving ? <> <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent mr-2"/>Creating...</> : <><Save className="h-4 w-4 mr-2"/>Create Invoice</>}
          </Button>

          <Button onClick={handleGeneratePDF} disabled={isGenerating} className="bg-primary hover:opacity-90 transition-opacity relative">
            {isGenerating ? <><div className="animate-spin rounded-full h-4 w-4 border-2 border-background border-t-transparent mr-2"/>Generating...</> :
            <>
              <Download className="h-4 w-4 mr-2"/>Download PDF
              {!canExportPDFEffective && <span className="ml-2 text-xs px-1.5 py-0.5 bg-yellow-400 text-yellow-900 rounded">Pro</span>}
            </>}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3 space-y-6">
          <div className="flex items-center gap-3">
            <FileText className="h-6 w-6 text-primary"/>
            <h2 className="text-2xl font-semibold">Invoice Details</h2>
          </div>

          <InvoiceForm invoiceData={invoiceData} onUpdateInvoiceData={handleUpdateInvoiceData} userId={user?.id} profile={profile}/>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="sticky top-6 space-y-6">
            <Card>
              <CardHeader className="p-4">
                <CardTitle className="flex items-center gap-3">
                  <Eye className="h-5 w-5 text-primary"/>
                  Live Preview
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div
                    className="h-[420px] bg-gray-100 dark:bg-gray-800 rounded-b-lg overflow-hidden relative group cursor-pointer"
                    onClick={() => setIsPreviewModalOpen(true)}
                >
                    <div className="absolute top-1/2 left-1/2 pointer-events-none transform -translate-x-1/2 -translate-y-1/2 scale-[0.5] origin-center">
                        <div className="w-[800px] bg-white shadow-2xl">
                            <SelectedTemplateComponent invoiceData={invoiceData} />
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

            <Card className="shadow-soft bg-background/70 dark:bg-background/90">
              <CardHeader className="p-4">
                <CardTitle className="flex items-center gap-3">
                  <Palette className="h-5 w-5 text-primary"/>
                  Template Selection
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <TemplateSelector selectedTemplate={selectedTemplate} onSelectTemplate={handleSelectTemplate}/>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Dialog open={isPreviewModalOpen} onOpenChange={setIsPreviewModalOpen}>
        <DialogContent className="max-w-4xl h-[90vh] p-0">
            <DialogHeader className="p-4 border-b">
                <DialogTitle>Invoice Preview</DialogTitle>
            </DialogHeader>
            <div className="h-full overflow-y-auto bg-gray-200 p-8">
                <InvoicePreview
                    invoiceData={invoiceData}
                    template={selectedTemplate}
                />
            </div>
        </DialogContent>
      </Dialog>
      
      <div className="hidden">
        <div ref={invoicePreviewRef}>
            <InvoicePreview
                invoiceData={invoiceData}
                template={selectedTemplate}
            />
        </div>
      </div>

      <PaywallModal isOpen={showPaywall} onClose={() => setShowPaywall(false)} feature={paywallFeature} requiredPlan={paywallPlan}/>
    </div>
  );
};

export default CreateInvoice;
