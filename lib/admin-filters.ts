'use client'

import { useEffect, useMemo, useState } from 'react'

export type FilterSection = 'movies' | 'music' | 'sports'

const DEFAULT_FILTERS: Record<FilterSection, string[]> = {
  movies: ['Action', 'Comedy', 'Sci-Fi', 'Drama', 'Mystery', 'Romance'],
  music: ['Pop', 'Rap', 'EDM', 'Soul', 'Afrobeat', 'Jazz'],
  sports: ['Football', 'Basketball', 'Volleyball', 'Tennis', 'Formula 1'],
}

export function useFilterOptions(section: FilterSection) {
  const [filters, setFilters] = useState<Record<FilterSection, string[]>>(DEFAULT_FILTERS)

  useEffect(() => {
    let cancelled = false

    ;(async () => {
      try {
        const res = await fetch('/api/admin/settings', { cache: 'no-store' })
        if (!res.ok) return
        const data = (await res.json()) as { filterOptions?: Record<FilterSection, string[]> }
        if (!cancelled && data.filterOptions) setFilters(data.filterOptions)
      } catch {
        // keep defaults
      }
    })()

    return () => {
      cancelled = true
    }
  }, [])

  return useMemo(() => filters[section] ?? DEFAULT_FILTERS[section], [filters, section])
}
