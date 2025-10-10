import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "npm:stripe@11.1.0";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
  apiVersion: "2023-10-16",
});

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405, headers: corsHeaders });
  }

  const sig = req.headers.get("Stripe-Signature");
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  if (!sig || !webhookSecret) {
    return new Response("Missing signature or secret", { status: 400, headers: corsHeaders });
  }

  const rawBody = await req.text();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed.", err);
    return new Response("Bad signature", { status: 400, headers: corsHeaders });
  }

  try {
    // Helper: map Stripe price IDs to plans
    const PRICE_TO_PLAN: Record<string, { plan: string; tier: string }> = {
      // Populate from env at runtime
      [(Deno.env.get("STRIPE_PRICE_STARTER_MONTHLY") || "")]: { plan: "free", tier: "starter" },
      [(Deno.env.get("STRIPE_PRICE_PRO_MONTHLY") || "")]: { plan: "pro", tier: "growth" },
      [(Deno.env.get("STRIPE_PRICE_BUSINESS_MONTHLY") || "")]: { plan: "business", tier: "advanced" },
      [(Deno.env.get("STRIPE_PRICE_ENTERPRISE_MONTHLY") || "")]: { plan: "enterprise", tier: "enterprise" },
      // Optional yearly
      [(Deno.env.get("STRIPE_PRICE_PRO_YEARLY") || "")]: { plan: "pro", tier: "growth" },
      [(Deno.env.get("STRIPE_PRICE_BUSINESS_YEARLY") || "")]: { plan: "business", tier: "advanced" },
      [(Deno.env.get("STRIPE_PRICE_ENTERPRISE_YEARLY") || "")]: { plan: "enterprise", tier: "enterprise" },
    };

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode === "subscription") {
          const subscriptionId = (session.subscription as string) || undefined;
          const customerId = (session.customer as string) || undefined;
          const priceId = (session.line_items?.data?.[0]?.price?.id as string) || (session.metadata?.priceId as string) || undefined;
          const supabaseUserId = session.metadata?.supabase_user_id;

          // Fallback: retrieve subscription to get items/price
          let resolvedPriceId = priceId;
          if (!resolvedPriceId && subscriptionId) {
            const subscription = await stripe.subscriptions.retrieve(subscriptionId);
            resolvedPriceId = (subscription.items.data[0]?.price?.id as string) || undefined;
          }

          const planInfo = resolvedPriceId ? PRICE_TO_PLAN[resolvedPriceId] : undefined;

          // Compute current period end
          let currentPeriodEnd: string | null = null;
          if (subscriptionId) {
            const sub = await stripe.subscriptions.retrieve(subscriptionId);
            currentPeriodEnd = sub.current_period_end
              ? new Date(sub.current_period_end * 1000).toISOString()
              : null;
          }

          if (supabaseUserId) {
            await supabase
              .from("user_profiles")
              .upsert(
                {
                  user_id: supabaseUserId,
                  plan: planInfo?.plan || "pro",
                  subscription_status: "active",
                  stripe_customer_id: customerId || null,
                  stripe_subscription_id: subscriptionId || null,
                  current_period_end: currentPeriodEnd,
                  updated_at: new Date().toISOString(),
                },
                { onConflict: "user_id" }
              );
          }
        }
        break;
      }
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        const status = subscription.status;
        const currentPeriodEnd = subscription.current_period_end
          ? new Date(subscription.current_period_end * 1000).toISOString()
          : null;

        // Find user by stripe_customer_id
        const { data: profiles } = await supabase
          .from("user_profiles")
          .select("user_id")
          .eq("stripe_customer_id", customerId)
          .limit(1);

        const userId = profiles?.[0]?.user_id;
        if (userId) {
          await supabase
            .from("user_profiles")
            .update({
              subscription_status: status as string,
              current_period_end: currentPeriodEnd,
              updated_at: new Date().toISOString(),
            })
            .eq("user_id", userId);
        }
        break;
      }
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        const { data: profiles } = await supabase
          .from("user_profiles")
          .select("user_id")
          .eq("stripe_customer_id", customerId)
          .limit(1);

        const userId = profiles?.[0]?.user_id;
        if (userId) {
          await supabase
            .from("user_profiles")
            .update({
              subscription_status: "canceled",
              plan: "free",
              updated_at: new Date().toISOString(),
            })
            .eq("user_id", userId);
        }
        break;
      }
      default:
        break;
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Webhook processing error", e);
    return new Response("Server error", { status: 500, headers: corsHeaders });
  }
});


