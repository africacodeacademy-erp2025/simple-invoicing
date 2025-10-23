import { supabase } from "@/lib/supabase";
import { ErrorService } from "./error.service";

export interface EmailServiceResponse {
  success: boolean;
  message: string;
  error?: string;
}

export interface SendInvoiceEmailParams {
  invoiceId: string;
  recipientEmail: string;
  recipientName: string;
  customMessage?: string;
  ccOwner?: boolean;
  autoGenerateMessage?: boolean;
}

export class EmailService {
  /**
   * Send an invoice email.
   * This function is now a placeholder and should not be used directly.
   * The logic has been moved to InvoiceService.sendInvoiceByEmail.
   */
  static async sendInvoiceEmail(
    params: SendInvoiceEmailParams
  ): Promise<EmailServiceResponse> {
    console.warn(
      "EmailService.sendInvoiceEmail is deprecated. Use InvoiceService.sendInvoiceByEmail instead."
    );
    
    // In a real application, you might want to return an error or a specific message.
    return {
      success: false,
      message: "This function is deprecated. Please use the new invoice sending flow.",
    };
  }
}
