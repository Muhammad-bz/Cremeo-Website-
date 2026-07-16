// src/pages/admin/Orders.jsx
// Phase 2 placeholder — no Firestore, no Cloudinary, local dummy data only.
import React, { useState, useMemo } from "react";
import {
  ShoppingCart,
  Clock,
  CheckCircle2,
  Banknote,
  Search,
  ChevronDown,
  X,
  PackageOpen,
  Eye,
} from "lucide-react";

/* ─────────────────────────────────────────────────
   DESIGN TOKENS  (mirrors AdminLayout exactly)
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
};
const FONT_DISPLAY = "'Cormorant Garamond', Georgia, serif";
const FONT_BODY    = "'DM Sans', system-ui, sans-serif";

/* ─────────────────────────────────────────────────
   STATUS CONFIG
───────────────────────────────────────────────── */
const STATUS = {
  pending: {
    label: "Pending",
    color: "#92670A",
    bg:    "rgba(201,168,76,0.13)",
    border:"rgba(201,168,76,0.35)",
    dot:   C.gold,
  },
  processing: {
    label: "Processing",
    color: "#7C4A1E",
    bg:    "rgba(200,149,107,0.14)",
    border:"rgba(200,149,107,0.38)",
    dot:   C.caramel,
  },
  completed: {
    label: "Completed",
    color: "#1E5C32",
    bg:    "rgba(34,139,70,0.10)",
    border:"rgba(34,139,70,0.28)",
    dot:   "#22A84A",
  },
  cancelled: {
    label: "Cancelled",
    color: "#8B2020",
    bg:    "rgba(183,28,28,0.08)",
    border:"rgba(183,28,28,0.22)",
    dot:   "#C0392B",
  },
};

const ALL_STATUSES = ["all", "pending", "processing", "completed", "cancelled"];

/* ─────────────────────────────────────────────────
   DUMMY DATA  (12 realistic coffee-shop orders)
───────────────────────────────────────────────── */
const DUMMY_ORDERS = [
  {
    id: "ORD-0041",
    customer: "Amelia Thornton",
    email: "a.thornton@mail.com",
    items: ["Cremeo Blend 250g", "Ethiopian Single Origin 200g"],
    total: 42.50,
    status: "completed",
    date: "2024-07-15",
    payment: "Card",
  },
  {
    id: "ORD-0040",
    customer: "James Okafor",
    email: "james.o@inbox.io",
    items: ["Cold Brew Concentrate 500ml"],
    total: 18.00,
    status: "pending",
    date: "2024-07-15",
    payment: "PayPal",
  },
  {
    id: "ORD-0039",
    customer: "Lena Kovač",
    email: "lena.k@eumail.eu",
    items: ["Guatemala Antigua 250g", "Cremeo Mug", "Grinder Calibration Kit"],
    total: 87.00,
    status: "processing",
    date: "2024-07-14",
    payment: "Card",
  },
  {
    id: "ORD-0038",
    customer: "Marcus Webb",
    email: "m.webb@studio.co",
    items: ["Kenya AA 200g"],
    total: 22.00,
    status: "completed",
    date: "2024-07-14",
    payment: "Card",
  },
  {
    id: "ORD-0037",
    customer: "Priya Nair",
    email: "priya.nair@gmail.com",
    items: ["Decaf Colombia 250g", "Pour-Over Set"],
    total: 56.50,
    status: "completed",
    date: "2024-07-13",
    payment: "Card",
  },
  {
    id: "ORD-0036",
    customer: "Tobias Müller",
    email: "tmuller@webde.de",
    items: ["Cremeo Blend 500g", "Ethiopian Single Origin 200g", "Aeropress"],
    total: 74.00,
    status: "cancelled",
    date: "2024-07-13",
    payment: "PayPal",
  },
  {
    id: "ORD-0035",
    customer: "Chloe Beaumont",
    email: "chloe.b@frenchpress.fr",
    items: ["Rwanda Natural 200g"],
    total: 19.50,
    status: "processing",
    date: "2024-07-12",
    payment: "Card",
  },
  {
    id: "ORD-0034",
    customer: "Daniel Crane",
    email: "d.crane@outlook.com",
    items: ["Cold Brew Concentrate 500ml", "Cremeo Blend 250g"],
    total: 38.00,
    status: "pending",
    date: "2024-07-12",
    payment: "Card",
  },
  {
    id: "ORD-0033",
    customer: "Yuki Tanaka",
    email: "yuki.tanaka@jpmail.jp",
    items: ["Cremeo Mug", "Cremeo Blend 250g"],
    total: 46.00,
    status: "completed",
    date: "2024-07-11",
    payment: "PayPal",
  },
  {
    id: "ORD-0032",
    customer: "Sophie Adler",
    email: "s.adler@domain.ch",
    items: ["Guatemala Antigua 500g"],
    total: 32.00,
    status: "completed",
    date: "2024-07-11",
    payment: "Card",
  },
  {
    id: "ORD-0031",
    customer: "Kwame Asante",
    email: "kwame.a@afmail.gh",
    items: ["Kenya AA 200g", "Pour-Over Set", "Rwanda Natural 200g"],
    total: 63.50,
    status: "cancelled",
    date: "2024-07-10",
    payment: "Card",
  },
  {
    id: "ORD-0030",
    customer: "Isabel Ferreira",
    email: "isabel.f@posta.pt",
    items: ["Espresso Roast 250g"],
    total: 16.00,
    status: "pending",
    date: "2024-07-10",
    payment: "PayPal",
  },
];

/* ─────────────────────────────────────────────────
   DERIVED STATS
───────────────────────────────────────────────── */
const TODAY = "2024-07-15";
function deriveStats(orders) {
  const todayOrders  = orders.filter((o) => o.date === TODAY);
  return {
    todayCount: todayOrders.length,
    pending:    orders.filter((o) => o.status === "pending").length,
    completed:  orders.filter((o) => o.status === "completed").length,
    revenue:    todayOrders.reduce((s, o) => s + o.total, 0),
  };
}

/* ─────────────────────────────────────────────────
   COMPONENT-SCOPED STYLES
───────────────────────────────────────────────── */
function OrdersStyles() {
  return (
    <style>{`
      /* ── Stat cards ───────────────────────────── */
      .ord-stat-card {
        background: #fff;
        border: 1px solid ${C.line};
        border-radius: 10px;
        padding: 22px 24px;
        display: flex;
        align-items: flex-start;
        gap: 16px;
        flex: 1 1 180px;
        min-width: 0;
        animation: ord-rise 0.38s ease both;
        box-shadow: 0 1px 3px rgba(46,26,14,0.05);
        transition: box-shadow 0.2s ease, transform 0.2s ease;
      }
      .ord-stat-card:hover {
        box-shadow: 0 4px 16px rgba(46,26,14,0.09);
        transform: translateY(-1px);
      }

      /* ── Toolbar inputs ───────────────────────── */
      .ord-search-wrap {
        position: relative;
        flex: 1 1 260px;
        min-width: 0;
      }
      .ord-search-input {
        width: 100%;
        box-sizing: border-box;
        padding: 9px 12px 9px 36px;
        font-family: ${FONT_BODY};
        font-size: 13px;
        color: ${C.espresso};
        background: #fff;
        border: 1px solid ${C.line};
        border-radius: 7px;
        outline: none;
        transition: border-color 0.18s, box-shadow 0.18s;
      }
      .ord-search-input::placeholder { color: ${C.mist}; opacity: 0.65; }
      .ord-search-input:focus {
        border-color: ${C.gold};
        box-shadow: 0 0 0 3px rgba(201,168,76,0.12);
      }
      .ord-search-icon {
        position: absolute;
        left: 11px;
        top: 50%;
        transform: translateY(-50%);
        color: ${C.mist};
        opacity: 0.55;
        pointer-events: none;
      }
      .ord-search-clear {
        position: absolute;
        right: 9px;
        top: 50%;
        transform: translateY(-50%);
        background: none;
        border: none;
        cursor: pointer;
        color: ${C.mist};
        opacity: 0.55;
        padding: 2px;
        border-radius: 4px;
        display: flex;
        align-items: center;
        transition: opacity 0.15s;
      }
      .ord-search-clear:hover { opacity: 1; }

      /* ── Filter select ────────────────────────── */
      .ord-filter-wrap {
        position: relative;
        flex-shrink: 0;
      }
      .ord-filter-select {
        appearance: none;
        -webkit-appearance: none;
        padding: 9px 34px 9px 14px;
        font-family: ${FONT_BODY};
        font-size: 13px;
        font-weight: 500;
        color: ${C.espresso};
        background: #fff;
        border: 1px solid ${C.line};
        border-radius: 7px;
        cursor: pointer;
        outline: none;
        transition: border-color 0.18s, box-shadow 0.18s;
        min-width: 150px;
      }
      .ord-filter-select:focus {
        border-color: ${C.gold};
        box-shadow: 0 0 0 3px rgba(201,168,76,0.12);
      }
      .ord-filter-chevron {
        position: absolute;
        right: 10px;
        top: 50%;
        transform: translateY(-50%);
        pointer-events: none;
        color: ${C.mist};
        opacity: 0.6;
      }

      /* ── Table card ───────────────────────────── */
      .ord-table-card {
        background: #fff;
        border: 1px solid ${C.line};
        border-radius: 10px;
        overflow: hidden;
        box-shadow: 0 1px 3px rgba(46,26,14,0.05);
        animation: ord-rise 0.42s ease both;
        animation-delay: 0.08s;
      }

      /* ── Table ────────────────────────────────── */
      .ord-table {
        width: 100%;
        border-collapse: collapse;
        font-family: ${FONT_BODY};
        font-size: 13px;
      }
      .ord-table thead tr {
        border-bottom: 1px solid ${C.line};
      }
      .ord-table th {
        padding: 11px 16px;
        text-align: left;
        font-size: 10.5px;
        font-weight: 600;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: ${C.mist};
        white-space: nowrap;
        background: ${C.cream};
      }
      .ord-table td {
        padding: 13px 16px;
        vertical-align: middle;
        color: ${C.espresso};
        border-bottom: 1px solid rgba(92,51,23,0.06);
      }
      .ord-table tbody tr {
        animation: ord-row-in 0.3s ease both;
        transition: background 0.15s ease;
      }
      .ord-table tbody tr:hover { background: ${C.cream}; }
      .ord-table tbody tr:last-child td { border-bottom: none; }

      /* ── Mobile: card rows ────────────────────── */
      .ord-mobile-cards { display: none; }
      .ord-mobile-card {
        padding: 16px;
        border-bottom: 1px solid rgba(92,51,23,0.07);
        animation: ord-row-in 0.3s ease both;
        transition: background 0.15s;
      }
      .ord-mobile-card:last-child { border-bottom: none; }
      .ord-mobile-card:hover { background: ${C.cream}; }

      /* ── Action button ────────────────────────── */
      .ord-action-btn {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        padding: 5px 10px;
        font-family: ${FONT_BODY};
        font-size: 11.5px;
        font-weight: 500;
        color: ${C.mist};
        background: transparent;
        border: 1px solid ${C.line};
        border-radius: 5px;
        cursor: not-allowed;
        opacity: 0.7;
        transition: opacity 0.15s, border-color 0.15s, color 0.15s;
      }
      .ord-action-btn:hover {
        opacity: 1;
        border-color: ${C.caramel};
        color: ${C.chocolate};
      }

      /* ── Animations ───────────────────────────── */
      @keyframes ord-rise {
        from { opacity: 0; transform: translateY(10px); }
        to   { opacity: 1; transform: translateY(0);    }
      }
      @keyframes ord-row-in {
        from { opacity: 0; transform: translateX(-4px); }
        to   { opacity: 1; transform: translateX(0);    }
      }

      /* ── Responsive breakpoint ────────────────── */
      @media (max-width: 768px) {
        .ord-stats-row   { gap: 10px !important; }
        .ord-stat-card   { flex: 1 1 calc(50% - 5px); padding: 16px; }
        .ord-stat-card:nth-child(3),
        .ord-stat-card:nth-child(4) { animation-delay: 0.08s; }
        .ord-toolbar     { flex-direction: column !important; gap: 10px !important; }
        .ord-filter-wrap { width: 100%; }
        .ord-filter-select { width: 100%; min-width: 0; }
        .ord-table-head  { display: none; }
        .ord-table-body  { display: none; }
        .ord-mobile-cards { display: block; }
      }
      @media (max-width: 420px) {
        .ord-stat-card { flex: 1 1 100%; }
      }

      /* ── Reduced motion ───────────────────────── */
      @media (prefers-reduced-motion: reduce) {
        .ord-stat-card,
        .ord-table-card,
        .ord-table tbody tr,
        .ord-mobile-card { animation: none !important; }
        .ord-stat-card:hover { transform: none !important; }
      }
    `}</style>
  );
}

/* ─────────────────────────────────────────────────
   SUB-COMPONENTS
───────────────────────────────────────────────── */
function StatCard({ icon: Icon, iconColor, iconBg, label, value, delay = 0 }) {
  return (
    <div className="ord-stat-card" style={{ animationDelay: `${delay}s` }}>
      <div style={{
        width: 40, height: 40,
        borderRadius: 9,
        background: iconBg,
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
      }}>
        <Icon size={18} color={iconColor} />
      </div>
      <div style={{ minWidth: 0 }}>
        <p style={{
          fontFamily: FONT_BODY,
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: "0.07em",
          textTransform: "uppercase",
          color: C.mist,
          marginBottom: 4,
        }}>
          {label}
        </p>
        <p style={{
          fontFamily: FONT_DISPLAY,
          fontSize: 30,
          fontWeight: 400,
          color: C.espresso,
          lineHeight: 1,
        }}>
          {value}
        </p>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const s = STATUS[status] ?? STATUS.pending;
  return (
    <span style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
      padding: "3px 9px 3px 7px",
      borderRadius: 20,
      background: s.bg,
      border: `1px solid ${s.border}`,
      fontFamily: FONT_BODY,
      fontSize: 11.5,
      fontWeight: 600,
      color: s.color,
      whiteSpace: "nowrap",
      letterSpacing: "0.01em",
    }}>
      <span style={{
        width: 6, height: 6,
        borderRadius: "50%",
        background: s.dot,
        flexShrink: 0,
      }} />
      {s.label}
    </span>
  );
}

function ItemsList({ items }) {
  const first = items[0];
  const rest  = items.length - 1;
  return (
    <span style={{ color: C.espresso }}>
      {first}
      {rest > 0 && (
        <span style={{
          marginLeft: 6,
          fontSize: 11,
          color: C.mist,
          fontWeight: 600,
          background: C.creamDeep,
          padding: "1px 6px",
          borderRadius: 10,
        }}>
          +{rest}
        </span>
      )}
    </span>
  );
}

function EmptyState({ hasFilters }) {
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "64px 24px",
      textAlign: "center",
      animation: "ord-rise 0.36s ease",
    }}>
      <div style={{
        width: 56, height: 56,
        borderRadius: 14,
        background: C.creamDeep,
        border: `1.5px solid ${C.line}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        marginBottom: 20,
      }}>
        <PackageOpen size={24} color={C.mist} opacity={0.7} />
      </div>
      <p style={{
        fontFamily: FONT_DISPLAY,
        fontSize: 22,
        fontWeight: 400,
        color: C.espresso,
        marginBottom: 8,
      }}>
        {hasFilters ? "No orders match" : "No orders yet"}
      </p>
      <p style={{
        fontFamily: FONT_BODY,
        fontSize: 13,
        color: C.mist,
        maxWidth: 300,
        lineHeight: 1.6,
      }}>
        {hasFilters
          ? "Try adjusting your search or filter to find what you're looking for."
          : "Orders placed by customers will appear here once they start coming in."}
      </p>
    </div>
  );
}

/* ─────────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────────── */
export default function Orders() {
  const [search, setSearch]       = useState("");
  const [statusFilter, setStatus] = useState("all");

  const stats = useMemo(() => deriveStats(DUMMY_ORDERS), []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return DUMMY_ORDERS.filter((o) => {
      const matchStatus = statusFilter === "all" || o.status === statusFilter;
      const matchSearch =
        !q ||
        o.id.toLowerCase().includes(q)         ||
        o.customer.toLowerCase().includes(q)   ||
        o.email.toLowerCase().includes(q)      ||
        o.items.some((i) => i.toLowerCase().includes(q));
      return matchStatus && matchSearch;
    });
  }, [search, statusFilter]);

  const hasFilters = search.trim() !== "" || statusFilter !== "all";

  return (
    <>
      <OrdersStyles />

      <div style={{ fontFamily: FONT_BODY }}>

        {/* ── Page header ──────────────────────────── */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{
            fontFamily: FONT_DISPLAY,
            fontSize: 36,
            fontWeight: 400,
            color: C.espresso,
            marginBottom: 8,
            letterSpacing: "0.01em",
          }}>
            Orders
          </h1>
          <div style={{ width: 56, height: 1.5, background: C.gold, marginBottom: 10 }} />
          <p style={{ fontFamily: FONT_BODY, fontSize: 13, color: C.mist, lineHeight: 1.5 }}>
            Review and manage customer orders. Fulfilment controls coming in a future phase.
          </p>
        </div>

        {/* ── Stats cards ─────────────────────────── */}
        <div
          className="ord-stats-row"
          style={{ display: "flex", flexWrap: "wrap", gap: 14, marginBottom: 28 }}
        >
          <StatCard
            icon={ShoppingCart}
            iconColor={C.gold}
            iconBg="rgba(201,168,76,0.12)"
            label="Today's Orders"
            value={stats.todayCount}
            delay={0}
          />
          <StatCard
            icon={Clock}
            iconColor="#A0620D"
            iconBg="rgba(201,168,76,0.10)"
            label="Pending"
            value={stats.pending}
            delay={0.05}
          />
          <StatCard
            icon={CheckCircle2}
            iconColor="#1E6E38"
            iconBg="rgba(34,139,70,0.09)"
            label="Completed"
            value={stats.completed}
            delay={0.10}
          />
          <StatCard
            icon={Banknote}
            iconColor={C.chocolate}
            iconBg={`rgba(92,51,23,0.08)`}
            label="Revenue Today"
            value={`PKR ${stats.revenue.toFixed(2)}`}
            delay={0.15}
          />
        </div>

        {/* ── Toolbar ─────────────────────────────── */}
        <div
          className="ord-toolbar"
          style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 16 }}
        >
          {/* Search */}
          <div className="ord-search-wrap">
            <Search size={14} className="ord-search-icon" style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: C.mist, opacity: 0.55, pointerEvents: "none" }} />
            <input
              className="ord-search-input"
              type="text"
              placeholder="Search by order, customer, or item…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search orders"
            />
            {search && (
              <button
                className="ord-search-clear"
                onClick={() => setSearch("")}
                aria-label="Clear search"
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* Status filter */}
          <div className="ord-filter-wrap">
            <select
              className="ord-filter-select"
              value={statusFilter}
              onChange={(e) => setStatus(e.target.value)}
              aria-label="Filter by status"
            >
              {ALL_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s === "all" ? "All statuses" : STATUS[s]?.label ?? s}
                </option>
              ))}
            </select>
            <ChevronDown size={13} className="ord-filter-chevron" style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: C.mist, opacity: 0.6 }} />
          </div>

          {/* Result count */}
          <span style={{
            fontFamily: FONT_BODY,
            fontSize: 12,
            color: C.mist,
            whiteSpace: "nowrap",
            flexShrink: 0,
          }}>
            {filtered.length} {filtered.length === 1 ? "order" : "orders"}
          </span>
        </div>

        {/* ── Table card ──────────────────────────── */}
        <div className="ord-table-card">

          {filtered.length === 0 ? (
            <EmptyState hasFilters={hasFilters} />
          ) : (
            <>
              {/* ─── Desktop table ──────────────────── */}
              <table className="ord-table">
                <thead className="ord-table-head">
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Items</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th style={{ textAlign: "right" }}>Total</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody className="ord-table-body">
                  {filtered.map((order, i) => (
                    <tr key={order.id} style={{ animationDelay: `${i * 0.04}s` }}>
                      {/* Order ID */}
                      <td>
                        <span style={{
                          fontFamily: FONT_BODY,
                          fontSize: 12,
                          fontWeight: 700,
                          color: C.chocolate,
                          letterSpacing: "0.04em",
                          background: C.creamDeep,
                          padding: "2px 8px",
                          borderRadius: 5,
                          border: `1px solid ${C.line}`,
                        }}>
                          {order.id}
                        </span>
                      </td>

                      {/* Customer */}
                      <td>
                        <p style={{ fontWeight: 500, marginBottom: 2, color: C.espresso }}>
                          {order.customer}
                        </p>
                        <p style={{ fontSize: 11.5, color: C.mist, opacity: 0.8 }}>
                          {order.email}
                        </p>
                      </td>

                      {/* Items */}
                      <td style={{ maxWidth: 220 }}>
                        <ItemsList items={order.items} />
                      </td>

                      {/* Status */}
                      <td><StatusBadge status={order.status} /></td>

                      {/* Date */}
                      <td style={{ color: C.mist, fontSize: 12.5, whiteSpace: "nowrap" }}>
                        {order.date}
                      </td>

                      {/* Total */}
                      <td style={{ textAlign: "right", fontWeight: 600, color: C.espresso, whiteSpace: "nowrap" }}>
                        PKR {order.total.toFixed(2)}
                      </td>

                      {/* Actions */}
                      <td style={{ textAlign: "right" }}>
                        <button
                          className="ord-action-btn"
                          title="Full order management coming soon"
                          disabled
                        >
                          <Eye size={11} />
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* ─── Mobile card list ──────────────── */}
              <div className="ord-mobile-cards">
                {filtered.map((order, i) => (
                  <div
                    key={order.id}
                    className="ord-mobile-card"
                    style={{ animationDelay: `${i * 0.05}s` }}
                  >
                    {/* Top row: ID + badge */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                      <span style={{
                        fontFamily: FONT_BODY,
                        fontSize: 12,
                        fontWeight: 700,
                        color: C.chocolate,
                        letterSpacing: "0.04em",
                        background: C.creamDeep,
                        padding: "2px 8px",
                        borderRadius: 5,
                        border: `1px solid ${C.line}`,
                      }}>
                        {order.id}
                      </span>
                      <StatusBadge status={order.status} />
                    </div>

                    {/* Customer */}
                    <p style={{ fontWeight: 600, fontSize: 14, color: C.espresso, marginBottom: 2 }}>
                      {order.customer}
                    </p>
                    <p style={{ fontSize: 12, color: C.mist, marginBottom: 10 }}>
                      {order.email}
                    </p>

                    {/* Items */}
                    <p style={{ fontSize: 12.5, color: C.espresso, marginBottom: 12 }}>
                      <ItemsList items={order.items} />
                    </p>

                    {/* Footer: date + total */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={{ fontSize: 12, color: C.mist }}>{order.date}</span>
                      <span style={{ fontWeight: 700, fontSize: 15, color: C.espresso }}>
                        PKR {order.total.toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* ── Table footer ──────────────────────── */}
          {filtered.length > 0 && (
            <div style={{
              padding: "11px 16px",
              borderTop: `1px solid ${C.line}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              background: C.cream,
            }}>
              <span style={{ fontFamily: FONT_BODY, fontSize: 12, color: C.mist }}>
                Showing <strong style={{ color: C.espresso }}>{filtered.length}</strong> of{" "}
                <strong style={{ color: C.espresso }}>{DUMMY_ORDERS.length}</strong> orders
              </span>
              <span style={{
                fontFamily: FONT_BODY,
                fontSize: 11,
                color: C.mist,
                opacity: 0.6,
                fontStyle: "italic",
              }}>
                Placeholder data · Firestore not connected
              </span>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
