'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function deleteTour(tourId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createServerSupabaseClient()
    const { error } = await supabase.from('tours').delete().eq('tour_id', tourId)
    if (error) return { success: false, error: error.message }
    revalidatePath('/admin/tours')
    revalidatePath('/tours')
    revalidatePath('/')
    return { success: true }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Unexpected error' }
  }
}

export async function toggleTourStatus(
  tourId: string,
  isActive: boolean,
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createServerSupabaseClient()
    const { error } = await supabase
      .from('tours')
      .update({ is_active: isActive })
      .eq('tour_id', tourId)
    if (error) return { success: false, error: error.message }
    revalidatePath('/admin/tours')
    revalidatePath('/tours')
    revalidatePath('/')
    return { success: true }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Unexpected error' }
  }
}
