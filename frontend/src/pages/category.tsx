import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

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

function getErrorMessage(json: any, fallback: string) {
  if (typeof json?.detail === "string") return json.detail;
  if (typeof json?.message === "string") return json.message;
  if (typeof json?.error === "string") return json.error;
  return fallback;
}

export default function CategoryPage() {
  const { category_id } = useParams();
  const navigate = useNavigate();

  const { user, loading: authLoading } = useAuth();

  const [products, setProducts] = useState<ProductDTO[]>([]);
  const [categoryName, setCategoryName] = useState<string>("");

  const [errorMsg, setErrorMsg] = useState<string>("");
  const [cartMessage, setCartMessage] = useState<string | null>(null);

  const [pageError, setPageError] = useState<string | null>(null);
  const [rateLimited, setRateLimited] = useState(false);

  const redirectToLogin = () => {
    navigate("/login", {
      replace: true,
      state: {
        from: `/category/${category_id}`,
      },
    });
  };

  const handleRateLimit = () => {
    setRateLimited(true);
    setPageError(null);
    setErrorMsg("");
    setCartMessage(null);
  };

  const handleServerError = (status: number) => {
    setPageError(
      status >= 500
        ? "Something went wrong on the server. Please try again later."
        : `Something went wrong (${status}). Please try again.`
    );

    setRateLimited(false);
    setErrorMsg("");
    setCartMessage(null);
  };

  const handleUnexpectedError = () => {
    setPageError(
      "Something went wrong. Please check your connection and try again."
    );

    setRateLimited(false);
    setErrorMsg("");
    setCartMessage(null);
  };

  // -----------------------------
  // LOAD CATEGORY PRODUCTS
  // -----------------------------

  useEffect(() => {
    if (authLoading) return;

    let cancelled = false;

    async function loadProducts() {
      setErrorMsg("");

      try {
        const res = await fetch(
          `/api/products/category/${category_id}`,
          {
            credentials: "include",
          }
        );

        let json: any = null;

        try {
          json = await res.json();
        } catch {
          json = null;
        }

        if (cancelled) return;

        /*
         * Category/product pages are public.
         *
         * A 401 here should NOT automatically send
         * the user to login.
         */
        if (res.status === 401) {
          setErrorMsg(
            getErrorMessage(
              json,
              "You are not authorized to view these products."
            )
          );
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
              "Failed to load category products."
            )
          );
          return;
        }

        setProducts(
          Array.isArray(json) ? json : []
        );
      } catch (err) {
        console.error("Load category products failed:", err);

        if (!cancelled) {
          handleUnexpectedError();
        }
      }
    }

    loadProducts();

    return () => {
      cancelled = true;
    };
  }, [category_id, authLoading]);

  // -----------------------------
  // LOAD CATEGORY NAME
  // -----------------------------

  useEffect(() => {
    if (authLoading) return;

    let cancelled = false;

    async function loadCategoryName() {
      try {
        const res = await fetch(
          `/api/categories/${category_id}`,
          {
            credentials: "include",
          }
        );

        let json: CategoryDTO | any = null;

        try {
          json = await res.json();
        } catch {
          json = null;
        }

        if (cancelled) return;

        /*
         * Categories are public.
         * Do not redirect to login for 401.
         */
        if (res.status === 401) {
          setCategoryName(`Category ${category_id}`);
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

        if (res.ok && json?.name) {
          setCategoryName(json.name);
        } else {
          setCategoryName(`Category ${category_id}`);
        }
      } catch (err) {
        console.error("Load category name failed:", err);

        if (!cancelled) {
          handleUnexpectedError();
        }
      }
    }

    loadCategoryName();

    return () => {
      cancelled = true;
    };
  }, [category_id, authLoading]);

  // -----------------------------
  // ADD TO CART
  // -----------------------------

  async function addToCart(
    productId: number,
    stock: number
  ) {
    if (stock <= 0) {
      setCartMessage("Out of stock");

      setTimeout(() => {
        setCartMessage(null);
      }, 1500);

      return;
    }

    /*
     * AuthContext is now the source of truth.
     */
    if (!user) {
      setCartMessage(
        "Please log in to add items to cart."
      );

      setTimeout(() => {
        redirectToLogin();
      }, 800);

      return;
    }

    try {
      const res = await fetch(
        "/api/cart/add",
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            product_id: productId,
            quantity: 1,
          }),
        }
      );

      let json: any = null;

      try {
        json = await res.json();
      } catch {
        json = null;
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
            "Failed to add to cart."
          )
        );

        setTimeout(() => {
          setCartMessage(null);
        }, 1500);

        return;
      }

      setCartMessage("✓ Added to cart!");

      setTimeout(() => {
        setCartMessage(null);
      }, 1500);
    } catch (err) {
      console.error("Add to cart failed:", err);
      handleUnexpectedError();
    }
  }

  // -----------------------------
  // AUTH LOADING
  // -----------------------------

  if (authLoading) {
    return (
      <div className="category-wrapper">
        <style>{`
          .category-wrapper {
            min-height: 100vh;
            background: linear-gradient(135deg, #050505, #0a0f1a);
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: Inter, sans-serif;
          }

          .glass {
            background: rgba(15,15,30,0.75);
            border: 1px solid rgba(0,200,255,0.25);
            backdrop-filter: blur(25px);
            border-radius: 20px;
            padding: 35px;
            text-align: center;
            color: #00c8ff;
            font-weight: 700;
          }
        `}</style>

        <div className="glass">
          Checking authentication...
        </div>
      </div>
    );
  }

  // -----------------------------
  // RATE LIMIT ERROR
  // -----------------------------

  if (rateLimited) {
    return (
      <div className="category-wrapper">
        <style>{`
          .category-wrapper {
            min-height: 100vh;
            background: linear-gradient(135deg, #050505, #0a0f1a);
            color: #e8e8ff;
            font-family: Inter, sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 40px;
          }

          .error-screen {
            background: rgba(15,15,30,0.75);
            border: 1px solid rgba(255,180,0,0.35);
            backdrop-filter: blur(25px);
            border-radius: 20px;
            padding: 45px;
            max-width: 550px;
            width: 100%;
            text-align: center;
            box-shadow: 0 0 40px rgba(255,180,0,0.12);
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

  // -----------------------------
  // PAGE ERROR
  // -----------------------------

  if (pageError) {
    return (
      <div className="category-wrapper">
        <style>{`
          .category-wrapper {
            min-height: 100vh;
            background: linear-gradient(135deg, #050505, #0a0f1a);
            color: #e8e8ff;
            font-family: Inter, sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 40px;
          }

          .error-screen {
            background: rgba(15,15,30,0.75);
            border: 1px solid rgba(255,80,80,0.35);
            backdrop-filter: blur(25px);
            border-radius: 20px;
            padding: 45px;
            max-width: 550px;
            width: 100%;
            text-align: center;
            box-shadow: 0 0 40px rgba(255,80,80,0.12);
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

  // -----------------------------
  // API ERROR
  // -----------------------------

  if (errorMsg) {
    return (
      <div className="category-wrapper">
        <style>{`
          .category-wrapper {
            min-height: 100vh;
            background: linear-gradient(135deg, #050505, #0a0f1a);
            color: #e8e8ff;
            font-family: Inter, sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 40px;
          }

          .glass {
            background: rgba(15,15,30,0.75);
            border: 1px solid rgba(0,200,255,0.25);
            backdrop-filter: blur(25px);
            border-radius: 20px;
            padding: 35px;
            text-align: center;
            max-width: 500px;
            width: 100%;
          }

          .back-btn {
            margin-top: 25px;
            padding: 12px 20px;
            border-radius: 12px;
            background: rgba(0,200,255,0.15);
            border: 1px solid rgba(0,200,255,0.3);
            color: white;
            text-decoration: none;
            display: inline-block;
          }
        `}</style>

        <div className="glass">
          <h2>Error</h2>
          <p>{errorMsg}</p>

          <Link to="/" className="back-btn">
            ← Back to Store
          </Link>
        </div>
      </div>
    );
  }

  // -----------------------------
  // NO PRODUCTS
  // -----------------------------

  if (!products.length) {
    return (
      <div className="category-wrapper">
        <style>{`
          .category-wrapper {
            min-height: 100vh;
            background: linear-gradient(135deg, #050505, #0a0f1a);
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: Inter, sans-serif;
          }

          .glass {
            background: rgba(15,15,30,0.75);
            border: 1px solid rgba(0,200,255,0.25);
            backdrop-filter: blur(25px);
            border-radius: 20px;
            padding: 35px;
            text-align: center;
          }

          .back-btn {
            margin-top: 25px;
            padding: 12px 20px;
            border-radius: 12px;
            background: rgba(0,200,255,0.15);
            border: 1px solid rgba(0,200,255,0.3);
            color: white;
            text-decoration: none;
            display: inline-block;
          }
        `}</style>

        <div className="glass">
          <h2>No products found in this category</h2>

          <Link to="/" className="back-btn">
            ← Back to Store
          </Link>
        </div>
      </div>
    );
  }

  // -----------------------------
  // NORMAL UI
  // -----------------------------

  return (
    <div className="category-wrapper">
      <style>{`
        * {
          box-sizing: border-box;
        }

        .category-wrapper {
          min-height: 100vh;
          position: relative;
          overflow: hidden;
          background:
            radial-gradient(circle at 10% 20%, rgba(0,200,255,0.10), transparent 30%),
            radial-gradient(circle at 90% 80%, rgba(0,100,255,0.10), transparent 30%),
            linear-gradient(135deg, #030405, #080d16 50%, #04070c);
          color: #e8e8ff;
          font-family: Inter, Arial, sans-serif;
          padding: 35px 40px 60px;
          animation: pageFade 0.6s ease;
        }

        .category-wrapper::before {
          content: "";
          position: absolute;
          width: 500px;
          height: 500px;
          border-radius: 50%;
          background: rgba(0,200,255,0.07);
          filter: blur(100px);
          top: -250px;
          left: -200px;
          pointer-events: none;
        }

        .category-wrapper::after {
          content: "";
          position: absolute;
          width: 450px;
          height: 450px;
          border-radius: 50%;
          background: rgba(0,110,255,0.06);
          filter: blur(100px);
          bottom: -250px;
          right: -200px;
          pointer-events: none;
        }

        @keyframes pageFade {
          from {
            opacity: 0;
            transform: translateY(12px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .topbar {
          position: relative;
          z-index: 5;
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 35px;
        }

        .app-name {
          font-size: 31px;
          font-weight: 800;
          letter-spacing: -1px;
          color: #00c8ff;
          cursor: pointer;
          text-shadow: 0 0 18px rgba(0,200,255,0.45);
          transition: 0.25s;
        }

        .app-name:hover {
          transform: translateY(-2px) scale(1.04);
          color: #8ceeff;
        }

        .topbar-right {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .nav-btn {
          padding: 10px 18px;
          background: rgba(255,255,255,0.07);
          border: 1px solid rgba(255,255,255,0.18);
          border-radius: 12px;
          color: white;
          font-weight: 600;
          text-decoration: none;
          transition: 0.25s;
          backdrop-filter: blur(10px);
        }

        .nav-btn:hover {
          background: rgba(0,200,255,0.14);
          border-color: rgba(0,200,255,0.4);
          transform: translateY(-2px);
        }

        .icon-btn {
          width: 43px;
          height: 43px;
          border-radius: 50%;
          background: rgba(0,200,255,0.09);
          border: 1px solid rgba(0,200,255,0.25);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 19px;
          cursor: pointer;
          transition: 0.25s;
          text-decoration: none;
          color: white;
          backdrop-filter: blur(10px);
        }

        .icon-btn:hover {
          transform: translateY(-3px) scale(1.08);
          background: rgba(0,200,255,0.2);
          box-shadow: 0 0 18px rgba(0,200,255,0.18);
        }

        .glass {
          position: relative;
          z-index: 2;
          background: rgba(9,13,23,0.70);
          border: 1px solid rgba(0,200,255,0.20);
          backdrop-filter: blur(28px);
          -webkit-backdrop-filter: blur(28px);
          border-radius: 24px;
          padding: 32px;
          max-width: 1250px;
          margin: auto;
          box-shadow:
            0 25px 80px rgba(0,0,0,0.35),
            0 0 35px rgba(0,200,255,0.06);
        }

        .category-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 30px;
          gap: 20px;
        }

        .title-wrapper {
          display: flex;
          flex-direction: column;
          gap: 7px;
        }

        .title {
          font-size: 36px;
          font-weight: 800;
          letter-spacing: -1px;
          color: #ffffff;
          margin: 0;
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

        .product-card::before {
          content: "";
          position: absolute;
          top: -80px;
          left: 50%;
          transform: translateX(-50%);
          width: 180px;
          height: 180px;
          border-radius: 50%;
          background: rgba(0,200,255,0.08);
          filter: blur(45px);
          opacity: 0;
          transition: 0.3s;
          pointer-events: none;
        }

        .product-card:hover {
          transform: translateY(-8px);
          border-color: rgba(0,200,255,0.42);
          box-shadow:
            0 18px 40px rgba(0,0,0,0.35),
            0 0 25px rgba(0,200,255,0.10);
        }

        .product-card:hover::before {
          opacity: 1;
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
          filter: blur(14px);
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
          top: 10px;
          left: 10px;
          z-index: 4;
          padding: 5px 8px;
          border-radius: 8px;
          font-size: 11px;
          font-weight: 700;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255,255,255,0.12);
        }

        .stock-good {
          background: rgba(50,220,140,0.12);
          color: #68f0b0;
        }

        .stock-low {
          background: rgba(255,190,50,0.13);
          color: #ffd166;
        }

        .stock-out {
          background: rgba(255,70,70,0.13);
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
          position: fixed;
          z-index: 20;
          top: 25px;
          left: 50%;
          transform: translateX(-50%);
          padding: 12px 20px;
          border-radius: 14px;
          background: rgba(8,15,25,0.92);
          border: 1px solid rgba(0,200,255,0.35);
          color: #7feaff;
          font-weight: 700;
          box-shadow: 0 10px 35px rgba(0,0,0,0.35);
          backdrop-filter: blur(15px);
          animation: messageIn 0.3s ease;
        }

        @keyframes messageIn {
          from {
            opacity: 0;
            transform: translate(-50%, -10px);
          }

          to {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }

        .back-btn {
          margin-top: 28px;
          padding: 11px 18px;
          border-radius: 12px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.13);
          color: #d9eaff;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          text-decoration: none;
          display: inline-block;
          transition: 0.25s;
        }

        .back-btn:hover {
          background: rgba(0,200,255,0.10);
          border-color: rgba(0,200,255,0.3);
          color: white;
          transform: translateX(-3px);
        }

        @media (max-width: 1100px) {
          .product-grid {
            grid-template-columns: repeat(4, minmax(0, 1fr));
          }
        }

        @media (max-width: 850px) {
          .category-wrapper {
            padding: 25px 20px 45px;
          }

          .glass {
            padding: 22px;
          }

          .product-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
        }

        @media (max-width: 620px) {
          .topbar {
            align-items: flex-start;
          }

          .app-name {
            font-size: 25px;
          }

          .topbar-right {
            gap: 6px;
          }

          .product-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 12px;
          }

          .category-header {
            align-items: flex-start;
            flex-direction: column;
          }

          .title {
            font-size: 30px;
          }

          .glass {
            padding: 16px;
          }
        }
      `}</style>

      <div className="topbar">
        <div
          className="app-name"
          onClick={() => navigate("/")}
        >
          AntsShop
        </div>

        <div className="topbar-right">
          {user ? (
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

      {cartMessage && (
        <div className="cart-message">
          {cartMessage}
        </div>
      )}

      <div className="glass">
        <div className="category-header">
          <div className="title-wrapper">
            <h1 className="title">{categoryName}</h1>
            <div className="title-accent"></div>
          </div>

          <div className="product-count">
            {products.length}{" "}
            {products.length === 1
              ? "product"
              : "products"}
          </div>
        </div>

        <div className="product-grid">
          {products.map((p, index) => {
            const stockClass =
              p.stock <= 0
                ? "stock-out"
                : p.stock <= 5
                ? "stock-low"
                : "stock-good";

            const stockText =
              p.stock <= 0
                ? "Out of stock"
                : p.stock <= 5
                ? `Only ${p.stock} left`
                : "In stock";

            return (
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
                      className={`stock-badge ${stockClass}`}
                    >
                      {stockText}
                    </div>

                    <img
                      src={
                        p.image_url ||
                        "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNjAwIiBoZWlnaHQ9IjYwMCIgZmlsbD0iI2NjY2NjYyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjUwIiBmaWxsPSIjZmZmIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4="
                      }
                      alt={p.name}
                      className="product-img"
                    />
                  </div>

                  <div className="product-name">
                    {p.name}
                  </div>

                  <div className="product-bottom">
                    <div className="product-price">
                      $
                      {Number(p.price).toFixed(2)}
                    </div>
                  </div>
                </Link>

                <div className="product-bottom">
                  <div></div>

                  <button
                    type="button"
                    className={`add-btn ${
                      p.stock <= 0 ? "disabled" : ""
                    }`}
                    disabled={p.stock <= 0}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      addToCart(p.id, p.stock);
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
            );
          })}
        </div>

        <Link className="back-btn" to="/">
          ← Back to Store
        </Link>
      </div>
    </div>
  );
}