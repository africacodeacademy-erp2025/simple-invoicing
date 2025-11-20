import { serve } from "std/http/server.ts";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import Stripe from "stripe";
import { corsHeaders } from "../_shared/cors.ts";

// Initialize Stripe client
const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
  apiVersion: "2025-09-30.clover",
  httpClient: Stripe.createFetchHttpClient(),
});

// Function to get user profile and Stripe customer ID
async function getUserProfile(supabase: SupabaseClient) {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError) throw new Error(`Failed to get user: ${userError.message}`);
  if (!user) throw new Error("User not found. Please log in again.");

  const { data: profile, error: profileError } = await supabase
    .from("user_profiles")
    .select("stripe_customer_id")
    .eq("user_id", user.id)
    .single();

  if (profileError) {
    console.error("Error fetching profile:", profileError);
    throw new Error(`Failed to retrieve user profile: ${profileError.message}`);
  }
  if (!profile?.stripe_customer_id) {
    throw new Error("Stripe customer ID not found for this user.");
  }

  return { stripeCustomerId: profile.stripe_customer_id, user };
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  try {
    // Create Supabase client with user's auth token
    const authHeader = req.headers.get("Authorization")!;
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      {
        global: { headers: { Authorization: authHeader } },
        auth: { persistSession: false },
      }
    );

    const { stripeCustomerId } = await getUserProfile(supabase);

    const origin = req.headers.get("Origin");
    const returnUrl = `${origin || Deno.env.get("SITE_URL") || "http://localhost:5173"}/billing?from_stripe=true`;

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: returnUrl,
    });

    return new Response(JSON.stringify({ url: portalSession.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error creating Stripe portal link:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});