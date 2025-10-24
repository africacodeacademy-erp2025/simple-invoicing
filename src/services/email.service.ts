import { supabase } from "@/lib/supabase";

export interface EmailInvoiceRequest {
  invoiceId: string;
  recipientEmail: string;
  recipientName?: string;
  customMessage?: string;
  ccOwner?: boolean;
  autoGenerateMessage?: boolean;
}

export interface EmailInvoiceResponse {
  success: boolean;
  message: string;
  error?: string;
}

export class EmailService {
  /**
   * Send an invoice via email using Resend
   */
  static async sendInvoiceEmail(request: EmailInvoiceRequest): Promise<EmailInvoiceResponse> {
    try {
      // Get user session
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session) {
        return {
          success: false,
          message: "User not authenticated",
          error: "Authentication required",
        };
      }

      // Call Supabase Edge Function for sending email
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const response = await fetch(
        `${supabaseUrl}/functions/v1/send-invoice-email`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify(request),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Email service error:", errorText);
        return {
          success: false,
          message: "Failed to send email",
          error: `HTTP ${response.status}: ${errorText}`,
        };
      }

      const result = await response.json();
      
      if (result.success) {
        // Update invoice with email sent date
        await this.updateInvoiceEmailSent(request.invoiceId);
        
        return {
          success: true,
          message: "Invoice sent successfully",
        };
      } else {
        return {
          success: false,
          message: result.message || "Failed to send email",
          error: result.error,
        };
      }
    } catch (error) {
      console.error("Error in EmailService.sendInvoiceEmail:", error);
      return {
        success: false,
        message: "An unexpected error occurred while sending the email",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Update invoice with email sent timestamp
   */
  private static async updateInvoiceEmailSent(invoiceId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from("invoices")
        .update({ email_sent_date: new Date().toISOString() })
        .eq("id", invoiceId);

      if (error) {
        console.error("Error updating invoice email sent date:", error);
      }
    } catch (error) {
      console.error("Error updating invoice email sent date:", error);
    }
  }
}
