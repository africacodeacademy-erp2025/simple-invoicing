import { supabase } from "@/lib/supabase";

export interface EmailInvoiceRequest {
  invoiceId: string;
  recipientEmail: string;
  recipientName?: string;
  customMessage?: string;
  ccOwner?: boolean;
  autoGenerateMessage?: boolean;
  pdfUrl?: string; // URL to the PDF in Supabase Storage
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
        // Try to parse JSON error body for SendGrid-style errors
        let parsed: any = null;
        try {
          parsed = await response.json();
        } catch (e) {
          // fallback to text
        }

        const rawText = parsed ? JSON.stringify(parsed) : await response.text();
        console.error("Email service error:", rawText);

        // Detect duplicate recipient SendGrid error and return a friendly message
        const containsDuplicateError = (() => {
          try {
            const errorsArray = parsed?.error?.errors || parsed?.errors || [];
            if (Array.isArray(errorsArray)) {
              return errorsArray.some((err: any) =>
                typeof err.message === "string" &&
                (err.message.includes("Each email address") || err.message.toLowerCase().includes("duplicate"))
              );
            }

            // Fallback: check raw text
            return typeof rawText === "string" && (rawText.includes("Each email address") || rawText.toLowerCase().includes("duplicate"));
          } catch (e) {
            return false;
          }
        })();

        if (containsDuplicateError) {
          return {
            success: false,
            message: "Duplicate recipient detected: please ensure each recipient email is unique (do not reuse the same address in To, Cc, or Bcc).",
            error: rawText,
          };
        }

        return {
          success: false,
          message: "Failed to send email",
          error: `HTTP ${response.status}: ${rawText}`,
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
        // If backend returned an error payload, detect duplicate recipient error there too
        const errorPayload = result.error || result;
        const errorsArray = errorPayload?.errors || [];
        const duplicateInResult = Array.isArray(errorsArray) && errorsArray.some((err: any) => typeof err.message === 'string' && (err.message.includes('Each email address') || err.message.toLowerCase().includes('duplicate')));

        if (duplicateInResult) {
          return {
            success: false,
            message: "Duplicate recipient detected: please ensure each recipient email is unique (do not reuse the same address in To, Cc, or Bcc).",
            error: JSON.stringify(result.error || result),
          };
        }

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
