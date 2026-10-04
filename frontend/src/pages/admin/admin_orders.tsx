import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function getErrorMessage(json: any, fallback: string) {
  if (typeof json?.detail === "string") return json.detail;
  if (typeof json?.message === "string") return json.message;
  if (typeof json?.error === "string") return json.error;
  return fallback;
}

export default function AdminOrderPage() {
  const navigate = useNavigate();

  const { user, loading: authLoading } = useAuth();

  const [errorMsg, setErrorMsg] = useState("");
  const [invalidFields, setInvalidFields] = useState<string[]>([]);

  const [updateData, setUpdateData] = useState({
    order_id: "",
    status: "",
    shipping_address: "",
    delivery_method: "",
  });

  const [deleteId, setDeleteId] = useState("");

  // -------------------------------
  // CHECK ADMIN
  // -------------------------------
  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      navigate("/login", {
        replace: true,
        state: { from: "/admin/orders" },
      });
      return;
    }

    if (!user.is_admin) {
      navigate("/", { replace: true });
    }
  }, [authLoading, user, navigate]);

  // -------------------------------
  // VALIDATION
  // -------------------------------
  function validateUpdate() {
    const missing: string[] = [];

    if (
      !updateData.order_id.trim() ||
      isNaN(parseInt(updateData.order_id))
    ) {
      missing.push("order_id");
    }

    if (missing.length > 0) {
      setInvalidFields(missing);
      return "Order ID is required.";
    }

    setInvalidFields([]);
    return null;
  }

  function validateDelete() {
    const missing: string[] = [];

    if (!deleteId.trim() || isNaN(parseInt(deleteId))) {
      missing.push("deleteId");
    }

    if (missing.length > 0) {
      setInvalidFields(missing);
      return "Order ID is required.";
    }

    setInvalidFields([]);
    return null;
  }

  // -------------------------------
  // UPDATE ORDER
  // -------------------------------
  async function handleUpdate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMsg("");

    const validation = validateUpdate();

    if (validation) {
      setErrorMsg(validation);
      return;
    }

    try {
      const res = await fetch(
        `/api/admin/order/${updateData.order_id}`,
        {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: updateData.status || null,
            shipping_address: updateData.shipping_address || null,
            delivery_method: updateData.delivery_method || null,
          }),
        }
      );

      let json: any = {};

      try {
        json = await res.json();
      } catch {
        json = {};
      }

      if (res.status === 401) {
        navigate("/login", {
          replace: true,
          state: { from: "/admin/orders" },
        });
        return;
      }

      if (res.status === 403) {
        setErrorMsg("You do not have permission to update orders.");
        return;
      }

      if (res.status === 429) {
        setErrorMsg(
          getErrorMessage(
            json,
            "Too many requests. Please wait a moment and try again."
          )
        );
        return;
      }

      if (!res.ok) {
        setErrorMsg(
          getErrorMessage(json, "Failed to update order.")
        );
        return;
      }

      setErrorMsg("Order updated!");
      setInvalidFields([]);
    } catch (err: any) {
      console.error("Update order error:", err);
      setErrorMsg(
        err?.message || "Unable to connect to the server."
      );
    }
  }

  // -------------------------------
  // DELETE ORDER
  // -------------------------------
  async function handleDelete(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMsg("");

    const validation = validateDelete();

    if (validation) {
      setErrorMsg(validation);
      return;
    }

    try {
      const res = await fetch(
        `/api/admin/order/${deleteId}`,
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

      if (res.status === 401) {
        navigate("/login", {
          replace: true,
          state: { from: "/admin/orders" },
        });
        return;
      }

      if (res.status === 403) {
        setErrorMsg("You do not have permission to delete orders.");
        return;
      }

      if (res.status === 429) {
        setErrorMsg(
          getErrorMessage(
            json,
            "Too many requests. Please wait a moment and try again."
          )
        );
        return;
      }

      if (!res.ok) {
        setErrorMsg(
          getErrorMessage(json, "Failed to delete order.")
        );
        return;
      }

      setErrorMsg("Order deleted!");
      setInvalidFields([]);
      setDeleteId("");
    } catch (err: any) {
      console.error("Delete order error:", err);
      setErrorMsg(
        err?.message || "Unable to connect to the server."
      );
    }
  }

  // -------------------------------
  // AUTH LOADING
  // -------------------------------
  if (authLoading) {
    return (
      <div className="admin-wrapper">
        <div className="loading">Checking admin...</div>

        <style>{`
          .admin-wrapper {
            min-height: 100vh;
            background: linear-gradient(135deg, #050505, #0a0f1a);
            color: #e8e8ff;
            font-family: Inter, sans-serif;
            padding: 40px;
          }

          .loading {
            text-align: center;
            padding-top: 100px;
            font-size: 20px;
            color: #00c8ff;
          }
        `}</style>
      </div>
    );
  }

  if (!user || !user.is_admin) {
    return null;
  }

  // -------------------------------
  // PAGE UI
  // -------------------------------
  return (
    <div className="admin-wrapper">
      <style>{`
        .admin-wrapper {
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

        .glass {
          background: rgba(15,15,30,0.75);
          border: 1px solid rgba(0,200,255,0.25);
          backdrop-filter: blur(25px);
          border-radius: 20px;
          padding: 28px;
          margin-bottom: 32px;
          box-shadow: 0 0 40px rgba(0,200,255,0.15);
        }

        .title {
          font-size: 28px;
          font-weight: 700;
          margin-bottom: 20px;
          color: #00c8ff;
          text-shadow: 0 0 10px rgba(0,200,255,0.4);
        }

        .input {
          width: 100%;
          padding: 12px;
          margin-bottom: 14px;
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.15);
          background: rgba(255,255,255,0.08);
          color: white;
          font-size: 15px;
          transition: 0.25s;
          box-sizing: border-box;
        }

        .input:focus {
          background: rgba(0,200,255,0.15);
          border-color: rgba(0,200,255,0.35);
          transform: scale(1.02);
          outline: none;
        }

        .input.invalid {
          border: 2px solid #ff4d4d;
          background: rgba(255,0,0,0.1);
        }

        .select {
          width: 100%;
          padding: 12px;
          margin-bottom: 14px;
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.15);
          background: rgba(255,255,255,0.08);
          color: white;
          font-size: 15px;
          transition: 0.25s;
          box-sizing: border-box;
        }

        .select:focus {
          background: rgba(0,200,255,0.15);
          border-color: rgba(0,200,255,0.35);
          transform: scale(1.02);
          outline: none;
        }

        .select option {
          background: #0a0f1a;
          color: white;
        }

        .btn {
          padding: 12px 20px;
          border-radius: 12px;
          background: rgba(0,200,255,0.25);
          border: 1px solid rgba(0,200,255,0.4);
          color: white;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: 0.25s;
        }

        .btn:hover {
          background: rgba(0,200,255,0.35);
          transform: scale(1.05);
        }

        .delete-btn {
          background: rgba(255,80,80,0.25);
          border: 1px solid rgba(255,80,80,0.4);
        }

        .delete-btn:hover {
          background: rgba(255,80,80,0.35);
        }

        .back-btn {
          margin-top: 20px;
          padding: 12px 20px;
          border-radius: 12px;
          background: rgba(0,200,255,0.15);
          border: 1px solid rgba(0,200,255,0.3);
          color: white;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: 0.25s;
        }

        .back-btn:hover {
          background: rgba(0,200,255,0.25);
          transform: scale(1.05);
        }

        .error-box {
          background: rgba(255,80,80,0.2);
          border: 1px solid rgba(255,80,80,0.4);
          padding: 12px;
          border-radius: 10px;
          margin-bottom: 20px;
          font-weight: 600;
        }
      `}</style>

      {errorMsg && <div className="error-box">{errorMsg}</div>}

      {/* UPDATE ORDER */}
      <div className="glass">
        <div className="title">Update Order</div>

        <form onSubmit={handleUpdate}>
          <input
            className={`input ${
              invalidFields.includes("order_id") ? "invalid" : ""
            }`}
            placeholder="Order ID"
            value={updateData.order_id}
            onChange={(e) =>
              setUpdateData({
                ...updateData,
                order_id: e.target.value,
              })
            }
          />

          <select
            className="select"
            value={updateData.status}
            onChange={(e) =>
              setUpdateData({
                ...updateData,
                status: e.target.value,
              })
            }
          >
            <option value="">Status (optional)</option>
            <option value="pending">pending</option>
            <option value="shipped">shipped</option>
            <option value="failed">failed</option>
            <option value="payed">payed</option>
          </select>

          <input
            className="input"
            placeholder="Shipping Address (optional)"
            value={updateData.shipping_address}
            onChange={(e) =>
              setUpdateData({
                ...updateData,
                shipping_address: e.target.value,
              })
            }
          />

          <select
            className="select"
            value={updateData.delivery_method}
            onChange={(e) =>
              setUpdateData({
                ...updateData,
                delivery_method: e.target.value,
              })
            }
          >
            <option value="">Delivery Method (optional)</option>
            <option value="standard">standard</option>
            <option value="express">express</option>
            <option value="pickup">pickup</option>
          </select>

          <button className="btn" type="submit">
            Update Order
          </button>
        </form>
      </div>

      {/* DELETE ORDER */}
      <div className="glass">
        <div className="title">Delete Order</div>

        <form onSubmit={handleDelete}>
          <input
            className={`input ${
              invalidFields.includes("deleteId") ? "invalid" : ""
            }`}
            placeholder="Order ID"
            value={deleteId}
            onChange={(e) => setDeleteId(e.target.value)}
          />

          <button className="btn delete-btn" type="submit">
            Delete Order
          </button>
        </form>
      </div>

      <button
        className="back-btn"
        onClick={() => navigate("/admin")}
      >
        ← Back to Admin Dashboard
      </button>
    </div>
  );
}