'use client'

import { useEffect, useMemo, useState } from 'react'
import type { MusicTrack } from '@/lib/music-data'
import { musicTracks as seedTracks } from '@/lib/music-data'

export function useTracks() {
  const [items, setItems] = useState<MusicTrack[]>(seedTracks)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    let cancelled = false

    ;(async () => {
      try {
        const res = await fetch('/api/tracks', { cache: 'no-store' })
        if (!res.ok) return
        const data = (await res.json()) as { items: MusicTrack[] }
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
