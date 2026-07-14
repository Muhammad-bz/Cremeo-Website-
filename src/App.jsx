import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useMotionValue,
  useMotionValueEvent,
  animate,
} from "framer-motion";
import {
  ShoppingBag,
  X,
  Star,
  Plus,
  Minus,
  Menu,
  MapPin,
  Phone,
  Mail,
  Clock,
  ChevronDown,
  Heart,
  ArrowRight,
  Instagram,
  Facebook,
  Twitter,
  Check,
  Leaf,
  Award,
  Users,
} from "lucide-react";

/* ═══════════════════════════════════════════════
   DESIGN TOKENS
═══════════════════════════════════════════════ */
const C = {
  cream:     "#FAF6EF",
  creamDeep: "#F0E9DC",
  parchment: "#E8DDD0",
  caramel:   "#C8956B",
  chocolate: "#5C3317",
  espresso:  "#2E1A0E",
  gold:      "#C9A84C",
  goldLight: "#E2C97E",
  mist:      "#7A6558",
  line:      "rgba(92,51,23,0.12)",
};

const FONT_DISPLAY = "'Cormorant Garamond', 'Georgia', serif";
const FONT_BODY    = "'DM Sans', system-ui, sans-serif";

/* ═══════════════════════════════════════════════
   GLOBAL STYLES
   NOTE: Google Fonts are loaded via <link> in index.html
   for correct preconnect / render-blocking behaviour.
═══════════════════════════════════════════════ */
function GlobalStyles() {
  return (
    <style>{`
      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
      html { scroll-behavior: smooth; }
      body {
        background: ${C.cream};
        color: ${C.espresso};
        font-family: ${FONT_BODY};
        overflow-x: hidden;
        /* Prevent horizontal scroll without hiding vertical */
        max-width: 100%;
      }

      @keyframes fadeUp      { from { opacity: 0; transform: translateY(32px); } to { opacity: 1; transform: translateY(0); } }
      @keyframes fadeIn      { from { opacity: 0; } to { opacity: 1; } }
      @keyframes shimmer     { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
      @keyframes float       { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
      @keyframes cartBounce  { 0%,100% { transform: scale(1); } 40% { transform: scale(1.25); } 70% { transform: scale(0.9); } }
      @keyframes slideInRight { from { transform: translateX(100%); } to { transform: translateX(0); } }

      /* Reveal utility */
      .reveal { opacity: 0; transform: translateY(24px); transition: opacity 0.65s ease, transform 0.65s ease; }
      .reveal.visible { opacity: 1; transform: translateY(0); }

      /* Hover card lift — disabled on touch devices */
      .card-lift { transition: transform 0.35s cubic-bezier(0.16,1,0.3,1), box-shadow 0.35s ease; }
      @media (hover: hover) {
        .card-lift:hover { transform: translateY(-5px); box-shadow: 0 16px 40px rgba(46,26,14,0.13); }
      }

      /* Gold underline on nav links */
      .nav-link { position: relative; text-decoration: none; transition: color 0.25s; }
      .nav-link::after {
        content: '';
        position: absolute;
        bottom: -3px; left: 0;
        width: 0; height: 1.5px;
        background: ${C.gold};
        transition: width 0.3s ease;
      }
      .nav-link:hover::after { width: 100%; }
      .nav-link:hover { color: ${C.caramel} !important; }

      /* Buttons */
      .btn-primary {
        display: inline-flex; align-items: center; justify-content: center; gap: 8px;
        padding: 14px 28px;
        background: ${C.chocolate}; color: ${C.cream};
        font-family: ${FONT_BODY}; font-size: 12px; font-weight: 600;
        letter-spacing: 0.1em; text-transform: uppercase;
        border: none; border-radius: 3px; cursor: pointer;
        transition: background 0.25s, transform 0.2s;
        text-decoration: none; white-space: nowrap;
      }
      .btn-primary:hover { background: ${C.espresso}; transform: translateY(-1px); }
      .btn-primary:active { transform: translateY(0); }

      .btn-gold {
        display: inline-flex; align-items: center; justify-content: center; gap: 8px;
        padding: 14px 28px;
        background: ${C.gold}; color: ${C.espresso};
        font-family: ${FONT_BODY}; font-size: 12px; font-weight: 700;
        letter-spacing: 0.1em; text-transform: uppercase;
        border: none; border-radius: 3px; cursor: pointer;
        transition: all 0.25s; white-space: nowrap;
      }
      .btn-gold:hover { background: ${C.goldLight}; transform: translateY(-1px); }

      .cart-bounce { animation: cartBounce 0.45s ease; }

      .img-placeholder {
        background: linear-gradient(90deg, ${C.creamDeep} 25%, ${C.parchment} 50%, ${C.creamDeep} 75%);
        background-size: 200% 100%;
        animation: shimmer 1.8s infinite;
      }

      /* Scrollbar */
      ::-webkit-scrollbar { width: 5px; }
      ::-webkit-scrollbar-track { background: ${C.creamDeep}; }
      ::-webkit-scrollbar-thumb { background: ${C.caramel}; border-radius: 3px; }

      .divider { width: 56px; height: 1.5px; background: ${C.gold}; margin: 0 auto 20px; }
      .divider.left { margin-left: 0; }

      input, textarea, select { font-family: ${FONT_BODY}; }

      /* ── Responsive helpers ── */
      @media (max-width: 768px)  { .hide-mobile  { display: none !important; } }
      @media (min-width: 769px)  { .hide-desktop { display: none !important; } }

      /* ── Product grids ── */
      .product-grid-featured { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
      .product-grid          { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }
      @media (max-width: 1100px) { .product-grid { grid-template-columns: repeat(2, 1fr); } }
      @media (max-width: 900px)  { .product-grid-featured { grid-template-columns: repeat(2, 1fr); } }
      @media (max-width: 640px)  {
        .product-grid-featured { grid-template-columns: 1fr; }
        .product-grid          { grid-template-columns: 1fr; }
      }

      /* ── About section ── */
      .about-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 64px; align-items: center; }
      @media (max-width: 860px) {
        .about-grid { grid-template-columns: 1fr; gap: 40px; }
        .about-image-col { order: -1; }
      }

      /* ── Contact section ── */
      .contact-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 64px; }
      @media (max-width: 860px) { .contact-grid { grid-template-columns: 1fr; gap: 48px; } }

      /* ── Footer ── */
      .footer-grid { display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 40px; margin-bottom: 40px; }
      @media (max-width: 760px) {
        .footer-grid { grid-template-columns: 1fr 1fr; }
        .footer-brand { grid-column: 1 / -1; }
      }
      @media (max-width: 480px) {
        .footer-grid { grid-template-columns: 1fr; }
        .footer-brand { grid-column: auto; }
      }

      /* ── Trust strip ── */
      .trust-grid { display: grid; grid-template-columns: repeat(4, 1fr); }
      @media (max-width: 700px) { .trust-grid { grid-template-columns: repeat(2, 1fr); } }

      /* ── Section padding ── */
      .section-pad { padding: 80px 5%; }
      @media (max-width: 640px) { .section-pad { padding: 56px 5%; } }

      /* ── Stats row ── */
      .stats-row { display: flex; gap: 36px; flex-wrap: wrap; }

      /* ── Cart drawer ── */
      .cart-drawer {
        position: fixed; top: 0; right: 0; bottom: 0;
        width: min(420px, 100vw);
        background: ${C.cream};
        z-index: 2001;
        display: flex; flex-direction: column;
        animation: slideInRight 0.35s cubic-bezier(0.16,1,0.3,1);
        box-shadow: -8px 0 40px rgba(46,26,14,0.15);
      }

      /* ── Reduce motion ── */
      @media (prefers-reduced-motion: reduce) {
        .reveal { transition: none; }
        * { animation-duration: 0.01ms !important; }
      }
    `}</style>
  );
}

/* ═══════════════════════════════════════════════
   SCROLL REVEAL HOOK
   Runs after every render to pick up newly-mounted .reveal elements.
   The inner cleanup is guarded so it never returns undefined.
═══════════════════════════════════════════════ */
function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll(".reveal:not(.visible)");
    // Nothing to observe — return a no-op cleanup to satisfy React
    if (!els.length) return undefined;

    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add("visible");
        }),
      { threshold: 0.1, rootMargin: "0px 0px -30px 0px" }
    );
    els.forEach((el) => io.observe(el));

    return () => io.disconnect();
  }); // intentionally no deps — re-runs after each render
}

/* ═══════════════════════════════════════════════
   IMAGES  (all external — no bundler import needed)
═══════════════════════════════════════════════ */
const IMG = {
  hero:       "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=1600&q=85&auto=format&fit=crop",
  about:      "https://images.unsplash.com/photo-1517433670267-08bbd4be890f?w=900&q=85&auto=format&fit=crop",
  aboutSmall: "https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=600&q=85&auto=format&fit=crop",
  cakes1:     "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&q=85&auto=format&fit=crop",
  cakes2:     "https://images.unsplash.com/photo-1535141192574-5d4897c12636?w=600&q=85&auto=format&fit=crop",
  cakes3:     "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=600&q=85&auto=format&fit=crop",
  cakes4:     "https://images.unsplash.com/photo-1621303837174-89787a7d4729?w=600&q=85&auto=format&fit=crop",
  breads1:    "https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=600&q=85&auto=format&fit=crop",
  breads2:    "https://images.unsplash.com/photo-1586444248902-2f64eddc13df?w=600&q=85&auto=format&fit=crop",
  breads3:    "https://images.unsplash.com/photo-1568254183919-78a4f43a2877?w=600&q=85&auto=format&fit=crop",
  breads4:    "https://images.unsplash.com/photo-1603046891744-1f21f27ae50a?w=600&q=85&auto=format&fit=crop",
  cookies1:   "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=600&q=85&auto=format&fit=crop",
  cookies2:   "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=600&q=85&auto=format&fit=crop",
  cookies3:   "https://images.unsplash.com/photo-1621188988909-fbef0a88dc04?w=600&q=85&auto=format&fit=crop",
  cookies4:   "https://images.unsplash.com/photo-1490323948715-7df91a28edab?w=600&q=85&auto=format&fit=crop",
  feat1:      "https://images.unsplash.com/photo-1559620192-032c4bc4674e?w=600&q=85&auto=format&fit=crop",
  feat2:      "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600&q=85&auto=format&fit=crop",
  feat3:      "https://images.unsplash.com/photo-1571115177098-24ec42ed204d?w=600&q=85&auto=format&fit=crop",
  rev1:       "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=85&auto=format&fit=crop&crop=face",
  rev2:       "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=85&auto=format&fit=crop&crop=face",
  rev3:       "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=85&auto=format&fit=crop&crop=face",
};

/* ═══════════════════════════════════════════════
   DATA
═══════════════════════════════════════════════ */
const FEATURED = [
  { id: 1, name: "Honey Almond Tart",   price: 850,  tag: "Bestseller",  img: IMG.feat1, desc: "Buttery pastry shell filled with silky almond cream and local wildflower honey." },
  { id: 2, name: "Classic Croissant",   price: 350,  tag: "Daily Fresh", img: IMG.feat2, desc: "Laminated with 81 layers of pure butter — golden, flaky, impossibly light." },
  { id: 3, name: "Cardamom Pound Cake", price: 1200, tag: "Chef's Pick", img: IMG.feat3, desc: "A warming blend of cardamom and vanilla in a dense, moist pound cake." },
];
const CAKES = [
  { id: 10, name: "Chocolate Truffle Cake", price: 2400, img: IMG.cakes1, desc: "Three layers of dark chocolate sponge with ganache and fresh raspberries." },
  { id: 11, name: "Vanilla Dream Cake",     price: 2100, img: IMG.cakes2, desc: "Delicate vanilla bean sponge with Swiss meringue buttercream." },
  { id: 12, name: "Strawberry Chantilly",   price: 2600, img: IMG.cakes3, desc: "Fresh strawberry compote layered with light chantilly cream." },
  { id: 13, name: "Red Velvet Celebration", price: 2800, img: IMG.cakes4, desc: "Classic red velvet with cream cheese frosting and gold leaf garnish." },
];
const BREADS = [
  { id: 20, name: "Sourdough Country Loaf", price: 650, img: IMG.breads1, desc: "Long-fermented with a crackling crust and open, chewy crumb." },
  { id: 21, name: "Rosemary Focaccia",      price: 550, img: IMG.breads2, desc: "Dimpled olive oil bread with sea salt and fresh rosemary." },
  { id: 22, name: "Multigrain Batard",      price: 700, img: IMG.breads3, desc: "Seeds and whole grains in a hearty oval loaf with nutty depth." },
  { id: 23, name: "Brioche Pullman",        price: 850, img: IMG.breads4, desc: "Pillowy, egg-enriched brioche baked in a Pullman tin for perfect slices." },
];
const COOKIES = [
  { id: 30, name: "Brown Butter Choc Chip", price: 180, img: IMG.cookies1, desc: "Browned butter, sea salt flakes, and dark chocolate chunks." },
  { id: 31, name: "Pistachio Crescent",     price: 160, img: IMG.cookies2, desc: "Delicate Austrian crescent cookies rolled in pistachio sugar." },
  { id: 32, name: "Saffron Shortbread",     price: 200, img: IMG.cookies3, desc: "Buttery shortbread infused with a pinch of premium saffron." },
  { id: 33, name: "Éclair au Chocolat",     price: 420, img: IMG.cookies4, desc: "Crisp choux pastry filled with pastry cream, glazed in dark chocolate." },
];
const REVIEWS = [
  { name: "Sana Malik",    img: IMG.rev1, stars: 5, role: "Food Blogger",     text: "Cremeo's sourdough has ruined every other bread for me. The crust shatters perfectly and the crumb is everything. I order twice a week now." },
  { name: "Ahmed Raza",    img: IMG.rev2, stars: 5, role: "Regular Customer", text: "Ordered a custom chocolate truffle cake for our anniversary. It was not just delicious — it was genuinely beautiful. The whole family was impressed." },
  { name: "Nadia Hussain", img: IMG.rev3, stars: 5, role: "Home Chef",        text: "The cardamom pound cake is my go-to for every gathering. People always ask where it's from. Cremeo never disappoints." },
];

const fmt = (n) => `Rs. ${n.toLocaleString()}`;

/* ═══════════════════════════════════════════════
   RESPONSIVE DOOR IMAGES HOOK
   FIX: Guards window access so it never throws in non-browser
   environments (e.g. Vite SSR, test runners).
═══════════════════════════════════════════════ */
function useDoorImages() {
  // Safe initializer — falls back to desktop if window is unavailable
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.innerWidth < 768;
  });

  useEffect(() => {
    // matchMedia is always available here (we are inside useEffect = browser)
    const mq = window.matchMedia("(max-width: 767px)");
    setIsMobile(mq.matches); // sync after hydration

    const handler = (e) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return {
    left:  isMobile ? "/mobile/Left-Door-Mobile.webp"  : "/desktop/Left-Door-Dekstop.webp",
    right: isMobile ? "/mobile/Right-Door-Mobile.webp" : "/desktop/Right-Door-Dekstop.webp",
  };
}

/* ═══════════════════════════════════════════════
   DOOR BELL  — fixed overlay, always above navbar
   ─ position: fixed so it sits above every z-index layer
   ─ Drops with springy falling physics on load
   ─ Idles with a gentle perpetual jiggle
   ─ Scroll: pivots right and swings off-screen
   ─ Fades out once doors are fully open
═══════════════════════════════════════════════ */
function DoorBell({ doorsReady }) {
  const [dropped, setDropped] = useState(false);

  const scrollRot = useMotionValue(0);
  const scrollX   = useMotionValue(0); // drives the off-screen exit to the right

  useEffect(() => {
    /* Hero section is 250vh tall; bell swings out over first ~30% of that */
    const heroHeight = window.innerHeight * 2.5;
    const swingEnd   = heroHeight * 0.30;

    function onScroll() {
      const y = window.scrollY;
      const t = Math.min(y / swingEnd, 1);

      /*
       * Ease-in-out quad: gives the bell a slow heavy start then builds
       * momentum — feels like solid brass swinging on a real cord.
       */
      const eased = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

      /* Rotate clockwise up to 70° to give a visual swing arc */
      scrollRot.set(eased * 70);

      /*
       * Translate off the RIGHT edge of the viewport.
       * window.innerWidth + 200 guarantees the bell clears the edge on
       * every screen size — even ultrawide monitors.
       * No opacity fade: the bell exits cleanly by leaving the screen.
       */
      scrollX.set(eased * (window.innerWidth + 200));
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [scrollRot, scrollX]);

  const handleDropComplete = useCallback(() => setDropped(true), []);

  return (
    /*
     * Outer wrapper — fixed in viewport, always above navbar (z:1001).
     * originX/Y:"0%" keeps the pivot at the top-left of this element
     * (= just right of the centre seam) so rotation + translate combine
     * to produce a realistic pendulum-swings-off-frame motion.
     */
    <motion.div
      aria-hidden="true"
      style={{
        position:      "fixed",
        top:           0,
        left:          "calc(50% + 4px)",
        zIndex:        1001,
        originX:       "0%",
        originY:       "0%",
        rotate:        scrollRot,
        x:             scrollX,
        pointerEvents: "none",
        display:       "flex",
        flexDirection: "column",
        alignItems:    "center",
      }}
    >
      {/* Phase-1 drop: springs down from above with overshoot */}
      <motion.div
        style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
        initial={{ y: -240, opacity: 0 }}
        animate={doorsReady ? {
          y:       0,
          opacity: 1,
          transition: {
            delay:    0.15,
            duration: 0.95,
            ease:     [0.34, 1.42, 0.64, 1],   /* overshoot spring */
          },
        } : {}}
        onAnimationComplete={handleDropComplete}
      >
        {/* Cord — single hairline */}
        <div style={{
          width:      1,
          height:     "clamp(50px, 7.5vh, 76px)",
          background: "linear-gradient(to bottom, rgba(130,90,30,0.92) 0%, rgba(110,75,22,0.4) 100%)",
          flexShrink: 0,
        }} />

        {/*
          Phase-2 idle jiggle — starts only after drop settles.
          3–4° oscillation, decaying keyframes, repeats with a pause.
          transformOrigin top-centre so it pivots from where cord meets bell.
        */}
        <motion.div
          style={{
            originX: "50%",
            originY: "0%",
            filter:  "drop-shadow(0 5px 14px rgba(0,0,0,0.5))",
            marginTop: -1,
          }}
          animate={dropped ? {
            rotate: [0, 3.8, -3, 3.2, -2.4, 2.6, -1.8, 2, -1.2, 1.4, -0.7, 0.8, 0],
            transition: {
              duration:    7,
              ease:        "easeInOut",
              repeat:      Infinity,
              repeatDelay: 3,
              times: [0, 0.07, 0.15, 0.23, 0.31, 0.40, 0.49, 0.58, 0.67, 0.76, 0.84, 0.92, 1],
            },
          } : {}}
        >
          {/* ── Elegant minimal bell ── */}
          <svg width="36" height="44" viewBox="0 0 36 44" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              {/* Side-lit brass: highlight left, warm centre, shadow right */}
              <linearGradient id="b-body" x1="0" y1="0" x2="36" y2="0" gradientUnits="userSpaceOnUse">
                <stop offset="0%"   stopColor="#A07025" />
                <stop offset="38%"  stopColor="#E8C96A" />
                <stop offset="100%" stopColor="#6B4812" />
              </linearGradient>
              {/* Soft vertical sheen on dome */}
              <linearGradient id="b-sheen" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="rgba(255,255,255,0.16)" />
                <stop offset="55%"  stopColor="rgba(255,255,255,0.04)" />
                <stop offset="100%" stopColor="rgba(255,255,255,0)" />
              </linearGradient>
              {/* Rim catches light at its lip */}
              <linearGradient id="b-rim" x1="0" y1="0" x2="36" y2="0" gradientUnits="userSpaceOnUse">
                <stop offset="0%"   stopColor="#7A5215" />
                <stop offset="30%"  stopColor="#EDD476" />
                <stop offset="70%"  stopColor="#EDD476" />
                <stop offset="100%" stopColor="#7A5215" />
              </linearGradient>
            </defs>

            {/* Mounting knob */}
            <ellipse cx="18" cy="3.2" rx="3" ry="3.2" fill="#9A6E20" />
            <ellipse cx="17.2" cy="2.3" rx="1.1" ry="1.3" fill="rgba(255,255,255,0.22)" />

            {/* Bell dome — clean single path */}
            <path d="M18 6 C9 6 3 13 3 21 L3 32 L33 32 L33 21 C33 13 27 6 18 6 Z" fill="url(#b-body)" />
            <path d="M18 6 C9 6 3 13 3 21 L3 32 L33 32 L33 21 C33 13 27 6 18 6 Z" fill="url(#b-sheen)" />

            {/* Rim */}
            <path d="M1 32 Q18 37.5 35 32" stroke="url(#b-rim)" strokeWidth="2.6" fill="none" strokeLinecap="round" />

            {/* Clapper */}
            <line x1="18" y1="32" x2="18" y2="37.5" stroke="#7A5215" strokeWidth="1.1" strokeLinecap="round" />
            <circle cx="18" cy="40.5" r="3" fill="#8B6018" />
            <circle cx="16.8" cy="39.4" r="0.9" fill="rgba(255,255,255,0.2)" />
          </svg>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════
   HERO SECTION — CINEMATIC IMAGE DOOR REVEAL
═══════════════════════════════════════════════ */
function HeroSection({ onDoorsReady }) {
  const containerRef = useRef(null);
  const doorImages   = useDoorImages();

  /*
   * LOADING GATE — hide everything until BOTH door images have loaded.
   * This prevents the hero background from being visible before the
   * doors are painted on screen.
   */
  const [leftLoaded,  setLeftLoaded]  = useState(false);
  const [rightLoaded, setRightLoaded] = useState(false);
  const doorsReady = leftLoaded && rightLoaded;

  useEffect(() => {
    if (doorsReady && onDoorsReady) onDoorsReady();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doorsReady]);

  // Preload images imperatively so we know exact load timing
  useEffect(() => {
    setLeftLoaded(false);
    setRightLoaded(false);

    const imgL = new Image();
    const imgR = new Image();
    imgL.onload  = () => setLeftLoaded(true);
    imgL.onerror = () => setLeftLoaded(true);  // fail-open so site still works
    imgR.onload  = () => setRightLoaded(true);
    imgR.onerror = () => setRightLoaded(true);
    imgL.src = doorImages.left;
    imgR.src = doorImages.right;
  // Re-run when the image URLs change (i.e. viewport crosses 768px breakpoint)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doorImages.left, doorImages.right]);

  /* ── Scroll-linked progress (0 → 1 as the 250vh section scrolls) ── */
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const progress = useMotionValue(0);
  useMotionValueEvent(scrollYProgress, "change", (v) => progress.set(v));

  /* ── Auto-invite: doors crack open ~12° after images load ── */
  const autoNudge = useMotionValue(0);
  useEffect(() => {
    if (!doorsReady) return;
    const ctrl = animate(autoNudge, 1, {
      delay: 0.3,
      duration: 2.2,
      ease: [0.16, 1, 0.3, 1],
    });
    return () => ctrl.stop();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doorsReady]);

  const NUDGE_DEG = 12;
  const MAX_DEG   = 100;

  const leftRotate = useTransform(
    [progress, autoNudge],
    ([p, n]) => -Math.min(p * MAX_DEG + n * NUDGE_DEG, MAX_DEG)
  );
  const rightRotate = useTransform(
    [progress, autoNudge],
    ([p, n]) =>  Math.min(p * MAX_DEG + n * NUDGE_DEG, MAX_DEG)
  );

  /* ── Background parallax zoom ── */
  const bgScale = useTransform(progress, [0, 1], [1.08, 1.0]);

  /* ── Hero text fades in as doors open ── */
  const brandOp = useTransform(progress, [0.55, 0.82], [0, 1]);
  const brandY  = useTransform(progress, [0.55, 0.82], [40, 0]);
  const btnOp   = useTransform(progress, [0.70, 0.92], [0, 1]);
  const btnY    = useTransform(progress, [0.70, 0.92], [20, 0]);

  /* ── Glow: starts fully visible covering the bg, fades out as doors open ── */
  const glowOp = useTransform(progress, [0, 0.55], [1, 0]);

  /* ── Scroll hint fades quickly ── */
  const hintOp = useTransform(progress, [0, 0.08], [1, 0]);

  /* ── Entire door panel fades out near the end of travel ── */
  const doorsOp = useTransform(progress, [0.85, 0.98], [1, 0]);

  const scrollToMenu = () =>
    document.getElementById("featured")?.scrollIntoView({ behavior: "smooth" });

  return (
    <section
      ref={containerRef}
      style={{ height: "250vh", position: "relative" }}
      aria-label="Welcome to Cremeo"
    >
      <div style={{ position: "sticky", top: 0, height: "100vh", overflow: "hidden" }}>

        {/*
          ── LOADING COVER ──
          Solid espresso screen shown until both door images are loaded.
          Fades out once ready so there's never a flash of the hero behind.
        */}
        <motion.div
          aria-hidden="true"
          initial={{ opacity: 1 }}
          animate={{ opacity: doorsReady ? 0 : 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          style={{
            position: "absolute",
            top: 0, left: 0, right: 0, bottom: 0,
            background: "#2E1A0E",
            zIndex: 50,
            pointerEvents: doorsReady ? "none" : "all",
          }}
        >
          {/* Subtle pulsing logo while loading */}
          <div style={{
            position: "absolute", top: "50%", left: "50%",
            transform: "translate(-50%, -50%)",
            textAlign: "center",
          }}>
            <p style={{
              fontFamily: FONT_DISPLAY,
              fontSize: "clamp(32px, 8vw, 56px)",
              fontWeight: 300,
              color: C.gold,
              letterSpacing: "0.18em",
              animation: "pulse 1.8s ease infinite",
            }}>
              CREMEO
            </p>
            <div style={{
              width: 36, height: 1,
              background: `linear-gradient(to right, transparent, ${C.gold}, transparent)`,
              margin: "12px auto 0",
            }} />
          </div>
        </motion.div>

        {/* ── Hero background ── */}
        <motion.div
          style={{
            position: "absolute",
            top: 0, left: 0, right: 0, bottom: 0,
            scale: bgScale,
            transformOrigin: "center center",
            willChange: "transform",
          }}
        >
          <img
            src={IMG.hero}
            alt="Cremeo Artisan Bakery interior"
            style={{
              width: "100%", height: "100%",
              objectFit: "cover", objectPosition: "center",
              display: "block",
              userSelect: "none", pointerEvents: "none",
            }}
            draggable={false}
          />
          <div aria-hidden="true" style={{
            position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
            background: "rgba(20,8,2,0.45)", pointerEvents: "none",
          }} />
          <div aria-hidden="true" style={{
            position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
            background: "radial-gradient(ellipse 80% 75% at 50% 50%, transparent 35%, rgba(20,8,2,0.35) 100%)",
            pointerEvents: "none",
          }} />
        </motion.div>

        {/* ── Brand text behind the doors ── */}
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
          zIndex: 1,
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          textAlign: "center", padding: "0 6%",
          pointerEvents: "none",
        }}>
          <motion.div style={{ opacity: brandOp, y: brandY }}>
            <p style={{
              fontFamily: FONT_BODY,
              fontSize: "clamp(9px, 1.1vw, 11px)",
              letterSpacing: "0.34em", textTransform: "uppercase",
              color: C.goldLight, marginBottom: 26,
              textShadow: "0 2px 12px rgba(0,0,0,0.6)",
            }}>
              Est. 2019 &nbsp;&bull;&nbsp; Artisan Bakery
            </p>
            <h1 style={{
              fontFamily: FONT_DISPLAY, fontWeight: 300,
              fontSize: "clamp(58px, 13.5vw, 144px)",
              lineHeight: 0.88, color: C.cream,
              letterSpacing: "0.12em", marginBottom: 18,
              textShadow: "0 4px 32px rgba(0,0,0,0.55)",
            }}>
              CREMEO
            </h1>
            <div style={{
              width: 52, height: 1,
              background: `linear-gradient(to right, transparent, ${C.gold}, transparent)`,
              margin: "0 auto 20px",
            }} />
            <p style={{
              fontFamily: FONT_DISPLAY, fontStyle: "italic", fontWeight: 300,
              fontSize: "clamp(15px, 2.6vw, 27px)",
              color: C.goldLight, letterSpacing: "0.07em", marginBottom: 54,
              textShadow: "0 2px 16px rgba(0,0,0,0.5)",
            }}>
              Premium Desserts
            </p>
          </motion.div>
          <motion.div style={{ opacity: btnOp, y: btnY, pointerEvents: "auto" }}>
            <button
              className="btn-gold"
              onClick={scrollToMenu}
              style={{ fontSize: 11, letterSpacing: "0.16em", padding: "16px 40px", boxShadow: "0 8px 32px rgba(0,0,0,0.35)" }}
            >
              Explore Menu <ArrowRight size={13} style={{ marginLeft: 4 }} />
            </button>
          </motion.div>
        </div>

        {/* ══ THE DOORS ══ */}
        <motion.div
          aria-hidden="true"
          style={{
            position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
            zIndex: 10,
            opacity: doorsOp,
            pointerEvents: "none",
          }}
        >
          {/* Perspective wrapper */}
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
            perspective: "clamp(900px, 130vw, 1600px)",
            perspectiveOrigin: "50% 50%",
          }}>

            {/* ── Left door ── */}
            <motion.div style={{
              position: "absolute",
              left: 0, top: 0, bottom: 0,
              width: "50%",
              rotateY: leftRotate,
              transformOrigin: "0% 50%",
              willChange: "transform",
              transformStyle: "preserve-3d",
              filter: "drop-shadow(6px 0 20px rgba(0,0,0,0.5))",
            }}>
              <img
                src={doorImages.left}
                alt=""
                aria-hidden="true"
                style={{
                  width: "100%", height: "100%",
                  objectFit: "cover", objectPosition: "right center",
                  display: "block", userSelect: "none",
                }}
                draggable={false}
              />
              {/* Inner-edge depth shading */}
              <div style={{
                position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
                pointerEvents: "none",
                background: "linear-gradient(to left, rgba(0,0,0,0.22) 0%, transparent 18%)",
              }} />
            </motion.div>

            {/* ── Right door ── */}
            <motion.div style={{
              position: "absolute",
              right: 0, top: 0, bottom: 0,
              width: "50%",
              rotateY: rightRotate,
              transformOrigin: "100% 50%",
              willChange: "transform",
              transformStyle: "preserve-3d",
              filter: "drop-shadow(-6px 0 20px rgba(0,0,0,0.5))",
            }}>
              <img
                src={doorImages.right}
                alt=""
                aria-hidden="true"
                style={{
                  width: "100%", height: "100%",
                  objectFit: "cover", objectPosition: "left center",
                  display: "block", userSelect: "none",
                }}
                draggable={false}
              />
              {/* Inner-edge depth shading */}
              <div style={{
                position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
                pointerEvents: "none",
                background: "linear-gradient(to right, rgba(0,0,0,0.22) 0%, transparent 18%)",
              }} />
            </motion.div>
          </div>

          {/*
            ── BACKGROUND GLOW ──
            A full-viewport warm amber radial glow that sits between the
            hero image and the doors. It's fully visible on load (hiding
            the hero photo), then fades away as the doors swing open and
            the real background is revealed. This also removes any harsh
            black seam — the centre just glows warmly.
          */}
          {/* Outer warm fill — covers the whole scene */}
          <motion.div
            style={{
              position: "absolute",
              top: 0, left: 0, right: 0, bottom: 0,
              zIndex: 2,
              opacity: glowOp,
              background: "radial-gradient(ellipse 70% 80% at 50% 50%, rgba(200,130,40,0.72) 0%, rgba(160,90,20,0.88) 40%, rgba(40,18,4,0.97) 100%)",
              pointerEvents: "none",
            }}
          />
          {/* Centre shaft — warm golden beam where the doors meet */}
          <motion.div
            style={{
              position: "absolute",
              top: 0, bottom: 0,
              left: "calc(50% - 40px)",
              width: 80,
              zIndex: 3,
              opacity: glowOp,
              background: "linear-gradient(to right, transparent 0%, rgba(255,200,80,0.18) 30%, rgba(255,220,120,0.55) 50%, rgba(255,200,80,0.18) 70%, transparent 100%)",
              filter: "blur(8px)",
              pointerEvents: "none",
            }}
          />
          {/* Tight bright core at the seam */}
          <motion.div
            style={{
              position: "absolute",
              top: "5%", bottom: "5%",
              left: "calc(50% - 8px)",
              width: 16,
              zIndex: 3,
              opacity: glowOp,
              background: "linear-gradient(to right, transparent, rgba(255,230,150,0.9), transparent)",
              filter: "blur(4px)",
              pointerEvents: "none",
            }}
          />
        </motion.div>

        {/* ── Scroll hint — raised higher (bottom: 80px) ── */}
        <motion.div
          aria-hidden="true"
          style={{
            position: "absolute",
            bottom: 80,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 20,
            opacity: hintOp,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 7,
            pointerEvents: "none",
          }}
        >
          <p style={{
            fontFamily: FONT_BODY,
            fontSize: 9,
            letterSpacing: "0.30em",
            textTransform: "uppercase",
            color: "rgba(250,246,239,0.65)",
            textShadow: "0 1px 8px rgba(0,0,0,0.6)",
          }}>
            Scroll to enter
          </p>
          <ChevronDown
            size={15}
            color="rgba(250,246,239,0.55)"
            style={{ animation: "float 1.9s ease infinite" }}
          />
        </motion.div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════
   NAVBAR
═══════════════════════════════════════════════ */
function Navbar({ cartCount, onCartOpen, cartBouncing }) {
  const [scrolled,   setScrolled]   = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handler = () =>
      setScrolled(window.scrollY > window.innerHeight * 0.92);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const scrollTo = (id) => {
    setMobileOpen(false);
    setTimeout(
      () => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }),
      50
    );
  };

  const navLinks = [
    { label: "Menu",     id: "featured" },
    { label: "Cakes",    id: "cakes"    },
    { label: "Breads",   id: "breads"   },
    { label: "Pastries", id: "cookies"  },
    { label: "About",    id: "about"    },
    { label: "Contact",  id: "contact"  },
  ];

  const navBg     = scrolled ? "rgba(250,246,239,0.96)" : "transparent";
  const textColor = scrolled ? C.espresso : "rgba(250,246,239,0.92)";

  return (
    <>
      <nav
        style={{
          position: "fixed", top: 0, left: 0, right: 0,
          zIndex: 1000,
          padding: scrolled ? "12px 5%" : "20px 5%",
          background: navBg,
          backdropFilter: scrolled ? "blur(12px)" : "none",
          WebkitBackdropFilter: scrolled ? "blur(12px)" : "none",
          borderBottom: scrolled ? `1px solid ${C.line}` : "none",
          transition: "all 0.4s ease",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}
      >
        {/* Logo */}
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          style={{
            background: "none", border: "none", cursor: "pointer",
            display: "flex", flexDirection: "column", alignItems: "flex-start",
            flexShrink: 0,
          }}
          aria-label="Back to top"
        >
          <span
            style={{
              fontFamily: FONT_DISPLAY, fontSize: 24, fontWeight: 400,
              color: scrolled ? C.espresso : C.cream,
              letterSpacing: "0.06em", lineHeight: 1,
            }}
          >
            Cremeo
          </span>
          <span
            style={{
              fontFamily: FONT_BODY, fontSize: 8, letterSpacing: "0.28em",
              textTransform: "uppercase",
              color: scrolled ? C.gold : "rgba(228,199,126,0.9)",
              marginTop: 2,
            }}
          >
            Artisan Bakery
          </span>
        </button>

        {/* Desktop nav */}
        <div className="hide-mobile" style={{ display: "flex", gap: 32, alignItems: "center" }}>
          {navLinks.map((l) => (
            <button
              key={l.id}
              className="nav-link"
              onClick={() => scrollTo(l.id)}
              style={{
                background: "none", border: "none", cursor: "pointer",
                fontFamily: FONT_BODY, fontSize: 13, fontWeight: 500,
                color: textColor, letterSpacing: "0.04em",
              }}
            >
              {l.label}
            </button>
          ))}
        </div>

        {/* Right: cart + hamburger */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button
            onClick={onCartOpen}
            className={cartBouncing ? "cart-bounce" : ""}
            aria-label={`Cart (${cartCount} items)`}
            style={{
              position: "relative", background: "none", border: "none",
              cursor: "pointer",
              color: scrolled ? C.espresso : C.cream,
              padding: 6,
            }}
          >
            <ShoppingBag size={22} />
            {cartCount > 0 && (
              <span
                style={{
                  position: "absolute", top: 0, right: 0,
                  width: 17, height: 17,
                  background: C.caramel, borderRadius: "50%",
                  fontSize: 9, fontWeight: 700, color: C.cream,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >
                {cartCount}
              </span>
            )}
          </button>
          <button
            className="hide-desktop"
            onClick={() => setMobileOpen(true)}
            style={{
              background: "none", border: "none", cursor: "pointer",
              color: scrolled ? C.espresso : C.cream,
              padding: 6,
            }}
            aria-label="Open menu"
          >
            <Menu size={22} />
          </button>
        </div>
      </nav>

      {/* Mobile menu overlay */}
      {mobileOpen && (
        <div
          style={{
            position: "fixed",
            top: 0, left: 0, right: 0, bottom: 0,
            zIndex: 1100,
            background: C.espresso,
            display: "flex", flexDirection: "column",
            padding: "0 7%",
            animation: "fadeIn 0.25s ease",
          }}
        >
          <div
            style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "24px 0",
              borderBottom: "1px solid rgba(250,246,239,0.08)",
            }}
          >
            <span
              style={{
                fontFamily: FONT_DISPLAY, fontSize: 26,
                color: C.cream, letterSpacing: "0.06em",
              }}
            >
              Cremeo
            </span>
            <button
              onClick={() => setMobileOpen(false)}
              style={{ background: "none", border: "none", cursor: "pointer", color: C.cream, padding: 4 }}
              aria-label="Close menu"
            >
              <X size={22} />
            </button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", paddingTop: 16, flex: 1 }}>
            {navLinks.map((l, i) => (
              <button
                key={l.id}
                onClick={() => scrollTo(l.id)}
                style={{
                  background: "none", border: "none", cursor: "pointer",
                  textAlign: "left",
                  fontFamily: FONT_DISPLAY, fontSize: 32, fontWeight: 300,
                  color: C.cream, padding: "14px 0",
                  borderBottom: "1px solid rgba(250,246,239,0.07)",
                  animation: `fadeUp 0.35s ease ${i * 0.05}s both`,
                }}
              >
                {l.label}
              </button>
            ))}
          </div>
          <div style={{ display: "flex", gap: 18, padding: "28px 0" }}>
            <a href="#" style={{ color: C.gold }} aria-label="Instagram">
              <Instagram size={20} />
            </a>
            <a href="#" style={{ color: C.gold }} aria-label="Facebook">
              <Facebook size={20} />
            </a>
          </div>
        </div>
      )}
    </>
  );
}

/* ═══════════════════════════════════════════════
   TRUST STRIP
═══════════════════════════════════════════════ */
function TrustStrip() {
  const items = [
    { icon: <Leaf size={16} />,  label: "All Natural Ingredients" },
    { icon: <Clock size={16} />, label: "Baked Fresh Daily" },
    { icon: <Award size={16} />, label: "Award-Winning Recipes" },
    { icon: <Users size={16} />, label: "Loved by Hundreds" },
  ];
  return (
    <div style={{ background: C.espresso, padding: "18px 5%" }}>
      <div className="trust-grid" style={{ maxWidth: 1100, margin: "0 auto" }}>
        {items.map((it, i) => (
          <div
            key={i}
            style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              gap: 9, padding: "10px 12px", color: C.goldLight,
            }}
          >
            {it.icon}
            <span
              style={{
                fontFamily: FONT_BODY, fontSize: 11, fontWeight: 500,
                letterSpacing: "0.08em", textTransform: "uppercase",
                color: C.cream,
              }}
            >
              {it.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   SECTION HEADER
═══════════════════════════════════════════════ */
function SectionHeader({ eyebrow, title, sub, center = true }) {
  return (
    <div className="reveal" style={{ textAlign: center ? "center" : "left", marginBottom: 44 }}>
      {eyebrow && (
        <p
          style={{
            fontFamily: FONT_BODY, fontSize: 10,
            letterSpacing: "0.28em", textTransform: "uppercase",
            color: C.gold, marginBottom: 12,
          }}
        >
          {eyebrow}
        </p>
      )}
      <div className={`divider${center ? "" : " left"}`} />
      <h2
        style={{
          fontFamily: FONT_DISPLAY, fontWeight: 300,
          fontSize: "clamp(30px, 5vw, 52px)",
          color: C.espresso, lineHeight: 1.1, marginTop: 16,
        }}
      >
        {title}
      </h2>
      {sub && (
        <p
          style={{
            fontFamily: FONT_BODY, fontWeight: 300, fontSize: 15,
            color: C.mist, maxWidth: 500,
            margin: center ? "12px auto 0" : "12px 0 0",
            lineHeight: 1.7,
          }}
        >
          {sub}
        </p>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════
   PRODUCT CARD
═══════════════════════════════════════════════ */
function ProductCard({ product, onAdd, wishlist, toggleWish }) {
  const [added,  setAdded]  = useState(false);
  const [imgErr, setImgErr] = useState(false);
  const wished = wishlist?.has(product.id);

  const handleAdd = () => {
    onAdd({ ...product, qty: 1 });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div
      className="card-lift reveal"
      style={{
        background: C.cream, borderRadius: 4,
        border: `1px solid ${C.line}`,
        overflow: "hidden",
        display: "flex", flexDirection: "column",
      }}
    >
      {/* Image wrapper with fixed aspect ratio */}
      <div style={{ position: "relative", paddingBottom: "68%", overflow: "hidden", flexShrink: 0 }}>
        {imgErr ? (
          <div className="img-placeholder" style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }} />
        ) : (
          <img
            src={product.img}
            alt={product.name}
            onError={() => setImgErr(true)}
            style={{
              position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
              width: "100%", height: "100%",
              objectFit: "cover",
              transition: "transform 0.5s ease",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.06)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
          />
        )}
        {product.tag && (
          <span
            style={{
              position: "absolute", top: 10, left: 10,
              background: C.espresso, color: C.goldLight,
              fontFamily: FONT_BODY, fontSize: 8, fontWeight: 600,
              letterSpacing: "0.15em", textTransform: "uppercase",
              padding: "4px 9px", borderRadius: 2,
            }}
          >
            {product.tag}
          </span>
        )}
        {toggleWish && (
          <button
            onClick={() => toggleWish(product.id)}
            aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
            style={{
              position: "absolute", top: 10, right: 10,
              background: "rgba(250,246,239,0.92)", border: "none",
              borderRadius: "50%", width: 32, height: 32,
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", transition: "transform 0.2s",
            }}
          >
            <Heart size={14} fill={wished ? C.caramel : "none"} color={wished ? C.caramel : C.mist} />
          </button>
        )}
      </div>

      {/* Info */}
      <div style={{ padding: "16px 16px 18px", flex: 1, display: "flex", flexDirection: "column" }}>
        <h3
          style={{
            fontFamily: FONT_DISPLAY, fontWeight: 400, fontSize: 19,
            color: C.espresso, marginBottom: 6, lineHeight: 1.2,
          }}
        >
          {product.name}
        </h3>
        <p
          style={{
            fontFamily: FONT_BODY, fontSize: 13, fontWeight: 300,
            color: C.mist, lineHeight: 1.6, flex: 1, marginBottom: 14,
          }}
        >
          {product.desc}
        </p>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
          <span
            style={{ fontFamily: FONT_DISPLAY, fontSize: 20, fontWeight: 500, color: C.chocolate, flexShrink: 0 }}
          >
            {fmt(product.price)}
          </span>
          <button
            onClick={handleAdd}
            style={{
              background: added ? C.caramel : C.espresso,
              color: C.cream, border: "none", borderRadius: 3,
              padding: "9px 14px", fontSize: 10, fontWeight: 600,
              letterSpacing: "0.1em", textTransform: "uppercase",
              cursor: "pointer", transition: "all 0.25s",
              display: "flex", alignItems: "center", gap: 5, flexShrink: 0,
            }}
          >
            {added ? <><Check size={12} /> Added</> : <><Plus size={12} /> Add</>}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   FEATURED SECTION
═══════════════════════════════════════════════ */
function FeaturedSection({ onAdd, wishlist, toggleWish }) {
  return (
    <section id="featured" className="section-pad" style={{ background: C.cream }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <SectionHeader
          eyebrow="From our kitchen"
          title={<>Today&rsquo;s <em style={{ fontStyle: "italic" }}>Favorites</em></>}
          sub="Our most-loved creations, baked this morning and ready to delight."
        />
        <div className="product-grid-featured">
          {FEATURED.map((p) => (
            <ProductCard key={p.id} product={p} onAdd={onAdd} wishlist={wishlist} toggleWish={toggleWish} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════
   GENERIC PRODUCT SECTION
═══════════════════════════════════════════════ */
function ProductSection({ id, eyebrow, title, sub, products, onAdd, wishlist, toggleWish, bg }) {
  return (
    <section id={id} className="section-pad" style={{ background: bg || C.cream }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <SectionHeader eyebrow={eyebrow} title={title} sub={sub} />
        <div className="product-grid">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} onAdd={onAdd} wishlist={wishlist} toggleWish={toggleWish} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════
   ABOUT SECTION
═══════════════════════════════════════════════ */
function AboutSection() {
  return (
    <section id="about" className="section-pad" style={{ background: C.espresso }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div className="about-grid">
          {/* Images */}
          <div className="about-image-col reveal" style={{ position: "relative" }}>
            <img
              src={IMG.about}
              alt="Bakery interior"
              style={{
                width: "100%", height: "clamp(280px, 40vw, 460px)",
                objectFit: "cover", borderRadius: 4, display: "block",
              }}
            />
            <div
              className="hide-mobile"
              style={{
                position: "absolute", bottom: -24, right: -20,
                width: 160, height: 160,
                borderRadius: 4, overflow: "hidden",
                border: `3px solid ${C.espresso}`,
              }}
            >
              <img
                src={IMG.aboutSmall}
                alt="Fresh bread"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>
            <div
              aria-hidden="true"
              style={{
                position: "absolute", top: -10, left: -10,
                width: "38%", height: "38%",
                border: `1px solid ${C.gold}`,
                borderRadius: 4, opacity: 0.35, pointerEvents: "none",
              }}
            />
          </div>

          {/* Text */}
          <div className="reveal">
            <p
              style={{
                fontFamily: FONT_BODY, fontSize: 10,
                letterSpacing: "0.28em", textTransform: "uppercase",
                color: C.gold, marginBottom: 12,
              }}
            >
              Our Story
            </p>
            <div className="divider left" style={{ background: C.gold }} />
            <h2
              style={{
                fontFamily: FONT_DISPLAY, fontWeight: 300,
                fontSize: "clamp(26px, 4vw, 44px)",
                color: C.cream, lineHeight: 1.15,
                margin: "16px 0 18px",
              }}
            >
              A neighbourhood bakery
              <br />
              <em style={{ fontStyle: "italic" }}>baked into the community</em>
            </h2>
            <p
              style={{
                fontFamily: FONT_BODY, fontWeight: 300, fontSize: 14,
                color: "rgba(250,246,239,0.7)", lineHeight: 1.85, marginBottom: 18,
              }}
            >
              Cremeo was born in a home kitchen in Askari 11, Sector C. What started as weekend
              sourdough for neighbors grew into something we could not contain — so in 2019 we
              opened our doors properly.
            </p>
            <p
              style={{
                fontFamily: FONT_BODY, fontWeight: 300, fontSize: 14,
                color: "rgba(250,246,239,0.7)", lineHeight: 1.85, marginBottom: 32,
              }}
            >
              Every loaf, every layer, every laminated croissant is still made by hand. We use no
              artificial preservatives — just honest ingredients, patience, and a wood-fired oven
              we are unreasonably attached to.
            </p>
            <div className="stats-row">
              {[["5+", "Years Baking"], ["200+", "Recipes"], ["500+", "Happy Families"]].map(
                ([n, l]) => (
                  <div key={l}>
                    <p
                      style={{
                        fontFamily: FONT_DISPLAY, fontSize: 32, fontWeight: 400,
                        color: C.goldLight, lineHeight: 1,
                      }}
                    >
                      {n}
                    </p>
                    <p
                      style={{
                        fontFamily: FONT_BODY, fontSize: 10,
                        color: "rgba(250,246,239,0.45)",
                        marginTop: 4, textTransform: "uppercase", letterSpacing: "0.1em",
                      }}
                    >
                      {l}
                    </p>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════
   REVIEWS SECTION
═══════════════════════════════════════════════ */
function ReviewsSection() {
  return (
    <section className="section-pad" style={{ background: C.creamDeep }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <SectionHeader
          eyebrow="Word of mouth"
          title={<>What our <em style={{ fontStyle: "italic" }}>regulars</em> say</>}
          sub="We are proud to be a part of so many mornings, celebrations, and memories."
        />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(min(300px, 100%), 1fr))",
            gap: 24,
          }}
        >
          {REVIEWS.map((r, i) => (
            <div
              key={i}
              className="card-lift reveal"
              style={{
                background: C.cream, borderRadius: 4,
                padding: "28px 24px",
                border: `1px solid ${C.line}`,
                position: "relative",
              }}
            >
              <span
                aria-hidden="true"
                style={{
                  position: "absolute", top: 16, right: 20,
                  fontFamily: FONT_DISPLAY, fontSize: 64,
                  color: C.parchment, lineHeight: 1, userSelect: "none",
                }}
              >
                &ldquo;
              </span>
              <div style={{ display: "flex", gap: 3, marginBottom: 16 }}>
                {Array.from({ length: r.stars }).map((_, j) => (
                  <Star key={j} size={13} fill={C.gold} color={C.gold} />
                ))}
              </div>
              <p
                style={{
                  fontFamily: FONT_BODY, fontWeight: 300, fontSize: 14,
                  color: C.mist, lineHeight: 1.8, marginBottom: 22,
                }}
              >
                {r.text}
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <img
                  src={r.img}
                  alt={r.name}
                  style={{
                    width: 42, height: 42,
                    borderRadius: "50%", objectFit: "cover", flexShrink: 0,
                  }}
                />
                <div>
                  <p style={{ fontFamily: FONT_BODY, fontWeight: 600, fontSize: 13, color: C.espresso }}>
                    {r.name}
                  </p>
                  <p style={{ fontFamily: FONT_BODY, fontSize: 11, color: C.gold, marginTop: 1 }}>
                    {r.role}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════
   CONTACT SECTION
═══════════════════════════════════════════════ */
function ContactSection() {
  const [form, setForm] = useState({ name: "", phone: "", message: "" });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
    setForm({ name: "", phone: "", message: "" });
    setTimeout(() => setSent(false), 4000);
  };

  const inputStyle = {
    width: "100%", padding: "13px 15px",
    background: "rgba(250,246,239,0.07)",
    border: "1px solid rgba(250,246,239,0.18)",
    borderRadius: 3, color: C.cream,
    fontFamily: FONT_BODY, fontSize: 14, outline: "none",
    transition: "border-color 0.25s",
  };

  return (
    <section id="contact" className="section-pad" style={{ background: C.chocolate }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div className="contact-grid">
          {/* Left — info */}
          <div className="reveal">
            <p
              style={{
                fontFamily: FONT_BODY, fontSize: 10,
                letterSpacing: "0.28em", textTransform: "uppercase",
                color: C.gold, marginBottom: 12,
              }}
            >
              Visit Us
            </p>
            <div className="divider left" style={{ background: C.gold }} />
            <h2
              style={{
                fontFamily: FONT_DISPLAY, fontWeight: 300,
                fontSize: "clamp(26px, 4vw, 44px)",
                color: C.cream, lineHeight: 1.15,
                margin: "16px 0 24px",
              }}
            >
              Come find us in
              <br />
              <em style={{ fontStyle: "italic" }}>Askari 11</em>
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {[
                { icon: <MapPin size={16} />, label: "Address", value: "Shop 7, Main Market, Sector C, Askari 11, Lahore" },
                { icon: <Phone size={16} />, label: "Phone",   value: "+92 300 000 0000" },
                { icon: <Mail size={16} />,  label: "Email",   value: "hello@cremeo.pk" },
                { icon: <Clock size={16} />, label: "Hours",   value: "Mon – Sat: 7:00 AM – 9:00 PM\nSunday: 8:00 AM – 6:00 PM" },
              ].map((it) => (
                <div key={it.label} style={{ display: "flex", gap: 14 }}>
                  <div
                    style={{
                      width: 36, height: 36, borderRadius: "50%",
                      border: "1px solid rgba(201,168,76,0.3)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0, color: C.goldLight,
                    }}
                  >
                    {it.icon}
                  </div>
                  <div>
                    <p
                      style={{
                        fontFamily: FONT_BODY, fontSize: 10,
                        textTransform: "uppercase", letterSpacing: "0.15em",
                        color: C.gold, marginBottom: 3,
                      }}
                    >
                      {it.label}
                    </p>
                    <p
                      style={{
                        fontFamily: FONT_BODY, fontSize: 13, fontWeight: 300,
                        color: "rgba(250,246,239,0.8)",
                        whiteSpace: "pre-line", lineHeight: 1.6,
                      }}
                    >
                      {it.value}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 12, marginTop: 32 }}>
              {[Instagram, Facebook, Twitter].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  aria-label="Social link"
                  style={{
                    width: 38, height: 38, borderRadius: "50%",
                    border: "1px solid rgba(201,168,76,0.3)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: C.goldLight, transition: "all 0.25s", textDecoration: "none",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = C.gold;
                    e.currentTarget.style.color = C.espresso;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = C.goldLight;
                  }}
                >
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </div>

          {/* Right — form */}
          <div className="reveal" style={{ display: "flex", flexDirection: "column" }}>
            <h3
              style={{
                fontFamily: FONT_DISPLAY, fontWeight: 300, fontSize: 26,
                color: C.cream, marginBottom: 8,
              }}
            >
              Send us a message
            </h3>
            <p
              style={{
                fontFamily: FONT_BODY, fontSize: 13, fontWeight: 300,
                color: "rgba(250,246,239,0.5)", marginBottom: 28,
              }}
            >
              For custom cake orders, bulk enquiries, or just to say hello.
            </p>

            {sent && (
              <div
                style={{
                  background: "rgba(201,168,76,0.15)",
                  border: "1px solid rgba(201,168,76,0.4)",
                  borderRadius: 4, padding: "12px 16px",
                  marginBottom: 22,
                  display: "flex", alignItems: "center", gap: 10,
                  animation: "fadeIn 0.4s ease",
                }}
              >
                <Check size={15} color={C.goldLight} />
                <p style={{ fontFamily: FONT_BODY, fontSize: 13, color: C.goldLight }}>
                  Message received! We&rsquo;ll get back to you soon.
                </p>
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              style={{ display: "flex", flexDirection: "column", gap: 14 }}
            >
              <input
                placeholder="Your name"
                required
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                style={inputStyle}
              />
              <input
                placeholder="Phone number"
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                style={inputStyle}
              />
              <textarea
                placeholder="What are you looking for? Custom cake, bulk order, feedback..."
                rows={5}
                required
                value={form.message}
                onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                style={{ ...inputStyle, resize: "vertical" }}
              />
              <button
                type="submit"
                className="btn-gold"
                style={{ marginTop: 6, alignSelf: "flex-start" }}
              >
                Send Message <ArrowRight size={14} />
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════
   FOOTER
═══════════════════════════════════════════════ */
function Footer() {
  const scrollTo = (id) =>
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  return (
    <footer
      style={{
        background: C.espresso,
        borderTop: "1px solid rgba(250,246,239,0.06)",
        padding: "48px 5% 28px",
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div className="footer-grid">
          <div className="footer-brand">
            <p
              style={{
                fontFamily: FONT_DISPLAY, fontSize: 28, fontWeight: 300,
                color: C.cream, letterSpacing: "0.06em", marginBottom: 4,
              }}
            >
              Cremeo
            </p>
            <p
              style={{
                fontFamily: FONT_BODY, fontSize: 9,
                letterSpacing: "0.28em", textTransform: "uppercase",
                color: C.gold, marginBottom: 14,
              }}
            >
              Artisan Bakery &middot; Askari 11
            </p>
            <p
              style={{
                fontFamily: FONT_BODY, fontSize: 13, fontWeight: 300,
                color: "rgba(250,246,239,0.4)", lineHeight: 1.7, maxWidth: 280,
              }}
            >
              Handcrafted with honest ingredients every single morning. No shortcuts.
              No preservatives. Just good baking.
            </p>
          </div>

          <div>
            <p
              style={{
                fontFamily: FONT_BODY, fontSize: 9,
                letterSpacing: "0.2em", textTransform: "uppercase",
                color: C.gold, marginBottom: 16,
              }}
            >
              Explore
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                ["featured", "Menu"],
                ["cakes",    "Cakes"],
                ["breads",   "Breads"],
                ["cookies",  "Pastries"],
                ["about",    "About Us"],
              ].map(([id, label]) => (
                <button
                  key={id}
                  onClick={() => scrollTo(id)}
                  style={{
                    background: "none", border: "none", cursor: "pointer",
                    textAlign: "left",
                    fontFamily: FONT_BODY, fontSize: 13, fontWeight: 300,
                    color: "rgba(250,246,239,0.45)", transition: "color 0.2s",
                    padding: 0,
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = C.goldLight; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(250,246,239,0.45)"; }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p
              style={{
                fontFamily: FONT_BODY, fontSize: 9,
                letterSpacing: "0.2em", textTransform: "uppercase",
                color: C.gold, marginBottom: 16,
              }}
            >
              Hours
            </p>
            <p
              style={{
                fontFamily: FONT_BODY, fontSize: 13, fontWeight: 300,
                color: "rgba(250,246,239,0.45)", lineHeight: 2,
              }}
            >
              Mon &ndash; Sat
              <br />
              7:00 AM &ndash; 9:00 PM
              <br />
              <br />
              Sunday
              <br />
              8:00 AM &ndash; 6:00 PM
            </p>
          </div>
        </div>

        <div
          style={{
            borderTop: "1px solid rgba(250,246,239,0.06)",
            paddingTop: 24,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 10,
          }}
        >
          <p style={{ fontFamily: FONT_BODY, fontSize: 11, color: "rgba(250,246,239,0.22)" }}>
            &copy; {new Date().getFullYear()} Cremeo Artisan Bakery. All rights reserved.
          </p>
          <p style={{ fontFamily: FONT_BODY, fontSize: 11, color: "rgba(250,246,239,0.18)" }}>
            Askari 11, Sector C &middot; Lahore
          </p>
        </div>
      </div>
    </footer>
  );
}

/* ═══════════════════════════════════════════════
   CART DRAWER
═══════════════════════════════════════════════ */
function CartDrawer({ open, onClose, cart, updateQty, removeItem }) {
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;
  return (
    <>
      {/* Backdrop */}
      <div
        role="presentation"
        onClick={onClose}
        style={{
          position: "fixed",
          top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(46,26,14,0.5)",
          zIndex: 2000,
          animation: "fadeIn 0.3s ease",
        }}
      />

      {/* Drawer panel */}
      <div className="cart-drawer" role="dialog" aria-label="Shopping cart" aria-modal="true">
        {/* Header */}
        <div
          style={{
            padding: "20px 24px",
            borderBottom: `1px solid ${C.line}`,
            display: "flex", justifyContent: "space-between", alignItems: "center",
            flexShrink: 0,
          }}
        >
          <div>
            <h3 style={{ fontFamily: FONT_DISPLAY, fontSize: 22, fontWeight: 400, color: C.espresso }}>
              Your Order
            </h3>
            <p style={{ fontFamily: FONT_BODY, fontSize: 12, color: C.mist, marginTop: 2 }}>
              {cart.length} item{cart.length !== 1 ? "s" : ""}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close cart"
            style={{
              background: C.parchment, border: "none", borderRadius: "50%",
              width: 34, height: 34,
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", flexShrink: 0,
            }}
          >
            <X size={15} color={C.espresso} />
          </button>
        </div>

        {/* Items */}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 24px" }}>
          {cart.length === 0 ? (
            <div style={{ textAlign: "center", paddingTop: 60 }}>
              <ShoppingBag
                size={36}
                color={C.parchment}
                style={{ margin: "0 auto 16px", display: "block" }}
              />
              <p style={{ fontFamily: FONT_DISPLAY, fontSize: 20, color: C.mist, fontWeight: 300 }}>
                Your basket is empty
              </p>
              <p style={{ fontFamily: FONT_BODY, fontSize: 13, color: C.parchment, marginTop: 6 }}>
                Add something delicious!
              </p>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.id}
                style={{
                  display: "flex", gap: 12,
                  marginBottom: 18, paddingBottom: 18,
                  borderBottom: `1px solid ${C.line}`,
                }}
              >
                <img
                  src={item.img}
                  alt={item.name}
                  style={{ width: 62, height: 62, objectFit: "cover", borderRadius: 3, flexShrink: 0 }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p
                    style={{
                      fontFamily: FONT_DISPLAY, fontSize: 16, fontWeight: 400,
                      color: C.espresso, marginBottom: 2,
                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                    }}
                  >
                    {item.name}
                  </p>
                  <p style={{ fontFamily: FONT_BODY, fontSize: 12, color: C.gold, fontWeight: 500 }}>
                    {fmt(item.price)}
                  </p>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
                    <button
                      aria-label="Decrease quantity"
                      onClick={() => {
                        if (item.qty <= 1) removeItem(item.id);
                        else updateQty(item.id, -1);
                      }}
                      style={{
                        width: 26, height: 26, borderRadius: "50%",
                        border: `1px solid ${C.line}`, background: "none",
                        cursor: "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}
                    >
                      <Minus size={11} color={C.mist} />
                    </button>
                    <span
                      style={{
                        fontFamily: FONT_BODY, fontWeight: 600, fontSize: 13,
                        minWidth: 18, textAlign: "center",
                      }}
                    >
                      {item.qty}
                    </span>
                    <button
                      aria-label="Increase quantity"
                      onClick={() => updateQty(item.id, 1)}
                      style={{
                        width: 26, height: 26, borderRadius: "50%",
                        border: `1px solid ${C.line}`, background: "none",
                        cursor: "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}
                    >
                      <Plus size={11} color={C.mist} />
                    </button>
                    <button
                      aria-label="Remove item"
                      onClick={() => removeItem(item.id)}
                      style={{
                        marginLeft: "auto", background: "none", border: "none",
                        cursor: "pointer", color: C.mist, opacity: 0.45,
                      }}
                    >
                      <X size={13} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div
            style={{
              padding: "20px 24px",
              borderTop: `1px solid ${C.line}`,
              flexShrink: 0,
            }}
          >
            <div
              style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                marginBottom: 14,
              }}
            >
              <span style={{ fontFamily: FONT_BODY, fontSize: 13, color: C.mist }}>Subtotal</span>
              <span
                style={{
                  fontFamily: FONT_DISPLAY, fontSize: 20, fontWeight: 500, color: C.espresso,
                }}
              >
                {fmt(total)}
              </span>
            </div>
            <button className="btn-primary" style={{ width: "100%", marginBottom: 10 }}>
              Place Order (Call to Confirm)
            </button>
            <p style={{ fontFamily: FONT_BODY, fontSize: 11, color: C.mist, textAlign: "center" }}>
              Or call us at <strong>+92 300 000 0000</strong>
            </p>
          </div>
        )}
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════
   APP ROOT
═══════════════════════════════════════════════ */
export default function App() {
  const [cartOpen,     setCartOpen]     = useState(false);
  const [cartBouncing, setCartBouncing] = useState(false);
  const [cart,         setCart]         = useState([]);
  const [wishlist,     setWishlist]     = useState(new Set());
  const [doorsReady,   setDoorsReady]   = useState(false);

  useReveal();

  const addToCart = useCallback((item) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing)
        return prev.map((i) =>
          i.id === item.id ? { ...i, qty: i.qty + 1 } : i
        );
      return [...prev, { ...item, qty: 1 }];
    });
    setCartBouncing(true);
    setTimeout(() => setCartBouncing(false), 500);
  }, []);

  const updateQty  = (id, delta) =>
    setCart((prev) =>
      prev.map((i) => (i.id === id ? { ...i, qty: Math.max(1, i.qty + delta) } : i))
    );
  const removeItem = (id) =>
    setCart((prev) => prev.filter((i) => i.id !== id));
  const toggleWish = useCallback(
    (id) =>
      setWishlist((prev) => {
        const n = new Set(prev);
        if (n.has(id)) n.delete(id);
        else n.add(id);
        return n;
      }),
    []
  );
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  return (
    <>
      <GlobalStyles />

      {/*
        Bell is fixed-position at z:1001, above the navbar (z:1000).
        Rendered here in App so it's never clipped by any stacking context.
      */}
      <DoorBell doorsReady={doorsReady} />

      <Navbar
        cartCount={cartCount}
        onCartOpen={() => setCartOpen(true)}
        cartBouncing={cartBouncing}
      />

      <main>
        <HeroSection onDoorsReady={() => setDoorsReady(true)} />
        <TrustStrip />

        <FeaturedSection onAdd={addToCart} wishlist={wishlist} toggleWish={toggleWish} />

        <ProductSection
          id="cakes"
          eyebrow="Sweet celebrations"
          title={<>Our <em style={{ fontStyle: "italic" }}>Cakes</em></>}
          sub="Custom orders welcome. Each cake is baked to order and decorated by hand."
          products={CAKES}
          onAdd={addToCart}
          wishlist={wishlist}
          toggleWish={toggleWish}
          bg={C.creamDeep}
        />

        <ProductSection
          id="breads"
          eyebrow="From the oven"
          title={<>Artisan <em style={{ fontStyle: "italic" }}>Breads</em></>}
          sub="Long fermented, stone-baked, and ready before you wake up."
          products={BREADS}
          onAdd={addToCart}
          wishlist={wishlist}
          toggleWish={toggleWish}
          bg={C.cream}
        />

        <ProductSection
          id="cookies"
          eyebrow="Cookies & Pastries"
          title={<>Small <em style={{ fontStyle: "italic" }}>Pleasures</em></>}
          sub="Perfect with a cup of tea, or just on their own when nobody's looking."
          products={COOKIES}
          onAdd={addToCart}
          wishlist={wishlist}
          toggleWish={toggleWish}
          bg={C.creamDeep}
        />

        <AboutSection />
        <ReviewsSection />
        <ContactSection />
      </main>

      <Footer />

      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        cart={cart}
        updateQty={updateQty}
        removeItem={removeItem}
      />
    </>
  );
}
