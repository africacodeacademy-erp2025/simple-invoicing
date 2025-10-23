import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Download, ArrowLeft, Eye, Loader2, Mail, Send } from "lucide-react";
import { InvoicePreview } from "@/components/InvoicePreview";
import { InvoiceData, currencies } from "@/types/invoice";
import { InvoiceTemplate } from "@/types/templates";
import { generatePDF } from "@/utils/pdfGenerator";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { InvoiceController } from "@/controllers/invoice.controller";
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
  const { canExportPDFEffective } = usePlanAccess();

  const [invoiceData, setInvoiceData] = useState<any>(null);
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
          const invoice = Array.isArray(response.data) ? response.data[0] : response.data;
          setInvoiceData(invoice);
          setSelectedTemplate(invoice.template as InvoiceTemplate);
          setEmailData(prev => ({ ...prev, recipientEmail: invoice.client_email || "", recipientName: invoice.client_name || "" }));
        } else {
          toast({ title: "Error", description: response.message, variant: "destructive" });
          navigate("/app/invoices");
        }
      } catch (error) {
        console.error("Error loading invoice:", error);
        toast({ title: "Error", description: "Failed to load invoice", variant: "destructive" });
        navigate("/app/invoices");
      } finally {
        setIsLoading(false);
      }
    };
    loadInvoice();
  }, [id, user?.id, navigate]);

  const handleGeneratePDF = async () => {
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
      toast({ title: "Error", description: "Invoice preview not found. Please try again.", variant: "destructive" });
      return;
    }
    setIsGenerating(true);
    try {
      await generatePDF(invoicePreviewRef.current, invoiceData);
      toast({ title: "Success!", description: "Invoice PDF has been generated and downloaded." });
    } catch (error) {
      console.error("PDF generation error:", error);
      toast({ title: "Error", description: "Failed to generate PDF. Please try again.", variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSendEmail = async () => {
    if (!id || !invoiceData) {
      toast({ title: "Error", description: "Invoice data not found.", variant: "destructive" });
      return;
    }
    if (!invoicePreviewRef.current) {
      toast({ title: "Error", description: "Invoice preview not available.", variant: "destructive" });
      return;
    }
    setIsSendingEmail(true);
    try {
      const response = await InvoiceController.sendInvoiceByEmail(invoiceData, invoicePreviewRef, emailData);
      if (response.success) {
        toast({ title: "Success!", description: "Invoice has been sent successfully." });
        setIsEmailDialogOpen(false);
      } else {
        toast({ title: "Error", description: response.message || "Failed to send email.", variant: "destructive" });
      }
    } catch (error) {
      console.error("Email sending error:", error);
      toast({ title: "Error", description: "Failed to send email. Please try again.", variant: "destructive" });
    } finally {
      setIsSendingEmail(false);
    }
  };

  const selectedCurrency = currencies.find(c => c.code === invoiceData?.currency);

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-[400px]"><div className="flex items-center space-x-2"><Loader2 className="h-6 w-6 animate-spin" /><span>Loading invoice...</span></div></div>;
  }

  if (!invoiceData) {
    return <div className="text-center"><p>Invoice not found.</p><Button onClick={() => navigate("/app/invoices")}>Go to Invoices</Button></div>;
  }

  const previewData: InvoiceData = {
    invoiceNumber: invoiceData.invoice_number,
    date: invoiceData.issue_date,
    dueDate: invoiceData.due_date,
    currency: invoiceData.currency,
    isRecurring: invoiceData.is_recurring,
    recurringInterval: (invoiceData.recurring_interval as "weekly" | "monthly" | "quarterly" | "yearly") || "monthly",
    businessInfo: { name: invoiceData.business_name || "", email: invoiceData.business_email || "", phone: invoiceData.business_phone || "", address: invoiceData.business_address || "", logo: invoiceData.business_logo_url || null },
    clientInfo: { name: invoiceData.client_name || "", email: invoiceData.client_email || "", address: invoiceData.client_address || "" },
    bankingInfo: { bankName: invoiceData.bank_name || "", accountNumber: invoiceData.account_number || "", swiftCode: invoiceData.swift_code || "", iban: invoiceData.iban || "" },
    lineItems: invoiceData.line_items || [],
    taxRate: invoiceData.tax_rate || 0,
    discountRate: invoiceData.discount_rate || 0,
    subtotal: invoiceData.subtotal || 0,
    taxAmount: invoiceData.tax_amount || 0,
    discountAmount: invoiceData.discount_amount || 0,
    total: invoiceData.total || 0,
    notes: invoiceData.notes || "Thank you for your business!",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate("/app/invoices")} className="flex items-center gap-2"><ArrowLeft className="h-4 w-4" />Back to Invoices</Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">View Invoice</h1>
            <p className="text-muted-foreground mt-1">Invoice #{invoiceData.invoice_number}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Dialog open={isEmailDialogOpen} onOpenChange={setIsEmailDialogOpen}>
            <DialogTrigger asChild><Button className="flex items-center gap-2"><Mail className="h-4 w-4" />Send Invoice</Button></DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2"><Send className="h-5 w-5 text-primary" />Send Invoice via Email</DialogTitle>
                <DialogDescription>Customize the email and send the invoice to your client.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2"><Label htmlFor="recipientEmail">Recipient Email *</Label><Input id="recipientEmail" type="email" value={emailData.recipientEmail} onChange={e => setEmailData(prev => ({ ...prev, recipientEmail: e.target.value }))} placeholder="client@example.com" /></div>
                <div className="space-y-2"><Label htmlFor="recipientName">Recipient Name</Label><Input id="recipientName" value={emailData.recipientName} onChange={e => setEmailData(prev => ({ ...prev, recipientName: e.target.value }))} placeholder="Client Name" /></div>
                <div className="space-y-2"><div className="flex items-center space-x-2"><Checkbox id="autoGenerateMessage" checked={emailData.autoGenerateMessage} onCheckedChange={checked => setEmailData(prev => ({ ...prev, autoGenerateMessage: checked as boolean }))} /><Label htmlFor="autoGenerateMessage" className="text-sm">Auto-generate professional message</Label></div></div>
                {!emailData.autoGenerateMessage && <div className="space-y-2"><Label htmlFor="customMessage">Custom Message</Label><Textarea id="customMessage" value={emailData.customMessage} onChange={e => setEmailData(prev => ({ ...prev, customMessage: e.target.value }))} placeholder="Add a personal message to your invoice..." rows={3} /></div>}
                <div className="flex items-center space-x-2"><Checkbox id="ccOwner" checked={emailData.ccOwner} onCheckedChange={checked => setEmailData(prev => ({ ...prev, ccOwner: checked as boolean }))} /><Label htmlFor="ccOwner" className="text-sm">CC me (account owner) on this email</Label></div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3"><p className="text-sm text-blue-800"><strong>Auto-generated message will include:</strong></p><ul className="text-sm text-blue-700 mt-1 ml-4 list-disc"><li>Professional greeting</li><li>Invoice details and due date</li><li>Payment instructions</li><li>Contact information</li></ul></div>
                <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setIsEmailDialogOpen(false)}>Cancel</Button><Button onClick={handleSendEmail} disabled={isSendingEmail || !emailData.recipientEmail} className="bg-primary hover:opacity-90">{isSendingEmail ? <><div className="animate-spin rounded-full h-4 w-4 border-2 border-background border-t-transparent mr-2" />Sending...</> : <><Send className="h-4 w-4 mr-2" />Send Invoice</>}</Button></div>
              </div>
            </DialogContent>
          </Dialog>
          <Button onClick={() => { if (!canExportPDFEffective) { toast({ title: "Premium Feature", description: "PDF export requires a Pro plan or higher", variant: "destructive" }); setShowPaywall(true); return; } void handleGeneratePDF(); }} disabled={isGenerating || !canExportPDFEffective} className="bg-primary hover:opacity-90 transition-opacity">{isGenerating ? <><div className="animate-spin rounded-full h-4 w-4 border-2 border-background border-t-transparent mr-2" />Generating...</> : <><Download className="h-4 w-4 mr-2" />Download PDF{!canExportPDFEffective && <span className="ml-2 text-xs px-1.5 py-0.5 bg-yellow-400 text-yellow-900 rounded">Pro</span>}</>}</Button>
        </div>
      </div>
      <div className="space-y-6"><div className="flex items-center gap-3"><Eye className="h-6 w-6 text-primary" /><h2 className="text-2xl font-semibold">Invoice Preview</h2></div><Card className="shadow-soft"><CardContent className="p-0"><div className="sticky top-6"><InvoicePreview ref={invoicePreviewRef} invoiceData={previewData} template={selectedTemplate} /></div></CardContent></Card></div>
      <Card className="shadow-soft">
        <CardHeader><CardTitle className="flex items-center gap-3"><Eye className="h-5 w-5 text-primary" />Invoice Summary</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"><div className="space-y-2"><p className="text-sm font-medium text-muted-foreground">Invoice Number</p><p className="text-lg font-semibold">{invoiceData.invoice_number}</p></div><div className="space-y-2"><p className="text-sm font-medium text-muted-foreground">Issue Date</p><p className="text-lg font-semibold">{new Date(invoiceData.issue_date).toLocaleDateString()}</p></div><div className="space-y-2"><p className="text-sm font-medium text-muted-foreground">Due Date</p><p className="text-lg font-semibold">{new Date(invoiceData.due_date).toLocaleDateString()}</p></div><div className="space-y-2"><p className="text-sm font-medium text-muted-foreground">Total Amount</p><p className="text-lg font-semibold text-green-600">{selectedCurrency?.symbol || invoiceData.currency}{" "}{invoiceData.total.toLocaleString()}</p></div></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6"><div className="space-y-2"><p className="text-sm font-medium text-muted-foreground">Client</p><p className="text-lg font-semibold">{invoiceData.client_name}</p><p className="text-sm text-muted-foreground">{invoiceData.client_email}</p></div><div className="space-y-2"><p className="text-sm font-medium text-muted-foreground">Template</p><p className="text-lg font-semibold capitalize">{selectedTemplate.toLowerCase().replace("_", " ")}</p></div></div>
          {invoiceData.is_recurring && <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg"><div className="flex items-start gap-2"><div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div><div className="space-y-1"><p className="text-sm font-medium text-blue-900">Recurring Invoice</p><p className="text-sm text-blue-700">This invoice is set to recur {invoiceData.recurring_interval}</p></div></div></div>}
        </CardContent>
      </Card>
      <PaywallModal isOpen={showPaywall} onClose={() => setShowPaywall(false)} feature="PDF Export" requiredPlan="pro" description="PDF export is available on Pro plan and above. Upgrade to download and share invoices as PDFs." />
    </div>
  );
};

export default ViewInvoice;
