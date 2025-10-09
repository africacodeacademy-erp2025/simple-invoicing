import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@3.2.0";

// Initialize Resend
const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

// Initialize Supabase Admin client
const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

// CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS, GET",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-requested-with",
  "Access-Control-Max-Age": "86400",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  // Only allow POST
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", {
      status: 405,
      headers: corsHeaders,
    });
  }

  try {
    // Check Authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, message: "Missing authorization header" }),
        { status: 401, headers: corsHeaders }
      );
    }

    const token = authHeader.replace("Bearer ", "");

    // Validate token with Supabase
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ success: false, message: "Unauthorized" }),
        { status: 401, headers: corsHeaders }
      );
    }

    // Parse request body
    const { invoiceId, recipientEmail, recipientName, customMessage, ccOwner, autoGenerateMessage } = await req.json();

    if (!invoiceId || !recipientEmail) {
      return new Response(
        JSON.stringify({ success: false, message: "Missing required fields" }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Get invoice data
    const { data: invoice, error: invoiceError } = await supabase
      .from("invoices")
      .select("*")
      .eq("id", invoiceId)
      .eq("user_id", user.id)
      .single();

    if (invoiceError || !invoice) {
      return new Response(
        JSON.stringify({ success: false, message: "Invoice not found" }),
        { status: 404, headers: corsHeaders }
      );
    }

    // Get user profile for owner email
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("email")
      .eq("user_id", user.id)
      .single();

    // Generate HTML email content
    const finalMessage = autoGenerateMessage ? generateAutoMessage(invoice, recipientName) : customMessage;
    const htmlContent = generateInvoiceEmailHTML(invoice, finalMessage);

    // Prepare email recipients (Resend expects strings)
    const to = recipientEmail as string;
    const cc = ccOwner && profile?.email ? (profile.email as string) : undefined;

    // Send email using Resend
    const emailResult = await resend.emails.send({
      from: "Easy Charge Pro <onboarding@resend.dev>",
      to,
      cc,
      subject: `Invoice #${invoice.invoice_number} from ${invoice.business_name}`,
      html: htmlContent,
    });

    if (emailResult.error) {
      console.error("Resend error:", emailResult.error);
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: "Failed to send email", 
          error: emailResult.error.message 
        }),
        { status: 500, headers: corsHeaders }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Email sent successfully",
        emailId: emailResult.data?.id 
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Send invoice email error:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: "Internal server error", 
        error: (error as Error).message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

function generateInvoiceEmailHTML(invoice: any, customMessage?: string): string {
  const currencySymbol = getCurrencySymbol(invoice.currency);
  const formatCurrency = (amount: number) => `${currencySymbol}${amount.toFixed(2)}`;
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Invoice #${invoice.invoice_number}</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; }
        .container { max-width: 800px; margin: 0 auto; background: #fff; }
        .header { background: #f8f9fa; padding: 20px; border-radius: 8px 8px 0 0; }
        .content { padding: 20px; }
        .invoice-details { background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0; }
        .line-items { margin: 20px 0; }
        .line-item { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
        .totals { background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0; }
        .total-row { display: flex; justify-content: space-between; margin: 5px 0; }
        .final-total { font-weight: bold; font-size: 1.2em; color: #2563eb; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Invoice #${invoice.invoice_number}</h1>
          <p><strong>From:</strong> ${invoice.business_name}</p>
          <p><strong>To:</strong> ${invoice.client_name}</p>
        </div>
        
        <div class="content">
          ${customMessage ? `<div class="custom-message"><p><strong>Message:</strong> ${customMessage}</p></div>` : ''}
          
          <div class="invoice-details">
            <p><strong>Issue Date:</strong> ${new Date(invoice.issue_date).toLocaleDateString()}</p>
            <p><strong>Due Date:</strong> ${new Date(invoice.due_date).toLocaleDateString()}</p>
            <p><strong>Currency:</strong> ${invoice.currency}</p>
          </div>

          <div class="line-items">
            <h3>Line Items</h3>
            ${invoice.line_items.map((item: any) => `
              <div class="line-item">
                <div>
                  <strong>${item.description}</strong><br>
                  <small>Qty: ${item.quantity} × ${formatCurrency(item.rate)}</small>
                </div>
                <div>${formatCurrency(item.amount)}</div>
              </div>
            `).join('')}
          </div>

          <div class="totals">
            <div class="total-row">
              <span>Subtotal:</span>
              <span>${formatCurrency(invoice.subtotal)}</span>
            </div>
            ${invoice.discount_rate > 0 ? `
              <div class="total-row">
                <span>Discount (${invoice.discount_rate}%):</span>
                <span>-${formatCurrency(invoice.discount_amount)}</span>
              </div>
            ` : ''}
            ${invoice.tax_rate > 0 ? `
              <div class="total-row">
                <span>Tax (${invoice.tax_rate}%):</span>
                <span>${formatCurrency(invoice.tax_amount)}</span>
              </div>
            ` : ''}
            <div class="total-row final-total">
              <span>Total:</span>
              <span>${formatCurrency(invoice.total)}</span>
            </div>
          </div>

          ${invoice.notes ? `<div class="notes"><p><strong>Notes:</strong> ${invoice.notes}</p></div>` : ''}
        </div>

        <div class="footer">
          <p>This invoice was generated by Easy Charge Pro.</p>
          <p>If you have any questions, please contact ${invoice.business_email}.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function getCurrencySymbol(currency: string): string {
  const symbols: { [key: string]: string } = {
    'USD': '$',
    'EUR': '€',
    'GBP': '£',
    'JPY': '¥',
    'CAD': 'C$',
    'AUD': 'A$',
  };
  return symbols[currency] || currency;
}

function generateAutoMessage(invoice: any, recipientName?: string): string {
  const currencySymbol = getCurrencySymbol(invoice.currency);
  const formatCurrency = (amount: number) => `${currencySymbol}${amount.toFixed(2)}`;
  const dueDate = new Date(invoice.due_date).toLocaleDateString();
  
  const greeting = recipientName ? `Dear ${recipientName},` : `Dear ${invoice.client_name},`;
  
  return `${greeting}

Thank you for your business! Please find attached your invoice #${invoice.invoice_number} for the services provided.

Invoice Details:
• Invoice Number: #${invoice.invoice_number}
• Issue Date: ${new Date(invoice.issue_date).toLocaleDateString()}
• Due Date: ${dueDate}
• Total Amount: ${formatCurrency(invoice.total)}

Payment Instructions:
Please remit payment by ${dueDate}. If you have any questions about this invoice or need to discuss payment arrangements, please don't hesitate to contact us.

Thank you for your prompt attention to this matter.

Best regards,
${invoice.business_name}
${invoice.business_email ? `Email: ${invoice.business_email}` : ''}
${invoice.business_phone ? `Phone: ${invoice.business_phone}` : ''}`;
}
