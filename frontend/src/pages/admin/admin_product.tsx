import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function getErrorMessage(json: any, fallback: string) {
  if (typeof json?.detail === "string") return json.detail;
  if (typeof json?.message === "string") return json.message;
  if (typeof json?.error === "string") return json.error;
  return fallback;
}

export default function AdminProductPage() {
  const navigate = useNavigate();

  const { user, loading: authLoading } = useAuth();

  const [errorMsg, setErrorMsg] = useState("");
  const [invalidFields, setInvalidFields] = useState<string[]>([]);

  const [createData, setCreateData] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    category_id: "",
    image_url: "",
  });

  const [updateData, setUpdateData] = useState({
    product_id: "",
    name: "",
    description: "",
    price: "",
    stock: "",
    category_id: "",
    image_url: "",
    is_active: "",
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
        state: { from: "/admin/products" },
      });
      return;
    }

    if (!user.is_admin) {
      navigate("/", { replace: true });
    }
  }, [authLoading, user, navigate]);

  // -------------------------------
  // VALIDATION HELPERS
  // -------------------------------
  function markInvalid(fields: string[]) {
    setInvalidFields(fields);
  }

  function validateCreate() {
    const missing: string[] = [];

    if (!createData.name.trim()) {
      missing.push("name");
    }

    if (
      !createData.price.trim() ||
      isNaN(parseFloat(createData.price))
    ) {
      missing.push("price");
    }

    if (
      !createData.stock.trim() ||
      isNaN(parseInt(createData.stock))
    ) {
      missing.push("stock");
    }

    if (
      !createData.category_id.trim() ||
      isNaN(parseInt(createData.category_id))
    ) {
      missing.push("category_id");
    }

    if (missing.length > 0) {
      markInvalid(missing);
      return "Please fill all required fields.";
    }

    markInvalid([]);
    return null;
  }

  function validateUpdate() {
    const missing: string[] = [];

    if (
      !updateData.product_id.trim() ||
      isNaN(parseInt(updateData.product_id))
    ) {
      missing.push("product_id");
    }

    if (missing.length > 0) {
      markInvalid(missing);
      return "Product ID is required.";
    }

    markInvalid([]);
    return null;
  }

  function validateDelete() {
    const missing: string[] = [];

    if (
      !deleteId.trim() ||
      isNaN(parseInt(deleteId))
    ) {
      missing.push("deleteId");
    }

    if (missing.length > 0) {
      markInvalid(missing);
      return "Product ID is required.";
    }

    markInvalid([]);
    return null;
  }

  // -------------------------------
  // HANDLE API ERRORS
  // -------------------------------
  function handleAuthError(status: number, json: any) {
    if (status === 401) {
      navigate("/login", {
        replace: true,
        state: { from: "/admin/products" },
      });

      return true;
    }

    if (status === 403) {
      setErrorMsg(
        getErrorMessage(
          json,
          "You do not have permission to perform this action."
        )
      );

      return true;
    }

    if (status === 429) {
      setErrorMsg(
        getErrorMessage(
          json,
          "Too many requests. Please wait a moment and try again."
        )
      );

      return true;
    }

    return false;
  }

  // -------------------------------
  // CREATE PRODUCT
  // -------------------------------
  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMsg("");

    const validation = validateCreate();

    if (validation) {
      setErrorMsg(validation);
      return;
    }

    try {
      const res = await fetch("/api/admin/product", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: createData.name,
          description: createData.description || null,
          price: parseFloat(createData.price),
          stock: parseInt(createData.stock),
          category_id: parseInt(createData.category_id),
          image_url: createData.image_url || null,
        }),
      });

      let json: any = {};

      try {
        json = await res.json();
      } catch {
        json = {};
      }

      if (handleAuthError(res.status, json)) {
        return;
      }

      if (!res.ok) {
        setErrorMsg(
          getErrorMessage(json, "Failed to create product.")
        );
        return;
      }

      setErrorMsg("Product created!");

      setCreateData({
        name: "",
        description: "",
        price: "",
        stock: "",
        category_id: "",
        image_url: "",
      });

      setInvalidFields([]);
    } catch (err: any) {
      console.error("Create product error:", err);

      setErrorMsg(
        err?.message || "Unable to connect to the server."
      );
    }
  }

  // -------------------------------
  // UPDATE PRODUCT
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
        `/api/admin/product/${updateData.product_id}`,
        {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: updateData.name || null,
            description: updateData.description || null,
            price: updateData.price
              ? parseFloat(updateData.price)
              : null,
            stock: updateData.stock
              ? parseInt(updateData.stock)
              : null,
            category_id: updateData.category_id
              ? parseInt(updateData.category_id)
              : null,
            image_url: updateData.image_url || null,
            is_active:
              updateData.is_active === ""
                ? null
                : updateData.is_active === "true",
          }),
        }
      );

      let json: any = {};

      try {
        json = await res.json();
      } catch {
        json = {};
      }

      if (handleAuthError(res.status, json)) {
        return;
      }

      if (!res.ok) {
        setErrorMsg(
          getErrorMessage(json, "Failed to update product.")
        );
        return;
      }

      setErrorMsg("Product updated!");
      setInvalidFields([]);
    } catch (err: any) {
      console.error("Update product error:", err);

      setErrorMsg(
        err?.message || "Unable to connect to the server."
      );
    }
  }

  // -------------------------------
  // DELETE PRODUCT
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
        `/api/admin/product/${deleteId}`,
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

      if (handleAuthError(res.status, json)) {
        return;
      }

      if (!res.ok) {
        setErrorMsg(
          getErrorMessage(json, "Failed to delete product.")
        );
        return;
      }

      setErrorMsg("Product deleted!");
      setDeleteId("");
      setInvalidFields([]);
    } catch (err: any) {
      console.error("Delete product error:", err);

      setErrorMsg(
        err?.message || "Unable to connect to the server."
      );
    }
  }

  // -------------------------------
  // AUTH LOADING SCREEN
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

      {errorMsg && (
        <div className="error-box">
          {errorMsg}
        </div>
      )}

      {/* CREATE PRODUCT */}
      <div className="glass">
        <div className="title">Create Product</div>

        <form onSubmit={handleCreate}>
          <input
            className={`input ${
              invalidFields.includes("name")
                ? "invalid"
                : ""
            }`}
            placeholder="Name"
            value={createData.name}
            onChange={(e) =>
              setCreateData({
                ...createData,
                name: e.target.value,
              })
            }
          />

          <input
            className="input"
            placeholder="Description (optional)"
            value={createData.description}
            onChange={(e) =>
              setCreateData({
                ...createData,
                description: e.target.value,
              })
            }
          />

          <input
            className={`input ${
              invalidFields.includes("price")
                ? "invalid"
                : ""
            }`}
            placeholder="Price"
            value={createData.price}
            onChange={(e) =>
              setCreateData({
                ...createData,
                price: e.target.value,
              })
            }
          />

          <input
            className={`input ${
              invalidFields.includes("stock")
                ? "invalid"
                : ""
            }`}
            placeholder="Stock"
            value={createData.stock}
            onChange={(e) =>
              setCreateData({
                ...createData,
                stock: e.target.value,
              })
            }
          />

          <input
            className={`input ${
              invalidFields.includes("category_id")
                ? "invalid"
                : ""
            }`}
            placeholder="Category ID"
            value={createData.category_id}
            onChange={(e) =>
              setCreateData({
                ...createData,
                category_id: e.target.value,
              })
            }
          />

          <input
            className="input"
            placeholder="Image URL (optional)"
            value={createData.image_url}
            onChange={(e) =>
              setCreateData({
                ...createData,
                image_url: e.target.value,
              })
            }
          />

          <button className="btn" type="submit">
            Create Product
          </button>
        </form>
      </div>

      {/* UPDATE PRODUCT */}
      <div className="glass">
        <div className="title">Update Product</div>

        <form onSubmit={handleUpdate}>
          <input
            className={`input ${
              invalidFields.includes("product_id")
                ? "invalid"
                : ""
            }`}
            placeholder="Product ID"
            value={updateData.product_id}
            onChange={(e) =>
              setUpdateData({
                ...updateData,
                product_id: e.target.value,
              })
            }
          />

          <input
            className="input"
            placeholder="Name (optional)"
            value={updateData.name}
            onChange={(e) =>
              setUpdateData({
                ...updateData,
                name: e.target.value,
              })
            }
          />

          <input
            className="input"
            placeholder="Description (optional)"
            value={updateData.description}
            onChange={(e) =>
              setUpdateData({
                ...updateData,
                description: e.target.value,
              })
            }
          />

          <input
            className="input"
            placeholder="Price (optional)"
            value={updateData.price}
            onChange={(e) =>
              setUpdateData({
                ...updateData,
                price: e.target.value,
              })
            }
          />

          <input
            className="input"
            placeholder="Stock (optional)"
            value={updateData.stock}
            onChange={(e) =>
              setUpdateData({
                ...updateData,
                stock: e.target.value,
              })
            }
          />

          <input
            className="input"
            placeholder="Category ID (optional)"
            value={updateData.category_id}
            onChange={(e) =>
              setUpdateData({
                ...updateData,
                category_id: e.target.value,
              })
            }
          />

          <input
            className="input"
            placeholder="Image URL (optional)"
            value={updateData.image_url}
            onChange={(e) =>
              setUpdateData({
                ...updateData,
                image_url: e.target.value,
              })
            }
          />

          <input
            className="input"
            placeholder="Is Active (true/false)"
            value={updateData.is_active}
            onChange={(e) =>
              setUpdateData({
                ...updateData,
                is_active: e.target.value,
              })
            }
          />

          <button className="btn" type="submit">
            Update Product
          </button>
        </form>
      </div>

      {/* DELETE PRODUCT */}
      <div className="glass">
        <div className="title">Delete Product</div>

        <form onSubmit={handleDelete}>
          <input
            className={`input ${
              invalidFields.includes("deleteId")
                ? "invalid"
                : ""
            }`}
            placeholder="Product ID"
            value={deleteId}
            onChange={(e) =>
              setDeleteId(e.target.value)
            }
          />

          <button
            className="btn delete-btn"
            type="submit"
          >
            Delete Product
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