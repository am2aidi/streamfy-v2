'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Sidebar } from '@/components/Sidebar'
import { Header } from '@/components/Header'
import { ChevronDown, ChevronUp, Star, Clock, Trophy, ChevronRight, Newspaper, PlayCircle } from 'lucide-react'
import Image from 'next/image'
import { getMatchId, sportsData } from '@/lib/sports-data'
import { useAppSettings } from '@/components/AppSettingsProvider'
import { useAuth } from '@/components/AuthProvider'
import { useToast } from '@/hooks/use-toast'
import { LiveMomentsBanner } from '@/components/LiveMomentsBanner'
import { SocialShareLinks } from '@/components/SocialShareLinks'

type TabId = 'yesterday' | 'today' | 'upcoming'

export default function SportsPage() {
  const router = useRouter()
  const { requireAuth } = useAuth()
  const [activeTab, setActiveTab] = useState<TabId>('today')
  const [showAll, setShowAll] = useState(false)
  const [myLeagueOnly, setMyLeagueOnly] = useState(false)
  const [sportFilter, setSportFilter] = useState<'all' | 'football' | 'basketball' | 'volleyball'>('all')
  const [leagueFilter, setLeagueFilter] = useState('all')
  const { settings, updateSetting } = useAppSettings()
  const { toast } = useToast()

  const tabs: { id: TabId; label: string }[] = [
    { id: 'yesterday', label: 'Yesterday' },
    { id: 'today', label: 'Today' },
    { id: 'upcoming', label: 'Upcoming' },
  ]
  const quickDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

  const matchesMap: Record<TabId, typeof sportsData.today> = {
    yesterday: sportsData.yesterday,
    today: sportsData.today,
    upcoming: sportsData.upcoming,
  }

  const inferSport = (league: string): 'football' | 'basketball' | 'volleyball' => {
    const l = league.toLowerCase()
    if (l.includes('nba') || l.includes('fiba')) return 'basketball'
    if (l.includes('volleyball')) return 'volleyball'
    return 'football'
  }

  const matchesWithIndex = matchesMap[activeTab].map((match, index) => ({ match, index }))
  const sportScopedMatches =
    sportFilter === 'all'
      ? matchesWithIndex
      : matchesWithIndex.filter(({ match }) => inferSport(match.league) === sportFilter)

  const possibleLeagues = Array.from(new Set(sportScopedMatches.map(({ match }) => match.league)))
  const leagueScopedMatches =
    leagueFilter === 'all' ? sportScopedMatches : sportScopedMatches.filter(({ match }) => match.league === leagueFilter)

  const currentMatches = myLeagueOnly
    ? leagueScopedMatches.filter(({ match }) => settings.favoriteLeagues.includes(match.league))
    : leagueScopedMatches
  const displayedMatches = showAll ? currentMatches : currentMatches.slice(0, 4)

  const dateLabel =
    activeTab === 'yesterday'
      ? 'Tuesday, Feb 25'
      : activeTab === 'today'
        ? 'Wednesday, Feb 26'
        : 'This Week'

  const sportsNews = [
    {
      title: 'Title race gets tighter after late winner',
      league: 'Premier League',
      time: '10m ago',
      image: 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=640&q=80',
    },
    {
      title: 'Derby injury updates before kickoff',
      league: 'Serie A',
      time: '25m ago',
      image: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=640&q=80',
    },
    {
      title: 'Coach reacts to dramatic overtime win',
      league: 'NBA',
      time: '50m ago',
      image: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=640&q=80',
    },
  ]

  const openRestrictedMatch = (href: string) => {
    requireAuth(() => router.push(href), 'Sign in to view sports match details.')
  }

  return (
    <div className="flex min-h-screen bg-black">
      <Sidebar />

      <div className="ml-[92px] w-[calc(100vw-92px)] min-h-[100dvh] overflow-x-hidden pb-8">
        <Header />

        <main className="flex flex-col gap-6 px-6">
          <LiveMomentsBanner section="sports" />
          {/* Page Title with League Button */}
          <div className="flex items-center justify-between">
            <h1 className="text-white text-3xl font-bold">Sports</h1>
            <button
              onClick={() => setMyLeagueOnly((prev) => !prev)}
              className={`flex items-center gap-2 text-sm font-medium rounded-full px-4 py-2 transition-colors ${
                myLeagueOnly ? 'bg-[#f4a30a] text-black' : 'bg-white/10 text-white hover:bg-white/15'
              }`}
            >
              <Trophy size={14} className="text-[#f4a30a]" />
              {myLeagueOnly ? 'All Leagues' : 'My Leagues'}
            </button>
          </div>

          <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
            <SocialShareLinks title="Share Sports Page" />
          </section>

          {/* Live Events Section */}
          <section className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-2">
              {[
                { id: 'all', label: 'All Sports' },
                { id: 'football', label: 'Football' },
                { id: 'basketball', label: 'Basketball' },
                { id: 'volleyball', label: 'Volleyball' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setSportFilter(item.id as typeof sportFilter)
                    setLeagueFilter('all')
                  }}
                  className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${
                    sportFilter === item.id
                      ? 'border-[#f4a30a]/60 bg-[#f4a30a]/20 text-[#f4a30a]'
                      : 'border-white/15 bg-white/5 text-gray-300 hover:text-white'
                  }`}
                >
                  {item.label}
                </button>
              ))}
              <select
                value={leagueFilter}
                onChange={(e) => setLeagueFilter(e.target.value)}
                className="ml-auto rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white"
              >
                <option value="all">All leagues</option>
                {possibleLeagues.map((league) => (
                  <option key={league} value={league}>
                    {league}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <h2 className="text-white text-lg font-bold">Live Events</h2>
              </div>
              <button className="flex items-center gap-1 text-[#f4a30a] text-sm cursor-pointer hover:underline">
                See All <ChevronRight size={14} />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {sportsData.today
                .map((match, index) => ({ match, index }))
                .filter(({ match }) => (sportFilter === 'all' ? true : inferSport(match.league) === sportFilter))
                .filter(({ match }) => (leagueFilter === 'all' ? true : match.league === leagueFilter))
                .filter(({ match }) => match.status === 'live')
                .map(({ match, index }) => (
                  <Link
                    href={`/sports/${getMatchId('today', index)}`}
                    onClick={(e) => {
                      e.preventDefault()
                      openRestrictedMatch(`/sports/${getMatchId('today', index)}`)
                    }}
                    key={getMatchId('today', index)}
                    className="relative bg-white/5 border border-white/10 rounded-xl overflow-hidden hover:bg-white/[0.08] transition-colors cursor-pointer group"
                  >
                    <div className="relative h-28">
                      <SportsImage
                        src={match.heroImage || '/sports-hero.jpg'}
                        fallbackSrc="/sports-hero.jpg"
                        alt={`${match.team1.name} vs ${match.team2.name}`}
                        fill
                        className="object-cover opacity-40 group-hover:opacity-50 transition-opacity"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                      <div className="absolute top-3 left-3 flex items-center gap-2">
                        <span className="bg-red-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                          Live
                        </span>
                        <span className="text-white/60 text-xs">{match.league}</span>
                      </div>
                      <div className="absolute bottom-3 left-0 right-0 px-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="relative w-7 h-7 rounded-full flex-shrink-0 bg-white/10 border border-white/20 overflow-hidden">
                              <SportsImage
                                src={match.team1.logo}
                                fallbackSrc="/placeholder-logo.png"
                                alt={match.team1.name}
                                fill
                                className="object-contain p-0.5"
                              />
                            </div>
                            <span className="text-white text-sm font-medium">{match.team1.name}</span>
                          </div>
                          <span className="text-white text-lg font-bold">{match.score1}</span>
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <div className="flex items-center gap-2">
                            <div className="relative w-7 h-7 rounded-full flex-shrink-0 bg-white/10 border border-white/20 overflow-hidden">
                              <SportsImage
                                src={match.team2.logo}
                                fallbackSrc="/placeholder-logo.png"
                                alt={match.team2.name}
                                fill
                                className="object-contain p-0.5"
                              />
                            </div>
                            <span className="text-white text-sm font-medium">{match.team2.name}</span>
                          </div>
                          <span className="text-white text-lg font-bold">{match.score2}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
            </div>
          </section>

          {/* Sports Days + News + Shorts */}
          <section className="grid gap-4 xl:grid-cols-[1.1fr_1fr]">
            <article className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="inline-flex items-center gap-2 text-white text-lg font-bold">
                  <Newspaper size={18} className="text-[#f4a30a]" />
                  Sports News
                </h2>
                <span className="text-xs text-gray-500">Updated every hour</span>
              </div>

              <div className="mb-4 flex flex-wrap gap-2">
                {quickDays.map((day) => (
                  <button
                    key={day}
                    className={`rounded-full border px-3 py-1.5 text-xs ${
                      (day === 'Wed' && activeTab === 'today') || (day === 'Tue' && activeTab === 'yesterday')
                        ? 'border-[#f4a30a]/60 bg-[#f4a30a]/20 text-[#f4a30a]'
                        : 'border-white/15 bg-white/5 text-gray-300'
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>

              <div className="space-y-2">
                {sportsNews.map((item) => (
                  <div key={item.title} className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/25 p-2.5">
                    <div className="relative h-16 w-24 overflow-hidden rounded-lg border border-white/10">
                      <SportsImage src={item.image} fallbackSrc="/sports-hero.jpg" alt={item.title} fill className="object-cover" />
                    </div>
                    <div className="min-w-0">
                      <p className="line-clamp-2 text-sm font-semibold text-white">{item.title}</p>
                      <p className="mt-1 text-xs text-gray-400">
                        {item.league} • {item.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </article>

            <article className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="inline-flex items-center gap-2 text-white text-lg font-bold">
                  <PlayCircle size={18} className="text-[#f4a30a]" />
                  Sports Shorts
                </h2>
                <span className="text-xs text-gray-500">Match clips</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {sportsData.today.slice(0, 4).map((match, index) => (
                  <Link
                    href={`/sports/${getMatchId('today', index)}`}
                    onClick={(e) => {
                      e.preventDefault()
                      openRestrictedMatch(`/sports/${getMatchId('today', index)}`)
                    }}
                    key={`short-${match.league}-${index}`}
                    className="group relative overflow-hidden rounded-xl border border-white/10 bg-black/30"
                  >
                    <div className="relative h-28">
                      <SportsImage
                        src={match.heroImage || '/sports-hero.jpg'}
                        fallbackSrc="/sports-hero.jpg"
                        alt={`${match.team1.name} vs ${match.team2.name}`}
                        fill
                        className="object-cover opacity-80 group-hover:opacity-95 transition-opacity"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      <div className="absolute left-2 top-2 rounded-full bg-black/60 px-2 py-0.5 text-[10px] text-white">0:{35 + index}s</div>
                      <div className="absolute bottom-2 left-2 right-2">
                        <p className="truncate text-xs font-semibold text-white">{match.team1.name} vs {match.team2.name}</p>
                        <p className="text-[10px] text-gray-300">{match.league}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </article>
          </section>

          {/* Schedule Tabs - Apple Sports Style */}
          <section className="flex flex-col gap-4">
            {/* Tabs */}
            <div className="flex items-center gap-1 bg-white/5 rounded-xl p-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id)
                    setShowAll(false)
                  }}
                  className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all ${
                    activeTab === tab.id
                      ? 'bg-white/15 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Date Label & Show More */}
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-xs font-medium uppercase tracking-wider">{dateLabel}</span>
              {currentMatches.length > 4 && (
                <button
                  onClick={() => setShowAll(!showAll)}
                  className="flex items-center gap-1 text-gray-400 text-xs hover:text-white transition-colors"
                >
                  {showAll ? (
                    <>
                      Show less <ChevronUp size={12} />
                    </>
                  ) : (
                    <>
                      Show more <ChevronDown size={12} />
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Match Cards - Apple Sports Style */}
            <div className="flex flex-col gap-2">
              {displayedMatches.map(({ match, index }) => (
                <Link
                  href={`/sports/${getMatchId(activeTab, index)}`}
                  onClick={(e) => {
                    e.preventDefault()
                    openRestrictedMatch(`/sports/${getMatchId(activeTab, index)}`)
                  }}
                  key={getMatchId(activeTab, index)}
                  className="bg-white/[0.04] border border-white/[0.06] rounded-xl overflow-hidden hover:bg-white/[0.07] transition-colors cursor-pointer"
                >
                  {/* League Header */}
                  <div className="flex items-center justify-center gap-2 py-2 border-b border-white/[0.04]">
                    <div className="w-1.5 h-1.5 rounded-full bg-white/10" />
                    <span className="text-gray-400 text-[11px] font-medium uppercase tracking-wider">
                      {match.league}
                    </span>
                  </div>

                  {/* Match Row */}
                  <div className="flex items-center px-4 py-3">
                    {/* Star */}
                    <div className="w-6 flex-shrink-0">
                      <button
                        onClick={(e) => {
                          e.preventDefault()
                          const isFav = settings.favoriteLeagues.includes(match.league)
                          const next = isFav
                            ? settings.favoriteLeagues.filter((league) => league !== match.league)
                            : [...settings.favoriteLeagues, match.league]
                          updateSetting('favoriteLeagues', next)
                          toast({
                            title: isFav ? 'League removed' : 'League added',
                            description: `${match.league} ${isFav ? 'removed from' : 'added to'} My Leagues.`,
                          })
                        }}
                        aria-label={
                          settings.favoriteLeagues.includes(match.league) || match.starred
                            ? `Remove ${match.league} from My Leagues`
                            : `Add ${match.league} to My Leagues`
                        }
                        title={
                          settings.favoriteLeagues.includes(match.league) || match.starred
                            ? `Remove ${match.league} from My Leagues`
                            : `Add ${match.league} to My Leagues`
                        }
                      >
                        <Star
                          size={12}
                          className={settings.favoriteLeagues.includes(match.league) || match.starred ? 'text-[#f4a30a]' : 'text-gray-600'}
                          fill={settings.favoriteLeagues.includes(match.league) || match.starred ? '#f4a30a' : 'transparent'}
                        />
                      </button>
                    </div>

                    {/* Team 1 */}
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <div className="relative w-8 h-8 rounded-full flex-shrink-0 border border-white/10 overflow-hidden bg-white/5">
                        <SportsImage
                          src={match.team1.logo}
                          fallbackSrc="/placeholder-logo.png"
                          alt={match.team1.name}
                          fill
                          className="object-contain p-1"
                        />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-white text-sm font-medium truncate">{match.team1.name}</span>
                        <span className="text-gray-500 text-[10px]">{match.team1.record}</span>
                      </div>
                    </div>

                    {/* Score / Time */}
                    <div className="flex flex-col items-center px-4 flex-shrink-0">
                      {match.status === 'final' ? (
                        <>
                          <span className="text-white text-base font-bold">
                            {match.score1} - {match.score2}
                          </span>
                          <span className="text-gray-500 text-[10px] font-medium">FT</span>
                        </>
                      ) : match.status === 'live' ? (
                        <>
                          <span className="text-white text-base font-bold">
                            {match.score1} - {match.score2}
                          </span>
                          <div className="flex items-center gap-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                            <span className="text-red-400 text-[10px] font-bold">LIVE</span>
                          </div>
                        </>
                      ) : (
                        <>
                          <span className="text-white text-base font-bold">{match.time}</span>
                          <div className="flex items-center gap-1">
                            <Clock size={9} className="text-gray-500" />
                            <span className="text-gray-500 text-[10px]">Scheduled</span>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Team 2 */}
                    <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
                      <div className="flex flex-col items-end min-w-0">
                        <span className="text-white text-sm font-medium truncate">{match.team2.name}</span>
                        <span className="text-gray-500 text-[10px]">{match.team2.record}</span>
                      </div>
                      <div className="relative w-8 h-8 rounded-full flex-shrink-0 border border-white/10 overflow-hidden bg-white/5">
                        <SportsImage
                          src={match.team2.logo}
                          fallbackSrc="/placeholder-logo.png"
                          alt={match.team2.name}
                          fill
                          className="object-contain p-1"
                        />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* Popular Sports */}
          <section className="flex flex-col gap-4">
            <h2 className="text-white text-lg font-bold">Popular Sports</h2>
            <div className="grid grid-cols-4 gap-3">
              {[
                { name: 'Football', color: 'from-green-600 to-green-800' },
                { name: 'Basketball', color: 'from-orange-600 to-orange-800' },
                { name: 'Volleyball', color: 'from-blue-600 to-blue-800' },
                { name: 'All Sports', color: 'from-yellow-600 to-yellow-800' },
              ].map((sport, i) => (
                <div
                  key={i}
                  onClick={() => {
                    const next = sport.name.toLowerCase()
                    if (next.includes('foot')) setSportFilter('football')
                    else if (next.includes('basket')) setSportFilter('basketball')
                    else if (next.includes('volley')) setSportFilter('volleyball')
                    else setSportFilter('all')
                    setLeagueFilter('all')
                  }}
                  className={`bg-gradient-to-br ${sport.color} rounded-xl p-4 cursor-pointer hover:opacity-90 transition-opacity`}
                >
                  <h3 className="text-white font-bold text-sm">{sport.name}</h3>
                  <p className="text-white/70 text-xs mt-0.5">Explore content</p>
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}

function SportsImage({
  src,
  fallbackSrc,
  alt,
  className,
  fill,
}: {
  src: string
  fallbackSrc: string
  alt: string
  className?: string
  fill?: boolean
}) {
  const [currentSrc, setCurrentSrc] = useState(src)

  return (
    <Image
      src={currentSrc}
      alt={alt}
      fill={fill}
      className={className}
      onError={() => setCurrentSrc(fallbackSrc)}
      unoptimized
    />
  )
}
