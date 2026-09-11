import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ProfilePage() {
  const navigate = useNavigate();

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const loggedIn = localStorage.getItem("logged_in") === "true";

  useEffect(() => {
    if (!loggedIn) navigate("/login");
  }, [loggedIn, navigate]);

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch("http://localhost:8000/auth/profile", {
          credentials: "include",
        });

        const json = await res.json();

        if (!res.ok) {
          setErrorMsg(json.detail || json.error || "Failed to load profile");
          return;
        }

        setUser(json);
      } catch (err: any) {
        setErrorMsg(err.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  async function handleLogout() {
    try {
      await fetch("http://localhost:8000/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch {}

    localStorage.removeItem("logged_in");
    localStorage.removeItem("user_email");

    navigate("/");
  }

  if (loading) {
    return (
      <div className="profile-wrapper">
        <div className="loading">Loading profile...</div>
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
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* NEW CYBER ANIMATION */
        @keyframes waveMove {
          0% { transform: translateX(-40px); opacity: 0.4; }
          50% { transform: translateX(40px); opacity: 0.8; }
          100% { transform: translateX(-40px); opacity: 0.4; }
        }

        @keyframes floatAvatar {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
          100% { transform: translateY(0px); }
        }

        /* Avatar Container */
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

        /* Profile Card */
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

        /* Buttons */
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
          background: rgba(255, 80, 80, 0.25);
          border: 1px solid rgba(255, 80, 80, 0.4);
        }

        .logout-btn:hover {
          background: rgba(255, 80, 80, 0.35);
          transform: scale(1.05);
        }

        .back-btn {
          background: rgba(0,200,255,0.25);
          border: 1px solid rgba(0,200,255,0.4);
        }

        .back-btn:hover {
          background: rgba(0,200,255,0.35);
          transform: scale(1.05);
        }
      `}</style>

      {/* Neon Avatar */}
      <div className="avatar-container">
        <div className="avatar-wave"></div>
        <div className="avatar-icon">👤</div>
      </div>

      {/* Profile Card */}
      <div className="glass-card">
        <div className="title">Your Profile</div>

        {errorMsg && <div className="info" style={{ color: "red" }}>{errorMsg}</div>}

        {user && (
          <>
            <div className="info"><strong>ID:</strong> {user.id}</div>
            <div className="info"><strong>Email:</strong> {user.email}</div>
            <div className="info"><strong>Active:</strong> {user.is_active.toString()}</div>
            <div className="info"><strong>Created:</strong> {user.created_at}</div>
          </>
        )}

        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>

        <button className="back-btn" onClick={() => navigate("/")}>
          ← Back to Store
        </button>
      </div>
    </div>
  );
}
