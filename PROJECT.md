# ACE Voyages — Master Project Document
> Paste this at the TOP of every Claude session. Every single one. No exceptions.
> Live site: https://ace-voyages.vercel.app
> Built by: MADigitals | Maintained on retainer

---

## THE ARCHITECTURE PRINCIPLE

One database. One admin panel. One login. Everything in one place.

This is not a website with tools bolted on. It is a unified product:
public site, booking engine, flight and hotel search, 11-workflow
automation system, ad management, and a full role-based admin panel —
all running on a single stack, a single database, a single source of truth.

The client logs into /admin with their email and password. From there
they control everything. They never touch Supabase directly. They never
use a third-party CMS. They never log into two systems.

This is what a product company builds.

---

## TECH STACK

### Public Site
- Framework:    Next.js 14 App Router
- Language:     TypeScript only — never .js files
- Styling:      Tailwind CSS only — never custom CSS files
- Deployment:   Vercel
- Live URL:     https://ace-voyages.vercel.app

### Database & Backend (Single Source of Truth)
- Database:     Supabase (PostgreSQL)
- Edge Fns:     Supabase Edge Functions (Deno runtime — NOT Node.js)
- Realtime:     Supabase Realtime (admin notifications)
- Auth:         Supabase Auth (admin panel + customer portal magic links)
- Scheduler:    Vercel Cron Jobs (daily at 8am WAT = 3am UTC)

### Payments & Commerce
- Payments:     Paystack (Nigerian gateway, webhook sig verification required)
- Flights:      Duffel API (search + price display only — no direct ticketing)
- Hotels:       Duffel Stays API (search + price display only)
- Promos:       Custom promo code system (built in Supabase)

### Messaging & Email
- WhatsApp:     Meta WhatsApp Cloud API (direct from Meta, free to 1,000 convs/month)
- Email:        Resend (transactional, 3,000/month free)
- Inbound WA:   Meta Webhook (handles customer replies, routes to agents)

### Media
- Images/Video: Cloudinary (direct browser upload — no server round-trip)
- Upload UX:    Drag-and-drop in admin panel (no manual URL copying)

### Intelligence Layer
- AI:           Anthropic Claude API — model: claude-haiku-4-5-20251001
  Used for:     Lead classification, personalised follow-up copy,
                visa document gap checking
  NOT used for: Confirmations, reminders, simple logic — those are code

### Security & Infrastructure
- Rate Limiting: Upstash Redis (@upstash/ratelimit @upstash/redis)
- CAPTCHA:       Cloudflare Turnstile (on all public forms)
- Monitoring:    Sentry (errors on Next.js + Edge Functions)
- Env Validation: startup check — fails loudly if vars missing
- Exchange Rate: open.er-api.com (free, auto-updates daily via cron)

### Admin Panel Tools
- Charts:        Recharts (KPI dashboard)
- Blog Editor:   TipTap (@tiptap/react @tiptap/starter-kit + extensions)
- PDF Reports:   @react-pdf/renderer (monthly report export)
- 2FA:           Supabase Auth TOTP (Google Authenticator compatible)

### SEO & Performance
- Sitemap:       Dynamic (tours + blog + static pages)
- Structured Data: JSON-LD (Organization, TouristTrip, Article schemas)
- Images:        next/image with priority, sizes, WebP via Cloudinary

---

## BRAND

- Primary Blue:   #1B3A6B
- Gold Accent:    #D4A017
- Background:     #F8F9FA
- Dark Text:      #1A1A2E
- Light Text:     #6B7280
- Success Green:  #166534
- Font:           Inter (Google Fonts)
- Logo:           /public/images/logo.png

---

## BUSINESS DETAILS

- Company:   ACE Voyages Ltd
- Tagline:   Nigeria's Most Trusted Travel Partner
- Address:   E1-024 HFP Eastline Shopping Complex, Lekki, Lagos
- WhatsApp:  +234 806 164 0504
- Email:     hello@acevoyages.net
- Domain:    acevoyages.net

### Services
1. Flight Booking (Local & International via Duffel search)
2. Hotel Search (via Duffel Stays)
3. Visa Assistance (UK, Canada, UAE, Schengen, Kenya + more)
4. Tour Packages (Cairo, Dubai, Zanzibar, Mauritius, Cape Town, UK)
5. Hotel Reservations (human-assisted)
6. Corporate Travel
7. Honeymoon & Anniversary Packages

---

## COMPLETE DATABASE SCHEMA

All tables live in Supabase. This is the single source of truth.
No Sanity. No external CMS. Everything is here.

### CONTENT TABLES (managed via admin panel)

```
tours
  tour_id            uuid PK default gen_random_uuid()
  title              text NOT NULL
  slug               text UNIQUE NOT NULL
  destination_city   text NOT NULL
  destination_country text NOT NULL
  price_naira        numeric NOT NULL
  duration_days      integer NOT NULL
  max_guests         integer NOT NULL default 12
  hero_image_url     text
  gallery_urls       text[]
  short_description  text
  full_description   text
  whats_included     text[]
  highlights         text[]
  category           text CHECK IN (leisure|honeymoon|corporate|adventure)
  is_featured        boolean default false
  is_active          boolean default true
  search_vector      tsvector  ← full-text search
  created_at         timestamptz default now()
  updated_at         timestamptz default now()

tour_departures                    ← date-based capacity management
  departure_id       uuid PK
  tour_id            uuid FK → tours
  departure_date     date NOT NULL
  max_guests         integer NOT NULL
  guests_booked      integer default 0  ← auto-updated by trigger
  status             text CHECK IN (open|limited|full|cancelled)
  price_override     numeric  ← null = use tours.price_naira
  notes              text
  UNIQUE(tour_id, departure_date)

blog_posts
  post_id            uuid PK
  title              text NOT NULL
  slug               text UNIQUE NOT NULL
  excerpt            text
  hero_image_url     text
  body_json          jsonb   ← TipTap editor output
  body_text          text    ← plain text for search
  category           text CHECK IN (visa-tips|travel-guides|destination-spotlight|packing-tips)
  is_published       boolean default false
  is_featured        boolean default false
  published_at       timestamptz
  search_vector      tsvector
  created_at         timestamptz default now()
  updated_at         timestamptz default now()

testimonials
  testimonial_id     uuid PK
  customer_name      text NOT NULL
  customer_city      text NOT NULL
  customer_photo_url text
  quote              text NOT NULL
  star_rating        integer CHECK 1-5
  tour_booked        text
  is_approved        boolean default false
  is_rejected        boolean default false
  source             text CHECK IN (whatsapp|google|form|manual)
  created_at         timestamptz default now()

visa_services
  service_id         uuid PK
  country_name       text NOT NULL
  country_flag_url   text
  visa_type          text
  processing_time    text
  price_naira        numeric
  requirements       text[]
  success_rate       integer  ← percentage
  is_active          boolean default true
  sort_order         integer default 0
  updated_at         timestamptz default now()

ads
  ad_id              uuid PK
  title              text NOT NULL  ← internal name only
  headline           text
  body_text          text
  cta_text           text
  cta_url            text
  media_type         text CHECK IN (image|video|none)
  media_url          text
  media_alt_text     text
  placement          text CHECK IN (hero_banner|homepage_inline|tours_sidebar|
                                    blog_inline|blog_sidebar|visa_page_banner|popup)
  background_color   text default '#1B3A6B'
  text_color         text default '#FFFFFF'
  is_active          boolean default false
  starts_at          timestamptz  ← null = no restriction
  ends_at            timestamptz  ← null = no restriction
  priority           integer default 0
  target_device      text default 'all' CHECK IN (all|mobile|desktop)
  click_count        integer default 0
  impression_count   integer default 0
  advertiser_name    text default 'ACE Voyages'
  is_paid            boolean default false
  created_at         timestamptz default now()
  updated_at         timestamptz default now()
```

### AD PLACEMENT SIZES (for client reference)
```
hero_banner:      1200 × 500px  ← homepage rotating slide
homepage_inline:  1200 × 400px  ← between homepage sections
tours_sidebar:    400 × 600px   ← tours listing right column
blog_inline:      800 × 300px   ← inside blog post after 3rd paragraph
blog_sidebar:     400 × 600px   ← blog right column
visa_page_banner: 1200 × 250px  ← below visa page hero
popup:            600 × 500px   ← site-wide, once per session
```

### OPERATIONAL TABLES

```
bookings
  booking_id           uuid PK
  booking_reference    text UNIQUE  ← ACE-YYYY-XXXX format
  customer_name        text NOT NULL
  customer_email       text NOT NULL
  customer_phone       text NOT NULL
  customer_whatsapp    text
  tour_slug            text
  tour_name            text NOT NULL
  travel_date          date NOT NULL
  return_date          date  ← calculated: travel_date + duration
  adults               integer NOT NULL default 1
  children             integer default 0
  total_price          numeric NOT NULL
  promo_code_id        uuid FK → promo_codes  ← if discount applied
  discount_applied     numeric default 0
  currency             text default 'NGN'
  special_requests     text
  status               text default 'pending' CHECK IN (pending|confirmed|cancelled)
  payment_reference    text
  payment_status       text default 'unpaid' CHECK IN (unpaid|paid|partial|refunded)
  refund_amount        numeric
  refund_date          timestamptz
  refund_reference     text
  refund_reason        text
  refund_status        text default 'none' CHECK IN (none|requested|processing|completed|denied)
  upsell_offered       boolean default false
  review_requested     boolean default false
  pre_departure_7_sent boolean default false
  pre_departure_1_sent boolean default false
  created_at           timestamptz default now()

booking_drafts                     ← failed payment recovery
  draft_id           uuid PK
  customer_name      text
  customer_email     text
  customer_phone     text
  customer_whatsapp  text
  tour_slug          text
  tour_name          text
  travel_date        date
  adults             integer
  children           integer
  total_price        numeric
  special_requests   text
  payment_attempts   integer default 0
  last_attempt       timestamptz
  recovered          boolean default false
  recovery_sent      boolean default false
  created_at         timestamptz default now()
  expires_at         timestamptz default now() + interval '48 hours'

leads
  lead_id              uuid PK
  customer_name        text NOT NULL
  customer_email       text
  customer_phone       text NOT NULL
  customer_whatsapp    text
  service_interest     text
  destination_interest text
  message              text
  source_page          text
  lead_status          text default 'new' CHECK IN (new|contacted|converted|cold)
  lead_category        text  ← set by Claude AI
  assigned_to          uuid FK → admin_users
  assigned_at          timestamptz
  follow_up_count      integer default 0
  last_follow_up       timestamptz
  next_follow_up       timestamptz
  notes                text
  created_at           timestamptz default now()

visa_applications
  application_id       uuid PK
  customer_name        text NOT NULL
  customer_phone       text NOT NULL
  destination_country  text NOT NULL
  visa_type            text
  submission_deadline  date
  interview_date       date
  expected_decision_date date
  status               text default 'in-progress' CHECK IN
                       (in-progress|submitted|interview-scheduled|
                        approved|rejected|withdrawn)
  booking_id           uuid FK → bookings
  assigned_to          uuid FK → admin_users
  notes                text
  created_at           timestamptz default now()

visa_documents                     ← document upload system
  document_id        uuid PK
  application_id     uuid FK → visa_applications
  lead_id            uuid FK → leads
  document_type      text CHECK IN (passport_bio|bank_statement|employment_letter|
                                    photo|travel_insurance|hotel_booking|
                                    flight_itinerary|business_registration|other)
  file_url           text NOT NULL  ← Cloudinary secure URL
  file_name          text
  file_size_kb       integer
  uploaded_by        text CHECK IN (customer|agent)
  reviewed           boolean default false
  notes              text
  created_at         timestamptz default now()

waitlist                           ← for fully booked tour dates
  waitlist_id        uuid PK
  tour_id            uuid FK → tours
  departure_date     date
  customer_name      text
  customer_phone     text
  customer_whatsapp  text
  adults             integer
  notified           boolean default false
  created_at         timestamptz default now()

whatsapp_log
  log_id             uuid PK
  phone_number       text NOT NULL
  customer_name      text
  message_type       text  ← see workflow list below
  message_body       text
  direction          text CHECK IN (inbound|outbound)
  status             text
  related_booking_id uuid FK → bookings
  related_lead_id    uuid FK → leads
  sent_at            timestamptz default now()

whatsapp_opt_outs                  ← for broadcast exclusions
  phone_number       text PK
  opted_out_at       timestamptz default now()

newsletter_subscribers
  subscriber_id      uuid PK
  email              text UNIQUE NOT NULL
  subscribed_at      timestamptz default now()
  active             boolean default true

promo_codes
  code_id            uuid PK
  code               text UNIQUE NOT NULL
  description        text
  discount_type      text CHECK IN (percentage|fixed)
  discount_value     numeric NOT NULL
  minimum_order      numeric
  max_uses           integer
  times_used         integer default 0
  valid_from         timestamptz default now()
  valid_until        timestamptz
  applicable_to      text default 'all' CHECK IN (all|tours|visa|flights)
  created_by         uuid FK → admin_users
  is_active          boolean default true
  created_at         timestamptz default now()

promo_code_uses
  use_id             uuid PK
  code_id            uuid FK → promo_codes
  booking_id         uuid FK → bookings
  customer_email     text
  discount_applied   numeric
  used_at            timestamptz default now()

upload_tokens                      ← secure one-time visa doc upload links
  token_hash         text PK  ← store hash, send raw token
  application_id     uuid FK → visa_applications
  created_at         timestamptz default now()
  expires_at         timestamptz
  used               boolean default false

customer_access_tokens             ← customer portal magic links
  token_hash         text PK
  customer_email     text NOT NULL
  created_at         timestamptz default now()
  expires_at         timestamptz
  used               boolean default false

site_settings
  key                text PK
  value              text NOT NULL
  updated_at         timestamptz default now()
```

### DEFAULT SITE_SETTINGS ROWS
```
naira_rate                 → '1600' (auto-updated daily by cron)
gbp_to_ngn_rate            → '2050' (auto-updated daily)
christmas_campaign_active  → 'true'
eid_campaign_active        → 'true'
easter_campaign_active     → 'true'
summer_campaign_active     → 'true'
school_holiday_campaign_active → 'true'
next_eid_date              → '2025-03-30'
admin_session_timeout_mins → '30'
```

### ADMIN RBAC TABLES

```
admin_users
  user_id        uuid PK REFERENCES auth.users ON DELETE CASCADE
  role           text NOT NULL CHECK IN (super_admin|manager_admin|agent_admin)
  full_name      text NOT NULL
  phone          text
  avatar_color   text default '#1B3A6B'
  is_active      boolean default true
  created_by     uuid FK → admin_users
  mfa_enrolled   boolean default false
  last_login     timestamptz
  created_at     timestamptz default now()

kpi_targets
  key              text PK
  label            text NOT NULL
  target_value     numeric NOT NULL
  unit             text CHECK IN (currency|percentage|count|hours)
  period           text default 'monthly'
  green_threshold  numeric NOT NULL  ← % of target = green
  amber_threshold  numeric NOT NULL  ← % of target = amber (below = red)
  updated_by       uuid FK → admin_users
  updated_at       timestamptz default now()

activity_log
  log_id         uuid PK
  admin_user_id  uuid FK → admin_users
  admin_name     text
  action         text NOT NULL
  entity_type    text  ← booking|lead|tour|blog|ad|user|visa|review
  entity_id      text
  entity_label   text  ← human readable: "Booking ACE-2025-1234"
  details        jsonb
  ip_address     text
  created_at     timestamptz default now()
```

### KEY DATABASE FUNCTIONS
```sql
-- Auto-deactivate expired ads (called by daily cron)
deactivate_expired_ads() → void

-- Auto-update tour departure availability (trigger)
update_departure_availability() → trigger

-- Generate booking reference
generate_booking_reference() → text  (returns ACE-YYYY-XXXX)

-- Full-text search triggers on tours and blog_posts
update_tours_search() → trigger
update_blog_search() → trigger
```

---

## ADMIN PANEL — ROLE-BASED ACCESS CONTROL

### The Three Roles

**SuperAdmin** — The owner. Full access to everything.
- Sees full KPI dashboard with all business metrics
- Sets KPI targets
- Creates all user types
- Accesses system settings and audit log
- Views all agent performance
- Runs manual broadcasts
- Downloads monthly reports
- Manages 2FA requirements

**ManagerAdmin** — Team lead / operations manager.
- Sees team operations dashboard (no full financials)
- Assigns and reassigns leads between agents
- Approves content (blog posts, testimonials)
- Manages ads
- Creates AgentAdmin accounts
- Deactivates AgentAdmin accounts
- Cannot touch SuperAdmin or ManagerAdmin accounts
- Cannot see system settings or KPI targets

**AgentAdmin** — Staff member.
- Sees only their own performance dashboard
- Sees only leads assigned to them
- Sees only bookings related to their leads
- Can write blog drafts (cannot publish)
- Can update their own lead and visa statuses
- Cannot see other agents' data
- Cannot access ads, broadcasts, subscribers, or settings

### Access Matrix (Key Features)

```
Feature                          SuperAdmin   Manager   Agent
────────────────────────────────────────────────────────────
Full KPI dashboard               ✅           ❌        ❌
Team performance view            ✅           ✅        ❌
Own performance dashboard        ✅           ✅        ✅
All revenue data                 ✅           Team      Own only
Set KPI targets                  ✅           ❌        ❌
All bookings                     ✅           ✅        Assigned
Cancel booking                   ✅           ✅        ❌
All leads                        ✅           ✅        Assigned
Assign leads                     ✅           ✅        ❌
All visa applications            ✅           ✅        Assigned
Create / edit tours              ✅           ✅        ❌
Write blog drafts                ✅           ✅        ✅
Publish blog posts               ✅           ✅        ❌
Approve reviews                  ✅           ✅        ❌
Manage ads                       ✅           ✅        ❌
WhatsApp broadcast               ✅           ✅        ❌
View all WhatsApp log            ✅           ✅        Own contacts
View subscribers                 ✅           ✅        ❌
System settings                  ✅           ❌        ❌
Campaign toggles                 ✅           ✅        ❌
Create SuperAdmin                ✅           ❌        ❌
Create ManagerAdmin              ✅           ❌        ❌
Create AgentAdmin                ✅           ✅        ❌
Audit log                        ✅           ❌        ❌
Export reports                   ✅           ✅        ❌
```

### RBAC Enforcement — Three Layers
1. **Middleware**: reads role from Supabase session cookie, blocks routes
2. **API routes**: every /api/admin/* verifies session + role before acting
3. **UI**: RoleGate component — doesn't hide, doesn't render unauthorised elements

### Security Rules for Roles
- User cannot change their own role
- Agent queries always filtered by assigned_to in both RLS and SQL
- Deactivation immediately disables Supabase Auth account (server-side)
- Every state change logged to activity_log
- Temporary passwords forced to change on first login

---

## SUPERDAMIN KPI FRAMEWORK

7 categories, all with RAG status (Red/Amber/Green vs target).

### Revenue KPIs
- Monthly Revenue vs Target
- Month-on-Month Growth
- Average Booking Value
- Revenue by Category (Leisure / Honeymoon / Corporate / Adventure)
- Revenue by Agent (bar chart)
- Revenue Forecast (projected month-end at current pace)

### Leads & Conversion KPIs
- Lead Conversion Rate (target: > 25%)
- Average Lead Response Time (target: < 1 hour)
- Leads by Source (per source_page)
- Leads by Category (visa / tour / flight / hotel)
- Follow-up Completion Rate (target: > 90%)
- Cold Lead Rate (target: < 40%)

### Bookings KPIs
- Monthly Bookings vs Target
- Booking Completion Rate (form started → paid, target: > 40%)
- Cancellation Rate (target: < 10%)
- Instalment Default Rate (target: < 15%)
- Top 5 Tours by Bookings
- Failed Payment Recovery Rate

### Customer & Brand KPIs
- Average Star Rating (target: ≥ 4.5)
- Review Rate (target: > 30% of completed trips)
- Repeat Customer Rate
- Google Reviews Sent This Month

### Visa KPIs
- Active Applications Count
- Visa Success Rate (target: ≥ 95%)
- Applications Pending > 30 Days (target: 0)
- By Destination Breakdown

### Automation Health KPIs
- WhatsApp Messages Sent This Month
- Each of 11 workflows: messages sent + health status (green if active in last 7 days)
- Upsell Response Rate
- Best Performing Ad (CTR)
- Seasonal Campaign Reach

### Agent Performance KPIs (per agent)
- Leads Handled This Month
- Leads Converted
- Conversion Rate % (RAG: > 25% green, 15-25% amber, < 15% red)
- Average Response Time (RAG: < 1hr green, 1-2hr amber, > 2hr red)
- Revenue Attributed
- Open Leads with No Update > 24hrs (target: 0)

---

## THE 11 AUTOMATION WORKFLOWS

All run server-side. No external platform. No Make. No Pipedream.
Supabase Edge Functions handle event-driven. Vercel Cron handles scheduled.

### TRIGGER ARCHITECTURE
```
Form submitted         → Supabase DB insert webhook → Edge Function
Payment confirmed      → Paystack webhook (sig verified) → Next.js API route → Edge Function
Daily 8am WAT (3am UTC) → Vercel Cron → /api/cron/daily
```

### PHASE 1 — REVENUE PROTECTION

**Workflow 1: Lead Instant Response** (Edge Function — fires on INSERT to leads)
- Claude API classifies lead category (visa/tour/flight/hotel/corporate/other)
- WhatsApp template to customer within 60 seconds: lead_acknowledgement
- WhatsApp text to agent with full lead details + AI category
- Sets next_follow_up = now + 24 hours

**Workflow 2: Booking Confirmation Engine** (Edge Function — fires on booking INSERT with payment_status=paid)
- WhatsApp template to customer: booking_confirmation (name, reference, tour, date, amount)
- WhatsApp text to agent: booking confirmed alert
- Logs both to whatsapp_log

**Workflow 3: Instalment Payment Reminders** (Daily cron)
- Finds bookings: status=confirmed, payment_status=partial
- 5 days before due: WhatsApp with embedded Paystack payment link
- 1 day before: second reminder
- Day of (if unpaid): final reminder
- If overdue: agent flagged

### PHASE 2 — REVENUE GROWTH

**Workflow 4: Lead Follow-Up Sequence** (Daily cron)
- follow_up_count=0 → 24hrs: Claude generates personalised message, else template follow_up_1
- follow_up_count=1 → 3 days: template follow_up_2
- follow_up_count=2 → 4 days: template follow_up_final → status=cold

**Workflow 5: Upsell Trigger** (Daily cron)
- Confirmed bookings, upsell_offered=false, created 20-28hrs ago
- Visa-required destinations → template upsell_visa
- 14 days before departure → WhatsApp offering airport transfer + travel insurance
- Sets upsell_offered=true

**Workflow 6: Visa Application Tracker** (Daily cron)
- Interview in 7 days → agent WhatsApp alert
- Interview in 3 days → customer WhatsApp briefing
- Interview today → customer "Good luck" message
- Decision date passed with no update → agent flagged to chase

**Workflow 7: Abandoned Booking Recovery** (Daily cron)
- Leads with source_page containing 'book', status=new, follow_up=0, created 4-28hrs ago
- These are customers who started booking form (details captured at Step 2) but didn't pay
- booking_drafts table: sends recovery WhatsApp with resume-booking link
- Sets recovered=true

### PHASE 3 — BRAND BUILDING

**Workflow 8: Post-Trip Review Engine** (Daily cron)
- Bookings: confirmed, paid, review_requested=false, return_date 3-4 days ago
- Template review_request with Google review link
- Sets review_requested=true

**Workflow 9: Seasonal Campaign** (Daily cron)
- Checks Nigerian holiday calendar against site_settings toggles
- Triggers: Christmas (Dec 1), Eid (6wks before next_eid_date), Easter (6wks before),
  Summer (Jun 1), School Holiday (Sep 1)
- Sends to all past customers not messaged in last 30 days (whatsapp_log check)
- Excludes whatsapp_opt_outs
- Batches at 50/second to respect Meta rate limits

### NEW — PRE-DEPARTURE JOURNEYS

**Workflow 10: 7-Day Pre-Departure Briefing** (Daily cron)
- Bookings with travel_date = today + 7, pre_departure_7_sent=false
- WhatsApp with destination checklist, document reminders, emergency contact
- Sets pre_departure_7_sent=true

**Workflow 11: Day-Before Final Reminder** (Daily cron)
- Bookings with travel_date = tomorrow, pre_departure_1_sent=false
- WhatsApp with airport arrival time, document reminder, 24hr emergency line
- Sets pre_departure_1_sent=true

### ALWAYS RUNS FIRST IN DAILY CRON
```
deactivate_expired_ads()        ← Supabase RPC
update naira_rate               ← from open.er-api.com
update gbp_to_ngn_rate          ← calculated from same response
booking_drafts recovery check   ← abandoned payment recovery
SuperAdmin daily email digest   ← Resend email to SuperAdmins (Mon-Sat)
```

### INBOUND WHATSAPP HANDLER
Route: /src/app/api/whatsapp/webhook/route.ts
- GET: verify webhook with WHATSAPP_VERIFY_TOKEN
- POST: receives customer replies
  - "yes/yes i want to book" → update lead status, alert assigned agent
  - "cancel/refund" → urgent agent alert flagged in admin
  - "stop" → add to whatsapp_opt_outs
  - All others → forward to assigned agent's WhatsApp with customer context
- Always logs to whatsapp_log as inbound
- Marks messages as read (shows double blue tick)

### WHATSAPP MESSAGE TYPES (for whatsapp_log)
```
lead_acknowledgement    booking_confirmation    instalment_reminder
follow_up_1             follow_up_2             follow_up_final
upsell_visa             upsell_transfer         review_request
seasonal_campaign       pre_departure_7         pre_departure_1
inbound_reply           manual_broadcast        agent_alert
failed_payment_recovery visa_interview_reminder lead_assignment_notify
```

---

## SECURITY ARCHITECTURE

### Paystack Webhook Verification
```typescript
// MUST read raw body as text before parsing
// Compute HMAC-SHA512 hash of raw body using PAYSTACK_SECRET_KEY
// Compare with x-paystack-signature header
// Reject 401 if mismatch
```

### Rate Limiting (Upstash Redis)
```
/api/flights/search    → 10 requests / 1 minute / IP
/api/hotels/search     → 10 requests / 1 minute / IP
/api/leads/create      → 5 requests / 10 minutes / IP
/api/newsletter        → 3 requests / 1 hour / IP
/api/bookings/create   → 3 requests / 10 minutes / IP
```

### CAPTCHA (Cloudflare Turnstile)
Applied to: contact form, visa enquiry form, newsletter,
booking Step 2. Server-side verification on every protected API route.

### Admin Security
- 2FA: TOTP required for SuperAdmin, recommended for Manager
- Session timeout: 30 minutes of inactivity (configurable in site_settings)
- Forced password change on first login (if last_login is null)
- Password change available in /admin/settings/password
- All admin API routes: verify session + role before acting
- Activity log: every state change records user, action, entity, timestamp

### Environment Variable Validation
- /src/instrumentation.ts validates all required vars at startup
- App fails loudly with clear error listing missing vars
- Never silently fails at runtime

### Email Deliverability (DNS)
```
SPF:   TXT @ → v=spf1 include:amazonses.com ~all
DKIM:  CNAME resend._domainkey → [Resend generated value]
DMARC: TXT _dmarc → v=DMARC1; p=quarantine; rua=mailto:hello@acevoyages.net
```

---

## PUBLIC PAGES

```
/                           ← Homepage with FlightSearchWidget
/services                   ← Services overview
/tours                      ← Tour listing with filters + social proof
/tours/[slug]               ← Tour detail with availability calendar
/tours/[slug]/book          ← 3-step booking form (promo codes supported)
/blog                       ← Blog listing with featured post
/blog/[slug]                ← Blog post with TipTap renderer
/about                      ← About page
/contact                    ← Contact + lead capture form
/visa-services              ← Dedicated visa page
/booking-confirmation/[id]  ← Post-payment confirmation
/resume-booking/[draftId]   ← Failed payment recovery
/my-bookings                ← Customer portal (magic link login)
/my-bookings/view           ← Customer's booking list (token-authenticated)
/documents/upload           ← Visa document upload (token-authenticated)
/search                     ← Full-text search results
/destinations/[slug]        ← Destination guide pages (SEO)
/privacy                    ← Privacy Policy
/terms                      ← Terms of Service
/cookie-policy              ← Cookie Policy
```

### Ad Slot Placement (AdSlot component)
```
/ (homepage)           → homepage_inline (between sections)
/tours                 → tours_sidebar (right column desktop)
/blog/[slug]           → blog_inline (after 3rd paragraph) + blog_sidebar
/blog                  → blog_sidebar
/visa-services         → visa_page_banner (below hero)
All pages (via layout) → popup (PopupAd — once per session, 5s delay)
```

---

## ADMIN PANEL SECTIONS

All protected by middleware. Role gates applied throughout.

```
/admin/login               ← Auth page
/admin/dashboard           ← Role-based view (SuperAdmin/Manager/Agent)
/admin/bookings            ← All bookings management + refund workflow
/admin/leads               ← All leads + assignment + import CSV
/admin/visa                ← Visa application tracking
/admin/tours               ← Tour management + departure calendar
/admin/tours/new           ← Add new tour (with direct image upload)
/admin/tours/[id]/edit     ← Edit tour
/admin/blog                ← Blog posts list
/admin/blog/new            ← TipTap blog editor
/admin/blog/[id]/edit      ← Edit blog post
/admin/reviews             ← Pending and approved testimonials
/admin/visa-services       ← Destination visa info management
/admin/ads                 ← Full ad manager
/admin/ads/new             ← Create ad (image/video/color, scheduling)
/admin/ads/[id]/edit       ← Edit ad
/admin/whatsapp            ← WhatsApp log (read only)
/admin/whatsapp/broadcast  ← Manual broadcast tool (with safety gates)
/admin/subscribers         ← Newsletter list + CSV export
/admin/team                ← Team management (RBAC)
/admin/team/new            ← Create team member
/admin/team/[id]           ← Agent performance detail
/admin/reports             ← Monthly PDF report export
/admin/settings            ← Settings hub
/admin/settings/kpis       ← KPI targets (SuperAdmin only)
/admin/settings/security   ← 2FA setup + session timeout config
/admin/settings/password   ← Change own password
/admin/settings/audit-log  ← Full activity log (SuperAdmin only)
```

---

## FLIGHT & HOTEL SEARCH WIDGET

Uses Duffel API. Search and display only — no direct ticketing.

### Flight Widget (Flights tab)
- Airport type-ahead: /api/flights/airports (Duffel places/suggestions)
- Flight search: /api/flights/search (Duffel offer_requests → offers)
- Results show: airline, route, times, duration, stops, price in ₦
- Price converted from USD using live naira_rate from site_settings
- "Send to WhatsApp" → pre-filled wa.me message to agent
- "Book with Agent" → saves to leads table + shows toast

### Hotel Search (Hotels tab)
- City search via Duffel geocoding
- Hotel search: /api/hotels/search (Duffel stays API)
- Results show: hotel name, stars, price/night in ₦, photos
- Same "Send to WhatsApp" / "Book with Agent" pattern

### Visas tab → navigates to /visa-services

### Duffel Critical Notes
- Duffel-Version: v2 header required on EVERY request
- Test mode: only LHR→JFK (Duffel Airways) returns results
- Nigerian routes (LOS, ABV) work in live mode only
- Never call Duffel from browser — always server-side

---

## PROMO CODE SYSTEM

- Admin creates codes in /admin/ads section (or dedicated section)
- Codes: percentage or fixed ₦ discount
- Configurable: min order, max uses, expiry, applicable service
- Applied at booking Step 3 before Paystack opens
- Usage tracked in promo_code_uses table
- Admin sees: code usage count, total discount given, conversion rate

---

## CUSTOMER PORTAL

Route: /my-bookings
- Customer enters email → receives magic link (6-hour expiry)
- No password, no Supabase Auth account needed
- Sees: all bookings for their email (reference, tour, date, status, payment)
- Can: view details, download receipt (HTML→PDF), contact agent via WhatsApp
- Token stored as hash — raw token sent via Resend email only

---

## VISA DOCUMENT UPLOAD

- Agent creates visa application → clicks "Send Upload Link"
- System generates token → stores hash → sends raw token to customer via WhatsApp
- Customer visits /documents/upload?token=[raw_token]
- Token validated (not expired, not used) → shows upload form
- Customer uploads by category (passport, bank statement, photos, etc.)
- Files upload directly to Cloudinary from browser (no server round-trip)
- Records saved to visa_documents table
- Agent sees all documents in visa application detail view in admin

---

## SEARCH SYSTEM

PostgreSQL full-text search — no external service.
```sql
-- GIN indexes on search_vector columns
-- tsvector on: tours (title, destination, description, highlights)
-- tsvector on: blog_posts (title, excerpt, body_text)
-- API: /api/search?q=[term]
-- Returns: { tours: [...], posts: [...] }
```
Search bar in Navbar → desktop: expands on focus → mobile: full-screen overlay

---

## MONITORING & RELIABILITY

### Error Monitoring (Sentry)
- Integrated in Next.js instrumentation.ts and all Edge Functions
- Alerts to hello@acevoyages.net on:
  - Any cron handler error
  - WhatsApp send failure × 3
  - Paystack webhook signature failure
  - Booking creation failure post-payment

### Exchange Rate Auto-Update
- Daily cron fetches USD/NGN and GBP/NGN from open.er-api.com
- Updates site_settings naira_rate and gbp_to_ngn_rate
- Admin Settings shows current rate + last updated timestamp
- Admin can manually refresh or override

### Admin In-App Notifications (Supabase Realtime)
- NotificationBell component in admin top bar
- Subscribes to: leads INSERT, bookings UPDATE (payment_status→paid)
- Shows unread count badge
- Dropdown list of last 10 notifications
- Browser notification if permission granted (requested on first login)
- Agents only see notifications for their assigned_to leads

### SuperAdmin Daily Email Digest (Mon–Sat via Resend)
- Sent to all active SuperAdmin email addresses
- Yesterday's: new leads, new bookings, revenue, open alerts
- Month-to-date progress vs KPI targets
- Link to admin panel

### Monthly Report Export
- /api/admin/reports/monthly?month=2025-06
- Generates PDF using @react-pdf/renderer
- Includes: executive summary, revenue breakdown, top tours,
  agent performance table, visa success rate, automation performance,
  full booking list appendix

---

## FOLDER STRUCTURE

```
ace-voyages/
├── src/
│   ├── app/
│   │   ├── page.tsx                          ✅ BUILT
│   │   ├── services/page.tsx                 ✅ BUILT
│   │   ├── about/page.tsx                    ❌ 404
│   │   ├── tours/page.tsx                    ❌ 404
│   │   ├── tours/[slug]/page.tsx             ❌
│   │   ├── tours/[slug]/book/page.tsx        ❌
│   │   ├── blog/page.tsx                     ❌ 404
│   │   ├── blog/[slug]/page.tsx              ❌ 404
│   │   ├── contact/page.tsx                  ❌ 404
│   │   ├── visa-services/page.tsx            ❌
│   │   ├── booking-confirmation/[id]/page.tsx ❌
│   │   ├── resume-booking/[draftId]/page.tsx ❌
│   │   ├── my-bookings/page.tsx              ❌
│   │   ├── my-bookings/view/page.tsx         ❌
│   │   ├── documents/upload/page.tsx         ❌
│   │   ├── search/page.tsx                   ❌
│   │   ├── destinations/[slug]/page.tsx      ❌
│   │   ├── privacy/page.tsx                  ❌ (footer links = 404)
│   │   ├── terms/page.tsx                    ❌ (footer links = 404)
│   │   ├── cookie-policy/page.tsx            ❌
│   │   ├── admin/                            ❌ (entire admin panel)
│   │   │   ├── login/page.tsx
│   │   │   ├── layout.tsx
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── bookings/page.tsx
│   │   │   ├── leads/page.tsx
│   │   │   ├── leads/import/page.tsx
│   │   │   ├── visa/page.tsx
│   │   │   ├── tours/page.tsx
│   │   │   ├── tours/new/page.tsx
│   │   │   ├── tours/[id]/edit/page.tsx
│   │   │   ├── blog/page.tsx
│   │   │   ├── blog/new/page.tsx
│   │   │   ├── blog/[id]/edit/page.tsx
│   │   │   ├── reviews/page.tsx
│   │   │   ├── visa-services/page.tsx
│   │   │   ├── ads/page.tsx
│   │   │   ├── ads/new/page.tsx
│   │   │   ├── ads/[id]/edit/page.tsx
│   │   │   ├── whatsapp/page.tsx
│   │   │   ├── whatsapp/broadcast/page.tsx
│   │   │   ├── subscribers/page.tsx
│   │   │   ├── team/page.tsx
│   │   │   ├── team/new/page.tsx
│   │   │   ├── team/[id]/page.tsx
│   │   │   ├── reports/page.tsx
│   │   │   └── settings/
│   │   │       ├── page.tsx
│   │   │       ├── kpis/page.tsx
│   │   │       ├── security/page.tsx
│   │   │       ├── password/page.tsx
│   │   │       └── audit-log/page.tsx
│   │   └── api/
│   │       ├── leads/create/route.ts
│   │       ├── bookings/create/route.ts
│   │       ├── paystack/verify/route.ts
│   │       ├── paystack/webhook/route.ts       ← sig verification required
│   │       ├── newsletter/route.ts
│   │       ├── flights/search/route.ts         ← Duffel flights
│   │       ├── flights/airports/route.ts       ← Duffel airport search
│   │       ├── hotels/search/route.ts          ← Duffel stays
│   │       ├── ads/click/route.ts
│   │       ├── ads/impression/route.ts
│   │       ├── ads/active/route.ts
│   │       ├── promo/validate/route.ts
│   │       ├── search/route.ts                 ← full-text search
│   │       ├── customer/send-link/route.ts     ← magic link
│   │       ├── whatsapp/webhook/route.ts       ← inbound handler
│   │       └── cron/
│   │           └── daily/route.ts              ← master scheduler
│   │       └── admin/
│   │           ├── bookings/update/route.ts
│   │           ├── bookings/refund/route.ts    ← Paystack refund API
│   │           ├── leads/update/route.ts
│   │           ├── leads/import/route.ts
│   │           ├── tours/save/route.ts
│   │           ├── blog/save/route.ts
│   │           ├── reviews/update/route.ts
│   │           ├── visa-services/save/route.ts
│   │           ├── ads/save/route.ts
│   │           ├── ads/toggle/route.ts
│   │           ├── broadcast/route.ts
│   │           ├── subscribers/toggle/route.ts
│   │           ├── team/create/route.ts
│   │           ├── team/update/route.ts
│   │           ├── team/deactivate/route.ts
│   │           ├── settings/save/route.ts
│   │           ├── auth/change-password/route.ts
│   │           └── reports/monthly/route.ts
│   ├── components/
│   │   ├── ui/                               ✅ BUILT
│   │   │   └── (Button, Card, TourCard, Badge, Input, etc.)
│   │   ├── layout/                           ✅ BUILT
│   │   │   └── (Navbar, Footer)
│   │   ├── admin/
│   │   │   ├── AdminContext.tsx              ← role context provider
│   │   │   ├── RoleGate.tsx                 ← conditional render by feature
│   │   │   ├── SessionGuard.tsx             ← inactivity timeout
│   │   │   ├── NotificationBell.tsx         ← Realtime notifications
│   │   │   └── ImageUpload.tsx              ← Cloudinary direct upload
│   │   ├── flights/
│   │   │   ├── FlightSearchWidget.tsx       ← tabs: Flights/Hotels/Visas
│   │   │   └── FlightResults.tsx
│   │   └── ads/
│   │       ├── AdSlot.tsx                   ← server component
│   │       ├── AdClickLink.tsx              ← click tracking
│   │       └── PopupAd.tsx                  ← session storage gated
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts
│   │   │   └── server.ts
│   │   ├── content.ts                       ← all public data fetch functions
│   │   ├── admin/auth.ts                    ← role helpers + canAccess()
│   │   ├── whatsapp.ts                      ← Meta API helpers
│   │   ├── claude.ts                        ← classifyLead, generateFollowUp, checkVisaDocs
│   │   ├── ratelimit.ts                     ← Upstash rate limiters
│   │   ├── turnstile.ts                     ← CAPTCHA verification
│   │   ├── env.ts                           ← startup validation
│   │   └── email/
│   │       └── confirmationEmail.ts
│   ├── middleware.ts                         ← RBAC + admin route protection
│   └── instrumentation.ts                   ← Sentry + env validation
├── supabase/
│   └── functions/
│       ├── lead-response/index.ts           ← Deno — on leads INSERT
│       ├── booking-confirmation/index.ts    ← Deno — on bookings paid INSERT
│       └── visa-tracker/index.ts            ← Deno — deadline alerts
├── public/images/
├── vercel.json                              ← cron: "0 3 * * *"
└── .env.local
```

---

## ENVIRONMENT VARIABLES

Every variable below is required. App fails at startup if any are missing.

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Paystack
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=    # pk_live_ or pk_test_
PAYSTACK_SECRET_KEY=                # sk_live_ or sk_test_

# Duffel
DUFFEL_API_TOKEN=                   # duffel_live_ or duffel_test_

# Meta WhatsApp
META_WHATSAPP_TOKEN=                # permanent bearer token
META_PHONE_NUMBER_ID=
META_WHATSAPP_BUSINESS_ACCOUNT_ID=
WHATSAPP_VERIFY_TOKEN=              # string you invent for webhook verification

# Resend
RESEND_API_KEY=

# Anthropic
ANTHROPIC_API_KEY=                  # sk-ant-

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=   # unsigned preset
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Cloudflare Turnstile
NEXT_PUBLIC_TURNSTILE_SITE_KEY=
TURNSTILE_SECRET_KEY=

# Upstash Redis
UPSTASH_REDIS_URL=
UPSTASH_REDIS_TOKEN=

# Sentry
SENTRY_DSN=
NEXT_PUBLIC_SENTRY_DSN=

# Vercel Cron Security
CRON_SECRET=                        # string you invent

# Exchange Rate (auto-updated — no key needed for open.er-api.com)
# Naira rate stored in site_settings table, not env

# App
NEXT_PUBLIC_APP_URL=https://acevoyages.net
```

---

## CLAUDE MUST ALWAYS FOLLOW THESE RULES

- TypeScript only — never .js files
- Tailwind CSS only — never custom CSS
- Next.js App Router: page.tsx, layout.tsx, route.ts
- Use cn() from /src/lib/utils.ts for combining classes
- Use next/image — never a plain img tag
- Mobile-first — build for 375px, then scale up
- Prices always in ₦ (Naira) formatted as ₦X,XXX,XXX
- Phone numbers in +234 format
- WhatsApp is the primary contact channel for Nigerian users
- Supabase Edge Functions use Deno runtime — never Node-only packages
- Deno.env.get('VAR') not process.env in Edge Functions
- import not require in Edge Functions
- Paystack webhook: ALWAYS verify x-paystack-signature before processing
- Rate limit ALL public API routes using /src/lib/ratelimit.ts
- CAPTCHA: verify Turnstile token on ALL public form submissions
- Activity log: call logActivity() on every admin state change
- Every /api/admin/* route: verify session + role before acting (return 401/403)
- AgentAdmin queries: always filter by assigned_to in SQL
- Do not rebuild what is already built — add to it
- Duffel-Version: v2 header on every Duffel API call
- Never call Duffel or Anthropic from the browser — server-side only

---

## BUILD STATUS

### DONE — Do not rebuild
- [x] Homepage (all sections, hardcoded content)
- [x] Services page
- [x] Navbar + Footer
- [x] UI component library (Button, Card, TourCard, Badge, Input, etc.)

### TO BUILD — Sessions in order (request prompts one at a time)

FOUNDATION
- [ ] A — Complete database (all tables, RLS, functions, triggers, indexes)
- [ ] B — Security setup (env validation, rate limiting, CAPTCHA, Sentry)
- [ ] C — Content library /src/lib/content.ts + homepage connected to Supabase

PUBLIC PAGES
- [ ] D — Missing pages: /tours listing, /about, /contact
- [ ] E — Tour detail + availability calendar + 3-step booking form + promo codes
- [ ] F — Booking confirmation + resume-booking (failed payment recovery)
- [ ] G — Blog listing + blog post (TipTap renderer)
- [ ] H — Visa services page
- [ ] I — Search (/api/search + search UI in Navbar)
- [ ] J — Customer portal (/my-bookings magic link)
- [ ] K — Legal pages (/privacy, /terms, /cookie-policy) + cookie banner

PAYMENTS & COMMERCE
- [ ] L — Paystack integration + webhook with signature verification
- [ ] M — Promo code system

FLIGHT & HOTEL SEARCH
- [ ] N — Duffel API routes + FlightSearchWidget + hotel search

ADMIN PANEL — FOUNDATION
- [ ] O — Admin auth + RBAC (middleware, AdminContext, RoleGate, SessionGuard)
- [ ] P — Admin layout + NotificationBell (Supabase Realtime)
- [ ] Q — Admin dashboard (SuperAdmin KPIs + Manager + Agent views)

ADMIN PANEL — OPERATIONS
- [ ] R — Bookings (table, slide-over, status update, refund workflow)
- [ ] S — Leads (table, assignment, CSV import, slide-over with WA history)
- [ ] T — Visa applications tracking + document upload system

ADMIN PANEL — CONTENT
- [ ] U — Tours management + departure calendar + ImageUpload component
- [ ] V — Blog editor (TipTap) + publish workflow
- [ ] W — Reviews (pending approval queue + manual add)
- [ ] X — Visa services management

ADMIN PANEL — MARKETING
- [ ] Y — Ads manager (create/edit/schedule/toggle + analytics)
- [ ] Z — WhatsApp log (read-only) + broadcast tool (with safety gates)

ADMIN PANEL — SYSTEM
- [ ] AA — Subscribers + CSV export
- [ ] BB — Team management + RBAC (create/deactivate users + performance view)
- [ ] CC — Reports (monthly PDF export)
- [ ] DD — Settings (KPI targets, exchange rate, campaigns, 2FA, audit log)

AUTOMATION
- [ ] EE — Meta WhatsApp API setup + /src/lib/whatsapp.ts
- [ ] FF — Inbound WhatsApp webhook handler
- [ ] GG — Phase 1 automation (Workflows 1, 2, 3) + Edge Functions
- [ ] HH — Phase 2 automation (Workflows 4, 5, 6, 7) in cron
- [ ] II — Phase 3 automation (Workflows 8, 9) in cron
- [ ] JJ — Pre-departure automation (Workflows 10, 11)
- [ ] KK — Claude API intelligence layer (/src/lib/claude.ts)

INFRASTRUCTURE
- [ ] LL — Live exchange rate auto-update in cron
- [ ] MM — SuperAdmin daily email digest in cron
- [ ] NN — Social proof urgency indicators on tour pages
- [ ] OO — Destination guide pages (/destinations/[slug])

LAUNCH
- [ ] PP — SEO (sitemap, metadata, JSON-LD, OG tags)
- [ ] QQ — Email DNS configuration (SPF, DKIM, DMARC)
- [ ] RR — Final deploy + custom domain acevoyages.net

---

## WHAT'S NOT BEING BUILT (deferred)

- Referral program (after launch — needs paying customer base first)
- Native mobile app (website is mobile-optimised — app is Phase 2)
- Live chat widget (WhatsApp handles this)
- Multiple currencies (₦ only for now)
- Multi-language (English only for Nigerian market)
- Hotel direct booking (Duffel Stays — search + forward to agent, same as flights)
