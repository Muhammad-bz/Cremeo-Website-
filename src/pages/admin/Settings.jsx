// src/pages/admin/Settings.jsx
// Phase 2 — local React state only. No Firestore, no Cloudinary.
import React, { useState, useCallback, useEffect, useRef } from "react";
import {
  Store,
  Globe,
  Clock,
  Layout,
  Layers,
  Instagram,
  Facebook,
  Music,
  Phone,
  Mail,
  MapPin,
  MessageCircle,
  Save,
  RotateCcw,
  CheckCircle2,
  X,
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
   CONSTANTS
───────────────────────────────────────────────── */
const DAYS     = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const DAY_ABR  = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const DEFAULTS = {
  /* Store */
  storeName:      "Cremeo",
  tagline:        "Artisan Coffee & Fine Blends",
  address:        "",
  phone:          "",
  whatsapp:       "",
  email:          "",
  mapsLink:       "",
  /* Social */
  instagram:      "",
  facebook:       "",
  tiktok:         "",
  /* Hours */
  openingTime:    "08:00",
  closingTime:    "22:00",
  closedDays:     [],
  /* Homepage */
  heroTitle:      "Crafted for the Curious",
  heroSubtitle:   "Premium single-origin beans, roasted to order.",
  heroButtonText: "Shop Now",
  /* Branding */
  logoUrl:        "",
  faviconUrl:     "",
};

/* Compare two settings objects, order-insensitive for closedDays */
function settingsEqual(a, b) {
  const norm = (o) => ({
    ...o,
    closedDays: [...(o.closedDays ?? [])].sort(),
  });
  return JSON.stringify(norm(a)) === JSON.stringify(norm(b));
}

/* ─────────────────────────────────────────────────
   COMPONENT-SCOPED STYLES
───────────────────────────────────────────────── */
function SettingsStyles() {
  return (
    <style>{`
      /* ── Section card ─────────────────────────── */
      .set-card {
        background: #fff;
        border: 1px solid ${C.line};
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 1px 4px rgba(46,26,14,0.05);
        animation: set-rise 0.38s ease both;
        transition: border-color 0.22s ease, box-shadow 0.22s ease;
      }
      .set-card:focus-within {
        border-color: rgba(201,168,76,0.32);
        box-shadow: 0 4px 22px rgba(46,26,14,0.09);
      }
      .set-card-header {
        padding: 18px 24px;
        border-bottom: 1px solid ${C.line};
        background: ${C.cream};
        display: flex;
        align-items: center;
        gap: 13px;
      }
      .set-card-icon {
        width: 36px;
        height: 36px;
        border-radius: 9px;
        background: rgba(201,168,76,0.11);
        border: 1px solid rgba(201,168,76,0.22);
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }
      .set-card-body {
        padding: 24px;
      }

      /* ── Field grid ───────────────────────────── */
      .set-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 18px 22px;
      }
      .set-col-full { grid-column: 1 / -1; }

      /* ── Field ────────────────────────────────── */
      .set-field {
        display: flex;
        flex-direction: column;
        gap: 7px;
        min-width: 0;
      }
      .set-label {
        font-family: ${FONT_BODY};
        font-size: 10.5px;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: ${C.mist};
        display: flex;
        align-items: center;
        gap: 5px;
      }

      /* ── Inputs ───────────────────────────────── */
      .set-input {
        font-family: ${FONT_BODY};
        font-size: 13.5px;
        color: ${C.espresso};
        background: ${C.cream};
        border: 1px solid ${C.line};
        border-radius: 8px;
        padding: 0 13px;
        height: 44px;
        width: 100%;
        box-sizing: border-box;
        outline: none;
        -webkit-appearance: none;
        appearance: none;
        transition: border-color 0.18s ease, box-shadow 0.18s ease, background 0.18s ease;
      }
      .set-input::placeholder {
        color: ${C.mist};
        opacity: 0.45;
      }
      .set-input:hover {
        border-color: rgba(201,168,76,0.38);
        background: #fff;
      }
      .set-input:focus {
        border-color: ${C.gold};
        box-shadow: 0 0 0 3px rgba(201,168,76,0.13);
        background: #fff;
      }
      /* textarea override */
      .set-textarea {
        height: auto;
        padding: 11px 13px;
        resize: vertical;
        min-height: 72px;
        line-height: 1.55;
      }
      /* time input cursor */
      input[type="time"].set-input { cursor: pointer; }

      /* ── Closed-days pills ────────────────────── */
      .set-days-row {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }
      .set-day-pill {
        font-family: ${FONT_BODY};
        font-size: 12.5px;
        font-weight: 500;
        padding: 0 15px;
        height: 38px;
        border-radius: 20px;
        border: 1.5px solid ${C.line};
        background: ${C.cream};
        color: ${C.mist};
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        transition: border-color 0.16s, background 0.16s, color 0.16s, transform 0.1s;
        -webkit-tap-highlight-color: transparent;
        user-select: none;
      }
      .set-day-pill:hover {
        border-color: rgba(201,168,76,0.45);
        color: ${C.chocolate};
      }
      .set-day-pill.active {
        background: rgba(201,168,76,0.14);
        border-color: ${C.gold};
        color: ${C.chocolate};
        font-weight: 600;
      }
      .set-day-pill:active { transform: scale(0.95); }
      .set-day-dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: ${C.gold};
        flex-shrink: 0;
      }

      /* ── Sticky save bar ──────────────────────── */
      .set-save-bar {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        z-index: 300;
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 12px 28px calc(12px + env(safe-area-inset-bottom, 0px));
        background: ${C.espresso};
        border-top: 1px solid rgba(201,168,76,0.18);
        box-shadow: 0 -6px 28px rgba(20,8,2,0.22);
        transform: translateY(100%);
        transition: transform 0.28s cubic-bezier(0.4, 0, 0.2, 1);
        will-change: transform;
      }
      .set-save-bar.visible { transform: translateY(0); }

      .set-bar-msg {
        flex: 1;
        font-family: ${FONT_BODY};
        font-size: 12px;
        color: rgba(250,246,239,0.45);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        min-width: 0;
      }

      /* ── Save button ──────────────────────────── */
      .set-save-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 7px;
        padding: 0 22px;
        height: 42px;
        font-family: ${FONT_BODY};
        font-size: 13px;
        font-weight: 700;
        letter-spacing: 0.01em;
        color: ${C.espresso};
        background: ${C.gold};
        border: none;
        border-radius: 7px;
        cursor: pointer;
        white-space: nowrap;
        flex-shrink: 0;
        -webkit-tap-highlight-color: transparent;
        transition: background 0.18s, transform 0.12s;
      }
      .set-save-btn:hover  { background: ${C.goldLight}; }
      .set-save-btn:active { transform: scale(0.97); }

      /* ── Reset button ─────────────────────────── */
      .set-reset-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        padding: 0 16px;
        height: 42px;
        font-family: ${FONT_BODY};
        font-size: 12.5px;
        font-weight: 500;
        color: rgba(250,246,239,0.5);
        background: transparent;
        border: 1px solid rgba(250,246,239,0.14);
        border-radius: 7px;
        cursor: pointer;
        white-space: nowrap;
        flex-shrink: 0;
        -webkit-tap-highlight-color: transparent;
        transition: color 0.18s, border-color 0.18s, background 0.18s;
      }
      .set-reset-btn:hover {
        color: rgba(250,246,239,0.82);
        border-color: rgba(250,246,239,0.28);
        background: rgba(250,246,239,0.05);
      }

      /* ── Toast ────────────────────────────────── */
      .set-toast {
        position: fixed;
        top: 72px;
        right: 20px;
        z-index: 400;
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 12px 14px;
        background: #fff;
        border: 1px solid rgba(34,139,70,0.22);
        border-left: 3px solid #22A84A;
        border-radius: 9px;
        box-shadow: 0 4px 22px rgba(46,26,14,0.12);
        font-family: ${FONT_BODY};
        font-size: 13px;
        font-weight: 500;
        color: ${C.espresso};
        max-width: 260px;
        transform: translateX(calc(100% + 32px));
        transition: transform 0.32s cubic-bezier(0.34, 1.56, 0.64, 1);
        pointer-events: none;
      }
      .set-toast.visible {
        transform: translateX(0);
        pointer-events: auto;
      }
      .set-toast-dismiss {
        margin-left: auto;
        padding: 2px;
        background: none;
        border: none;
        cursor: pointer;
        color: ${C.mist};
        opacity: 0.55;
        display: flex;
        align-items: center;
        flex-shrink: 0;
        transition: opacity 0.15s;
        -webkit-tap-highlight-color: transparent;
      }
      .set-toast-dismiss:hover { opacity: 1; }

      /* ── Hint text ────────────────────────────── */
      .set-hint {
        font-family: ${FONT_BODY};
        font-size: 11.5px;
        color: ${C.mist};
        opacity: 0.65;
        font-style: italic;
        margin-top: 14px;
        line-height: 1.5;
      }

      /* ── Animations ───────────────────────────── */
      @keyframes set-rise {
        from { opacity: 0; transform: translateY(10px); }
        to   { opacity: 1; transform: translateY(0);    }
      }

      /* ── RESPONSIVE ───────────────────────────── */
      @media (max-width: 600px) {
        /* Single column */
        .set-grid       { grid-template-columns: 1fr; gap: 14px; }
        .set-col-full   { grid-column: 1; }

        /* Looser card padding */
        .set-card-header { padding: 14px 16px; }
        .set-card-body   { padding: 16px; }

        /* 16px font prevents iOS auto-zoom on focus */
        .set-input { font-size: 16px; }

        /* Save bar: stack on very narrow screens */
        .set-save-bar {
          padding: 10px 16px calc(10px + env(safe-area-inset-bottom, 0px));
          flex-wrap: wrap;
          gap: 8px;
        }
        .set-bar-msg    { width: 100%; flex: none; }
        .set-reset-btn  { flex: 1; }
        .set-save-btn   { flex: 2; }

        /* Toast slides up from bottom on mobile (above save bar) */
        .set-toast {
          top: auto;
          bottom: calc(76px + env(safe-area-inset-bottom, 0px));
          right: 12px;
          left: 12px;
          max-width: none;
          transform: translateY(16px);
          opacity: 0;
          transition: transform 0.26s ease, opacity 0.26s ease;
        }
        .set-toast.visible {
          transform: translateY(0);
          opacity: 1;
        }
      }

      /* ── Reduced motion ───────────────────────── */
      @media (prefers-reduced-motion: reduce) {
        .set-card,
        .set-save-bar,
        .set-toast,
        .set-input,
        .set-day-pill,
        .set-save-btn,
        .set-reset-btn {
          animation: none !important;
          transition: none !important;
        }
        .set-save-bar   { transform: none; position: sticky; }
        .set-toast      { transform: none; opacity: 1; }
      }
    `}</style>
  );
}

/* ─────────────────────────────────────────────────
   SUB-COMPONENTS
───────────────────────────────────────────────── */

/* Section card wrapper */
function SectionCard({ icon: Icon, title, subtitle, children, delay = 0 }) {
  return (
    <div className="set-card" style={{ animationDelay: `${delay}s` }}>
      <div className="set-card-header">
        <div className="set-card-icon">
          <Icon size={15} color={C.gold} />
        </div>
        <div>
          <p style={{
            fontFamily: FONT_DISPLAY,
            fontSize: 20,
            fontWeight: 400,
            color: C.espresso,
            lineHeight: 1.1,
            letterSpacing: "0.01em",
          }}>
            {title}
          </p>
          {subtitle && (
            <p style={{
              fontFamily: FONT_BODY,
              fontSize: 11.5,
              color: C.mist,
              marginTop: 3,
              opacity: 0.8,
            }}>
              {subtitle}
            </p>
          )}
        </div>
      </div>
      <div className="set-card-body">{children}</div>
    </div>
  );
}

/* Labelled field — `full` spans both grid columns */
function Field({ label, labelIcon: LIcon, children, full = false }) {
  return (
    <div className={`set-field${full ? " set-col-full" : ""}`}>
      <span className="set-label">
        {LIcon && <LIcon size={10} />}
        {label}
      </span>
      {children}
    </div>
  );
}

/* Text / URL / tel / email input */
function Input({ value, onChange, placeholder, type = "text" }) {
  return (
    <input
      className="set-input"
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      autoComplete="off"
      spellCheck={false}
    />
  );
}

/* Textarea */
function Textarea({ value, onChange, placeholder, rows = 3 }) {
  return (
    <textarea
      className="set-input set-textarea"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={rows}
    />
  );
}

/* Closed-days pill toggles */
function DayPills({ value, onChange }) {
  const toggle = useCallback(
    (day) => {
      onChange(
        value.includes(day)
          ? value.filter((d) => d !== day)
          : [...value, day]
      );
    },
    [value, onChange]
  );

  return (
    <div className="set-days-row">
      {DAYS.map((day, i) => {
        const active = value.includes(day);
        return (
          <button
            key={day}
            type="button"
            className={`set-day-pill${active ? " active" : ""}`}
            onClick={() => toggle(day)}
            aria-pressed={active}
            aria-label={`${active ? "Unmark" : "Mark"} ${day} as closed`}
          >
            {active && <span className="set-day-dot" />}
            {DAY_ABR[i]}
          </button>
        );
      })}
    </div>
  );
}

/* Success toast */
function Toast({ visible, onDismiss }) {
  return (
    <div
      className={`set-toast${visible ? " visible" : ""}`}
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <CheckCircle2 size={16} color="#22A84A" style={{ flexShrink: 0 }} />
      <span>Settings saved</span>
      <button
        className="set-toast-dismiss"
        onClick={onDismiss}
        aria-label="Dismiss notification"
      >
        <X size={13} />
      </button>
    </div>
  );
}

/* Sticky save / reset bar */
function SaveBar({ visible, onSave, onReset }) {
  return (
    <div
      className={`set-save-bar${visible ? " visible" : ""}`}
      role="region"
      aria-label="Unsaved changes"
    >
      <span className="set-bar-msg">You have unsaved changes</span>
      <button className="set-reset-btn" type="button" onClick={onReset}>
        <RotateCcw size={12} />
        Reset
      </button>
      <button className="set-save-btn" type="button" onClick={onSave}>
        <Save size={13} />
        Save changes
      </button>
    </div>
  );
}

/* ─────────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────────── */
export default function Settings() {
  const [values,    setValues]    = useState({ ...DEFAULTS });
  const [saved,     setSaved]     = useState({ ...DEFAULTS });
  const [showToast, setShowToast] = useState(false);
  const toastTimer                = useRef(null);

  const isDirty = !settingsEqual(values, saved);

  /* Helpers */
  const field = useCallback(
    (key) => (e) => setValues((v) => ({ ...v, [key]: e.target.value })),
    []
  );
  const setClosedDays = useCallback(
    (days) => setValues((v) => ({ ...v, closedDays: days })),
    []
  );

  /* Actions */
  const handleSave = useCallback(() => {
    setSaved({ ...values });
    clearTimeout(toastTimer.current);
    setShowToast(true);
    toastTimer.current = setTimeout(() => setShowToast(false), 3200);
  }, [values]);

  const handleReset = useCallback(() => {
    setValues({ ...saved });
  }, [saved]);

  const dismissToast = useCallback(() => {
    setShowToast(false);
    clearTimeout(toastTimer.current);
  }, []);

  useEffect(() => () => clearTimeout(toastTimer.current), []);

  return (
    <>
      <SettingsStyles />
      <Toast    visible={showToast} onDismiss={dismissToast} />
      <SaveBar  visible={isDirty}   onSave={handleSave} onReset={handleReset} />

      <div
        style={{
          fontFamily: FONT_BODY,
          paddingBottom: isDirty ? 82 : 0,
          transition: "padding-bottom 0.28s cubic-bezier(0.4,0,0.2,1)",
        }}
      >
        {/* ── Page header ────────────────────────── */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{
            fontFamily: FONT_DISPLAY,
            fontSize: 36,
            fontWeight: 400,
            color: C.espresso,
            marginBottom: 8,
            letterSpacing: "0.01em",
          }}>
            Settings
          </h1>
          <div style={{ width: 56, height: 1.5, background: C.gold, marginBottom: 10 }} />
          <p style={{
            fontFamily: FONT_BODY,
            fontSize: 13,
            color: C.mist,
            lineHeight: 1.6,
          }}>
            Manage your store details, hours, and content. Changes are kept locally until Firestore is connected.
          </p>
        </div>

        {/* ── Section cards ──────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

          {/* ── 1. Store Information ─────────────── */}
          <SectionCard
            icon={Store}
            title="Store Information"
            subtitle="Public details your customers will see"
            delay={0}
          >
            <div className="set-grid">
              <Field label="Store Name">
                <Input
                  value={values.storeName}
                  onChange={field("storeName")}
                  placeholder="e.g. Cremeo"
                />
              </Field>

              <Field label="Tagline">
                <Input
                  value={values.tagline}
                  onChange={field("tagline")}
                  placeholder="e.g. Artisan Coffee & Fine Blends"
                />
              </Field>

              <Field label="Phone Number" labelIcon={Phone}>
                <Input
                  value={values.phone}
                  onChange={field("phone")}
                  placeholder="+92 300 0000000"
                  type="tel"
                />
              </Field>

              <Field label="WhatsApp Number" labelIcon={MessageCircle}>
                <Input
                  value={values.whatsapp}
                  onChange={field("whatsapp")}
                  placeholder="+92 300 0000000"
                  type="tel"
                />
              </Field>

              <Field label="Email Address" labelIcon={Mail}>
                <Input
                  value={values.email}
                  onChange={field("email")}
                  placeholder="hello@cremeo.com"
                  type="email"
                />
              </Field>

              <Field label="Google Maps Link" labelIcon={MapPin}>
                <Input
                  value={values.mapsLink}
                  onChange={field("mapsLink")}
                  placeholder="https://maps.google.com/..."
                  type="url"
                />
              </Field>

              <Field label="Address" labelIcon={MapPin} full>
                <Textarea
                  value={values.address}
                  onChange={field("address")}
                  placeholder="Full street address, city, country"
                  rows={2}
                />
              </Field>
            </div>
          </SectionCard>

          {/* ── 2. Social Media ──────────────────── */}
          <SectionCard
            icon={Globe}
            title="Social Media"
            subtitle="Links displayed in your storefront footer"
            delay={0.06}
          >
            <div className="set-grid">
              <Field label="Instagram" labelIcon={Instagram}>
                <Input
                  value={values.instagram}
                  onChange={field("instagram")}
                  placeholder="https://instagram.com/cremeo"
                  type="url"
                />
              </Field>

              <Field label="Facebook" labelIcon={Facebook}>
                <Input
                  value={values.facebook}
                  onChange={field("facebook")}
                  placeholder="https://facebook.com/cremeo"
                  type="url"
                />
              </Field>

              <Field label="TikTok" labelIcon={Music}>
                <Input
                  value={values.tiktok}
                  onChange={field("tiktok")}
                  placeholder="https://tiktok.com/@cremeo"
                  type="url"
                />
              </Field>
            </div>
          </SectionCard>

          {/* ── 3. Business Hours ────────────────── */}
          <SectionCard
            icon={Clock}
            title="Business Hours"
            subtitle="When your store accepts orders"
            delay={0.12}
          >
            <div className="set-grid">
              <Field label="Opening Time">
                <input
                  className="set-input"
                  type="time"
                  value={values.openingTime}
                  onChange={field("openingTime")}
                />
              </Field>

              <Field label="Closing Time">
                <input
                  className="set-input"
                  type="time"
                  value={values.closingTime}
                  onChange={field("closingTime")}
                />
              </Field>

              <Field label="Closed On" full>
                <p style={{
                  fontFamily: FONT_BODY,
                  fontSize: 12,
                  color: C.mist,
                  opacity: 0.75,
                  marginBottom: 10,
                  lineHeight: 1.45,
                }}>
                  Tap any day to mark it as closed.
                  {values.closedDays.length > 0 && (
                    <span style={{ color: C.chocolate, fontWeight: 600 }}>
                      {" "}{values.closedDays.length} day{values.closedDays.length > 1 ? "s" : ""} selected.
                    </span>
                  )}
                </p>
                <DayPills
                  value={values.closedDays}
                  onChange={setClosedDays}
                />
              </Field>
            </div>
          </SectionCard>

          {/* ── 4. Homepage ──────────────────────── */}
          <SectionCard
            icon={Layout}
            title="Homepage"
            subtitle="Hero section text shown on your storefront"
            delay={0.18}
          >
            <div className="set-grid">
              <Field label="Hero Title" full>
                <Input
                  value={values.heroTitle}
                  onChange={field("heroTitle")}
                  placeholder="e.g. Crafted for the Curious"
                />
              </Field>

              <Field label="Hero Subtitle" full>
                <Textarea
                  value={values.heroSubtitle}
                  onChange={field("heroSubtitle")}
                  placeholder="A supporting line below the main title"
                  rows={2}
                />
              </Field>

              <Field label="Button Text">
                <Input
                  value={values.heroButtonText}
                  onChange={field("heroButtonText")}
                  placeholder="e.g. Shop Now"
                />
              </Field>
            </div>
          </SectionCard>

          {/* ── 5. Branding ──────────────────────── */}
          <SectionCard
            icon={Layers}
            title="Branding"
            subtitle="Logo and favicon — direct upload coming soon"
            delay={0.24}
          >
            <div className="set-grid">
              <Field label="Logo URL" full>
                <Input
                  value={values.logoUrl}
                  onChange={field("logoUrl")}
                  placeholder="https://cdn.example.com/cremeo-logo.png"
                  type="url"
                />
              </Field>

              <Field label="Favicon URL" full>
                <Input
                  value={values.faviconUrl}
                  onChange={field("faviconUrl")}
                  placeholder="https://cdn.example.com/cremeo-favicon.ico"
                  type="url"
                />
              </Field>
            </div>
            <p className="set-hint">
              Direct image upload via Cloudinary will replace these URL fields in a future phase.
            </p>
          </SectionCard>

        </div>
      </div>
    </>
  );
}
