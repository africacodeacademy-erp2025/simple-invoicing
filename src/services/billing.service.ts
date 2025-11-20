
import { supabase } from "@/lib/supabase";

export class BillingService {
  static async startCheckout(priceId: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        console.error("Client-side: User not found before invoking create-stripe-session.");
        throw new Error("User must be logged in to start a checkout session.");
    }
    console.log("Client-side: Authenticated user object:", user);
    console.log("Client-side: User ID:", user.id);

    const { data, error } = await supabase.functions.invoke("create-stripe-session", {
      body: { 
        user_id: user.id,
        price_id: priceId 
    },
    });

    if (error) {
      let errorMessage = "An unknown error occurred during checkout.";
      if (error.context && typeof error.context.json === 'function') {
        try {
          const errorDetails = await error.context.json();
          errorMessage = errorDetails.error || errorMessage;
        } catch (jsonError) {
          console.error("Failed to parse error context as JSON:", jsonError);
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      throw new Error(errorMessage);
    }

    const checkoutUrl = data.checkout_url;
    if (!checkoutUrl) {
      throw new Error("No checkout URL returned from function.");
    }

    window.location.href = checkoutUrl;
  }

  static async manageSubscription() {
    // No longer needs a user object, as the function will get it from the token.
    const { data, error } = await supabase.functions.invoke("create-portal-link");

    if (error) {
      let errorMessage = "An unknown error occurred during subscription management.";
      if (error.context && typeof error.context.json === 'function') {
        try {
          const errorDetails = await error.context.json();
          errorMessage = errorDetails.error || errorMessage;
        } catch (jsonError) {
          console.error("Failed to parse error context as JSON:", jsonError);
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      throw new Error(errorMessage);
    }

    const portalUrl = data.url;
    if (!portalUrl) {
        throw new Error("No portal URL returned from function.");
    }

    window.location.href = portalUrl;
  }
}
