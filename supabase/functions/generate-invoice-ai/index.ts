
import { serve } from "std/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import OpenAI from "npm:openai";

// Initialize the OpenAI client with the API key from Supabase secrets
const openai = new OpenAI({
  apiKey: Deno.env.get("OPENAI_API_KEY"),
});

serve(async (req) => {
  // This is needed if you're planning to invoke your function from a browser.
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  try {
    const { prompt, businessName, businessEmail, businessPhone, businessAddress } = await req.json();

    const systemPrompt = `
You are a brilliant and highly accurate AI assistant designed to generate professional invoices as structured JSON data. Your task is to meticulously analyze the user's plain text description and convert it into a valid JSON object.

**Constraint Checklist & Output Structure:**
You MUST return ONLY a valid JSON object. Do not include any text, notes, or explanations before or after the JSON.
The JSON object MUST conform to the following structure:
{
  "businessInfo": {
    "name": "string",
    "email": "string",
    "phone": "string",
    "address": "string"
  },
  "clientInfo": {
    "name": "string",
    "email": "string",
    "address": "string"
  },
  "invoiceDetails": {
    "invoiceNumber": "string",
    "issueDate": "string (YYYY-MM-DD)",
    "dueDate": "string (YYYY-MM-DD)",
    "currency": "string (3-letter ISO code, e.g., 'USD', 'EUR')",
    "taxRate": "number (e.g., 10 for 10%)",
    "discountRate": "number (e.g., 5 for 5%)",
    "notes": "string"
  },
  "lineItems": [
    {
      "description": "string",
      "quantity": "number",
      "rate": "number",
      "amount": "number"
    }
  ]
}

**Data Population Rules:**
1.  **businessInfo**:
    *   Use the business information provided in the user prompt. Do not invent business details if they are not provided.
    *   name: ${businessName}
    *   email: ${businessEmail}
    *   phone: ${businessPhone}
    *   address: ${businessAddress}

2.  **clientInfo**:
    *   Extract the client's name, email, and address from the user's description.

3.  **invoiceDetails**:
    *   **invoiceNumber**: If an invoice number is specified, use it. Otherwise, generate a plausible one (e.g., "INV-001").
    *   **issueDate**: Use today's date, ${new Date().toISOString().split('T')[0]}, unless a different date is specified in the prompt.
    *   **dueDate**: Calculate the due date based on the user's prompt (e.g., "due in 30 days", "net 15"). If not specified, set it to 30 days from the issue date.
    *   **currency**: Default to "USD" if not specified.
    *   **taxRate/discountRate**: Extract any tax or discount percentages. If not mentioned, set them to 0.
    *   **notes**: Include any additional notes from the prompt.

4.  **lineItems**:
    *   Identify each distinct service or product.
    *   For each item, extract its description, quantity, and rate.
    *   **amount**: You MUST calculate the amount for each line item by multiplying 'quantity' by 'rate'. This is a required field. For example, if quantity is 3 and rate is 500, the amount must be 1500.

You must be extremely careful to ensure the final output is a single, clean JSON object.
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: `Generate a complete JSON invoice based on this request: "${prompt}"`,
        },
      ],
      max_tokens: 2000,
      temperature: 0.1,
      response_format: { type: "json_object" },
    });

    const responseText = completion.choices[0]?.message?.content;

    if (!responseText) {
      throw new Error("AI returned an empty response.");
    }
    
    const parsedData = JSON.parse(responseText);

    // Post-computation to ensure amount is correct, as AI can make mistakes
    if (parsedData.lineItems && Array.isArray(parsedData.lineItems)) {
      parsedData.lineItems.forEach(item => {
        if (typeof item.quantity === 'number' && typeof item.rate === 'number') {
          item.amount = item.quantity * item.rate;
        }
      });
    }

    return new Response(JSON.stringify({ success: true, data: parsedData }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, message: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
