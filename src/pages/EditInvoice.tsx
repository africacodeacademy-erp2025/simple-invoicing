import React, { useState, useRef, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Download,
  FileText,
  Eye,
  EyeOff,
  Palette,
  Save,
  ArrowLeft,
} from "lucide-react";
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
import { Loader2 } from "lucide-react";

const EditInvoice = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [showPreview, setShowPreview] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<InvoiceTemplate>(
    InvoiceTemplate.MODERN
  );
  const invoicePreviewRef = useRef<HTMLDivElement>(null);

  // Get user and profile data
  const { user } = useAuth();
  const { profile, profileLoading, refreshProfile } = useProfile(
    user?.id || null
  );

  const [invoiceData, setInvoiceData] = useState<InvoiceData>({
    invoiceNumber: "",
    date: new Date().toISOString().split("T")[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    currency: "",
    isRecurring: false,
    recurringInterval: "monthly",
    businessInfo: {
      name: "",
      email: "",
      phone: "",
      address: "",
      logo: null,
    },
    clientInfo: {
      name: "",
      email: "",
      address: "",
    },
    bankingInfo: {
      bankName: "",
      accountNumber: "",
      swiftCode: "",
      iban: "",
    },
    lineItems: [],
    taxRate: 0,
    discountRate: 0,
    notes: "Thank you for your business!",
    subtotal: 0,
    taxAmount: 0,
    discountAmount: 0,
    total: 0,
  });

  // Load invoice data
  useEffect(() => {
    const loadInvoice = async () => {
      if (!id || !user?.id) return;

      setIsLoading(true);
      try {
        const response = await InvoiceController.getInvoice(id);
        if (response.success && response.data) {
          const invoice = response.data;

          // Convert saved invoice data to InvoiceData format
          const convertedData: InvoiceData = {
            invoiceNumber: invoice.invoice_number,
            date: invoice.issue_date,
            dueDate: invoice.due_date,
            currency: invoice.currency,
            isRecurring: invoice.is_recurring,
            recurringInterval: invoice.recurring_interval || "monthly",
            businessInfo: {
              name: invoice.business_name || "",
              email: invoice.business_email || "",
              phone: invoice.business_phone || "",
              address: invoice.business_address || "",
              logo: invoice.business_logo_url || null,
            },
            clientInfo: {
              name: invoice.client_name || "",
              email: invoice.client_email || "",
              address: invoice.client_address || "",
            },
            bankingInfo: {
              bankName: invoice.bank_name || "",
              accountNumber: invoice.account_number || "",
              swiftCode: invoice.swift_code || "",
              iban: invoice.iban || "",
            },
            lineItems: invoice.line_items || [],
            taxRate: invoice.tax_rate || 0,
            discountRate: invoice.discount_rate || 0,
            subtotal: invoice.subtotal || 0,
            taxAmount: invoice.tax_amount || 0,
            discountAmount: invoice.discount_amount || 0,
            total: invoice.total || 0,
            notes: invoice.notes || "Thank you for your business!",
          };

          setInvoiceData(convertedData);
          setSelectedTemplate(invoice.template as InvoiceTemplate);
        } else {
          toast({
            title: "Error",
            description: response.message,
            variant: "destructive",
          });
          navigate("/app/invoices");
        }
      } catch (error) {
        console.error("Error loading invoice:", error);
        toast({
          title: "Error",
          description: "Failed to load invoice",
          variant: "destructive",
        });
        navigate("/app/invoices");
      } finally {
        setIsLoading(false);
      }
    };

    loadInvoice();
  }, [id, user?.id, navigate]);

  // Calculate totals whenever line items, tax, or discount change
  const calculateTotals = useCallback((data: InvoiceData) => {
    const subtotal = data.lineItems.reduce((sum, item) => sum + item.amount, 0);
    const discountAmount = (subtotal * data.discountRate) / 100;
    const afterDiscount = subtotal - discountAmount;
    const taxAmount = (afterDiscount * data.taxRate) / 100;
    const total = afterDiscount + taxAmount;

    return {
      ...data,
      subtotal,
      discountAmount,
      taxAmount,
      total,
    };
  }, []);

  // Update totals when invoice data changes
  useEffect(() => {
    setInvoiceData((prevData) => calculateTotals(prevData));
  }, [calculateTotals]);

  const handleUpdateInvoiceData = (newData: InvoiceData) => {
    setInvoiceData(calculateTotals(newData));
  };

  const handleGeneratePDF = async () => {
    if (!invoicePreviewRef.current) {
      toast({
        title: "Error",
        description: "Invoice preview not found. Please try again.",
        variant: "destructive",
      });
      return;
    }

    if (!invoiceData.businessInfo.name || !invoiceData.clientInfo.name) {
      toast({
        title: "Missing Information",
        description:
          "Please fill in both business and client names before generating PDF.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      await generatePDF(invoicePreviewRef.current, invoiceData);
      toast({
        title: "Success!",
        description: "Invoice PDF has been generated and downloaded.",
      });
    } catch (error) {
      console.error("PDF generation error:", error);
      toast({
        title: "Error",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveInvoice = async () => {
    if (!user?.id || !id) {
      toast({
        title: "Error",
        description: "You must be logged in to save invoices.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const response = await InvoiceController.updateInvoice(
        id,
        invoiceData,
        selectedTemplate
      );

      if (response.success) {
        toast({
          title: "Success!",
          description: "Invoice updated successfully.",
        });
        navigate("/app/invoices");
      } else {
        if (response.errors && response.errors.length > 0) {
          const firstError = response.errors[0];
          toast({
            title: "Validation Error",
            description: `${firstError.field}: ${firstError.message}`,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Error",
            description: response.message,
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error("Error updating invoice:", error);
      toast({
        title: "Error",
        description: "Failed to update invoice. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const selectedCurrency = currencies.find(
    (c) => c.code === invoiceData.currency
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading invoice...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/app/invoices")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Invoices
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Edit Invoice</h1>
            <p className="text-muted-foreground mt-1">
              Update invoice details and regenerate
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPreview(!showPreview)}
            className="md:hidden"
          >
            {showPreview ? (
              <>
                <EyeOff className="h-4 w-4 mr-2" />
                Hide Preview
              </>
            ) : (
              <>
                <Eye className="h-4 w-4 mr-2" />
                Show Preview
              </>
            )}
          </Button>

          <Button
            onClick={handleSaveInvoice}
            disabled={isSaving}
            variant="outline"
            className="hover:bg-green-50 hover:border-green-300 hover:text-green-700"
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent mr-2" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Update Invoice
              </>
            )}
          </Button>

          <Button
            onClick={handleGeneratePDF}
            disabled={isGenerating}
            className="bg-primary hover:opacity-90 transition-opacity"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-background border-t-transparent mr-2" />
                Generating...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Form Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <FileText className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-semibold">Invoice Details</h2>
          </div>

          <InvoiceForm
            invoiceData={invoiceData}
            onUpdateInvoiceData={handleUpdateInvoiceData}
            userId={user?.id}
            profile={profile}
          />

          {/* Template Selector */}
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Palette className="h-5 w-5 text-primary" />
                Template Selection
              </CardTitle>
            </CardHeader>
            <CardContent>
              <TemplateSelector
                selectedTemplate={selectedTemplate}
                onSelectTemplate={setSelectedTemplate}
              />
            </CardContent>
          </Card>
        </div>

        {/* Preview Section */}
        {showPreview && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <Eye className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-semibold">Preview</h2>
            </div>

            <div className="sticky top-6">
              <InvoicePreview
                ref={invoicePreviewRef}
                invoiceData={invoiceData}
                template={selectedTemplate}
                currency={selectedCurrency}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EditInvoice;
