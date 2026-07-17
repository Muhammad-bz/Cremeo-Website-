// src/pages/admin/Dashboard.jsx
// Phase 7 — Live Firestore data. Real-time listeners for products + orders.
import React, { useState, useEffect, useMemo } from "react";
import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
  Timestamp,
} from "firebase/firestore";
import { db } from "../../firebase/config";
import { useAuth } from "../../context/AuthContext.jsx";
import {
  Package,
  ShoppingCart,
  Clock,
  CheckCircle2,
  Banknote,
  TrendingUp,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";

/* ─────────────────────────────────────────────────
   DESIGN TOKENS
───────────────────────────────────────────────── */
const C = {
  cream:     "#FAF6EF",
  creamDeep: "#F0E9DC",
  parchment: "#E8DDD0",
  chocolate: "#5C3317",
  espresso:  "#2E1A0E",
  gold:      "#C9A84C",
  goldLight: "#E2C97E",
  caramel:   "#C8956B",
  mist:      "#7A6558",
  line:      "rgba(92,51,23,0.12)",
  lineStrong:"rgba(92,51,23,0.20)",
  green:     "#22A84A",
  greenBg:   "rgba(34,168,74,0.09)",
  greenBdr:  "rgba(34,168,74,0.25)",
  amber:     "#A0620D",
  amberBg:   "rgba(201,168,76,0.11)",
  amberBdr:  "rgba(201,168,76,0.32)",
  red:       "#C0392B",
  redBg:     "rgba(192,57,43,0.07)",
  redBdr:    "rgba(192,57,43,0.22)",
};
const FONT_DISPLAY = "'Cormorant Garamond', Georgia, serif";
const FONT_BODY    = "'DM Sans', system-ui, sans-serif";

/* ─────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────── */
function tsToDate(ts) {
  if (!ts) return null;
  if (ts instanceof Timestamp) return ts.toDate();
  if (ts.seconds) return new Date(ts.seconds * 1000);
  return null;
}

function fmtDate(ts) {
  const d = tsToDate(ts);
  if (!d) return "—";
  return d.toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" });
}

function fmtAgo(ts) {
  const d = tsToDate(ts);
  if (!d) return "—";
  const diff = Date.now() - d.getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)   return "just now";
  if (m < 60)  return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24)  return `${h}h ago`;
  const days = Math.floor(h / 24);
  return `${days}d ago`;
}

function fmtMoney(n) {
  return `Rs. ${Number(n || 0).toLocaleString()}`;
}

const STATUS_META = {
  pending:    { label: "Pending",    color: C.amber,     bg: C.amberBg,  border: C.amberBdr, dot: C.gold   },
  processing: { label: "Processing", color: "#7C4A1E",   bg: "rgba(200,149,107,0.14)", border: "rgba(200,149,107,0.38)", dot: C.caramel },
  completed:  { label: "Completed",  color: "#1E5C32",   bg: C.greenBg,  border: C.greenBdr, dot: C.green  },
  delivered:  { label: "Delivered",  color: "#1E5C32",   bg: C.greenBg,  border: C.greenBdr, dot: C.green  },
  cancelled:  { label: "Cancelled",  color: C.red,       bg: C.redBg,    border: C.redBdr,   dot: C.red    },
};

function normStatus(raw) {
  return (raw ?? "pending").toLowerCase();
}

/* ─────────────────────────────────────────────────
   FIRESTORE HOOKS
───────────────────────────────────────────────── */
function useProducts() {
  const [products, setProducts] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);

  useEffect(() => {
    const q = query(
      collection(db, "products"),
      orderBy("createdAt", "desc"),
      limit(5)
    );
    const unsub = onSnapshot(
      q,
      (snap) => {
        setProducts(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoading(false);
        setError(null);
      },
      (err) => { setError(err.message); setLoading(false); }
    );
    return () => unsub();
  }, []);

  return { products, loading, error };
}

function useOrders() {
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    const q = query(
      collection(db, "orders"),
      orderBy("createdAt", "desc")
    );
    const unsub = onSnapshot(
      q,
      (snap) => {
        setOrders(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoading(false);
        setError(null);
      },
      (err) => { setError(err.message); setLoading(false); }
    );
    return () => unsub();
  }, []);

  return { orders, loading, error };
}

/* ─────────────────────────────────────────────────
   COMPONENT-SCOPED STYLES
───────────────────────────────────────────────── */
function DashStyles() {
  return (
    <style>{`
      /* ── Stat cards ── */
      .dash-stat-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
        gap: 14px;
        margin-bottom: 28px;
      }
      .dash-stat-card {
        background: #fff;
        border: 1px solid ${C.line};
        border-radius: 10px;
        padding: 20px 22px;
        display: flex;
        align-items: flex-start;
        gap: 14px;
        box-shadow: 0 1px 3px rgba(46,26,14,0.05);
        animation: dash-rise 0.38s ease both;
        transition: box-shadow 0.2s, transform 0.2s;
      }
      .dash-stat-card:hover {
        box-shadow: 0 4px 18px rgba(46,26,14,0.09);
        transform: translateY(-1px);
      }
      .dash-stat-icon {
        width: 40px; height: 40px;
        border-radius: 9px;
        display: flex; align-items: center; justify-content: center;
        flex-shrink: 0;
      }
      .dash-stat-label {
        font-family: ${FONT_BODY};
        font-size: 10.5px;
        font-weight: 600;
        letter-spacing: 0.07em;
        text-transform: uppercase;
        color: ${C.mist};
        margin-bottom: 5px;
      }
      .dash-stat-value {
        font-family: ${FONT_DISPLAY};
        font-size: 30px;
        font-weight: 400;
        color: ${C.espresso};
        line-height: 1;
      }
      .dash-stat-sub {
        font-family: ${FONT_BODY};
        font-size: 11px;
        color: ${C.mist};
        margin-top: 4px;
        opacity: 0.75;
      }

      /* ── Two-col section grid ── */
      .dash-section-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 18px;
      }
      @media (max-width: 820px) {
        .dash-section-grid { grid-template-columns: 1fr; }
      }

      /* ── Panel card ── */
      .dash-panel {
        background: #fff;
        border: 1px solid ${C.line};
        border-radius: 10px;
        overflow: hidden;
        box-shadow: 0 1px 3px rgba(46,26,14,0.05);
        animation: dash-rise 0.42s ease both;
        animation-delay: 0.08s;
      }
      .dash-panel-header {
        padding: 14px 18px;
        border-bottom: 1px solid ${C.line};
        display: flex;
        align-items: center;
        justify-content: space-between;
        background: ${C.cream};
      }
      .dash-panel-title {
        font-family: ${FONT_DISPLAY};
        font-size: 18px;
        font-weight: 400;
        color: ${C.espresso};
      }
      .dash-panel-count {
        font-family: ${FONT_BODY};
        font-size: 11px;
        font-weight: 600;
        color: ${C.mist};
        background: ${C.creamDeep};
        border: 1px solid ${C.line};
        border-radius: 20px;
        padding: 2px 9px;
      }

      /* ── Order rows ── */
      .dash-order-row {
        display: flex;
        align-items: flex-start;
        gap: 12px;
        padding: 12px 18px;
        border-bottom: 1px solid rgba(92,51,23,0.06);
        transition: background 0.15s;
        animation: dash-row-in 0.28s ease both;
      }
      .dash-order-row:last-child { border-bottom: none; }
      .dash-order-row:hover { background: ${C.cream}; }

      /* ── Product rows ── */
      .dash-product-row {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 11px 18px;
        border-bottom: 1px solid rgba(92,51,23,0.06);
        transition: background 0.15s;
        animation: dash-row-in 0.28s ease both;
      }
      .dash-product-row:last-child { border-bottom: none; }
      .dash-product-row:hover { background: ${C.cream}; }
      .dash-product-thumb {
        width: 42px; height: 42px;
        border-radius: 5px;
        object-fit: cover;
        flex-shrink: 0;
        background: ${C.creamDeep};
        border: 1px solid ${C.line};
      }
      .dash-product-thumb-fallback {
        width: 42px; height: 42px;
        border-radius: 5px;
        background: ${C.creamDeep};
        border: 1px solid ${C.line};
        flex-shrink: 0;
        display: flex; align-items: center; justify-content: center;
      }

      /* ── Status badge ── */
      .dash-badge {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        padding: 2px 8px 2px 6px;
        border-radius: 20px;
        font-family: ${FONT_BODY};
        font-size: 11px;
        font-weight: 600;
        white-space: nowrap;
      }

      /* ── Empty / loading ── */
      .dash-empty {
        padding: 36px 18px;
        text-align: center;
        font-family: ${FONT_BODY};
        font-size: 13px;
        color: ${C.mist};
      }
      .dash-loading {
        display: flex; align-items: center; justify-content: center;
        gap: 8px;
        padding: 36px 18px;
        font-family: ${FONT_BODY};
        font-size: 13px;
        color: ${C.mist};
      }
      .dash-spin { animation: dash-spin 1s linear infinite; }

      /* ── Welcome card ── */
      .dash-welcome {
        background: linear-gradient(110deg, ${C.chocolate} 0%, #3d1f0b 100%);
        border-radius: 10px;
        padding: 22px 26px;
        margin-bottom: 24px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        box-shadow: 0 2px 12px rgba(46,26,14,0.15);
        animation: dash-rise 0.3s ease;
      }

      /* ── Animations ── */
      @keyframes dash-rise {
        from { opacity: 0; transform: translateY(10px); }
        to   { opacity: 1; transform: translateY(0);    }
      }
      @keyframes dash-row-in {
        from { opacity: 0; transform: translateX(-4px); }
        to   { opacity: 1; transform: translateX(0);    }
      }
      @keyframes dash-spin {
        to { transform: rotate(360deg); }
      }

      /* ── Responsive ── */
      @media (max-width: 600px) {
        .dash-stat-grid { grid-template-columns: 1fr 1fr; gap: 10px; }
        .dash-stat-card { padding: 14px 14px; }
        .dash-stat-value { font-size: 24px; }
        .dash-welcome { flex-direction: column; align-items: flex-start; }
      }
      @media (max-width: 360px) {
        .dash-stat-grid { grid-template-columns: 1fr; }
      }

      /* ── Reduced motion ── */
      @media (prefers-reduced-motion: reduce) {
        .dash-stat-card, .dash-panel,
        .dash-order-row, .dash-product-row,
        .dash-welcome { animation: none !important; }
        .dash-stat-card:hover { transform: none !important; }
        .dash-spin { animation: none !important; }
      }
    `}</style>
  );
}

/* ─────────────────────────────────────────────────
   STAT CARD
───────────────────────────────────────────────── */
function StatCard({ icon: Icon, iconColor, iconBg, label, value, sub, delay = 0 }) {
  return (
    <div className="dash-stat-card" style={{ animationDelay: `${delay}s` }}>
      <div className="dash-stat-icon" style={{ background: iconBg }}>
        <Icon size={18} color={iconColor} />
      </div>
      <div style={{ minWidth: 0 }}>
        <p className="dash-stat-label">{label}</p>
        <p className="dash-stat-value">{value}</p>
        {sub && <p className="dash-stat-sub">{sub}</p>}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────
   STATUS BADGE
───────────────────────────────────────────────── */
function StatusBadge({ status }) {
  const s = STATUS_META[normStatus(status)] ?? STATUS_META.pending;
  return (
    <span
      className="dash-badge"
      style={{ background: s.bg, border: `1px solid ${s.border}`, color: s.color }}
    >
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.dot, flexShrink: 0 }} />
      {s.label}
    </span>
  );
}

/* ─────────────────────────────────────────────────
   RECENT ORDERS PANEL
───────────────────────────────────────────────── */
function RecentOrders({ orders, loading, error }) {
  const recent = useMemo(() => orders.slice(0, 6), [orders]);

  return (
    <div className="dash-panel">
      <div className="dash-panel-header">
        <span className="dash-panel-title">Recent Orders</span>
        {!loading && <span className="dash-panel-count">{orders.length} total</span>}
      </div>

      {loading && (
        <div className="dash-loading">
          <RefreshCw size={14} className="dash-spin" /> Loading…
        </div>
      )}

      {error && !loading && (
        <div className="dash-empty" style={{ color: C.red }}>
          <AlertTriangle size={14} style={{ marginBottom: 4 }} /><br />{error}
        </div>
      )}

      {!loading && !error && recent.length === 0 && (
        <div className="dash-empty">No orders yet.</div>
      )}

      {!loading && !error && recent.map((order, i) => {
        const itemCount = Array.isArray(order.items) ? order.items.length : 0;
        return (
          <div
            key={order.id}
            className="dash-order-row"
            style={{ animationDelay: `${i * 0.04}s` }}
          >
            {/* Left col */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                <span style={{
                  fontFamily: FONT_BODY, fontSize: 11.5, fontWeight: 700,
                  color: C.chocolate, letterSpacing: "0.04em",
                  background: C.creamDeep, border: `1px solid ${C.line}`,
                  borderRadius: 4, padding: "1px 7px",
                }}>
                  #{order.id.slice(-6).toUpperCase()}
                </span>
                <StatusBadge status={order.status} />
              </div>
              <p style={{
                fontFamily: FONT_BODY, fontSize: 13, fontWeight: 500,
                color: C.espresso, marginBottom: 1,
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}>
                {order.customerName ?? order.customer ?? "—"}
              </p>
              <p style={{ fontFamily: FONT_BODY, fontSize: 11.5, color: C.mist, opacity: 0.8 }}>
                {itemCount} item{itemCount !== 1 ? "s" : ""} · {fmtAgo(order.createdAt)}
              </p>
            </div>

            {/* Right col */}
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <p style={{
                fontFamily: FONT_DISPLAY, fontSize: 17, fontWeight: 500,
                color: C.espresso, whiteSpace: "nowrap",
              }}>
                {fmtMoney(order.total)}
              </p>
              <p style={{ fontFamily: FONT_BODY, fontSize: 11, color: C.mist, marginTop: 2 }}>
                {fmtDate(order.createdAt)}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ─────────────────────────────────────────────────
   RECENT PRODUCTS PANEL
───────────────────────────────────────────────── */
function RecentProducts({ products, loading, error }) {
  return (
    <div className="dash-panel">
      <div className="dash-panel-header">
        <span className="dash-panel-title">Recent Products</span>
        {!loading && <span className="dash-panel-count">{products.length} shown</span>}
      </div>

      {loading && (
        <div className="dash-loading">
          <RefreshCw size={14} className="dash-spin" /> Loading…
        </div>
      )}

      {error && !loading && (
        <div className="dash-empty" style={{ color: C.red }}>
          <AlertTriangle size={14} style={{ marginBottom: 4 }} /><br />{error}
        </div>
      )}

      {!loading && !error && products.length === 0 && (
        <div className="dash-empty">No products yet.</div>
      )}

      {!loading && !error && products.map((p, i) => (
        <div
          key={p.id}
          className="dash-product-row"
          style={{ animationDelay: `${i * 0.04}s` }}
        >
          {p.imageUrl ? (
            <img
              src={p.imageUrl}
              alt={p.name}
              className="dash-product-thumb"
              loading="lazy"
              onError={(e) => { e.currentTarget.style.display = "none"; }}
            />
          ) : (
            <div className="dash-product-thumb-fallback">
              <Package size={16} color={C.mist} opacity={0.5} />
            </div>
          )}

          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{
              fontFamily: FONT_BODY, fontSize: 13.5, fontWeight: 500,
              color: C.espresso, marginBottom: 2,
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>
              {p.name ?? "Unnamed"}
            </p>
            <p style={{ fontFamily: FONT_BODY, fontSize: 11.5, color: C.mist }}>
              {p.category ?? "—"}
            </p>
          </div>

          <div style={{ textAlign: "right", flexShrink: 0 }}>
            <p style={{
              fontFamily: FONT_DISPLAY, fontSize: 16, fontWeight: 500,
              color: C.espresso, whiteSpace: "nowrap",
            }}>
              {fmtMoney(p.price)}
            </p>
            <p style={{ fontFamily: FONT_BODY, fontSize: 11, color: C.mist, marginTop: 2 }}>
              {fmtAgo(p.createdAt)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────
   MAIN DASHBOARD
───────────────────────────────────────────────── */
export default function Dashboard() {
  const { user } = useAuth();

  const { products, loading: prodLoading, error: prodError } = useProducts();
  const { orders,   loading: ordLoading,  error: ordError  } = useOrders();

  /* ── Derived stats ── */
  const stats = useMemo(() => {
    const pending   = orders.filter((o) => normStatus(o.status) === "pending").length;
    const delivered = orders.filter((o) =>
      ["completed", "delivered"].includes(normStatus(o.status))
    ).length;
    const revenue   = orders
      .filter((o) => ["completed", "delivered"].includes(normStatus(o.status)))
      .reduce((s, o) => s + (Number(o.total) || 0), 0);

    return {
      totalProducts: products.length,
      totalOrders:   orders.length,
      pending,
      delivered,
      revenue,
    };
  }, [products, orders]);

  const anyLoading = prodLoading || ordLoading;

  return (
    <>
      <DashStyles />
      <div style={{ fontFamily: FONT_BODY }}>

        {/* ── Page heading ── */}
        <h1 style={{
          fontFamily: FONT_DISPLAY, fontSize: 36, fontWeight: 400,
          color: C.espresso, marginBottom: 8,
        }}>
          Dashboard
        </h1>
        <div style={{ width: 56, height: 1.5, background: C.gold, marginBottom: 28 }} />

        {/* ── Welcome banner ── */}
        <div className="dash-welcome">
          <div>
            <p style={{
              fontFamily: FONT_DISPLAY, fontSize: 22, fontWeight: 400,
              color: "#fff", marginBottom: 4,
            }}>
              Welcome back{user?.email ? `, ${user.email.split("@")[0]}` : ""}
            </p>
            <p style={{ fontFamily: FONT_BODY, fontSize: 13, color: "rgba(255,255,255,0.65)" }}>
              {anyLoading ? "Fetching live data…" : `${stats.totalOrders} order${stats.totalOrders !== 1 ? "s" : ""} · ${stats.pending} pending`}
            </p>
          </div>
          {anyLoading && (
            <RefreshCw size={18} color="rgba(255,255,255,0.45)" className="dash-spin" />
          )}
        </div>

        {/* ── Stat cards ── */}
        <div className="dash-stat-grid">
          <StatCard
            icon={Package}
            iconColor={C.chocolate}
            iconBg="rgba(92,51,23,0.09)"
            label="Total Products"
            value={prodLoading ? "—" : stats.totalProducts}
            delay={0}
          />
          <StatCard
            icon={ShoppingCart}
            iconColor={C.gold}
            iconBg="rgba(201,168,76,0.12)"
            label="Total Orders"
            value={ordLoading ? "—" : stats.totalOrders}
            delay={0.05}
          />
          <StatCard
            icon={Clock}
            iconColor={C.amber}
            iconBg={C.amberBg}
            label="Pending"
            value={ordLoading ? "—" : stats.pending}
            sub="Awaiting fulfilment"
            delay={0.10}
          />
          <StatCard
            icon={CheckCircle2}
            iconColor="#1E6E38"
            iconBg={C.greenBg}
            label="Delivered"
            value={ordLoading ? "—" : stats.delivered}
            delay={0.15}
          />
          <StatCard
            icon={Banknote}
            iconColor={C.chocolate}
            iconBg="rgba(92,51,23,0.08)"
            label="Revenue"
            value={ordLoading ? "—" : fmtMoney(stats.revenue)}
            sub="From delivered orders"
            delay={0.20}
          />
          <StatCard
            icon={TrendingUp}
            iconColor="#4A7C59"
            iconBg="rgba(74,124,89,0.09)"
            label="Conversion"
            value={ordLoading || stats.totalOrders === 0
              ? "—"
              : `${Math.round((stats.delivered / stats.totalOrders) * 100)}%`
            }
            sub="Delivered / total"
            delay={0.25}
          />
        </div>

        {/* ── Recent orders + recent products ── */}
        <div className="dash-section-grid">
          <RecentOrders
            orders={orders}
            loading={ordLoading}
            error={ordError}
          />
          <RecentProducts
            products={products}
            loading={prodLoading}
            error={prodError}
          />
        </div>

      </div>
    </>
  );
}
