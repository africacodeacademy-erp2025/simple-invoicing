
import { serve } from "std/http/server.ts";
import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";
import { corsHeaders } from '../_shared/cors.ts';

const stripe = new Stripe(Deno.env.get("STRIPE_API_KEY") as string, {
  apiVersion: "2022-08-01",
});

const supabaseAdmin = createClient(
  Deno.env.get("SUPABASE_URL") || "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
);

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  try {
    // Get the user from the authorization header
    const authHeader = req.headers.get("Authorization")!;
    const supabase = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_ANON_KEY") ?? "", { global: { headers: { Authorization: authHeader } } });
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;
    if (!user) throw new Error("User not found.");

    const { data: profile, error: profileError } = await supabaseAdmin
      .from("user_profiles")
      .select("stripe_customer_id")
      .eq("id", user.id)
      .single();

    if (profileError) throw profileError;
    if (!profile || !profile.stripe_customer_id) {
      throw new Error("Stripe customer ID not found for this user.");
    }

    const stripeCustomerId = profile.stripe_customer_id;

    const returnUrl = `${Deno.env.get("SITE_URL")}/app/billing`;

    const { url } = await stripe.billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: returnUrl,
    });

    return new Response(JSON.stringify({ url }), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  }
});
