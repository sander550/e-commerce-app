import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";

type Product = {
  id: number;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  category_id: number;
  image_url: string | null;
  is_active: boolean;
};

function getErrorMessage(json: any, fallback: string) {
  if (typeof json?.detail === "string") {
    return json.detail;
  }

  if (typeof json?.message === "string") {
    return json.message;
  }

  if (typeof json?.error === "string") {
    return json.error;
  }

  return fallback;
}

export default function ProductPage() {
  const { product_id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState<number>(1);

  const [errorMsg, setErrorMsg] = useState<string>("");
  const [successMsg, setSuccessMsg] = useState<string>("");

  const [pageError, setPageError] = useState<string | null>(null);
  const [rateLimited, setRateLimited] = useState(false);

  const [animateAdd, setAnimateAdd] = useState(false);
  const [floatBubble, setFloatBubble] = useState(false);

  const [loggedIn, setLoggedIn] = useState(
    localStorage.getItem("logged_in") === "true"
  );

  const redirectToLogin = () => {
    navigate("/login", {
      replace: true,
      state: { from: `/product/${product_id}` },
    });
  };

  const handleRateLimit = () => {
    setRateLimited(true);
    setPageError(null);
    setErrorMsg("");
    setSuccessMsg("");
  };

  const handleServerError = (status: number) => {
    setPageError(
      status >= 500
        ? "Something went wrong on the server. Please try again later."
        : `Something went wrong (${status}). Please try again.`
    );

    setErrorMsg("");
    setSuccessMsg("");
  };

  const handleUnexpectedError = (message: string) => {
    setPageError(message);
    setErrorMsg("");
    setSuccessMsg("");
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setLoggedIn(localStorage.getItem("logged_in") === "true");
    }, 200);

    return () => clearInterval(interval);
  }, []);

  async function addToCart() {
    if (!product) return;

    setErrorMsg("");
    setSuccessMsg("");
    setPageError(null);

    if (product.stock <= 0) {
      setErrorMsg("Out of stock");
      return;
    }

    if (quantity > product.stock) {
      setErrorMsg("Cannot add more, out of stock");
      return;
    }

    if (!loggedIn) {
      setErrorMsg("Please log in to add items to cart.");

      setTimeout(() => {
        redirectToLogin();
      }, 1000);

      return;
    }

    try {
      const res = await fetch("/api/cart/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          product_id: product.id,
          quantity: quantity,
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
        setErrorMsg(
          getErrorMessage(
            json,
            `Failed to add to cart (${res.status})`
          )
        );
        return;
      }

      setSuccessMsg(json?.message || "Added to cart!");

      setAnimateAdd(true);
      setFloatBubble(true);

      setTimeout(() => {
        setAnimateAdd(false);
      }, 400);

      setTimeout(() => {
        setFloatBubble(false);
      }, 700);
    } catch (err) {
      console.error("Add to cart fetch error:", err);

      handleUnexpectedError(
        "Unable to connect to the server. Please try again."
      );
    }
  }

  useEffect(() => {
    async function load() {
      setErrorMsg("");
      setPageError(null);
      setRateLimited(false);

      try {
        const res = await fetch(`/api/products/${product_id}`, {
          credentials: "include",
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
          setErrorMsg(
            getErrorMessage(
              json,
              `Product not found (${res.status})`
            )
          );
          return;
        }

        setProduct(json);
      } catch (err) {
        console.error("Product fetch error:", err);

        handleUnexpectedError(
          "Unable to connect to the server. Please try again."
        );
      }
    }

    load();
  }, [product_id]);

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

  if (pageError) {
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
            {pageError}
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

  if (errorMsg && !product) {
    return (
      <div className="product-wrapper">
        <style>{`
          .product-wrapper {
            min-height: 100vh;
            background: linear-gradient(135deg, #050505, #0a0f1a);
            color: #e8e8ff;
            font-family: Inter, sans-serif;
            padding: 40px;
          }

          .glass {
            background: rgba(15,15,30,0.75);
            border: 1px solid rgba(0,200,255,0.25);
            backdrop-filter: blur(25px);
            border-radius: 20px;
            padding: 28px;
            max-width: 750px;
            margin: auto;
            box-shadow: 0 0 40px rgba(0,200,255,0.15);
          }

          .error-box {
            background: rgba(255, 80, 80, 0.2);
            border: 1px solid rgba(255, 80, 80, 0.4);
            padding: 12px;
            border-radius: 10px;
            margin-bottom: 20px;
            font-weight: 600;
          }

          .back-btn {
            display: inline-block;
            padding: 10px 18px;
            background: rgba(255,255,255,0.15);
            border: 1px solid rgba(255,255,255,0.3);
            border-radius: 12px;
            color: white;
            font-weight: 600;
            text-decoration: none;
          }
        `}</style>

        <div className="glass">
          <h2>Error</h2>

          <div className="error-box">
            {errorMsg}
          </div>

          <Link to="/" className="back-btn">
            ← Back to Store
          </Link>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="product-wrapper">
        <style>{`
          .product-wrapper {
            min-height: 100vh;
            background: linear-gradient(135deg, #050505, #0a0f1a);
            color: #e8e8ff;
            font-family: Inter, sans-serif;
            padding: 40px;
          }

          .glass {
            background: rgba(15,15,30,0.75);
            border: 1px solid rgba(0,200,255,0.25);
            backdrop-filter: blur(25px);
            border-radius: 20px;
            padding: 28px;
            max-width: 750px;
            margin: auto;
            box-shadow: 0 0 40px rgba(0,200,255,0.15);
          }
        `}</style>

        <div className="glass">
          Loading product...
        </div>
      </div>
    );
  }

  return (
    <div className="product-wrapper">
      <style>{`
        .product-wrapper {
          min-height: 100vh;
          background: linear-gradient(135deg, #050505, #0a0f1a);
          color: #e8e8ff;
          font-family: Inter, sans-serif;
          padding: 40px;
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

        .topbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 25px;
        }

        .topbar-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .topbar-right {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .back-btn-top {
          padding: 10px 18px;
          background: rgba(255,255,255,0.15);
          border: 1px solid rgba(255,255,255,0.3);
          border-radius: 12px;
          color: white;
          font-weight: 600;
          text-decoration: none;
          transition: 0.25s;
        }

        .back-btn-top:hover {
          background: rgba(255,255,255,0.25);
          transform: scale(1.05);
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

        @keyframes ripple {
          0% {
            transform: scale(0.9);
            opacity: 0.4;
          }

          50% {
            transform: scale(1.05);
            opacity: 0.8;
          }

          100% {
            transform: scale(0.9);
            opacity: 0.4;
          }
        }

        .glass {
          background: rgba(15,15,30,0.75);
          border: 1px solid rgba(0,200,255,0.25);
          backdrop-filter: blur(25px);
          border-radius: 20px;
          padding: 28px;
          max-width: 750px;
          margin: auto;
          box-shadow: 0 0 40px rgba(0,200,255,0.15);
        }

        .title {
          font-size: 32px;
          font-weight: 700;
          margin-bottom: 16px;
          color: #00c8ff;
          text-shadow: 0 0 10px rgba(0,200,255,0.4);
        }

        .img-container {
          position: relative;
          width: 100%;
          height: 350px;
          margin-bottom: 25px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .img-ripple {
          position: absolute;
          width: 300px;
          height: 300px;
          border-radius: 50%;
          background: radial-gradient(
            circle,
            rgba(0,200,255,0.25) 0%,
            rgba(0,200,255,0.05) 70%,
            transparent 100%
          );
          animation: ripple 3.5s infinite ease-in-out;
          filter: blur(12px);
        }

        .img {
          width: 300px;
          height: 300px;
          object-fit: contain;
          z-index: 2;
          transition: transform 0.3s ease;
        }

        .img:hover {
          transform: scale(1.05);
        }

        .price {
          font-size: 26px;
          font-weight: 700;
          margin-bottom: 10px;
          color: #7feaff;
        }

        .desc {
          opacity: 0.85;
          margin-bottom: 20px;
          line-height: 1.5;
        }

        .info-row {
          margin-bottom: 10px;
          font-size: 18px;
        }

        .info-row strong {
          color: #00c8ff;
        }

        .qty-box {
          margin-top: 20px;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .qty-btn {
          padding: 8px 14px;
          background: rgba(0,200,255,0.15);
          border: 1px solid rgba(0,200,255,0.3);
          border-radius: 10px;
          cursor: pointer;
          font-size: 18px;
          font-weight: 600;
          color: white;
          transition: 0.25s;
        }

        .qty-btn:hover {
          background: rgba(0,200,255,0.25);
          transform: scale(1.05);
        }

        .qty-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
        }

        .qty-number {
          font-size: 20px;
          font-weight: 600;
          min-width: 40px;
          text-align: center;
        }

        .add-btn {
          margin-top: 25px;
          padding: 14px 22px;
          border-radius: 12px;
          background: rgba(0,200,255,0.25);
          border: 1px solid rgba(0,200,255,0.4);
          color: white;
          font-size: 18px;
          font-weight: 600;
          cursor: pointer;
          display: inline-block;
          transition: 0.25s;
        }

        .add-btn:hover {
          background: rgba(0,200,255,0.35);
          transform: scale(1.05);
        }

        .add-btn.animate {
          transform: scale(1.12);
          box-shadow: 0 0 18px rgba(0,200,255,0.6);
        }

        .float-bubble {
          position: absolute;
          right: 20px;
          top: -10px;
          font-size: 20px;
          font-weight: 700;
          color: #00c8ff;
          animation: bubbleUp 0.7s ease forwards;
          pointer-events: none;
        }

        @keyframes bubbleUp {
          0% {
            opacity: 1;
            transform: translateY(0px);
          }

          100% {
            opacity: 0;
            transform: translateY(-25px);
          }
        }

        .error-box {
          background: rgba(255, 80, 80, 0.2);
          border: 1px solid rgba(255, 80, 80, 0.4);
          padding: 12px;
          border-radius: 10px;
          margin-bottom: 20px;
          font-weight: 600;
        }

        .success-box {
          background: rgba(80, 255, 120, 0.2);
          border: 1px solid rgba(80, 255, 120, 0.4);
          padding: 12px;
          border-radius: 10px;
          margin-bottom: 20px;
          font-weight: 600;
        }

        @media (max-width: 700px) {
          .product-wrapper {
            padding: 20px;
          }

          .topbar {
            flex-wrap: wrap;
            gap: 12px;
          }

          .img-container {
            height: 280px;
          }

          .img,
          .img-ripple {
            width: 230px;
            height: 230px;
          }
        }
      `}</style>

      {/* TOP BAR */}
      <div className="topbar">
        <div className="topbar-left">
          <Link to="/" className="back-btn-top">
            ← Back
          </Link>
        </div>

        <div className="topbar-right">
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
      </div>

      <div className="glass">
        {errorMsg && (
          <div className="error-box">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="success-box">
            {successMsg}
          </div>
        )}

        <div className="title">
          {product.name}
        </div>

        <div className="img-container">
          <div className="img-ripple"></div>

          {product.image_url && (
            <img
              src={product.image_url}
              alt={product.name}
              className="img"
            />
          )}
        </div>

        <div className="price">
          ${Number(product.price).toFixed(2)}
        </div>

        <div className="desc">
          {product.description || "No description"}
        </div>

        <div className="info-row">
          <strong>Stock:</strong> {product.stock}
        </div>

        <div className="info-row">
          <strong>Category:</strong>{" "}
          <Link
            to={`/category/${product.category_id}`}
            style={{ color: "#7feaff" }}
          >
            Category {product.category_id}
          </Link>
        </div>

        <div className="qty-box">
          <button
            className="qty-btn"
            onClick={() =>
              setQuantity(Math.max(1, quantity - 1))
            }
            disabled={quantity <= 1}
          >
            -
          </button>

          <div className="qty-number">
            {quantity}
          </div>

          <button
            className="qty-btn"
            onClick={() =>
              setQuantity(
                Math.min(product.stock, quantity + 1)
              )
            }
            disabled={quantity >= product.stock}
          >
            +
          </button>
        </div>

        <div style={{ position: "relative" }}>
          {floatBubble && (
            <div className="float-bubble">
              +{quantity}
            </div>
          )}

          <button
            className={`add-btn ${
              animateAdd ? "animate" : ""
            }`}
            onClick={addToCart}
            disabled={product.stock <= 0}
          >
            🛒 Add {quantity}
          </button>
        </div>
      </div>
    </div>
  );
}