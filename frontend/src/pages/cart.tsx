import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function getErrorMessage(json: any, fallback: string) {
  if (typeof json?.detail === "string") return json.detail;
  if (typeof json?.message === "string") return json.message;
  if (typeof json?.error === "string") return json.error;
  return fallback;
}

export default function CartPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const [cart, setCart] = useState<any>({
    items: [],
  });

  const [totals, setTotals] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Address fields
  const [street, setStreet] = useState("");
  const [houseNumber, setHouseNumber] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("");

  const [deliveryMethod, setDeliveryMethod] =
    useState("standard");

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [rateLimited, setRateLimited] = useState(false);
  const [pageError, setPageError] = useState<string | null>(null);

  const [highlightErrors, setHighlightErrors] =
    useState(false);

  // -----------------------------
  // AUTH REDIRECT
  // -----------------------------

  const redirectToLogin = () => {
    navigate("/login", {
      replace: true,
      state: { from: "/cart" },
    });
  };

  // -----------------------------
  // RATE LIMIT
  // -----------------------------

  const handleRateLimit = () => {
    setRateLimited(true);
    setPageError(null);
    setError(null);
    setSuccess(null);
  };

  // -----------------------------
  // SERVER / NETWORK ERROR
  // -----------------------------

  const handleServerError = (message?: string) => {
    setPageError(
      message ||
        "Something went wrong on the server. Please try again later."
    );

    setRateLimited(false);
    setError(null);
    setSuccess(null);
  };

  const handleUnexpectedError = () => {
    setPageError(
      "Something went wrong. Please check your connection and try again."
    );

    setRateLimited(false);
    setError(null);
    setSuccess(null);
  };

  // -----------------------------
  // LOAD CART
  // -----------------------------

  const fetchCart = async () => {
    try {
      const res = await fetch("/api/cart/", {
        credentials: "include",
      });

      let json: any = {};

      try {
        json = await res.json();
      } catch {
        json = {};
      }

      if (!res.ok) {
        if (res.status === 401) {
          redirectToLogin();
          return false;
        }

        if (res.status === 429) {
          handleRateLimit();
          return false;
        }

        if (res.status >= 500) {
          handleServerError(
            "Something went wrong on the server while loading your cart."
          );
          return false;
        }

        setError(
          getErrorMessage(
            json,
            `Failed to load cart (${res.status}).`
          )
        );

        return false;
      }

      setCart(
        json && Array.isArray(json.items)
          ? json
          : { items: [] }
      );

      return true;
    } catch (err) {
      console.error("Load cart failed:", err);
      handleUnexpectedError();
      return false;
    }
  };

  // -----------------------------
  // LOAD TOTALS
  // -----------------------------

  const fetchTotals = async () => {
    try {
      const res = await fetch("/api/cart/totals", {
        credentials: "include",
      });

      let json: any = {};

      try {
        json = await res.json();
      } catch {
        json = {};
      }

      if (!res.ok) {
        if (res.status === 401) {
          redirectToLogin();
          return false;
        }

        if (res.status === 429) {
          handleRateLimit();
          return false;
        }

        if (res.status >= 500) {
          handleServerError(
            "Something went wrong while calculating your cart total."
          );
          return false;
        }

        setError(
          getErrorMessage(
            json,
            `Failed to load totals (${res.status}).`
          )
        );

        return false;
      }

      setTotals(json);

      return true;
    } catch (err) {
      console.error("Load totals failed:", err);
      handleUnexpectedError();
      return false;
    }
  };

  // -----------------------------
  // LOAD PROFILE
  // -----------------------------

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/auth/profile", {
        credentials: "include",
      });

      let json: any = {};

      try {
        json = await res.json();
      } catch {
        json = {};
      }

      if (!res.ok) {
        return;
      }

      if (json.shipping_address) {
        const parts = json.shipping_address
          .split(",")
          .map((p: string) => p.trim());

        setStreet(parts[0] || "");
        setHouseNumber(parts[1] || "");
        setCity(parts[2] || "");
        setPostalCode(parts[3] || "");
        setCountry(parts[4] || "");
      }
    } catch (err) {
      console.error("Load profile failed:", err);
    }
  };

  // -----------------------------
  // INITIAL LOAD
  // -----------------------------

  useEffect(() => {
    if (authLoading) return;

    // AuthContext already checked authentication.
    if (!user) {
      redirectToLogin();
      return;
    }

    const load = async () => {
      setLoading(true);

      const cartLoaded = await fetchCart();

      if (!cartLoaded) {
        setLoading(false);
        return;
      }

      const totalsLoaded = await fetchTotals();

      if (!totalsLoaded) {
        setLoading(false);
        return;
      }

      await fetchProfile();

      setLoading(false);
    };

    load();
  }, [authLoading, user]);

  // -----------------------------
  // UPDATE QUANTITY
  // -----------------------------

  const updateQuantity = async (
    productId: number,
    quantity: number
  ) => {
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch(
        `/api/cart/item/${productId}`,
        {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ quantity }),
        }
      );

      let json: any = {};

      try {
        json = await res.json();
      } catch {
        json = {};
      }

      if (!res.ok) {
        if (res.status === 401) {
          redirectToLogin();
          return;
        }

        if (res.status === 429) {
          handleRateLimit();
          return;
        }

        if (res.status >= 500) {
          handleServerError(
            "Something went wrong while updating your cart."
          );
          return;
        }

        setError(
          getErrorMessage(
            json,
            `Failed to update quantity (${res.status}).`
          )
        );

        return;
      }

      setCart(
        json && Array.isArray(json.items)
          ? json
          : { items: [] }
      );

      const totalsLoaded = await fetchTotals();

      if (totalsLoaded) {
        setSuccess("Quantity updated!");
      }
    } catch (err) {
      console.error("Update quantity failed:", err);
      handleUnexpectedError();
    }
  };

  // -----------------------------
  // REMOVE ITEM
  // -----------------------------

  const removeItem = async (productId: number) => {
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch(
        `/api/cart/item/${productId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      let json: any = {};

      try {
        json = await res.json();
      } catch {
        json = {};
      }

      if (!res.ok) {
        if (res.status === 401) {
          redirectToLogin();
          return;
        }

        if (res.status === 429) {
          handleRateLimit();
          return;
        }

        if (res.status >= 500) {
          handleServerError(
            "Something went wrong while removing this item."
          );
          return;
        }

        setError(
          getErrorMessage(
            json,
            `Failed to remove item (${res.status}).`
          )
        );

        return;
      }

      setCart(
        json && Array.isArray(json.items)
          ? json
          : { items: [] }
      );

      const totalsLoaded = await fetchTotals();

      if (totalsLoaded) {
        setSuccess("Item removed!");
      }
    } catch (err) {
      console.error("Remove item failed:", err);
      handleUnexpectedError();
    }
  };

  // -----------------------------
  // CLEAR CART
  // -----------------------------

  const clearCart = async () => {
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/cart/clear", {
        method: "POST",
        credentials: "include",
      });

      let json: any = {};

      try {
        json = await res.json();
      } catch {
        json = {};
      }

      if (!res.ok) {
        if (res.status === 401) {
          redirectToLogin();
          return;
        }

        if (res.status === 429) {
          handleRateLimit();
          return;
        }

        if (res.status >= 500) {
          handleServerError(
            "Something went wrong while clearing your cart."
          );
          return;
        }

        setError(
          getErrorMessage(
            json,
            `Failed to clear cart (${res.status}).`
          )
        );

        return;
      }

      setCart({ items: [] });

      setTotals({
        subtotal: 0,
        tax: 0,
        total: 0,
      });

      setSuccess("Cart cleared!");
    } catch (err) {
      console.error("Clear cart failed:", err);
      handleUnexpectedError();
    }
  };

  // -----------------------------
  // PAY WITH PAYPAL
  // -----------------------------

  const payWithPayPal = async () => {
    setError(null);
    setSuccess(null);

    setHighlightErrors(true);

    const missing =
      !street ||
      !houseNumber ||
      !city ||
      !postalCode ||
      !country;

    if (missing) {
      setError("Please fill in all shipping fields.");
      return;
    }

    const fullAddress =
      `${street}, ${houseNumber}, ${city}, ${postalCode}, ${country}`;

    try {
      // CREATE ORDER

      const orderRes = await fetch("/api/orders/", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          shipping_address: fullAddress,
          delivery_method: deliveryMethod,
        }),
      });

      let orderJson: any = {};

      try {
        orderJson = await orderRes.json();
      } catch {
        orderJson = {};
      }

      if (!orderRes.ok) {
        if (orderRes.status === 401) {
          redirectToLogin();
          return;
        }

        if (orderRes.status === 429) {
          handleRateLimit();
          return;
        }

        if (orderRes.status >= 500) {
          handleServerError(
            "Something went wrong while creating your order. Please try again later."
          );
          return;
        }

        setError(
          getErrorMessage(
            orderJson,
            `Failed to create order (${orderRes.status}).`
          )
        );

        return;
      }

      const orderId = orderJson.id;

      if (!orderId) {
        setError(
          "The order was created, but no order ID was returned."
        );
        return;
      }

      // CREATE PAYPAL PAYMENT

      const payRes = await fetch(
        "/api/payment/create",
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            order_id: orderId,
          }),
        }
      );

      let payJson: any = {};

      try {
        payJson = await payRes.json();
      } catch {
        payJson = {};
      }

      if (!payRes.ok) {
        if (payRes.status === 401) {
          redirectToLogin();
          return;
        }

        if (payRes.status === 429) {
          handleRateLimit();
          return;
        }

        if (payRes.status >= 500) {
          handleServerError(
            "Something went wrong while starting the payment. Please try again later."
          );
          return;
        }

        setError(
          getErrorMessage(
            payJson,
            `Failed to start PayPal payment (${payRes.status}).`
          )
        );

        return;
      }

      if (!payJson.approval_url) {
        setError(
          "PayPal did not return a payment link. Please try again."
        );
        return;
      }

      window.location.href = payJson.approval_url;
    } catch (err) {
      console.error("PayPal payment failed:", err);
      handleUnexpectedError();
    }
  };

  // -----------------------------
  // AUTH LOADING
  // -----------------------------

  if (authLoading) {
    return (
      <div className="page-wrapper fade-in">
        <style>{`
          .page-wrapper {
            min-height: 100vh;
            background: linear-gradient(135deg, #050505, #0a0f1a);
            color: #e8e8ff;
            font-family: Inter, sans-serif;
            padding: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .glass {
            background: rgba(15,15,30,0.75);
            border: 1px solid rgba(0,200,255,0.25);
            backdrop-filter: blur(25px);
            border-radius: 18px;
            padding: 30px;
            box-shadow: 0 0 40px rgba(0,200,255,0.15);
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

  // If AuthContext says logged out,
  // the effect above redirects to login.
  if (!user) {
    return null;
  }

  // -----------------------------
  // CART LOADING
  // -----------------------------

  if (loading) {
    return (
      <div className="page-wrapper fade-in">
        <style>{`
          .page-wrapper {
            min-height: 100vh;
            background: linear-gradient(135deg, #050505, #0a0f1a);
            color: #e8e8ff;
            font-family: Inter, sans-serif;
            padding: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .glass {
            background: rgba(15,15,30,0.75);
            border: 1px solid rgba(0,200,255,0.25);
            backdrop-filter: blur(25px);
            border-radius: 18px;
            padding: 30px;
            box-shadow: 0 0 40px rgba(0,200,255,0.15);
            color: #00c8ff;
            font-weight: 700;
          }
        `}</style>

        <div className="glass">
          Loading cart...
        </div>
      </div>
    );
  }

  // -----------------------------
  // RATE LIMIT ERROR SCREEN
  // -----------------------------

  if (rateLimited) {
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
          }

          .error-screen {
            width: 100%;
            max-width: 550px;
            padding: 45px;
            border-radius: 20px;
            background: rgba(15,15,30,0.75);
            backdrop-filter: blur(25px);
            border: 1px solid rgba(255,180,0,0.35);
            box-shadow: 0 0 40px rgba(255,180,0,0.12);
            color: white;
            text-align: center;
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
  // PAGE ERROR SCREEN
  // -----------------------------

  if (pageError) {
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
          }

          .error-screen {
            width: 100%;
            max-width: 550px;
            padding: 45px;
            border-radius: 20px;
            background: rgba(15,15,30,0.75);
            backdrop-filter: blur(25px);
            border: 1px solid rgba(255,80,80,0.35);
            box-shadow: 0 0 40px rgba(255,80,80,0.12);
            color: white;
            text-align: center;
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
  // NORMAL UI
  // -----------------------------

  return (
    <div className="page-wrapper fade-in">
      <style>{`
        .page-wrapper {
          min-height: 100vh;
          background: linear-gradient(135deg, #050505, #0a0f1a);
          color: #e8e8ff;
          font-family: Inter, sans-serif;
          padding: 24px;
        }

        .layout {
          display: grid;
          grid-template-columns: 1fr 0.9fr;
          gap: 24px;
        }

        .glass {
          background: rgba(15, 15, 30, 0.75);
          border: 1px solid rgba(0, 200, 255, 0.25);
          backdrop-filter: blur(25px);
          border-radius: 18px;
          padding: 22px;
          box-shadow: 0 0 40px rgba(0, 200, 255, 0.15);
        }

        .section-title {
          font-size: 22px;
          font-weight: 700;
          margin-bottom: 14px;
          color: #00c8ff;
          text-shadow: 0 0 8px rgba(0,200,255,0.4);
        }

        .item {
          padding: 12px 0;
          border-bottom: 1px solid rgba(255,255,255,0.08);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        input {
          width: 100%;
          padding: 12px;
          border-radius: 10px;
          border: none;
          margin-bottom: 12px;
          background: rgba(255,255,255,0.08);
          color: white;
          font-size: 15px;
          outline: none;
          box-sizing: border-box;
        }

        input.error {
          border: 1px solid #ff4444;
          background: rgba(255, 50, 50, 0.15);
        }

        select {
          width: 100%;
          padding: 12px;
          border-radius: 10px;
          border: none;
          margin-bottom: 12px;
          background: rgba(0,200,255,0.25);
          color: #000;
          font-weight: 600;
        }

        .paypal-btn {
          padding: 14px 18px;
          background: rgba(0,200,255,0.25);
          border: 1px solid rgba(0,200,255,0.4);
          border-radius: 14px;
          cursor: pointer;
          margin-top: 12px;
          color: white;
          font-weight: 600;
          width: 100%;
          transition: 0.2s;
        }

        .paypal-btn:hover {
          background: rgba(0,200,255,0.35);
          transform: scale(1.03);
        }

        .qty-btn,
        .remove-btn,
        .clear-btn {
          padding: 8px 12px;
          margin-left: 6px;
          border-radius: 8px;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.15);
          color: white;
          cursor: pointer;
          transition: 0.2s;
        }

        .qty-btn:hover {
          background: rgba(255,255,255,0.18);
        }

        .remove-btn:hover {
          background: rgba(255,80,80,0.25);
        }

        .clear-btn {
          margin-top: 12px;
          width: 100%;
        }

        .clear-btn:hover {
          background: rgba(255,80,80,0.25);
        }

        .error-box {
          background: #330000;
          color: #ffaaaa;
          padding: 12px;
          border-radius: 10px;
          margin-bottom: 20px;
          font-weight: 600;
        }

        .success-box {
          background: #003300;
          color: #aaffaa;
          padding: 12px;
          border-radius: 10px;
          margin-bottom: 20px;
          font-weight: 600;
        }

        .nav-btn {
          display: inline-block;
          margin-bottom: 20px;
          padding: 10px 14px;
          border-radius: 12px;
          background: rgba(0,200,255,0.15);
          border: 1px solid rgba(0,200,255,0.3);
          color: white;
          text-decoration: none;
          transition: 0.2s;
        }

        .nav-btn:hover {
          background: rgba(0,200,255,0.25);
          transform: scale(1.05);
        }

        @media (max-width: 800px) {
          .layout {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <Link className="nav-btn" to="/">
        ← Back
      </Link>

      {error && <div className="error-box">{error}</div>}

      {success && (
        <div className="success-box">{success}</div>
      )}

      <div className="layout">
        {/* LEFT SIDE — CART */}

        <div className="glass">
          <div className="section-title">
            Your Cart
          </div>

          {cart.items.length === 0 && (
            <div style={{ opacity: 0.7 }}>
              Your cart is empty.
            </div>
          )}

          {cart.items.map((item: any) => (
            <div
              key={item.product_id}
              className="item"
            >
              <div>
                <strong>{item.name}</strong>

                <div style={{ opacity: 0.7 }}>
                  ${item.price} × {item.quantity}
                </div>
              </div>

              <div>
                <button
                  className="qty-btn"
                  onClick={() =>
                    updateQuantity(
                      item.product_id,
                      item.quantity - 1
                    )
                  }
                  disabled={item.quantity <= 1}
                >
                  -
                </button>

                <button
                  className="qty-btn"
                  onClick={() =>
                    updateQuantity(
                      item.product_id,
                      item.quantity + 1
                    )
                  }
                >
                  +
                </button>

                <button
                  className="remove-btn"
                  onClick={() =>
                    removeItem(item.product_id)
                  }
                >
                  Remove
                </button>
              </div>
            </div>
          ))}

          {cart.items.length > 0 && (
            <button
              className="clear-btn"
              onClick={clearCart}
            >
              Clear Cart
            </button>
          )}
        </div>

        {/* RIGHT SIDE — CHECKOUT */}

        <div className="glass">
          <div className="section-title">
            Shipping Address
          </div>

          <input
            className={
              highlightErrors && !street
                ? "error"
                : ""
            }
            placeholder="Street"
            value={street}
            onChange={(e) =>
              setStreet(e.target.value)
            }
          />

          <input
            className={
              highlightErrors && !houseNumber
                ? "error"
                : ""
            }
            placeholder="House Number"
            value={houseNumber}
            onChange={(e) =>
              setHouseNumber(e.target.value)
            }
          />

          <input
            className={
              highlightErrors && !city
                ? "error"
                : ""
            }
            placeholder="City"
            value={city}
            onChange={(e) =>
              setCity(e.target.value)
            }
          />

          <input
            className={
              highlightErrors && !postalCode
                ? "error"
                : ""
            }
            placeholder="Postal Code"
            value={postalCode}
            onChange={(e) =>
              setPostalCode(e.target.value)
            }
          />

          <input
            className={
              highlightErrors && !country
                ? "error"
                : ""
            }
            placeholder="Country"
            value={country}
            onChange={(e) =>
              setCountry(e.target.value)
            }
          />

          <div
            className="section-title"
            style={{ marginTop: "20px" }}
          >
            Delivery Method
          </div>

          <select
            value={deliveryMethod}
            onChange={(e) =>
              setDeliveryMethod(e.target.value)
            }
          >
            <option value="standard">
              Standard Delivery (3–5 days)
            </option>

            <option value="express">
              Express Delivery (1–2 days)
            </option>

            <option value="pickup">
              Pickup Point
            </option>
          </select>

          <div
            className="section-title"
            style={{ marginTop: "20px" }}
          >
            Totals
          </div>

          {totals ? (
            <>
              <div className="item">
                <span>Subtotal</span>

                <span>
                  $
                  {Number(
                    totals.subtotal
                  ).toFixed(2)}
                </span>
              </div>

              <div className="item">
                <span>Tax</span>

                <span>
                  $
                  {Number(
                    totals.tax
                  ).toFixed(2)}
                </span>
              </div>

              <div className="item">
                <strong>Total</strong>

                <strong>
                  $
                  {Number(
                    totals.total
                  ).toFixed(2)}
                </strong>
              </div>
            </>
          ) : (
            <div style={{ opacity: 0.7 }}>
              No totals available.
            </div>
          )}

          {cart.items.length > 0 && (
            <button
              className="paypal-btn"
              onClick={payWithPayPal}
            >
              Pay with PayPal
            </button>
          )}
        </div>
      </div>
    </div>
  );
}