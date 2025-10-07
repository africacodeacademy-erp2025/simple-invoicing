import { useState } from "react";
import { loadStripe, Stripe } from "@stripe/stripe-js";

// ⚠️ Replace with your own Stripe publishable key
const stripePromise = loadStripe("pk_test_51SF2U2JAL9HWu2UnSLXslUnEFgRO6DMnxBnxwgzQn7CpFgabYAKeMiJk6wLKFJw7revAceK03pUM1jlrAAtgvXnk00aU59Pvjm");

export default function StripeCheckout({
  amount,
  description,
}: {
  amount: number;
  description: string;
}) {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    setLoading(true);

    try {
      // ✅ Call Supabase Edge Function
      const response = await fetch(
        "https://oudrqssttfdapvmbxtrx.functions.supabase.co/create-stripe-session",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ amount, description }),
        }
      );

      if (!response.ok) {
        const text = await response.text();
        console.error("Backend error:", text);
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      if (!data.sessionId) {
        throw new Error("No session ID returned from backend");
      }

      // ✅ Redirect to Stripe Checkout
      const stripe: Stripe | null = await stripePromise;
      if (stripe) {
        const { error } = await stripe.redirectToCheckout({
          sessionId: data.sessionId,
        });
        if (error) console.error("Stripe redirect error:", error.message);
      } else {
        console.error("Stripe failed to initialize");
      }
    } catch (err) {
      console.error("Checkout failed:", err);
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
      {loading ? "Redirecting..." : "Pay with Stripe"}
    </button>
  );
}
