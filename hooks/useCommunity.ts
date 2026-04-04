'use client'

import { useEffect, useMemo, useState } from 'react'
import type { CommunityItem, CommunityKind, CommunityLike, CommunityRating, CommunityStatus } from '@/lib/community-store'
import { getCommunityStats, shouldAutoPublish } from '@/lib/community-store'

function uid(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

export function useCommunity() {
  const [items, setItemsState] = useState<CommunityItem[]>([])
  const [ratings, setRatingsState] = useState<CommunityRating[]>([])
  const [likes, setLikesState] = useState<CommunityLike[]>([])

  const refresh = async () => {
    const res = await fetch('/api/community', { cache: 'no-store' })
    if (!res.ok) throw new Error('Failed to load community')
    const data = (await res.json()) as {
      items: CommunityItem[]
      ratings: CommunityRating[]
      likes: CommunityLike[]
    }
    setItemsState(data.items)
    setRatingsState(data.ratings)
    setLikesState(data.likes)
  }

  useEffect(() => {
    void refresh().catch(() => {})
  }, [])

  return useMemo(() => {
    const setItems = (next: CommunityItem[] | ((prev: CommunityItem[]) => CommunityItem[])) => {
      const resolved = typeof next === 'function' ? (next as (prev: CommunityItem[]) => CommunityItem[])(items) : next
      const removedIds = items.filter((item) => !resolved.some((candidate) => candidate.id === item.id)).map((item) => item.id)

      void (async () => {
        for (const item of removedIds) {
          await fetch(`/api/community/${item}`, { method: 'DELETE' })
        }
        await refresh()
      })().catch(() => {})
    }

    const updateItemStatus = (itemId: string, status: CommunityStatus) => {
      void (async () => {
        await fetch(`/api/community/${itemId}/status`, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ status }),
        })
        await refresh()
      })().catch(() => {})
    }

    const createItem = (input: {
      kind: CommunityKind
      title: string
      description: string
      imageUrl: string
      trailerUrl?: string
      createdBy: string
    }) => {
      const tempId = uid('ugc')
      void (async () => {
        await fetch('/api/community', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(input),
        })
        await refresh()
      })().catch(() => {})
      return tempId
    }

    const rate = (itemId: string, userId: string, stars: number) => {
      const safeStars = Math.min(5, Math.max(1, Math.round(stars)))
      void (async () => {
        const res = await fetch(`/api/community/${itemId}/rate`, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ userId, stars: safeStars }),
        })

        if (res.ok) {
          const data = (await res.json()) as { likes: CommunityLike[]; ratings: CommunityRating[] }
          setLikesState(data.likes)
          setRatingsState(data.ratings)
          const stats = getCommunityStats(itemId, data.ratings, data.likes)
          if (shouldAutoPublish(stats)) updateItemStatus(itemId, 'published')
        }
      })().catch(() => {})
    }

    const toggleLike = (itemId: string, userId: string) => {
      void (async () => {
        const res = await fetch(`/api/community/${itemId}/like`, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ userId }),
        })

        if (res.ok) {
          const data = (await res.json()) as { likes: CommunityLike[]; ratings: CommunityRating[] }
          setLikesState(data.likes)
          setRatingsState(data.ratings)
          const stats = getCommunityStats(itemId, data.ratings, data.likes)
          if (shouldAutoPublish(stats)) updateItemStatus(itemId, 'published')
        }
      })().catch(() => {})
    }

    const statsFor = (itemId: string) => getCommunityStats(itemId, ratings, likes)
    const myRatingFor = (itemId: string, userId: string) => ratings.find((r) => r.itemId === itemId && r.userId === userId)?.stars ?? 0
    const likedByMe = (itemId: string, userId: string) => likes.some((l) => l.itemId === itemId && l.userId === userId)

    return { items, ratings, likes, setItems, createItem, updateItemStatus, rate, toggleLike, statsFor, myRatingFor, likedByMe }
  }, [items, ratings, likes])
}
