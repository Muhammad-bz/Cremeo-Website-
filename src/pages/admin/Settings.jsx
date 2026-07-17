// src/pages/admin/Settings.jsx
// Phase 8 — Website Control Center (Settings)
// Firestore + Cloudinary image uploads, full settings suite.
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
  Search,
  BarChart2,
  Building2,
  Youtube,
  Image as ImageIcon,
  Upload,
  Loader,
  DollarSign,
  Palette,
} from "lucide-react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../../firebase/config";

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
const DAYS    = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const DAY_ABR = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const FIRESTORE_DOC = { collection: "settings", id: "site" };

/* Cloudinary config — replace with your own cloud name & unsigned preset */
const CLOUDINARY_CLOUD_NAME = "leu4dssl";
const CLOUDINARY_UPLOAD_PRESET = "cremeo";

const DEFAULTS = {
  /* Branding */
  storeName:       "Cremeo",
  tagline:         "Artisan Coffee & Fine Blends",
  logoUrl:         "",
  faviconUrl:      "",
  heroBannerUrl:   "",
  aboutImageUrl:   "",
  aboutText:       "",
  themeColor:      "#C9A84C",
  accentColor:     "#5C3317",
  /* Contact */
  phone:           "",
  whatsapp:        "",
  email:           "",
  address:         "",
  mapsEmbedUrl:    "",
  /* Social */
  instagram:       "",
  facebook:        "",
  tiktok:          "",
  youtube:         "",
  /* Business */
  openingTime:     "08:00",
  closingTime:     "22:00",
  closedDays:      [],
  deliveryFee:     "",
  minimumOrder:    "",
  currency:        "PKR",
  currencySymbol:  "Rs.",
  /* Homepage */
  heroTitle:       "Crafted for the Curious",
  heroSubtitle:    "Premium single-origin beans, roasted to order.",
  heroButtonText:  "Shop Now",
  /* SEO */
  seoTitle:        "",
  metaDescription: "",
  metaKeywords:    "",
  canonicalUrl:    "",
  robots:          "index",
  ogImageUrl:      "",
  twitterImageUrl: "",
  /* Analytics */
  ga4Id:           "",
  gtmId:           "",
  fbPixelId:       "",
  gscVerification: "",
  /* Local Business */
  googleBusinessUrl: "",
  latitude:          "",
  longitude:         "",
  cuisineType:       "",
  priceRange:        "$",
  deliveryAvailable: true,
  pickupAvailable:   true,
};

function settingsEqual(a, b) {
  const norm = (o) => ({ ...o, closedDays: [...(o.closedDays ?? [])].sort() });
  return JSON.stringify(norm(a)) === JSON.stringify(norm(b));
}

/* ─────────────────────────────────────────────────
   CLOUDINARY UPLOAD HELPER
───────────────────────────────────────────────── */
async function uploadToCloudinary(file) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", CLOUDINARY_PRESET);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/image/upload`,
    { method: "POST", body: formData }
  );
  if (!res.ok) throw new Error("Cloudinary upload failed");
  const data = await res.json();
  return data.secure_url;
}

/* ─────────────────────────────────────────────────
   COMPONENT-SCOPED STYLES
───────────────────────────────────────────────── */
function SettingsStyles() {
  return (
    <style>{`
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
        width: 36px; height: 36px;
        border-radius: 9px;
        background: rgba(201,168,76,0.11);
        border: 1px solid rgba(201,168,76,0.22);
        display: flex; align-items: center; justify-content: center;
        flex-shrink: 0;
      }
      .set-card-body { padding: 24px; }

      .set-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 18px 22px;
      }
      .set-col-full { grid-column: 1 / -1; }

      .set-field {
        display: flex; flex-direction: column;
        gap: 7px; min-width: 0;
      }
      .set-label {
        font-family: ${FONT_BODY};
        font-size: 10.5px; font-weight: 700;
        letter-spacing: 0.08em; text-transform: uppercase;
        color: ${C.mist};
        display: flex; align-items: center; gap: 5px;
      }

      .set-input {
        font-family: ${FONT_BODY}; font-size: 13.5px;
        color: ${C.espresso};
        background: ${C.cream};
        border: 1px solid ${C.line};
        border-radius: 8px;
        padding: 0 13px; height: 44px; width: 100%;
        box-sizing: border-box; outline: none;
        -webkit-appearance: none; appearance: none;
        transition: border-color 0.18s ease, box-shadow 0.18s ease, background 0.18s ease;
      }
      .set-input::placeholder { color: ${C.mist}; opacity: 0.45; }
      .set-input:hover  { border-color: rgba(201,168,76,0.38); background: #fff; }
      .set-input:focus  { border-color: ${C.gold}; box-shadow: 0 0 0 3px rgba(201,168,76,0.13); background: #fff; }
      .set-textarea { height: auto; padding: 11px 13px; resize: vertical; min-height: 72px; line-height: 1.55; }
      input[type="time"].set-input  { cursor: pointer; }
      input[type="color"].set-input { padding: 4px 6px; height: 44px; cursor: pointer; }

      .set-days-row { display: flex; flex-wrap: wrap; gap: 8px; }
      .set-day-pill {
        font-family: ${FONT_BODY}; font-size: 12.5px; font-weight: 500;
        padding: 0 15px; height: 38px; border-radius: 20px;
        border: 1.5px solid ${C.line};
        background: ${C.cream}; color: ${C.mist};
        cursor: pointer; display: inline-flex; align-items: center; gap: 6px;
        transition: border-color 0.16s, background 0.16s, color 0.16s, transform 0.1s;
        -webkit-tap-highlight-color: transparent; user-select: none;
      }
      .set-day-pill:hover { border-color: rgba(201,168,76,0.45); color: ${C.chocolate}; }
      .set-day-pill.active {
        background: rgba(201,168,76,0.14); border-color: ${C.gold};
        color: ${C.chocolate}; font-weight: 600;
      }
      .set-day-pill:active { transform: scale(0.95); }
      .set-day-dot { width: 6px; height: 6px; border-radius: 50%; background: ${C.gold}; flex-shrink: 0; }

      /* Toggle switch */
      .set-toggle-row {
        display: flex; align-items: center; gap: 12px;
        font-family: ${FONT_BODY}; font-size: 13.5px; color: ${C.espresso};
      }
      .set-toggle {
        position: relative; width: 44px; height: 24px;
        border-radius: 12px; border: none; cursor: pointer;
        transition: background 0.2s;
        flex-shrink: 0;
      }
      .set-toggle::after {
        content: "";
        position: absolute; top: 3px; left: 3px;
        width: 18px; height: 18px; border-radius: 50%;
        background: #fff;
        transition: transform 0.2s;
      }
      .set-toggle.on  { background: ${C.gold}; }
      .set-toggle.off { background: ${C.parchment}; }
      .set-toggle.on::after  { transform: translateX(20px); }
      .set-toggle.off::after { transform: translateX(0); }

      /* Image upload widget */
      .set-img-upload {
        border: 1.5px dashed ${C.line};
        border-radius: 10px;
        background: ${C.cream};
        padding: 16px;
        display: flex; align-items: center; gap: 14px;
        transition: border-color 0.18s, background 0.18s;
        min-height: 72px;
      }
      .set-img-upload:hover { border-color: rgba(201,168,76,0.45); background: #fff; }
      .set-img-upload-thumb {
        width: 52px; height: 52px; border-radius: 7px;
        object-fit: cover; flex-shrink: 0;
        border: 1px solid ${C.line};
        background: ${C.parchment};
      }
      .set-img-upload-btn {
        font-family: ${FONT_BODY}; font-size: 12px; font-weight: 600;
        color: ${C.chocolate}; background: rgba(201,168,76,0.13);
        border: 1px solid rgba(201,168,76,0.28);
        border-radius: 6px; padding: 7px 14px;
        cursor: pointer; display: inline-flex; align-items: center; gap: 6px;
        transition: background 0.16s, border-color 0.16s;
        white-space: nowrap;
      }
      .set-img-upload-btn:hover { background: rgba(201,168,76,0.22); border-color: ${C.gold}; }
      .set-img-upload-btn:disabled { opacity: 0.55; cursor: not-allowed; }

      /* Sticky save bar */
      .set-save-bar {
        position: fixed; bottom: 0; left: 0; right: 0; z-index: 300;
        display: flex; align-items: center; gap: 10px;
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
        flex: 1; font-family: ${FONT_BODY}; font-size: 12px;
        color: rgba(250,246,239,0.45); white-space: nowrap;
        overflow: hidden; text-overflow: ellipsis; min-width: 0;
      }

      .set-save-btn {
        display: inline-flex; align-items: center; justify-content: center; gap: 7px;
        padding: 0 22px; height: 42px;
        font-family: ${FONT_BODY}; font-size: 13px; font-weight: 700;
        letter-spacing: 0.01em; color: ${C.espresso};
        background: ${C.gold}; border: none; border-radius: 7px;
        cursor: pointer; white-space: nowrap; flex-shrink: 0;
        -webkit-tap-highlight-color: transparent;
        transition: background 0.18s, transform 0.12s;
      }
      .set-save-btn:hover  { background: ${C.goldLight}; }
      .set-save-btn:active { transform: scale(0.97); }

      .set-reset-btn {
        display: inline-flex; align-items: center; justify-content: center; gap: 6px;
        padding: 0 16px; height: 42px;
        font-family: ${FONT_BODY}; font-size: 12.5px; font-weight: 500;
        color: rgba(250,246,239,0.5); background: transparent;
        border: 1px solid rgba(250,246,239,0.14); border-radius: 7px;
        cursor: pointer; white-space: nowrap; flex-shrink: 0;
        -webkit-tap-highlight-color: transparent;
        transition: color 0.18s, border-color 0.18s, background 0.18s;
      }
      .set-reset-btn:hover {
        color: rgba(250,246,239,0.82);
        border-color: rgba(250,246,239,0.28);
        background: rgba(250,246,239,0.05);
      }

      .set-toast {
        position: fixed; top: 72px; right: 20px; z-index: 400;
        display: flex; align-items: center; gap: 10px;
        padding: 12px 14px; background: #fff;
        border: 1px solid rgba(34,139,70,0.22);
        border-left: 3px solid #22A84A; border-radius: 9px;
        box-shadow: 0 4px 22px rgba(46,26,14,0.12);
        font-family: ${FONT_BODY}; font-size: 13px; font-weight: 500;
        color: ${C.espresso}; max-width: 280px;
        transform: translateX(calc(100% + 32px));
        transition: transform 0.32s cubic-bezier(0.34, 1.56, 0.64, 1);
        pointer-events: none;
      }
      .set-toast.visible { transform: translateX(0); pointer-events: auto; }
      .set-toast.error   { border-left-color: #C0392B; }
      .set-toast-dismiss {
        margin-left: auto; padding: 2px; background: none; border: none;
        cursor: pointer; color: ${C.mist}; opacity: 0.55;
        display: flex; align-items: center; flex-shrink: 0;
        transition: opacity 0.15s; -webkit-tap-highlight-color: transparent;
      }
      .set-toast-dismiss:hover { opacity: 1; }

      .set-hint {
        font-family: ${FONT_BODY}; font-size: 11.5px;
        color: ${C.mist}; opacity: 0.65;
        font-style: italic; margin-top: 14px; line-height: 1.5;
      }

      .set-select {
        font-family: ${FONT_BODY}; font-size: 13.5px; color: ${C.espresso};
        background: ${C.cream}; border: 1px solid ${C.line};
        border-radius: 8px; padding: 0 13px; height: 44px; width: 100%;
        box-sizing: border-box; outline: none; cursor: pointer;
        -webkit-appearance: none; appearance: none;
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%237A6558' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
        background-repeat: no-repeat;
        background-position: right 13px center;
        padding-right: 36px;
        transition: border-color 0.18s, box-shadow 0.18s;
      }
      .set-select:focus { border-color: ${C.gold}; box-shadow: 0 0 0 3px rgba(201,168,76,0.13); }

      .set-loading-overlay {
        display: flex; align-items: center; justify-content: center;
        gap: 10px; padding: 16px;
        font-family: ${FONT_BODY}; font-size: 13px; color: ${C.mist};
      }

      @keyframes set-rise {
        from { opacity: 0; transform: translateY(10px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      @keyframes set-spin {
        from { transform: rotate(0deg); }
        to   { transform: rotate(360deg); }
      }
      .set-spinner { animation: set-spin 0.8s linear infinite; }

      @media (max-width: 600px) {
        .set-grid       { grid-template-columns: 1fr; gap: 14px; }
        .set-col-full   { grid-column: 1; }
        .set-card-header { padding: 14px 16px; }
        .set-card-body   { padding: 16px; }
        .set-input { font-size: 16px; }
        .set-save-bar { padding: 10px 16px calc(10px + env(safe-area-inset-bottom, 0px)); flex-wrap: wrap; gap: 8px; }
        .set-bar-msg   { width: 100%; flex: none; }
        .set-reset-btn { flex: 1; }
        .set-save-btn  { flex: 2; }
        .set-toast {
          top: auto; bottom: calc(76px + env(safe-area-inset-bottom, 0px));
          right: 12px; left: 12px; max-width: none;
          transform: translateY(16px); opacity: 0;
          transition: transform 0.26s ease, opacity 0.26s ease;
        }
        .set-toast.visible { transform: translateY(0); opacity: 1; }
      }
      @media (prefers-reduced-motion: reduce) {
        .set-card, .set-save-bar, .set-toast, .set-input,
        .set-day-pill, .set-save-btn, .set-reset-btn {
          animation: none !important; transition: none !important;
        }
        .set-save-bar { transform: none; position: sticky; }
        .set-toast    { transform: none; opacity: 1; }
      }
    `}</style>
  );
}

/* ─────────────────────────────────────────────────
   SUB-COMPONENTS
───────────────────────────────────────────────── */
function SectionCard({ icon: Icon, title, subtitle, children, delay = 0 }) {
  return (
    <div className="set-card" style={{ animationDelay: `${delay}s` }}>
      <div className="set-card-header">
        <div className="set-card-icon">
          <Icon size={15} color={C.gold} />
        </div>
        <div>
          <p style={{ fontFamily: FONT_DISPLAY, fontSize: 20, fontWeight: 400, color: C.espresso, lineHeight: 1.1, letterSpacing: "0.01em" }}>
            {title}
          </p>
          {subtitle && (
            <p style={{ fontFamily: FONT_BODY, fontSize: 11.5, color: C.mist, marginTop: 3, opacity: 0.8 }}>
              {subtitle}
            </p>
          )}
        </div>
      </div>
      <div className="set-card-body">{children}</div>
    </div>
  );
}

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

function Select({ value, onChange, options }) {
  return (
    <select className="set-select" value={value} onChange={onChange}>
      {options.map((o) => (
        <option key={o.value ?? o} value={o.value ?? o}>
          {o.label ?? o}
        </option>
      ))}
    </select>
  );
}

function Toggle({ checked, onChange, label }) {
  return (
    <div className="set-toggle-row">
      <button
        type="button"
        className={`set-toggle ${checked ? "on" : "off"}`}
        onClick={() => onChange(!checked)}
        role="switch"
        aria-checked={checked}
        aria-label={label}
      />
      <span>{label}</span>
    </div>
  );
}

/* Cloudinary image upload widget */
function ImageUpload({ label, value, onChange, hint, full = true }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  const handleFile = useCallback(async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const url = await uploadToCloudinary(file);
      onChange(url);
    } catch (err) {
      setError("Upload failed. Check Cloudinary config.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }, [onChange]);

  return (
    <div className={`set-field${full ? " set-col-full" : ""}`}>
      <span className="set-label"><ImageIcon size={10} /> {label}</span>
      <div className="set-img-upload">
        {value ? (
          <img src={value} alt={label} className="set-img-upload-thumb" />
        ) : (
          <div className="set-img-upload-thumb" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
            <ImageIcon size={20} color={C.parchment} />
          </div>
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <button
            type="button"
            className="set-img-upload-btn"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
          >
            {uploading
              ? <><Loader size={12} className="set-spinner" /> Uploading…</>
              : <><Upload size={12} /> {value ? "Replace" : "Upload"}</>}
          </button>
          {value && (
            <p style={{ fontFamily: FONT_BODY, fontSize: 10.5, color: C.mist, marginTop: 5, wordBreak: "break-all", opacity: 0.65 }}>
              {value.split("/").pop()}
            </p>
          )}
          {hint && !value && (
            <p style={{ fontFamily: FONT_BODY, fontSize: 10.5, color: C.mist, marginTop: 4, opacity: 0.55 }}>
              {hint}
            </p>
          )}
          {error && (
            <p style={{ fontFamily: FONT_BODY, fontSize: 11, color: "#C0392B", marginTop: 4 }}>{error}</p>
          )}
        </div>
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            style={{ background: "none", border: "none", cursor: "pointer", color: C.mist, opacity: 0.45, padding: 4, flexShrink: 0 }}
            aria-label={`Remove ${label}`}
          >
            <X size={14} />
          </button>
        )}
      </div>
      <input ref={inputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFile} />
    </div>
  );
}

function DayPills({ value, onChange }) {
  const toggle = useCallback(
    (day) => onChange(value.includes(day) ? value.filter((d) => d !== day) : [...value, day]),
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

function Toast({ visible, isError, message, onDismiss }) {
  return (
    <div
      className={`set-toast${visible ? " visible" : ""}${isError ? " error" : ""}`}
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      {isError
        ? <X size={16} color="#C0392B" style={{ flexShrink: 0 }} />
        : <CheckCircle2 size={16} color="#22A84A" style={{ flexShrink: 0 }} />}
      <span>{message || "Settings saved"}</span>
      <button className="set-toast-dismiss" onClick={onDismiss} aria-label="Dismiss notification">
        <X size={13} />
      </button>
    </div>
  );
}

function SaveBar({ visible, saving, onSave, onReset }) {
  return (
    <div className={`set-save-bar${visible ? " visible" : ""}`} role="region" aria-label="Unsaved changes">
      <span className="set-bar-msg">You have unsaved changes</span>
      <button className="set-reset-btn" type="button" onClick={onReset} disabled={saving}>
        <RotateCcw size={12} />
        Reset
      </button>
      <button className="set-save-btn" type="button" onClick={onSave} disabled={saving}>
        {saving
          ? <><Loader size={12} className="set-spinner" /> Saving…</>
          : <><Save size={13} /> Save changes</>}
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
  const [loading,   setLoading]   = useState(true);
  const [saving,    setSaving]    = useState(false);
  const [toast,     setToast]     = useState({ visible: false, message: "", isError: false });
  const toastTimer                = useRef(null);

  const isDirty = !settingsEqual(values, saved);

  /* ── Load from Firestore on mount ── */
  useEffect(() => {
    async function load() {
      try {
        const snap = await getDoc(doc(db, FIRESTORE_DOC.collection, FIRESTORE_DOC.id));
        if (snap.exists()) {
          const data = { ...DEFAULTS, ...snap.data() };
          setValues(data);
          setSaved(data);
        }
      } catch (err) {
        console.error("Settings load error:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const showToast = useCallback((message, isError = false) => {
    clearTimeout(toastTimer.current);
    setToast({ visible: true, message, isError });
    toastTimer.current = setTimeout(() => setToast((t) => ({ ...t, visible: false })), 3400);
  }, []);

  /* Helpers */
  const field = useCallback(
    (key) => (e) => setValues((v) => ({ ...v, [key]: e.target.value })),
    []
  );
  const boolField = useCallback(
    (key) => (val) => setValues((v) => ({ ...v, [key]: val })),
    []
  );
  const imageField = useCallback(
    (key) => (url) => setValues((v) => ({ ...v, [key]: url })),
    []
  );
  const setClosedDays = useCallback(
    (days) => setValues((v) => ({ ...v, closedDays: days })),
    []
  );

  /* ── Save to Firestore ── */
  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      await setDoc(
        doc(db, FIRESTORE_DOC.collection, FIRESTORE_DOC.id),
        { ...values },
        { merge: true }
      );
      setSaved({ ...values });
      showToast("Settings saved successfully");
    } catch (err) {
      console.error("Settings save error:", err);
      showToast("Failed to save. Please try again.", true);
    } finally {
      setSaving(false);
    }
  }, [values, showToast]);

  const handleReset = useCallback(() => {
    setValues({ ...saved });
  }, [saved]);

  const dismissToast = useCallback(() => {
    setToast((t) => ({ ...t, visible: false }));
    clearTimeout(toastTimer.current);
  }, []);

  useEffect(() => () => clearTimeout(toastTimer.current), []);

  if (loading) {
    return (
      <>
        <SettingsStyles />
        <div className="set-loading-overlay">
          <Loader size={18} color={C.gold} className="set-spinner" />
          <span>Loading settings…</span>
        </div>
      </>
    );
  }

  return (
    <>
      <SettingsStyles />
      <Toast
        visible={toast.visible}
        isError={toast.isError}
        message={toast.message}
        onDismiss={dismissToast}
      />
      <SaveBar visible={isDirty} saving={saving} onSave={handleSave} onReset={handleReset} />

      <div
        style={{
          fontFamily: FONT_BODY,
          paddingBottom: isDirty ? 82 : 0,
          transition: "padding-bottom 0.28s cubic-bezier(0.4,0,0.2,1)",
        }}
      >
        {/* ── Page header ── */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontFamily: FONT_DISPLAY, fontSize: 36, fontWeight: 400, color: C.espresso, marginBottom: 8, letterSpacing: "0.01em" }}>
            Settings
          </h1>
          <div style={{ width: 56, height: 1.5, background: C.gold, marginBottom: 10 }} />
          <p style={{ fontFamily: FONT_BODY, fontSize: 13, color: C.mist, lineHeight: 1.6 }}>
            Website Control Center — all changes are saved to Firestore and reflected on the live site.
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

          {/* ── 1. Store Branding ── */}
          <SectionCard icon={Layers} title="Store Branding" subtitle="Visual identity and core content" delay={0}>
            <div className="set-grid">
              <Field label="Store Name">
                <Input value={values.storeName} onChange={field("storeName")} placeholder="e.g. Cremeo" />
              </Field>

              <Field label="Tagline">
                <Input value={values.tagline} onChange={field("tagline")} placeholder="e.g. Artisan Coffee & Fine Blends" />
              </Field>

              <Field label="Theme Color" labelIcon={Palette}>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <input
                    className="set-input"
                    type="color"
                    value={values.themeColor}
                    onChange={field("themeColor")}
                    style={{ width: 56, padding: "4px 6px", flexShrink: 0 }}
                  />
                  <input
                    className="set-input"
                    type="text"
                    value={values.themeColor}
                    onChange={field("themeColor")}
                    placeholder="#C9A84C"
                    style={{ flex: 1 }}
                  />
                </div>
              </Field>

              <Field label="Accent Color" labelIcon={Palette}>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <input
                    className="set-input"
                    type="color"
                    value={values.accentColor}
                    onChange={field("accentColor")}
                    style={{ width: 56, padding: "4px 6px", flexShrink: 0 }}
                  />
                  <input
                    className="set-input"
                    type="text"
                    value={values.accentColor}
                    onChange={field("accentColor")}
                    placeholder="#5C3317"
                    style={{ flex: 1 }}
                  />
                </div>
              </Field>

              <ImageUpload label="Logo" value={values.logoUrl} onChange={imageField("logoUrl")} hint="Recommended: SVG or PNG with transparent background" />
              <ImageUpload label="Favicon" value={values.faviconUrl} onChange={imageField("faviconUrl")} hint="Recommended: 32×32 or 64×64 ICO/PNG" />
              <ImageUpload label="Hero Banner" value={values.heroBannerUrl} onChange={imageField("heroBannerUrl")} hint="Recommended: 1600×900 JPG/WebP" />
              <ImageUpload label="About Image" value={values.aboutImageUrl} onChange={imageField("aboutImageUrl")} hint="Recommended: 900×600 JPG/WebP" />

              <Field label="About Text" full>
                <Textarea
                  value={values.aboutText}
                  onChange={field("aboutText")}
                  placeholder="Tell your brand story…"
                  rows={4}
                />
              </Field>
            </div>
          </SectionCard>

          {/* ── 2. Contact ── */}
          <SectionCard icon={Phone} title="Contact" subtitle="How customers reach you" delay={0.04}>
            <div className="set-grid">
              <Field label="Phone Number" labelIcon={Phone}>
                <Input value={values.phone} onChange={field("phone")} placeholder="+92 300 0000000" type="tel" />
              </Field>

              <Field label="WhatsApp Number" labelIcon={MessageCircle}>
                <Input value={values.whatsapp} onChange={field("whatsapp")} placeholder="+92 300 0000000" type="tel" />
              </Field>

              <Field label="Email Address" labelIcon={Mail}>
                <Input value={values.email} onChange={field("email")} placeholder="hello@cremeo.com" type="email" />
              </Field>

              <Field label="Google Maps Embed URL" labelIcon={MapPin}>
                <Input value={values.mapsEmbedUrl} onChange={field("mapsEmbedUrl")} placeholder="https://maps.google.com/maps?..." type="url" />
              </Field>

              <Field label="Address" labelIcon={MapPin} full>
                <Textarea value={values.address} onChange={field("address")} placeholder="Full street address, city, country" rows={2} />
              </Field>
            </div>
          </SectionCard>

          {/* ── 3. Social Media ── */}
          <SectionCard icon={Globe} title="Social Media" subtitle="Links in your storefront footer" delay={0.08}>
            <div className="set-grid">
              <Field label="Instagram" labelIcon={Instagram}>
                <Input value={values.instagram} onChange={field("instagram")} placeholder="https://instagram.com/cremeo" type="url" />
              </Field>

              <Field label="Facebook" labelIcon={Facebook}>
                <Input value={values.facebook} onChange={field("facebook")} placeholder="https://facebook.com/cremeo" type="url" />
              </Field>

              <Field label="TikTok" labelIcon={Music}>
                <Input value={values.tiktok} onChange={field("tiktok")} placeholder="https://tiktok.com/@cremeo" type="url" />
              </Field>

              <Field label="YouTube" labelIcon={Youtube}>
                <Input value={values.youtube} onChange={field("youtube")} placeholder="https://youtube.com/@cremeo" type="url" />
              </Field>
            </div>
          </SectionCard>

          {/* ── 4. Business ── */}
          <SectionCard icon={Store} title="Business" subtitle="Hours, delivery, pricing" delay={0.12}>
            <div className="set-grid">
              <Field label="Opening Time">
                <input className="set-input" type="time" value={values.openingTime} onChange={field("openingTime")} />
              </Field>

              <Field label="Closing Time">
                <input className="set-input" type="time" value={values.closingTime} onChange={field("closingTime")} />
              </Field>

              <Field label="Currency">
                <Input value={values.currency} onChange={field("currency")} placeholder="PKR" />
              </Field>

              <Field label="Currency Symbol" labelIcon={DollarSign}>
                <Input value={values.currencySymbol} onChange={field("currencySymbol")} placeholder="Rs." />
              </Field>

              <Field label="Delivery Fee">
                <Input value={values.deliveryFee} onChange={field("deliveryFee")} placeholder="e.g. 150" />
              </Field>

              <Field label="Minimum Order">
                <Input value={values.minimumOrder} onChange={field("minimumOrder")} placeholder="e.g. 500" />
              </Field>

              <Field label="Closed On" full>
                <p style={{ fontFamily: FONT_BODY, fontSize: 12, color: C.mist, opacity: 0.75, marginBottom: 10, lineHeight: 1.45 }}>
                  Tap any day to mark it as closed.
                  {values.closedDays.length > 0 && (
                    <span style={{ color: C.chocolate, fontWeight: 600 }}>
                      {" "}{values.closedDays.length} day{values.closedDays.length > 1 ? "s" : ""} selected.
                    </span>
                  )}
                </p>
                <DayPills value={values.closedDays} onChange={setClosedDays} />
              </Field>
            </div>
          </SectionCard>

          {/* ── 5. Homepage ── */}
          <SectionCard icon={Layout} title="Homepage" subtitle="Hero section text shown on your storefront" delay={0.16}>
            <div className="set-grid">
              <Field label="Hero Title" full>
                <Input value={values.heroTitle} onChange={field("heroTitle")} placeholder="e.g. Crafted for the Curious" />
              </Field>

              <Field label="Hero Subtitle" full>
                <Textarea value={values.heroSubtitle} onChange={field("heroSubtitle")} placeholder="A supporting line below the main title" rows={2} />
              </Field>

              <Field label="Button Text">
                <Input value={values.heroButtonText} onChange={field("heroButtonText")} placeholder="e.g. Shop Now" />
              </Field>
            </div>
          </SectionCard>

          {/* ── 6. SEO ── */}
          <SectionCard icon={Search} title="SEO" subtitle="Search engine optimisation settings" delay={0.20}>
            <div className="set-grid">
              <Field label="Website Title" full>
                <Input value={values.seoTitle} onChange={field("seoTitle")} placeholder="Cremeo — Artisan Bakery Lahore" />
              </Field>

              <Field label="Meta Description" full>
                <Textarea value={values.metaDescription} onChange={field("metaDescription")} placeholder="A 150–160 character description of your site…" rows={2} />
              </Field>

              <Field label="Meta Keywords" full>
                <Input value={values.metaKeywords} onChange={field("metaKeywords")} placeholder="bakery, cakes, lahore, custom cakes" />
              </Field>

              <Field label="Canonical URL" full>
                <Input value={values.canonicalUrl} onChange={field("canonicalUrl")} placeholder="https://cremeo.pk" type="url" />
              </Field>

              <Field label="Robots">
                <Select
                  value={values.robots}
                  onChange={field("robots")}
                  options={[
                    { value: "index",   label: "Index (default)" },
                    { value: "noindex", label: "NoIndex" },
                  ]}
                />
              </Field>

              <ImageUpload label="Open Graph Image" value={values.ogImageUrl} onChange={imageField("ogImageUrl")} hint="1200×630 JPG/PNG — shown when shared on social media" />
              <ImageUpload label="Twitter / X Card Image" value={values.twitterImageUrl} onChange={imageField("twitterImageUrl")} hint="1200×628 JPG/PNG — Twitter card image" />
            </div>
          </SectionCard>

          {/* ── 7. Analytics ── */}
          <SectionCard icon={BarChart2} title="Analytics" subtitle="Tracking and measurement IDs" delay={0.24}>
            <div className="set-grid">
              <Field label="Google Analytics GA4 ID">
                <Input value={values.ga4Id} onChange={field("ga4Id")} placeholder="G-XXXXXXXXXX" />
              </Field>

              <Field label="Google Tag Manager ID">
                <Input value={values.gtmId} onChange={field("gtmId")} placeholder="GTM-XXXXXXX" />
              </Field>

              <Field label="Facebook Pixel ID">
                <Input value={values.fbPixelId} onChange={field("fbPixelId")} placeholder="1234567890" />
              </Field>

              <Field label="Google Search Console Verification Tag" full>
                <Input value={values.gscVerification} onChange={field("gscVerification")} placeholder="meta content value from GSC" />
              </Field>
            </div>
          </SectionCard>

          {/* ── 8. Local Business ── */}
          <SectionCard icon={Building2} title="Local Business" subtitle="Structured data for search engines and maps" delay={0.28}>
            <div className="set-grid">
              <Field label="Google Business Profile URL" full>
                <Input value={values.googleBusinessUrl} onChange={field("googleBusinessUrl")} placeholder="https://g.page/cremeo" type="url" />
              </Field>

              <Field label="Latitude">
                <Input value={values.latitude} onChange={field("latitude")} placeholder="31.4504" />
              </Field>

              <Field label="Longitude">
                <Input value={values.longitude} onChange={field("longitude")} placeholder="74.3587" />
              </Field>

              <Field label="Cuisine Type">
                <Input value={values.cuisineType} onChange={field("cuisineType")} placeholder="Bakery, Desserts, Coffee" />
              </Field>

              <Field label="Price Range">
                <Select
                  value={values.priceRange}
                  onChange={field("priceRange")}
                  options={[
                    { value: "$",   label: "$ — Budget" },
                    { value: "$$",  label: "$$ — Moderate" },
                    { value: "$$$", label: "$$$ — Upscale" },
                  ]}
                />
              </Field>

              <Field label="Delivery Available" full>
                <Toggle checked={values.deliveryAvailable} onChange={boolField("deliveryAvailable")} label="Accept delivery orders" />
              </Field>

              <Field label="Pickup Available" full>
                <Toggle checked={values.pickupAvailable} onChange={boolField("pickupAvailable")} label="Accept pickup orders" />
              </Field>
            </div>
          </SectionCard>

        </div>
      </div>
    </>
  );
}
