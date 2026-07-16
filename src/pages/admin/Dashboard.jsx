// src/pages/admin/Dashboard.jsx
// Rendered inside AdminLayout via <Outlet />.
import React from "react";
import { useAuth } from "../../context/AuthContext.jsx";

const C = {
  cream:     "#FAF6EF",
  creamDeep: "#F0E9DC",
  chocolate: "#5C3317",
  espresso:  "#2E1A0E",
  gold:      "#C9A84C",
  caramel:   "#C8956B",
  mist:      "#7A6558",
  line:      "rgba(92,51,23,0.12)",
};
const FONT_DISPLAY = "'Cormorant Garamond', Georgia, serif";
const FONT_BODY    = "'DM Sans', system-ui, sans-serif";

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div style={{ fontFamily: FONT_BODY }}>
      <h1 style={{ fontFamily: FONT_DISPLAY, fontSize: 36, fontWeight: 400, color: C.espresso, marginBottom: 8 }}>
        Dashboard
      </h1>
      <div style={{ width: 56, height: 1.5, background: C.gold, marginBottom: 32 }} />

      <div style={{
        background: "#fff",
        border: `1px solid ${C.line}`,
        borderRadius: 6,
        padding: 32,
        boxShadow: "0 2px 12px rgba(46,26,14,0.06)",
      }}>
        <p style={{ color: C.mist, fontSize: 15, lineHeight: 1.6 }}>
          Welcome back! You're signed in as <strong style={{ color: C.chocolate }}>{user?.email}</strong>.
        </p>
        <p style={{ color: C.mist, fontSize: 14, marginTop: 12 }}>
          Build your admin features here — this route is fully protected by Firebase Authentication.
        </p>
      </div>
    </div>
  );
}
