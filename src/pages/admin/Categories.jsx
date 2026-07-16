// src/pages/admin/Categories.jsx
// Rendered inside AdminLayout via <Outlet />.
import React from "react";

const C = {
  espresso: "#2E1A0E",
  gold:     "#C9A84C",
  mist:     "#7A6558",
  line:     "rgba(92,51,23,0.12)",
};
const FONT_DISPLAY = "'Cormorant Garamond', Georgia, serif";
const FONT_BODY    = "'DM Sans', system-ui, sans-serif";

export default function Categories() {
  return (
    <div style={{ fontFamily: FONT_BODY }}>
      <h1 style={{ fontFamily: FONT_DISPLAY, fontSize: 36, fontWeight: 400, color: C.espresso, marginBottom: 8 }}>
        Categories
      </h1>
      <div style={{ width: 56, height: 1.5, background: C.gold, marginBottom: 32 }} />
      <p style={{ color: C.mist, fontSize: 14 }}>
        Categories management coming in Phase 2.
      </p>
    </div>
  );
}
