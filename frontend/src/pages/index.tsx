import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Index() {
  const navigate = useNavigate();

  const [loggedIn, setLoggedIn] = useState(
    localStorage.getItem("logged_in") === "true"
  );

  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchActive, setSearchActive] = useState(false);

  const [cartMessage, setCartMessage] = useState<string | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setLoggedIn(localStorage.getItem("logged_in") === "true");
    }, 200);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    async function load() {
      try {
        const prodRes = await fetch("http://localhost:8000/products/");
        const prodJson = await prodRes.json();
        setProducts(prodJson);

        const catRes = await fetch("http://localhost:8000/categories/");
        const catJson = await catRes.json();
        setCategories(catJson.categories || []);
      } catch (err) {
        console.error("Load failed:", err);
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
        `http://localhost:8000/search/?q=${encodeURIComponent(q)}`
      );

      if (!res.ok) {
        setSearchResults([]);
        setSearchActive(true);
        return;
      }

      const json = await res.json();
      const safe = Array.isArray(json) ? json : [];

      setSearchResults(safe);
      setSearchActive(true);
    } catch (err) {
      console.error("Search failed:", err);
      setSearchResults([]);
      setSearchActive(true);
    }
  }

  function clearSearch() {
    setSearchActive(false);
    setSearchResults([]);
  }

  async function addToCart(productId: number) {
    if (!loggedIn) {
      setCartMessage("Please log in to add items to cart.");
      setTimeout(() => navigate("/login"), 1500);
      return;
    }

    try {
      const res = await fetch("http://localhost:8000/cart/add", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_id: productId, quantity: 1 }),
      });

      if (!res.ok) {
        setCartMessage("Product out of stock.");
        return;
      }

      setCartMessage("Added to cart!");
      setTimeout(() => setCartMessage(null), 1500);
    } catch {
      setCartMessage("Failed to add to cart.");
    }
  }

  return (
    <div className="index-wrapper">
      <style>{`
        .index-wrapper {
          min-height: 100vh;
          background: linear-gradient(135deg, #050505, #0a0f1a);
          color: #e8e8ff;
          font-family: Inter, sans-serif;
          padding: 24px;
        }

        /* TOP BAR */
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

        /* LOGIN + REGISTER BUTTONS */
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

        /* CART + PROFILE BUTTONS */
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

        /* GLASS BOX */
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

        /* CATEGORY BUBBLES */
        .category-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
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

        /* PRODUCT GRID — ALWAYS 5 PER ROW */
        .product-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 20px;
        }

        .product-card {
          background: rgba(15,15,30,0.75);
          border: 1px solid rgba(0,200,255,0.25);
          border-radius: 14px;
          padding: 14px;
          text-decoration: none;
          color: white;
          transition: 0.25s;
          animation: fadeIn 0.4s ease;
          position: relative;
        }

        .product-card:hover {
          background: rgba(0,200,255,0.15);
          transform: translateY(-6px) scale(1.03);
          box-shadow: 0 0 25px rgba(0,200,255,0.25);
        }

        .product-img {
          width: 100%;
          aspect-ratio: 1 / 1;
          object-fit: contain;
          background: rgba(255,255,255,0.05);
          border-radius: 10px;
          padding: 6px;
          margin-bottom: 10px;
          transition: 0.25s;
        }

        .product-card:hover .product-img {
          transform: scale(1.05);
        }

        .product-name {
          font-weight: 600;
          margin-bottom: 4px;
          color: white; /* FIXED: no more blue/purple */
        }

        .product-price {
          color: #7feaff;
          font-weight: 600;
        }

        .product-stock {
          color: #ffdd7f;
          font-size: 14px;
          opacity: 0.9;
        }

        /* SMALL ADD TO CART BUTTON */
        .add-btn {
          position: absolute;
          bottom: 12px;
          right: 12px;
          padding: 6px 10px;
          background: rgba(0,200,255,0.25);
          border: 1px solid rgba(0,200,255,0.4);
          border-radius: 10px;
          cursor: pointer;
          color: white;
          font-size: 14px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 4px;
          transition: 0.25s;
        }

        .add-btn:hover {
          background: rgba(0,200,255,0.35);
          transform: scale(1.08);
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
        }

        .clear-search:hover {
          background: rgba(0,200,255,0.25);
          transform: scale(1.05);
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
            <Link to="/cart" className="icon-btn">🛒</Link>
            <Link to="/orders" className="icon-btn">📦</Link>
            <Link to="/profile" className="icon-btn">👤</Link>
          </>
        ) : (
          <>
            <Link className="nav-btn" to="/login">Login</Link>
            <Link className="nav-btn" to="/register">Register</Link>
          </>
        )}
      </div>

      {/* CART MESSAGE */}
      {cartMessage && <div className="cart-message">{cartMessage}</div>}

      {/* SEARCH RESULTS */}
      {searchActive && (
        <div className="glass">
          <div className="section-title">Search Results</div>

          {searchResults.length === 0 && (
            <div style={{ opacity: 0.7 }}>No products found.</div>
          )}

          <div className="product-grid">
            {searchResults.map((p: any) => (
              <div key={p.id} className="product-card">
                <Link to={`/product/${p.id}`}>
                  <img src={p.image_url} className="product-img" />
                  <div className="product-name">{p.name}</div>
                  <div className="product-price">${p.price}</div>
                  <div className="product-stock">Stock: {p.stock}</div>
                </Link>

                <div className="add-btn" onClick={() => addToCart(p.id)}>
                  🛒 +
                </div>
              </div>
            ))}
          </div>

          <div className="clear-search" onClick={clearSearch}>
            Clear Search
          </div>
        </div>
      )}

      {/* NORMAL CONTENT */}
      {!searchActive && (
        <>
          {/* CATEGORIES */}
          <div className="glass">
            <div className="section-title">Categories</div>
            <div className="category-grid">
              {categories.map((c: any) => (
                <Link key={c.id} to={`/category/${c.id}`} className="category-bubble">
                  {c.name}
                </Link>
              ))}
            </div>
          </div>

          {/* PRODUCTS */}
          <div className="glass">
            <div className="section-title">Products</div>
            <div className="product-grid">
              {products.map((p: any) => (
                <div key={p.id} className="product-card">
                  <Link to={`/product/${p.id}`}>
                    <img src={p.image_url} className="product-img" />
                    <div className="product-name">{p.name}</div>
                    <div className="product-price">${p.price}</div>
                    <div className="product-stock">Stock: {p.stock}</div>
                  </Link>

                  <div className="add-btn" onClick={() => addToCart(p.id)}>
                    🛒 +
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
