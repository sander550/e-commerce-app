import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function CartPage() {
  const [cart, setCart] = useState<any>(null);
  const [totals, setTotals] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Address fields
  const [street, setStreet] = useState("");
  const [houseNumber, setHouseNumber] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("");

  const [deliveryMethod, setDeliveryMethod] = useState("standard");

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Track which fields should be highlighted red
  const [highlightErrors, setHighlightErrors] = useState(false);

  // -----------------------------
  // LOAD CART + TOTALS + PROFILE
  // -----------------------------
  const fetchCart = async () => {
    try {
      const res = await fetch("http://localhost:8000/cart/", {
        credentials: "include",
      });
      const json = await res.json();
      if (!res.ok) return setError(json.detail || "Failed to load cart.");
      setCart(json);
    } catch {
      setError("Failed to load cart.");
    }
  };

  const fetchTotals = async () => {
    try {
      const res = await fetch("http://localhost:8000/cart/totals", {
        credentials: "include",
      });
      const json = await res.json();
      if (!res.ok) return setError(json.detail || "Failed to load totals.");
      setTotals(json);
    } catch {
      setError("Failed to load totals.");
    }
  };

  const fetchProfile = async () => {
    try {
      const res = await fetch("http://localhost:8000/auth/profile", {
        credentials: "include",
      });
      const json = await res.json();
      if (!res.ok) return;

      if (json.shipping_address) {
        const parts = json.shipping_address.split(",").map((p: string) => p.trim());
        setStreet(parts[0] || "");
        setHouseNumber(parts[1] || "");
        setCity(parts[2] || "");
        setPostalCode(parts[3] || "");
        setCountry(parts[4] || "");
      }
    } catch {}
  };

  useEffect(() => {
    (async () => {
      await fetchCart();
      await fetchTotals();
      await fetchProfile();
      setLoading(false);
    })();
  }, []);

  // -----------------------------
  // UPDATE QUANTITY
  // -----------------------------
  const updateQuantity = async (productId: number, quantity: number) => {
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch(`http://localhost:8000/cart/item/${productId}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity }),
      });

      const json = await res.json();
      if (!res.ok) return setError(json.detail || "Failed to update quantity.");

      setCart(json);
      fetchTotals();
      setSuccess("Quantity updated!");
    } catch {
      setError("Failed to update quantity.");
    }
  };

  // -----------------------------
  // REMOVE ITEM
  // -----------------------------
  const removeItem = async (productId: number) => {
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch(`http://localhost:8000/cart/item/${productId}`, {
        method: "DELETE",
        credentials: "include",
      });

      const json = await res.json();
      if (!res.ok) return setError(json.detail || "Failed to remove item.");

      setCart(json);
      fetchTotals();
      setSuccess("Item removed!");
    } catch {
      setError("Failed to remove item.");
    }
  };

  // -----------------------------
  // CLEAR CART
  // -----------------------------
  const clearCart = async () => {
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("http://localhost:8000/cart/clear", {
        method: "POST",
        credentials: "include",
      });

      const json = await res.json();
      if (!res.ok) return setError(json.detail || "Failed to clear cart.");

      setCart({ items: [] });
      setTotals({ subtotal: 0, tax: 0, total: 0 });
      setSuccess("Cart cleared!");
    } catch {
      setError("Failed to clear cart.");
    }
  };

  // -----------------------------
  // PAY WITH PAYPAL
  // -----------------------------
  const payWithPayPal = async () => {
    setError(null);
    setSuccess(null);

    // Enable red highlighting
    setHighlightErrors(true);

    const missing =
      !street || !houseNumber || !city || !postalCode || !country;

    if (missing) {
      setError("Please fill in all shipping fields.");
      return;
    }

    const fullAddress = `${street}, ${houseNumber}, ${city}, ${postalCode}, ${country}`;

    try {
      const orderRes = await fetch("http://localhost:8000/orders/", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shipping_address: fullAddress,
          delivery_method: deliveryMethod,
        }),
      });

      const orderJson = await orderRes.json();
      if (!orderRes.ok)
        return setError(orderJson.detail || "Failed to create order.");

      const orderId = orderJson.id;

      const payRes = await fetch("http://localhost:8000/payment/create", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_id: orderId }),
      });

      const payJson = await payRes.json();
      if (!payRes.ok)
        return setError(payJson.detail || "Failed to start PayPal payment.");

      window.location.href = payJson.approval_url;
    } catch {
      setError("Failed to start PayPal payment.");
    }
  };

  if (loading)
    return (
      <div className="page-wrapper fade-in">
        <div className="glass pulse">Loading cart...</div>
      </div>
    );

  // -----------------------------
  // UI
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

        .qty-btn, .remove-btn, .clear-btn {
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
      `}</style>

      <Link className="nav-btn" to="/">← Back</Link>

      {error && <div className="error-box">{error}</div>}
      {success && <div className="success-box">{success}</div>}

      <div className="layout">
        {/* LEFT SIDE — CART */}
        <div className="glass">
          <div className="section-title">Your Cart</div>

          {cart.items.length === 0 && (
            <div style={{ opacity: 0.7 }}>Your cart is empty.</div>
          )}

          {cart.items.map((item: any) => (
            <div key={item.product_id} className="item">
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
                    updateQuantity(item.product_id, item.quantity - 1)
                  }
                  disabled={item.quantity <= 1}
                >
                  -
                </button>

                <button
                  className="qty-btn"
                  onClick={() =>
                    updateQuantity(item.product_id, item.quantity + 1)
                  }
                >
                  +
                </button>

                <button
                  className="remove-btn"
                  onClick={() => removeItem(item.product_id)}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}

          {cart.items.length > 0 && (
            <button className="clear-btn" onClick={clearCart}>
              Clear Cart
            </button>
          )}
        </div>

        {/* RIGHT SIDE — CHECKOUT */}
        <div className="glass">
          <div className="section-title">Shipping Address</div>

          <input
            className={highlightErrors && !street ? "error" : ""}
            placeholder="Street"
            value={street}
            onChange={(e) => setStreet(e.target.value)}
          />

          <input
            className={highlightErrors && !houseNumber ? "error" : ""}
            placeholder="House Number"
            value={houseNumber}
            onChange={(e) => setHouseNumber(e.target.value)}
          />

          <input
            className={highlightErrors && !city ? "error" : ""}
            placeholder="City"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />

          <input
            className={highlightErrors && !postalCode ? "error" : ""}
            placeholder="Postal Code"
            value={postalCode}
            onChange={(e) => setPostalCode(e.target.value)}
          />

          <input
            className={highlightErrors && !country ? "error" : ""}
            placeholder="Country"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
          />

          <div className="section-title" style={{ marginTop: "20px" }}>
            Delivery Method
          </div>

          <select
            value={deliveryMethod}
            onChange={(e) => setDeliveryMethod(e.target.value)}
          >
            <option value="standard">Standard Delivery (3–5 days)</option>
            <option value="express">Express Delivery (1–2 days)</option>
            <option value="pickup">Pickup Point</option>
          </select>

          <div className="section-title" style={{ marginTop: "20px" }}>
            Totals
          </div>

          {totals ? (
            <>
              <div className="item">
                <span>Subtotal</span>
                <span>${totals.subtotal.toFixed(2)}</span>
              </div>
              <div className="item">
                <span>Tax</span>
                <span>${totals.tax.toFixed(2)}</span>
              </div>
              <div className="item">
                <strong>Total</strong>
                <strong>${totals.total.toFixed(2)}</strong>
              </div>
            </>
          ) : (
            <div style={{ opacity: 0.7 }}>No totals available.</div>
          )}

          {cart.items.length > 0 && (
            <button className="paypal-btn" onClick={payWithPayPal}>
              Pay with PayPal
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
