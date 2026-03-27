'use client'

import Image from 'next/image'
import { useMemo, useState } from 'react'
import { Newspaper, PlayCircle, X } from 'lucide-react'
import type { NewsItem } from '@/lib/news-data'
import { useAppSettings } from '@/components/AppSettingsProvider'
import { getTranslation } from '@/lib/translations'
import { BRAND_NAME } from '@/lib/brand'

export function NewsFeed({
  title = 'News',
  subtitle,
  items,
}: {
  title?: string
  subtitle?: string
  items: NewsItem[]
}) {
  const [active, setActive] = useState<NewsItem | null>(null)
  const { settings } = useAppSettings()
  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(settings.language, key)
  const updatedLabel = useMemo(() => (items.length ? t('updatedHourly') : 'No updates yet'), [items.length, t])

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
        <span className="text-xs text-gray-500">{updatedLabel}</span>
      </div>

      {items.length === 0 ? (
        <div className="rounded-xl border border-white/10 bg-black/25 p-4 text-sm text-gray-300">No news yet.</div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <article
              key={item.id}
              className="group overflow-hidden rounded-2xl border border-white/10 bg-black/25 hover:bg-white/[0.03] transition-colors"
            >
              <div className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center">
                <div className="relative h-28 w-full overflow-hidden rounded-xl border border-white/10 sm:h-20 sm:w-32">
                  <Image src={item.image} alt={item.title} fill className="object-cover" sizes="256px" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-base font-bold text-white">{item.title}</p>
                  <p className="mt-1 line-clamp-2 text-sm text-gray-300">{item.summary}</p>
                  <p className="mt-2 text-xs text-gray-400">
                    {item.source} • {item.time}
                  </p>
                </div>

                <div className="flex shrink-0 flex-wrap items-center gap-2">
                  {item.videoUrl ? (
                    <button
                      onClick={() => setActive(item)}
                      className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-semibold text-gray-100 hover:bg-white/[0.07]"
                    >
                      <PlayCircle size={14} className="text-[#f4a30a]" />
                      {t('trailer')}
                    </button>
                  ) : null}
                  <button
                    onClick={() => setActive(item)}
                    className="rounded-xl border border-[#f4a30a]/35 bg-[#f4a30a]/10 px-3 py-2 text-xs font-semibold text-[#f4a30a] hover:bg-[#f4a30a]/15"
                  >
                    {t('readMore')}
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {active ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-3xl overflow-hidden rounded-3xl border border-white/10 bg-[#070c18] shadow-[0_30px_80px_rgba(0,0,0,0.55)]">
            <div className="flex items-start justify-between gap-4 border-b border-white/10 px-5 py-4">
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-[0.22em] text-white/55">{BRAND_NAME} News</p>
                <h3 className="mt-2 text-xl font-black text-white">{active.title}</h3>
                <p className="mt-2 text-xs text-gray-400">
                  {active.source} • {active.time}
                </p>
              </div>
              <button
                onClick={() => setActive(null)}
                className="rounded-xl border border-white/10 bg-white/5 p-2 text-gray-200 hover:bg-white/10"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <div className="max-h-[78vh] overflow-y-auto p-5">
              <div className="relative h-56 overflow-hidden rounded-2xl border border-white/10">
                <Image src={active.image} alt={active.title} fill className="object-cover" sizes="900px" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
              </div>

              {active.videoUrl ? (
                <div className="mt-4 overflow-hidden rounded-2xl border border-white/10 bg-black/30">
                  <video controls playsInline src={active.videoUrl} className="h-64 w-full object-cover" />
                </div>
              ) : null}

              <p className="mt-4 text-sm text-gray-200 whitespace-pre-line">{active.content || active.summary}</p>

              {active.url ? (
                <a
                  href={active.url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-semibold text-gray-100 hover:bg-white/[0.07]"
                >
                  Open source
                </a>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </section>
  )
}
