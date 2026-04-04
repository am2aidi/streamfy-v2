'use client'

import Link from 'next/link'
import { Heart } from 'lucide-react'
import { Sidebar } from '@/components/Sidebar'
import { Header } from '@/components/Header'
import { useAppSettings } from '@/components/AppSettingsProvider'
import { ShortPreviewCard } from '@/components/shorts/ShortPreviewCard'
import { useShorts } from '@/hooks/useShorts'

export default function ComedyPage() {
  const { settings, updateSetting } = useAppSettings()
  const { items: shorts } = useShorts()
  const items = shorts.filter((s) => s.category === 'comedy')

  return (
    <div className="flex min-h-screen bg-black">
      <Sidebar />
      <div className="w-full md:ml-[92px] md:w-[calc(100vw-92px)] min-h-[100dvh] overflow-x-hidden pb-24 md:pb-8">
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
                <div key={s.id} className="relative">
                  <ShortPreviewCard short={s} />
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      const next = saved ? settings.watchlistShorts.filter((id) => id !== s.id) : [...settings.watchlistShorts, s.id]
                      updateSetting('watchlistShorts', next)
                    }}
                    className="absolute right-3 top-3 z-10 rounded-full bg-black/55 p-2 text-white/80 hover:text-[#f4a30a]"
                    aria-label={saved ? 'Remove from watchlist' : 'Add to watchlist'}
                  >
                    <Heart size={16} fill={saved ? '#f4a30a' : 'transparent'} />
                  </button>
                </div>
              )
            })}
          </div>
        </main>
      </div>
    </div>
  )
}
