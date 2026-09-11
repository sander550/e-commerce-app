import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    async function checkAdmin() {
      try {
        const res = await fetch("http://localhost:8000/auth/profile", {
          credentials: "include",
        });

        if (!res.ok) {
          navigate("/index");
          return;
        }

        const user = await res.json();

        if (!user.is_admin) {
          navigate("/index");
          return;
        }

        setIsAdmin(true);
      } catch {
        navigate("/index");
      } finally {
        setLoading(false);
      }
    }

    checkAdmin();
  }, [navigate]);

  if (loading) {
    return (
      <div className="admin-wrapper">
        <style>{`
          .admin-wrapper {
            min-height: 100vh;
            background: linear-gradient(135deg, #050505, #0a0f1a);
            color: #e8e8ff;
            font-family: Inter, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            font-size: 24px;
            font-weight: 700;
            animation: fadeIn 0.6s ease;
          }

          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>
        Checking admin…
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="admin-wrapper">
      <style>{`
        .admin-wrapper {
          min-height: 100vh;
          background: linear-gradient(135deg, #050505, #0a0f1a);
          color: #e8e8ff;
          font-family: Inter, sans-serif;
          padding: 40px;
          animation: fadeIn 0.6s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .glass {
          background: rgba(15,15,30,0.75);
          border: 1px solid rgba(0,200,255,0.25);
          backdrop-filter: blur(25px);
          border-radius: 20px;
          padding: 32px;
          max-width: 600px;
          margin: auto;
          box-shadow: 0 0 40px rgba(0,200,255,0.15);
        }

        .title {
          font-size: 32px;
          font-weight: 700;
          margin-bottom: 25px;
          text-align: center;
          color: #00c8ff;
          text-shadow: 0 0 10px rgba(0,200,255,0.4);
        }

        .nav-btn {
          display: block;
          margin-bottom: 14px;
          padding: 14px 18px;
          border-radius: 14px;
          background: rgba(0,200,255,0.15);
          border: 1px solid rgba(0,200,255,0.3);
          color: white;
          text-decoration: none;
          font-size: 17px;
          font-weight: 600;
          transition: 0.25s;
        }

        .nav-btn:hover {
          background: rgba(0,200,255,0.25);
          transform: scale(1.05);
        }

        .back-btn {
          margin-top: 20px;
          padding: 12px 20px;
          border-radius: 12px;
          background: rgba(255,255,255,0.12);
          border: 1px solid rgba(255,255,255,0.18);
          color: white;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          text-decoration: none;
          display: inline-block;
          transition: 0.25s;
        }

        .back-btn:hover {
          background: rgba(255,255,255,0.22);
          transform: scale(1.05);
        }
      `}</style>

      <div className="glass">
        <div className="title">Admin Dashboard</div>

        <Link className="nav-btn" to="/admin/products">
          🛒 Manage Products
        </Link>

        <Link className="nav-btn" to="/admin/categories">
          📂 Manage Categories
        </Link>

        <Link className="nav-btn" to="/admin/orders">
          📦 View All Orders
        </Link>

        <Link className="nav-btn" to="/admin/users">
          👤 Manage Users
        </Link>

        <Link className="back-btn" to="/index">
          ← Back to Store
        </Link>
      </div>
    </div>
  );
}
