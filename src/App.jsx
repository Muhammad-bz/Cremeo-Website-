// src/App.jsx
// Lightweight router — no business logic lives here.
import React from "react";
import { Routes, Route } from "react-router-dom";

import PublicSite    from "./pages/PublicSite.jsx";
import AdminLogin    from "./components/admin/AdminLogin.jsx";
import ProtectedRoute from "./components/admin/ProtectedRoute.jsx";
import AdminLayout   from "./pages/admin/AdminLayout.jsx";
import Dashboard     from "./pages/admin/Dashboard.jsx";
import Products      from "./pages/admin/Products.jsx";
import Categories    from "./pages/admin/Categories.jsx";
import Orders        from "./pages/admin/Orders.jsx";
import Settings      from "./pages/admin/Settings.jsx";

export default function App() {
  return (
    <Routes>
      {/* ── Admin: public login ─────────────────────────── */}
      <Route path="/admin/login" element={<AdminLogin />} />

      {/* ── Admin: protected nested routes ──────────────── */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index          element={<Dashboard  />} />
        <Route path="products"   element={<Products   />} />
        <Route path="categories" element={<Categories />} />
        <Route path="orders"     element={<Orders     />} />
        <Route path="settings"   element={<Settings   />} />
      </Route>

      {/* ── Public customer-facing website ──────────────── */}
      <Route path="*" element={<PublicSite />} />
    </Routes>
  );
}
