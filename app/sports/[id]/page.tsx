'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { useParams } from 'next/navigation'
import { Sidebar } from '@/components/Sidebar'
import { Header } from '@/components/Header'
import { getMatchById } from '@/lib/sports-data'
import { ChevronLeft, Heart, Trophy } from 'lucide-react'
import Image from 'next/image'
import { useAppSettings } from '@/components/AppSettingsProvider'
import { useToast } from '@/hooks/use-toast'
import { SocialShareLinks } from '@/components/SocialShareLinks'
import { getTranslation } from '@/lib/translations'

export default function MatchDetailPage() {
  const params = useParams<{ id: string }>()
  const [simTick, setSimTick] = useState(0)
  const match = useMemo(() => getMatchById(params.id), [params.id])
  const { settings, updateSetting } = useAppSettings()
  const { toast } = useToast()
  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(settings.language, key)
  const inWatchlist = match ? settings.watchlistMatches.includes(match.id) : false

  if (!match) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        {t('matchNotFound')}
      </div>
    )
  }

  const liveScore1 = typeof match.score1 === 'number' ? match.score1 + (match.status === 'live' ? simTick % 2 : 0) : 0
  const liveScore2 = typeof match.score2 === 'number' ? match.score2 : 0
  const statusLabel =
    match.status === 'final' ? t('statusFinal') : match.status === 'live' ? t('statusLive') : t('statusUpcoming')

  return (
    <div className="flex min-h-screen bg-black">
      <Sidebar />

      <div className="ml-[92px] w-[calc(100vw-92px)] min-h-[100dvh] overflow-x-hidden pb-8">
        <Header />
        <main className="px-6 flex flex-col gap-6">
          <Link href="/sports" className="inline-flex items-center gap-2 text-gray-300 hover:text-white text-sm">
            <ChevronLeft size={14} />
            {t('backToSports')}
          </Link>

          <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
            <SocialShareLinks title={t('shareThisMatch')} />
          </section>

          <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
            <div className="relative h-40">
              <Image src={match.heroImage ?? '/sports-hero.jpg'} alt={match.league} fill className="object-cover opacity-60" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-black/30" />
              <div className="absolute left-6 bottom-4">
                <p className="text-gray-300 text-xs uppercase tracking-wider">{match.league}</p>
                <h1 className="text-white text-2xl font-bold">{match.team1.name} vs {match.team2.name}</h1>
              </div>
            </div>

            <div className="p-6">
              <div className="flex items-center justify-between">
                <TeamBlock name={match.team1.name} logo={match.team1.logo} record={match.team1.record} />
                <div className="text-center">
                  <p className="text-white text-3xl font-bold">{liveScore1} - {liveScore2}</p>
                  <p className="text-gray-400 text-xs mt-1">{statusLabel.toUpperCase()}</p>
                </div>
                <TeamBlock name={match.team2.name} logo={match.team2.logo} record={match.team2.record} alignRight />
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setSimTick((n) => n + 1)}
                  className="px-4 py-2 rounded-xl bg-[#f4a30a] text-black text-sm font-semibold"
                >
                  {t('simulateScoreUpdate')}
                </button>
                <button
                  onClick={() => {
                    const next = inWatchlist
                      ? settings.watchlistMatches.filter((id) => id !== match.id)
                      : [...settings.watchlistMatches, match.id]
                    updateSetting('watchlistMatches', next)
                    toast({ title: inWatchlist ? 'Removed from watchlist' : 'Added to watchlist', description: `${match.team1.name} vs ${match.team2.name}` })
                  }}
                  className="px-4 py-2 rounded-xl border border-white/15 text-white text-sm font-semibold inline-flex items-center gap-2 hover:bg-white/5"
                >
                  <Heart size={14} fill={inWatchlist ? '#f4a30a' : 'transparent'} className={inWatchlist ? 'text-[#f4a30a]' : ''} />
                  Watchlist
                </button>
                <button
                  onClick={() => {
                    if (settings.favoriteLeagues.includes(match.league)) {
                      toast({ title: t('alreadySaved'), description: `${match.league} ${t('alreadySavedLeague')}` })
                      return
                    }
                    updateSetting('favoriteLeagues', [...settings.favoriteLeagues, match.league])
                    toast({ title: t('saved'), description: `${match.league} ${t('savedLeague')}` })
                  }}
                  className="px-4 py-2 rounded-xl border border-white/15 text-white text-sm font-semibold inline-flex items-center gap-2"
                >
                  <Trophy size={14} />
                  {t('addLeagueToFavorites')}
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

function TeamBlock({
  name,
  logo,
  record,
  alignRight = false,
}: {
  name: string
  logo: string
  record: string
  alignRight?: boolean
}) {
  return (
    <div className={`flex items-center gap-3 ${alignRight ? 'flex-row-reverse text-right' : ''}`}>
      <div className="relative w-12 h-12 rounded-full border border-white/15 bg-white/5 overflow-hidden">
        <Image src={logo} alt={name} fill className="object-contain p-1" unoptimized />
      </div>
      <div>
        <p className="text-white text-sm font-semibold">{name}</p>
        <p className="text-gray-400 text-xs">{record}</p>
      </div>
    </div>
  )
}
