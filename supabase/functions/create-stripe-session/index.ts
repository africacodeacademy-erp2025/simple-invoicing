
import { serve } from "std/http/server.ts";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import Stripe from "stripe";
import { corsHeaders } from "../_shared/cors.ts";

// Price ID to Plan mapping
const PRICE_TO_PLAN: { [key: string]: string } = {
  "price_1P6iTmSAy4xK41b12Fvmnj4p": "hobby",
  "price_1P6iULSAy4xK41b1xgmEvxAq": "pro",
  "price_1P6iV6SAy4xK41b1FF3MhG22": "business",
};

const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY"); // Changed to STRIPE_SECRET_KEY
if (!stripeSecretKey) {
  throw new Error("Stripe Secret Key is not set in environment variables."); // Updated error message
}
const stripe = new Stripe(stripeSecretKey, {
  apiVersion: "2025-09-30.clover", // Updated API version as per error message
});

const supabaseAdmin = createClient(
  Deno.env.get("SUPABASE_URL") || "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
);

// Main function handler
serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  try {
    const { price_id } = await req.json();

    const authHeader = req.headers.get("Authorization")!;
    const supabase = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_ANON_KEY") ?? "", { global: { headers: { Authorization: authHeader } } });
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) {
      console.error("Supabase auth.getUser error:", userError);
      throw userError;
    }
    if (!user || !user.id) { // Explicitly check for user.id
      console.error("User or User ID not found after auth.getUser. User object:", user);
      throw new Error("Authenticated user ID is missing.");
    }
    console.log("Supabase Function: User ID from auth.getUser():", user.id);

    const customerId = await getOrCreateStripeCustomer(user, supabaseAdmin);
    const session = await createStripeSession(customerId, price_id, user);

    return new Response(JSON.stringify({ checkout_url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

/**
 * Retrieves or creates a Stripe customer and updates the user's profile.
 * @param user - The authenticated Supabase user.
 * @param supabaseAdmin - The Supabase admin client.
 * @returns The Stripe customer ID.
 */
async function getOrCreateStripeCustomer(user: any, supabaseAdmin: SupabaseClient): Promise<string> {
  console.log("Supabase Function: Entering getOrCreateStripeCustomer. User ID:", user.id);
  const { data: profile } = await supabaseAdmin
    .from("user_profiles")
    .select("stripe_customer_id")
    .eq("user_id", user.id) // Query by user_id column
    .single();

  if (profile?.stripe_customer_id) {
    return profile.stripe_customer_id;
  }

  const existingCustomers = await stripe.customers.list({ email: user.email, limit: 1 });
  let customerId = existingCustomers.data[0]?.id;

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: { supabase_user_id: user.id },
    });
    customerId = customer.id;
  }

  console.log("Supabase Function: Attempting to upsert user_profiles with user_id:", user.id);
  const { error: upsertError } = await supabaseAdmin
    .from("user_profiles")
    .upsert({ user_id: user.id, stripe_customer_id: customerId, email: user.email }, { onConflict: "user_id" }); // Upsert on user_id

  if (upsertError) {
    throw new Error(`Failed to upsert Stripe customer ID: ${upsertError.message}`);
  }

  return customerId;
}

/**
 * Creates a Stripe Checkout Session.
 * @param customerId - The Stripe customer ID.
 * @param priceId - The ID of the Stripe price.
 * @param user - The authenticated Supabase user.
 * @returns The Stripe Checkout Session.
 */
async function createStripeSession(customerId: string, priceId: string, user: any): Promise<Stripe.Checkout.Session> {
  // Stripe success/cancel URLs should point to the frontend application's URL, not the Supabase API URL.
  // A new environment variable, FRONTEND_URL, is introduced for this purpose.
  const frontendUrl = Deno.env.get("FRONTEND_URL");
  console.log("Supabase Function: Retrieved FRONTEND_URL:", frontendUrl); // Logging the frontend URL env var
  if (!frontendUrl || !/^https?:\/\//i.test(frontendUrl)) {
    console.error('Supabase Function: FRONTEND_URL missing/invalid:', frontendUrl);
    throw new Error('FRONTEND_URL environment variable is missing or does not include an explicit scheme (e.g., https://). Please ensure it is set in your Supabase Edge Function secrets.');
  }
  const mode = priceId ? "subscription" : "payment";

  const session = await stripe.checkout.sessions.create({
    mode: mode,
    line_items: [{ price: priceId, quantity: 1 }],
    customer: customerId,
    allow_promotion_codes: true,
    success_url: `${frontendUrl}/app/billing?checkout=success`,
    cancel_url: `${frontendUrl}/app/billing?checkout=cancel`,
    subscription_data: {
      metadata: { supabase_user_id: user.id },
    },
    metadata: {
      supabase_user_id: user.id,
    },
  });

  return session;
}
