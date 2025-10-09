import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { supabase } from "@/lib/supabase"; // 👈 make sure this points to your Supabase client

// ⚠️ Replace with your own Stripe publishable key
const stripePromise = loadStripe(
  "pk_test_51SF2U2JAL9HWu2UnSLXslUnEFgRO6DMnxBnxwgzQn7CpFgabYAKeMiJk6wLKFJw7revAceK03pUM1jlrAAtgvXnk00aU59Pvjm"
);

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
      // ✅ Get user session from Supabase
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error || !session) {
        throw new Error("User not logged in or no session found");
      }

      // ✅ Call Supabase Edge Function with authorization header
      const response = await fetch(
        "https://oudrqssttfdapvmbxtrx.functions.supabase.co/create-stripe-session",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`, // 👈 send the user's token
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
      if (!data.url) {
        throw new Error("No URL returned from backend");
      }

      // ✅ Redirect to Stripe-hosted Checkout
      window.location.href = data.url;
    } catch (err) {
      console.error("Checkout failed:", err);
      alert("Checkout failed: " + err.message);
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
