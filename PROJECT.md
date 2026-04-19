# ACE Voyages — Project Context File
> Paste this at the TOP of every Claude session before anything else.
> Live site: https://ace-voyages.vercel.app

---

## What We Are Building
A travel agency website for **ACE Voyages**, a Nigerian travel company based in Lagos. The site includes a booking engine, Sanity CMS, Paystack payments, and a 9-workflow automation system built entirely inside our own stack — no Make, no Pipedream, no 360dialog.

---

## Tech Stack

### Website
- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS only — no other CSS libraries
- **Language:** TypeScript throughout — no plain `.js` files
- **CMS:** Sanity.io — all tours, blog, testimonials, visa services live here
- **Deployment:** Vercel

### Database & Backend
- **Database:** Supabase (PostgreSQL) — bookings, leads, newsletter subscribers
- **Automation Engine:** Supabase Edge Functions — runs 24/7 even when laptop is closed
  - ⚠️ Edge Functions run on **Deno**, not Node.js. Use Deno-compatible code only.
- **Scheduler:** Vercel Cron Jobs — triggers daily automation checks at 8am
- **Payments:** Paystack — Nigerian payment gateway
- **Email:** Resend — transactional emails (free: 3,000/month)

### Automation & Intelligence (Custom Stack — Zero External Platforms)
- **WhatsApp:** Meta WhatsApp Cloud API — direct from Meta, free (1,000 conversations/month)
- **AI Layer:** Anthropic Claude API — model `claude-haiku-4-5-20251001` (cheapest, fastest)
  - Used ONLY for: lead classification, personalised follow-up copy, visa document checking
  - NOT used for: confirmations, reminders — those are pure if-then code
- **Images:** next/image with Unsplash URLs until real client photos are provided

---

## Brand
- **Primary:** Deep Blue `#1B3A6B`
- **Accent:** Gold `#D4A017`
- **Background:** `#F8F9FA`
- **Dark text:** `#1A1A2E`
- **Light text:** `#6B7280`
- **Font:** Inter (Google Fonts)
- **Logo:** `/public/images/logo.png`

---

## Business Details
- **Company:** ACE Voyages Ltd
- **Tagline:** Nigeria's Most Trusted Travel Partner
- **Address:** E1-024 HFP Eastline Shopping Complex, Lekki, Lagos
- **WhatsApp:** +234 806 164 0504
- **Email:** hello@acevoyages.net

---

## Folder Structure
```
ace-voyages/
├── src/
│   ├── app/
│   │   ├── page.tsx                     ← Homepage ✅ BUILT
│   │   ├── services/page.tsx            ← Services page ✅ BUILT
│   │   ├── about/page.tsx               ← ❌ 404 — needs building
│   │   ├── blog/page.tsx                ← ❌ 404 — needs building
│   │   ├── blog/[slug]/page.tsx         ← ❌ needs building
│   │   ├── tours/page.tsx               ← ❌ 404 — needs building
│   │   ├── tours/[slug]/page.tsx        ← ❌ needs building
│   │   ├── tours/[slug]/book/page.tsx   ← ❌ needs building
│   │   ├── contact/page.tsx             ← ❌ 404 — needs building
│   │   ├── visa-services/page.tsx       ← ❌ needs building
│   │   └── api/
│   │       ├── leads/create/route.ts    ← ❌ needs building
│   │       ├── bookings/create/route.ts ← ❌ needs building
│   │       ├── paystack/verify/route.ts ← ❌ needs building
│   │       ├── newsletter/route.ts      ← ❌ needs building
│   │       └── cron/daily/route.ts      ← ❌ automation scheduler
│   ├── components/
│   │   ├── ui/                          ← ✅ BUILT (Button, Card, TourCard etc)
│   │   └── layout/                      ← ✅ BUILT (Navbar, Footer)
│   ├── lib/
│   │   ├── supabase/client.ts           ← ❌ needs building
│   │   ├── supabase/server.ts           ← ❌ needs building
│   │   ├── whatsapp.ts                  ← ❌ Meta API helper
│   │   ├── claude.ts                    ← ❌ Claude API helper
│   │   └── email/confirmationEmail.ts   ← ❌ Resend template
│   └── sanity/
│       ├── schemas/                     ← ❌ needs building
│       └── lib/                         ← ❌ client + queries
├── supabase/functions/                  ← ❌ All Edge Functions (automation)
├── sanity.config.ts                     ← ❌ needs building
└── .env.local                           ← ❌ needs updating with new keys
```

---

## How the Automation Works (No External Platform)
```
EVENT                    → TRIGGER                  → WHAT RUNS
─────────────────────────────────────────────────────────────────────────
Lead form submitted      → Supabase DB insert       → Edge Function fires
                                                     → Claude API classifies lead
                                                     → WhatsApp reply to customer (60 sec)
                                                     → WhatsApp alert to agent

Payment received         → Paystack webhook          → Next.js API route
                                                     → Verify payment server-side
                                                     → Save booking to Supabase
                                                     → WhatsApp confirmation sent
                                                     → Resend email receipt

Every day at 8am         → Vercel Cron Job           → Next.js /api/cron/daily
                                                     → Check all leads needing follow-up
                                                     → Check instalment due dates
                                                     → Check visa deadlines
                                                     → Check trip return dates (reviews)
                                                     → Check seasonal campaign windows
                                                     → Fire WhatsApp messages for each
```

---

## Claude Must Always Follow These Rules
- TypeScript only — never `.js` files
- Tailwind CSS only — never write custom CSS
- Next.js App Router only — use `page.tsx`, `layout.tsx`, `route.ts`
- Use `cn()` from `/src/lib/utils.ts` for combining Tailwind classes
- Use `next/image` — never a plain `<img>` tag
- Mobile-first — build for 375px, then scale up
- Prices always in ₦ (Naira), phones in +234 format
- Supabase Edge Functions use Deno runtime — never use Node-only npm packages inside them
- WhatsApp is the primary contact channel — always include WhatsApp CTAs
- Do not rebuild what is already built — add to it, don't replace it

---

## Build Status
> Update this as you complete each session

### DONE — Do not touch these
- [x] Homepage (hero, partners, services, tours, why us, testimonials, FAQ, newsletter UI)
- [x] Services page
- [x] Navbar + Footer
- [x] UI component library

### TO BUILD — Work through these in order
- [ ] SESSION A — Sanity CMS schemas + connect to existing homepage/services content
- [ ] SESSION B — Missing pages: /tours listing, /about, /contact
- [ ] SESSION C — Tour detail page + 3-step booking form
- [ ] SESSION D — Supabase database + API routes
- [ ] SESSION E — Paystack payment integration
- [ ] SESSION F — Blog (CMS-driven)
- [ ] SESSION G — Visa services dedicated page
- [ ] SESSION H — Meta WhatsApp Cloud API setup + helper
- [ ] SESSION I — Phase 1 Automation (lead response, booking confirmation, instalment reminders)
- [ ] SESSION J — Phase 2 Automation (follow-ups, upsells, visa tracker, abandoned booking)
- [ ] SESSION K — Phase 3 Automation (review engine, seasonal campaigns)
- [ ] SESSION L — Claude API intelligence layer
- [ ] SESSION M — SEO + performance
- [ ] SESSION N — Final deploy + custom domain
