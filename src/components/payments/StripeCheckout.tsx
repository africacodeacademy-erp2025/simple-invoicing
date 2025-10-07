import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";

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
      if (!data.url) {
        throw new Error("No URL returned from backend");
      }

      // ✅ Redirect directly to Stripe-hosted Checkout page
      window.location.href = data.url;
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
