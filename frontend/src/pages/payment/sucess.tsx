import { useEffect } from "react";

export default function PaymentSuccessPage() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (token) {
      fetch(`/api/payment/success?token=${token}`, {
        credentials: "include",
      }).then(() => {
        window.location.href = "/orders";
      });
    }
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

      <div className="loader-container">
        <div className="ring"></div>
        <div className="pulse"></div>
        <div className="loading-text">Processing Payment...</div>
      </div>
    </div>
  );
}
