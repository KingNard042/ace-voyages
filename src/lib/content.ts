import { createServerSupabaseClient } from '@/lib/supabase/server'

// ─── Blog ─────────────────────────────────────────────────────────────────────

export interface BlogPost {
  post_id: string
  title: string
  slug: string
  excerpt: string | null
  hero_image_url: string | null
  body_json: Record<string, unknown> | null
  body_text: string | null
  category: string | null
  is_featured: boolean
  is_published: boolean
  published_at: string | null
  created_at: string
}

export async function getPublishedBlogPosts(): Promise<BlogPost[]> {
  try {
    const supabase = createServerSupabaseClient()
    const { data, error } = await supabase
      .from('blog_posts')
      .select(
        'post_id, title, slug, excerpt, hero_image_url, body_text, category, is_featured, is_published, published_at, created_at',
      )
      .eq('is_published', true)
      .order('published_at', { ascending: false })

    if (error || !data?.length) return []
    return data as BlogPost[]
  } catch {
    return []
  }
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  try {
    const supabase = createServerSupabaseClient()
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('slug', slug)
      .eq('is_published', true)
      .single()

    if (error || !data) return null
    return data as BlogPost
  } catch {
    return null
  }
}

export interface Tour {
  tour_id: string
  slug: string
  title: string
  destination_city: string
  destination_country: string
  price_naira: number
  duration_days: number
  hero_image_url: string | null
  is_featured: boolean
  category: string | null
  short_description: string | null
}

export interface Testimonial {
  testimonial_id: string
  customer_name: string
  customer_city: string | null
  quote: string
  star_rating: number
}

export async function getFeaturedTours(): Promise<Tour[]> {
  try {
    const supabase = createServerSupabaseClient()
    const { data, error } = await supabase
      .from('tours')
      .select('tour_id, slug, title, destination_city, destination_country, price_naira, duration_days, hero_image_url, is_featured, category, short_description')
      .eq('is_active', true)
      .eq('is_featured', true)
      .order('created_at', { ascending: false })
      .limit(3)

    if (error || !data?.length) return []
    return data
  } catch {
    return []
  }
}

export async function getAllTours(): Promise<Tour[]> {
  try {
    const supabase = createServerSupabaseClient()
    const { data, error } = await supabase
      .from('tours')
      .select('tour_id, slug, title, destination_city, destination_country, price_naira, duration_days, hero_image_url, is_featured, category, short_description')
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (error || !data?.length) return []
    return data
  } catch {
    return []
  }
}

export async function getApprovedTestimonials(): Promise<Testimonial[]> {
  try {
    const supabase = createServerSupabaseClient()
    const { data, error } = await supabase
      .from('testimonials')
      .select('testimonial_id, customer_name, customer_city, quote, star_rating')
      .eq('is_approved', true)
      .order('created_at', { ascending: false })
      .limit(6)

    if (error || !data?.length) return []
    return data
  } catch {
    return []
  }
}
