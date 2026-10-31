import { useEffect, useState } from "react";

type Status = "processing" | "error";

export default function PaymentSuccessPage() {
  const [status, setStatus] = useState<Status>("processing");
  const [message, setMessage] = useState("Confirming your payment…");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (!token) {
      setStatus("error");
      setMessage("PayPal did not return a payment token.");
      return;
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 30000);
    let cancelled = false;

    (async () => {
      try {
        // Relative URL on purpose: nginx proxies /api/ to the backend,
        // so this works on localhost AND on the deployed server.
        const res = await fetch(
          `/api/payment/success?token=${encodeURIComponent(token)}`,
          {
            method: "GET",
            credentials: "include",
            signal: controller.signal,
          }
        );

        if (cancelled) return;

        if (res.ok) {
          window.location.replace("/orders");
          return;
        }

        if (res.status === 401) {
          setStatus("error");
          setMessage(
            "Your session expired before the payment could be confirmed. Please log in and check your orders."
          );
          return;
        }

        let detail = `Could not confirm the payment (HTTP ${res.status}).`;

        try {
          const body = await res.json();
          if (body?.detail) detail = String(body.detail);
        } catch {
          // Non-JSON error body – keep the generic message.
        }

        setStatus("error");
        setMessage(detail);
      } catch (err) {
        if (cancelled) return;

        console.error("[Payment] capture failed:", err);

        setStatus("error");
        setMessage(
          err instanceof DOMException && err.name === "AbortError"
            ? "The server took too long to confirm the payment. Check your orders before retrying."
            : "Could not reach the server to confirm the payment."
        );
      } finally {
        window.clearTimeout(timeout);
      }
    })();

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, []);

  return (
    <div className="success-wrapper">
      <style>{`
        .success-wrapper {
          min-height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          background: radial-gradient(circle at center, #1e1e2f, #0d0d14);
          color: white;
          font-family: Inter, sans-serif;
          overflow: hidden;
        }

        .loader-container {
          text-align: center;
          animation: fadeIn 0.6s ease;
          padding: 32px;
        }

        .ring {
          width: 140px;
          height: 140px;
          border-radius: 50%;
          border: 6px solid rgba(255,255,255,0.1);
          border-top-color: #4dff8a;
          animation: spin 1.4s linear infinite;
          margin: 0 auto;
          box-shadow: 0 0 25px rgba(77,255,138,0.4);
        }

        .pulse {
          margin-top: 20px;
          width: 12px;
          height: 12px;
          background: #4dff8a;
          border-radius: 50%;
          animation: pulseAnim 1.2s infinite ease-in-out;
          margin-left: auto;
          margin-right: auto;
        }

        .loading-text {
          margin-top: 20px;
          font-size: 22px;
          font-weight: 600;
          letter-spacing: 1px;
          animation: glow 1.5s ease-in-out infinite;
        }

        .error-icon {
          margin: 0 auto;
          width: 90px;
          height: 90px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 48px;
          border: 4px solid rgba(255,110,110,0.6);
          color: #ff6e6e;
          box-shadow: 0 0 25px rgba(255,110,110,0.35);
        }

        .error-title {
          margin: 22px 0 10px;
          font-size: 24px;
          font-weight: 700;
        }

        .error-message {
          max-width: 460px;
          margin: 0 auto;
          line-height: 1.6;
          color: rgba(255,255,255,0.75);
        }

        .actions {
          margin-top: 26px;
          display: flex;
          gap: 14px;
          justify-content: center;
          flex-wrap: wrap;
        }

        .btn {
          padding: 12px 22px;
          border-radius: 10px;
          border: 1px solid rgba(77,255,138,0.5);
          background: rgba(77,255,138,0.12);
          color: #4dff8a;
          text-decoration: none;
          font-weight: 600;
          transition: background 0.2s ease;
        }

        .btn:hover {
          background: rgba(77,255,138,0.22);
        }

        .btn.secondary {
          border-color: rgba(255,255,255,0.25);
          background: rgba(255,255,255,0.06);
          color: white;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @keyframes pulseAnim {
          0% { transform: scale(1); opacity: 0.7; }
          50% { transform: scale(1.8); opacity: 1; }
          100% { transform: scale(1); opacity: 0.7; }
        }

        @keyframes glow {
          0% { opacity: 0.6; }
          50% { opacity: 1; }
          100% { opacity: 0.6; }
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {status === "processing" ? (
        <div className="loader-container">
          <div className="ring"></div>
          <div className="pulse"></div>
          <div className="loading-text">Processing Payment...</div>
        </div>
      ) : (
        <div className="loader-container">
          <div className="error-icon">!</div>
          <h1 className="error-title">Payment not confirmed</h1>
          <p className="error-message">{message}</p>
          <div className="actions">
            <a className="btn" href="/orders">
              View my orders
            </a>
            <a className="btn secondary" href="/cart">
              Back to cart
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
