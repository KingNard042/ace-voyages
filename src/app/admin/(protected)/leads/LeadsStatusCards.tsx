'use client'

import { useSearchParams, useRouter, usePathname } from 'next/navigation'

interface StatusConfig {
  key: string
  label: string
  activeBg: string
  activeBorder: string
  activeText: string
}

const STATUS_CONFIG: StatusConfig[] = [
  {
    key: 'new',
    label: 'New',
    activeBg: '#EFF6FF',
    activeBorder: '#1D4ED8',
    activeText: '#1D4ED8',
  },
  {
    key: 'contacted',
    label: 'Contacted',
    activeBg: '#FFFBEB',
    activeBorder: '#D97706',
    activeText: '#B45309',
  },
  {
    key: 'converted',
    label: 'Converted',
    activeBg: '#F0FDF4',
    activeBorder: '#10B981',
    activeText: '#065F46',
  },
  {
    key: 'cold',
    label: 'Cold',
    activeBg: '#F9FAFB',
    activeBorder: '#9CA3AF',
    activeText: '#374151',
  },
]

interface Props {
  counts: Record<string, number>
  total: number
}

export default function LeadsStatusCards({ counts, total }: Props) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const activeStatus = searchParams.get('status')

  function handleClick(status: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (activeStatus === status) {
      params.delete('status')
    } else {
      params.set('status', status)
    }
    const query = params.toString()
    router.push(query ? `${pathname}?${query}` : pathname)
  }

  return (
    <div className="space-y-3">
      {/* All-leads pill — appears when a filter is active */}
      {activeStatus && (
        <button
          onClick={() => {
            const params = new URLSearchParams(searchParams.toString())
            params.delete('status')
            const query = params.toString()
            router.push(query ? `${pathname}?${query}` : pathname)
          }}
          className="flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-medium text-[#6B7280] shadow-[0_2px_8px_rgba(0,0,0,0.06)] transition-all hover:text-[#1B3A6B]"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-[#9CA3AF]" />
          Show all {total} leads
        </button>
      )}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {STATUS_CONFIG.map((s) => {
          const isActive = activeStatus === s.key
          const count = counts[s.key] ?? 0

          return (
            <button
              key={s.key}
              onClick={() => handleClick(s.key)}
              className="group relative flex flex-col rounded-2xl p-5 text-left transition-all duration-200"
              style={{
                backgroundColor: isActive ? s.activeBg : 'white',
                borderLeft: `4px solid ${isActive ? s.activeBorder : 'transparent'}`,
                boxShadow: isActive
                  ? `0 6px 24px rgba(0,0,0,0.10), 0 0 0 1px ${s.activeBorder}22`
                  : '0 2px 12px rgba(0,0,0,0.06)',
              }}
            >
              {/* Active indicator dot */}
              <div
                className="absolute right-3.5 top-3.5 h-2 w-2 rounded-full transition-all duration-200"
                style={{
                  backgroundColor: isActive ? s.activeBorder : 'transparent',
                  boxShadow: isActive ? `0 0 0 3px ${s.activeBorder}22` : 'none',
                }}
              />

              <p
                className="text-sm font-medium transition-colors duration-200"
                style={{ color: isActive ? s.activeText : '#6B7280' }}
              >
                {s.label}
              </p>

              <p
                className="mt-1.5 text-3xl font-bold leading-none transition-colors duration-200"
                style={{
                  color: isActive ? s.activeText : '#1A1A2E',
                  fontFamily: 'var(--font-manrope, Manrope, sans-serif)',
                }}
              >
                {count}
              </p>

              {/* Progress bar — shows share of total */}
              <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-[#F3F4F6]">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: total > 0 ? `${Math.round((count / total) * 100)}%` : '0%',
                    backgroundColor: isActive ? s.activeBorder : '#D1D5DB',
                  }}
                />
              </div>

              <p
                className="mt-1 text-[10px] transition-colors duration-200"
                style={{ color: isActive ? s.activeText : '#9CA3AF' }}
              >
                {total > 0 ? `${Math.round((count / total) * 100)}%` : '0%'} of total
              </p>
            </button>
          )
        })}
      </div>
    </div>
  )
}
