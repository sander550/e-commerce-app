import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Header() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="header">
      <style>{`
        .header {
          width: 100%;
          padding: 16px 24px;
          background: rgba(15,15,30,0.8);
          backdrop-filter: blur(15px);
          border-bottom: 1px solid rgba(0,200,255,0.2);
          box-shadow: 0 4px 30px rgba(0,0,0,0.3);
        }

        .header-content {
          max-width: 1400px;
          margin: 0 auto;
          display: flex;
          justify-content: flex-end;
          align-items: center;
          gap: 12px;
        }

        .icon-btn {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          background: rgba(0,200,255,0.15);
          border: 1px solid rgba(0,200,255,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          cursor: pointer;
          transition: 0.25s;
          text-decoration: none;
          color: white;
        }

        .icon-btn:hover {
          transform: scale(1.12);
          background: rgba(0,200,255,0.25);
        }

        .nav-btn {
          padding: 10px 18px;
          background: rgba(255,255,255,0.15);
          border: 1px solid rgba(255,255,255,0.3);
          border-radius: 12px;
          color: white;
          font-weight: 600;
          text-decoration: none;
          transition: 0.25s;
        }

        .nav-btn:hover {
          background: rgba(255,255,255,0.25);
          transform: scale(1.05);
        }
      `}</style>

      <div className="header-content">
        {user ? (
          <>
            <Link to="/cart" className="icon-btn" title="Cart">
              🛒
            </Link>
            <Link to="/orders" className="icon-btn" title="Orders">
              📦
            </Link>
            <Link to="/profile" className="icon-btn" title="Profile">
              👤
            </Link>
          </>
        ) : (
          <>
            <Link className="nav-btn" to="/login">
              Login
            </Link>
            <Link className="nav-btn" to="/register">
              Register
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
