
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

const stripe = new Stripe(Deno.env.get("STRIPE_API_KEY") as string, {
  apiVersion: "2022-08-01",
});

const supabaseAdmin = createClient(
  Deno.env.get("SUPABASE_URL") || "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
);

// Main function handler
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  try {
    const { price_id } = await req.json();

    const authHeader = req.headers.get("Authorization")!;
    const supabase = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_ANON_KEY") ?? "", { global: { headers: { Authorization: authHeader } } });
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;
    if (!user) throw new Error("User not found.");

    const customerId = await getOrCreateStripeCustomer(user, supabaseAdmin);
    const session = await createStripeSession(customerId, price_id, user);

    return new Response(JSON.stringify({ checkout_url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
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
  const { data: profile } = await supabaseAdmin
    .from("user_profiles")
    .select("stripe_customer_id")
    .eq("id", user.id)
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

  const { error: upsertError } = await supabaseAdmin
    .from("user_profiles")
    .upsert({ id: user.id, stripe_customer_id: customerId, email: user.email }, { onConflict: "id" });

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
  const siteUrl = Deno.env.get("SITE_URL");
  const mode = priceId ? "subscription" : "payment";

  const session = await stripe.checkout.sessions.create({
    mode: mode,
    line_items: [{ price: priceId, quantity: 1 }],
    customer: customerId,
    allow_promotion_codes: true,
    success_url: `${siteUrl}/app/billing?checkout=success`,
    cancel_url: `${siteUrl}/app/billing?checkout=cancel`,
    subscription_data: {
      metadata: { supabase_user_id: user.id },
    },
    metadata: {
      supabase_user_id: user.id,
    },
  });

  return session;
}
