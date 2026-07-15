# Cremeo — Artisan Bakery Website

Premium frontend for **Cremeo Bakery**, Askari 11 Sector C, Lahore.

## Stack
- React 18 + Vite
- Tailwind CSS (utility classes + custom inline styles)
- Lucide React (icons)
- Google Fonts: Cormorant Garamond (display) + DM Sans (body)
- **No additional dependencies** — all animations are pure CSS/DOM

## Sections
1. **Loading Screen** — animated wheat icon with branded intro
2. **Navbar** — transparent → frosted on scroll, mobile hamburger menu
3. **Hero** — full-viewport with Unsplash bakery imagery & parallax
4. **Trust Strip** — key brand values
5. **Featured Products** — bestsellers with add-to-cart
6. **Cakes** — cake menu with wishlist + cart
7. **Breads** — artisan breads
8. **Cookies & Pastries** — small bakes
9. **About** — story section with image collage + stats
10. **Reviews** — 3 customer testimonials
11. **Contact & Location** — address, hours, social + message form
12. **Footer** — links, hours, copyright
13. **Cart Drawer** — slide-in with qty controls, subtotal, CTA

## Replace Placeholder Images
All images are from Unsplash. To replace:
1. Upload your images to `/public/images/`
2. Update the `IMG` object at the top of `App.jsx`

## Deploy to Vercel
```bash
npm install
npm run build
# Push to GitHub → connect to Vercel → deploy
```

## Upcoming (Phase 2)
- [ ] Backend with Node.js / Supabase
- [ ] Admin dashboard (menu management)
- [ ] Online ordering with WhatsApp integration
- [ ] Inventory management
- [ ] Customer accounts
