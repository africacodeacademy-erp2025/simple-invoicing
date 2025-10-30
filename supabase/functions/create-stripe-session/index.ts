// ✅ Correct imports for Supabase Edge Functions
import { serve } from "std/http/server.ts";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

// ✅ Initialize Stripe
const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
  apiVersion: "2025-09-30.clover",
});

// ✅ Initialize Supabase Admin client
// Uses service role key so it can verify JWT tokens from clients
const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

// ✅ CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // ✅ Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  // ✅ Only allow POST
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", {
      status: 405,
      headers: corsHeaders,
    });
  }

  try {
    // ✅ Step 1: Check Authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ code: 401, message: "Missing authorization header" }),
        { status: 401, headers: corsHeaders }
      );
    }

    const token = authHeader.replace("Bearer ", "");

    // ✅ Step 2: Validate token with Supabase
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      return new Response(
        JSON.stringify({ code: 401, message: "Unauthorized" }),
        { status: 401, headers: corsHeaders }
      );
    }

    // ✅ Step 3: Parse body for subscription checkout
    const { priceId, mode } = await req.json();

    if (!priceId || typeof priceId !== "string") {
      return new Response(
        JSON.stringify({ error: "Missing priceId (expected a Stripe price_*)" }),
        { status: 400, headers: corsHeaders }
      );
    }
    if (!priceId.startsWith("price_")) {
      return new Response(
        JSON.stringify({ error: "Invalid priceId. Ensure you set a real Stripe price_ ID in your env." }),
        { status: 400, headers: corsHeaders }
      );
    }

    const siteUrl = Deno.env.get("SITE_URL") || "http://localhost:8080";

    // ✅ Ensure Stripe customer exists and persist id on profile
    // Try to find existing customer by email
    const existingCustomers = await stripe.customers.list({ email: user.email || undefined, limit: 1 });
    let customerId = existingCustomers.data[0]?.id;
    if (!customerId) {
      const created = await stripe.customers.create({
        email: user.email || undefined,
        metadata: { supabase_user_id: user.id },
      });
      customerId = created.id;
    }

    // Upsert stripe_customer_id in Supabase
    await supabase
      .from("user_profiles")
      .upsert({ user_id: user.id, stripe_customer_id: customerId, email: user.email || null, updated_at: new Date().toISOString() }, { onConflict: "user_id" });

    // ✅ Create Stripe Checkout Session for subscription
    const session = await stripe.checkout.sessions.create({
      mode: (mode as "subscription" | "payment") || "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      customer: customerId,
      allow_promotion_codes: true,
      success_url: `${siteUrl}/app/billing?checkout=success`,
      cancel_url: `${siteUrl}/app/billing?checkout=cancel`,
      subscription_data: {
        metadata: {
          supabase_user_id: user.id,
        },
      },
      metadata: {
        supabase_user_id: user.id,
      },
    });

    // ✅ Step 5: Return session URL to frontend
    return new Response(
      JSON.stringify({ sessionId: session.id, url: session.url }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("Stripe Error:", err);
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
