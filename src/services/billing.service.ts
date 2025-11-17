
import { supabase } from "@/lib/supabase";

export class BillingService {
  static async startCheckout(priceId: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        throw new Error("User must be logged in to start a checkout session.");
    }

    const { data, error } = await supabase.functions.invoke("create-stripe-session", {
      body: { 
        user_id: user.id,
        price_id: priceId 
    },
    });

    if (error) {
      const errorMessage = await error.context.json();
      throw new Error(errorMessage.error);
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
      const errorMessage = await error.context.json();
      throw new Error(errorMessage.error);
    }

    const portalUrl = data.url;
    if (!portalUrl) {
        throw new Error("No portal URL returned from function.");
    }

    window.location.href = portalUrl;
  }
}
