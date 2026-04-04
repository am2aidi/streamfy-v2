'use client'

import { useEffect, useMemo, useState } from 'react'
import type { ShortVideo } from '@/lib/shorts-data'
import { shortVideos as seedShorts } from '@/lib/shorts-data'

export function useShorts() {
  const [items, setItems] = useState<ShortVideo[]>(seedShorts)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    let cancelled = false

    ;(async () => {
      try {
        const res = await fetch('/api/shorts', { cache: 'no-store' })
        if (!res.ok) return
        const data = (await res.json()) as { items: ShortVideo[] }
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
