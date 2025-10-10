import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function StripeCheckout({ priceId }: { priceId: string }) {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) throw new Error("User not logged in");

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const response = await fetch(
        `${supabaseUrl}/functions/v1/create-stripe-session`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ priceId, mode: "subscription" }),
        }
      );
      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || "Failed to create checkout session");
      }
      const data = await response.json();
      if (!data.url) throw new Error("No checkout URL returned");
      window.location.href = data.url;
    } catch (err) {
      console.error("Checkout failed:", err);
      alert("Checkout failed: " + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleCheckout}
      disabled={loading}
      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
    >
      {loading ? "Redirecting..." : "Subscribe"}
    </button>
  );
}
