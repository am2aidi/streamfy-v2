'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import { Play, Download, ChevronLeft, Languages, Maximize2, Volume2 } from 'lucide-react'
import { Sidebar } from '@/components/Sidebar'
import { Header } from '@/components/Header'
import { getMovieById, movieCards } from '@/lib/movies-data'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/components/AuthProvider'
import { SocialShareLinks } from '@/components/SocialShareLinks'

export default function MovieDetailPage() {
  const params = useParams<{ id: string }>()
  const movie = useMemo(() => getMovieById(params.id), [params.id])
  const { toast } = useToast()
  const { requireAuth } = useAuth()
  const [showWatch, setShowWatch] = useState(false)
  const [showDownload, setShowDownload] = useState(false)
  const [subtitle, setSubtitle] = useState('English')
  const [quality, setQuality] = useState('720p')
  const [volume, setVolume] = useState(80)
  const [progress, setProgress] = useState(38)

  if (!movie) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        Movie not found.
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-black">
      <Sidebar />

      <div className="ml-[220px] w-[calc(100vw-220px)] min-h-[100dvh] overflow-x-hidden pb-8">
        <Header />

        <main className="px-6 flex flex-col gap-6">
          <Link href="/movies" className="inline-flex items-center gap-2 text-gray-300 hover:text-white text-sm">
            <ChevronLeft size={14} />
            Back to Movies
          </Link>

          <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
            <SocialShareLinks title="Share This Movie" />
          </section>

          <div className="relative h-[320px] rounded-2xl overflow-hidden">
            <Image src={movie.image} alt={movie.title} fill className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-black/30" />
            <div className="absolute bottom-6 left-6 max-w-xl">
              <h1 className="text-white text-3xl font-bold">{movie.title}</h1>
              <p className="text-gray-300 text-sm mt-2">
                {movie.year} • {movie.duration} • {movie.genre} • {movie.rating}
              </p>
              <p className="text-gray-300 text-sm mt-3">{movie.description}</p>
              <div className="flex gap-3 mt-5">
                <button
                  onClick={() => setShowWatch(true)}
                  className="bg-[#f4a30a] text-black px-4 py-2.5 rounded-xl font-semibold inline-flex items-center gap-2"
                >
                  <Play size={16} fill="black" />
                  Watch Now
                </button>
                <button
                  onClick={() => requireAuth(() => setShowDownload(true), 'Sign in to download movies.')}
                  className="border border-white/20 text-white px-4 py-2.5 rounded-xl font-semibold inline-flex items-center gap-2"
                >
                  <Download size={16} />
                  Download
                </button>
              </div>
            </div>
          </div>

          <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <MiniRow title="Continue Watching" items={movieCards.slice(0, 3).map((m) => m.title)} />
            <MiniRow title="Recently Watched" items={movieCards.slice().reverse().map((m) => m.title)} />
            <MiniRow title="Recommended For You" items={movieCards.map((m) => m.title)} />
          </section>

          {showWatch && (
            <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
              <div className="w-full max-w-3xl rounded-2xl border border-white/10 bg-[#0f0f0f] p-4">
                <div className="aspect-video rounded-xl bg-black/80 border border-white/10 flex flex-col items-center justify-center gap-3 relative">
                  <Play size={28} className="text-[#f4a30a]" />
                  <p className="text-white text-sm">Playing {movie.title} ({quality})</p>
                  <p className="text-gray-400 text-xs">Subtitle: {subtitle}</p>
                  <button className="absolute top-3 right-3 p-2 rounded-lg bg-white/10 text-gray-300 hover:text-white">
                    <Maximize2 size={14} />
                  </button>
                </div>
                <div className="mt-4 space-y-3">
                  <div>
                    <div className="flex justify-between text-xs text-gray-400">
                      <span>Progress</span>
                      <span>{progress}%</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={progress}
                      onChange={(e) => setProgress(Number(e.target.value))}
                      className="w-full accent-[#f4a30a]"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="inline-flex items-center gap-2 text-gray-300 text-sm">
                      <span>Quality</span>
                      <select
                        value={quality}
                        onChange={(e) => setQuality(e.target.value)}
                        className="bg-white/5 border border-white/15 rounded-lg px-2 py-1"
                      >
                        <option>360p</option>
                        <option>480p</option>
                        <option>720p</option>
                        <option>1080p</option>
                      </select>
                    </div>
                    <div className="inline-flex items-center gap-2 text-gray-300 text-sm">
                      <Languages size={14} />
                      <select
                        value={subtitle}
                        onChange={(e) => setSubtitle(e.target.value)}
                        className="bg-white/5 border border-white/15 rounded-lg px-2 py-1"
                      >
                        <option>English</option>
                        <option>French</option>
                        <option>Kinyarwanda</option>
                        <option>Luganda</option>
                      </select>
                    </div>
                  </div>
                  <div className="inline-flex items-center gap-2 text-gray-300 text-sm">
                    <Volume2 size={14} />
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={volume}
                      onChange={(e) => setVolume(Number(e.target.value))}
                      className="w-40 accent-[#f4a30a]"
                    />
                  </div>
                  <div className="flex justify-end">
                    <button onClick={() => setShowWatch(false)} className="text-gray-300 text-sm hover:text-white">
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {showDownload && (
            <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
              <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#0f0f0f] p-5">
                <h2 className="text-white text-lg font-semibold">Download Quality</h2>
                <div className="mt-4 flex flex-col gap-2">
                  {['360p', '480p', '720p', '1080p'].map((q) => (
                    <button
                      key={q}
                      onClick={() => {
                        toast({ title: 'Download queued', description: `${movie.title} (${q}) added to downloads.` })
                        setShowDownload(false)
                      }}
                      className="text-left px-3 py-2.5 rounded-lg border border-white/10 text-white hover:bg-white/5"
                    >
                      {q}
                    </button>
                  ))}
                </div>
                <button onClick={() => setShowDownload(false)} className="mt-4 text-gray-300 text-sm hover:text-white">
                  Cancel
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

function MiniRow({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4">
      <h3 className="text-white text-sm font-semibold mb-3">{title}</h3>
      <div className="flex flex-col gap-2">
        {items.map((item) => (
          <span key={`${title}-${item}`} className="text-gray-300 text-sm truncate">
            {item}
          </span>
        ))}
      </div>
    </div>
  )
}
