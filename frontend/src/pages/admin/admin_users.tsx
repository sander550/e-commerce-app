import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function AdminNotImplementedPage() {
  const navigate = useNavigate();

  const { user, loading: authLoading } = useAuth();

  // -------------------------------
  // CHECK ADMIN
  // -------------------------------
  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      navigate("/login", {
        replace: true,
        state: { from: "/admin/not-implemented" },
      });
      return;
    }

    if (!user.is_admin) {
      navigate("/", { replace: true });
    }
  }, [authLoading, user, navigate]);

  // -------------------------------
  // LOADING
  // -------------------------------
  if (authLoading) {
    return (
      <div className="admin-wrapper">
        <div className="loading">Checking admin...</div>

        <style>{`
          .admin-wrapper {
            min-height: 100vh;
            background: linear-gradient(135deg, #050505, #0a0f1a);
            color: #e8e8ff;
            font-family: Inter, sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .loading {
            font-size: 20px;
            color: #00c8ff;
          }
        `}</style>
      </div>
    );
  }

  // Don't render anything while redirecting
  if (!user || !user.is_admin) {
    return null;
  }

  // -------------------------------
  // PAGE
  // -------------------------------
  return (
    <div className="admin-wrapper">
      <style>{`
        .admin-wrapper {
          min-height: 100vh;
          background: linear-gradient(135deg, #050505, #0a0f1a);
          color: #e8e8ff;
          font-family: Inter, sans-serif;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px;
          box-sizing: border-box;
        }

        .glass {
          width: 100%;
          max-width: 650px;
          background: rgba(15, 15, 30, 0.75);
          border: 1px solid rgba(0, 200, 255, 0.25);
          backdrop-filter: blur(25px);
          border-radius: 20px;
          padding: 40px;
          text-align: center;
          box-shadow: 0 0 40px rgba(0, 200, 255, 0.15);
          animation: fadeIn 0.6s ease;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .title {
          font-size: 32px;
          font-weight: 700;
          margin-bottom: 15px;
          color: #00c8ff;
          text-shadow: 0 0 10px rgba(0, 200, 255, 0.4);
        }

        .message {
          font-size: 18px;
          color: rgba(255, 255, 255, 0.75);
          margin-bottom: 30px;
        }

        .back-btn {
          padding: 12px 20px;
          border-radius: 12px;
          background: rgba(0, 200, 255, 0.15);
          border: 1px solid rgba(0, 200, 255, 0.3);
          color: white;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: 0.25s;
        }

        .back-btn:hover {
          background: rgba(0, 200, 255, 0.25);
          transform: scale(1.05);
        }
      `}</style>

      <div className="glass">
        <div className="title">Not Implemented Yet</div>

        <div className="message">
          This admin page is currently under development.
        </div>

        <button
          className="back-btn"
          onClick={() => navigate("/admin")}
        >
          ← Back to Admin Dashboard
        </button>
      </div>
    </div>
  );
}