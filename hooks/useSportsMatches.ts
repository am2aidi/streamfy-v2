'use client'

import { useEffect, useMemo, useState } from 'react'
import type { SportsMatch, SportsTab } from '@/lib/sports-data'
import { getAllMatches as getSeedMatches } from '@/lib/sports-data'

type MatchItem = SportsMatch & { id: string; tab: SportsTab }

export function useSportsMatches() {
  const [items, setItems] = useState<MatchItem[]>(() => getSeedMatches())
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    let cancelled = false

    ;(async () => {
      try {
        const res = await fetch('/api/sports-matches', { cache: 'no-store' })
        if (!res.ok) return
        const data = (await res.json()) as { items: MatchItem[] }
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
