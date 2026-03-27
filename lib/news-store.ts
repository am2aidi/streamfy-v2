import type { NewsItem, NewsCategory } from '@/lib/news-data'
import { newsItems as seedNewsItems } from '@/lib/news-data'
import { dispatchAppEvent, readJson, subscribeToKey, writeJson } from '@/lib/local-store'

const STORAGE_KEY = 'streamfy-news-items'
const EVENT_NAME = 'streamfy:news-updated'

export function getNewsItems(): NewsItem[] {
  return readJson<NewsItem[]>(STORAGE_KEY, seedNewsItems)
}

export function setNewsItems(items: NewsItem[]) {
  writeJson(STORAGE_KEY, items)
  dispatchAppEvent(EVENT_NAME)
}

export function subscribeToNews(callback: () => void) {
  return subscribeToKey(STORAGE_KEY, EVENT_NAME, callback)
}

export function getNewsByCategoryFrom(items: NewsItem[], category: NewsCategory) {
  return items.filter((item) => item.category === category)
}

