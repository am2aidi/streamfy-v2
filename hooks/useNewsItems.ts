'use client'

import { useEffect, useMemo, useState } from 'react'
import type { NewsItem, NewsCategory } from '@/lib/news-data'
import { getNewsByCategoryFrom, getNewsItems, setNewsItems, subscribeToNews } from '@/lib/news-store'

export function useNewsItems() {
  const [items, setItems] = useState<NewsItem[]>(() => getNewsItems())

  useEffect(() => subscribeToNews(() => setItems(getNewsItems())), [])

  return useMemo(
    () => ({
      items,
      setItems: (next: NewsItem[] | ((prev: NewsItem[]) => NewsItem[])) => {
        const resolved = typeof next === 'function' ? (next as (prev: NewsItem[]) => NewsItem[])(getNewsItems()) : next
        setNewsItems(resolved)
      },
      byCategory: (category: NewsCategory) => getNewsByCategoryFrom(items, category),
    }),
    [items],
  )
}

