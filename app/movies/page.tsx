'use client'

import { Sidebar } from '@/components/Sidebar'
import { Header } from '@/components/Header'
import { MoviesSection } from '@/components/MoviesSection'
import { LiveMomentsBanner } from '@/components/LiveMomentsBanner'
import { shortVideos } from '@/lib/shorts-data'
import Link from 'next/link'
import { NewsFeed } from '@/components/NewsFeed'
import { useNewsItems } from '@/hooks/useNewsItems'
import { ShortPreviewCard } from '@/components/shorts/ShortPreviewCard'

export default function MoviesPage() {
  const movieShorts = shortVideos.filter((s) => s.category === 'movies').slice(0, 6)
  const { byCategory } = useNewsItems()
  const movieNews = byCategory('movies')

  return (
    <div className="flex min-h-screen bg-black">
      <Sidebar />
      <div className="w-full md:ml-[92px] md:w-[calc(100vw-92px)] min-h-[100dvh] overflow-x-hidden pb-24 md:pb-8">
        <Header />
        <main className="px-6">
          <div className="mb-5">
            <LiveMomentsBanner section="movies" />
          </div>

          <div className="mb-8">
            <NewsFeed title="Movie News" subtitle="Trailers, premieres, and entertainment updates." items={movieNews} />
          </div>

          <MoviesSection />

          <section className="mt-8 flex flex-col gap-4">
            <div className="flex items-end justify-between gap-3">
              <div>
                <h2 className="text-white text-2xl font-bold">Trailers & Shorts</h2>
                <p className="text-gray-400 text-sm mt-1">Quick teaser cuts and highlights.</p>
              </div>
              <Link href="/shorts" className="text-[#f4a30a] text-sm hover:underline">
                See all
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {movieShorts.map((s) => (
                <ShortPreviewCard key={s.id} short={s} />
              ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}
