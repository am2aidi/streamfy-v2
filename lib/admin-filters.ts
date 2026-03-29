import { useMemo } from 'react'

export type FilterSection = 'movies' | 'music' | 'sports'

const DEFAULT_FILTERS: Record<FilterSection, string[]> = {
  movies: ['Action', 'Comedy', 'Sci-Fi', 'Drama', 'Mystery', 'Romance'],
  music: ['Pop', 'Rap', 'EDM', 'Soul', 'Afrobeat', 'Jazz'],
  sports: ['Football', 'Basketball', 'Volleyball', 'Tennis', 'Formula 1'],
}

const STORAGE_KEY = 'streamfy-admin-filter-options'

function readFilters(): Record<FilterSection, string[]> {
  if (typeof window === 'undefined') return DEFAULT_FILTERS
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_FILTERS
    const parsed = JSON.parse(raw) as Partial<Record<FilterSection, string[]>>
    return {
      movies: parsed.movies?.length ? parsed.movies : DEFAULT_FILTERS.movies,
      music: parsed.music?.length ? parsed.music : DEFAULT_FILTERS.music,
      sports: parsed.sports?.length ? parsed.sports : DEFAULT_FILTERS.sports,
    }
  } catch {
    return DEFAULT_FILTERS
  }
}

export function useFilterOptions(section: FilterSection) {
  return useMemo(() => readFilters()[section], [section])
}
