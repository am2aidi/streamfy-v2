'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Heart, PlayCircle } from 'lucide-react'
import { Sidebar } from '@/components/Sidebar'
import { Header } from '@/components/Header'
import { useAppSettings } from '@/components/AppSettingsProvider'
import { shortVideos } from '@/lib/shorts-data'

export default function ComedyPage() {
  const { settings, updateSetting } = useAppSettings()
  const items = shortVideos.filter((s) => s.category === 'comedy')

  return (
    <div className="flex min-h-screen bg-black">
      <Sidebar />
      <div className="ml-[92px] w-[calc(100vw-92px)] min-h-[100dvh] overflow-x-hidden pb-8">
        <Header />

        <main className="px-6 flex flex-col gap-6">
          <div className="flex items-end justify-between gap-3">
            <div>
              <h1 className="text-white text-3xl font-bold">Comedy</h1>
              <p className="text-gray-400 text-sm mt-1">Short comedy videos and clips.</p>
            </div>
            <Link href="/shorts" className="text-[#f4a30a] text-sm hover:underline">
              All shorts
            </Link>
          </div>

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
                    <div className="absolute right-3 top-3">
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
