import { notFound } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import type { FormState, ItineraryDay } from '../../new/types'
import EditTourForm from './EditTourForm'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditTourPage({ params }: Props) {
  const { id } = await params
  const supabase = createServerSupabaseClient()

  const { data: tour, error } = await supabase
    .from('tours')
    .select('*')
    .eq('tour_id', id)
    .single()

  if (error || !tour) notFound()

  let itinerary: ItineraryDay[] = []
  if (tour.full_description) {
    try {
      itinerary = JSON.parse(tour.full_description)
    } catch {
      itinerary = []
    }
  }

  const form: FormState = {
    title: tour.title ?? '',
    short_description: tour.short_description ?? '',
    category: tour.category ?? 'leisure',
    duration_days: tour.duration_days ?? 1,
    duration_nights: Math.max(0, (tour.duration_days ?? 1) - 1),
    destination_city: tour.destination_city ?? '',
    destination_country: tour.destination_country ?? '',
    max_guests: tour.max_guests ?? 12,
    price_naira: tour.price_naira ?? 0,
    discounted_price: null,
    include_vat: false,
    early_bird: false,
    itinerary,
    hero_image_url: tour.hero_image_url ?? '',
    gallery_urls: tour.gallery_urls ?? [],
    highlights: tour.highlights ?? [],
    meta_title: '',
    meta_description: '',
    is_featured: tour.is_featured ?? false,
  }

  return <EditTourForm tourId={id} initialForm={form} initialIsActive={tour.is_active ?? false} />
}
