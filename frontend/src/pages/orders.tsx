import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function OrdersPage() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState<any[]>([]);
  const [openOrders, setOpenOrders] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);
  const [detailsError, setDetailsError] = useState<string | null>(null);

  const [rateLimited, setRateLimited] = useState(false);
  const [pageError, setPageError] = useState<string | null>(null);

  // ---------------------------------------------------------
  // HELPERS
  // ---------------------------------------------------------

  const getErrorMessage = (json: any, fallback: string) => {
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
  };

  const redirectToLogin = () => {
    navigate("/login", {
      replace: true,
      state: {
        from: "/orders",
      },
    });
  };

  const handleRateLimit = () => {
    setRateLimited(true);
    setError(null);
    setDetailsError(null);
    setPageError(null);
  };

  const handleServerError = () => {
    setPageError(
      "Something went wrong on the server. Please try again later."
    );

    setError(null);
    setDetailsError(null);
  };

  const handleUnexpectedError = () => {
    setPageError(
      "Unable to connect to the server. Please check your connection and try again."
    );

    setError(null);
    setDetailsError(null);
  };

  // ---------------------------------------------------------
  // API CALLS
  // ---------------------------------------------------------

  const listOrders = async () => {
    try {
      const res = await fetch("/api/orders/list", {
        credentials: "include",
      });

      let json: any = {};

      try {
        json = await res.json();
      } catch {
        json = {};
      }

      if (!res.ok) {
        // ---------------------------------------------------
        // NOT AUTHENTICATED
        // ---------------------------------------------------

        if (res.status === 401) {
          redirectToLogin();
          return;
        }

        // ---------------------------------------------------
        // RATE LIMITED
        // ---------------------------------------------------

        if (res.status === 429) {
          handleRateLimit();
          return;
        }

        // ---------------------------------------------------
        // SERVER ERROR
        // ---------------------------------------------------

        if (res.status >= 500) {
          handleServerError();
          return;
        }

        // ---------------------------------------------------
        // OTHER EXPECTED API ERROR
        // ---------------------------------------------------

        setError(
          getErrorMessage(
            json,
            `Unable to load your orders (${res.status}).`
          )
        );

        return;
      }

      setOrders(Array.isArray(json) ? json : []);
    } catch (err) {
      console.error("Orders fetch error:", err);

      handleUnexpectedError();
    }
  };

  const getOrderDetails = async (orderId: number) => {
    setDetailsError(null);

    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        credentials: "include",
      });

      let json: any = {};

      try {
        json = await res.json();
      } catch {
        json = {};
      }

      if (!res.ok) {
        // ---------------------------------------------------
        // NOT AUTHENTICATED
        // ---------------------------------------------------

        if (res.status === 401) {
          redirectToLogin();
          return;
        }

        // ---------------------------------------------------
        // RATE LIMITED
        // ---------------------------------------------------

        if (res.status === 429) {
          handleRateLimit();
          return;
        }

        // ---------------------------------------------------
        // ORDER NOT FOUND
        // ---------------------------------------------------

        if (res.status === 404) {
          setDetailsError("This order could not be found.");
          return;
        }

        // ---------------------------------------------------
        // SERVER ERROR
        // ---------------------------------------------------

        if (res.status >= 500) {
          handleServerError();
          return;
        }

        // ---------------------------------------------------
        // OTHER EXPECTED API ERROR
        // ---------------------------------------------------

        setDetailsError(
          getErrorMessage(
            json,
            `Unable to load order details (${res.status}).`
          )
        );

        return;
      }

      setOpenOrders((prev) =>
        prev.includes(orderId)
          ? prev
          : [...prev, orderId]
      );

      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId
            ? {
                ...order,
                details: json,
              }
            : order
        )
      );
    } catch (err) {
      console.error("Order details fetch error:", err);

      handleUnexpectedError();
    }
  };

  const unviewOrder = (orderId: number) => {
    setOpenOrders((prev) =>
      prev.filter((id) => id !== orderId)
    );

    setDetailsError(null);
  };

  // ---------------------------------------------------------
  // INITIAL LOAD
  // ---------------------------------------------------------

  useEffect(() => {
    const load = async () => {
      await listOrders();
      setLoading(false);
    };

    load();
  }, []);

  // ---------------------------------------------------------
  // LOADING SCREEN
  // ---------------------------------------------------------

  if (loading) {
    return (
      <div className="orders-page">
        <style>{`
          .orders-page {
            min-height: 100vh;
            width: 100%;
            box-sizing: border-box;
            background:
              radial-gradient(
                circle at top,
                rgba(0, 200, 255, 0.08),
                transparent 35%
              ),
              linear-gradient(135deg, #050505, #0a0f1a);
            color: #e8e8ff;
            font-family: Inter, sans-serif;
            padding: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .orders-loading {
            width: min(500px, 90%);
            box-sizing: border-box;
            padding: 35px;
            text-align: center;
            border-radius: 20px;

            background: rgba(15, 15, 30, 0.78);
            border: 1px solid rgba(0, 200, 255, 0.3);

            backdrop-filter: blur(25px);

            box-shadow:
              0 0 40px rgba(0, 200, 255, 0.15),
              inset 0 0 30px rgba(0, 200, 255, 0.03);

            animation: ordersPulse 1.8s infinite ease-in-out;
          }

          .loading-title {
            color: #00c8ff;
            font-size: 25px;
            font-weight: 700;
            text-shadow: 0 0 12px rgba(0, 200, 255, 0.5);
          }

          .loading-text {
            margin-top: 10px;
            color: rgba(232, 232, 255, 0.65);
          }

          @keyframes ordersPulse {
            0% {
              box-shadow: 0 0 20px rgba(0, 200, 255, 0.12);
            }

            50% {
              box-shadow: 0 0 45px rgba(0, 200, 255, 0.32);
            }

            100% {
              box-shadow: 0 0 20px rgba(0, 200, 255, 0.12);
            }
          }
        `}</style>

        <div className="orders-loading">
          <div className="loading-title">
            Loading your orders...
          </div>

          <div className="loading-text">
            Please wait a moment.
          </div>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------
  // RATE LIMIT ERROR
  // ---------------------------------------------------------

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

  // ---------------------------------------------------------
  // FULL PAGE ERROR
  // ---------------------------------------------------------

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

  // ---------------------------------------------------------
  // NORMAL PAGE
  // ---------------------------------------------------------

  return (
    <div className="page-wrapper">
      <style>{`
        .page-wrapper {
          min-height: 100vh;
          background:
            radial-gradient(
              circle at top,
              rgba(0, 200, 255, 0.06),
              transparent 35%
            ),
            linear-gradient(135deg, #050505, #0a0f1a);

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

          box-shadow:
            0 0 40px rgba(0, 200, 255, 0.15);

          animation: fadeIn 0.4s ease;
        }

        .section-title {
          font-size: 22px;
          font-weight: 700;
          margin-bottom: 14px;

          color: #00c8ff;

          text-shadow:
            0 0 8px rgba(0,200,255,0.4);
        }

        .order-card {
          padding: 12px 0;

          border-bottom:
            1px solid rgba(255,255,255,0.1);

          display: flex;
          justify-content: space-between;
          align-items: center;

          transition: 0.25s;
        }

        .order-card:hover {
          transform: translateX(4px);

          border-bottom-color:
            rgba(0,200,255,0.4);
        }

        .btn {
          padding: 8px 12px;

          background:
            rgba(0,200,255,0.15);

          border:
            1px solid rgba(0,200,255,0.3);

          border-radius: 10px;

          cursor: pointer;

          color: white;

          margin-left: 10px;

          transition: 0.2s;
        }

        .btn:hover {
          background:
            rgba(0,200,255,0.25);

          transform: scale(1.05);

          box-shadow:
            0 0 12px rgba(0,200,255,0.12);
        }

        .details-box {
          margin-top: 10px;
          animation: slideDown 0.35s ease;
        }

        .item {
          padding: 10px 0;

          border-bottom:
            1px solid rgba(255,255,255,0.1);
        }

        .nav-btn {
          display: inline-block;

          padding: 10px 14px;

          border-radius: 12px;

          background:
            rgba(0,200,255,0.15);

          border:
            1px solid rgba(0,200,255,0.3);

          color: white;

          text-decoration: none;

          transition: 0.2s;
        }

        .nav-btn:hover {
          background:
            rgba(0,200,255,0.25);

          transform: scale(1.05);
        }

        .details-error {
          margin-bottom: 18px;

          padding: 14px 16px;

          border-radius: 12px;

          background:
            rgba(0,200,255,0.08);

          border:
            1px solid rgba(0,200,255,0.3);

          color: #7feaff;

          font-weight: 600;

          box-shadow:
            0 0 18px rgba(0,200,255,0.08);

          animation: fadeIn 0.3s ease;
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

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>

      <div style={{ marginBottom: "20px" }}>
        <Link
          className="nav-btn"
          to="/"
        >
          ← Back
        </Link>
      </div>

      <div className="glass">
        <div className="section-title">
          Your Orders
        </div>

        {detailsError && (
          <div className="details-error">
            ⚡ {detailsError}
          </div>
        )}

        {orders.length === 0 && (
          <div style={{ opacity: 0.7 }}>
            You have no orders yet.
          </div>
        )}

        {orders.map((order) => (
          <div key={order.id}>
            <div className="order-card">
              <div>
                <strong>
                  Order #{order.id}
                </strong>

                <div style={{ opacity: 0.7 }}>
                  {order.status} — $
                  {Number(order.total).toFixed(2)}
                </div>
              </div>

              <div>
                {!openOrders.includes(order.id) ? (
                  <button
                    className="btn"
                    onClick={() =>
                      getOrderDetails(order.id)
                    }
                  >
                    View
                  </button>
                ) : (
                  <button
                    className="btn"
                    onClick={() =>
                      unviewOrder(order.id)
                    }
                  >
                    Unview
                  </button>
                )}
              </div>
            </div>

            {openOrders.includes(order.id) &&
              order.details && (
                <div className="glass details-box">
                  <div className="section-title">
                    Order #{order.id} Details
                  </div>

                  <div className="item">
                    <strong>Status:</strong>{" "}
                    {order.details.status}
                  </div>

                  <div className="item">
                    <strong>
                      Shipping Address:
                    </strong>{" "}
                    {order.details.shipping_address}
                  </div>

                  <div className="item">
                    <strong>
                      Delivery Method:
                    </strong>{" "}
                    {order.details.delivery_method}
                  </div>

                  <div className="item">
                    <strong>Subtotal:</strong> $
                    {Number(
                      order.details.subtotal
                    ).toFixed(2)}
                  </div>

                  <div className="item">
                    <strong>Tax:</strong> $
                    {Number(
                      order.details.tax
                    ).toFixed(2)}
                  </div>

                  <div className="item">
                    <strong>Total:</strong> $
                    {Number(
                      order.details.total
                    ).toFixed(2)}
                  </div>

                  <div className="item">
                    <strong>Created:</strong>{" "}
                    {order.details.created_at}
                  </div>

                  <div
                    className="section-title"
                    style={{ marginTop: "20px" }}
                  >
                    Items
                  </div>

                  {Array.isArray(
                    order.details.items
                  ) &&
                    order.details.items.map(
                      (item: any) => (
                        <div
                          key={item.product_id}
                          className="item"
                        >
                          <strong>
                            {item.name}
                          </strong>

                          <div
                            style={{
                              opacity: 0.7,
                            }}
                          >
                            ${item.price} ×{" "}
                            {item.quantity}
                          </div>
                        </div>
                      )
                    )}
                </div>
              )}
          </div>
        ))}
      </div>
    </div>
  );
}