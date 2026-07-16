// src/pages/admin/AdminLayout.jsx
// Shared admin shell: top header + sidebar navigation + <Outlet /> for page content.
// ProtectedRoute wraps this component in App.jsx, so auth is already guaranteed here.
import React, { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import {
  LayoutDashboard,
  Package,
  Tag,
  ShoppingCart,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";

/* ── Design tokens (mirrors the Cremeo palette) ── */
const C = {
  cream:     "#FAF6EF",
  creamDeep: "#F0E9DC",
  chocolate: "#5C3317",
  espresso:  "#2E1A0E",
  gold:      "#C9A84C",
  goldLight: "#E2C97E",
  caramel:   "#C8956B",
  mist:      "#7A6558",
  line:      "rgba(92,51,23,0.12)",
};
const FONT_DISPLAY = "'Cormorant Garamond', Georgia, serif";
const FONT_BODY    = "'DM Sans', system-ui, sans-serif";

const NAV_ITEMS = [
  { to: "/admin",            label: "Dashboard",  icon: <LayoutDashboard size={16} />, end: true },
  { to: "/admin/products",   label: "Products",   icon: <Package          size={16} /> },
  { to: "/admin/categories", label: "Categories", icon: <Tag              size={16} /> },
  { to: "/admin/orders",     label: "Orders",     icon: <ShoppingCart     size={16} /> },
  { to: "/admin/settings",   label: "Settings",   icon: <Settings         size={16} /> },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate         = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/admin/login", { replace: true });
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: FONT_BODY, background: C.creamDeep }}>

      {/* ── Sidebar ───────────────────────────────────── */}
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          role="presentation"
          onClick={() => setSidebarOpen(false)}
          style={{
            position: "fixed", inset: 0,
            background: "rgba(46,26,14,0.45)",
            zIndex: 100,
          }}
        />
      )}

      <aside style={{
        width: 220,
        flexShrink: 0,
        background: C.espresso,
        display: "flex",
        flexDirection: "column",
        position: "fixed",
        top: 0, bottom: 0, left: 0,
        zIndex: 200,
        transform: sidebarOpen ? "translateX(0)" : undefined,
        // On desktop always visible; on mobile hide unless open
        "@media (max-width: 768px)": {
          transform: sidebarOpen ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.25s ease",
        },
      }}>
        {/* Brand */}
        <div style={{
          padding: "24px 20px 20px",
          borderBottom: "1px solid rgba(250,246,239,0.08)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div>
            <p style={{ fontFamily: FONT_DISPLAY, fontSize: 22, color: C.gold, fontWeight: 400, lineHeight: 1 }}>
              Cremeo
            </p>
            <p style={{ fontFamily: FONT_BODY, fontSize: 9, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(201,168,76,0.55)", marginTop: 3 }}>
              Admin Panel
            </p>
          </div>
          {/* Close button (mobile) */}
          <button
            onClick={() => setSidebarOpen(false)}
            style={{ background: "none", border: "none", cursor: "pointer", color: C.mist, padding: 4 }}
            aria-label="Close sidebar"
          >
            <X size={16} />
          </button>
        </div>

        {/* Nav links */}
        <nav style={{ flex: 1, padding: "12px 0", overflowY: "auto" }}>
          {NAV_ITEMS.map(({ to, label, icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => setSidebarOpen(false)}
              style={({ isActive }) => ({
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "11px 20px",
                textDecoration: "none",
                fontFamily: FONT_BODY,
                fontSize: 13,
                fontWeight: isActive ? 600 : 400,
                color: isActive ? C.goldLight : "rgba(250,246,239,0.55)",
                background: isActive ? "rgba(201,168,76,0.10)" : "transparent",
                borderLeft: isActive ? `2px solid ${C.gold}` : "2px solid transparent",
                transition: "color 0.18s, background 0.18s",
              })}
            >
              {icon}
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User + Logout */}
        <div style={{
          padding: "16px 20px",
          borderTop: "1px solid rgba(250,246,239,0.08)",
        }}>
          <p style={{ fontSize: 11, color: "rgba(250,246,239,0.4)", marginBottom: 10, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {user?.email}
          </p>
          <button
            onClick={handleLogout}
            style={{
              display: "flex", alignItems: "center", gap: 7,
              width: "100%",
              padding: "8px 12px",
              background: "transparent",
              border: "1px solid rgba(201,168,76,0.3)",
              borderRadius: 3,
              color: C.gold,
              fontFamily: FONT_BODY,
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              cursor: "pointer",
              transition: "border-color 0.2s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = C.gold; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(201,168,76,0.3)"; }}
          >
            <LogOut size={13} /> Logout
          </button>
        </div>
      </aside>

      {/* ── Main column ──────────────────────────────── */}
      <div style={{ flex: 1, marginLeft: 220, display: "flex", flexDirection: "column", minWidth: 0 }}>

        {/* Top header */}
        <header style={{
          height: 56,
          background: "#fff",
          borderBottom: `1px solid ${C.line}`,
          display: "flex",
          alignItems: "center",
          padding: "0 28px",
          gap: 12,
          flexShrink: 0,
          position: "sticky",
          top: 0,
          zIndex: 50,
        }}>
          {/* Hamburger (mobile) */}
          <button
            onClick={() => setSidebarOpen(true)}
            style={{ background: "none", border: "none", cursor: "pointer", color: C.mist, padding: 4, marginRight: 4 }}
            aria-label="Open sidebar"
          >
            <Menu size={18} />
          </button>

          <a
            href="/"
            style={{ fontSize: 12, color: C.caramel, textDecoration: "none", marginLeft: "auto" }}
          >
            ← View public website
          </a>
        </header>

        {/* Page content */}
        <main style={{ flex: 1, padding: "40px 32px", maxWidth: 1100, width: "100%" }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
