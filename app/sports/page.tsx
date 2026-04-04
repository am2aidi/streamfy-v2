'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sidebar } from '@/components/Sidebar'
import { Header } from '@/components/Header'
import { ChevronRight, Clock, Newspaper, PlayCircle, Star, Trophy } from 'lucide-react'
import Image from 'next/image'
import { useAppSettings } from '@/components/AppSettingsProvider'
import { useAuth } from '@/components/AuthProvider'
import { useToast } from '@/hooks/use-toast'
import { LiveMomentsBanner } from '@/components/LiveMomentsBanner'
import { getTranslation } from '@/lib/translations'
import { useNewsItems } from '@/hooks/useNewsItems'
import { ShortPreviewCard } from '@/components/shorts/ShortPreviewCard'
import { useShorts } from '@/hooks/useShorts'
import { useSportsMatches } from '@/hooks/useSportsMatches'

type TabId = 'yesterday' | 'today' | 'upcoming'
type SportFilter = 'all' | 'football' | 'basketball' | 'volleyball'

const tabOptions: { id: TabId; label: string }[] = [
  { id: 'today', label: 'Today' },
  { id: 'upcoming', label: 'Upcoming' },
  { id: 'yesterday', label: 'Yesterday' },
]

function inferSport(league: string): Exclude<SportFilter, 'all'> {
  const value = league.toLowerCase()
  if (value.includes('nba') || value.includes('fiba') || value.includes('euroleague')) return 'basketball'
  if (value.includes('volleyball')) return 'volleyball'
  return 'football'
}

function formatStatus(status?: 'live' | 'final' | 'upcoming') {
  if (status === 'live') return 'Live'
  if (status === 'final') return 'Final'
  return 'Upcoming'
}

export default function SportsPage() {
  const router = useRouter()
  const { requireAuth } = useAuth()
  const { items: matches } = useSportsMatches()
  const { items: shorts } = useShorts()
  const { settings, updateSetting } = useAppSettings()
  const { toast } = useToast()
  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(settings.language, key)
  const { byCategory } = useNewsItems()

  const [activeTab, setActiveTab] = useState<TabId>('today')
  const [view, setView] = useState<'all' | 'news' | 'shorts'>('all')
  const [sportFilter, setSportFilter] = useState<SportFilter>('all')
  const [leagueFilter, setLeagueFilter] = useState('all')
  const [myLeagueOnly, setMyLeagueOnly] = useState(false)

  const tabMatches = useMemo(
    () =>
      matches.filter((match) => {
        const byTab = match.tab === activeTab
        const bySport = sportFilter === 'all' || inferSport(match.league) === sportFilter
        const byLeague = leagueFilter === 'all' || match.league === leagueFilter
        const byFavorites = !myLeagueOnly || settings.favoriteLeagues.includes(match.league)
        return byTab && bySport && byLeague && byFavorites
      }),
    [activeTab, leagueFilter, matches, myLeagueOnly, settings.favoriteLeagues, sportFilter],
  )

  const liveMatches = useMemo(
    () => matches.filter((match) => match.status === 'live').slice(0, 4),
    [matches],
  )

  const leagueOptions = useMemo(
    () => ['all', ...Array.from(new Set(matches.filter((match) => sportFilter === 'all' || inferSport(match.league) === sportFilter).map((match) => match.league)))],
    [matches, sportFilter],
  )

  const sportsNews = byCategory('sports')
  const sportsShorts = useMemo(() => shorts.filter((item) => item.category === 'sports').slice(0, 6), [shorts])

  const openRestrictedMatch = (href: string) => {
    requireAuth(() => router.push(href), t('authSigninPrompt'))
  }

  const toggleLeagueFavorite = (league: string) => {
    const isSaved = settings.favoriteLeagues.includes(league)
    const next = isSaved
      ? settings.favoriteLeagues.filter((item) => item !== league)
      : [...settings.favoriteLeagues, league]
    updateSetting('favoriteLeagues', next)
    toast({
      title: isSaved ? t('leagueRemoved') : t('leagueAdded'),
      description: `${league} ${isSaved ? t('removedFromMyLeagues') : t('addedToMyLeagues')} ${t('myLeagues')}.`,
    })
  }

  return (
    <div className="flex min-h-screen bg-black">
      <Sidebar />

      <div className="w-full md:ml-[92px] md:w-[calc(100vw-92px)] min-h-[100dvh] overflow-x-hidden pb-24 md:pb-8">
        <Header />

        <main className="flex flex-col gap-6 px-6">
          <LiveMomentsBanner section="sports" />

          <div className="flex items-center justify-between">
            <h1 className="text-white text-3xl font-bold">{t('sports')}</h1>
            <button
              onClick={() => setMyLeagueOnly((prev) => !prev)}
              className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                myLeagueOnly ? 'bg-[#f4a30a] text-black' : 'bg-white/10 text-white hover:bg-white/15'
              }`}
            >
              <Trophy size={14} className={myLeagueOnly ? 'text-black' : 'text-[#f4a30a]'} />
              {myLeagueOnly ? 'All Leagues' : 'My Leagues'}
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              { id: 'all', label: 'All' },
              { id: 'news', label: 'News' },
              { id: 'shorts', label: 'Shorts' },
            ].map((option) => (
              <button
                key={option.id}
                onClick={() => setView(option.id as typeof view)}
                className={`rounded-full border px-4 py-2 text-sm ${
                  view === option.id ? 'border-[#f4a30a]/60 bg-[#f4a30a]/15 text-[#f4a30a]' : 'border-white/15 bg-white/5 text-gray-300'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          {view !== 'news' ? (
            <section className="flex flex-col gap-4">
              <div className="flex flex-wrap items-center gap-2">
                {([
                  { id: 'all', label: 'All Sports' },
                  { id: 'football', label: 'Football' },
                  { id: 'basketball', label: 'Basketball' },
                  { id: 'volleyball', label: 'Volleyball' },
                ] as const).map((option) => (
                  <button
                    key={option.id}
                    onClick={() => {
                      setSportFilter(option.id)
                      setLeagueFilter('all')
                    }}
                    className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${
                      sportFilter === option.id
                        ? 'border-[#f4a30a]/60 bg-[#f4a30a]/20 text-[#f4a30a]'
                        : 'border-white/15 bg-white/5 text-gray-300 hover:text-white'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
                <select
                  value={leagueFilter}
                  onChange={(e) => setLeagueFilter(e.target.value)}
                  className="ml-auto rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-xs text-white"
                >
                  <option value="all">{t('allLeagues')}</option>
                  {leagueOptions.filter((league) => league !== 'all').map((league) => (
                    <option key={league} value={league}>
                      {league}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
                <article className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                      <h2 className="text-white text-lg font-bold">{t('liveEvents')}</h2>
                    </div>
                    <Link href="/sports" className="flex items-center gap-1 text-[#f4a30a] text-sm hover:underline">
                      {t('seeAll')} <ChevronRight size={14} />
                    </Link>
                  </div>

                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    {liveMatches.length > 0 ? (
                      liveMatches.map((match) => (
                        <Link
                          key={match.id}
                          href={`/sports/${match.id}`}
                          onClick={(e) => {
                            e.preventDefault()
                            openRestrictedMatch(`/sports/${match.id}`)
                          }}
                          className="group overflow-hidden rounded-xl border border-white/10 bg-black/25 hover:bg-white/[0.06]"
                        >
                          <div className="relative h-32">
                            <Image src={match.heroImage ?? '/sports-hero.jpg'} alt={match.league} fill className="object-cover opacity-55 group-hover:opacity-70" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                            <div className="absolute left-3 top-3 rounded-full bg-red-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                              Live
                            </div>
                            <div className="absolute bottom-3 left-3 right-3">
                              <p className="text-sm font-semibold text-white">{match.team1.name} vs {match.team2.name}</p>
                              <p className="mt-1 text-xs text-gray-300">{match.league} • {match.score1 ?? 0}-{match.score2 ?? 0}</p>
                            </div>
                          </div>
                        </Link>
                      ))
                    ) : (
                      <div className="rounded-xl border border-white/10 bg-black/25 p-4 text-sm text-gray-300">No live matches right now.</div>
                    )}
                  </div>
                </article>

                {view !== 'shorts' ? (
                  <article className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <h2 className="inline-flex items-center gap-2 text-white text-lg font-bold">
                        <Newspaper size={18} className="text-[#f4a30a]" />
                        {t('sportsNews')}
                      </h2>
                      <span className="text-xs text-gray-500">{t('updatedEveryHour')}</span>
                    </div>

                    <div className="space-y-3">
                      {sportsNews.slice(0, 4).map((item) => (
                        <div key={item.id} className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/25 p-2.5">
                          <div className="relative h-16 w-24 overflow-hidden rounded-lg border border-white/10">
                            <Image src={item.image} alt={item.title} fill className="object-cover" />
                          </div>
                          <div className="min-w-0">
                            <p className="line-clamp-2 text-sm font-semibold text-white">{item.title}</p>
                            <p className="mt-1 text-xs text-gray-400">{item.source} • {item.time}</p>
                          </div>
                        </div>
                      ))}
                      {sportsNews.length === 0 ? (
                        <div className="rounded-xl border border-white/10 bg-black/25 p-4 text-sm text-gray-300">No sports news yet.</div>
                      ) : null}
                    </div>
                  </article>
                ) : null}
              </div>
            </section>
          ) : null}

          {view !== 'shorts' ? (
            <section className="flex flex-col gap-4">
              <div className="flex items-center gap-2 overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.04] p-2">
                {tabOptions.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition-colors ${
                      activeTab === tab.id ? 'bg-white/15 text-white' : 'bg-black/30 text-gray-300 hover:bg-white/[0.06] hover:text-white'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-wider text-gray-400">{tabOptions.find((tab) => tab.id === activeTab)?.label}</span>
                <span className="text-xs text-gray-500">{tabMatches.length} matches</span>
              </div>

              <div className="flex flex-col gap-2">
                {tabMatches.length > 0 ? (
                  tabMatches.map((match) => {
                    const inLeagueFavorites = settings.favoriteLeagues.includes(match.league)
                    const inWatchlist = settings.watchlistMatches.includes(match.id)

                    return (
                      <Link
                        key={match.id}
                        href={`/sports/${match.id}`}
                        onClick={(e) => {
                          e.preventDefault()
                          openRestrictedMatch(`/sports/${match.id}`)
                        }}
                        className="rounded-xl border border-white/[0.06] bg-white/[0.04] overflow-hidden hover:bg-white/[0.07] transition-colors"
                      >
                        <div className="flex items-center justify-center gap-2 border-b border-white/[0.04] py-2">
                          <div className="h-1.5 w-1.5 rounded-full bg-white/10" />
                          <span className="text-[11px] font-medium uppercase tracking-wider text-gray-400">{match.league}</span>
                        </div>

                        <div className="flex items-center gap-3 px-4 py-3">
                          <button
                            onClick={(e) => {
                              e.preventDefault()
                              toggleLeagueFavorite(match.league)
                            }}
                            className="text-gray-300 hover:text-[#f4a30a]"
                            aria-label={`Toggle ${match.league} favorite`}
                          >
                            <Star size={12} fill={inLeagueFavorites ? '#f4a30a' : 'transparent'} className={inLeagueFavorites ? 'text-[#f4a30a]' : ''} />
                          </button>

                          <div className="flex min-w-0 flex-1 items-center gap-2">
                            <div className="relative h-8 w-8 overflow-hidden rounded-full border border-white/10 bg-white/5">
                              <Image src={match.team1.logo} alt={match.team1.name} fill className="object-contain p-1" unoptimized />
                            </div>
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium text-white">{match.team1.name}</p>
                              <p className="text-[10px] text-gray-500">{match.team1.record}</p>
                            </div>
                          </div>

                          <div className="px-3 text-center">
                            <p className="text-base font-bold text-white">
                              {match.status === 'live' || match.status === 'final'
                                ? `${match.score1 ?? 0} - ${match.score2 ?? 0}`
                                : match.time}
                            </p>
                            <p className="text-[10px] text-gray-500">{formatStatus(match.status).toUpperCase()}</p>
                          </div>

                          <div className="flex min-w-0 flex-1 items-center justify-end gap-2">
                            <div className="min-w-0 text-right">
                              <p className="truncate text-sm font-medium text-white">{match.team2.name}</p>
                              <p className="text-[10px] text-gray-500">{match.team2.record}</p>
                            </div>
                            <div className="relative h-8 w-8 overflow-hidden rounded-full border border-white/10 bg-white/5">
                              <Image src={match.team2.logo} alt={match.team2.name} fill className="object-contain p-1" unoptimized />
                            </div>
                          </div>

                          <button
                            onClick={(e) => {
                              e.preventDefault()
                              const next = inWatchlist
                                ? settings.watchlistMatches.filter((item) => item !== match.id)
                                : [...settings.watchlistMatches, match.id]
                              updateSetting('watchlistMatches', next)
                              toast({
                                title: inWatchlist ? 'Removed from watchlist' : 'Added to watchlist',
                                description: `${match.team1.name} vs ${match.team2.name}`,
                              })
                            }}
                            className="rounded-lg border border-white/10 bg-black/25 px-3 py-1.5 text-[11px] text-white"
                          >
                            {inWatchlist ? 'Saved' : 'Watchlist'}
                          </button>
                        </div>
                      </Link>
                    )
                  })
                ) : (
                  <div className="rounded-xl border border-white/10 bg-white/[0.04] p-6 text-sm text-gray-300">
                    No matches found for the current filters.
                  </div>
                )}
              </div>
            </section>
          ) : null}

          {view !== 'news' ? (
            <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="inline-flex items-center gap-2 text-white text-lg font-bold">
                  <PlayCircle size={18} className="text-[#f4a30a]" />
                  {t('sportsShorts')}
                </h2>
                <span className="text-xs text-gray-500">{t('matchClips')}</span>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {sportsShorts.map((item) => (
                  <ShortPreviewCard key={item.id} short={item} />
                ))}
              </div>

              {sportsShorts.length === 0 ? (
                <div className="rounded-xl border border-white/10 bg-black/25 p-4 text-sm text-gray-300">No sports shorts yet.</div>
              ) : null}
            </section>
          ) : null}

          {view === 'all' ? (
            <section className="flex flex-col gap-4">
              <h2 className="text-white text-lg font-bold">{t('popularSports')}</h2>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {[
                  { name: 'Football', color: 'from-green-600 to-green-800', value: 'football' as const },
                  { name: 'Basketball', color: 'from-orange-600 to-orange-800', value: 'basketball' as const },
                  { name: 'Volleyball', color: 'from-blue-600 to-blue-800', value: 'volleyball' as const },
                  { name: 'All Sports', color: 'from-yellow-600 to-yellow-800', value: 'all' as const },
                ].map((sport) => (
                  <button
                    key={sport.name}
                    onClick={() => {
                      setSportFilter(sport.value)
                      setLeagueFilter('all')
                    }}
                    className={`rounded-xl bg-gradient-to-br ${sport.color} p-4 text-left`}
                  >
                    <h3 className="text-sm font-bold text-white">{sport.name}</h3>
                    <p className="mt-1 text-xs text-white/70">Explore content</p>
                    <div className="mt-3 inline-flex items-center gap-1 text-xs text-white/80">
                      <Clock size={12} />
                      Filter matches
                    </div>
                  </button>
                ))}
              </div>
            </section>
          ) : null}
        </main>
      </div>
    </div>
  )
}
