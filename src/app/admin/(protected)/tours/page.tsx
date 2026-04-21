import { createServerSupabaseClient } from '@/lib/supabase/server'
import ToursClient from './ToursClient'

export const metadata = { title: 'Tours — ACE Voyages Admin' }

const PAGE_SIZE = 6

type PageProps = { searchParams: Promise<{ page?: string }> }

export default async function ToursPage({ searchParams }: PageProps) {
  const { page: pageParam } = await searchParams
  const page = Math.max(1, parseInt(pageParam ?? '1', 10))
  const from = (page - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  const supabase = createServerSupabaseClient()

  const [activeResult, durationResult, toursResult] = await Promise.allSettled([
    supabase.from('tours').select('*', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('tours').select('duration_days').eq('is_active', true),
    supabase
      .from('tours')
      .select(
        'tour_id, title, slug, destination_city, destination_country, price_naira, duration_days, hero_image_url, short_description, is_active, is_featured, category, max_guests',
        { count: 'exact' },
      )
      .order('is_featured', { ascending: false })
      .order('created_at', { ascending: false })
      .range(from, to),
  ])

  const activeTours =
    activeResult.status === 'fulfilled' ? (activeResult.value.count ?? 0) : 0

  const durationData =
    durationResult.status === 'fulfilled' ? (durationResult.value.data ?? []) : []
  const avgDuration =
    durationData.length > 0
      ? (
          durationData.reduce((s: number, t: { duration_days: number | null }) => s + (t.duration_days ?? 0), 0) /
          durationData.length
        ).toFixed(1)
      : '0.0'

  const tours =
    toursResult.status === 'fulfilled' ? (toursResult.value.data ?? []) : []
  const totalTours =
    toursResult.status === 'fulfilled' ? (toursResult.value.count ?? 0) : 0

  return (
    <ToursClient
      tours={tours}
      totalTours={totalTours}
      activeTours={activeTours}
      avgDuration={avgDuration}
      currentPage={page}
      pageSize={PAGE_SIZE}
    />
  )
}
