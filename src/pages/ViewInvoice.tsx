import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Download, ArrowLeft, Eye, Loader2, Mail, Send } from "lucide-react";
import { InvoicePreview } from "@/components/InvoicePreview";
import { InvoiceData, currencies } from "@/types/invoice";
import { InvoiceTemplate } from "@/types/templates";
import { generatePDF, generatePDFBuffer } from "@/utils/pdfGenerator";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { InvoiceController } from "@/controllers/invoice.controller";
import { EmailService } from "@/services/email.service";
import { supabase } from "@/lib/supabase";
import { usePlanAccess } from "@/hooks/usePlanAccess";
import { PaywallModal } from "@/components/PaywallModal";
import { ProtectedInvoiceController } from "@/controllers/invoice.controller.protected";

const ViewInvoice = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [emailData, setEmailData] = useState({
    recipientEmail: "",
    recipientName: "",
    customMessage: "",
    ccOwner: true,
    autoGenerateMessage: true,
  });
  const invoicePreviewRef = useRef<HTMLDivElement>(null);

  // Get user data
  const { user } = useAuth();
  const { canExportPDF } = usePlanAccess();

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

  const [selectedTemplate, setSelectedTemplate] = useState<InvoiceTemplate>(
    InvoiceTemplate.MODERN
  );

  // Load invoice data
  useEffect(() => {
    const loadInvoice = async () => {
      if (!id || !user?.id) return;

      setIsLoading(true);
      try {
        const response = await InvoiceController.getInvoice(id);
        if (response.success && response.data) {
          const invoice = Array.isArray(response.data) ? response.data[0] : response.data;

          // Convert saved invoice data to InvoiceData format
          const convertedData: InvoiceData = {
            invoiceNumber: invoice.invoice_number,
            date: invoice.issue_date,
            dueDate: invoice.due_date,
            currency: invoice.currency,
            isRecurring: invoice.is_recurring,
            recurringInterval: (invoice.recurring_interval as "weekly" | "monthly" | "quarterly" | "yearly") || "monthly",
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
          
          // Pre-populate email data with client information
          setEmailData(prev => ({
            ...prev,
            recipientEmail: invoice.client_email || "",
            recipientName: invoice.client_name || "",
            autoGenerateMessage: true,
          }));
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

  const handleGeneratePDF = async () => {
    // Double-check permission server-side as defense-in-depth
    if (!user?.id) {
      toast({ title: "Error", description: "You must be logged in.", variant: "destructive" });
      return;
    }
    const access = await ProtectedInvoiceController.canExportPDF(user.id);
    if (!access.success) {
      toast({ title: "Premium Feature", description: access.error || "PDF export requires a Pro plan or higher", variant: "destructive" });
      setShowPaywall(true);
      return;
    }

    if (!invoicePreviewRef.current) {
      toast({
        title: "Error",
        description: "Invoice preview not found. Please try again.",
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

  const handleSendEmail = async () => {
    if (!id || !user?.id) {
      toast({
        title: "Authentication Error",
        description: "User information is missing. Please try logging out and back in.",
        variant: "destructive",
      });
      return;
    }

    if (!id) {
      toast({
        title: "Error",
        description: "Invoice ID not found.",
        variant: "destructive",
      });
      return;
    }

    if (!emailData.recipientEmail) {
      toast({
        title: "Error",
        description: "Recipient email is required.",
        variant: "destructive",
      });
      return;
    }

    if (!invoicePreviewRef.current) {
      toast({
        title: "Error",
        description: "Invoice preview not available for PDF generation.",
        variant: "destructive",
      });
      return;
    }

    setIsSendingEmail(true);
    try {
      // Generate PDF buffer
      const pdfBuffer = await generatePDFBuffer(invoicePreviewRef.current);
      
      // Define file path for Supabase Storage
      const fileName = `invoice-${invoiceData.invoiceNumber}-${Date.now()}.pdf`;
      const filePath = `${user.id}/${fileName}`;

      // Upload the PDF to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('invoice-pdfs')
        .upload(filePath, pdfBuffer, {
          contentType: 'application/pdf',
          upsert: true,
        });

      if (uploadError) {
        console.error('Storage upload error:', uploadError);
        toast({
          title: "Storage Error",
          description: "Failed to upload the invoice PDF. Please try again.",
          variant: "destructive",
        });
        setIsSendingEmail(false);
        return;
      }

      // Get the public URL of the uploaded file
      const { data: urlData } = supabase.storage
        .from('invoice-pdfs')
        .getPublicUrl(filePath);

      if (!urlData?.publicUrl) {
        toast({
          title: "Storage Error",
          description: "Failed to get the public URL for the PDF.",
          variant: "destructive",
        });
        setIsSendingEmail(false);
        return;
      }

      const response = await EmailService.sendInvoiceEmail({
        invoiceId: id,
        recipientEmail: emailData.recipientEmail,
        recipientName: emailData.recipientName,
        customMessage: emailData.customMessage,
        ccOwner: emailData.ccOwner,
        autoGenerateMessage: emailData.autoGenerateMessage,
        pdfUrl: urlData.publicUrl,
      });

      if (response.success) {
        toast({
          title: "Success!",
          description: "Invoice has been sent successfully.",
        });
        setIsEmailDialogOpen(false);
        // Reset form
        setEmailData({
          recipientEmail: invoiceData.clientInfo.email || "",
          recipientName: invoiceData.clientInfo.name || "",
          customMessage: "",
          ccOwner: true,
          autoGenerateMessage: true,
        });
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to send email.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Email sending error:", error);
      toast({
        title: "Error",
        description: "Failed to send email. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSendingEmail(false);
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
            <h1 className="text-3xl font-bold text-foreground">View Invoice</h1>
            <p className="text-muted-foreground mt-1">
              Invoice #{invoiceData.invoiceNumber}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Dialog open={isEmailDialogOpen} onOpenChange={setIsEmailDialogOpen}>
            <DialogTrigger asChild>
              <Button
                
                className="flex items-center gap-2"
              >
                <Mail className="h-4 w-4" />
                Send Invoice
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Send className="h-5 w-5 text-primary" />
                  Send Invoice via Email
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="recipientEmail">Recipient Email *</Label>
                  <Input
                    id="recipientEmail"
                    type="email"
                    value={emailData.recipientEmail}
                    onChange={(e) => setEmailData(prev => ({ ...prev, recipientEmail: e.target.value }))}
                    placeholder="client@example.com"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="recipientName">Recipient Name</Label>
                  <Input
                    id="recipientName"
                    value={emailData.recipientName}
                    onChange={(e) => setEmailData(prev => ({ ...prev, recipientName: e.target.value }))}
                    placeholder="Client Name"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="autoGenerateMessage"
                      checked={emailData.autoGenerateMessage}
                      onCheckedChange={(checked) => setEmailData(prev => ({ ...prev, autoGenerateMessage: checked as boolean }))}
                    />
                    <Label htmlFor="autoGenerateMessage" className="text-sm">
                      Auto-generate professional message
                    </Label>
                  </div>
                </div>

                {!emailData.autoGenerateMessage && (
                  <div className="space-y-2">
                    <Label htmlFor="customMessage">Custom Message</Label>
                    <Textarea
                      id="customMessage"
                      value={emailData.customMessage}
                      onChange={(e) => setEmailData(prev => ({ ...prev, customMessage: e.target.value }))}
                      placeholder="Add a personal message to your invoice..."
                      rows={3}
                    />
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="ccOwner"
                    checked={emailData.ccOwner}
                    onCheckedChange={(checked) => setEmailData(prev => ({ ...prev, ccOwner: checked as boolean }))}
                  />
                  <Label htmlFor="ccOwner" className="text-sm">
                    CC me (account owner) on this email
                  </Label>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-800">
                    <strong>Auto-generated message will include:</strong>
                  </p>
                  <ul className="text-sm text-blue-700 mt-1 ml-4 list-disc">
                    <li>Professional greeting</li>
                    <li>Invoice details and due date</li>
                    <li>Payment instructions</li>
                    <li>Contact information</li>
                  </ul>
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsEmailDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSendEmail}
                    disabled={isSendingEmail || !emailData.recipientEmail}
                    className="bg-primary hover:opacity-90"
                  >
                    {isSendingEmail ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-background border-t-transparent mr-2" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Send Invoice
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Button
            onClick={() => {
              if (!canExportPDF) {
                toast({ title: "Premium Feature", description: "PDF export requires a Pro plan or higher", variant: "destructive" });
                setShowPaywall(true);
                return;
              }
              void handleGeneratePDF();
            }}
            disabled={isGenerating || !canExportPDF}
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
                {!canExportPDF && (
                  <span className="ml-2 text-xs px-1.5 py-0.5 bg-yellow-400 text-yellow-900 rounded">Pro</span>
                )}
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Invoice Preview */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Eye className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-semibold">Invoice Preview</h2>
        </div>

        <Card className="shadow-soft">
          <CardContent className="p-0">
            <div className="sticky top-6">
              <InvoicePreview
                ref={invoicePreviewRef}
                invoiceData={invoiceData}
                template={selectedTemplate}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Invoice Details Summary */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Eye className="h-5 w-5 text-primary" />
            Invoice Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">
                Invoice Number
              </p>
              <p className="text-lg font-semibold">
                {invoiceData.invoiceNumber}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">
                Issue Date
              </p>
              <p className="text-lg font-semibold">
                {new Date(invoiceData.date).toLocaleDateString()}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">
                Due Date
              </p>
              <p className="text-lg font-semibold">
                {new Date(invoiceData.dueDate).toLocaleDateString()}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">
                Total Amount
              </p>
              <p className="text-lg font-semibold text-green-600">
                {selectedCurrency?.symbol || invoiceData.currency}{" "}
                {invoiceData.total.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">
                Client
              </p>
              <p className="text-lg font-semibold">
                {invoiceData.clientInfo.name}
              </p>
              <p className="text-sm text-muted-foreground">
                {invoiceData.clientInfo.email}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">
                Template
              </p>
              <p className="text-lg font-semibold capitalize">
                {selectedTemplate.toLowerCase().replace("_", " ")}
              </p>
            </div>
          </div>

          {invoiceData.isRecurring && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-blue-900">
                    Recurring Invoice
                  </p>
                  <p className="text-sm text-blue-700">
                    This invoice is set to recur {invoiceData.recurringInterval}
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      {/* Paywall Modal */}
      <PaywallModal
        isOpen={showPaywall}
        onClose={() => setShowPaywall(false)}
        feature="PDF Export"
        requiredPlan="pro"
        description="PDF export is available on Pro plan and above. Upgrade to download and share invoices as PDFs."
      />
    </div>
  );
};

export default ViewInvoice;
