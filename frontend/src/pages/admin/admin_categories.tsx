import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

type AdminUser = {
  id: number;
  email: string;
  is_admin: boolean;
};

export default function AdminCategoryPage() {
  const navigate = useNavigate();

  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const [invalidFields, setInvalidFields] = useState<string[]>([]);

  const [createData, setCreateData] = useState({
    name: "",
    parent_id: "",
  });

  const [updateData, setUpdateData] = useState({
    category_id: "",
    name: "",
    parent_id: "",
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

        const json = await res.json();

        if (!res.ok || !json.is_admin) {
          navigate("/index");
          return;
        }

        setUser(json);
      } catch {
        navigate("/index");
      } finally {
        setLoading(false);
      }
    }

    checkAdmin();
  }, [navigate]);

  // -------------------------------
  // VALIDATION HELPERS
  // -------------------------------
  function markInvalid(fields: string[]) {
    setInvalidFields(fields);
  }

  function validateCreate() {
    const missing = [];

    if (!createData.name.trim()) missing.push("name");
    if (createData.parent_id.trim() && isNaN(parseInt(createData.parent_id)))
      missing.push("parent_id");

    if (missing.includes("name")) {
      markInvalid(missing);
      return "Name is required.";
    }

    markInvalid([]);
    return null;
  }

  function validateUpdate() {
    const missing = [];

    if (!updateData.category_id.trim() || isNaN(parseInt(updateData.category_id)))
      missing.push("category_id");

    if (updateData.parent_id.trim() && isNaN(parseInt(updateData.parent_id)))
      missing.push("parent_id");

    if (missing.includes("category_id")) {
      markInvalid(missing);
      return "Category ID is required.";
    }

    markInvalid([]);
    return null;
  }

  function validateDelete() {
    const missing = [];

    if (!deleteId.trim() || isNaN(parseInt(deleteId))) missing.push("deleteId");

    if (missing.length > 0) {
      markInvalid(missing);
      return "Category ID is required.";
    }

    markInvalid([]);
    return null;
  }

  // -------------------------------
  // CREATE CATEGORY
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
      const res = await fetch("http://localhost:8000/admin/category", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: createData.name,
          parent_id: createData.parent_id ? parseInt(createData.parent_id) : null,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        setErrorMsg(json.detail || "Unknown error");
      } else {
        setErrorMsg("Category created!");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed");
    }
  }

  // -------------------------------
  // UPDATE CATEGORY
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
        `http://localhost:8000/admin/category/${updateData.category_id}`,
        {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: updateData.name || null,
            parent_id: updateData.parent_id ? parseInt(updateData.parent_id) : null,
          }),
        }
      );

      const json = await res.json();

      if (!res.ok) {
        setErrorMsg(json.detail || "Unknown error");
      } else {
        setErrorMsg("Category updated!");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed");
    }
  }

  // -------------------------------
  // DELETE CATEGORY
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
        `http://localhost:8000/admin/category/${deleteId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const json = await res.json();

      if (!res.ok) {
        setErrorMsg(json.detail || "Unknown error");
      } else {
        setErrorMsg("Category deleted!");
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

      {/* CREATE CATEGORY */}
      <div className="glass">
        <div className="title">Create Category</div>
        <form onSubmit={handleCreate}>
          <input
            className={`input ${invalidFields.includes("name") ? "invalid" : ""}`}
            placeholder="Name"
            value={createData.name}
            onChange={(e) =>
              setCreateData({ ...createData, name: e.target.value })
            }
          />
          <input
            className={`input ${invalidFields.includes("parent_id") ? "invalid" : ""}`}
            placeholder="Parent ID (optional)"
            value={createData.parent_id}
            onChange={(e) =>
              setCreateData({ ...createData, parent_id: e.target.value })
            }
          />

          <button className="btn" type="submit">
            Create Category
          </button>
        </form>
      </div>

      {/* UPDATE CATEGORY */}
      <div className="glass">
        <div className="title">Update Category</div>
        <form onSubmit={handleUpdate}>
          <input
            className={`input ${invalidFields.includes("category_id") ? "invalid" : ""}`}
            placeholder="Category ID"
            value={updateData.category_id}
            onChange={(e) =>
              setUpdateData({ ...updateData, category_id: e.target.value })
            }
          />
          <input
            className="input"
            placeholder="New Name (optional)"
            value={updateData.name}
            onChange={(e) =>
              setUpdateData({ ...updateData, name: e.target.value })
            }
          />
          <input
            className={`input ${invalidFields.includes("parent_id") ? "invalid" : ""}`}
            placeholder="New Parent ID (optional)"
            value={updateData.parent_id}
            onChange={(e) =>
              setUpdateData({ ...updateData, parent_id: e.target.value })
            }
          />

          <button className="btn" type="submit">
            Update Category
          </button>
        </form>
      </div>

      {/* DELETE CATEGORY */}
      <div className="glass">
        <div className="title">Delete Category</div>
        <form onSubmit={handleDelete}>
          <input
            className={`input ${invalidFields.includes("deleteId") ? "invalid" : ""}`}
            placeholder="Category ID"
            value={deleteId}
            onChange={(e) => setDeleteId(e.target.value)}
          />

          <button className="btn delete-btn" type="submit">
            Delete Category
          </button>
        </form>
      </div>

      <button className="back-btn" onClick={() => navigate("/admin")}>
        ← Back to Admin Dashboard
      </button>
    </div>
  );
}
