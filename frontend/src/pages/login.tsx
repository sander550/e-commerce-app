import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function getErrorMessage(json: any, fallback: string) {
  if (typeof json?.detail === "string") return json.detail;
  if (typeof json?.message === "string") return json.message;
  if (typeof json?.error === "string") return json.error;
  return fallback;
}

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const { user, loading: authLoading, refreshUser } = useAuth();

  const from =
    typeof location.state?.from === "string"
      ? location.state.from
      : "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [rateLimited, setRateLimited] = useState(false);
  const [pageError, setPageError] = useState<string | null>(null);

  /*
   * If AuthContext already knows that the user is logged in,
   * there is no reason to show the login page.
   *
   * We wait until authLoading is finished so that we don't
   * redirect incorrectly while /api/auth/profile is still loading.
   */
  useEffect(() => {
    if (authLoading) return;

    if (user) {
      navigate(from, { replace: true });
    }
  }, [authLoading, user, navigate, from]);

  function handleRateLimit() {
    setRateLimited(true);
    setPageError(null);
    setErrorMsg("");
    setSuccessMsg("");
  }

  function handleServerError(status: number) {
    setPageError(
      status >= 500
        ? "Something went wrong on the server. Please try again later."
        : `Something went wrong (${status}). Please try again.`
    );

    setRateLimited(false);
    setErrorMsg("");
    setSuccessMsg("");
  }

  function handleUnexpectedError() {
    setPageError(
      "Something went wrong. Please check your connection and try again."
    );

    setRateLimited(false);
    setErrorMsg("");
    setSuccessMsg("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");
    setPageError(null);
    setRateLimited(false);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          email,
          password,
        }),
      });

      let json: any = {};

      try {
        json = await res.json();
      } catch {
        json = {};
      }

      /*
       * 429 = rate limited.
       */
      if (res.status === 429) {
        handleRateLimit();
        return;
      }

      /*
       * 500+ = server error.
       */
      if (res.status >= 500) {
        handleServerError(res.status);
        return;
      }

      /*
       * Login 401/400/etc. means the login itself failed.
       * Do NOT redirect to /login because we're already there.
       */
      if (!res.ok) {
        setErrorMsg(
          getErrorMessage(
            json,
            `Login failed (${res.status})`
          )
        );
        return;
      }

      /*
       * Login succeeded.
       *
       * The backend should have set the authentication cookie.
       * refreshUser() now calls /api/auth/profile so AuthContext
       * gets the actual logged-in user.
       */
      await refreshUser();

      setSuccessMsg(json?.message || "Logged in!");

      /*
       * Small delay so the user can see the success message.
       * AuthContext is now the source of truth — no
       * localStorage.logged_in is needed anymore.
       */
      setTimeout(() => {
        navigate(from, { replace: true });
      }, 800);
    } catch (err) {
      console.error("Login fetch error:", err);

      handleUnexpectedError();
    } finally {
      setLoading(false);
    }
  }

  if (authLoading) {
    return (
      <div className="auth-wrapper">
        <style>{`
          .auth-wrapper {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #050505, #0a0f1a);
            font-family: Inter, sans-serif;
            padding: 20px;
          }

          .loading-text {
            color: #00c8ff;
            font-size: 18px;
            text-shadow: 0 0 10px rgba(0,200,255,0.4);
          }
        `}</style>

        <div className="loading-text">
          Checking authentication...
        </div>
      </div>
    );
  }

  if (rateLimited) {
    return (
      <div className="auth-wrapper">
        <style>{`
          .auth-wrapper {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #050505, #0a0f1a);
            font-family: Inter, sans-serif;
            padding: 20px;
          }

          .error-screen {
            width: 100%;
            max-width: 550px;
            padding: 45px;
            border-radius: 20px;
            background: rgba(15,15,30,0.75);
            backdrop-filter: blur(25px);
            border: 1px solid rgba(255,180,0,0.35);
            box-shadow: 0 0 40px rgba(255,180,0,0.12);
            color: white;
            text-align: center;
          }

          .error-icon {
            font-size: 55px;
            margin-bottom: 15px;
          }

          .error-screen h2 {
            color: #ffd166;
            font-size: 30px;
            margin-bottom: 15px;
          }

          .error-screen p {
            color: #d0d0df;
            font-size: 16px;
            line-height: 1.6;
            margin-bottom: 25px;
          }

          .retry-btn {
            padding: 12px 24px;
            border-radius: 12px;
            background: rgba(255,180,0,0.15);
            border: 1px solid rgba(255,180,0,0.35);
            color: white;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: 0.25s;
          }

          .retry-btn:hover {
            background: rgba(255,180,0,0.25);
            transform: scale(1.05);
          }
        `}</style>

        <div className="error-screen">
          <div className="error-icon">⏳</div>

          <h2>Too Many Requests</h2>

          <p>
            You are sending requests too quickly. Please wait a moment and
            try again.
          </p>

          <button
            className="retry-btn"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (pageError) {
    return (
      <div className="auth-wrapper">
        <style>{`
          .auth-wrapper {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #050505, #0a0f1a);
            font-family: Inter, sans-serif;
            padding: 20px;
          }

          .error-screen {
            width: 100%;
            max-width: 550px;
            padding: 45px;
            border-radius: 20px;
            background: rgba(15,15,30,0.75);
            backdrop-filter: blur(25px);
            border: 1px solid rgba(255,80,80,0.35);
            box-shadow: 0 0 40px rgba(255,80,80,0.12);
            color: white;
            text-align: center;
          }

          .error-icon {
            font-size: 55px;
            margin-bottom: 15px;
          }

          .error-screen h2 {
            color: #ff7070;
            font-size: 30px;
            margin-bottom: 15px;
          }

          .error-screen p {
            color: #d0d0df;
            font-size: 16px;
            line-height: 1.6;
            margin-bottom: 25px;
          }

          .retry-btn {
            padding: 12px 24px;
            border-radius: 12px;
            background: rgba(255,80,80,0.15);
            border: 1px solid rgba(255,80,80,0.35);
            color: white;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: 0.25s;
          }

          .retry-btn:hover {
            background: rgba(255,80,80,0.25);
            transform: scale(1.05);
          }
        `}</style>

        <div className="error-screen">
          <div className="error-icon">⚠️</div>

          <h2>Something went wrong</h2>

          <p>{pageError}</p>

          <button
            className="retry-btn"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-wrapper">
      <style>{`
        .auth-wrapper {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #050505, #0a0f1a);
          font-family: Inter, sans-serif;
          padding: 20px;
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

        @keyframes pulseGlow {
          0% {
            box-shadow: 0 0 20px rgba(0,200,255,0.15);
          }
          50% {
            box-shadow: 0 0 35px rgba(0,200,255,0.35);
          }
          100% {
            box-shadow: 0 0 20px rgba(0,200,255,0.15);
          }
        }

        .glass-card {
          width: 100%;
          max-width: 420px;
          padding: 32px;
          border-radius: 20px;
          background: rgba(15, 15, 30, 0.75);
          backdrop-filter: blur(25px);
          border: 1px solid rgba(0, 200, 255, 0.25);
          box-shadow: 0 0 40px rgba(0,200,255,0.15);
          color: white;
          animation: pulseGlow 2.5s infinite ease-in-out;
        }

        .title {
          text-align: center;
          font-size: 30px;
          font-weight: 700;
          margin-bottom: 24px;
          color: #00c8ff;
          text-shadow: 0 0 10px rgba(0,200,255,0.4);
        }

        .input-label {
          display: block;
          margin-bottom: 6px;
          font-size: 14px;
          opacity: 0.9;
        }

        .input-field {
          width: 100%;
          padding: 12px 14px;
          border-radius: 12px;
          border: none;
          outline: none;
          background: rgba(255,255,255,0.12);
          color: white;
          font-size: 15px;
          margin-bottom: 18px;
          transition: 0.25s;
          box-sizing: border-box;
        }

        .input-field:focus {
          background: rgba(0,200,255,0.25);
          border: 1px solid rgba(0,200,255,0.4);
          transform: scale(1.02);
        }

        .btn {
          width: 100%;
          padding: 12px;
          border-radius: 12px;
          border: 1px solid rgba(0,200,255,0.4);
          background: rgba(0,200,255,0.25);
          color: white;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: 0.25s;
        }

        .btn:hover:not(:disabled) {
          background: rgba(0,200,255,0.35);
          transform: scale(1.05);
        }

        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .msg {
          margin-top: 16px;
          padding: 12px;
          border-radius: 10px;
          font-size: 14px;
        }

        .msg.error {
          background: rgba(255, 80, 80, 0.2);
          border: 1px solid rgba(255, 80, 80, 0.4);
        }

        .msg.success {
          background: rgba(80, 255, 120, 0.2);
          border: 1px solid rgba(80, 255, 120, 0.4);
        }

        .switcher {
          margin-top: 20px;
          text-align: center;
        }

        .switcher a {
          color: #7feaff;
          text-decoration: none;
          font-size: 14px;
          transition: 0.25s;
        }

        .switcher a:hover {
          color: #b8f3ff;
          transform: scale(1.05);
        }
      `}</style>

      <div className="glass-card">
        <div className="title">Welcome Back</div>

        <form onSubmit={handleSubmit}>
          <label className="input-label">
            Email
          </label>

          <input
            className="input-field"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label className="input-label">
            Password
          </label>

          <input
            className="input-field"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button
            className="btn"
            type="submit"
            disabled={loading}
          >
            {loading ? "Loading..." : "Login"}
          </button>

          {errorMsg && (
            <div className="msg error">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="msg success">
              {successMsg}
            </div>
          )}
        </form>

        <div className="switcher">
          <Link to="/register">
            Switch to Register
          </Link>
        </div>
      </div>
    </div>
  );
}