'use client'

import { Play, ChevronRight } from 'lucide-react'
import Image from 'next/image'
import { useAppSettings } from '@/components/AppSettingsProvider'
import { getTranslation } from '@/lib/translations'

const clips = [
  { id: 1, title: 'NBA Highlights', image: '/nba-highlights.jpg' },
  { id: 2, title: 'Champions League Highlights', image: '/champions-league.jpg' },
  { id: 3, title: 'Future Stars of the NFL', image: '/nfl-future.jpg' },
]

export function ClipsSection() {
  const { settings } = useAppSettings()
  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(settings.language, key)

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-white text-xl font-bold">{t('topClips')}</h2>
        <button className="flex items-center gap-1 text-[#f4a30a] text-sm hover:underline">
          {t('seeAll')} <ChevronRight size={14} />
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {clips.map((clip) => (
          <ClipCard key={clip.id} clip={clip} />
        ))}
      </div>
    </section>
  )
}

interface ClipProps {
  id: number
  title: string
  image: string
}

function ClipCard({ clip }: { clip: ClipProps }) {
  return (
    <div className="relative aspect-video rounded-xl overflow-hidden group cursor-pointer">
      {/* Background Image */}
      <Image src={clip.image} alt={clip.title} fill className="object-cover transition-transform duration-500 group-hover:scale-110" />

      {/* Overlay on hover */}
      <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-colors" />

      {/* Center play button */}
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="w-12 h-12 rounded-full bg-[#f4a30a] flex items-center justify-center">
          <Play size={20} fill="black" className="text-black" />
        </div>
      </div>

      {/* Content */}
      <div className="absolute bottom-3 left-3">
        <h3 className="text-white text-sm font-medium">{clip.title}</h3>
      </div>

      {/* Bottom right play icon */}
      <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="w-7 h-7 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
          <Play size={12} fill="white" className="text-white" />
        </div>
      </div>
    </div>
  )
}
