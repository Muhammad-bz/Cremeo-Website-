// src/pages/admin/Products.jsx
// Rendered inside AdminLayout via <Outlet />.
//
// Phase 3: useProducts hook wired to Firestore "products" collection.
// UI components are untouched.

import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
  memo,
} from "react";
import {
  getFirestore,
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  query,
  orderBy,
} from "firebase/firestore";
import app from "../../firebase/config";
import {
  Plus,
  Search,
  X,
  Pencil,
  Trash2,
  ChevronDown,
  ImageOff,
  AlertTriangle,
  Check,
  Package,
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
  lineStrong:"rgba(92,51,23,0.2)",
  red:       "#DC2626",
  redBg:     "#FEF2F2",
  redLine:   "#FCA5A5",
  green:     "#16A34A",
  greenBg:   "#F0FDF4",
  greenLine: "#86EFAC",
};
const FONT_DISPLAY = "'Cormorant Garamond', Georgia, serif";
const FONT_BODY    = "'DM Sans', system-ui, sans-serif";

/* ─────────────────────────────────────────────────
   CATEGORIES  (matches the public site's menu data)
───────────────────────────────────────────────── */
const CATEGORIES = [
  "Bento Cake",
  "Cake 1 Pound",
  "Cake 1.5 Pound",
  "Cake 2 Pound",
  "Dream Cake",
  "Pastries",
  "Donut",
  "Seasonal",
  "Sundes",
  "Bowls",
  "Cream Puff",
  "Loaf Cakes",
  "Loaded Brownie",
  "Cup Cake",
  "Cake Pops",
  "Tarts",
  "Savory Foods",
  "American Kuisine (Imported)",
  "Coffee",
];

/* ─────────────────────────────────────────────────
   FIRESTORE INSTANCE
───────────────────────────────────────────────── */
const db = getFirestore(app);

/* ─────────────────────────────────────────────────
   EMPTY FORM  (single source of truth for the modal)
───────────────────────────────────────────────── */
const EMPTY_FORM = {
  name:        "",
  category:    CATEGORIES[0],
  description: "",
  price:       "",
  featured:    false,
  available:   true,
  imageUrl:    "",
};

/* ═══════════════════════════════════════════════
   useProducts  — Firestore "products" collection.
   Public API: products, loading, error, addProduct,
   updateProduct, deleteProduct.
════════════════════════════════════════════════ */
function useProducts() {
  const [products, setProducts] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);

  /* Real-time listener — ordered newest first */
  useEffect(() => {
    const q = query(
      collection(db, "products"),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        const docs = snap.docs.map((d) => {
          const data = d.data();
          return {
            ...data,
            id: d.id,
            price: Number(data.price),
            // Normalise Firestore Timestamp → "YYYY-MM-DD" string for display
            createdAt: data.createdAt?.toDate
              ? data.createdAt.toDate().toISOString().slice(0, 10)
              : data.createdAt ?? "",
          };
        });
        setProducts(docs);
        setLoading(false);
        setError(null);
      },
      (err) => {
  console.error("Firestore error:", err);
  alert(err.message);
  setError(err.message);
  setLoading(false);
}
    );

    return unsub;
  }, []);

  const addProduct = useCallback(async (data) => {
    await addDoc(collection(db, "products"), {
      name:        data.name.trim(),
      category:    data.category,
      description: data.description.trim(),
      price:       Number(data.price),
      featured:    Boolean(data.featured),
      available:   Boolean(data.available),
      imageUrl:    data.imageUrl.trim(),
      createdAt:   serverTimestamp(),
    });
  }, []);

  const updateProduct = useCallback(async (id, data) => {
    await updateDoc(doc(db, "products", id), {
      name:        data.name.trim(),
      category:    data.category,
      description: data.description.trim(),
      price:       Number(data.price),
      featured:    Boolean(data.featured),
      available:   Boolean(data.available),
      imageUrl:    data.imageUrl.trim(),
    });
  }, []);

  const deleteProduct = useCallback(async (id) => {
    await deleteDoc(doc(db, "products", id));
  }, []);

  return { products, loading, error, addProduct, updateProduct, deleteProduct };
}

/* ─────────────────────────────────────────────────
   CSS — injected once
───────────────────────────────────────────────── */
function ProductsStyles() {
  return (
    <style>{`
      @keyframes crmFadeUp {
        from { opacity: 0; transform: translateY(14px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      @keyframes crmFadeIn {
        from { opacity: 0; }
        to   { opacity: 1; }
      }
      @keyframes crmScaleIn {
        from { opacity: 0; transform: scale(0.96) translateY(8px); }
        to   { opacity: 1; transform: scale(1) translateY(0); }
      }
      @keyframes crmShimmer {
        0%   { background-position: -400px 0; }
        100% { background-position:  400px 0; }
      }

      /* Page entrance */
      .crm-page { animation: crmFadeUp 0.35s ease both; }

      /* Overlay */
      .crm-overlay {
        position: fixed; inset: 0;
        background: rgba(20,8,2,0.52);
        backdrop-filter: blur(3px);
        z-index: 400;
        animation: crmFadeIn 0.2s ease;
        display: flex; align-items: center; justify-content: center;
        padding: 16px;
      }

      /* Modal panel */
      .crm-modal {
        background: ${C.cream};
        border-radius: 10px;
        width: 100%; max-width: 560px;
        max-height: 90vh;
        display: flex; flex-direction: column;
        box-shadow: 0 24px 80px rgba(20,8,2,0.35);
        animation: crmScaleIn 0.25s cubic-bezier(0.16,1,0.3,1);
        overflow: hidden;
      }
      .crm-modal-header {
        padding: 22px 24px 18px;
        border-bottom: 1px solid ${C.line};
        display: flex; align-items: center; justify-content: space-between;
        flex-shrink: 0;
      }
      .crm-modal-body {
        overflow-y: auto; padding: 24px;
        flex: 1;
      }
      .crm-modal-body::-webkit-scrollbar { width: 4px; }
      .crm-modal-body::-webkit-scrollbar-thumb { background: ${C.parchment}; border-radius: 2px; }
      .crm-modal-footer {
        padding: 16px 24px;
        border-top: 1px solid ${C.line};
        display: flex; gap: 10px; justify-content: flex-end;
        flex-shrink: 0;
        background: ${C.creamDeep};
      }

      /* Form fields */
      .crm-label {
        display: block;
        font-family: ${FONT_BODY};
        font-size: 11px; font-weight: 600;
        letter-spacing: 0.07em; text-transform: uppercase;
        color: ${C.chocolate};
        margin-bottom: 6px;
      }
      .crm-input {
        width: 100%; padding: 10px 13px;
        font-family: ${FONT_BODY}; font-size: 14px;
        color: ${C.espresso};
        background: #fff;
        border: 1px solid ${C.lineStrong};
        border-radius: 6px; outline: none;
        transition: border-color 0.18s, box-shadow 0.18s;
        box-sizing: border-box;
      }
      .crm-input:focus {
        border-color: ${C.gold};
        box-shadow: 0 0 0 3px rgba(201,168,76,0.12);
      }
      .crm-input.error { border-color: ${C.red}; }
      .crm-textarea { resize: vertical; min-height: 80px; }
      .crm-select {
        appearance: none;
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%237A6558' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
        background-repeat: no-repeat;
        background-position: right 12px center;
        padding-right: 36px;
        cursor: pointer;
      }
      .crm-field { margin-bottom: 18px; }
      .crm-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
      @media (max-width: 480px) { .crm-row { grid-template-columns: 1fr; } }
      .crm-error-msg {
        font-family: ${FONT_BODY}; font-size: 11px; color: ${C.red};
        margin-top: 4px;
      }

      /* Toggle switch */
      .crm-toggle-row {
        display: flex; align-items: center; justify-content: space-between;
        padding: 12px 14px;
        background: #fff;
        border: 1px solid ${C.lineStrong};
        border-radius: 6px;
        cursor: pointer;
        user-select: none;
      }
      .crm-toggle-row:hover { background: ${C.creamDeep}; }
      .crm-toggle {
        width: 38px; height: 22px;
        border-radius: 11px;
        background: ${C.parchment};
        position: relative;
        transition: background 0.2s;
        flex-shrink: 0;
      }
      .crm-toggle.on { background: ${C.gold}; }
      .crm-toggle::after {
        content: '';
        position: absolute;
        top: 3px; left: 3px;
        width: 16px; height: 16px;
        border-radius: 50%;
        background: #fff;
        box-shadow: 0 1px 4px rgba(0,0,0,0.2);
        transition: transform 0.2s cubic-bezier(0.4,0,0.2,1);
      }
      .crm-toggle.on::after { transform: translateX(16px); }

      /* Buttons */
      .crm-btn {
        display: inline-flex; align-items: center; gap: 6px;
        padding: 9px 18px;
        font-family: ${FONT_BODY}; font-size: 12px; font-weight: 600;
        letter-spacing: 0.07em; text-transform: uppercase;
        border: none; border-radius: 6px; cursor: pointer;
        transition: background 0.18s, transform 0.12s, opacity 0.18s;
        white-space: nowrap;
      }
      .crm-btn:active { transform: scale(0.97); }
      .crm-btn:disabled { opacity: 0.55; cursor: not-allowed; }
      .crm-btn-primary {
        background: ${C.espresso}; color: ${C.cream};
      }
      .crm-btn-primary:hover:not(:disabled) { background: #1a0b04; }
      .crm-btn-ghost {
        background: transparent; color: ${C.mist};
        border: 1px solid ${C.lineStrong};
      }
      .crm-btn-ghost:hover { background: ${C.creamDeep}; color: ${C.chocolate}; }
      .crm-btn-danger {
        background: ${C.red}; color: #fff;
      }
      .crm-btn-danger:hover:not(:disabled) { background: #b91c1c; }
      .crm-btn-gold {
        background: ${C.gold}; color: ${C.espresso};
      }
      .crm-btn-gold:hover:not(:disabled) { background: ${C.goldLight}; }

      /* Icon button */
      .crm-icon-btn {
        width: 32px; height: 32px;
        border: none; border-radius: 6px; cursor: pointer;
        display: flex; align-items: center; justify-content: center;
        transition: background 0.18s, color 0.18s;
        background: transparent;
        flex-shrink: 0;
      }
      .crm-icon-btn.edit { color: ${C.mist}; }
      .crm-icon-btn.edit:hover { background: rgba(201,168,76,0.12); color: ${C.chocolate}; }
      .crm-icon-btn.del  { color: ${C.mist}; }
      .crm-icon-btn.del:hover  { background: ${C.redBg}; color: ${C.red}; }

      /* Toolbar */
      .crm-toolbar {
        display: flex; gap: 10px; flex-wrap: wrap;
        align-items: center; margin-bottom: 22px;
      }
      .crm-search-wrap {
        position: relative; flex: 1 1 220px; min-width: 0;
      }
      .crm-search-icon {
        position: absolute; left: 11px; top: 50%;
        transform: translateY(-50%); pointer-events: none;
        color: ${C.mist};
      }
      .crm-search {
        width: 100%; padding: 9px 34px 9px 34px;
        font-family: ${FONT_BODY}; font-size: 13px;
        color: ${C.espresso}; background: #fff;
        border: 1px solid ${C.lineStrong}; border-radius: 6px;
        outline: none; box-sizing: border-box;
        transition: border-color 0.18s, box-shadow 0.18s;
      }
      .crm-search:focus {
        border-color: ${C.gold};
        box-shadow: 0 0 0 3px rgba(201,168,76,0.10);
      }
      .crm-search-clear {
        position: absolute; right: 8px; top: 50%;
        transform: translateY(-50%);
        background: none; border: none; cursor: pointer;
        color: ${C.mist}; padding: 3px; border-radius: 4px;
        display: flex; align-items: center;
      }
      .crm-search-clear:hover { color: ${C.espresso}; background: ${C.parchment}; }
      .crm-filter-select {
        padding: 9px 36px 9px 12px; flex-shrink: 0;
        font-family: ${FONT_BODY}; font-size: 13px;
        color: ${C.espresso}; background: #fff;
        border: 1px solid ${C.lineStrong}; border-radius: 6px;
        outline: none; cursor: pointer;
        appearance: none;
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='11' height='11' viewBox='0 0 24 24' fill='none' stroke='%237A6558' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
        background-repeat: no-repeat;
        background-position: right 11px center;
        transition: border-color 0.18s;
      }
      .crm-filter-select:focus { border-color: ${C.gold}; outline: none; }

      /* Badge */
      .crm-badge {
        display: inline-flex; align-items: center; gap: 4px;
        padding: 3px 8px; border-radius: 20px;
        font-family: ${FONT_BODY}; font-size: 10px; font-weight: 600;
        letter-spacing: 0.06em; text-transform: uppercase;
        white-space: nowrap;
      }
      .crm-badge.yes { background: ${C.greenBg}; color: ${C.green}; }
      .crm-badge.no  { background: ${C.parchment}; color: ${C.mist}; }
      .crm-badge.featured { background: rgba(201,168,76,0.15); color: #92700a; }

      /* Table */
      .crm-table-wrap {
        background: #fff;
        border: 1px solid ${C.line};
        border-radius: 10px;
        overflow: hidden;
        box-shadow: 0 2px 12px rgba(46,26,14,0.05);
      }
      .crm-table {
        width: 100%; border-collapse: collapse;
        font-family: ${FONT_BODY};
      }
      .crm-table thead tr {
        background: ${C.creamDeep};
        border-bottom: 1px solid ${C.line};
      }
      .crm-table th {
        padding: 11px 14px;
        font-size: 10px; font-weight: 700;
        letter-spacing: 0.1em; text-transform: uppercase;
        color: ${C.mist}; text-align: left; white-space: nowrap;
      }
      .crm-table td {
        padding: 13px 14px;
        font-size: 13px; color: ${C.espresso};
        vertical-align: middle;
        border-bottom: 1px solid ${C.line};
      }
      .crm-table tbody tr:last-child td { border-bottom: none; }
      .crm-table tbody tr {
        transition: background 0.14s;
        animation: crmFadeUp 0.3s ease both;
      }
      .crm-table tbody tr:hover { background: ${C.creamDeep}; }
      .crm-table .product-thumb {
        width: 40px; height: 40px;
        border-radius: 6px; object-fit: cover;
        border: 1px solid ${C.line};
        flex-shrink: 0;
      }
      .crm-table .product-thumb-placeholder {
        width: 40px; height: 40px;
        border-radius: 6px;
        background: ${C.creamDeep};
        border: 1px solid ${C.line};
        display: flex; align-items: center; justify-content: center;
        flex-shrink: 0; color: ${C.parchment};
      }
      .crm-name-cell {
        display: flex; align-items: center; gap: 10px;
      }
      .crm-name-text {
        font-weight: 500; color: ${C.espresso};
        white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        max-width: 160px;
      }
      .crm-actions-cell {
        display: flex; gap: 4px; align-items: center;
      }

      /* Mobile cards */
      .crm-cards { display: flex; flex-direction: column; gap: 12px; }
      .crm-card {
        background: #fff;
        border: 1px solid ${C.line};
        border-radius: 10px;
        padding: 14px;
        display: flex; gap: 12px; align-items: flex-start;
        box-shadow: 0 1px 6px rgba(46,26,14,0.05);
        animation: crmFadeUp 0.3s ease both;
        transition: box-shadow 0.18s;
      }
      .crm-card:hover { box-shadow: 0 4px 16px rgba(46,26,14,0.09); }
      .crm-card-thumb {
        width: 56px; height: 56px;
        border-radius: 8px; object-fit: cover;
        border: 1px solid ${C.line}; flex-shrink: 0;
      }
      .crm-card-thumb-placeholder {
        width: 56px; height: 56px;
        border-radius: 8px; background: ${C.creamDeep};
        border: 1px solid ${C.line};
        display: flex; align-items: center; justify-content: center;
        flex-shrink: 0; color: ${C.parchment};
      }
      .crm-card-body { flex: 1; min-width: 0; }
      .crm-card-name {
        font-family: ${FONT_DISPLAY}; font-size: 17px; font-weight: 400;
        color: ${C.espresso}; margin-bottom: 2px;
        white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
      }
      .crm-card-cat {
        font-size: 11px; color: ${C.mist}; margin-bottom: 8px;
        white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
      }
      .crm-card-meta {
        display: flex; flex-wrap: wrap; gap: 6px; align-items: center;
      }
      .crm-card-price {
        font-family: ${FONT_DISPLAY}; font-size: 16px;
        color: ${C.chocolate}; font-weight: 500;
      }
      .crm-card-actions {
        display: flex; gap: 4px; flex-direction: column; flex-shrink: 0;
      }

      /* Shimmer skeleton */
      .crm-skeleton {
        background: linear-gradient(90deg, ${C.creamDeep} 25%, ${C.parchment} 50%, ${C.creamDeep} 75%);
        background-size: 400px 100%;
        animation: crmShimmer 1.5s infinite;
        border-radius: 4px;
      }

      /* Empty state */
      .crm-empty {
        text-align: center; padding: 72px 24px;
        animation: crmFadeIn 0.4s ease;
      }

      /* Image preview in modal */
      .crm-img-preview {
        width: 100%; height: 140px;
        object-fit: cover; border-radius: 6px;
        border: 1px solid ${C.line};
        margin-top: 8px;
        animation: crmFadeIn 0.3s ease;
      }
      .crm-img-preview-placeholder {
        width: 100%; height: 140px;
        background: ${C.creamDeep};
        border: 1px dashed ${C.lineStrong};
        border-radius: 6px;
        display: flex; flex-direction: column;
        align-items: center; justify-content: center;
        gap: 8px; margin-top: 8px; color: ${C.parchment};
      }

      /* Delete dialog */
      .crm-dialog {
        background: ${C.cream};
        border-radius: 10px;
        width: 100%; max-width: 400px;
        padding: 28px 24px 22px;
        box-shadow: 0 24px 80px rgba(20,8,2,0.35);
        animation: crmScaleIn 0.22s cubic-bezier(0.16,1,0.3,1);
      }

      /* Count chip */
      .crm-count {
        display: inline-flex; align-items: center;
        padding: 2px 9px; border-radius: 20px;
        font-family: ${FONT_BODY}; font-size: 11px; font-weight: 600;
        background: ${C.espresso}; color: ${C.goldLight};
        letter-spacing: 0.04em; flex-shrink: 0;
      }

      /* Reduced motion */
      @media (prefers-reduced-motion: reduce) {
        .crm-page, .crm-table tbody tr, .crm-card,
        .crm-overlay, .crm-modal, .crm-dialog,
        .crm-empty { animation: none !important; }
        .crm-skeleton { animation: none !important; background: ${C.creamDeep}; }
      }
    `}</style>
  );
}

/* ─────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────── */
const fmt = (n) => `Rs. ${Number(n).toLocaleString()}`;

function Thumb({ url, size = 40, radius = 6 }) {
  const [err, setErr] = useState(false);
  const placeholder = (
    <div
      className={size > 40 ? "crm-card-thumb-placeholder" : "crm-table .product-thumb-placeholder"}
      style={{
        width: size, height: size, borderRadius: radius,
        background: C.creamDeep, border: `1px solid ${C.line}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        color: C.parchment, flexShrink: 0,
      }}
    >
      <ImageOff size={size > 40 ? 20 : 14} />
    </div>
  );
  if (err || !url) return placeholder;
  return (
    <img
      src={url} alt=""
      onError={() => setErr(true)}
      style={{
        width: size, height: size, borderRadius: radius,
        objectFit: "cover", border: `1px solid ${C.line}`,
        flexShrink: 0, display: "block",
      }}
    />
  );
}

function Badge({ value, variant }) {
  if (variant === "featured") {
    return value
      ? <span className="crm-badge featured">★ Featured</span>
      : null;
  }
  return (
    <span className={`crm-badge ${value ? "yes" : "no"}`}>
      {value ? <Check size={9} /> : null}
      {value ? "Yes" : "No"}
    </span>
  );
}

function Toggle({ checked, onChange, label }) {
  return (
    <label className="crm-toggle-row" onClick={() => onChange(!checked)}>
      <span style={{ fontFamily: FONT_BODY, fontSize: 13, color: C.espresso }}>{label}</span>
      <div className={`crm-toggle ${checked ? "on" : ""}`} />
    </label>
  );
}

/* ─────────────────────────────────────────────────
   FORM VALIDATION
───────────────────────────────────────────────── */
function validate(form) {
  const errors = {};
  if (!form.name.trim())         errors.name     = "Product name is required.";
  if (!form.category)            errors.category = "Please select a category.";
  if (!form.price || isNaN(form.price) || Number(form.price) <= 0)
                                 errors.price    = "Enter a valid price.";
  return errors;
}

/* ─────────────────────────────────────────────────
   PRODUCT MODAL  (Add / Edit)
───────────────────────────────────────────────── */
function ProductModal({ mode, initial, onSave, onClose }) {
  const [form,   setForm]   = useState(initial ?? EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const firstRef            = useRef(null);

  useEffect(() => { firstRef.current?.focus(); }, []);

  /* Close on Escape */
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const set = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async () => {
    const errs = validate(form);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSaving(true);
    try {
      await onSave(form);
      onClose();
    } catch (err) {
      console.error("Save failed:", err);
      setErrors({ _global: "Failed to save. Please try again." });
      setSaving(false);
    }
  };

  const isEdit = mode === "edit";

  return (
    <div className="crm-overlay" role="dialog" aria-modal="true" aria-label={isEdit ? "Edit product" : "Add product"}>
      <div className="crm-modal" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="crm-modal-header">
          <div>
            <h2 style={{ fontFamily: FONT_DISPLAY, fontSize: 22, fontWeight: 400, color: C.espresso, margin: 0 }}>
              {isEdit ? "Edit Product" : "Add Product"}
            </h2>
            <p style={{ fontFamily: FONT_BODY, fontSize: 12, color: C.mist, marginTop: 2 }}>
              {isEdit ? "Update the product details below." : "Fill in the details to add a new product."}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{ background: C.parchment, border: "none", borderRadius: "50%", width: 32, height: 32, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
            aria-label="Close"
          >
            <X size={14} color={C.espresso} />
          </button>
        </div>

        {/* Body */}
        <div className="crm-modal-body">

          {/* Name */}
          <div className="crm-field">
            <label className="crm-label">Product Name *</label>
            <input
              ref={firstRef}
              className={`crm-input ${errors.name ? "error" : ""}`}
              placeholder="e.g. Red Velvet Cake"
              value={form.name}
              onChange={set("name")}
              onFocus={() => setErrors((e) => ({ ...e, name: undefined }))}
            />
            {errors.name && <p className="crm-error-msg">{errors.name}</p>}
          </div>

          {/* Category + Price */}
          <div className="crm-row">
            <div className="crm-field" style={{ marginBottom: 0 }}>
              <label className="crm-label">Category *</label>
              <select
                className={`crm-input crm-select ${errors.category ? "error" : ""}`}
                value={form.category}
                onChange={set("category")}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              {errors.category && <p className="crm-error-msg">{errors.category}</p>}
            </div>
            <div className="crm-field" style={{ marginBottom: 0 }}>
              <label className="crm-label">Price (Rs.) *</label>
              <input
                className={`crm-input ${errors.price ? "error" : ""}`}
                type="number" min="0" step="1"
                placeholder="e.g. 1200"
                value={form.price}
                onChange={set("price")}
                onFocus={() => setErrors((e) => ({ ...e, price: undefined }))}
              />
              {errors.price && <p className="crm-error-msg">{errors.price}</p>}
            </div>
          </div>

          {/* Description */}
          <div className="crm-field" style={{ marginTop: 18 }}>
            <label className="crm-label">Description</label>
            <textarea
              className="crm-input crm-textarea"
              placeholder="Brief description of the product…"
              value={form.description}
              onChange={set("description")}
            />
          </div>

          {/* Image URL */}
          <div className="crm-field">
            <label className="crm-label">Image URL</label>
            <input
              className="crm-input"
              placeholder="https://… (Cloudinary upload coming in Phase 3)"
              value={form.imageUrl}
              onChange={set("imageUrl")}
            />
            {form.imageUrl ? (
              <img
                src={form.imageUrl}
                alt="Preview"
                className="crm-img-preview"
                onError={(e) => { e.currentTarget.style.display = "none"; }}
              />
            ) : (
              <div className="crm-img-preview-placeholder">
                <ImageOff size={22} />
                <span style={{ fontFamily: FONT_BODY, fontSize: 11, color: C.mist }}>
                  No image — paste a URL above to preview
                </span>
              </div>
            )}
          </div>

          {/* Toggles */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <Toggle
              label="Available for sale"
              checked={form.available}
              onChange={(v) => setForm((f) => ({ ...f, available: v }))}
            />
            <Toggle
              label="Featured on homepage"
              checked={form.featured}
              onChange={(v) => setForm((f) => ({ ...f, featured: v }))}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="crm-modal-footer">
          {errors._global && (
            <p style={{ fontFamily: FONT_BODY, fontSize: 11, color: C.red, flex: 1, margin: 0, alignSelf: "center" }}>
              {errors._global}
            </p>
          )}
          <button className="crm-btn crm-btn-ghost" onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button className="crm-btn crm-btn-primary" onClick={handleSubmit} disabled={saving}>
            {saving
              ? "Saving…"
              : isEdit ? <><Check size={13} /> Save Changes</> : <><Plus size={13} /> Add Product</>
            }
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────
   DELETE DIALOG
───────────────────────────────────────────────── */
function DeleteDialog({ product, onConfirm, onClose }) {
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const [delError, setDelError] = useState(null);

  const handleConfirm = async () => {
    setBusy(true);
    setDelError(null);
    try {
      await onConfirm(product.id);
      onClose();
    } catch (err) {
      console.error("Delete failed:", err);
      setDelError("Delete failed. Please try again.");
      setBusy(false);
    }
  };

  return (
    <div className="crm-overlay" role="alertdialog" aria-modal="true">
      <div className="crm-dialog" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", gap: 14, marginBottom: 18, alignItems: "flex-start" }}>
          <div style={{
            width: 40, height: 40, borderRadius: "50%",
            background: C.redBg, border: `1px solid ${C.redLine}`,
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>
            <AlertTriangle size={18} color={C.red} />
          </div>
          <div>
            <h3 style={{ fontFamily: FONT_DISPLAY, fontSize: 20, fontWeight: 400, color: C.espresso, margin: "0 0 6px" }}>
              Delete product?
            </h3>
            <p style={{ fontFamily: FONT_BODY, fontSize: 13, color: C.mist, lineHeight: 1.6 }}>
              <strong style={{ color: C.chocolate }}>{product.name}</strong> will be permanently removed.
              This action cannot be undone.
            </p>
          </div>
        </div>
        {delError && (
          <p style={{ fontFamily: FONT_BODY, fontSize: 11, color: C.red, margin: "0 0 12px" }}>
            {delError}
          </p>
        )}
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button className="crm-btn crm-btn-ghost" onClick={onClose} disabled={busy}>
            Cancel
          </button>
          <button className="crm-btn crm-btn-danger" onClick={handleConfirm} disabled={busy}>
            <Trash2 size={13} /> {busy ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────
   TOOLBAR
───────────────────────────────────────────────── */
function Toolbar({ query, setQuery, category, setCategory, onAdd, total, filtered }) {
  return (
    <div className="crm-toolbar">
      {/* Search */}
      <div className="crm-search-wrap">
        <Search size={14} className="crm-search-icon" style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: C.mist, pointerEvents: "none" }} />
        <input
          className="crm-search"
          placeholder="Search products…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {query && (
          <button className="crm-search-clear" onClick={() => setQuery("")} aria-label="Clear search">
            <X size={13} />
          </button>
        )}
      </div>

      {/* Category filter */}
      <select
        className="crm-filter-select"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        style={{ minWidth: 0 }}
      >
        <option value="">All categories</option>
        {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
      </select>

      {/* Count */}
      <span className="crm-count">
        {filtered} / {total}
      </span>

      {/* Add */}
      <button className="crm-btn crm-btn-gold" onClick={onAdd}>
        <Plus size={14} /> Add Product
      </button>
    </div>
  );
}

/* ─────────────────────────────────────────────────
   LOADING STATE
───────────────────────────────────────────────── */
function LoadingState() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} style={{
          background: "#fff", borderRadius: 10, padding: "14px 16px",
          border: `1px solid ${C.line}`,
          display: "flex", gap: 12, alignItems: "center",
          opacity: 1 - i * 0.12,
          animationDelay: `${i * 0.06}s`,
        }}>
          <div className="crm-skeleton" style={{ width: 40, height: 40, borderRadius: 6, flexShrink: 0 }} />
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 7 }}>
            <div className="crm-skeleton" style={{ height: 13, width: `${55 + (i % 3) * 15}%` }} />
            <div className="crm-skeleton" style={{ height: 10, width: `${30 + (i % 4) * 10}%` }} />
          </div>
          <div className="crm-skeleton" style={{ height: 13, width: 60, borderRadius: 4 }} />
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────
   EMPTY STATE
───────────────────────────────────────────────── */
function EmptyState({ hasFilters, onAdd, onClear }) {
  return (
    <div className="crm-empty">
      <div style={{
        width: 64, height: 64, borderRadius: "50%",
        background: C.creamDeep, border: `1px solid ${C.line}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        margin: "0 auto 18px",
      }}>
        <Package size={26} color={C.parchment} />
      </div>
      {hasFilters ? (
        <>
          <p style={{ fontFamily: FONT_DISPLAY, fontSize: 22, fontWeight: 300, color: C.espresso, marginBottom: 6 }}>
            No products found
          </p>
          <p style={{ fontFamily: FONT_BODY, fontSize: 13, color: C.mist, marginBottom: 18 }}>
            Try adjusting your search or category filter.
          </p>
          <button className="crm-btn crm-btn-ghost" onClick={onClear}>
            Clear filters
          </button>
        </>
      ) : (
        <>
          <p style={{ fontFamily: FONT_DISPLAY, fontSize: 22, fontWeight: 300, color: C.espresso, marginBottom: 6 }}>
            No products yet
          </p>
          <p style={{ fontFamily: FONT_BODY, fontSize: 13, color: C.mist, marginBottom: 18 }}>
            Add your first product to get started.
          </p>
          <button className="crm-btn crm-btn-gold" onClick={onAdd}>
            <Plus size={13} /> Add Product
          </button>
        </>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────
   DESKTOP TABLE
───────────────────────────────────────────────── */
const ProductTable = memo(function ProductTable({ products, onEdit, onDelete }) {
  return (
    <div className="crm-table-wrap">
      <table className="crm-table">
        <thead>
          <tr>
            <th>Product</th>
            <th>Category</th>
            <th>Price</th>
            <th>Available</th>
            <th>Featured</th>
            <th>Added</th>
            <th style={{ textAlign: "right" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p, i) => (
            <tr key={p.id} style={{ animationDelay: `${i * 0.04}s` }}>
              <td>
                <div className="crm-name-cell">
                  <Thumb url={p.imageUrl} size={40} radius={6} />
                  <div>
                    <div className="crm-name-text" title={p.name}>{p.name}</div>
                    {p.description && (
                      <div style={{ fontSize: 11, color: C.mist, marginTop: 1, maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {p.description}
                      </div>
                    )}
                  </div>
                </div>
              </td>
              <td style={{ fontSize: 12, color: C.mist, whiteSpace: "nowrap" }}>{p.category}</td>
              <td style={{ fontFamily: FONT_DISPLAY, fontSize: 15, color: C.chocolate, whiteSpace: "nowrap" }}>
                {fmt(p.price)}
              </td>
              <td><Badge value={p.available} /></td>
              <td>{p.featured ? <Badge value={true} variant="featured" /> : <span style={{ color: C.parchment, fontSize: 13 }}>—</span>}</td>
              <td style={{ fontSize: 11, color: C.mist, whiteSpace: "nowrap" }}>{p.createdAt}</td>
              <td>
                <div className="crm-actions-cell" style={{ justifyContent: "flex-end" }}>
                  <button
                    className="crm-icon-btn edit"
                    onClick={() => onEdit(p)}
                    aria-label={`Edit ${p.name}`}
                    title="Edit"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    className="crm-icon-btn del"
                    onClick={() => onDelete(p)}
                    aria-label={`Delete ${p.name}`}
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
});

/* ─────────────────────────────────────────────────
   MOBILE CARDS
───────────────────────────────────────────────── */
const ProductCards = memo(function ProductCards({ products, onEdit, onDelete }) {
  return (
    <div className="crm-cards">
      {products.map((p, i) => (
        <div key={p.id} className="crm-card" style={{ animationDelay: `${i * 0.05}s` }}>
          <Thumb url={p.imageUrl} size={56} radius={8} />
          <div className="crm-card-body">
            <div className="crm-card-name">{p.name}</div>
            <div className="crm-card-cat">{p.category}</div>
            <div className="crm-card-meta">
              <span className="crm-card-price">{fmt(p.price)}</span>
              <Badge value={p.available} />
              {p.featured && <Badge value={true} variant="featured" />}
            </div>
          </div>
          <div className="crm-card-actions">
            <button
              className="crm-icon-btn edit"
              onClick={() => onEdit(p)}
              aria-label={`Edit ${p.name}`}
              title="Edit"
            >
              <Pencil size={15} />
            </button>
            <button
              className="crm-icon-btn del"
              onClick={() => onDelete(p)}
              aria-label={`Delete ${p.name}`}
              title="Delete"
            >
              <Trash2 size={15} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
});

/* ─────────────────────────────────────────────────
   RESPONSIVE WRAPPER — table on desktop, cards on mobile
───────────────────────────────────────────────── */
function ProductList({ products, onEdit, onDelete, loading, hasFilters, onAdd, onClear }) {
  const [isDesktop, setIsDesktop] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth >= 768 : true
  );

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const update = (e) => setIsDesktop(e.matches);
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  if (loading) return <LoadingState />;

  if (products.length === 0) {
    return <EmptyState hasFilters={hasFilters} onAdd={onAdd} onClear={onClear} />;
  }

  return isDesktop
    ? <ProductTable products={products} onEdit={onEdit} onDelete={onDelete} />
    : <ProductCards products={products} onEdit={onEdit} onDelete={onDelete} />;
}

/* ═══════════════════════════════════════════════
   PRODUCTS PAGE  (default export)
════════════════════════════════════════════════ */
export default function Products() {
  /* Data layer */
  const { products, loading, error, addProduct, updateProduct, deleteProduct } = useProducts();

  /* UI state */
  const [query,    setQuery]    = useState("");
  const [category, setCategory] = useState("");
  const [modal,    setModal]    = useState(null); // null | { mode: "add" | "edit", product?: {} }
  const [toDelete, setToDelete] = useState(null); // product | null

  /* Derived list */
  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((p) => {
      const matchQ   = !q || p.name.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q);
      const matchCat = !category || p.category === category;
      return matchQ && matchCat;
    });
  }, [products, query, category]);

  const hasFilters = Boolean(query || category);

  /* Handlers */
  const openAdd  = useCallback(() => setModal({ mode: "add" }), []);
  const openEdit = useCallback((p) => setModal({ mode: "edit", product: p }), []);
  const clearFilters = useCallback(() => { setQuery(""); setCategory(""); }, []);

  const handleSave = useCallback((form) => {
    if (modal?.mode === "edit") {
      return updateProduct(modal.product.id, form);
    } else {
      return addProduct(form);
    }
  }, [modal, addProduct, updateProduct]);

  const handleDelete = useCallback((id) => {
    return deleteProduct(id);
  }, [deleteProduct]);

  return (
    <>
      <ProductsStyles />

      <div className="crm-page">
        {/* Page heading */}
        <div style={{ marginBottom: 24 }}>
          <h1 style={{
            fontFamily: FONT_DISPLAY, fontSize: 32, fontWeight: 400,
            color: C.espresso, margin: 0, lineHeight: 1.1,
          }}>
            Products
          </h1>
          <div style={{ width: 48, height: 1.5, background: C.gold, marginTop: 10 }} />
        </div>

        {/* Firestore error banner */}
        {error && (
          <div style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "11px 16px", borderRadius: 8, marginBottom: 20,
            background: C.redBg, border: `1px solid ${C.redLine}`,
            fontFamily: FONT_BODY, fontSize: 13, color: C.red,
          }}>
            <AlertTriangle size={15} style={{ flexShrink: 0 }} />
            {error}
          </div>
        )}

        {/* Toolbar */}
        <Toolbar
          query={query}       setQuery={setQuery}
          category={category} setCategory={setCategory}
          onAdd={openAdd}
          total={products.length}
          filtered={visible.length}
        />

        {/* List (table or cards) */}
        <ProductList
          products={visible}
          loading={loading}
          hasFilters={hasFilters}
          onAdd={openAdd}
          onClear={clearFilters}
          onEdit={openEdit}
          onDelete={(p) => setToDelete(p)}
        />
      </div>

      {/* Add / Edit modal */}
      {modal && (
        <ProductModal
          mode={modal.mode}
          initial={modal.product ?? EMPTY_FORM}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}

      {/* Delete confirmation */}
      {toDelete && (
        <DeleteDialog
          product={toDelete}
          onConfirm={handleDelete}
          onClose={() => setToDelete(null)}
        />
      )}
    </>
  );
}
