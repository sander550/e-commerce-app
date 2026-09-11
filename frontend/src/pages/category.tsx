import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";

type ProductDTO = {
  id: number;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  category_id: number;
  image_url: string | null;
  is_active: boolean;
};

type CategoryDTO = {
  id: number;
  name: string;
};

export default function CategoryPage() {
  const { category_id } = useParams();
  const navigate = useNavigate();

  const [products, setProducts] = useState<ProductDTO[]>([]);
  const [categoryName, setCategoryName] = useState<string>("");

  const [errorMsg, setErrorMsg] = useState<string>("");
  const [cartMessage, setCartMessage] = useState<string | null>(null);

  const [loggedIn, setLoggedIn] = useState(
    localStorage.getItem("logged_in") === "true"
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setLoggedIn(localStorage.getItem("logged_in") === "true");
    }, 200);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    async function loadProducts() {
      setErrorMsg("");

      try {
        const res = await fetch(
          `http://localhost:8000/products/category/${category_id}`
        );
        const json = await res.json();

        if (!res.ok) {
          setErrorMsg(json.detail || "Failed to load category products");
          return;
        }

        setProducts(json);
      } catch (err: any) {
        setErrorMsg(err.message || "Failed to load category products");
      }
    }

    async function loadCategoryName() {
      try {
        const res = await fetch(`http://localhost:8000/categories/${category_id}`);
        const json: CategoryDTO = await res.json();

        if (res.ok && json.name) {
          setCategoryName(json.name);
        } else {
          setCategoryName(`Category ${category_id}`);
        }
      } catch {
        setCategoryName(`Category ${category_id}`);
      }
    }

    loadProducts();
    loadCategoryName();
  }, [category_id]);

  async function addToCart(productId: number, stock: number) {
    if (stock <= 0) {
      setCartMessage("Out of stock");
      setTimeout(() => setCartMessage(null), 1500);
      return;
    }

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
        setCartMessage("Failed to add to cart.");
        setTimeout(() => setCartMessage(null), 1500);
        return;
      }

      setCartMessage("Added to cart!");
      setTimeout(() => setCartMessage(null), 1500);
    } catch {
      setCartMessage("Failed to add to cart.");
      setTimeout(() => setCartMessage(null), 1500);
    }
  }

  if (errorMsg) {
    return (
      <div className="category-wrapper">
        <div className="glass">
          <h2>Error</h2>
          <p>{errorMsg}</p>
          <Link to="/index" className="back-btn">← Back to Store</Link>
        </div>
      </div>
    );
  }

  if (!products.length) {
    return (
      <div className="category-wrapper">
        <div className="glass">
          <h2>No products found in this category</h2>
          <Link to="/index" className="back-btn">← Back to Store</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="category-wrapper">
      <style>{`
        .category-wrapper {
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

        /* TOP BAR */
        .topbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
        }

        .topbar-right {
          display: flex;
          align-items: center;
          gap: 12px;
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
          border-radius: 20px;
          padding: 28px;
          max-width: 1100px;
          margin: auto;
          box-shadow: 0 0 40px rgba(0,200,255,0.15);
        }

        .title {
          font-size: 34px;
          font-weight: 700;
          margin-bottom: 25px;
          color: #00c8ff;
          text-shadow: 0 0 12px rgba(0,200,255,0.5);
          text-align: center;
        }

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
          position: relative;
          animation: fadeIn 0.4s ease;
        }

        .product-card:hover {
          background: rgba(0,200,255,0.15);
          transform: translateY(-6px) scale(1.03);
          box-shadow: 0 0 25px rgba(0,200,255,0.25);
        }

        .product-img-container {
          position: relative;
          width: 100%;
          aspect-ratio: 1 / 1;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 10px;
        }

        .product-img-glow {
          position: absolute;
          width: 85%;
          height: 85%;
          border-radius: 50%;
          background: radial-gradient(
            circle,
            rgba(0,200,255,0.25) 0%,
            rgba(0,200,255,0.05) 70%,
            transparent 100%
          );
          filter: blur(12px);
          animation: ripple 3.5s infinite ease-in-out;
        }

        @keyframes ripple {
          0% { transform: scale(0.9); opacity: 0.4; }
          50% { transform: scale(1.05); opacity: 0.8; }
          100% { transform: scale(0.9); opacity: 0.4; }
        }

        .product-img {
          width: 85%;
          height: 85%;
          object-fit: contain;
          z-index: 2;
          transition: 0.25s;
        }

        .product-card:hover .product-img {
          transform: scale(1.05);
        }

        .product-name {
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 4px;
          color: white;
        }

        .product-price {
          color: #7feaff;
          font-weight: 600;
          margin-bottom: 6px;
        }

        .product-desc {
          opacity: 0.7;
          font-size: 14px;
        }

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

        .back-btn {
          margin-top: 25px;
          padding: 12px 20px;
          border-radius: 12px;
          background: rgba(0,200,255,0.15);
          border: 1px solid rgba(0,200,255,0.3);
          color: white;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          text-decoration: none;
          display: inline-block;
          transition: 0.25s;
        }

        .back-btn:hover {
          background: rgba(0,200,255,0.25);
          transform: scale(1.05);
        }
      `}</style>

      {/* TOP BAR */}
      <div className="topbar">
        <div className="app-name" onClick={() => navigate("/")}>
          AntsShop
        </div>

        <div className="topbar-right">
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
      </div>

      {cartMessage && <div className="cart-message">{cartMessage}</div>}

      <div className="glass">
        <div className="title">{categoryName}</div>

        <div className="product-grid">
          {products.map((p) => (
            <div key={p.id} className="product-card">
              <Link to={`/product/${p.id}`}>
                <div className="product-img-container">
                  <div className="product-img-glow"></div>
                  <img
                    src={
                      p.image_url ||
                      "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNjAwIiBoZWlnaHQ9IjYwMCIgZmlsbD0iI2NjY2NjYyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjUwIiBmaWxsPSIjZmZmIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4="
                    }
                    alt={p.name}
                    className="product-img"
                  />
                </div>

                <div className="product-name">{p.name}</div>
                <div className="product-price">${p.price}</div>
                <div className="product-desc">{p.description || "No description"}</div>
              </Link>

              <div className="add-btn" onClick={() => addToCart(p.id, p.stock)}>
                🛒 +
              </div>
            </div>
          ))}
        </div>

        <Link className="back-btn" to="/index">
          ← Back to Store
        </Link>
      </div>
    </div>
  );
}
