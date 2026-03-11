'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useAppSettings } from '@/components/AppSettingsProvider'
import { getTranslation } from '@/lib/translations'

type BannerSection = 'movies' | 'music' | 'sports' | 'compact'

interface LiveMomentsBannerProps {
  section: BannerSection
}

const textMain = 'LIVE MOMENTS. REAL ENERGY.'
const textSecondary = 'Movies  |  Music  |  Sports'
const textTertiary = 'Watch every match and highlight in one place'

const sectionTheme: Record<BannerSection, string> = {
  movies: 'border-[#f4a30a]/25 bg-gradient-to-r from-[#1a1205] via-black to-[#171208]',
  music: 'border-[#f4a30a]/25 bg-gradient-to-r from-[#16110a] via-black to-[#1d1207]',
  sports: 'border-[#f4a30a]/25 bg-gradient-to-r from-[#17140b] via-black to-[#1a1205]',
  compact: 'border-white/10 bg-white/[0.03]',
}

const mediaBySection: Record<BannerSection, string[]> = {
  movies: ['/dark-pursuit.jpg', '/now-in-theaters.jpg', '/top-rated.jpg'],
  music: ['/music-featured.jpg', '/trending-songs.jpg', '/new-releases.jpg', '/pop-hits.jpg'],
  sports: ['/sports-hero.jpg', '/champions-league.jpg', '/nba-highlights.jpg', '/nfl-future.jpg'],
  compact: ['/dark-pursuit.jpg', '/music-featured.jpg', '/sports-hero.jpg'],
}

export function LiveMomentsBanner({ section }: LiveMomentsBannerProps) {
  const { settings } = useAppSettings()
  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(settings.language, key)
  const isCompact = section === 'compact'
  const textHalf = Array.from({ length: isCompact ? 3 : 5 }, () => textMain)
  const textLoop = [...textHalf, ...textHalf]
  const mediaHalf = Array.from({ length: isCompact ? 4 : 5 }).flatMap(() => mediaBySection[section])
  const mediaLoop = [...mediaHalf, ...mediaHalf]
  const secondary = `${t('movies')}  |  ${t('music')}  |  ${t('sports')}`

  return (
    <section
      className={`relative overflow-hidden rounded-2xl border ${sectionTheme[section]} ${
        isCompact ? 'px-3 py-2.5' : 'px-4 py-4 md:px-5 md:py-5'
      }`}
      aria-label="Live moments banner"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(244,163,10,0.18),transparent_45%)]" />

      <div className="relative">
        <div className="overflow-hidden">
          <div className="streamfy-marquee-track inline-flex min-w-max items-center gap-10 whitespace-nowrap">
            {textLoop.map((item, idx) => (
              <span key={`text-${idx}`} className={`font-black tracking-[0.14em] text-[#f4a30a] ${isCompact ? 'text-xs' : 'text-base md:text-lg'}`}>
                {item}
              </span>
            ))}
          </div>
        </div>

        {isCompact ? (
          <div className="mt-1.5 space-y-2">
            <div className="overflow-hidden">
              <div className="streamfy-media-track flex min-w-max items-center gap-2">
                {mediaLoop.map((src, idx) => (
                  <div key={`compact-${src}-${idx}`} className="relative h-8 w-12 overflow-hidden rounded-md border border-white/10">
                    <Image src={src} alt="" fill className="object-cover" loading="lazy" />
                  </div>
                ))}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-[11px] text-gray-300">
            <Link href="/movies" className="rounded-full border border-white/20 px-2 py-0.5 hover:border-[#f4a30a]/60 hover:text-white">{t('movies')}</Link>
            <Link href="/music" className="rounded-full border border-white/20 px-2 py-0.5 hover:border-[#f4a30a]/60 hover:text-white">{t('music')}</Link>
            <Link href="/sports" className="rounded-full border border-white/20 px-2 py-0.5 hover:border-[#f4a30a]/60 hover:text-white">{t('sports')}</Link>
          </div>
          </div>
        ) : (
          <div className="mt-2 space-y-3">
            <p className="text-sm text-white/90">{secondary}</p>
            <p className="text-xs text-gray-300">{textTertiary}</p>
            <div className="overflow-hidden rounded-xl border border-white/10 bg-black/20 p-2">
              <div className="streamfy-media-track flex min-w-max items-center gap-2">
                {mediaLoop.map((src, idx) => (
                  <div key={`${section}-${src}-${idx}`} className="relative h-14 w-24 overflow-hidden rounded-lg border border-white/10">
                    <Image src={src} alt="" fill className="object-cover" loading="lazy" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
