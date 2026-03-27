'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Heart, PlayCircle } from 'lucide-react'
import { Sidebar } from '@/components/Sidebar'
import { Header } from '@/components/Header'
import { useAppSettings } from '@/components/AppSettingsProvider'
import { shortVideos, type ShortsCategory } from '@/lib/shorts-data'
import { NewsFeed } from '@/components/NewsFeed'
import { useNewsItems } from '@/hooks/useNewsItems'

type Tab = 'all' | 'news' | ShortsCategory

export default function ShortsPage() {
  const { settings, updateSetting } = useAppSettings()
  const { items: allNews } = useNewsItems()
  const [tab, setTab] = useState<Tab>('all')

  const items = useMemo(() => {
    if (tab === 'all') return shortVideos
    if (tab === 'news') return []
    return shortVideos.filter((s) => s.category === tab)
  }, [tab])

  const shortsNews = useMemo(() => allNews.slice(0, 6), [allNews])

  return (
    <div className="flex min-h-screen bg-black">
      <Sidebar />
      <div className="w-full md:ml-[92px] md:w-[calc(100vw-92px)] min-h-[100dvh] overflow-x-hidden pb-24 md:pb-8">
        <Header />

        <main className="px-6 flex flex-col gap-6">
          <div>
            <h1 className="text-white text-3xl font-bold">Shorts</h1>
            <p className="text-gray-400 text-sm mt-1">Quick reels: trailers, highlights, lyrics moments, and comedy.</p>
          </div>

          <div className="flex flex-wrap gap-2">
            {([
              { id: 'all', label: 'All' },
              { id: 'news', label: 'News' },
              { id: 'movies', label: 'Movies' },
              { id: 'music', label: 'Music' },
              { id: 'sports', label: 'Sports' },
              { id: 'comedy', label: 'Comedy' },
            ] as const).map((x) => (
              <button
                key={x.id}
                onClick={() => setTab(x.id)}
                className={`rounded-full border px-4 py-2 text-sm ${
                  tab === x.id ? 'border-[#f4a30a]/60 bg-[#f4a30a]/15 text-[#f4a30a]' : 'border-white/15 bg-white/5 text-gray-300'
                }`}
              >
                {x.label}
              </button>
            ))}
          </div>

          {tab === 'news' ? (
            <NewsFeed title="Entertainment News" subtitle="Latest updates across movies, music, sports, and comedy." items={shortsNews} />
          ) : null}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {items.map((s) => {
              const saved = settings.watchlistShorts.includes(s.id)
              return (
                <Link
                  key={s.id}
                  href={`/shorts/${s.id}`}
                  className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <div className="relative h-56">
                    <Image src={s.image} alt={s.title} fill className="object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />
                    <div className="absolute left-3 top-3 rounded-full bg-black/60 px-2 py-0.5 text-[10px] text-white">
                      0:{s.durationSeconds.toString().padStart(2, '0')}s
                    </div>
                    <div className="absolute right-3 top-3 flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.preventDefault()
                          const next = saved
                            ? settings.watchlistShorts.filter((id) => id !== s.id)
                            : [...settings.watchlistShorts, s.id]
                          updateSetting('watchlistShorts', next)
                        }}
                        className="rounded-full bg-black/50 p-2 text-white/80 hover:text-[#f4a30a]"
                        aria-label={saved ? 'Remove from watchlist' : 'Add to watchlist'}
                      >
                        <Heart size={16} fill={saved ? '#f4a30a' : 'transparent'} />
                      </button>
                    </div>
                    <div className="absolute bottom-3 left-3 right-3">
                      <p className="text-white text-sm font-semibold line-clamp-2">{s.title}</p>
                      <p className="text-gray-300 text-xs mt-1 line-clamp-2">{s.caption}</p>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="rounded-full bg-black/55 p-3 text-white">
                        <PlayCircle size={28} className="text-[#f4a30a]" />
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </main>
      </div>
    </div>
  )
}
