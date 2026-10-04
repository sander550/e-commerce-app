import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";

import { useEffect, useState } from "react";
import { useAuth } from "./context/AuthContext";

import Login from "./pages/login";
import Register from "./pages/register";
import Cart from "./pages/cart";
import Index from "./pages/index";
import Profile from "./pages/profile";
import Orders from "./pages/orders";
import Product from "./pages/product";
import Category from "./pages/category";

import Success from "./pages/payment/sucess";
import Cancel from "./pages/payment/cancel";

import AdminDashboard from "./pages/admin/admin_dashboard";
import AdminProduct from "./pages/admin/admin_product";
import AdminCategories from "./pages/admin/admin_categories";
import AdminOrder from "./pages/admin/admin_orders";


/*
 * ProtectedRoute
 *
 * The backend is the source of truth.
 *
 * Even if React still has an old `user` object in memory,
 * we verify the session with /api/auth/profile before
 * allowing a protected page to render.
 */
function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, refreshUser } = useAuth();

  const location = useLocation();

  const [checking, setChecking] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    async function verifyAuthentication() {
      setChecking(true);

      try {
        await refreshUser();
      } finally {
        if (mounted) {
          setChecking(false);
        }
      }
    }

    verifyAuthentication();

    return () => {
      mounted = false;
    };
  }, [location.pathname, refreshUser]);

  /*
   * AuthProvider is still performing its initial
   * authentication check.
   */
  if (loading || checking) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #050505, #0a0f1a)",
          color: "#7feaff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "Inter, sans-serif",
          fontSize: "20px",
        }}
      >
        Checking authentication...
      </div>
    );
  }

  /*
   * Backend said we're not authenticated.
   */
  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location.pathname,
        }}
      />
    );
  }

  /*
   * Authenticated → allow the page to render.
   */
  return <>{children}</>;
}


export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* =========================
            PUBLIC PAGES
        ========================= */}

        <Route
          path="/index"
          element={<Index />}
        />

        <Route
          path="/product/:product_id"
          element={<Product />}
        />

        <Route
          path="/category/:category_id"
          element={<Category />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        <Route
          path="/payment/success"
          element={<Success />}
        />

        <Route
          path="/payment/cancel"
          element={<Cancel />}
        />


        {/* =========================
            PROTECTED PAGES
        ========================= */}

        <Route
          path="/cart"
          element={
            <ProtectedRoute>
              <Cart />
            </ProtectedRoute>
          }
        />

        <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <Orders />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />


        {/* =========================
            ADMIN PAGES
        ========================= */}

        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/products"
          element={
            <ProtectedRoute>
              <AdminProduct />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/categories"
          element={
            <ProtectedRoute>
              <AdminCategories />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/orders"
          element={
            <ProtectedRoute>
              <AdminOrder />
            </ProtectedRoute>
          }
        />


        {/* =========================
            HOME
        ========================= */}

        <Route
          path="/"
          element={
            <Navigate
              to="/index"
              replace
            />
          }
        />


        {/* =========================
            404
        ========================= */}

        <Route
          path="*"
          element={
            <div className="text-white p-6">
              Page not found.
            </div>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}