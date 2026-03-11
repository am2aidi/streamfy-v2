'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { ChevronRight } from 'lucide-react'
import { getAllMatches } from '@/lib/sports-data'
import { useAuth } from '@/components/AuthProvider'
import { useAppSettings } from '@/components/AppSettingsProvider'
import { getTranslation } from '@/lib/translations'

export function SportsPreviewSection() {
  const router = useRouter()
  const { requireAuth } = useAuth()
  const { settings } = useAppSettings()
  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(settings.language, key)
  const [leagueFilter, setLeagueFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState<'All' | 'Live' | 'Upcoming' | 'Final'>('All')

  const allMatches = useMemo(() => getAllMatches(), [])
  const leagues = useMemo(() => ['All', ...Array.from(new Set(allMatches.map((match) => match.league)))], [allMatches])

  const filteredMatches = useMemo(() => {
    return allMatches.filter((match) => {
      const byLeague = leagueFilter === 'All' || match.league === leagueFilter
      const status = match.status ? `${match.status[0].toUpperCase()}${match.status.slice(1)}` : 'Upcoming'
      const byStatus = statusFilter === 'All' || status === statusFilter
      return byLeague && byStatus
    })
  }, [allMatches, leagueFilter, statusFilter])

  const featured = filteredMatches[0]

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-white text-2xl font-bold streamfy-fade-slide">{t('sports')}</h2>
          <p className="text-gray-400 text-sm">{t('liveAndUpcomingLeagues')}</p>
        </div>
        <Link href="/sports" className="flex items-center gap-1 text-[#f4a30a] text-sm hover:underline">
          {t('seeAll')} <ChevronRight size={14} />
        </Link>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <select
            value={leagueFilter}
            onChange={(e) => setLeagueFilter(e.target.value)}
            className="rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm text-white"
          >
            {leagues.map((league) => (
              <option key={league} value={league}>
                {t('leagueLabel')}: {league}
              </option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
            className="rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm text-white"
          >
            <option value="All">{t('statusLabel')}: {t('statusAll')}</option>
            <option value="Live">{t('statusLabel')}: {t('statusLive')}</option>
            <option value="Upcoming">{t('statusLabel')}: {t('statusUpcoming')}</option>
            <option value="Final">{t('statusLabel')}: {t('statusFinal')}</option>
          </select>
        </div>
      </div>

      {featured ? (
        <div className="streamfy-fade-slide rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <p className="text-xs uppercase tracking-wider text-gray-500">{t('featuredLeague')}</p>
          <p className="text-sm font-semibold text-white streamfy-soft-float">{featured.league}</p>
          <p className="text-xs text-gray-400">
            {featured.team1.name} vs {featured.team2.name}
          </p>
        </div>
      ) : null}

      <div className="flex flex-col gap-3">
        {filteredMatches.slice(0, 10).map((match) => (
          <Link
            key={match.id}
            href={`/sports/${match.id}`}
            onClick={(e) => {
              e.preventDefault()
              requireAuth(() => router.push(`/sports/${match.id}`), t('authSigninPrompt'))
            }}
            className="rounded-xl border border-white/10 bg-white/5 p-3 hover:bg-white/10 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="relative h-16 w-24 overflow-hidden rounded-lg">
                <Image src={match.heroImage ?? '/sports-hero.jpg'} alt={match.league} fill className="object-cover" loading="lazy" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-semibold truncate">{match.team1.name} vs {match.team2.name}</p>
                <p className="text-gray-400 text-xs">{match.league}</p>
              </div>
              <span className="text-xs text-gray-300">
                {match.status === 'live' ? `${match.score1 ?? 0}-${match.score2 ?? 0}` : match.time}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
