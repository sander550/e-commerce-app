
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Header() {
  const { user } = useAuth();

  return (
    <div className="header">
      <style>{`
        .header {
          width: 100%;
          padding: 14px 28px;
          background: #0f0f1e;
          border-bottom: 1px solid rgba(0,200,255,0.15);
          box-shadow: none;
        }

        .header-content {
          max-width: 1400px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
        }

        .app-name {
          font-size: 20px;
          font-weight: 700;
          color: #00c8ff;
          cursor: pointer;
          transition: 0.25s;
          text-decoration: none;
          text-shadow: none;
          white-space: nowrap;
          margin-right: auto;
        }

        .app-name:hover {
          transform: scale(1.05);
          color: #7feaff;
        }

        .icon-btn {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: rgba(0,200,255,0.12);
          border: 1px solid rgba(0,200,255,0.25);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          cursor: pointer;
          transition: 0.25s;
          text-decoration: none;
          color: white;
        }

        .icon-btn:hover {
          transform: scale(1.08);
          background: rgba(0,200,255,0.22);
          border-color: rgba(0,200,255,0.4);
        }

        .nav-btn {
          padding: 8px 14px;
          background: rgba(255,255,255,0.12);
          border: 1px solid rgba(255,255,255,0.25);
          border-radius: 10px;
          color: white;
          font-weight: 600;
          text-decoration: none;
          transition: 0.25s;
          font-size: 14px;
        }

        .nav-btn:hover {
          background: rgba(255,255,255,0.22);
          transform: scale(1.03);
        }
      `}</style>

      <div className="header-content">
        {/* App name/logo on the left - clickable to reload index page */}
        <Link to="/index" className="app-name">
          Temu 2.0
        </Link>

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
