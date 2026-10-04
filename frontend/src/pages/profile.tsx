import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProfilePage() {
  const navigate = useNavigate();

  const {
    user,
    loading: authLoading,
    logout,
  } = useAuth();

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [rateLimited, setRateLimited] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login", {
        replace: true,
        state: { from: "/profile" },
      });
    }
  }, [authLoading, user, navigate]);

  async function handleLogout() {
    setLoggingOut(true);
    setErrorMsg(null);
    setRateLimited(false);

    try {
      await logout();

      navigate("/", {
        replace: true,
      });
    } catch (err) {
      console.error("Logout error:", err);

      setErrorMsg(
        "Unable to log out properly. Please try again."
      );

      setLoggingOut(false);
    }
  }

  if (authLoading || !user) {
    return (
      <div className="profile-wrapper">
        <div className="loading">
          Loading profile...
        </div>

        <style>{`
          .profile-wrapper {
            min-height: 100vh;
            background: linear-gradient(135deg, #050505, #0a0f1a);
            color: #e8e8ff;
            font-family: Inter, sans-serif;
            padding: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .loading {
            font-size: 20px;
            color: #7feaff;
          }
        `}</style>
      </div>
    );
  }

  if (rateLimited) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #050505, #0a0f1a)",
          color: "#e8e8ff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
          fontFamily: "Inter, sans-serif",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "520px",
            background: "rgba(15,15,30,0.85)",
            border: "1px solid rgba(255,170,0,0.35)",
            borderRadius: "18px",
            padding: "36px",
            textAlign: "center",
            boxShadow: "0 0 40px rgba(255,170,0,0.12)",
          }}
        >
          <div
            style={{
              fontSize: "48px",
              marginBottom: "16px",
            }}
          >
            ⏳
          </div>

          <h1
            style={{
              margin: "0 0 12px",
              color: "#ffdd7f",
              fontSize: "28px",
            }}
          >
            Too Many Requests
          </h1>

          <p
            style={{
              margin: "0 0 24px",
              opacity: 0.8,
              lineHeight: 1.6,
            }}
          >
            You are sending requests too quickly. Please wait a moment and
            try again.
          </p>

          <button
            onClick={() => window.location.reload()}
            style={{
              padding: "11px 20px",
              borderRadius: "12px",
              border: "1px solid rgba(0,200,255,0.4)",
              background: "rgba(0,200,255,0.2)",
              color: "white",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: "15px",
            }}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #050505, #0a0f1a)",
          color: "#e8e8ff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
          fontFamily: "Inter, sans-serif",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "520px",
            background: "rgba(15,15,30,0.85)",
            border: "1px solid rgba(255,80,80,0.3)",
            borderRadius: "18px",
            padding: "36px",
            textAlign: "center",
            boxShadow: "0 0 40px rgba(255,80,80,0.1)",
          }}
        >
          <div
            style={{
              fontSize: "48px",
              marginBottom: "16px",
            }}
          >
            ⚠️
          </div>

          <h1
            style={{
              margin: "0 0 12px",
              color: "#ff8a8a",
              fontSize: "28px",
            }}
          >
            Something went wrong
          </h1>

          <p
            style={{
              margin: "0 0 24px",
              opacity: 0.8,
              lineHeight: 1.6,
            }}
          >
            {errorMsg}
          </p>

          <button
            onClick={() => window.location.reload()}
            style={{
              padding: "11px 20px",
              borderRadius: "12px",
              border: "1px solid rgba(0,200,255,0.4)",
              background: "rgba(0,200,255,0.2)",
              color: "white",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: "15px",
            }}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-wrapper">
      <style>{`
        .profile-wrapper {
          min-height: 100vh;
          background: linear-gradient(135deg, #050505, #0a0f1a);
          color: #e8e8ff;
          font-family: Inter, sans-serif;
          padding: 40px;
          display: flex;
          flex-direction: column;
          align-items: center;
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

        @keyframes waveMove {
          0% {
            transform: translateX(-40px);
            opacity: 0.4;
          }

          50% {
            transform: translateX(40px);
            opacity: 0.8;
          }

          100% {
            transform: translateX(-40px);
            opacity: 0.4;
          }
        }

        @keyframes floatAvatar {
          0% {
            transform: translateY(0px);
          }

          50% {
            transform: translateY(-8px);
          }

          100% {
            transform: translateY(0px);
          }
        }

        .avatar-container {
          position: relative;
          width: 180px;
          height: 180px;
          margin-bottom: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .avatar-wave {
          position: absolute;
          width: 180px;
          height: 180px;
          border-radius: 50%;
          background: radial-gradient(
            circle,
            rgba(0,200,255,0.25) 0%,
            rgba(0,200,255,0.05) 70%,
            transparent 100%
          );
          animation: waveMove 3.5s infinite ease-in-out;
          filter: blur(12px);
        }

        .avatar-icon {
          font-size: 80px;
          color: #7feaff;
          text-shadow: 0 0 15px rgba(0,200,255,0.6);
          animation: floatAvatar 3s infinite ease-in-out;
          z-index: 2;
        }

        .glass-card {
          width: 100%;
          max-width: 520px;
          padding: 32px;
          border-radius: 20px;
          background: rgba(15, 15, 30, 0.75);
          backdrop-filter: blur(25px);
          border: 1px solid rgba(0,200,255,0.25);
          box-shadow: 0 0 40px rgba(0,200,255,0.15);
          text-align: center;
          box-sizing: border-box;
        }

        .title {
          font-size: 30px;
          font-weight: 700;
          margin-bottom: 20px;
          color: #00c8ff;
          text-shadow: 0 0 10px rgba(0,200,255,0.4);
        }

        .info {
          font-size: 18px;
          margin-bottom: 10px;
        }

        .logout-btn,
        .back-btn {
          margin-top: 20px;
          padding: 12px 20px;
          border-radius: 12px;
          border: none;
          color: white;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: 0.25s;
        }

        .logout-btn {
          background: rgba(255,80,80,0.25);
          border: 1px solid rgba(255,80,80,0.4);
        }

        .logout-btn:hover:not(:disabled) {
          background: rgba(255,80,80,0.35);
          transform: scale(1.05);
        }

        .logout-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .back-btn {
          background: rgba(0,200,255,0.25);
          border: 1px solid rgba(0,200,255,0.4);
        }

        .back-btn:hover {
          background: rgba(0,200,255,0.35);
          transform: scale(1.05);
        }

        @media (max-width: 600px) {
          .profile-wrapper {
            padding: 20px;
          }

          .glass-card {
            padding: 24px;
          }
        }
      `}</style>

      <div className="avatar-container">
        <div className="avatar-wave"></div>
        <div className="avatar-icon">👤</div>
      </div>

      <div className="glass-card">
        <div className="title">
          Your Profile
        </div>

        <div className="info">
          <strong>ID:</strong> {user.id}
        </div>

        <div className="info">
          <strong>Email:</strong> {user.email}
        </div>

        <div className="info">
          <strong>Active:</strong>{" "}
          {user.is_active?.toString()}
        </div>

        <div className="info">
          <strong>Created:</strong> {user.created_at}
        </div>

        <button
          className="logout-btn"
          onClick={handleLogout}
          disabled={loggingOut}
        >
          {loggingOut ? "Logging out..." : "Logout"}
        </button>

        <button
          className="back-btn"
          onClick={() => navigate("/")}
        >
          ← Back to Store
        </button>
      </div>
    </div>
  );
}
