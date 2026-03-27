'use client'

import { useEffect, useMemo, useState } from 'react'
import type { CommunityItem, CommunityKind, CommunityLike, CommunityRating, CommunityStatus } from '@/lib/community-store'
import {
  getCommunityItems,
  getCommunityLikes,
  getCommunityRatings,
  getCommunityStats,
  setCommunityItems,
  setCommunityLikes,
  setCommunityRatings,
  shouldAutoPublish,
  subscribeToCommunity,
} from '@/lib/community-store'

function uid(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

export function useCommunity() {
  const [items, setItemsState] = useState<CommunityItem[]>(() => getCommunityItems())
  const [ratings, setRatingsState] = useState<CommunityRating[]>(() => getCommunityRatings())
  const [likes, setLikesState] = useState<CommunityLike[]>(() => getCommunityLikes())

  useEffect(() => {
    return subscribeToCommunity(() => {
      setItemsState(getCommunityItems())
      setRatingsState(getCommunityRatings())
      setLikesState(getCommunityLikes())
    })
  }, [])

  return useMemo(() => {
    const setItems = (next: CommunityItem[] | ((prev: CommunityItem[]) => CommunityItem[])) => {
      const resolved = typeof next === 'function' ? (next as (prev: CommunityItem[]) => CommunityItem[])(getCommunityItems()) : next
      setCommunityItems(resolved)
    }

    const updateItemStatus = (itemId: string, status: CommunityStatus) => {
      setItems((prev) => prev.map((i) => (i.id === itemId ? { ...i, status } : i)))
    }

    const createItem = (input: {
      kind: CommunityKind
      title: string
      description: string
      imageUrl: string
      trailerUrl?: string
      createdBy: string
    }) => {
      const item: CommunityItem = {
        id: uid('ugc'),
        kind: input.kind,
        title: input.title.trim(),
        description: input.description.trim(),
        imageUrl: input.imageUrl.trim(),
        trailerUrl: input.trailerUrl?.trim() || undefined,
        createdAt: new Date().toISOString(),
        createdBy: input.createdBy,
        status: 'pending',
      }
      setItems((prev) => [item, ...prev])
      return item
    }

    const rate = (itemId: string, userId: string, stars: number) => {
      const safeStars = Math.min(5, Math.max(1, Math.round(stars)))
      const existing = getCommunityRatings().find((r) => r.itemId === itemId && r.userId === userId)
      const nextRatings = existing
        ? getCommunityRatings().map((r) => (r.id === existing.id ? { ...r, stars: safeStars, createdAt: new Date().toISOString() } : r))
        : [{ id: uid('rate'), itemId, userId, stars: safeStars, createdAt: new Date().toISOString() }, ...getCommunityRatings()]
      setCommunityRatings(nextRatings)

      const stats = getCommunityStats(itemId, nextRatings, getCommunityLikes())
      if (shouldAutoPublish(stats)) {
        const item = getCommunityItems().find((i) => i.id === itemId)
        if (item && item.status === 'pending') updateItemStatus(itemId, 'published')
      }
    }

    const toggleLike = (itemId: string, userId: string) => {
      const current = getCommunityLikes()
      const existing = current.find((l) => l.itemId === itemId && l.userId === userId)
      const likeAdded = !existing
      const nextLikes = existing ? current.filter((l) => l.id !== existing.id) : [{ id: uid('like'), itemId, userId, createdAt: new Date().toISOString() }, ...current]
      setCommunityLikes(nextLikes)

      if (likeAdded) {
        const currentRatings = getCommunityRatings()
        const hasRating = currentRatings.some((r) => r.itemId === itemId && r.userId === userId)
        if (!hasRating) {
          setCommunityRatings([{ id: uid('rate'), itemId, userId, stars: 5, createdAt: new Date().toISOString() }, ...currentRatings])
        }
      }

      const stats = getCommunityStats(itemId, getCommunityRatings(), nextLikes)
      if (shouldAutoPublish(stats)) {
        const item = getCommunityItems().find((i) => i.id === itemId)
        if (item && item.status === 'pending') updateItemStatus(itemId, 'published')
      }
    }

    const statsFor = (itemId: string) => getCommunityStats(itemId, ratings, likes)
    const myRatingFor = (itemId: string, userId: string) => ratings.find((r) => r.itemId === itemId && r.userId === userId)?.stars ?? 0
    const likedByMe = (itemId: string, userId: string) => likes.some((l) => l.itemId === itemId && l.userId === userId)

    return { items, ratings, likes, setItems, createItem, updateItemStatus, rate, toggleLike, statsFor, myRatingFor, likedByMe }
  }, [items, ratings, likes])
}
