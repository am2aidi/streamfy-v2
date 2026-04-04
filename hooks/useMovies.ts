'use client'

import { useEffect, useMemo, useState } from 'react'
import type { MovieItem } from '@/lib/movies-data'
import { movieCards as seedMovies } from '@/lib/movies-data'

export function useMovies() {
  const [items, setItems] = useState<MovieItem[]>(seedMovies)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    let cancelled = false

    ;(async () => {
      try {
        const res = await fetch('/api/movies', { cache: 'no-store' })
        if (!res.ok) return
        const data = (await res.json()) as { items: MovieItem[] }
        if (!cancelled) setItems(data.items)
      } catch {
        // keep seeded fallback
      } finally {
        if (!cancelled) setLoaded(true)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [])

  return useMemo(() => ({ items, loaded }), [items, loaded])
}
