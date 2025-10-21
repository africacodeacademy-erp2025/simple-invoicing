import React, { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, FileText, Eye, EyeOff, Palette, Save } from "lucide-react";
import { InvoiceForm } from "@/components/InvoiceForm";
import { InvoicePreview } from "@/components/InvoicePreview";
import { TemplateSelector } from "@/components/TemplateSelector";
import { InvoiceData, currencies } from "@/types/invoice";
import { InvoiceTemplate } from "@/types/templates";
import { generatePDF } from "@/utils/pdfGenerator";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { InvoiceController } from "@/controllers/invoice.controller";
import { useNavigate } from "react-router-dom";

// Paywall imports
import { usePlanAccess } from "@/hooks/usePlanAccess";
import { PaywallModal } from "@/components/PaywallModal";
import { ProtectedInvoiceController } from "@/controllers/invoice.controller.protected";

const CreateInvoice = () => {
  const [showPreview, setShowPreview] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<InvoiceTemplate>(InvoiceTemplate.MODERN);
  const invoicePreviewRef = useRef<HTMLDivElement>(null);

  // Paywall state
  const [showPaywall, setShowPaywall] = useState(false);
  const [paywallFeature, setPaywallFeature] = useState('');
  const [paywallPlan, setPaywallPlan] = useState<'pro' | 'business' | 'enterprise'>('pro');

  const { user } = useAuth();
  const { profile, profileLoading } = useProfile(user?.id || null);
  const navigate = useNavigate();

  // Plan access
  const { canExportPDFEffective, canUseRecurringEffective, effectivePlanLimits } = usePlanAccess();

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

  const handlePrefillFromProfile = () => {
    if (profile) {
      setInvoiceData((prevData) => ({
        ...prevData,
        invoiceNumber: generateInvoiceNumber(profile.invoice_prefix),
        currency: profile.default_currency || "USD",
        taxRate: profile.default_tax_rate || 0,
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
      }));
      toast({
        title: "Success!",
        description: "Business info updated from your profile.",
      });
    }
  };

  // PDF Export
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

  // Invoice creation
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

  const selectedCurrency = currencies.find((c) => c.code === invoiceData.currency);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Create Invoice</h1>
          <p className="text-muted-foreground mt-1">Create professional invoices in minutes</p>
          {profileLoading && <p className="text-sm text-blue-600 mt-2">Loading your business profile...</p>}
          {effectivePlanLimits?.maxInvoicesPerMonth !== undefined &&
           effectivePlanLimits.maxInvoicesPerMonth !== Infinity && (
            <p className="text-xs text-muted-foreground mt-1">
              Plan limit: {effectivePlanLimits.maxInvoicesPerMonth} invoices/month
            </p>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowPreview(!showPreview)} className="md:hidden">
            {showPreview ? <><EyeOff className="h-4 w-4 mr-1"/>Hide Preview</> : <><Eye className="h-4 w-4 mr-1"/>Show Preview</>}
          </Button>

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

      {/* Main Content */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Form Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <FileText className="h-6 w-6 text-primary"/>
            <h2 className="text-2xl font-semibold">Invoice Details</h2>
          </div>

          <InvoiceForm invoiceData={invoiceData} onUpdateInvoiceData={handleUpdateInvoiceData} userId={user?.id} profile={profile}/>

          <Card className="shadow-soft bg-background/70 dark:bg-background/90">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Palette className="h-5 w-5 text-primary"/>
                Template Selection
              </CardTitle>
            </CardHeader>
            <CardContent>
              <TemplateSelector selectedTemplate={selectedTemplate} onSelectTemplate={setSelectedTemplate}/>
            </CardContent>
          </Card>
        </div>

        {/* Preview Section */}
        {showPreview && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Eye className="h-6 w-6 text-primary"/>
                <h2 className="text-2xl font-semibold">Live Preview</h2>
              </div>

              {invoiceData.total > 0 && (
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Total Amount</p>
                  <p className="text-2xl font-bold text-primary">{selectedCurrency?.symbol}{invoiceData.total.toFixed(2)}</p>
                </div>
              )}
            </div>

            <div className="sticky top-6">
              <InvoicePreview ref={invoicePreviewRef} invoiceData={invoiceData} template={selectedTemplate}/>
            </div>
          </div>
        )}
      </div>

      <PaywallModal isOpen={showPaywall} onClose={() => setShowPaywall(false)} feature={paywallFeature} requiredPlan={paywallPlan}/>
    </div>
  );
};

export default CreateInvoice;
