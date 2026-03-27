'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Play, Film, Trophy, Music2 } from 'lucide-react'
import { useAppSettings } from '@/components/AppSettingsProvider'
import { getTranslation } from '@/lib/translations'
import { BRAND_NAME } from '@/lib/brand'

const slides = [
  {
    image: '/now-in-theaters.jpg',
    heading: `WELCOME TO ${BRAND_NAME.toUpperCase()}`,
    subheading: 'Unlimited Movies • Live Sports • Trending Music',
    description: 'Experience Entertainment Like Never Before',
  },
  {
    image: '/champions-league.jpg',
    heading: 'LIVE MOMENTS. REAL ENERGY.',
    subheading: 'Watch every match and highlight in one place',
    description: 'Sports that feel like stadium seats at home',
  },
  {
    image: '/music-featured.jpg',
    heading: 'MUSIC THAT MOVES YOU',
    subheading: 'Top charts, fresh releases, and your favorites',
    description: 'Build playlists and keep the vibe going',
  },
]

export function HeroSection() {
  const [index, setIndex] = useState(0)
  const { settings } = useAppSettings()
  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(settings.language, key)

  useEffect(() => {
    const timer = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length)
    }, 4000)
    return () => window.clearInterval(timer)
  }, [])

  return (
    <section className="relative h-[72vh] min-h-[420px] rounded-2xl overflow-hidden">
      {slides.map((slide, i) => (
        <div
          key={slide.heading}
          className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${i === index ? 'opacity-100' : 'opacity-0'}`}
          style={{ backgroundImage: `url(${slide.image})` }}
        />
      ))}
      <div className="absolute inset-0 bg-black/60" />
      <div className="absolute inset-0 p-8 md:p-12 flex flex-col justify-end gap-4">
        <h1 className="text-white text-4xl md:text-6xl font-extrabold tracking-tight">{index === 0 ? t('heroWelcome') : slides[index].heading}</h1>
        <p className="text-white/90 text-base md:text-xl font-medium">{index === 0 ? t('heroLine') : slides[index].subheading}</p>
        <p className="text-gray-300 text-sm md:text-base">{index === 0 ? t('heroDesc') : slides[index].description}</p>
        <div className="flex flex-wrap gap-3 pt-3">
          <Link href="/movies" className="inline-flex items-center gap-2 bg-[#f4a30a] text-black px-4 py-2.5 rounded-xl font-semibold">
            <Play size={16} fill="black" />
            {t('watchNow')}
          </Link>
          <Link href="/movies" className="inline-flex items-center gap-2 border border-white/20 text-white px-4 py-2.5 rounded-xl">
            <Film size={16} />
            {t('exploreMovies')}
          </Link>
          <Link href="/sports" className="inline-flex items-center gap-2 border border-white/20 text-white px-4 py-2.5 rounded-xl">
            <Trophy size={16} />
            {t('exploreSports')}
          </Link>
          <Link href="/music" className="inline-flex items-center gap-2 border border-white/20 text-white px-4 py-2.5 rounded-xl">
            <Music2 size={16} />
            {t('exploreMusic')}
          </Link>
        </div>
      </div>
    </section>
  )
}
