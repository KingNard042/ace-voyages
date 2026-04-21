export interface ItineraryDay {
  id: string
  title: string
  location: string
  description: string
  activities: string[]
}

export interface FormState {
  // Step 1
  title: string
  short_description: string
  category: string
  duration_days: number
  duration_nights: number
  destination_city: string
  destination_country: string
  max_guests: number
  // Step 2
  price_naira: number
  discounted_price: number | null
  include_vat: boolean
  early_bird: boolean
  itinerary: ItineraryDay[]
  // Step 3
  hero_image_url: string
  gallery_urls: string[]
  highlights: string[]
  meta_title: string
  meta_description: string
  is_featured: boolean
}

export type FormUpdater = <K extends keyof FormState>(key: K, value: FormState[K]) => void

export const INITIAL_FORM: FormState = {
  title: '',
  short_description: '',
  category: 'culture',
  duration_days: 7,
  duration_nights: 6,
  destination_city: 'Lagos',
  destination_country: 'Nigeria',
  max_guests: 12,
  price_naira: 0,
  discounted_price: null,
  include_vat: false,
  early_bird: false,
  itinerary: [],
  hero_image_url: '',
  gallery_urls: [],
  highlights: [],
  meta_title: '',
  meta_description: '',
  is_featured: false,
}
