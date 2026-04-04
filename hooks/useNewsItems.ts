'use client'

import { useEffect, useMemo, useState } from 'react'
import type { NewsItem, NewsCategory } from '@/lib/news-data'
import { newsItems as seedNewsItems } from '@/lib/news-data'

export function useNewsItems() {
  const [items, setItems] = useState<NewsItem[]>(seedNewsItems)

  const refresh = async () => {
    const res = await fetch('/api/news', { cache: 'no-store' })
    if (!res.ok) throw new Error('Failed to load news')
    const data = (await res.json()) as { items: NewsItem[] }
    setItems(data.items)
  }

  useEffect(() => {
    void refresh().catch(() => {})
  }, [])

  return useMemo(
    () => ({
      items,
      setItems: (next: NewsItem[] | ((prev: NewsItem[]) => NewsItem[])) => {
        const resolved = typeof next === 'function' ? (next as (prev: NewsItem[]) => NewsItem[])(items) : next
        const previousIds = new Set(items.map((item) => item.id))
        const nextIds = new Set(resolved.map((item) => item.id))
        const removedIds = items.filter((item) => !nextIds.has(item.id)).map((item) => item.id)

        void (async () => {
          for (const item of resolved) {
            await fetch('/api/news', {
              method: 'POST',
              headers: { 'content-type': 'application/json' },
              body: JSON.stringify(item),
            })
          }

          for (const id of removedIds) {
            if (!previousIds.has(id)) continue
            await fetch(`/api/news/${id}`, { method: 'DELETE' })
          }

          await refresh()
        })().catch(() => {})
      },
      byCategory: (category: NewsCategory) => items.filter((item) => item.category === category),
    }),
    [items],
  )
}

