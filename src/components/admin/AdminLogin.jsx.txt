// src/components/admin/AdminLogin.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

/* Mirror the Cremeo design tokens so the page feels on-brand */
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

export default function AdminLogin() {
  const { login }    = useAuth();
  const navigate     = useNavigate();
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState("");
  const [busy,     setBusy]     = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await login(email, password);
      navigate("/admin", { replace: true });
    } catch (err) {
      setError(friendlyError(err.code));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: C.cream,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: FONT_BODY,
      padding: "24px",
    }}>
      <div style={{
        width: "100%",
        maxWidth: 400,
        background: "#fff",
        border: `1px solid ${C.line}`,
        borderRadius: 6,
        padding: "48px 40px",
        boxShadow: "0 8px 40px rgba(46,26,14,0.08)",
      }}>
        {/* Logo / brand mark */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{
            width: 48, height: 48,
            background: C.espresso,
            borderRadius: "50%",
            margin: "0 auto 16px",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <span style={{ color: C.gold, fontSize: 22, fontFamily: FONT_DISPLAY }}>C</span>
          </div>
          <h1 style={{ fontFamily: FONT_DISPLAY, fontSize: 28, fontWeight: 400, color: C.espresso, margin: 0 }}>
            Cremeo Admin
          </h1>
          <p style={{ color: C.mist, fontSize: 13, marginTop: 6 }}>
            Sign in to continue
          </p>
        </div>

        {error && (
          <div style={{
            background: "#FEF2F2",
            border: "1px solid #FCA5A5",
            borderRadius: 4,
            padding: "10px 14px",
            color: "#DC2626",
            fontSize: 13,
            marginBottom: 20,
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <label style={labelStyle}>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            style={inputStyle}
            placeholder="admin@cremeo.com"
          />

          <label style={{ ...labelStyle, marginTop: 16 }}>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            style={inputStyle}
            placeholder="••••••••"
          />

          <button
            type="submit"
            disabled={busy}
            style={{
              marginTop: 28,
              width: "100%",
              padding: "13px",
              background: busy ? C.mist : C.espresso,
              color: C.cream,
              border: "none",
              borderRadius: 3,
              fontFamily: FONT_BODY,
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              cursor: busy ? "not-allowed" : "pointer",
              transition: "background 0.2s",
            }}
          >
            {busy ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: 24, fontSize: 12, color: C.mist }}>
          <a href="/" style={{ color: C.caramel, textDecoration: "none" }}>
            ← Back to website
          </a>
        </p>
      </div>
    </div>
  );
}

const labelStyle = {
  display: "block",
  fontSize: 12,
  fontWeight: 600,
  letterSpacing: "0.06em",
  textTransform: "uppercase",
  color: "#5C3317",
  marginBottom: 6,
};

const inputStyle = {
  width: "100%",
  padding: "10px 12px",
  border: "1px solid rgba(92,51,23,0.2)",
  borderRadius: 3,
  fontFamily: "'DM Sans', system-ui, sans-serif",
  fontSize: 14,
  color: "#2E1A0E",
  background: "#FAF6EF",
  outline: "none",
  boxSizing: "border-box",
  transition: "border-color 0.2s",
};

function friendlyError(code) {
  switch (code) {
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "Incorrect email or password.";
    case "auth/too-many-requests":
      return "Too many failed attempts. Please try again later.";
    case "auth/network-request-failed":
      return "Network error. Check your connection.";
    default:
      return "Sign-in failed. Please try again.";
  }
}
