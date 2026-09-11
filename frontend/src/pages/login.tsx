import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function LoginPage() {
  const navigate = useNavigate();

  const loggedIn = localStorage.getItem("logged_in") === "true";

  useEffect(() => {
    if (loggedIn) navigate("/");
  }, [loggedIn, navigate]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await fetch("http://localhost:8000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const json = await res.json();

      if (!res.ok) {
        setErrorMsg(json.detail || json.error || "Login failed");
        return;
      }

      setSuccessMsg(json.message || "Logged in!");

      localStorage.setItem("logged_in", "true");
      localStorage.setItem("user_email", email);

      setTimeout(() => navigate("/"), 800);
    } catch (err: any) {
      setErrorMsg(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
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
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes pulseGlow {
          0% { box-shadow: 0 0 20px rgba(0,200,255,0.15); }
          50% { box-shadow: 0 0 35px rgba(0,200,255,0.35); }
          100% { box-shadow: 0 0 20px rgba(0,200,255,0.15); }
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
          border: none;
          background: rgba(0,200,255,0.25);
          border: 1px solid rgba(0,200,255,0.4);
          color: white;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: 0.25s;
        }

        .btn:hover {
          background: rgba(0,200,255,0.35);
          transform: scale(1.05);
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
          <label className="input-label">Email</label>
          <input
            className="input-field"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <label className="input-label">Password</label>
          <input
            className="input-field"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button className="btn" type="submit" disabled={loading}>
            {loading ? "Loading..." : "Login"}
          </button>

          {errorMsg && <div className="msg error">{errorMsg}</div>}
          {successMsg && <div className="msg success">{successMsg}</div>}
        </form>

        <div className="switcher">
          <Link to="/register">Switch to Register</Link>
        </div>
      </div>
    </div>
  );
}
