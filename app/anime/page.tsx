'use client'

import { useMemo, useState } from 'react'
import { Sidebar } from '@/components/Sidebar'
import { Header } from '@/components/Header'
import { MoviesSection } from '@/components/MoviesSection'
import { LiveMomentsBanner } from '@/components/LiveMomentsBanner'
import { NewsFeed } from '@/components/NewsFeed'
import { useNewsItems } from '@/hooks/useNewsItems'

export default function AnimePage() {
  const { byCategory } = useNewsItems()
  const [tab, setTab] = useState<'anime' | 'manga' | 'news'>('anime')
  const animeNews = useMemo(() => byCategory('movies'), [byCategory])

  return (
    <div className="flex min-h-screen bg-black">
      <Sidebar />
      <div className="w-full md:ml-[92px] md:w-[calc(100vw-92px)] min-h-[100dvh] overflow-x-hidden pb-24 md:pb-8">
        <Header />
        <main className="px-6">
          <div className="mb-5">
            <LiveMomentsBanner section="movies" />
          </div>

          <div className="mb-5">
            <h1 className="text-white text-3xl font-bold">Anime</h1>
            <p className="text-gray-400 text-sm mt-1">Animation, manga, and related entertainment.</p>
          </div>

          <div className="mb-6 flex flex-wrap gap-2">
            {[
              { id: 'anime', label: 'Animation' },
              { id: 'manga', label: 'Manga' },
              { id: 'news', label: 'News' },
            ].map((x) => (
              <button
                key={x.id}
                onClick={() => setTab(x.id as typeof tab)}
                className={`rounded-full border px-4 py-2 text-sm ${
                  tab === x.id ? 'border-[#f4a30a]/60 bg-[#f4a30a]/15 text-[#f4a30a]' : 'border-white/15 bg-white/5 text-gray-300'
                }`}
              >
                {x.label}
              </button>
            ))}
          </div>

          {tab === 'news' ? <NewsFeed title="Anime News" subtitle="Entertainment updates for anime & animation." items={animeNews} /> : null}

          {tab === 'manga' ? (
            <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 text-gray-300">
              Manga reader is coming next. Add your manga sources and reader UI here.
            </section>
          ) : null}

          {tab === 'anime' ? <MoviesSection defaultType="animation" /> : null}
        </main>
      </div>
    </div>
  )
}
