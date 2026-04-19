import { groq } from 'next-sanity'
import { client } from './client'

// ─── TypeScript types ─────────────────────────────────────────────────────────

export interface SanityImageRef {
  _type: 'image'
  asset: { _ref: string; _type: 'reference' }
  hotspot?: { x: number; y: number; height: number; width: number }
  crop?: { top: number; bottom: number; left: number; right: number }
}

export interface SanityTour {
  _id: string
  title: string
  slug: { current: string }
  shortDescription: string
  destination: { city: string; country: string }
  price: number
  duration: number
  groupSize: number
  heroImage: SanityImageRef
  gallery: SanityImageRef[]
  whatsIncluded: string[]
  highlights: string[]
  featured: boolean
  active: boolean
  category: 'leisure' | 'honeymoon' | 'corporate' | 'adventure'
}

export interface SanityBlogPost {
  _id: string
  title: string
  slug: { current: string }
  publishedAt: string
  heroImage: SanityImageRef
  excerpt: string
  body: unknown[]
  category: 'visa-tips' | 'travel-guides' | 'destination-spotlight' | 'packing-tips'
  featured: boolean
}

export interface SanityTestimonial {
  _id: string
  customerName: string
  city: string
  quote: string
  starRating: number
  tourBooked: string
  photo: SanityImageRef
}

export interface SanityVisaService {
  _id: string
  country: string
  flag: SanityImageRef
  processingTime: string
  priceNaira: number
  requirements: string[]
  successRate: number
}

// ─── Fetch options ────────────────────────────────────────────────────────────
// Revalidate every 60 seconds for ISR — content updates within 1 minute

const FETCH_OPTS = { next: { revalidate: 60 } }

// ─── Tours ────────────────────────────────────────────────────────────────────

const ALL_TOURS_QUERY = groq`
  *[_type == "tour" && active != false] | order(featured desc, _createdAt desc) {
    _id, title, slug, shortDescription, destination, price, duration,
    groupSize, heroImage, featured, active, category
  }
`

const FEATURED_TOURS_QUERY = groq`
  *[_type == "tour" && featured == true && active != false] | order(_createdAt desc) [0...3] {
    _id, title, slug, destination, price, duration, heroImage, featured
  }
`

const TOUR_BY_SLUG_QUERY = groq`
  *[_type == "tour" && slug.current == $slug][0] {
    _id, title, slug, shortDescription, destination, price, duration,
    groupSize, heroImage, gallery, whatsIncluded, highlights, featured, active, category
  }
`

export async function getAllTours(): Promise<SanityTour[]> {
  return client.fetch(ALL_TOURS_QUERY, {}, FETCH_OPTS)
}

export async function getFeaturedTours(): Promise<SanityTour[]> {
  return client.fetch(FEATURED_TOURS_QUERY, {}, FETCH_OPTS)
}

export async function getTourBySlug(slug: string): Promise<SanityTour | null> {
  return client.fetch(TOUR_BY_SLUG_QUERY, { slug }, FETCH_OPTS)
}

// ─── Blog ─────────────────────────────────────────────────────────────────────

const ALL_BLOG_POSTS_QUERY = groq`
  *[_type == "blogPost"] | order(publishedAt desc) {
    _id, title, slug, publishedAt, heroImage, excerpt, category, featured
  }
`

export async function getAllBlogPosts(): Promise<SanityBlogPost[]> {
  return client.fetch(ALL_BLOG_POSTS_QUERY, {}, FETCH_OPTS)
}

// ─── Testimonials ─────────────────────────────────────────────────────────────

const APPROVED_TESTIMONIALS_QUERY = groq`
  *[_type == "testimonial" && approved == true] | order(_createdAt desc) {
    _id, customerName, city, quote, starRating, tourBooked, photo
  }
`

export async function getApprovedTestimonials(): Promise<SanityTestimonial[]> {
  return client.fetch(APPROVED_TESTIMONIALS_QUERY, {}, FETCH_OPTS)
}

// ─── Visa services ────────────────────────────────────────────────────────────

const ALL_VISA_SERVICES_QUERY = groq`
  *[_type == "visaService" && active != false] | order(country asc) {
    _id, country, flag, processingTime, priceNaira, requirements, successRate
  }
`

export async function getAllVisaServices(): Promise<SanityVisaService[]> {
  return client.fetch(ALL_VISA_SERVICES_QUERY, {}, FETCH_OPTS)
}
