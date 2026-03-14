'use client'

import { Sidebar } from '@/components/Sidebar'
import { Header } from '@/components/Header'
import { MoviesSection } from '@/components/MoviesSection'
import { LiveMomentsBanner } from '@/components/LiveMomentsBanner'
import { shortVideos } from '@/lib/shorts-data'
import Link from 'next/link'
import Image from 'next/image'
import { PlayCircle } from 'lucide-react'
import { NewsFeed } from '@/components/NewsFeed'
import { getNewsByCategory } from '@/lib/news-data'

export default function MoviesPage() {
  const movieShorts = shortVideos.filter((s) => s.category === 'movies').slice(0, 6)
  const movieNews = getNewsByCategory('movies')

  return (
    <div className="flex min-h-screen bg-black">
      <Sidebar />
      <div className="ml-[92px] w-[calc(100vw-92px)] min-h-[100dvh] overflow-x-hidden pb-8">
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
                <Link
                  key={s.id}
                  href={`/shorts/${s.id}`}
                  className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <div className="relative h-44">
                    <Image src={s.image} alt={s.title} fill className="object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3">
                      <p className="text-white text-sm font-semibold line-clamp-2">{s.title}</p>
                      <p className="text-gray-300 text-xs mt-1">0:{s.durationSeconds.toString().padStart(2, '0')}s</p>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <PlayCircle size={34} className="text-[#f4a30a]" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}
