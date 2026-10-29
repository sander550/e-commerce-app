import { useEffect, useState } from "react";

export default function CancelPage() {
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paymentId = params.get("paymentId");

    if (!paymentId) {
      setStatus("error");
      return;
    }

    fetch(`/api/payment/cancel`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ payment_id: Number(paymentId) }),
    })
      .then(() => setStatus("cancelled"))
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
