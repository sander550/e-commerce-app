import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function getErrorMessage(json: any, fallback: string) {
  if (typeof json?.detail === "string") return json.detail;
  if (typeof json?.message === "string") return json.message;
  if (typeof json?.error === "string") return json.error;
  return fallback;
}

export default function Index() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const loggedIn = !!user;

  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchActive, setSearchActive] = useState(false);

  const [cartMessage, setCartMessage] = useState<string | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [rateLimited, setRateLimited] = useState(false);

  const redirectToLogin = () => {
    navigate("/login", {
      replace: true,
      state: { from: "/" },
    });
  };

  const handleRateLimit = () => {
    setRateLimited(true);
    setError(null);
    setCartMessage(null);
  };

  const handleServerError = (status: number) => {
    setError(
      status >= 500
        ? "Something went wrong on the server. Please try again later."
        : `Something went wrong (${status}). Please try again.`
    );

    setCartMessage(null);
  };

  const handleUnexpectedError = (message: string) => {
    setError(message);
    setCartMessage(null);
  };

  useEffect(() => {
    async function load() {
      try {
        const prodRes = await fetch("/api/products/");

        let prodJson: any = {};
        try {
          prodJson = await prodRes.json();
        } catch {
          prodJson = {};
        }

        if (prodRes.status === 401) {
          redirectToLogin();
          return;
        }

        if (prodRes.status === 429) {
          handleRateLimit();
          return;
        }

        if (prodRes.status >= 500) {
          handleServerError(prodRes.status);
          return;
        }

        if (!prodRes.ok) {
          handleUnexpectedError(
            getErrorMessage(
              prodJson,
              `Failed to load products (${prodRes.status})`
            )
          );
          return;
        }

        setProducts(Array.isArray(prodJson) ? prodJson : []);

        const catRes = await fetch("/api/categories/");

        let catJson: any = {};
        try {
          catJson = await catRes.json();
        } catch {
          catJson = {};
        }

        if (catRes.status === 401) {
          redirectToLogin();
          return;
        }

        if (catRes.status === 429) {
          handleRateLimit();
          return;
        }

        if (catRes.status >= 500) {
          handleServerError(catRes.status);
          return;
        }

        if (!catRes.ok) {
          handleUnexpectedError(
            getErrorMessage(
              catJson,
              `Failed to load categories (${catRes.status})`
            )
          );
          return;
        }

        setCategories(
          Array.isArray(catJson.categories) ? catJson.categories : []
        );
      } catch (err) {
        console.error("Load failed:", err);

        handleUnexpectedError(
          "Unable to connect to the server. Please check your connection and try again."
        );
      }
    }

    load();
  }, []);

  async function handleSearch(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key !== "Enter") return;

    const q = e.currentTarget.value.trim();
    if (!q) return;

    try {
      const res = await fetch(
        `/api/search/?q=${encodeURIComponent(q)}`
      );

      let json: any = {};
      try {
        json = await res.json();
      } catch {
        json = {};
      }

      if (res.status === 401) {
        redirectToLogin();
        return;
      }

      if (res.status === 429) {
        handleRateLimit();
        return;
      }

      if (res.status >= 500) {
        handleServerError(res.status);
        return;
      }

      if (!res.ok) {
        handleUnexpectedError(
          getErrorMessage(json, `Search failed (${res.status})`)
        );

        setSearchResults([]);
        setSearchActive(false);
        return;
      }

      const safe = Array.isArray(json) ? json : [];

      setSearchResults(safe);
      setSearchActive(true);
      setError(null);
    } catch (err) {
      console.error("Search failed:", err);

      setSearchResults([]);
      setSearchActive(false);

      handleUnexpectedError(
        "Unable to connect to the server. Please check your connection and try again."
      );
    }
  }

  function clearSearch() {
    setSearchActive(false);
    setSearchResults([]);
    setError(null);
  }

  async function addToCart(productId: number) {
    if (!loggedIn) {
      setCartMessage("Please log in to add items to cart.");

      setTimeout(() => {
        navigate("/login", {
          replace: true,
          state: { from: "/" },
        });
      }, 1000);

      return;
    }

    try {
      const res = await fetch("/api/cart/add", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: productId,
          quantity: 1,
        }),
      });

      let json: any = {};
      try {
        json = await res.json();
      } catch {
        json = {};
      }

      if (res.status === 401) {
        redirectToLogin();
        return;
      }

      if (res.status === 429) {
        handleRateLimit();
        return;
      }

      if (res.status >= 500) {
        handleServerError(res.status);
        return;
      }

      if (!res.ok) {
        setCartMessage(
          getErrorMessage(
            json,
            `Failed to add to cart (${res.status})`
          )
        );

        setTimeout(() => setCartMessage(null), 2000);
        return;
      }

      setCartMessage(
        getErrorMessage(json, "Added to cart!")
      );

      setError(null);

      setTimeout(() => setCartMessage(null), 1500);
    } catch (err) {
      console.error("Add to cart failed:", err);

      handleUnexpectedError(
        "Unable to connect to the server. Please check your connection and try again."
      );
    }
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

  if (error) {
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
            {error}
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
    <div className="index-wrapper">
      <style>{`
        .index-wrapper {
          min-height: 100vh;
          background: linear-gradient(135deg, #050505, #0a0f1a);
          color: #e8e8ff;
          font-family: Inter, Arial, sans-serif;
          padding: 24px;
        }

        .topbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }

        .app-name {
          font-size: 30px;
          font-weight: 700;
          color: #00c8ff;
          cursor: pointer;
          transition: 0.25s;
          text-shadow: 0 0 10px rgba(0,200,255,0.4);
        }

        .app-name:hover {
          transform: scale(1.08);
          color: #7feaff;
        }

        .search-input {
          flex: 1;
          margin-left: 20px;
          margin-right: 20px;
          padding: 12px 16px;
          border-radius: 14px;
          background: rgba(255,255,255,0.12);
          border: none;
          color: white;
          font-size: 15px;
          transition: 0.25s;
        }

        .search-input:focus {
          outline: none;
          background: rgba(255,255,255,0.18);
          transform: scale(1.02);
        }

        .nav-btn {
          padding: 10px 18px;
          background: rgba(255,255,255,0.15);
          border: 1px solid rgba(255,255,255,0.3);
          border-radius: 12px;
          color: white;
          font-weight: 600;
          text-decoration: none;
          margin-left: 10px;
          transition: 0.25s;
        }

        .nav-btn:hover {
          background: rgba(255,255,255,0.25);
          transform: scale(1.05);
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

        .glass {
          background: rgba(15,15,30,0.75);
          border: 1px solid rgba(0,200,255,0.25);
          backdrop-filter: blur(25px);
          border-radius: 18px;
          padding: 20px;
          margin-bottom: 24px;
          animation: fadeIn 0.4s ease;
          box-shadow: 0 0 40px rgba(0,200,255,0.15);
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes popIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }

        .section-title {
          font-size: 22px;
          font-weight: 600;
          margin-bottom: 12px;
          color: #00c8ff;
          text-shadow: 0 0 8px rgba(0,200,255,0.4);
        }

        .category-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
        }

        .category-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 24px;
          gap: 20px;
        }

        .title-wrapper {
          display: flex;
          flex-direction: column;
          gap: 7px;
        }

        .title-accent {
          width: 65px;
          height: 4px;
          border-radius: 20px;
          background: #00c8ff;
          box-shadow: 0 0 15px rgba(0,200,255,0.7);
        }

        .product-count {
          padding: 8px 14px;
          border-radius: 20px;
          background: rgba(0,200,255,0.08);
          border: 1px solid rgba(0,200,255,0.18);
          color: #7feaff;
          font-size: 14px;
          font-weight: 600;
          white-space: nowrap;
        }

        .category-bubble {
          padding: 10px 18px;
          background: rgba(0,200,255,0.15);
          border-radius: 20px;
          border: 1px solid rgba(0,200,255,0.3);
          color: #7feaff;
          font-weight: 600;
          text-decoration: none;
          transition: 0.25s;
          animation: popIn 0.3s ease;
        }

        .category-bubble:hover {
          background: rgba(0,200,255,0.25);
          transform: scale(1.08);
        }

        .product-grid {
          display: grid;
          grid-template-columns: repeat(5, minmax(0, 1fr));
          gap: 18px;
        }

        .product-card {
          min-width: 0;
          min-height: 315px;
          background: linear-gradient(
            145deg,
            rgba(22,28,42,0.90),
            rgba(8,13,23,0.92)
          );
          border: 1px solid rgba(0,200,255,0.16);
          border-radius: 18px;
          padding: 13px;
          color: white;
          transition: 0.3s ease;
          position: relative;
          animation: cardIn 0.5s ease both;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        .product-card:hover {
          transform: translateY(-8px);
          border-color: rgba(0,200,255,0.42);
          box-shadow:
            0 18px 40px rgba(0,0,0,0.35),
            0 0 25px rgba(0,200,255,0.10);
        }

        @keyframes cardIn {
          from {
            opacity: 0;
            transform: translateY(15px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .product-link {
          color: white;
          text-decoration: none;
          display: block;
          flex: 1;
          min-width: 0;
        }

        .product-img-container {
          position: relative;
          width: 100%;
          aspect-ratio: 1 / 1;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 10px;
          overflow: hidden;
          border-radius: 14px;
          background: rgba(255,255,255,0.025);
        }

        .product-img-glow {
          position: absolute;
          width: 75%;
          height: 75%;
          border-radius: 50%;
          background: radial-gradient(
            circle,
            rgba(0,200,255,0.25),
            rgba(0,200,255,0.04) 65%,
            transparent 100%
          );
          filter: none;
          animation: ripple 4s infinite ease-in-out;
        }

        @keyframes ripple {
          0%, 100% {
            transform: scale(0.92);
            opacity: 0.45;
          }

          50% {
            transform: scale(1.08);
            opacity: 0.8;
          }
        }

        .product-img {
          width: 86%;
          height: 86%;
          object-fit: contain;
          z-index: 2;
          transition: 0.35s ease;
        }

        .product-card:hover .product-img {
          transform: scale(1.08) translateY(-3px);
        }

        .stock-badge {
          position: absolute;
          top: 12px;
          left: 12px;
          z-index: 4;
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 700;
          text-shadow: 0 0 3px rgba(0,0,0,0.5);
          backdrop-filter: none;
          border: 1px solid rgba(255,255,255,0.25);
          background: rgba(0,0,0,0.65);
        }

        .stock-good {
          background: rgba(50,220,140,0.18);
          color: #68f0b0;
        }

        .stock-low {
          background: rgba(255,190,50,0.18);
          color: #ffd166;
        }

        .stock-out {
          background: rgba(255,70,70,0.18);
          color: #ff8585;
        }

        .product-name {
          font-size: 16px;
          font-weight: 700;
          line-height: 1.3;
          margin: 4px 2px 7px;
          color: #ffffff;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .product-bottom {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          margin-top: auto;
          padding: 0 2px 2px;
        }

        .product-price {
          color: #7feaff;
          font-size: 17px;
          font-weight: 800;
          text-shadow: 0 0 10px rgba(0,200,255,0.25);
        }

        .product-stock {
          color: #ffdd7f;
          font-size: 13px;
          font-weight: 600;
          opacity: 0.9;
        }

        .card-footer {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 8px;
          padding: 2px 2px 0;
        }

        .add-btn {
          width: 36px;
          height: 36px;
          border-radius: 11px;
          background: rgba(0,200,255,0.13);
          border: 1px solid rgba(0,200,255,0.28);
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          transition: 0.25s;
        }

        .add-btn:hover {
          background: rgba(0,200,255,0.28);
          border-color: rgba(0,200,255,0.55);
          transform: scale(1.08);
          box-shadow: 0 0 15px rgba(0,200,255,0.18);
        }

        .add-btn.disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .add-btn.disabled:hover {
          transform: none;
          box-shadow: none;
        }

        .cart-message {
          margin-top: 10px;
          color: #7feaff;
          font-weight: 600;
          text-align: center;
        }

        .clear-search {
          margin-top: 10px;
          padding: 8px 14px;
          background: rgba(0,200,255,0.15);
          border-radius: 10px;
          cursor: pointer;
          border: 1px solid rgba(0,200,255,0.3);
          color: #7feaff;
          font-weight: 600;
          transition: 0.25s;
          display: inline-block;
        }

        .clear-search:hover {
          background: rgba(0,200,255,0.25);
          transform: scale(1.05);
        }

        @media (max-width: 1000px) {
          .product-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        @media (max-width: 700px) {
          .topbar {
            flex-wrap: wrap;
            gap: 12px;
          }

          .search-input {
            order: 3;
            flex-basis: 100%;
            margin: 0;
          }

          .product-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 450px) {
          .product-grid {
            grid-template-columns: 1fr;
          }

          .index-wrapper {
            padding: 12px;
          }
        }
      `}</style>

      {/* TOP BAR */}
      <div className="topbar">
        <div className="app-name" onClick={() => navigate("/")}>
          AntsShop
        </div>

        <input
          className="search-input"
          placeholder="Search products..."
          onKeyDown={handleSearch}
        />

        {loggedIn ? (
          <>
            <Link to="/cart" className="icon-btn">
              🛒
            </Link>

            <Link to="/orders" className="icon-btn">
              📦
            </Link>

            <Link to="/profile" className="icon-btn">
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

      {/* CART MESSAGE */}
      {cartMessage && (
        <div className="cart-message">
          {cartMessage}
        </div>
      )}

      {/* SEARCH RESULTS */}
      {searchActive && (
        <div className="glass">
          <div className="category-header">
            <div className="title-wrapper">
              <div className="section-title">
                Search Results
              </div>

              <div className="title-accent"></div>
            </div>

            <div className="product-count">
              {searchResults.length}{" "}
              {searchResults.length === 1
                ? "product"
                : "products"}
            </div>
          </div>

          {searchResults.length === 0 && (
            <div style={{ opacity: 0.7 }}>
              No products found.
            </div>
          )}

          <div className="product-grid">
            {searchResults.map((p: any, index: number) => (
              <div
                key={p.id}
                className="product-card"
                style={{
                  animationDelay: `${index * 60}ms`,
                }}
              >
                <Link
                  to={`/product/${p.id}`}
                  className="product-link"
                >
                  <div className="product-img-container">
                    <div className="product-img-glow"></div>

                    <div
                      className={`stock-badge ${
                        p.stock <= 0
                          ? "stock-out"
                          : p.stock <= 5
                          ? "stock-low"
                          : "stock-good"
                      }`}
                    >
                      {p.stock <= 0
                        ? "Out of stock"
                        : p.stock <= 5
                        ? `Only ${p.stock} left`
                        : "In stock"}
                    </div>

                    <img
                      src={
                        p.image_url ||
                        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='600' viewBox='0 0 600 600'%3E%3Crect width='600' height='600' fill='%232f2c2f'/%3E%3Ctext x='50%25' y='50%25' font-size='42' fill='%23fff' text-anchor='middle' dominant-baseline='middle'%3ENo Image%3C/text%3E%3C/svg%3E"
                      }
                      alt={p.name}
                      className="product-img"
                    />
                  </div>

                  <div className="product-bottom">
                    <div className="product-price">
                      ${Number(p.price).toFixed(2)}
                    </div>
                  </div>
                </Link>

                <div className="card-footer">
                  <div className="product-stock">
                    Stock: {p.stock}
                  </div>

                  <button
                    type="button"
                    className={`add-btn ${
                      p.stock <= 0 ? "disabled" : ""
                    }`}
                    disabled={p.stock <= 0}
                    onClick={() => addToCart(p.id)}
                    title={
                      p.stock <= 0
                        ? "Out of stock"
                        : "Add to cart"
                    }
                  >
                    🛒
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div
            className="clear-search"
            onClick={clearSearch}
          >
            Clear Search
          </div>
        </div>
      )}

      {/* NORMAL CONTENT */}
      {!searchActive && (
        <>
          {/* CATEGORIES */}
          <div className="glass">
            <div className="section-title">
              Categories
            </div>

            <div className="category-grid">
              {categories.map((c: any) => (
                <Link
                  key={c.id}
                  to={`/category/${c.id}`}
                  className="category-bubble"
                >
                  {c.name}
                </Link>
              ))}
            </div>
          </div>

          {/* PRODUCTS */}
          <div className="glass">
            <div className="category-header">
              <div className="title-wrapper">
                <div className="section-title">
                  Products
                </div>
              </div>

              <div className="product-count">
                {products.length}{" "}
                {products.length === 1
                  ? "product"
                  : "products"}
              </div>
            </div>

            <div className="product-grid">
              {products.map((p: any, index: number) => (
                <div
                  key={p.id}
                  className="product-card"
                  style={{
                    animationDelay: `${index * 60}ms`,
                  }}
                >
                  <Link
                    to={`/product/${p.id}`}
                    className="product-link"
                  >
                    <div className="product-img-container">
                      <div className="product-img-glow"></div>

                      <div className="stock-badge">
                        {p.stock <= 0
                          ? "Out of stock"
                          : p.stock <= 5
                          ? `Only ${p.stock} left`
                          : "In stock"}
                      </div>

                      <img
                        src={
                          p.image_url ||
                          "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='600' viewBox='0 0 600 600'%3E%3Crect width='600' height='600' fill='%232f2c2f'/%3E%3Ctext x='50%25' y='50%25' font-size='42' fill='%23fff' text-anchor='middle' dominant-baseline='middle'%3ENo Image%3C/text%3E%3C/svg%3E"
                        }
                        alt={p.name}
                        className="product-img"
                      />
                    </div>

                    <div className="product-bottom">
                      <div className="product-price">
                        ${Number(p.price).toFixed(2)}
                      </div>
                    </div>

                    <div className="product-name">
                      {p.name}
                    </div>
                  </Link>

                  <div className="card-footer">
                    <div className="product-stock">
                      Stock: {p.stock}
                    </div>

                    <button
                      type="button"
                      className={`add-btn ${
                        p.stock <= 0 ? "disabled" : ""
                      }`}
                      disabled={p.stock <= 0}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        addToCart(p.id);
                      }}
                      title={
                        p.stock <= 0
                          ? "Out of stock"
                          : "Add to cart"
                      }
                    >
                      🛒
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}