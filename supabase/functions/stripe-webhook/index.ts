import { serve } from "std/http/server.ts";
import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";
import { corsHeaders } from "../_shared/cors.ts";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
  apiVersion: "2025-09-30.clover",
});

serve(async (req: Request) => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } }
  );

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders, status: 204 });
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
    event = await stripe.webhooks.constructEventAsync(rawBody, sig, webhookSecret);
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error during signature verification.";
    console.error("Webhook signature verification failed.", errorMessage);
    return new Response("Bad signature", { status: 400, headers: corsHeaders });
  }

  try {
    // Helper: map Stripe price IDs to plans
    // Only include mappings for env vars that are set (non-empty)
    const PRICE_TO_PLAN: Record<string, { plan: string; tier: string }> = {};
    const pStarter = Deno.env.get("STRIPE_PRICE_STARTER_MONTHLY") || "";
    const pProMonthly = Deno.env.get("STRIPE_PRICE_PRO_MONTHLY") || "";
    const pProYearly = Deno.env.get("STRIPE_PRICE_PRO_YEARLY") || "";
    if (pStarter) PRICE_TO_PLAN[pStarter] = { plan: "starter", tier: "starter" };
    if (pProMonthly) PRICE_TO_PLAN[pProMonthly] = { plan: "pro", tier: "growth" };
    if (pProYearly) PRICE_TO_PLAN[pProYearly] = { plan: "pro", tier: "growth" };

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode === "subscription" && session.payment_status === "paid") {
          const subscriptionId = (session.subscription as string) || undefined;
          const customerId = (session.customer as string) || undefined;
          const priceId = (session.line_items?.data?.[0]?.price?.id as string) || (session.metadata?.priceId as string) || undefined;
          let supabaseUserId = session.metadata?.supabase_user_id as string | undefined;
          console.log('Webhook: Received checkout.session.completed for session:', session.id, 'customer:', session.customer);
          console.log('Webhook: Session Metadata:', session.metadata);
          console.log('Webhook: Resolved Price ID:', resolvedPriceId);
          console.log('Webhook: Plan Info:', planInfo);
          console.log('Webhook: Current Period End:', currentPeriodEnd);

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

          // If we didn't receive the supabase user id in the session metadata, try to resolve it from the customer id
          if (!supabaseUserId) {
            try {
              if (customerId) {
                const { data: profilesByCustomer } = await supabase
                  .from("user_profiles")
                  .select("user_id")
                  .eq("stripe_customer_id", customerId)
                  .limit(1);
                const found = profilesByCustomer?.[0]?.user_id;
                if (found) {
                  supabaseUserId = found;
                  console.log('Resolved supabase user id from stripe_customer_id:', supabaseUserId);
                }
              }
            } catch (err) {
              console.error('Error resolving user by stripe_customer_id', err);
            }
          }

          // If still not resolved, try to resolve by customer email (available on session.customer_details)
          if (!supabaseUserId && (session as any).customer_details?.email) {
            try {
              const email = (session as any).customer_details.email as string;
              const { data: profilesByEmail } = await supabase
                .from("user_profiles")
                .select("user_id")
                .eq("email", email)
                .limit(1);
              const foundByEmail = profilesByEmail?.[0]?.user_id;
              if (foundByEmail) {
                supabaseUserId = foundByEmail;
                console.log('Resolved supabase user id from customer email:', supabaseUserId);
              }
            } catch (err) {
              console.error('Error resolving user by customer email', err);
            }
          }

          if (supabaseUserId) {
            const { data: upsertData, error: upsertError } = await supabase
              .from("user_profiles")
              .upsert(
                {
                  user_id: supabaseUserId,
                  plan: planInfo?.plan || "pro",
                  subscription_status: "active", // Explicitly set to active on successful checkout
                  stripe_customer_id: customerId || null,
                  stripe_subscription_id: subscriptionId || null,
                  current_period_end: currentPeriodEnd,
                  updated_at: new Date().toISOString(),
                },
                { onConflict: "user_id" }
              );
            if (upsertError) {
              console.error('Webhook: Error updating user_profiles for user:', supabaseUserId, upsertError);
            } else {
              console.log('Webhook: Successfully updated user_profiles for user:', supabaseUserId, 'plan:', planInfo?.plan || 'pro', 'data:', upsertData);
            }
          } else {
            console.warn('Webhook: Could not resolve supabase user id for session', session.id, 'customer', customerId);
          }
        }
        break;
      }
      case "customer.subscription.created": {
        const subscription = event.data.object as Stripe.Subscription;
        let userId = subscription.metadata?.supabase_user_id as string | undefined;
        const customerId = subscription.customer as string;
        const priceId = subscription.items.data[0]?.price.id;
        const planInfo = priceId ? PRICE_TO_PLAN[priceId] : undefined;
        const status = subscription.status;
        const currentPeriodEnd = subscription.current_period_end
          ? new Date(subscription.current_period_end * 1000).toISOString()
          : null;

        if (!userId) {
          const { data: profiles } = await supabase
            .from("user_profiles")
            .select("user_id")
            .eq("stripe_customer_id", customerId)
            .limit(1);
          userId = profiles?.[0]?.user_id;
        }

        if (userId) {
          const { data: upsertData, error: upsertError } = await supabase
            .from("user_profiles")
            .upsert(
              {
                user_id: userId,
                plan: planInfo?.plan || "pro",
                subscription_status: status === "active" ? "active" : "incomplete_expired",
                stripe_customer_id: customerId,
                stripe_subscription_id: subscription.id,
                current_period_end: currentPeriodEnd,
                updated_at: new Date().toISOString(),
              },
              { onConflict: "user_id" }
            );
          if (upsertError) {
            console.error('Webhook: Error upserting user_profiles for user:', userId, upsertError);
          } else {
            console.log('Webhook: Successfully upserted user_profiles for user:', userId, 'plan:', planInfo?.plan || 'pro', 'status:', status, 'data:', upsertData);
          }
        } else {
          console.warn('Webhook: Could not resolve user id for customer.subscription.created event, customer:', customerId);
        }
        break;
      }
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        let status = subscription.status;
        const currentPeriodEnd = subscription.current_period_end
          ? new Date(subscription.current_period_end * 1000).toISOString()
          : null;
        const priceId = subscription.items.data[0]?.price?.id;
        const planInfo = priceId ? PRICE_TO_PLAN[priceId] : undefined;

        if (subscription.cancel_at_period_end) {
          status = "pending_cancellation";
        }

        // Find user by stripe_customer_id
        const { data: profiles } = await supabase
          .from("user_profiles")
          .select("user_id")
          .eq("stripe_customer_id", customerId)
          .limit(1);

        const userId = profiles?.[0]?.user_id;
        if (userId) {
          const { data: updateData, error: updateError } = await supabase
            .from("user_profiles")
            .update({
              plan: planInfo?.plan || "pro", // Default to 'pro' if planInfo is undefined
              subscription_status: status as string,
              current_period_end: currentPeriodEnd,
              updated_at: new Date().toISOString(),
            })
            .eq("user_id", userId);
          if (updateError) {
            console.error('Webhook: Error updating user_profiles for user:', userId, updateError);
          } else {
            console.log('Webhook: Successfully updated user_profiles for user:', userId, 'plan:', planInfo?.plan || 'pro', 'status:', status, 'data:', updateData);
          }
        } else {
          console.warn('Webhook: Could not resolve user id for customer.subscription.updated event, customer:', customerId);
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
          const { data: updateData, error: updateError } = await supabase
            .from("user_profiles")
            .update({
              subscription_status: "canceled",
              plan: "free",
              updated_at: new Date().toISOString(),
            })
            .eq("user_id", userId);
          if (updateError) {
            console.error('Webhook: Error updating user_profiles for user:', userId, updateError);
          } else {
            console.log('Webhook: Successfully updated user_profiles for user:', userId, 'status: canceled', 'data:', updateData);
          }
        } else {
          console.warn('Webhook: Could not resolve user id for customer.subscription.deleted event, customer:', customerId);
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
  } catch (e: unknown) {
    const errorMessage = e instanceof Error ? e.message : "Unknown error during webhook processing.";
    console.error("Webhook processing error", errorMessage);
    return new Response("Server error", { status: 500, headers: corsHeaders });
  }
});
