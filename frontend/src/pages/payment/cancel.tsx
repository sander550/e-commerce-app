import { useEffect, useState } from "react";

export default function CancelPage() {
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paymentId = params.get("paymentId");

    // PayPal's cancel_url does not carry our payment id, so there is
    // nothing to update in that case – the payment simply stays PENDING.
    if (!paymentId) {
      setStatus("cancelled");
      return;
    }

    // Relative URL on purpose: nginx proxies /api/ to the backend,
    // so this works on localhost AND on the deployed server.
    fetch(`/api/payment/cancel?payment_id=${encodeURIComponent(paymentId)}`, {
      method: "POST",
      credentials: "include",
    })
      .then((res) => setStatus(res.ok ? "cancelled" : "error"))
      .catch(() => setStatus("error"));
  }, []);

  if (status === "loading") {
    return (
      <div className="cancel-container">
        <div className="spinner"></div>
        <p>Processing cancellation…</p>
      </div>
    );
  }

  if (status === "cancelled") {
    return (
      <div className="cancel-container">
        <h1>Payment Cancelled</h1>
        <p>Your payment was not completed.</p>
        <a href="/cart" className="btn">Return to Cart</a>
      </div>
    );
  }

  return (
    <div className="cancel-container">
      <h1>Error</h1>
      <p>Something went wrong.</p>
    </div>
  );
}
