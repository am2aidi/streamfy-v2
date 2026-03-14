'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import { ChevronLeft, Heart, Play } from 'lucide-react'
import { Sidebar } from '@/components/Sidebar'
import { Header } from '@/components/Header'
import { useAppSettings } from '@/components/AppSettingsProvider'
import { getShortById, shortVideos } from '@/lib/shorts-data'

export default function ShortDetailPage() {
  const params = useParams<{ id: string }>()
  const short = useMemo(() => getShortById(params.id), [params.id])
  const { settings, updateSetting } = useAppSettings()
  const [showPlayer, setShowPlayer] = useState(false)

  if (!short) {
    return <div className="min-h-screen bg-black text-white flex items-center justify-center">Short not found</div>
  }

  const saved = settings.watchlistShorts.includes(short.id)
  const related = shortVideos.filter((s) => s.category === short.category && s.id !== short.id).slice(0, 6)

  return (
    <div className="flex min-h-screen bg-black">
      <Sidebar />
      <div className="ml-[92px] w-[calc(100vw-92px)] min-h-[100dvh] overflow-x-hidden pb-8">
        <Header />

        <main className="px-6 flex flex-col gap-6">
          <Link href="/shorts" className="inline-flex items-center gap-2 text-gray-300 hover:text-white text-sm">
            <ChevronLeft size={14} />
            Back to Shorts
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-4">
            <section className="rounded-2xl border border-white/10 bg-white/[0.04] overflow-hidden">
              <div className="relative aspect-video bg-black/70">
                <Image src={short.image} alt={short.title} fill className="object-cover opacity-70" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <p className="text-white text-lg font-bold">{short.title}</p>
                  <p className="text-gray-300 text-sm mt-1">{short.caption}</p>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <button
                      onClick={() => setShowPlayer(true)}
                      className="inline-flex items-center gap-2 rounded-xl bg-[#f4a30a] px-4 py-2.5 text-sm font-semibold text-black"
                    >
                      <Play size={16} fill="black" />
                      Play
                    </button>
                    <button
                      onClick={() => {
                        const next = saved
                          ? settings.watchlistShorts.filter((id) => id !== short.id)
                          : [...settings.watchlistShorts, short.id]
                        updateSetting('watchlistShorts', next)
                      }}
                      className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/[0.03] px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/[0.06]"
                    >
                      <Heart size={16} fill={saved ? '#f4a30a' : 'transparent'} className={saved ? 'text-[#f4a30a]' : ''} />
                      {saved ? 'Saved' : 'Watchlist'}
                    </button>
                  </div>
                </div>
              </div>
            </section>

            <aside className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <p className="text-xs uppercase tracking-wider text-gray-500">Category</p>
              <p className="text-white text-sm font-semibold mt-1">{short.category.toUpperCase()}</p>
              <p className="text-gray-400 text-xs mt-2">Duration: 0:{short.durationSeconds.toString().padStart(2, '0')}s</p>

              {related.length > 0 ? (
                <div className="mt-5">
                  <p className="text-white text-sm font-semibold">More {short.category}</p>
                  <div className="mt-3 space-y-2">
                    {related.map((s) => (
                      <Link key={s.id} href={`/shorts/${s.id}`} className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/25 p-2.5 hover:bg-white/[0.06]">
                        <div className="relative h-12 w-16 overflow-hidden rounded-lg border border-white/10">
                          <Image src={s.image} alt={s.title} fill className="object-cover" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-white text-xs font-semibold line-clamp-2">{s.title}</p>
                          <p className="text-gray-400 text-[10px] mt-1">0:{s.durationSeconds.toString().padStart(2, '0')}s</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              ) : null}
            </aside>
          </div>

          {showPlayer ? (
            <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
              <div className="w-full max-w-3xl rounded-2xl border border-white/10 bg-[#0f0f0f] p-4">
                <div className="aspect-video rounded-xl bg-black/80 border border-white/10 flex flex-col items-center justify-center gap-2">
                  <Play size={28} className="text-[#f4a30a]" />
                  <p className="text-white text-sm">Playing short (prototype)</p>
                  <p className="text-gray-400 text-xs">Wire this to your real reels player when ready.</p>
                </div>
                <div className="mt-4 flex justify-end">
                  <button onClick={() => setShowPlayer(false)} className="text-gray-300 text-sm hover:text-white">
                    Close
                  </button>
                </div>
              </div>
            </div>
          ) : null}
        </main>
      </div>
    </div>
  )
}
