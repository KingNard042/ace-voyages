'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { FormState } from './types'

export interface SaveResult {
  success: boolean
  id?: string
  error?: string
}

function makeSlug(title: string): string {
  return (
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') +
    '-' +
    Date.now()
  )
}

const VALID_CATEGORIES = ['leisure', 'honeymoon', 'corporate', 'adventure']

function buildTourRecord(form: FormState, isActive: boolean) {
  const allActivities = form.itinerary.flatMap((d) => d.activities)
  const uniqueActivities = [...new Set(allActivities)]

  return {
    title: form.title.trim(),
    slug: makeSlug(form.title),
    short_description: form.short_description.trim() || null,
    full_description: form.itinerary.length > 0 ? JSON.stringify(form.itinerary) : null,
    category: VALID_CATEGORIES.includes(form.category) ? form.category : null,
    duration_days: form.duration_days,
    destination_city: form.destination_city.trim(),
    destination_country: form.destination_country.trim(),
    max_guests: form.max_guests,
    price_naira: form.price_naira,
    hero_image_url: form.hero_image_url.trim() || null,
    gallery_urls: form.gallery_urls.length > 0 ? form.gallery_urls : null,
    whats_included: uniqueActivities.length > 0 ? uniqueActivities : null,
    highlights: form.highlights.length > 0 ? form.highlights : null,
    is_featured: form.is_featured,
    is_active: isActive,
  }
}

export async function saveTour(
  form: FormState,
  isActive: boolean,
  draftId?: string,
): Promise<SaveResult> {
  try {
    const supabase = createServerSupabaseClient()
    const record = buildTourRecord(form, isActive)

    if (draftId) {
      const { error } = await supabase
        .from('tours')
        .update(record)
        .eq('tour_id', draftId)
      if (error) return { success: false, error: error.message }
      revalidatePath('/admin/tours')
      return { success: true, id: draftId }
    }

    const { data, error } = await supabase
      .from('tours')
      .insert(record)
      .select('tour_id')
      .single()
    if (error) return { success: false, error: error.message }
    revalidatePath('/admin/tours')
    return { success: true, id: data.tour_id }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Unexpected error' }
  }
}

export async function updateTour(
  form: FormState,
  tourId: string,
  isActive: boolean,
): Promise<SaveResult> {
  try {
    const supabase = createServerSupabaseClient()
    const record = buildTourRecord(form, isActive)
    const { error } = await supabase.from('tours').update(record).eq('tour_id', tourId)
    if (error) return { success: false, error: error.message }
    revalidatePath('/admin/tours')
    revalidatePath(`/admin/tours/${tourId}/edit`)
    return { success: true, id: tourId }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Unexpected error' }
  }
}
