// src/pages/admin/AdminLayout.jsx
import React, { useState, useEffect, useCallback } from "react";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
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
  ChevronLeft,
  ExternalLink,
} from "lucide-react";

/* ─────────────────────────────────────────────────
   DESIGN TOKENS  (Cremeo palette — untouched)
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
  sidebarBg: "#1E0F07",           // deeper than espresso for sidebar
  sidebarLine: "rgba(250,246,239,0.07)",
};

const FONT_DISPLAY = "'Cormorant Garamond', Georgia, serif";
const FONT_BODY    = "'DM Sans', system-ui, sans-serif";

const SIDEBAR_W       = 240;   // expanded px
const SIDEBAR_W_MINI  = 64;    // collapsed (icon-only) px

/* ─────────────────────────────────────────────────
   NAV ITEMS
───────────────────────────────────────────────── */
const NAV_ITEMS = [
  { to: "/admin",            label: "Dashboard",  icon: LayoutDashboard, end: true  },
  { to: "/admin/products",   label: "Products",   icon: Package                     },
  { to: "/admin/categories", label: "Categories", icon: Tag                         },
  { to: "/admin/orders",     label: "Orders",     icon: ShoppingCart                },
  { to: "/admin/settings",   label: "Settings",   icon: Settings                    },
];

/* Map a path to a human-readable page title for the header */
const PAGE_TITLES = {
  "/admin":            "Dashboard",
  "/admin/products":   "Products",
  "/admin/categories": "Categories",
  "/admin/orders":     "Orders",
  "/admin/settings":   "Settings",
};

/* ─────────────────────────────────────────────────
   GLOBAL STYLES  (injected once)
───────────────────────────────────────────────── */
function AdminGlobalStyles() {
  return (
    <style>{`
      /* Sidebar — hidden off-screen by default (mobile-first) */
      .cremeo-sidebar {
        transform: translateX(-100%);
        transition: transform 0.28s cubic-bezier(0.4, 0, 0.2, 1),
                    width 0.28s cubic-bezier(0.4, 0, 0.2, 1);
        will-change: transform, width;
      }
      /* Mobile: slide in when .open is present */
      .cremeo-sidebar.open { transform: translateX(0); }
      /* Desktop only: always visible, ignore open/closed state */
      @media (min-width: 769px) {
        .cremeo-sidebar { transform: translateX(0) !important; }
      }

      /* Desktop collapse: width transition */
      .cremeo-sidebar.collapsed  { width: ${SIDEBAR_W_MINI}px !important; }
      .cremeo-sidebar.expanded   { width: ${SIDEBAR_W}px !important; }

      /* Main content margin follows sidebar width */
      .cremeo-main {
        margin-left: 0;
        transition: margin-left 0.28s cubic-bezier(0.4, 0, 0.2, 1);
      }
      @media (min-width: 769px) {
        .cremeo-main          { margin-left: ${SIDEBAR_W}px; }
        .cremeo-main.collapsed { margin-left: ${SIDEBAR_W_MINI}px; }
      }

      /* Nav link base */
      .cremeo-nav-link {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 11px 18px;
        border-radius: 6px;
        margin: 2px 10px;
        text-decoration: none;
        font-family: ${FONT_BODY};
        font-size: 13px;
        font-weight: 500;
        color: rgba(250,246,239,0.52);
        border-left: 2px solid transparent;
        transition: color 0.18s ease, background 0.18s ease;
        white-space: nowrap;
        overflow: hidden;
        position: relative;
      }
      .cremeo-nav-link:hover {
        color: ${C.goldLight};
        background: rgba(201,168,76,0.08);
      }
      .cremeo-nav-link.active {
        color: ${C.goldLight};
        background: rgba(201,168,76,0.12);
        font-weight: 600;
        border-left-color: ${C.gold};
      }
      .cremeo-nav-link .nav-label {
        transition: opacity 0.2s ease, transform 0.2s ease;
        opacity: 1;
        transform: translateX(0);
      }
      /* Collapsed: hide labels */
      .cremeo-sidebar.collapsed .nav-label {
        opacity: 0;
        pointer-events: none;
        transform: translateX(-6px);
      }
      .cremeo-sidebar.collapsed .cremeo-nav-link {
        justify-content: center;
        padding: 11px 0;
        margin: 2px 8px;
        border-left-color: transparent !important;
        border-radius: 8px;
      }
      .cremeo-sidebar.collapsed .cremeo-nav-link.active {
        background: rgba(201,168,76,0.18);
      }
      /* Tooltip on collapsed icon hover */
      .cremeo-sidebar.collapsed .cremeo-nav-link::after {
        content: attr(data-label);
        position: absolute;
        left: calc(100% + 10px);
        top: 50%;
        transform: translateY(-50%);
        background: ${C.espresso};
        color: ${C.goldLight};
        font-family: ${FONT_BODY};
        font-size: 11px;
        font-weight: 600;
        letter-spacing: 0.05em;
        padding: 5px 10px;
        border-radius: 4px;
        white-space: nowrap;
        pointer-events: none;
        opacity: 0;
        transition: opacity 0.15s ease;
        z-index: 999;
      }
      .cremeo-sidebar.collapsed .cremeo-nav-link:hover::after {
        opacity: 1;
      }

      /* Logout button */
      .cremeo-logout-btn {
        display: flex;
        align-items: center;
        gap: 10px;
        width: 100%;
        padding: 10px 14px;
        background: transparent;
        border: 1px solid rgba(201,168,76,0.25);
        border-radius: 6px;
        color: rgba(250,246,239,0.45);
        font-family: ${FONT_BODY};
        font-size: 12px;
        font-weight: 600;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        cursor: pointer;
        transition: border-color 0.2s ease, color 0.2s ease, background 0.2s ease;
        white-space: nowrap;
        overflow: hidden;
      }
      .cremeo-logout-btn:hover {
        border-color: rgba(220,80,80,0.55);
        color: #F87171;
        background: rgba(220,80,80,0.06);
      }
      .cremeo-sidebar.collapsed .cremeo-logout-btn {
        padding: 10px 0;
        justify-content: center;
        border-color: transparent;
      }
      .cremeo-sidebar.collapsed .logout-label {
        opacity: 0;
        pointer-events: none;
        width: 0;
        overflow: hidden;
      }

      /* Collapse toggle button */
      .cremeo-collapse-btn {
        background: none;
        border: none;
        cursor: pointer;
        color: rgba(250,246,239,0.3);
        padding: 6px;
        border-radius: 6px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: color 0.18s, background 0.18s;
        flex-shrink: 0;
      }
      .cremeo-collapse-btn:hover {
        color: ${C.goldLight};
        background: rgba(201,168,76,0.08);
      }
      .cremeo-collapse-btn svg {
        transition: transform 0.28s cubic-bezier(0.4, 0, 0.2, 1);
      }
      .cremeo-collapse-btn.rotated svg { transform: rotate(180deg); }

      /* Sidebar brand text fade */
      .sidebar-brand-sub {
        transition: opacity 0.2s ease, transform 0.2s ease;
        opacity: 1;
        transform: translateX(0);
      }
      .cremeo-sidebar.collapsed .sidebar-brand-sub {
        opacity: 0;
        transform: translateX(-6px);
        pointer-events: none;
      }
      .sidebar-brand-name {
        transition: font-size 0.2s ease;
      }
      .cremeo-sidebar.collapsed .sidebar-brand-name {
        font-size: 0px !important;
        width: 0;
        overflow: hidden;
      }

      /* Header breadcrumb */
      .cremeo-page-title {
        font-family: ${FONT_DISPLAY};
        font-size: 20px;
        font-weight: 400;
        color: ${C.espresso};
        letter-spacing: 0.02em;
      }

      /* Header action link */
      .cremeo-header-link {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        font-family: ${FONT_BODY};
        font-size: 12px;
        font-weight: 500;
        color: ${C.mist};
        text-decoration: none;
        letter-spacing: 0.03em;
        padding: 6px 12px;
        border-radius: 5px;
        border: 1px solid ${C.line};
        transition: color 0.18s, border-color 0.18s, background 0.18s;
        white-space: nowrap;
      }
      .cremeo-header-link:hover {
        color: ${C.chocolate};
        border-color: ${C.caramel};
        background: rgba(200,149,107,0.06);
      }

      /* Mobile overlay fade */
      .cremeo-overlay {
        position: fixed; inset: 0;
        background: rgba(20,8,2,0.55);
        z-index: 150;
        backdrop-filter: blur(2px);
        animation: crmFadeIn 0.22s ease;
      }
      @keyframes crmFadeIn { from { opacity: 0; } to { opacity: 1; } }

      /* Scrollbar inside sidebar */
      .cremeo-nav::-webkit-scrollbar { width: 3px; }
      .cremeo-nav::-webkit-scrollbar-thumb { background: rgba(201,168,76,0.2); border-radius: 2px; }

      /* Reduced motion */
      @media (prefers-reduced-motion: reduce) {
        .cremeo-sidebar, .cremeo-main, .cremeo-nav-link,
        .cremeo-logout-btn, .cremeo-collapse-btn svg,
        .nav-label, .sidebar-brand-sub, .sidebar-brand-name { transition: none !important; }
      }
    `}</style>
  );
}

/* ─────────────────────────────────────────────────
   SIDEBAR COMPONENT
───────────────────────────────────────────────── */
function Sidebar({ collapsed, mobileOpen, onCollapse, onMobileClose }) {
  const { user, logout } = useAuth();
  const navigate         = useNavigate();

  const handleLogout = useCallback(async () => {
    await logout();
    navigate("/admin/login", { replace: true });
  }, [logout, navigate]);

  // Build className string — "open" controls mobile slide-in,
  // desktop visibility is handled entirely by the CSS media query.
  const sidebarClass = [
    "cremeo-sidebar",
    collapsed ? "collapsed" : "expanded",
    mobileOpen ? "open" : "",
  ].filter(Boolean).join(" ");

  return (
    <aside
      className={sidebarClass}
      style={{
        width: collapsed ? SIDEBAR_W_MINI : SIDEBAR_W,
        position: "fixed",
        top: 0, bottom: 0, left: 0,
        zIndex: 200,
        background: C.sidebarBg,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* ── Brand ──────────────────────────────── */}
      <div style={{
        padding: "20px 16px 18px",
        borderBottom: `1px solid ${C.sidebarLine}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexShrink: 0,
        minHeight: 70,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
          {/* Gold monogram — always visible */}
          <div style={{
            width: 32, height: 32,
            background: `linear-gradient(135deg, ${C.gold} 0%, ${C.caramel} 100%)`,
            borderRadius: 8,
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
            boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
          }}>
            <span style={{
              fontFamily: FONT_DISPLAY,
              fontSize: 18, fontWeight: 600,
              color: C.espresso,
              lineHeight: 1,
            }}>C</span>
          </div>

          {/* Brand text — hidden when collapsed */}
          <div style={{ minWidth: 0, overflow: "hidden" }}>
            <p className="sidebar-brand-name" style={{
              fontFamily: FONT_DISPLAY,
              fontSize: 19, fontWeight: 400,
              color: C.gold,
              lineHeight: 1,
              whiteSpace: "nowrap",
            }}>
              Cremeo
            </p>
            <p className="sidebar-brand-sub" style={{
              fontFamily: FONT_BODY,
              fontSize: 8.5,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "rgba(201,168,76,0.45)",
              marginTop: 3,
              whiteSpace: "nowrap",
            }}>
              Admin Panel
            </p>
          </div>
        </div>

        {/* Desktop collapse toggle */}
        <button
          className={`cremeo-collapse-btn${collapsed ? " rotated" : ""}`}
          onClick={onCollapse}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          style={{ flexShrink: 0 }}
        >
          <ChevronLeft size={15} />
        </button>

        {/* Mobile close */}
        <button
          onClick={onMobileClose}
          style={{
            display: "none",    // shown via CSS below
            background: "none", border: "none", cursor: "pointer",
            color: "rgba(250,246,239,0.35)", padding: 4, flexShrink: 0,
          }}
          aria-label="Close sidebar"
        >
          <X size={15} />
        </button>
      </div>

      {/* ── Navigation ─────────────────────────── */}
      <nav
        className="cremeo-nav"
        style={{ flex: 1, padding: "10px 0", overflowY: "auto", overflowX: "hidden" }}
      >
        {/* Section label */}
        {!collapsed && (
          <p style={{
            fontFamily: FONT_BODY,
            fontSize: 9,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "rgba(250,246,239,0.2)",
            padding: "6px 20px 8px",
          }}>
            Menu
          </p>
        )}

        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            data-label={label}
            className={({ isActive }) =>
              `cremeo-nav-link${isActive ? " active" : ""}`
            }
            onClick={onMobileClose}
          >
            <Icon size={16} style={{ flexShrink: 0 }} />
            <span className="nav-label">{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* ── Divider ────────────────────────────── */}
      <div style={{ height: 1, background: C.sidebarLine, margin: "0 16px", flexShrink: 0 }} />

      {/* ── User footer ────────────────────────── */}
      <div style={{
        padding: "14px 12px 18px",
        flexShrink: 0,
        overflow: "hidden",
      }}>
        {/* Avatar + email row */}
        {!collapsed && (
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 9,
            marginBottom: 12,
            minWidth: 0,
          }}>
            <div style={{
              width: 30, height: 30,
              borderRadius: "50%",
              background: `rgba(201,168,76,0.18)`,
              border: `1px solid rgba(201,168,76,0.3)`,
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}>
              <span style={{
                fontFamily: FONT_DISPLAY,
                fontSize: 14,
                color: C.gold,
                lineHeight: 1,
              }}>
                {(user?.email?.[0] ?? "A").toUpperCase()}
              </span>
            </div>
            <div style={{ minWidth: 0 }}>
              <p style={{
                fontFamily: FONT_BODY,
                fontSize: 11,
                color: "rgba(250,246,239,0.55)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}>
                {user?.email}
              </p>
              <p style={{
                fontFamily: FONT_BODY,
                fontSize: 9,
                color: C.gold,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                marginTop: 1,
              }}>
                Administrator
              </p>
            </div>
          </div>
        )}

        {/* Collapsed: just the avatar */}
        {collapsed && (
          <div style={{
            width: 30, height: 30,
            borderRadius: "50%",
            background: "rgba(201,168,76,0.18)",
            border: "1px solid rgba(201,168,76,0.3)",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 12px",
          }}>
            <span style={{ fontFamily: FONT_DISPLAY, fontSize: 14, color: C.gold, lineHeight: 1 }}>
              {(user?.email?.[0] ?? "A").toUpperCase()}
            </span>
          </div>
        )}

        <button
          className="cremeo-logout-btn"
          onClick={handleLogout}
        >
          <LogOut size={13} style={{ flexShrink: 0 }} />
          <span className="logout-label">Log out</span>
        </button>
      </div>
    </aside>
  );
}

/* ─────────────────────────────────────────────────
   TOP HEADER
───────────────────────────────────────────────── */
function TopHeader({ onMobileMenuOpen }) {
  const location  = useLocation();
  const pageTitle = PAGE_TITLES[location.pathname] ?? "Admin";

  return (
    <header style={{
      height: 58,
      background: "#fff",
      borderBottom: `1px solid ${C.line}`,
      display: "flex",
      alignItems: "center",
      padding: "0 24px",
      gap: 14,
      flexShrink: 0,
      position: "sticky",
      top: 0,
      zIndex: 90,
      boxShadow: "0 1px 0 rgba(92,51,23,0.06)",
    }}>
      {/* Hamburger — mobile only */}
      <button
        onClick={onMobileMenuOpen}
        aria-label="Open navigation"
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          color: C.mist,
          padding: 6,
          borderRadius: 6,
          display: "flex",
          alignItems: "center",
          transition: "color 0.18s, background 0.18s",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = C.creamDeep; e.currentTarget.style.color = C.chocolate; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = C.mist; }}
      >
        <Menu size={18} />
      </button>

      {/* Breadcrumb */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{
          fontFamily: FONT_BODY,
          fontSize: 11,
          color: C.mist,
          opacity: 0.6,
          letterSpacing: "0.04em",
        }}>
          Admin
        </span>
        <span style={{ color: C.parchment, fontSize: 13 }}>/</span>
        <span className="cremeo-page-title">{pageTitle}</span>
      </div>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Right actions */}
      <a
        href="/"
        target="_blank"
        rel="noreferrer"
        className="cremeo-header-link"
      >
        <ExternalLink size={11} />
        View site
      </a>
    </header>
  );
}

/* ─────────────────────────────────────────────────
   ADMIN LAYOUT  (root export)
───────────────────────────────────────────────── */
export default function AdminLayout() {
  const [collapsed,   setCollapsed]   = useState(false);
  const [mobileOpen,  setMobileOpen]  = useState(false);
  const [isDesktop,   setIsDesktop]   = useState(() =>
    typeof window !== "undefined" ? window.innerWidth >= 769 : true
  );

  /* Track breakpoint */
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 769px)");
    const update = (e) => {
      setIsDesktop(e.matches);
      if (e.matches) setMobileOpen(false);
    };
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  /* Close sidebar on route change (mobile) */
  const location = useLocation();
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  const toggleCollapse  = useCallback(() => setCollapsed((c) => !c), []);
  const openMobile      = useCallback(() => setMobileOpen(true),  []);
  const closeMobile     = useCallback(() => setMobileOpen(false), []);

  const effectiveCollapsed = isDesktop ? collapsed : false;
  const mainMargin = isDesktop
    ? (collapsed ? SIDEBAR_W_MINI : SIDEBAR_W)
    : 0;

  return (
    <>
      <AdminGlobalStyles />

      {/* Mobile backdrop */}
      {mobileOpen && !isDesktop && (
        <div className="cremeo-overlay" role="presentation" onClick={closeMobile} />
      )}

      {/* Sidebar */}
      <Sidebar
        collapsed={effectiveCollapsed}
        mobileOpen={mobileOpen}
        onCollapse={toggleCollapse}
        onMobileClose={closeMobile}
      />

      {/* Main area */}
      <div
        className={`cremeo-main${effectiveCollapsed ? " collapsed" : ""}`}
        style={{
          marginLeft: mainMargin,
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
          background: C.creamDeep,
          transition: "margin-left 0.28s cubic-bezier(0.4,0,0.2,1)",
        }}
      >
        <TopHeader onMobileMenuOpen={openMobile} />

        <main style={{
          flex: 1,
          padding: "36px 32px 48px",
          maxWidth: 1100,
          width: "100%",
          boxSizing: "border-box",
        }}>
          <Outlet />
        </main>
      </div>
    </>
  );
}
