import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/login";
import Register from "./pages/register";
import Cart from "./pages/cart";
import Index from "./pages/index";
import Profile from "./pages/profile";
import Orders from "./pages/orders";
import Product from "./pages/product"
import Category from "./pages/category"

import Success from "./pages/payment/sucess"
import Cancel from "./pages/payment/cancel"

import AdminDashboard from "./pages/admin/admin_dashboard"
import AdminProduct from "./pages/admin/admin_product"
import AdminCategories from "./pages/admin/admin_categories"
import AdminOrder from "./pages/admin/admin_orders";



export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Index Page */}
        <Route path="/index" element={<Index />} />

        {/* Product Page */}
        <Route path="/product/:product_id" element={<Product />} />

        {/* Category Page */}
        <Route path="/category/:category_id" element={<Category />} />


        {/* Auth Pages */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Cart Page */}
        <Route path="/cart" element={<Cart />} />

        {/* Orders Page */}
        <Route path="/orders" element={<Orders />} />  {/* <-- ADDED */}

        {/* Profile Page */}
        <Route path="/profile" element={<Profile />} />

        {/* Payment pages Page */}
        <Route path="/payment/success" element={<Success />} />
        <Route path="/payment/cancel" element={<Cancel />} />

        {/* Admin Pages */}
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/products" element={<AdminProduct />} />
        <Route path="/admin/categories" element={<AdminCategories />} />
        <Route path="/admin/orders" element={<AdminOrder />} />

        {/* Temporary Home Redirect */}
        <Route path="/" element={<Navigate to="/index" replace />} />

        {/* 404 Fallback */}
        <Route
          path="*"
          element={<div className="text-white p-6">Page not found.</div>}
        />
      </Routes>
    </BrowserRouter>
  );
}
