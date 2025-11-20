
import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  Download,
  ArrowLeft,
  Eye,
  Loader2,
  Mail,
  Send,
  Printer,
} from "lucide-react";
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

  useEffect(() => {
    const loadInvoice = async () => {
      if (!id || !user?.id) return;

      setIsLoading(true);
      try {
        const response = await InvoiceController.getInvoice(id);
        if (response.success && response.data) {
          const invoice = Array.isArray(response.data)
            ? response.data[0]
            : response.data;

          const convertedData: InvoiceData = {
            invoiceNumber: invoice.invoice_number,
            date: invoice.issue_date,
            dueDate: invoice.due_date,
            currency: invoice.currency,
            isRecurring: invoice.is_recurring,
            recurringInterval:
              (invoice.recurring_interval as
                | "weekly"
                | "monthly"
                | "quarterly"
                | "yearly") || "monthly",
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

          setEmailData((prev) => ({
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
    if (!user?.id) {
      toast({
        title: "Error",
        description: "You must be logged in.",
        variant: "destructive",
      });
      return;
    }
    const access = await ProtectedInvoiceController.canExportPDF(user.id);
    if (!access.success) {
      toast({
        title: "Premium Feature",
        description:
          access.error || "PDF export requires a Pro plan or higher",
        variant: "destructive",
      });
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

  const handlePrint = () => {
    const invoiceElement = invoicePreviewRef.current;
    if (!invoiceElement) {
      toast({
        title: "Error",
        description: "Invoice preview not found.",
        variant: "destructive",
      });
      return;
    }

    const iframe = document.createElement("iframe");
    iframe.style.position = "absolute";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "none";
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) {
      toast({
        title: "Error",
        description: "Could not create a document for printing.",
        variant: "destructive",
      });
      document.body.removeChild(iframe);
      return;
    }

    doc.open();
    doc.write(
      `<!DOCTYPE html><html><head><title>Invoice #${invoiceData.invoiceNumber}</title></head><body></body></html>`
    );
    doc.close();

    const clonedElement = invoiceElement.cloneNode(true) as HTMLElement;

    const styles = document.head.querySelectorAll(
      'style, link[rel="stylesheet"]'
    );
    styles.forEach((style) => {
      doc.head.appendChild(style.cloneNode(true));
    });

    doc.body.appendChild(clonedElement);

    setTimeout(() => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } catch (e) {
        console.error("Printing failed:", e);
        toast({
          title: "Error",
          description: "Printing failed. Please try again.",
          variant: "destructive",
        });
      } finally {
        document.body.removeChild(iframe);
      }
    }, 500);
  };

  const handleSendEmail = async () => {
    if (!id || !user?.id) {
      toast({
        title: "Authentication Error",
        description:
          "User information is missing. Please try logging out and back in.",
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
      const pdfBuffer = await generatePDFBuffer(invoicePreviewRef.current);
      const fileName = `invoice-${
        invoiceData.invoiceNumber
      }-${Date.now()}.pdf`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("invoice-pdfs")
        .upload(filePath, pdfBuffer, {
          contentType: "application/pdf",
          upsert: true,
        });

      if (uploadError) {
        console.error("Storage upload error:", uploadError);
        toast({
          title: "Storage Error",
          description: "Failed to upload the invoice PDF. Please try again.",
          variant: "destructive",
        });
        setIsSendingEmail(false);
        return;
      }

      const { data: urlData } = supabase.storage
        .from("invoice-pdfs")
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
      <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading invoice...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-2 sm:p-4 md:p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
        <div className="flex items-center gap-2 sm:gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/app/invoices")}
            className="sm:hidden"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate("/app/invoices")}
            className="hidden sm:flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Invoices</span>
          </Button>
          <div>
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground">
              View Invoice
            </h1>
            <p className="text-muted-foreground text-xs sm:text-sm">
              #{invoiceData.invoiceNumber}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 sm:flex items-center gap-2">
          <Dialog open={isEmailDialogOpen} onOpenChange={setIsEmailDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex-1 sm:flex-initial text-xs sm:text-sm px-2 sm:px-4">
                <Mail className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Send</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Send className="h-5 w-5 text-primary" />
                  Send Invoice via Email
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="recipientEmail">Recipient Email *</Label>
                  <Input id="recipientEmail" type="email" value={emailData.recipientEmail} onChange={(e) => setEmailData((prev) => ({...prev, recipientEmail: e.target.value}))} placeholder="client@example.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="recipientName">Recipient Name</Label>
                  <Input id="recipientName" value={emailData.recipientName} onChange={(e) => setEmailData((prev) => ({...prev, recipientName: e.target.value}))} placeholder="Client Name" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="autoGenerateMessage" checked={emailData.autoGenerateMessage} onCheckedChange={(checked) => setEmailData((prev) => ({...prev, autoGenerateMessage: checked as boolean}))} />
                    <Label htmlFor="autoGenerateMessage" className="text-sm font-normal cursor-pointer">Auto-generate professional message</Label>
                  </div>
                </div>
                {!emailData.autoGenerateMessage && (
                  <div className="space-y-2">
                    <Label htmlFor="customMessage">Custom Message</Label>
                    <Textarea id="customMessage" value={emailData.customMessage} onChange={(e) => setEmailData((prev) => ({...prev, customMessage: e.target.value}))} placeholder="Add a personal message..." rows={3} />
                  </div>
                )}
                <div className="flex items-center space-x-2">
                  <Checkbox id="ccOwner" checked={emailData.ccOwner} onCheckedChange={(checked) => setEmailData((prev) => ({ ...prev, ccOwner: checked as boolean }))} />
                  <Label htmlFor="ccOwner" className="text-sm font-normal cursor-pointer">CC me on this email</Label>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsEmailDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleSendEmail} disabled={isSendingEmail || !emailData.recipientEmail}>
                    {isSendingEmail ? (<Loader2 className="h-4 w-4 animate-spin mr-2" />) : (<Send className="h-4 w-4 mr-2" />)}
                    Send
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Button
            onClick={handleGeneratePDF}
            disabled={isGenerating}
            className="flex-1 sm:flex-initial bg-primary hover:opacity-90 text-xs sm:text-sm px-2 sm:px-4"
          >
            {isGenerating ? <Loader2 className="h-4 w-4 animate-spin sm:mr-2" /> : <Download className="h-4 w-4 sm:mr-2" />}
            <span className="hidden sm:inline">PDF</span>
            {!canExportPDF && <span className="hidden sm:inline ml-2 text-xs px-1.5 py-0.5 bg-yellow-400 text-yellow-900 rounded">Pro</span>}
          </Button>

          <Button
            onClick={handlePrint}
            variant="outline"
            className="flex-1 sm:flex-initial text-xs sm:text-sm px-2 sm:px-4"
          >
            <Printer className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Print</span>
          </Button>
        </div>
      </div>

      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-base sm:text-lg md:text-xl">
            <Eye className="h-5 w-5 text-primary" />
            Invoice Preview
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 bg-gray-50 rounded-b-lg overflow-hidden">
            <ScrollArea className="h-[calc(100vh-20rem)] w-full">
                <div className="bg-white">
                    <InvoicePreview
                        ref={invoicePreviewRef}
                        invoiceData={invoiceData}
                        template={selectedTemplate}
                    />
                </div>
                <ScrollBar orientation="vertical" />
            </ScrollArea>
        </CardContent>
      </Card>
      
      <PaywallModal isOpen={showPaywall} onClose={() => setShowPaywall(false)} feature="PDF Export" requiredPlan="pro" />
    </div>
  );
};

export default ViewInvoice;
