# ACE Voyages — Project Context File
> Paste this at the TOP of every Claude session before anything else.

---

## What We Are Building
A travel agency website for **ACE Voyages**, a Nigerian travel company based in Lagos. This is a real business serving Nigerian customers who book flights, tours, visa assistance, and holiday packages.

## Tech Stack
- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS only — no other CSS libraries
- **Language:** TypeScript throughout — no plain JavaScript files
- **CMS:** Sanity.io — all content (tours, blog, testimonials, visa services) lives here
- **Database:** Supabase — bookings, leads, newsletter subscribers
- **Payments:** Paystack — Nigerian payment gateway
- **Email:** Resend — transactional emails
- **Images:** Cloudinary — image hosting and optimisation
- **Deployment:** Vercel

## Brand
- **Primary colour:** Deep Blue `#1B3A6B`
- **Accent colour:** Gold `#D4A017`
- **Background:** Off-white `#F8F9FA`
- **Dark text:** `#1A1A2E`
- **Light text:** `#6B7280`
- **Font:** Inter (Google Fonts)
- **Logo file:** `/public/images/logo.png`

## Business Details
- **Company name:** ACE Voyages Ltd
- **Tagline:** Nigeria's Most Trusted Travel Partner
- **Address:** E1-024 HFP Eastline Shopping Complex, Lekki, Lagos
- **Phone/WhatsApp:** +234 806 164 0504
- **Email:** hello@acevoyages.net
- **Website:** acevoyages.net

## Services They Offer
1. Flight Booking (Local & International)
2. Visa Assistance (UK, Canada, UAE, Schengen, Kenya)
3. Tour Packages (Cairo, Dubai, Zanzibar, Mauritius, Cape Town, UK)
4. Hotel Reservations
5. Corporate Travel
6. Honeymoon & Anniversary Packages

## Folder Structure
```
ace-voyages/
├── src/
│   ├── app/                  ← All pages live here
│   ├── components/
│   │   ├── ui/               ← Reusable components (Button, Card, etc.)
│   │   └── layout/           ← Navbar, Footer
│   ├── lib/
│   │   ├── supabase/         ← Database clients
│   │   └── email/            ← Email templates
│   └── sanity/
│       ├── schemas/          ← Content type definitions
│       └── lib/              ← Sanity client and queries
├── public/images/            ← Static images
├── sanity.config.ts          ← Sanity Studio config
└── .env.local                ← All secret keys (never share this file)
```

## Rules Claude Must Always Follow
- Always use TypeScript — never write `.js` files
- Always use Tailwind CSS — never write custom CSS files
- Always use Next.js App Router conventions (`page.tsx`, `layout.tsx`, `route.ts`)
- Always use the `cn()` utility from `/src/lib/utils.ts` for combining Tailwind classes
- Always use `next/image` for images — never a plain `<img>` tag
- Mobile-first design — build for 375px screen first, then scale up
- Nigerian context — prices always in ₦ (Naira), phone numbers in +234 format
- WhatsApp is the primary contact channel for Nigerian users — always include WhatsApp CTAs

## Current Build Status
> Update this section yourself as you complete each session

- [ ] SESSION 0 — Dependencies installed
- [ ] SESSION 1 — Environment variables set up
- [x] SESSION 2 — Component library built
- [ ] SESSION 3 — Navbar and Footer built
- [x] SESSION 4 — Homepage built
- [ ] SESSION 5 — Sanity CMS set up
- [ ] SESSION 6 — Tour pages built
- [ ] SESSION 7 — Supabase database set up
- [ ] SESSION 8 — Paystack payments integrated
- [ ] SESSION 9 — Visa services page built
- [ ] SESSION 10 — Blog built
- [ ] SESSION 11 — SEO and performance done
- [ ] SESSION 12 — Deployed to Vercel
