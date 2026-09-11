import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

type AdminUser = {
  id: number;
  email: string;
  is_admin: boolean;
};

export default function AdminOrderPage() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
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
    async function checkAdmin() {
      try {
        const res = await fetch("http://localhost:8000/auth/profile", {
          credentials: "include",
        });

        if (!res.ok) {
          navigate("/index");
          return;
        }

        const user = await res.json();

        if (!user.is_admin) {
          navigate("/index");
          return;
        }

        setIsAdmin(true);
      } catch {
        navigate("/index");
      } finally {
        setLoading(false);
      }
    }

    checkAdmin();
  }, [navigate]);

  // -------------------------------
  // VALIDATION
  // -------------------------------
  function validateUpdate() {
    const missing = [];

    if (!updateData.order_id.trim() || isNaN(parseInt(updateData.order_id)))
      missing.push("order_id");

    if (missing.length > 0) {
      setInvalidFields(missing);
      return "Order ID is required.";
    }

    setInvalidFields([]);
    return null;
  }

  function validateDelete() {
    const missing = [];

    if (!deleteId.trim() || isNaN(parseInt(deleteId))) missing.push("deleteId");

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
        `http://localhost:8000/admin/order/${updateData.order_id}`,
        {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: updateData.status || null,
            shipping_address: updateData.shipping_address || null,
            delivery_method: updateData.delivery_method || null,
          }),
        }
      );

      const json = await res.json();

      if (!res.ok) {
        setErrorMsg(json.detail || "Unknown error");
      } else {
        setErrorMsg("Order updated!");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed");
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
        `http://localhost:8000/admin/order/${deleteId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const json = await res.json();

      if (!res.ok) {
        setErrorMsg(json.detail || "Unknown error");
      } else {
        setErrorMsg("Order deleted!");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed");
    }
  }

  // -------------------------------
  // LOADING SCREEN
  // -------------------------------
  if (loading) {
    return (
      <div className="admin-wrapper">
        <div className="loading">Checking admin...</div>
      </div>
    );
  }

  if (!isAdmin) return null;

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
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
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
        }

        .input:focus {
          background: rgba(0,200,255,0.15);
          border-color: rgba(0,200,255,0.35);
          transform: scale(1.02);
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
        }

        .select:focus {
          background: rgba(0,200,255,0.15);
          border-color: rgba(0,200,255,0.35);
          transform: scale(1.02);
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
            className={`input ${invalidFields.includes("order_id") ? "invalid" : ""}`}
            placeholder="Order ID"
            value={updateData.order_id}
            onChange={(e) =>
              setUpdateData({ ...updateData, order_id: e.target.value })
            }
          />

          {/* STATUS DROPDOWN */}
          <select
            className="select"
            value={updateData.status}
            onChange={(e) =>
              setUpdateData({ ...updateData, status: e.target.value })
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
              setUpdateData({ ...updateData, shipping_address: e.target.value })
            }
          />

          {/* DELIVERY METHOD DROPDOWN */}
          <select
            className="select"
            value={updateData.delivery_method}
            onChange={(e) =>
              setUpdateData({ ...updateData, delivery_method: e.target.value })
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
            className={`input ${invalidFields.includes("deleteId") ? "invalid" : ""}`}
            placeholder="Order ID"
            value={deleteId}
            onChange={(e) => setDeleteId(e.target.value)}
          />

          <button className="btn delete-btn" type="submit">
            Delete Order
          </button>
        </form>
      </div>

      <button className="back-btn" onClick={() => navigate("/admin")}>
        ← Back to Admin Dashboard
      </button>
    </div>
  );
}
