import { supabase } from "@/lib/supabase";
import { ErrorService } from "./error.service";
import { InvoiceData } from "@/types/invoice";
import { InvoiceTemplate } from "@/types/templates";

export interface SavedInvoice {
  id: string;
  user_id: string;
  invoice_number: string;
  issue_date: string;
  due_date: string;
  currency: string;
  is_recurring: boolean;
  recurring_interval?: string;
  business_name?: string;
  business_email?: string;
  business_phone?: string;
  business_address?: string;
  business_logo_url?: string;
  client_name?: string;
  client_email?: string;
  client_address?: string;
  bank_name?: string;
  account_number?: string;
  swift_code?: string;
  iban?: string;
  line_items: any[];
  tax_rate: number;
  discount_rate: number;
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total: number;
  notes?: string;
  template: string;
  email_sent_date?: string;
  created_at: string;
  updated_at: string;
}

export interface InvoiceServiceResponse {
  success: boolean;
  data?: SavedInvoice;
  message: string;
  error?: string;
}

export class InvoiceService {
  /**
   * Save an invoice to the database
   */
  static async saveInvoice(
    userId: string,
    invoiceData: InvoiceData,
    template: InvoiceTemplate
  ): Promise<InvoiceServiceResponse> {
    try {
      const invoiceRecord = {
        user_id: userId,
        invoice_number: invoiceData.invoiceNumber,
        issue_date: invoiceData.date,
        due_date: invoiceData.dueDate,
        currency: invoiceData.currency,
        is_recurring: invoiceData.isRecurring,
        recurring_interval: invoiceData.isRecurring
          ? invoiceData.recurringInterval
          : null,
        business_name: invoiceData.businessInfo.name,
        business_email: invoiceData.businessInfo.email,
        business_phone: invoiceData.businessInfo.phone,
        business_address: invoiceData.businessInfo.address,
        business_logo_url:
          typeof invoiceData.businessInfo.logo === "string"
            ? invoiceData.businessInfo.logo
            : null,
        client_name: invoiceData.clientInfo.name,
        client_email: invoiceData.clientInfo.email,
        client_address: invoiceData.clientInfo.address,
        bank_name: invoiceData.bankingInfo.bankName,
        account_number: invoiceData.bankingInfo.accountNumber,
        swift_code: invoiceData.bankingInfo.swiftCode,
        iban: invoiceData.bankingInfo.iban,
        line_items: invoiceData.lineItems,
        tax_rate: invoiceData.taxRate,
        discount_rate: invoiceData.discountRate,
        subtotal: invoiceData.subtotal,
        tax_amount: invoiceData.taxAmount,
        discount_amount: invoiceData.discountAmount,
        total: invoiceData.total,
        notes: invoiceData.notes,
        template: template,
      };

      const { data, error } = await supabase
        .from("invoices")
        .insert(invoiceRecord)
        .select()
        .single();

      if (error) {
        ErrorService.logError("InvoiceService.saveInvoice", error);
        return {
          success: false,
          message: "Failed to save invoice",
          error: error.message,
        };
      }

      return {
        success: true,
        data: data as SavedInvoice,
        message: "Invoice saved successfully",
      };
    } catch (error) {
      ErrorService.logError("InvoiceService.saveInvoice", error);
      return {
        success: false,
        message: "An unexpected error occurred while saving the invoice",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Get all invoices for a user
   */
  static async getInvoices(userId: string): Promise<InvoiceServiceResponse> {
    try {
      const { data, error } = await supabase
        .from("invoices")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) {
        ErrorService.logError("InvoiceService.getInvoices", error);
        return {
          success: false,
          message: "Failed to fetch invoices",
          error: error.message,
        };
      }

      return {
        success: true,
        data: data as SavedInvoice[],
        message: "Invoices fetched successfully",
      };
    } catch (error) {
      ErrorService.logError("InvoiceService.getInvoices", error);
      return {
        success: false,
        message: "An unexpected error occurred while fetching invoices",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Get a specific invoice by ID
   */
  static async getInvoice(invoiceId: string): Promise<InvoiceServiceResponse> {
    try {
      const { data, error } = await supabase
        .from("invoices")
        .select("*")
        .eq("id", invoiceId)
        .single();

      if (error) {
        ErrorService.logError("InvoiceService.getInvoice", error);
        return {
          success: false,
          message: "Failed to fetch invoice",
          error: error.message,
        };
      }

      return {
        success: true,
        data: data as SavedInvoice,
        message: "Invoice fetched successfully",
      };
    } catch (error) {
      ErrorService.logError("InvoiceService.getInvoice", error);
      return {
        success: false,
        message: "An unexpected error occurred while fetching the invoice",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Update an existing invoice
   */
  static async updateInvoice(
    invoiceId: string,
    invoiceData: InvoiceData,
    template: InvoiceTemplate
  ): Promise<InvoiceServiceResponse> {
    try {
      const updateData = {
        invoice_number: invoiceData.invoiceNumber,
        issue_date: invoiceData.date,
        due_date: invoiceData.dueDate,
        currency: invoiceData.currency,
        is_recurring: invoiceData.isRecurring,
        recurring_interval: invoiceData.isRecurring
          ? invoiceData.recurringInterval
          : null,
        business_name: invoiceData.businessInfo.name,
        business_email: invoiceData.businessInfo.email,
        business_phone: invoiceData.businessInfo.phone,
        business_address: invoiceData.businessInfo.address,
        business_logo_url:
          typeof invoiceData.businessInfo.logo === "string"
            ? invoiceData.businessInfo.logo
            : null,
        client_name: invoiceData.clientInfo.name,
        client_email: invoiceData.clientInfo.email,
        client_address: invoiceData.clientInfo.address,
        bank_name: invoiceData.bankingInfo.bankName,
        account_number: invoiceData.bankingInfo.accountNumber,
        swift_code: invoiceData.bankingInfo.swiftCode,
        iban: invoiceData.bankingInfo.iban,
        line_items: invoiceData.lineItems,
        tax_rate: invoiceData.taxRate,
        discount_rate: invoiceData.discountRate,
        subtotal: invoiceData.subtotal,
        tax_amount: invoiceData.taxAmount,
        discount_amount: invoiceData.discountAmount,
        total: invoiceData.total,
        notes: invoiceData.notes,
        template: template,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from("invoices")
        .update(updateData)
        .eq("id", invoiceId)
        .select()
        .single();

      if (error) {
        ErrorService.logError("InvoiceService.updateInvoice", error);
        return {
          success: false,
          message: "Failed to update invoice",
          error: error.message,
        };
      }

      return {
        success: true,
        data: data as SavedInvoice,
        message: "Invoice updated successfully",
      };
    } catch (error) {
      ErrorService.logError("InvoiceService.updateInvoice", error);
      return {
        success: false,
        message: "An unexpected error occurred while updating the invoice",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Delete an invoice
   */
  static async deleteInvoice(
    invoiceId: string
  ): Promise<InvoiceServiceResponse> {
    try {
      const { error } = await supabase
        .from("invoices")
        .delete()
        .eq("id", invoiceId);

      if (error) {
        ErrorService.logError("InvoiceService.deleteInvoice", error);
        return {
          success: false,
          message: "Failed to delete invoice",
          error: error.message,
        };
      }

      return {
        success: true,
        message: "Invoice deleted successfully",
      };
    } catch (error) {
      ErrorService.logError("InvoiceService.deleteInvoice", error);
      return {
        success: false,
        message: "An unexpected error occurred while deleting the invoice",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Update the email sent date for an invoice
   */
  static async updateEmailSentDate(
    invoiceId: string
  ): Promise<InvoiceServiceResponse> {
    try {
      const { data, error } = await supabase
        .from("invoices")
        .update({
          email_sent_date: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", invoiceId)
        .select()
        .single();

      if (error) {
        ErrorService.logError("InvoiceService.updateEmailSentDate", error);
        return {
          success: false,
          message: "Failed to update email sent date",
          error: error.message,
        };
      }

      return {
        success: true,
        data: data as SavedInvoice,
        message: "Email sent date updated successfully",
      };
    } catch (error: any) {
      ErrorService.logError("InvoiceService.updateEmailSentDate", error);
      return {
        success: false,
        message: "An unexpected error occurred",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
}
