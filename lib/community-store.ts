import { dispatchAppEvent, readJson, subscribeToKey, writeJson } from '@/lib/local-store'

export type CommunityKind = 'movie' | 'song' | 'match' | 'short'
export type CommunityStatus = 'pending' | 'published' | 'rejected'

export interface CommunityItem {
  id: string
  kind: CommunityKind
  title: string
  description: string
  imageUrl: string
  trailerUrl?: string
  createdAt: string
  createdBy: string
  createdByName?: string
  createdByEmail?: string
  status: CommunityStatus
}

export interface CommunityRating {
  id: string
  itemId: string
  userId: string
  stars: number
  createdAt: string
}

export interface CommunityLike {
  id: string
  itemId: string
  userId: string
  createdAt: string
}

const ITEMS_KEY = 'streamfy-community-items'
const RATINGS_KEY = 'streamfy-community-ratings'
const LIKES_KEY = 'streamfy-community-likes'
const EVENT_NAME = 'streamfy:community-updated'

const seedItems: CommunityItem[] = []
const seedRatings: CommunityRating[] = []
const seedLikes: CommunityLike[] = []

export function getCommunityItems() {
  return readJson<CommunityItem[]>(ITEMS_KEY, seedItems)
}

export function getCommunityRatings() {
  return readJson<CommunityRating[]>(RATINGS_KEY, seedRatings)
}

export function getCommunityLikes() {
  return readJson<CommunityLike[]>(LIKES_KEY, seedLikes)
}

export function setCommunityItems(items: CommunityItem[]) {
  writeJson(ITEMS_KEY, items)
  dispatchAppEvent(EVENT_NAME)
}

export function setCommunityRatings(ratings: CommunityRating[]) {
  writeJson(RATINGS_KEY, ratings)
  dispatchAppEvent(EVENT_NAME)
}

export function setCommunityLikes(likes: CommunityLike[]) {
  writeJson(LIKES_KEY, likes)
  dispatchAppEvent(EVENT_NAME)
}

export function subscribeToCommunity(callback: () => void) {
  const unsubA = subscribeToKey(ITEMS_KEY, EVENT_NAME, callback)
  const unsubB = subscribeToKey(RATINGS_KEY, EVENT_NAME, callback)
  const unsubC = subscribeToKey(LIKES_KEY, EVENT_NAME, callback)
  return () => {
    unsubA()
    unsubB()
    unsubC()
  }
}

export function getCommunityStats(itemId: string, ratings: CommunityRating[], likes: CommunityLike[]) {
  const itemRatings = ratings.filter((r) => r.itemId === itemId)
  const avgStars = itemRatings.length ? itemRatings.reduce((sum, r) => sum + r.stars, 0) / itemRatings.length : 0
  const likeCount = likes.filter((l) => l.itemId === itemId).length
  return { avgStars, ratingCount: itemRatings.length, likeCount }
}

export function shouldAutoPublish(stats: { avgStars: number; ratingCount: number; likeCount: number }) {
  return stats.likeCount >= 10 || (stats.ratingCount >= 5 && stats.avgStars >= 4.0)
}

