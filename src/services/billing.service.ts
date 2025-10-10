import { supabase } from "@/lib/supabase";

export class BillingService {
  static async startCheckout(priceId: string) {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error("Not authenticated");

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const response = await fetch(`${supabaseUrl}/functions/v1/create-stripe-session`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ priceId, mode: "subscription" }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || "Failed to create checkout session");
    }
    const data = await response.json();
    if (!data.url) throw new Error("No checkout URL returned");
    window.location.href = data.url;
  }
}


