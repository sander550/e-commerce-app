import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [openOrders, setOpenOrders] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ---------------------------------------------------------
  // API CALLS
  // ---------------------------------------------------------

  const listOrders = async () => {
    try {
      const res = await fetch("http://localhost:8000/orders/list", {
        credentials: "include",
      });

      if (res.status === 401) {
        setError("Unauthorized");
        return;
      }

      const json = await res.json();
      setOrders(json);
    } catch {
      setError("Failed to load orders.");
    }
  };

  const getOrderDetails = async (orderId: number) => {
    try {
      const res = await fetch(`http://localhost:8000/orders/${orderId}`, {
        credentials: "include",
      });

      if (!res.ok) throw new Error();

      const json = await res.json();

      setOpenOrders((prev) => [...prev, orderId]);

      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, details: json } : o))
      );
    } catch {
      setError("Failed to load order details.");
    }
  };

  const unviewOrder = (orderId: number) => {
    setOpenOrders((prev) => prev.filter((id) => id !== orderId));
  };

  // ---------------------------------------------------------
  // INITIAL LOAD
  // ---------------------------------------------------------

  useEffect(() => {
    (async () => {
      await listOrders();
      setLoading(false);
    })();
  }, []);

  // ---------------------------------------------------------
  // LOADING / ERROR
  // ---------------------------------------------------------

  if (loading)
    return (
      <div className="page-wrapper">
        <div className="glass pulse">Loading orders...</div>
      </div>
    );

  if (error)
    return (
      <div className="page-wrapper">
        <div className="glass">{error}</div>
      </div>
    );

  // ---------------------------------------------------------
  // UI
  // ---------------------------------------------------------

  return (
    <div className="page-wrapper">
      <style>{`
        .page-wrapper {
          min-height: 100vh;
          background: linear-gradient(135deg, #050505, #0a0f1a);
          color: #e8e8ff;
          font-family: Inter, sans-serif;
          padding: 24px;
        }

        .glass {
          background: rgba(15, 15, 30, 0.75);
          border: 1px solid rgba(0, 200, 255, 0.25);
          backdrop-filter: blur(25px);
          border-radius: 18px;
          padding: 22px;
          margin-bottom: 24px;
          box-shadow: 0 0 40px rgba(0, 200, 255, 0.15);
          animation: fadeIn 0.4s ease;
        }

        .pulse {
          animation: pulseGlow 1.8s infinite ease-in-out;
        }

        @keyframes pulseGlow {
          0% { box-shadow: 0 0 20px rgba(0,200,255,0.15); }
          50% { box-shadow: 0 0 35px rgba(0,200,255,0.35); }
          100% { box-shadow: 0 0 20px rgba(0,200,255,0.15); }
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .section-title {
          font-size: 22px;
          font-weight: 700;
          margin-bottom: 14px;
          color: #00c8ff;
          text-shadow: 0 0 8px rgba(0,200,255,0.4);
        }

        .order-card {
          padding: 12px 0;
          border-bottom: 1px solid rgba(255,255,255,0.1);
          display: flex;
          justify-content: space-between;
          align-items: center;
          transition: 0.25s;
        }

        .order-card:hover {
          transform: translateX(4px);
          border-bottom-color: rgba(0,200,255,0.4);
        }

        .btn {
          padding: 8px 12px;
          background: rgba(0,200,255,0.15);
          border: 1px solid rgba(0,200,255,0.3);
          border-radius: 10px;
          cursor: pointer;
          color: white;
          margin-left: 10px;
          transition: 0.2s;
        }

        .btn:hover {
          background: rgba(0,200,255,0.25);
          transform: scale(1.05);
        }

        .details-box {
          margin-top: 10px;
          animation: slideDown 0.35s ease;
        }

        .item {
          padding: 10px 0;
          border-bottom: 1px solid rgba(255,255,255,0.1);
        }

        .nav-btn {
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

      <div style={{ marginBottom: "20px" }}>
        <Link className="nav-btn" to="/">← Back</Link>
      </div>

      {/* ORDER LIST */}
      <div className="glass">
        <div className="section-title">Your Orders</div>

        {orders.length === 0 && (
          <div style={{ opacity: 0.7 }}>You have no orders yet.</div>
        )}

        {orders.map((order) => (
          <div key={order.id}>
            <div className="order-card">
              <div>
                <strong>Order #{order.id}</strong>
                <div style={{ opacity: 0.7 }}>
                  {order.status} — ${order.total.toFixed(2)}
                </div>
              </div>

              <div>
                {!openOrders.includes(order.id) ? (
                  <button className="btn" onClick={() => getOrderDetails(order.id)}>
                    View
                  </button>
                ) : (
                  <button className="btn" onClick={() => unviewOrder(order.id)}>
                    Unview
                  </button>
                )}
              </div>
            </div>

            {/* ORDER DETAILS */}
            {openOrders.includes(order.id) && order.details && (
              <div className="glass details-box">
                <div className="section-title">Order #{order.id} Details</div>

                <div className="item">
                  <strong>Status:</strong> {order.details.status}
                </div>
                <div className="item">
                  <strong>Shipping Address:</strong> {order.details.shipping_address}
                </div>
                <div className="item">
                  <strong>Delivery Method:</strong> {order.details.delivery_method}
                </div>
                <div className="item">
                  <strong>Subtotal:</strong> ${order.details.subtotal.toFixed(2)}
                </div>
                <div className="item">
                  <strong>Tax:</strong> ${order.details.tax.toFixed(2)}
                </div>
                <div className="item">
                  <strong>Total:</strong> ${order.details.total.toFixed(2)}
                </div>
                <div className="item">
                  <strong>Created:</strong> {order.details.created_at}
                </div>

                <div className="section-title" style={{ marginTop: "20px" }}>
                  Items
                </div>

                {order.details.items.map((item: any) => (
                  <div key={item.product_id} className="item">
                    <strong>{item.name}</strong>
                    <div style={{ opacity: 0.7 }}>
                      ${item.price} × {item.quantity}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
