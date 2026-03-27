'use client'

import Link from 'next/link'
import { useMemo } from 'react'
import { ChevronRight } from 'lucide-react'
import { shortVideos, type ShortsCategory } from '@/lib/shorts-data'
import { ShortPreviewCard } from '@/components/shorts/ShortPreviewCard'

export function ShortsShelf({ title, subtitle, category, limit = 4 }: { title: string; subtitle?: string; category: ShortsCategory; limit?: number }) {
  const items = useMemo(() => shortVideos.filter((s) => s.category === category).slice(0, limit), [category, limit])
  if (!items.length) return null

  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h2 className="text-white text-2xl font-bold">{title}</h2>
          {subtitle ? <p className="text-gray-400 text-sm mt-1">{subtitle}</p> : null}
        </div>
        <Link href="/shorts" className="flex items-center gap-1 text-[color:var(--app-accent-a)] text-sm hover:underline">
          See all <ChevronRight size={14} />
        </Link>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((s) => (
          <ShortPreviewCard key={s.id} short={s} />
        ))}
      </div>
    </section>
  )
}

