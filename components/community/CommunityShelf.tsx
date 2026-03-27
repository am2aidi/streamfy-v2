'use client'

import Link from 'next/link'
import { useMemo } from 'react'
import { Star } from 'lucide-react'
import { useCommunity } from '@/hooks/useCommunity'
import { SmartCover } from '@/components/SmartCover'
import { BRAND_NAME } from '@/lib/brand'

export function CommunityShelf() {
  const community = useCommunity()
  const published = useMemo(() => community.items.filter((i) => i.status === 'published').slice(0, 5), [community.items])

  if (!published.length) return null

  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h2 className="text-white text-2xl font-bold">Community Picks</h2>
          <p className="text-gray-400 text-sm mt-1">Top-rated uploads from {BRAND_NAME} users.</p>
        </div>
        <Link href="/community" className="text-[color:var(--app-accent-a)] text-sm hover:underline">
          Explore
        </Link>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {published.map((item) => {
          const stats = community.statsFor(item.id)
          return (
            <Link
              key={item.id}
              href="/community"
              className="group overflow-hidden rounded-3xl border border-white/10 bg-black/25 hover:bg-white/[0.04] transition-colors"
            >
              <div className="relative h-44">
                <SmartCover src={item.imageUrl} alt={item.title} className="object-cover opacity-95 group-hover:opacity-100 transition-opacity" sizes="240px" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />
                <div className="absolute left-3 top-3 rounded-full bg-black/55 px-3 py-1 text-[11px] font-semibold text-white">{item.kind.toUpperCase()}</div>
              </div>
              <div className="p-3">
                <p className="text-white text-sm font-bold line-clamp-1">{item.title}</p>
                <p className="mt-1 inline-flex items-center gap-1 text-xs text-gray-300">
                  <Star size={12} className="text-[color:var(--app-accent-a)]" fill="currentColor" />
                  {stats.ratingCount ? stats.avgStars.toFixed(1) : 'New'} {stats.ratingCount ? `(${stats.ratingCount})` : ''}
                </p>
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
