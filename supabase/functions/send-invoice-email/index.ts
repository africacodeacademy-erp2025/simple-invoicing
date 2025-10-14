
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
    // --- SUPABASE ADMIN SETUP ---
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // --- AUTHENTICATION ---
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, message: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ success: false, message: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // --- PARSE REQUEST BODY ---
    const { invoiceId, recipientEmail, recipientName, customMessage, ccOwner, autoGenerateMessage } = await req.json();

    if (!invoiceId || !recipientEmail) {
      return new Response(
        JSON.stringify({ success: false, message: "Missing required fields: invoiceId and recipientEmail are required." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // --- GET INVOICE AND PROFILE DATA ---
    const { data: invoice, error: invoiceError } = await supabase
      .from("invoices")
      .select("*")
      .eq("id", invoiceId)
      .eq("user_id", user.id)
      .single();

    if (invoiceError || !invoice) {
      return new Response(
        JSON.stringify({ success: false, message: "Invoice not found or access denied." }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: profile } = await supabase
      .from("user_profiles")
      .select("email")
      .eq("user_id", user.id)
      .single();

    // --- EMAIL CONTENT ---
    const finalMessage = autoGenerateMessage ? generateAutoMessage(invoice, recipientName) : customMessage;
    const htmlContent = generateInvoiceEmailHTML(invoice, finalMessage);

    // --- SENDGRID PAYLOAD ---
    const sendgridApiKey = Deno.env.get("SENDGRID_API_KEY");
    const sendgridFromEmail = Deno.env.get("SENDGRID_FROM_EMAIL");
    
    if (!sendgridApiKey || !sendgridFromEmail) {
      console.error("Missing SendGrid environment variables");
      return new Response(
        JSON.stringify({ success: false, message: "Email service is not configured correctly." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const emailPayload = {
      personalizations: [
        {
          to: [{ email: recipientEmail, name: recipientName }],
          ...(ccOwner && profile?.email && { cc: [{ email: profile.email }] }),
          subject: `Invoice #${invoice.invoice_number} from ${invoice.business_name}`
        }
      ],
      from: { email: sendgridFromEmail, name: invoice.business_name || "Easy Charge Pro" },
      content: [{ type: "text/html", value: htmlContent }],
    };

    // --- SEND EMAIL VIA SENDGRID ---
    const sendgridResponse = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${sendgridApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(emailPayload),
    });

    if (!sendgridResponse.ok) {
      const errorBody = await sendgridResponse.json();
      console.error("SendGrid error:", errorBody);
      return new Response(
        JSON.stringify({ success: false, message: "Failed to send email.", error: errorBody }),
        { status: sendgridResponse.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, message: "Email sent successfully." }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Global error:", error);
    return new Response(
      JSON.stringify({ success: false, message: "Internal Server Error", error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

// --- HELPER FUNCTIONS ---

function generateInvoiceEmailHTML(invoice: any, message: string): string {
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
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f7; }
        .container { max-width: 600px; margin: 20px auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; }
        .header { background: #4f46e5; color: #ffffff; padding: 24px; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; }
        .content { padding: 24px; }
        .message-box { background-color: #f8f9fa; border: 1px solid #e2e8f0; border-radius: 4px; padding: 16px; margin-bottom: 24px; white-space: pre-wrap; }
        .invoice-details, .totals { background: #f8f9fa; padding: 16px; border-radius: 8px; margin-bottom: 24px; }
        .detail-row { display: flex; justify-content: space-between; padding: 8px 0; }
        .line-items h3 { border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; margin-bottom: 16px; }
        .line-item { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e2e8f0; }
        .final-total { font-weight: bold; font-size: 1.2em; color: #4f46e5; border-top: 2px solid #e2e8f0; padding-top: 10px; margin-top: 10px; }
        .footer { margin-top: 24px; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Invoice from ${invoice.business_name}</h1>
        </div>
        <div class="content">
          <div class="message-box">${message.replace(/\n/g, '<br>')}</div>
          <div class="invoice-details">
            <div class="detail-row"><span>Invoice Number:</span><strong>#${invoice.invoice_number}</strong></div>
            <div class="detail-row"><span>Issue Date:</span><strong>${new Date(invoice.issue_date).toLocaleDateString()}</strong></div>
            <div class="detail-row"><span>Due Date:</span><strong>${new Date(invoice.due_date).toLocaleDateString()}</strong></div>
          </div>
          <div class="line-items">
            <h3>Summary</h3>
            ${invoice.line_items.map((item: any) => `
              <div class="line-item">
                <div>
                  <strong>${item.description}</strong><br>
                  <small>Qty: ${item.quantity} × ${formatCurrency(item.rate)}</small>
                </div>
                <div><strong>${formatCurrency(item.amount)}</strong></div>
              </div>
            `).join('')}
          </div>
          <div class="totals">
            <div class="detail-row"><span>Subtotal:</span><span>${formatCurrency(invoice.subtotal)}</span></div>
            ${invoice.discount_rate > 0 ? `<div class="detail-row"><span>Discount (${invoice.discount_rate}%):</span><span>-${formatCurrency(invoice.discount_amount)}</span></div>` : ''}
            ${invoice.tax_rate > 0 ? `<div class="detail-row"><span>Tax (${invoice.tax_rate}%):</span><span>${formatCurrency(invoice.tax_amount)}</span></div>` : ''}
            <div class="detail-row final-total"><span>Total Amount Due:</span><span>${formatCurrency(invoice.total)}</span></div>
          </div>
          ${invoice.notes ? `<div class="notes"><h4>Notes:</h4><p>${invoice.notes}</p></div>` : ''}
        </div>
        <div class="footer">
          <p>Questions? Contact ${invoice.business_name} at ${invoice.business_email}.</p>
          <p>Powered by Easy Charge Pro</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function getCurrencySymbol(currency: string): string {
  // Simple currency symbol mapping
  const symbols: { [key: string]: string } = { 'USD': '$', 'EUR': '€', 'GBP': '£' };
  return symbols[currency] || currency;
}

function generateAutoMessage(invoice: any, recipientName?: string): string {
  const greeting = recipientName ? `Hi ${recipientName},` : `Hi there,`;
  const dueDate = new Date(invoice.due_date).toLocaleDateString();

  return `
${greeting}

Here is the invoice #${invoice.invoice_number} from ${invoice.business_name} for a total of ${getCurrencySymbol(invoice.currency)}${invoice.total.toFixed(2)}.

The payment is due by ${dueDate}.

You can view the invoice attached to this email.

Thank you for your business!

Best,
The ${invoice.business_name} Team
  `.trim();
}
