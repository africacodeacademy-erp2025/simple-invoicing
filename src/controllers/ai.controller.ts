import { supabase } from "@/lib/supabase";

// Define the structure of the request to the AI function
export interface AIInvoiceRequest {
  prompt: string;
  businessName?: string;
  businessEmail?: string;
  businessPhone?: string;
  businessAddress?: string;
}

// Define the structure of the response from the AI Controller
export interface AIInvoiceResponse {
  success: boolean;
  data?: any;
  message: string;
  error?: string;
}

/**
 * AIController is responsible for handling interactions with the AI-powered backend functions.
 */
export class AIController {
  /**
   * Invokes the 'generate-invoice-ai' Supabase Edge Function to generate invoice data
   * from a plain text description.
   * @param request - The AIInvoiceRequest object containing the user's prompt and business details.
   * @returns A promise that resolves to an AIInvoiceResponse object.
   */
  static async generateInvoiceFromDescription(
    request: AIInvoiceRequest
  ): Promise<AIInvoiceResponse> {
    try {
      // Invoke the Supabase function.
      // The 'data' returned from the function should already be in the format { success, data, message }.
      const { data, error } = await supabase.functions.invoke("generate-invoice-ai", {
        body: request, // Pass the request object directly
      });

      if (error) {
        // This handles network errors or function invocation errors.
        console.error("Error invoking Supabase function:", error);
        return {
          success: false,
          message: "There was a problem communicating with the AI service.",
          error: error.message,
        };
      }

      // The 'data' variable now holds the direct response from our function.
      // We expect it to have a 'success' property.
      if (data.success) {
        return {
          success: true,
          data: data.data, // The actual invoice data is nested inside the 'data' property
          message: "Invoice generated successfully",
        };
      } else {
        // This handles errors returned by the AI function itself (e.g., parsing failed, bad prompt).
        console.error("Error from AI function:", data.message);
        return {
          success: false,
          message: data.message || "An unknown error occurred during AI generation.",
          error: data.message,
        };
      }
    } catch (e: any) {
      // This is a final catch-all for any unexpected errors in the controller logic.
      console.error("Unexpected error in AIController:", e);
      return {
        success: false,
        message: "An unexpected error occurred. Please check the logs.",
        error: e.message,
      };
    }
  }
}
