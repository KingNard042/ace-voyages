import { createServerSupabaseClient } from '@/lib/supabase/server'

export interface Tour {
  id: string
  slug: string
  title: string
  destination_city: string
  destination_country: string
  price: number
  duration_days: number
  hero_image_url: string | null
  is_featured: boolean
  badge?: string
}

export interface Testimonial {
  id: string
  customer_name: string
  city: string | null
  quote: string
  star_rating: number
}

export async function getFeaturedTours(): Promise<Tour[]> {
  try {
    const supabase = createServerSupabaseClient()
    const { data, error } = await supabase
      .from('tours')
      .select('id, slug, title, destination_city, destination_country, price, duration_days, hero_image_url, is_featured')
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

export async function getApprovedTestimonials(): Promise<Testimonial[]> {
  try {
    const supabase = createServerSupabaseClient()
    const { data, error } = await supabase
      .from('testimonials')
      .select('id, customer_name, city, quote, star_rating')
      .eq('approved', true)
      .order('created_at', { ascending: false })
      .limit(6)

    if (error || !data?.length) return []
    return data
  } catch {
    return []
  }
}
