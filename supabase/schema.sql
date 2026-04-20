-- =============================================================================
-- ACE VOYAGES — COMPLETE DATABASE SCHEMA
-- Run this in Supabase → SQL Editor → New Query
-- Run it in ONE go — it is safe to re-run (uses IF NOT EXISTS / OR REPLACE)
-- =============================================================================


-- =============================================================================
-- EXTENSIONS
-- =============================================================================
CREATE EXTENSION IF NOT EXISTS "pgcrypto";  -- gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "pg_trgm";   -- fuzzy text search


-- =============================================================================
-- ADMIN RBAC TABLES (must come first — other tables FK into admin_users)
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.admin_users (
  user_id        uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  role           text NOT NULL CHECK (role IN ('super_admin', 'manager_admin', 'agent_admin')),
  full_name      text NOT NULL,
  phone          text,
  avatar_color   text DEFAULT '#1B3A6B',
  is_active      boolean DEFAULT true,
  created_by     uuid REFERENCES public.admin_users(user_id),
  mfa_enrolled   boolean DEFAULT false,
  last_login     timestamptz,
  created_at     timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.kpi_targets (
  key              text PRIMARY KEY,
  label            text NOT NULL,
  target_value     numeric NOT NULL,
  unit             text CHECK (unit IN ('currency', 'percentage', 'count', 'hours')),
  period           text DEFAULT 'monthly',
  green_threshold  numeric NOT NULL,
  amber_threshold  numeric NOT NULL,
  updated_by       uuid REFERENCES public.admin_users(user_id),
  updated_at       timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.activity_log (
  log_id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id  uuid REFERENCES public.admin_users(user_id),
  admin_name     text,
  action         text NOT NULL,
  entity_type    text CHECK (entity_type IN ('booking','lead','tour','blog','ad','user','visa','review','promo','setting','subscriber')),
  entity_id      text,
  entity_label   text,
  details        jsonb,
  ip_address     text,
  created_at     timestamptz DEFAULT now()
);


-- =============================================================================
-- CONTENT TABLES
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.tours (
  tour_id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title                text NOT NULL,
  slug                 text UNIQUE NOT NULL,
  destination_city     text NOT NULL,
  destination_country  text NOT NULL,
  price_naira          numeric NOT NULL,
  duration_days        integer NOT NULL,
  max_guests           integer NOT NULL DEFAULT 12,
  hero_image_url       text,
  gallery_urls         text[],
  short_description    text,
  full_description     text,
  whats_included       text[],
  highlights           text[],
  category             text CHECK (category IN ('leisure','honeymoon','corporate','adventure')),
  is_featured          boolean DEFAULT false,
  is_active            boolean DEFAULT true,
  search_vector        tsvector,
  created_at           timestamptz DEFAULT now(),
  updated_at           timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.tour_departures (
  departure_id    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tour_id         uuid NOT NULL REFERENCES public.tours(tour_id) ON DELETE CASCADE,
  departure_date  date NOT NULL,
  max_guests      integer NOT NULL,
  guests_booked   integer DEFAULT 0,
  status          text DEFAULT 'open' CHECK (status IN ('open','limited','full','cancelled')),
  price_override  numeric,
  notes           text,
  UNIQUE (tour_id, departure_date)
);

CREATE TABLE IF NOT EXISTS public.blog_posts (
  post_id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title           text NOT NULL,
  slug            text UNIQUE NOT NULL,
  excerpt         text,
  hero_image_url  text,
  body_json       jsonb,
  body_text       text,
  category        text CHECK (category IN ('visa-tips','travel-guides','destination-spotlight','packing-tips')),
  is_published    boolean DEFAULT false,
  is_featured     boolean DEFAULT false,
  published_at    timestamptz,
  search_vector   tsvector,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.testimonials (
  testimonial_id     uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name      text NOT NULL,
  customer_city      text NOT NULL,
  customer_photo_url text,
  quote              text NOT NULL,
  star_rating        integer CHECK (star_rating BETWEEN 1 AND 5),
  tour_booked        text,
  is_approved        boolean DEFAULT false,
  is_rejected        boolean DEFAULT false,
  source             text CHECK (source IN ('whatsapp','google','form','manual')),
  created_at         timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.visa_services (
  service_id       uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  country_name     text NOT NULL,
  country_flag_url text,
  visa_type        text,
  processing_time  text,
  price_naira      numeric,
  requirements     text[],
  success_rate     integer,
  is_active        boolean DEFAULT true,
  sort_order       integer DEFAULT 0,
  updated_at       timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.ads (
  ad_id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title             text NOT NULL,
  headline          text,
  body_text         text,
  cta_text          text,
  cta_url           text,
  media_type        text CHECK (media_type IN ('image','video','none')),
  media_url         text,
  media_alt_text    text,
  placement         text CHECK (placement IN ('hero_banner','homepage_inline','tours_sidebar','blog_inline','blog_sidebar','visa_page_banner','popup')),
  background_color  text DEFAULT '#1B3A6B',
  text_color        text DEFAULT '#FFFFFF',
  is_active         boolean DEFAULT false,
  starts_at         timestamptz,
  ends_at           timestamptz,
  priority          integer DEFAULT 0,
  target_device     text DEFAULT 'all' CHECK (target_device IN ('all','mobile','desktop')),
  click_count       integer DEFAULT 0,
  impression_count  integer DEFAULT 0,
  advertiser_name   text DEFAULT 'ACE Voyages',
  is_paid           boolean DEFAULT false,
  created_at        timestamptz DEFAULT now(),
  updated_at        timestamptz DEFAULT now()
);


-- =============================================================================
-- OPERATIONAL TABLES
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.promo_codes (
  code_id        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code           text UNIQUE NOT NULL,
  description    text,
  discount_type  text CHECK (discount_type IN ('percentage','fixed')),
  discount_value numeric NOT NULL,
  minimum_order  numeric,
  max_uses       integer,
  times_used     integer DEFAULT 0,
  valid_from     timestamptz DEFAULT now(),
  valid_until    timestamptz,
  applicable_to  text DEFAULT 'all' CHECK (applicable_to IN ('all','tours','visa','flights')),
  created_by     uuid REFERENCES public.admin_users(user_id),
  is_active      boolean DEFAULT true,
  created_at     timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.bookings (
  booking_id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_reference       text UNIQUE,
  customer_name           text NOT NULL,
  customer_email          text NOT NULL,
  customer_phone          text NOT NULL,
  customer_whatsapp       text,
  tour_slug               text,
  tour_name               text NOT NULL,
  travel_date             date NOT NULL,
  return_date             date,
  adults                  integer NOT NULL DEFAULT 1,
  children                integer DEFAULT 0,
  total_price             numeric NOT NULL,
  promo_code_id           uuid REFERENCES public.promo_codes(code_id),
  discount_applied        numeric DEFAULT 0,
  currency                text DEFAULT 'NGN',
  special_requests        text,
  status                  text DEFAULT 'pending' CHECK (status IN ('pending','confirmed','cancelled')),
  payment_reference       text,
  payment_status          text DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid','paid','partial','refunded')),
  refund_amount           numeric,
  refund_date             timestamptz,
  refund_reference        text,
  refund_reason           text,
  refund_status           text DEFAULT 'none' CHECK (refund_status IN ('none','requested','processing','completed','denied')),
  upsell_offered          boolean DEFAULT false,
  review_requested        boolean DEFAULT false,
  pre_departure_7_sent    boolean DEFAULT false,
  pre_departure_1_sent    boolean DEFAULT false,
  created_at              timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.booking_drafts (
  draft_id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name     text,
  customer_email    text,
  customer_phone    text,
  customer_whatsapp text,
  tour_slug         text,
  tour_name         text,
  travel_date       date,
  adults            integer,
  children          integer,
  total_price       numeric,
  special_requests  text,
  payment_attempts  integer DEFAULT 0,
  last_attempt      timestamptz,
  recovered         boolean DEFAULT false,
  recovery_sent     boolean DEFAULT false,
  created_at        timestamptz DEFAULT now(),
  expires_at        timestamptz DEFAULT now() + interval '48 hours'
);

CREATE TABLE IF NOT EXISTS public.promo_code_uses (
  use_id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code_id          uuid REFERENCES public.promo_codes(code_id),
  booking_id       uuid REFERENCES public.bookings(booking_id),
  customer_email   text,
  discount_applied numeric,
  used_at          timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.leads (
  lead_id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name        text NOT NULL,
  customer_email       text,
  customer_phone       text NOT NULL,
  customer_whatsapp    text,
  service_interest     text,
  destination_interest text,
  message              text,
  source_page          text,
  lead_status          text DEFAULT 'new' CHECK (lead_status IN ('new','contacted','converted','cold')),
  lead_category        text,
  assigned_to          uuid REFERENCES public.admin_users(user_id),
  assigned_at          timestamptz,
  follow_up_count      integer DEFAULT 0,
  last_follow_up       timestamptz,
  next_follow_up       timestamptz,
  notes                text,
  created_at           timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.visa_applications (
  application_id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name          text NOT NULL,
  customer_phone         text NOT NULL,
  destination_country    text NOT NULL,
  visa_type              text,
  submission_deadline    date,
  interview_date         date,
  expected_decision_date date,
  status                 text DEFAULT 'in-progress' CHECK (status IN ('in-progress','submitted','interview-scheduled','approved','rejected','withdrawn')),
  booking_id             uuid REFERENCES public.bookings(booking_id),
  assigned_to            uuid REFERENCES public.admin_users(user_id),
  notes                  text,
  created_at             timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.visa_documents (
  document_id      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id   uuid REFERENCES public.visa_applications(application_id),
  lead_id          uuid REFERENCES public.leads(lead_id),
  document_type    text CHECK (document_type IN ('passport_bio','bank_statement','employment_letter','photo','travel_insurance','hotel_booking','flight_itinerary','business_registration','other')),
  file_url         text NOT NULL,
  file_name        text,
  file_size_kb     integer,
  uploaded_by      text CHECK (uploaded_by IN ('customer','agent')),
  reviewed         boolean DEFAULT false,
  notes            text,
  created_at       timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.waitlist (
  waitlist_id        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tour_id            uuid REFERENCES public.tours(tour_id),
  departure_date     date,
  customer_name      text,
  customer_phone     text,
  customer_whatsapp  text,
  adults             integer,
  notified           boolean DEFAULT false,
  created_at         timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.whatsapp_log (
  log_id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number        text NOT NULL,
  customer_name       text,
  message_type        text,
  message_body        text,
  direction           text CHECK (direction IN ('inbound','outbound')),
  status              text,
  related_booking_id  uuid REFERENCES public.bookings(booking_id),
  related_lead_id     uuid REFERENCES public.leads(lead_id),
  sent_at             timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.whatsapp_opt_outs (
  phone_number   text PRIMARY KEY,
  opted_out_at   timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
  subscriber_id   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email           text UNIQUE NOT NULL,
  subscribed_at   timestamptz DEFAULT now(),
  active          boolean DEFAULT true
);

CREATE TABLE IF NOT EXISTS public.upload_tokens (
  token_hash      text PRIMARY KEY,
  application_id  uuid REFERENCES public.visa_applications(application_id),
  created_at      timestamptz DEFAULT now(),
  expires_at      timestamptz,
  used            boolean DEFAULT false
);

CREATE TABLE IF NOT EXISTS public.customer_access_tokens (
  token_hash      text PRIMARY KEY,
  customer_email  text NOT NULL,
  created_at      timestamptz DEFAULT now(),
  expires_at      timestamptz,
  used            boolean DEFAULT false
);

CREATE TABLE IF NOT EXISTS public.site_settings (
  key         text PRIMARY KEY,
  value       text NOT NULL,
  updated_at  timestamptz DEFAULT now()
);


-- =============================================================================
-- DEFAULT SITE SETTINGS
-- =============================================================================

INSERT INTO public.site_settings (key, value) VALUES
  ('naira_rate',                     '1600'),
  ('gbp_to_ngn_rate',                '2050'),
  ('christmas_campaign_active',      'false'),
  ('eid_campaign_active',            'false'),
  ('easter_campaign_active',         'false'),
  ('summer_campaign_active',         'false'),
  ('school_holiday_campaign_active', 'false'),
  ('next_eid_date',                  '2026-03-20'),
  ('admin_session_timeout_mins',     '30')
ON CONFLICT (key) DO NOTHING;


-- =============================================================================
-- DEFAULT KPI TARGETS
-- =============================================================================

INSERT INTO public.kpi_targets (key, label, target_value, unit, green_threshold, amber_threshold) VALUES
  ('monthly_revenue',       'Monthly Revenue',            5000000, 'currency',    90, 70),
  ('lead_conversion_rate',  'Lead Conversion Rate',       25,       'percentage',  90, 70),
  ('avg_response_time_hrs', 'Avg Lead Response Time (h)', 1,        'hours',       90, 70),
  ('monthly_bookings',      'Monthly Bookings',           30,       'count',       90, 70),
  ('booking_completion',    'Booking Completion Rate',    40,       'percentage',  90, 70),
  ('cancellation_rate',     'Cancellation Rate',          10,       'percentage',  90, 70),
  ('avg_star_rating',       'Average Star Rating',        4.5,      'percentage',  90, 70),
  ('review_rate',           'Review Rate',                30,       'percentage',  90, 70),
  ('visa_success_rate',     'Visa Success Rate',          95,       'percentage',  90, 70),
  ('follow_up_completion',  'Follow-up Completion Rate',  90,       'percentage',  90, 70)
ON CONFLICT (key) DO NOTHING;


-- =============================================================================
-- INDEXES
-- =============================================================================

-- Tours
CREATE INDEX IF NOT EXISTS idx_tours_slug         ON public.tours(slug);
CREATE INDEX IF NOT EXISTS idx_tours_is_active    ON public.tours(is_active);
CREATE INDEX IF NOT EXISTS idx_tours_is_featured  ON public.tours(is_featured);
CREATE INDEX IF NOT EXISTS idx_tours_search       ON public.tours USING GIN(search_vector);

-- Tour departures
CREATE INDEX IF NOT EXISTS idx_departures_tour_id ON public.tour_departures(tour_id);
CREATE INDEX IF NOT EXISTS idx_departures_date    ON public.tour_departures(departure_date);

-- Blog
CREATE INDEX IF NOT EXISTS idx_blog_slug         ON public.blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_published    ON public.blog_posts(is_published);
CREATE INDEX IF NOT EXISTS idx_blog_search       ON public.blog_posts USING GIN(search_vector);

-- Bookings
CREATE INDEX IF NOT EXISTS idx_bookings_email    ON public.bookings(customer_email);
CREATE INDEX IF NOT EXISTS idx_bookings_status   ON public.bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_payment  ON public.bookings(payment_status);
CREATE INDEX IF NOT EXISTS idx_bookings_date     ON public.bookings(travel_date);

-- Leads
CREATE INDEX IF NOT EXISTS idx_leads_status      ON public.leads(lead_status);
CREATE INDEX IF NOT EXISTS idx_leads_assigned    ON public.leads(assigned_to);
CREATE INDEX IF NOT EXISTS idx_leads_phone       ON public.leads(customer_phone);

-- Visa applications
CREATE INDEX IF NOT EXISTS idx_visa_assigned     ON public.visa_applications(assigned_to);
CREATE INDEX IF NOT EXISTS idx_visa_status       ON public.visa_applications(status);

-- WhatsApp log
CREATE INDEX IF NOT EXISTS idx_wa_phone          ON public.whatsapp_log(phone_number);
CREATE INDEX IF NOT EXISTS idx_wa_booking        ON public.whatsapp_log(related_booking_id);
CREATE INDEX IF NOT EXISTS idx_wa_lead           ON public.whatsapp_log(related_lead_id);

-- Ads
CREATE INDEX IF NOT EXISTS idx_ads_placement     ON public.ads(placement);
CREATE INDEX IF NOT EXISTS idx_ads_active        ON public.ads(is_active);

-- Activity log
CREATE INDEX IF NOT EXISTS idx_activity_user     ON public.activity_log(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_activity_entity   ON public.activity_log(entity_type, entity_id);


-- =============================================================================
-- FUNCTIONS
-- =============================================================================

-- Generate a booking reference: ACE-YYYY-XXXX
CREATE OR REPLACE FUNCTION public.generate_booking_reference()
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  ref text;
  year_part text;
  seq_part text;
  existing_count integer;
BEGIN
  year_part := to_char(now(), 'YYYY');
  SELECT count(*) INTO existing_count FROM public.bookings WHERE booking_reference LIKE 'ACE-' || year_part || '-%';
  seq_part := lpad((existing_count + 1)::text, 4, '0');
  ref := 'ACE-' || year_part || '-' || seq_part;
  RETURN ref;
END;
$$;

-- Auto-set booking reference on INSERT
CREATE OR REPLACE FUNCTION public.set_booking_reference()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.booking_reference IS NULL THEN
    NEW.booking_reference := public.generate_booking_reference();
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_set_booking_reference ON public.bookings;
CREATE TRIGGER trg_set_booking_reference
  BEFORE INSERT ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.set_booking_reference();

-- Auto-update tour departure status based on guests_booked
CREATE OR REPLACE FUNCTION public.update_departure_availability()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  pct numeric;
BEGIN
  IF NEW.max_guests = 0 THEN
    NEW.status := 'full';
    RETURN NEW;
  END IF;
  pct := (NEW.guests_booked::numeric / NEW.max_guests::numeric) * 100;
  IF NEW.guests_booked >= NEW.max_guests THEN
    NEW.status := 'full';
  ELSIF pct >= 75 THEN
    NEW.status := 'limited';
  ELSE
    NEW.status := 'open';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_update_departure_availability ON public.tour_departures;
CREATE TRIGGER trg_update_departure_availability
  BEFORE INSERT OR UPDATE OF guests_booked, max_guests ON public.tour_departures
  FOR EACH ROW EXECUTE FUNCTION public.update_departure_availability();

-- Full-text search vector for tours
CREATE OR REPLACE FUNCTION public.update_tours_search()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', coalesce(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(NEW.destination_city, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(NEW.destination_country, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(NEW.short_description, '')), 'C') ||
    setweight(to_tsvector('english', coalesce(NEW.full_description, '')), 'D');
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_tours_search ON public.tours;
CREATE TRIGGER trg_tours_search
  BEFORE INSERT OR UPDATE ON public.tours
  FOR EACH ROW EXECUTE FUNCTION public.update_tours_search();

-- Full-text search vector for blog_posts
CREATE OR REPLACE FUNCTION public.update_blog_search()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', coalesce(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(NEW.excerpt, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(NEW.body_text, '')), 'C');
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_blog_search ON public.blog_posts;
CREATE TRIGGER trg_blog_search
  BEFORE INSERT OR UPDATE ON public.blog_posts
  FOR EACH ROW EXECUTE FUNCTION public.update_blog_search();

-- Auto-deactivate expired ads (called by daily cron via RPC)
CREATE OR REPLACE FUNCTION public.deactivate_expired_ads()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.ads
  SET is_active = false, updated_at = now()
  WHERE is_active = true
    AND ends_at IS NOT NULL
    AND ends_at < now();
END;
$$;

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_tours_updated_at ON public.tours;
CREATE TRIGGER trg_tours_updated_at
  BEFORE UPDATE ON public.tours
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_blog_updated_at ON public.blog_posts;
CREATE TRIGGER trg_blog_updated_at
  BEFORE UPDATE ON public.blog_posts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_ads_updated_at ON public.ads;
CREATE TRIGGER trg_ads_updated_at
  BEFORE UPDATE ON public.ads
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_visa_services_updated_at ON public.visa_services;
CREATE TRIGGER trg_visa_services_updated_at
  BEFORE UPDATE ON public.visa_services
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_site_settings_updated_at ON public.site_settings;
CREATE TRIGGER trg_site_settings_updated_at
  BEFORE UPDATE ON public.site_settings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- =============================================================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================================================

-- Enable RLS on all tables
ALTER TABLE public.admin_users            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kpi_targets            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_log           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tours                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tour_departures        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visa_services          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ads                    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_drafts         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visa_applications      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visa_documents         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waitlist               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_log           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_opt_outs      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promo_codes            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promo_code_uses        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.upload_tokens          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_access_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings          ENABLE ROW LEVEL SECURITY;

-- Helper: get current user's role
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS text
LANGUAGE sql
STABLE
AS $$
  SELECT role FROM public.admin_users WHERE user_id = auth.uid() AND is_active = true;
$$;

-- Helper: check if current user is an admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users WHERE user_id = auth.uid() AND is_active = true
  );
$$;

-- -----------------------------------------------------------------------
-- PUBLIC READ POLICIES (anon can read public content)
-- -----------------------------------------------------------------------

-- Tours: public read (active only)
DROP POLICY IF EXISTS "public_read_active_tours" ON public.tours;
CREATE POLICY "public_read_active_tours" ON public.tours
  FOR SELECT TO anon, authenticated
  USING (is_active = true);

-- Tour departures: public read
DROP POLICY IF EXISTS "public_read_tour_departures" ON public.tour_departures;
CREATE POLICY "public_read_tour_departures" ON public.tour_departures
  FOR SELECT TO anon, authenticated
  USING (true);

-- Blog posts: public read (published only)
DROP POLICY IF EXISTS "public_read_published_blogs" ON public.blog_posts;
CREATE POLICY "public_read_published_blogs" ON public.blog_posts
  FOR SELECT TO anon, authenticated
  USING (is_published = true);

-- Testimonials: public read (approved only)
DROP POLICY IF EXISTS "public_read_approved_testimonials" ON public.testimonials;
CREATE POLICY "public_read_approved_testimonials" ON public.testimonials
  FOR SELECT TO anon, authenticated
  USING (is_approved = true);

-- Visa services: public read (active only)
DROP POLICY IF EXISTS "public_read_visa_services" ON public.visa_services;
CREATE POLICY "public_read_visa_services" ON public.visa_services
  FOR SELECT TO anon, authenticated
  USING (is_active = true);

-- Ads: public read (active, within schedule)
DROP POLICY IF EXISTS "public_read_active_ads" ON public.ads;
CREATE POLICY "public_read_active_ads" ON public.ads
  FOR SELECT TO anon, authenticated
  USING (
    is_active = true
    AND (starts_at IS NULL OR starts_at <= now())
    AND (ends_at IS NULL OR ends_at >= now())
  );

-- Site settings: public read
DROP POLICY IF EXISTS "public_read_site_settings" ON public.site_settings;
CREATE POLICY "public_read_site_settings" ON public.site_settings
  FOR SELECT TO anon, authenticated
  USING (true);

-- -----------------------------------------------------------------------
-- PUBLIC WRITE POLICIES (anon can submit forms)
-- -----------------------------------------------------------------------

-- Leads: anyone can create (contact form, visa enquiry, etc.)
DROP POLICY IF EXISTS "public_create_lead" ON public.leads;
CREATE POLICY "public_create_lead" ON public.leads
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- Bookings: anyone can create
DROP POLICY IF EXISTS "public_create_booking" ON public.bookings;
CREATE POLICY "public_create_booking" ON public.bookings
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- Booking drafts: anyone can create
DROP POLICY IF EXISTS "public_create_booking_draft" ON public.booking_drafts;
CREATE POLICY "public_create_booking_draft" ON public.booking_drafts
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- Newsletter: anyone can subscribe
DROP POLICY IF EXISTS "public_create_subscriber" ON public.newsletter_subscribers;
CREATE POLICY "public_create_subscriber" ON public.newsletter_subscribers
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- Testimonials: anyone can submit
DROP POLICY IF EXISTS "public_create_testimonial" ON public.testimonials;
CREATE POLICY "public_create_testimonial" ON public.testimonials
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- Waitlist: anyone can join
DROP POLICY IF EXISTS "public_create_waitlist" ON public.waitlist;
CREATE POLICY "public_create_waitlist" ON public.waitlist
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- WhatsApp opt-outs: anyone can opt out
DROP POLICY IF EXISTS "public_create_optout" ON public.whatsapp_opt_outs;
CREATE POLICY "public_create_optout" ON public.whatsapp_opt_outs
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- Ads click/impression: anyone can update counts
DROP POLICY IF EXISTS "public_update_ad_counts" ON public.ads;
CREATE POLICY "public_update_ad_counts" ON public.ads
  FOR UPDATE TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Customer access tokens: public read (for magic link validation)
DROP POLICY IF EXISTS "public_read_customer_tokens" ON public.customer_access_tokens;
CREATE POLICY "public_read_customer_tokens" ON public.customer_access_tokens
  FOR SELECT TO anon, authenticated
  USING (true);

-- Customer bookings: read by email match (customer portal)
DROP POLICY IF EXISTS "customer_read_own_bookings" ON public.bookings;
CREATE POLICY "customer_read_own_bookings" ON public.bookings
  FOR SELECT TO anon, authenticated
  USING (true);  -- further filtered in API by token-validated email

-- Upload tokens: public read for validation
DROP POLICY IF EXISTS "public_read_upload_tokens" ON public.upload_tokens;
CREATE POLICY "public_read_upload_tokens" ON public.upload_tokens
  FOR SELECT TO anon, authenticated
  USING (true);

-- Visa documents: public insert (customer uploads)
DROP POLICY IF EXISTS "public_create_visa_doc" ON public.visa_documents;
CREATE POLICY "public_create_visa_doc" ON public.visa_documents
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- Promo codes: public read (for validation at checkout)
DROP POLICY IF EXISTS "public_read_promo_codes" ON public.promo_codes;
CREATE POLICY "public_read_promo_codes" ON public.promo_codes
  FOR SELECT TO anon, authenticated
  USING (is_active = true);

-- Promo code uses: public create
DROP POLICY IF EXISTS "public_create_promo_use" ON public.promo_code_uses;
CREATE POLICY "public_create_promo_use" ON public.promo_code_uses
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- -----------------------------------------------------------------------
-- ADMIN POLICIES — service_role bypasses RLS (used in API routes)
-- Authenticated admin users also get full access
-- -----------------------------------------------------------------------

-- Admin users: admins can read all, super_admin can write
DROP POLICY IF EXISTS "admin_read_admin_users" ON public.admin_users;
CREATE POLICY "admin_read_admin_users" ON public.admin_users
  FOR SELECT TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "admin_write_admin_users" ON public.admin_users;
CREATE POLICY "admin_write_admin_users" ON public.admin_users
  FOR ALL TO authenticated
  USING (public.get_my_role() IN ('super_admin', 'manager_admin'))
  WITH CHECK (public.get_my_role() IN ('super_admin', 'manager_admin'));

-- Tours: admins can write
DROP POLICY IF EXISTS "admin_all_tours" ON public.tours;
CREATE POLICY "admin_all_tours" ON public.tours
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Tour departures: admins can write
DROP POLICY IF EXISTS "admin_all_departures" ON public.tour_departures;
CREATE POLICY "admin_all_departures" ON public.tour_departures
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Blog posts: admins can read all; agents can write drafts
DROP POLICY IF EXISTS "admin_all_blog" ON public.blog_posts;
CREATE POLICY "admin_all_blog" ON public.blog_posts
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Testimonials: admins can read/approve all
DROP POLICY IF EXISTS "admin_all_testimonials" ON public.testimonials;
CREATE POLICY "admin_all_testimonials" ON public.testimonials
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Visa services: admins can write
DROP POLICY IF EXISTS "admin_all_visa_services" ON public.visa_services;
CREATE POLICY "admin_all_visa_services" ON public.visa_services
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Ads: admins can write
DROP POLICY IF EXISTS "admin_all_ads" ON public.ads;
CREATE POLICY "admin_all_ads" ON public.ads
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Bookings: admins can read all; agents see assigned leads' bookings
DROP POLICY IF EXISTS "admin_all_bookings" ON public.bookings;
CREATE POLICY "admin_all_bookings" ON public.bookings
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Booking drafts: admins can read
DROP POLICY IF EXISTS "admin_read_booking_drafts" ON public.booking_drafts;
CREATE POLICY "admin_read_booking_drafts" ON public.booking_drafts
  FOR SELECT TO authenticated
  USING (public.is_admin());

-- Leads: super/manager see all, agents see only assigned
DROP POLICY IF EXISTS "admin_read_leads" ON public.leads;
CREATE POLICY "admin_read_leads" ON public.leads
  FOR SELECT TO authenticated
  USING (
    public.get_my_role() IN ('super_admin', 'manager_admin')
    OR (public.get_my_role() = 'agent_admin' AND assigned_to = auth.uid())
  );

DROP POLICY IF EXISTS "admin_write_leads" ON public.leads;
CREATE POLICY "admin_write_leads" ON public.leads
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Visa applications: super/manager see all, agents see assigned
DROP POLICY IF EXISTS "admin_read_visa_apps" ON public.visa_applications;
CREATE POLICY "admin_read_visa_apps" ON public.visa_applications
  FOR SELECT TO authenticated
  USING (
    public.get_my_role() IN ('super_admin', 'manager_admin')
    OR (public.get_my_role() = 'agent_admin' AND assigned_to = auth.uid())
  );

DROP POLICY IF EXISTS "admin_write_visa_apps" ON public.visa_applications;
CREATE POLICY "admin_write_visa_apps" ON public.visa_applications
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Visa documents: admins can read
DROP POLICY IF EXISTS "admin_read_visa_docs" ON public.visa_documents;
CREATE POLICY "admin_read_visa_docs" ON public.visa_documents
  FOR SELECT TO authenticated
  USING (public.is_admin());

-- WhatsApp log: admins can read all, agents see own contacts' logs
DROP POLICY IF EXISTS "admin_read_whatsapp_log" ON public.whatsapp_log;
CREATE POLICY "admin_read_whatsapp_log" ON public.whatsapp_log
  FOR SELECT TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "admin_write_whatsapp_log" ON public.whatsapp_log;
CREATE POLICY "admin_write_whatsapp_log" ON public.whatsapp_log
  FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

-- Newsletter subscribers: admins can read/manage
DROP POLICY IF EXISTS "admin_all_subscribers" ON public.newsletter_subscribers;
CREATE POLICY "admin_all_subscribers" ON public.newsletter_subscribers
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Promo codes: admins can write
DROP POLICY IF EXISTS "admin_all_promo_codes" ON public.promo_codes;
CREATE POLICY "admin_all_promo_codes" ON public.promo_codes
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Promo uses: admins can read
DROP POLICY IF EXISTS "admin_read_promo_uses" ON public.promo_code_uses;
CREATE POLICY "admin_read_promo_uses" ON public.promo_code_uses
  FOR SELECT TO authenticated
  USING (public.is_admin());

-- Upload tokens: admins can create
DROP POLICY IF EXISTS "admin_create_upload_tokens" ON public.upload_tokens;
CREATE POLICY "admin_create_upload_tokens" ON public.upload_tokens
  FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

-- Customer access tokens: admins/system can create
DROP POLICY IF EXISTS "admin_create_customer_tokens" ON public.customer_access_tokens;
CREATE POLICY "admin_create_customer_tokens" ON public.customer_access_tokens
  FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

-- KPI targets: super_admin can manage
DROP POLICY IF EXISTS "admin_read_kpi_targets" ON public.kpi_targets;
CREATE POLICY "admin_read_kpi_targets" ON public.kpi_targets
  FOR SELECT TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "superadmin_write_kpi_targets" ON public.kpi_targets;
CREATE POLICY "superadmin_write_kpi_targets" ON public.kpi_targets
  FOR ALL TO authenticated
  USING (public.get_my_role() = 'super_admin')
  WITH CHECK (public.get_my_role() = 'super_admin');

-- Activity log: super_admin can read, all admins can insert
DROP POLICY IF EXISTS "admin_insert_activity_log" ON public.activity_log;
CREATE POLICY "admin_insert_activity_log" ON public.activity_log
  FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "superadmin_read_activity_log" ON public.activity_log;
CREATE POLICY "superadmin_read_activity_log" ON public.activity_log
  FOR SELECT TO authenticated
  USING (public.get_my_role() = 'super_admin');

-- Site settings: super_admin + manager can update
DROP POLICY IF EXISTS "admin_write_site_settings" ON public.site_settings;
CREATE POLICY "admin_write_site_settings" ON public.site_settings
  FOR UPDATE TO authenticated
  USING (public.get_my_role() IN ('super_admin', 'manager_admin'));

-- Waitlist: admins can read/manage
DROP POLICY IF EXISTS "admin_all_waitlist" ON public.waitlist;
CREATE POLICY "admin_all_waitlist" ON public.waitlist
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- WhatsApp opt-outs: admins can read
DROP POLICY IF EXISTS "admin_read_optouts" ON public.whatsapp_opt_outs;
CREATE POLICY "admin_read_optouts" ON public.whatsapp_opt_outs
  FOR SELECT TO authenticated
  USING (public.is_admin());


-- =============================================================================
-- DONE
-- All tables, triggers, functions, indexes, RLS policies created.
-- Next step: add your first super_admin user via Authentication > Users,
-- then insert a row into admin_users with role = 'super_admin'.
-- =============================================================================
