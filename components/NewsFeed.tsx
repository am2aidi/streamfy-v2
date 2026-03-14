'use client'

import Image from 'next/image'
import { Newspaper } from 'lucide-react'
import type { NewsItem } from '@/lib/news-data'

export function NewsFeed({
  title = 'News',
  subtitle,
  items,
}: {
  title?: string
  subtitle?: string
  items: NewsItem[]
}) {
  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h2 className="inline-flex items-center gap-2 text-white text-lg font-bold">
            <Newspaper size={18} className="text-[#f4a30a]" />
            {title}
          </h2>
          {subtitle ? <p className="mt-1 text-xs text-gray-500">{subtitle}</p> : null}
        </div>
        <span className="text-xs text-gray-500">Updated hourly</span>
      </div>

      {items.length === 0 ? (
        <div className="rounded-xl border border-white/10 bg-black/25 p-4 text-sm text-gray-300">No news yet.</div>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <article key={item.id} className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/25 p-2.5">
              <div className="relative h-16 w-24 overflow-hidden rounded-lg border border-white/10">
                <Image src={item.image} alt={item.title} fill className="object-cover" sizes="96px" />
              </div>
              <div className="min-w-0">
                <p className="line-clamp-2 text-sm font-semibold text-white">{item.title}</p>
                <p className="mt-1 text-xs text-gray-400">
                  {item.source} • {item.time}
                </p>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}

