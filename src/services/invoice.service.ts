import { supabase } from "@/lib/supabase";
import { ErrorService } from "./error.service";
import { InvoiceData } from "@/types/invoice";
import { InvoiceTemplate } from "@/types/templates";
import { PdfGenerationService } from "./pdf-generator.service";
import { RefObject } from "react";

export interface SavedInvoice {
  id: string;
  user_id: string;
  invoice_number: string;
  issue_date: string;
  due_date: string;
  currency: string;
  business_name: string;
  business_email?: string;
  business_phone?: string;
  business_address?: string;
  business_logo_url?: string;
  client_name: string;
  client_email?: string;
  client_address?: string;
  line_items: any[];
  tax_rate?: number;
  discount_rate?: number;
  notes?: string;
  subtotal: number;
  tax_amount?: number;
  discount_amount?: number;
  total: number;
  template: string;
  is_recurring: boolean;
  recurring_interval?: "weekly" | "monthly" | "quarterly" | "yearly";
  bank_name?: string;
  account_number?: string;
  swift_code?: string;
  iban?: string;
  email_sent_date?: string;
}

export interface ServiceResponse {
  success: boolean;
  data?: any;
  message: string;
  errors?: any;
}

export class InvoiceService {

  static async saveInvoice(userId: string, invoiceData: InvoiceData, template: InvoiceTemplate): Promise<ServiceResponse> {
    try {
      const { data, error } = await supabase
        .from('invoices')
        .insert([
          {
            user_id: userId,
            invoice_number: invoiceData.invoiceNumber,
            issue_date: invoiceData.date,
            due_date: invoiceData.dueDate,
            currency: invoiceData.currency,
            business_name: invoiceData.businessInfo.name,
            business_email: invoiceData.businessInfo.email,
            business_phone: invoiceData.businessInfo.phone,
            business_address: invoiceData.businessInfo.address,
            client_name: invoiceData.clientInfo.name,
            client_email: invoiceData.clientInfo.email,
            client_address: invoiceData.clientInfo.address,
            line_items: invoiceData.lineItems,
            tax_rate: invoiceData.taxRate,
            discount_rate: invoiceData.discountRate,
            notes: invoiceData.notes,
            subtotal: invoiceData.subtotal,
            tax_amount: invoiceData.taxAmount,
            discount_amount: invoiceData.discountAmount,
            total: invoiceData.total,
            template: template,
            is_recurring: invoiceData.isRecurring,
            recurring_interval: invoiceData.recurringInterval,
            bank_name: invoiceData.bankingInfo.bankName,
            account_number: invoiceData.bankingInfo.accountNumber,
            swift_code: invoiceData.bankingInfo.swiftCode,
            iban: invoiceData.bankingInfo.iban,
          },
        ])
        .select();

      if (error) {
        ErrorService.logError("InvoiceService.saveInvoice", error);
        return { success: false, message: "Failed to save invoice", errors: error };
      }

      return { success: true, data: data, message: "Invoice saved successfully" };
    } catch (error) {
      ErrorService.logError("InvoiceService.saveInvoice", error);
      return { success: false, message: "An unexpected error occurred" };
    }
  }

  static async getInvoices(userId: string): Promise<ServiceResponse> {
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('user_id', userId)
        .order('issue_date', { ascending: false });

      if (error) {
        ErrorService.logError("InvoiceService.getInvoices", error);
        return { success: false, message: "Failed to fetch invoices", errors: error };
      }

      return { success: true, data: data, message: "Invoices fetched successfully" };
    } catch (error) {
      ErrorService.logError("InvoiceService.getInvoices", error);
      return { success: false, message: "An unexpected error occurred" };
    }
  }

  static async getInvoice(invoiceId: string): Promise<ServiceResponse> {
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('id', invoiceId)
        .single();

      if (error) {
        ErrorService.logError("InvoiceService.getInvoice", error);
        return { success: false, message: "Failed to fetch invoice", errors: error };
      }

      return { success: true, data: data, message: "Invoice fetched successfully" };
    } catch (error) {
      ErrorService.logError("InvoiceService.getInvoice", error);
      return { success: false, message: "An unexpected error occurred" };
    }
  }

  static async updateInvoice(invoiceId: string, invoiceData: InvoiceData, template: InvoiceTemplate): Promise<ServiceResponse> {
    try {
      const { data, error } = await supabase
        .from('invoices')
        .update({
          invoice_number: invoiceData.invoiceNumber,
          issue_date: invoiceData.date,
          due_date: invoiceData.dueDate,
          currency: invoiceData.currency,
          business_name: invoiceData.businessInfo.name,
          business_email: invoiceData.businessInfo.email,
          business_phone: invoiceData.businessInfo.phone,
          business_address: invoiceData.businessInfo.address,
          client_name: invoiceData.clientInfo.name,
          client_email: invoiceData.clientInfo.email,
          client_address: invoiceData.clientInfo.address,
          line_items: invoiceData.lineItems,
          tax_rate: invoiceData.taxRate,
          discount_rate: invoiceData.discountRate,
          notes: invoiceData.notes,
          subtotal: invoiceData.subtotal,
          tax_amount: invoiceData.taxAmount,
          discount_amount: invoiceData.discountAmount,
          total: invoiceData.total,
          template: template,
          is_recurring: invoiceData.isRecurring,
          recurring_interval: invoiceData.recurringInterval,
          bank_name: invoiceData.bankingInfo.bankName,
          account_number: invoiceData.bankingInfo.accountNumber,
          swift_code: invoiceData.bankingInfo.swiftCode,
          iban: invoiceData.bankingInfo.iban,
        })
        .eq('id', invoiceId)
        .select();

      if (error) {
        ErrorService.logError("InvoiceService.updateInvoice", error);
        return { success: false, message: "Failed to update invoice", errors: error };
      }

      return { success: true, data: data, message: "Invoice updated successfully" };
    } catch (error) {
      ErrorService.logError("InvoiceService.updateInvoice", error);
      return { success: false, message: "An unexpected error occurred" };
    }
  }

  static async deleteInvoice(invoiceId: string): Promise<ServiceResponse> {
    try {
      const { error } = await supabase.from('invoices').delete().eq('id', invoiceId);

      if (error) {
        ErrorService.logError("InvoiceService.deleteInvoice", error);
        return { success: false, message: "Failed to delete invoice", errors: error };
      }

      return { success: true, message: "Invoice deleted successfully" };
    } catch (error) {
      ErrorService.logError("InvoiceService.deleteInvoice", error);
      return { success: false, message: "An unexpected error occurred" };
    }
  }

  static async sendInvoiceByEmail(
    invoice: SavedInvoice,
    componentRef: RefObject<HTMLDivElement>,
    emailData: { recipientEmail: string; recipientName: string; customMessage: string; ccOwner: boolean; autoGenerateMessage: boolean; }
  ): Promise<ServiceResponse> {
    try {
      // Step 1: Generate PDF from component
      const pdfBlob = await PdfGenerationService.generatePdfFromComponent(componentRef, invoice as any);
      if (!pdfBlob) {
        return { success: false, message: "Failed to generate PDF for the invoice" };
      }

      // Step 2: Upload PDF to Supabase Storage
      const pdfPath = `invoice-pdfs/${invoice.id}.pdf`;
      const { error: uploadError } = await supabase.storage
        .from('invoices')
        .upload(pdfPath, pdfBlob, { contentType: "application/pdf", upsert: true });

      if (uploadError) {
        ErrorService.logError("InvoiceService.sendInvoiceByEmail - PDF Upload", uploadError);
        return { success: false, message: "Failed to upload invoice PDF to storage", errors: uploadError };
      }

      // Step 3: Invoke the Edge Function to send the email
      const { data: functionResponse, error: functionError } = await supabase.functions.invoke("send-invoice-email", {
        body: {
          ...emailData,
          invoiceId: invoice.id,
          pdfPath: pdfPath, // Pass the path to the uploaded PDF
        },
      });

      if (functionError) {
        ErrorService.logError("InvoiceService.sendInvoiceByEmail - Function Invocation", functionError);
        return { success: false, message: "Failed to invoke email sending function.", errors: functionError };
      }
      
      if (!functionResponse.success) {
         ErrorService.logError("InvoiceService.sendInvoiceByEmail - Function Error", functionResponse);
         return { success: false, message: functionResponse.message || "The email function returned an error.", errors: functionResponse.error };
      }

      // Step 4: Update the email_sent_date on the invoice
      return this.updateEmailSentDate(invoice.id);

    } catch (error) {
      ErrorService.logError("InvoiceService.sendInvoiceByEmail", error);
      return { success: false, message: "An unexpected error occurred while sending the invoice email", errors: error };
    }
  }

  static async updateEmailSentDate(invoiceId: string): Promise<ServiceResponse> {
    try {
      const { data, error } = await supabase
        .from('invoices')
        .update({ email_sent_date: new Date().toISOString() })
        .eq('id', invoiceId)
        .select();

      if (error) {
        ErrorService.logError("InvoiceService.updateEmailSentDate", error);
        return { success: false, message: "Failed to update email sent date", errors: error };
      }

      return { success: true, data, message: "Email sent date updated successfully" };
    } catch (error) {
      ErrorService.logError("InvoiceService.updateEmailSentDate", error);
      return { success: false, message: "An unexpected error occurred" };
    }
  }
}
