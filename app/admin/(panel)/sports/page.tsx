'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import { Calendar, Clock3, Plus, Search, Trophy } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useFilterOptions } from '@/lib/admin-filters'
import { getLeagueHeroImage, getTeamArtwork } from '@/lib/sports-media'

type SportsRow = {
  sport: 'Football' | 'Basketball' | 'Volleyball'
  teamA: string
  teamALogo?: string
  teamB: string
  teamBLogo?: string
  league: string
  leagueLogo?: string
  date: string
  status: 'Live' | 'Upcoming' | 'Finished'
  stream: string
}

const initialRows: SportsRow[] = [
  { sport: 'Football', teamA: 'Liverpool', teamB: 'Manchester United', league: 'Premier League', date: '2026-03-10', status: 'Live', stream: 'streamfy.live/epl' },
  { sport: 'Football', teamA: 'Napoli', teamB: 'Inter', league: 'Serie A', date: '2026-03-11', status: 'Upcoming', stream: 'streamfy.live/seriea' },
  { sport: 'Football', teamA: 'Barcelona', teamB: 'Arsenal', league: 'Champions League', date: '2026-03-10', status: 'Live', stream: 'streamfy.live/ucl' },
  { sport: 'Basketball', teamA: 'Lakers', teamB: 'Celtics', league: 'NBA', date: '2026-03-11', status: 'Upcoming', stream: 'streamfy.live/nba' },
  { sport: 'Volleyball', teamA: 'Poland', teamB: 'Brazil', league: 'Volleyball Nations League', date: '2026-03-12', status: 'Finished', stream: 'streamfy.live/vnl' },
]

const LEAGUE_PRESETS = [
  'Champions League',
  'Premier League',
  'La Liga',
  'Serie A',
  'Bundesliga',
  'NBA',
  'EuroLeague',
  'FIBA',
  'Volleyball Nations League',
  'CEV Champions League',
]

const countryOptions = ['Germany', 'France', 'Spain', 'England', 'Italy', 'USA', 'Brazil', 'Poland']

function toIsoDate(date: Date) {
  return date.toISOString().slice(0, 10)
}

function normalizeRows(rows: SportsRow[]) {
  const now = new Date()
  const todayIso = toIsoDate(now)
  const yesterday = new Date(now)
  yesterday.setDate(now.getDate() - 1)
  const yesterdayIso = toIsoDate(yesterday)

  return rows
    .filter((row) => row.date >= yesterdayIso)
    .map((row) => {
      let nextStatus: SportsRow['status'] = row.status
      if (row.date < todayIso) nextStatus = 'Finished'
      if (row.date === todayIso) nextStatus = 'Live'
      if (row.date > todayIso && row.status === 'Live') nextStatus = 'Upcoming'
      return { ...row, status: nextStatus }
    })
}

function stablePseudoCount(input: string) {
  let hash = 0
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0
  }
  return (hash % 30) + 5
}

function getLogoSrc(value: string | undefined, fallbackName: string) {
  return value?.trim() || getTeamArtwork(fallbackName)
}

function getHeroSrc(league: string) {
  return getLeagueHeroImage(league)
}

export default function AdminSportsPage() {
  const { toast } = useToast()
  const [rows, setRows] = useState<SportsRow[]>(() => normalizeRows(initialRows))
  const [open, setOpen] = useState(false)
  const [editIndex, setEditIndex] = useState<number | null>(null)
  const [search, setSearch] = useState('')
  const [sportFilter, setSportFilter] = useState<'All' | SportsRow['sport']>('Football')
  const [leagueFilter, setLeagueFilter] = useState('All leagues')
  const [selectedMatch, setSelectedMatch] = useState(0)
  const [leagueMode, setLeagueMode] = useState<'preset' | 'custom'>('preset')
  const [form, setForm] = useState<SportsRow>({
    sport: 'Football',
    teamA: '',
    teamALogo: '',
    teamB: '',
    teamBLogo: '',
    league: 'Champions League',
    leagueLogo: '',
    date: '2026-03-20',
    status: 'Upcoming',
    stream: '',
  })
  const storedSportsFilters = useFilterOptions('sports')
  const leagueOptions = useMemo(() => Array.from(new Set([...storedSportsFilters, ...LEAGUE_PRESETS])), [storedSportsFilters])

  useEffect(() => {
    setRows((prev) => normalizeRows(prev))
    const timer = setInterval(() => setRows((prev) => normalizeRows(prev)), 60_000)
    return () => clearInterval(timer)
  }, [])

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      const q = search.trim().toLowerCase()
      const bySport = sportFilter === 'All' || row.sport === sportFilter
      const byLeague = leagueFilter === 'All leagues' || row.league === leagueFilter
      const byQuery =
        !q ||
        [row.sport, row.teamA, row.teamB, row.league, row.status, row.stream]
          .join(' ')
          .toLowerCase()
          .includes(q)
      return bySport && byLeague && byQuery
    })
  }, [rows, search, sportFilter, leagueFilter])

  useEffect(() => {
    if (selectedMatch >= filteredRows.length) setSelectedMatch(0)
  }, [filteredRows.length, selectedMatch])

  const featured = filteredRows[selectedMatch] ?? filteredRows[0]

  const startAdd = () => {
    setEditIndex(null)
    setForm({
      sport: 'Football',
      teamA: '',
      teamALogo: '',
      teamB: '',
      teamBLogo: '',
      league: 'Champions League',
      leagueLogo: '',
      date: '2026-03-20',
      status: 'Upcoming',
      stream: '',
    })
    setLeagueMode('preset')
    setOpen(true)
  }

  const startEdit = (idx: number) => {
    setEditIndex(idx)
    setForm(rows[idx])
    setLeagueMode(leagueOptions.includes(rows[idx].league) ? 'preset' : 'custom')
    setOpen(true)
  }

  const save = () => {
    if (!form.teamA.trim() || !form.teamB.trim()) {
      toast({ title: 'Missing teams', description: 'Team A and Team B are required.' })
      return
    }
    if (!form.stream.trim()) {
      toast({ title: 'Missing stream link', description: 'Please enter a stream link.' })
      return
    }
    if (!form.league.trim()) {
      toast({ title: 'Missing league', description: 'Please select or enter a league.' })
      return
    }

    const next = {
      ...form,
      teamA: form.teamA.trim(),
      teamALogo: getLogoSrc(form.teamALogo, form.teamA.trim()),
      teamB: form.teamB.trim(),
      teamBLogo: getLogoSrc(form.teamBLogo, form.teamB.trim()),
      league: form.league.trim(),
      leagueLogo: form.leagueLogo?.trim() || getHeroSrc(form.league.trim()),
      stream: form.stream.trim(),
    }

    if (editIndex === null) {
      setRows((prev) => normalizeRows([next, ...prev]))
      toast({ title: 'Sports item added', description: `${next.teamA} vs ${next.teamB} added.` })
    } else {
      setRows((prev) => normalizeRows(prev.map((row, idx) => (idx === editIndex ? next : row))))
      toast({ title: 'Sports item updated', description: `${next.teamA} vs ${next.teamB} updated.` })
    }
    setOpen(false)
  }

  const remove = (idx: number) => {
    const item = rows[idx]
    setRows((prev) => prev.filter((_, i) => i !== idx))
    toast({ title: 'Deleted', description: `${item.teamA} vs ${item.teamB} removed.` })
  }

  const todayIso = toIsoDate(new Date())
  const liveMatches = filteredRows.filter((row) => row.status === 'Live')
  const popularLeagues = Array.from(new Set(rows.map((row) => row.league))).slice(0, 8)

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-white/10 bg-[#0a1020] p-3">
        <div className="flex flex-wrap items-center gap-2">
          {(['Football', 'Basketball', 'Volleyball'] as const).map((sport) => (
            <button
              key={sport}
              onClick={() => setSportFilter(sport)}
              className={`rounded-xl px-3 py-2 text-sm ${sportFilter === sport ? 'bg-[#f4a30a] text-black' : 'bg-white/5 text-slate-300'}`}
            >
              {sport}
            </button>
          ))}
          <button onClick={() => setSportFilter('All')} className={`rounded-xl px-3 py-2 text-sm ${sportFilter === 'All' ? 'bg-[#f4a30a] text-black' : 'bg-white/5 text-slate-300'}`}>
            All
          </button>
          <div className="ml-auto flex items-center gap-2 rounded-xl border border-white/10 bg-black/30 px-3 py-2">
            <Search size={14} className="text-slate-500" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search teams, league, stream..." className="w-56 bg-transparent text-sm outline-none" />
          </div>
          <select value={leagueFilter} onChange={(e) => setLeagueFilter(e.target.value)} className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm">
            <option>All leagues</option>
            {popularLeagues.map((league) => (
              <option key={league}>{league}</option>
            ))}
          </select>
          <button onClick={startAdd} className="inline-flex items-center gap-2 rounded-xl bg-[#f4a30a] px-3 py-2 text-sm font-semibold text-black">
            <Plus size={14} />
            Add Match
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <aside className="space-y-3 rounded-2xl border border-white/10 bg-[#0a1020] p-3">
          <div>
            <p className="text-xs uppercase tracking-wider text-slate-400">Popular Leagues</p>
            <div className="mt-2 space-y-2">
              {popularLeagues.map((league) => (
                <button
                  key={league}
                  onClick={() => setLeagueFilter(league)}
                  className="flex w-full items-center justify-between rounded-lg bg-white/[0.04] px-2.5 py-2 text-left text-xs text-slate-200 hover:bg-white/[0.08]"
                >
                  <span className="truncate">{league}</span>
                  <span className="text-slate-500">{rows.filter((r) => r.league === league).length}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="border-t border-white/10 pt-3">
            <p className="text-xs uppercase tracking-wider text-slate-400">Popular Countries</p>
            <div className="mt-2 space-y-2">
              {countryOptions.map((country) => (
                <div key={country} className="flex items-center justify-between rounded-lg bg-white/[0.04] px-2.5 py-2 text-xs text-slate-300">
                  <span>{country}</span>
                  <span className="text-slate-500">{stablePseudoCount(country)}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>

        <section className="space-y-3">
          <article className="overflow-hidden rounded-2xl border border-white/10 bg-[#0a1020]">
            <div className="grid gap-3 p-4 md:grid-cols-[1.15fr_1fr]">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-xs text-slate-300">
                  <Clock3 size={12} />
                  {featured ? (featured.date === todayIso ? 'Today' : featured.date) : 'No date'}
                </div>
                <h3 className="mt-3 text-xl font-bold">{featured ? `${featured.teamA} vs ${featured.teamB}` : 'No match selected'}</h3>
                <p className="mt-1 text-sm text-slate-300">{featured?.league ?? 'No league'}</p>
                <p className="mt-2 text-xs text-slate-400">Status auto-updates daily: today = live, yesterday = finished, older removed.</p>
                <div className="mt-4 flex gap-2">
                  <button className="rounded-lg bg-[#f4a30a] px-3 py-2 text-xs font-semibold text-black">Match details</button>
                  <button className="rounded-lg border border-[#f4a30a]/40 bg-[#f4a30a]/10 px-3 py-2 text-xs text-[#ffd089]">Stream link</button>
                </div>
              </div>
              <div className="rounded-xl bg-gradient-to-br from-[#f4a30a]/20 to-black p-3">
                <div className="relative mb-3 h-24 overflow-hidden rounded-xl border border-white/10">
                  <Image src={featured ? getHeroSrc(featured.league) : '/sports-hero.jpg'} alt={featured?.league ?? 'league hero'} fill className="object-cover opacity-55" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                  <div className="absolute left-3 top-3 rounded-full bg-black/55 px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-slate-200">
                    {featured?.league ?? 'No league'}
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="relative h-10 w-10 overflow-hidden rounded-full border border-white/15 bg-white/10">
                      <Image src={featured ? getLogoSrc(featured.teamALogo, featured.teamA) : getTeamArtwork('Team A')} alt={featured?.teamA ?? 'Team A'} fill className="object-contain p-1" unoptimized />
                    </div>
                    <span>{featured?.teamA ?? '--'}</span>
                  </div>
                  <span className="text-slate-400">VS</span>
                  <div className="flex items-center gap-2">
                    <span>{featured?.teamB ?? '--'}</span>
                    <div className="relative h-10 w-10 overflow-hidden rounded-full border border-white/15 bg-white/10">
                      <Image src={featured ? getLogoSrc(featured.teamBLogo, featured.teamB) : getTeamArtwork('Team B')} alt={featured?.teamB ?? 'Team B'} fill className="object-contain p-1" unoptimized />
                    </div>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  <div className="rounded-lg bg-black/40 px-2 py-1.5 text-center text-xs">1.50</div>
                  <div className="rounded-lg bg-black/40 px-2 py-1.5 text-center text-xs">2.80</div>
                  <div className="rounded-lg bg-black/40 px-2 py-1.5 text-center text-xs">1.70</div>
                </div>
              </div>
            </div>
          </article>

          <article className="rounded-2xl border border-white/10 bg-[#0a1020] p-3">
            <div className="mb-3 flex items-center justify-between">
              <h4 className="text-sm font-semibold">Matches</h4>
              <span className="text-xs text-slate-400">{filteredRows.length} results</span>
            </div>
            <div className="space-y-2">
              {filteredRows.map((row, idx) => {
                const rowIndex = rows.findIndex(
                  (item) =>
                    item.teamA === row.teamA &&
                    item.teamB === row.teamB &&
                    item.league === row.league &&
                    item.date === row.date &&
                    item.stream === row.stream
                )
                return (
                  <div key={`${row.teamA}-${row.teamB}-${idx}`} className="rounded-xl border border-white/10 bg-black/20 p-2.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <button onClick={() => setSelectedMatch(idx)} className="rounded-md bg-white/10 px-2 py-1 text-[11px] text-slate-200">Preview</button>
                      <span className="text-xs text-slate-300">{row.league}</span>
                      <span className="text-xs text-slate-500">|</span>
                      <span className="text-xs text-slate-400">{row.date === todayIso ? 'Today' : row.date}</span>
                      {row.status === 'Live' ? (
                        <span className="rounded-full border border-[#EF4444]/40 bg-[#EF4444]/20 px-2 py-0.5 text-[10px] text-[#fca5a5]">LIVE</span>
                      ) : (
                        <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-slate-300">{row.status}</span>
                      )}
                      <div className="ml-auto flex gap-1.5">
                        <button onClick={() => startEdit(rowIndex)} className="rounded-md border border-[#f4a30a]/40 bg-[#f4a30a]/10 px-2 py-1 text-[11px] text-[#ffd089]">Edit</button>
                        <button onClick={() => remove(rowIndex)} className="rounded-md border border-[#EF4444]/40 bg-[#EF4444]/10 px-2 py-1 text-[11px] text-[#fca5a5]">Delete</button>
                      </div>
                    </div>
                    <div className="mt-2 grid grid-cols-[1fr_auto_1fr_auto] items-center gap-2 text-sm">
                      <div className="flex min-w-0 items-center gap-2">
                        <div className="relative h-8 w-8 overflow-hidden rounded-full border border-white/10 bg-white/10">
                          <Image src={getLogoSrc(row.teamALogo, row.teamA)} alt={row.teamA} fill className="object-contain p-1" unoptimized />
                        </div>
                        <span className="truncate">{row.teamA}</span>
                      </div>
                      <span className="text-slate-500">vs</span>
                      <div className="flex min-w-0 items-center gap-2">
                        <span className="truncate">{row.teamB}</span>
                        <div className="relative h-8 w-8 overflow-hidden rounded-full border border-white/10 bg-white/10">
                          <Image src={getLogoSrc(row.teamBLogo, row.teamB)} alt={row.teamB} fill className="object-contain p-1" unoptimized />
                        </div>
                      </div>
                      <span className="text-xs text-[#f4a30a]">{row.stream}</span>
                    </div>
                  </div>
                )
              })}
              {filteredRows.length === 0 ? (
                <div className="rounded-xl border border-white/10 bg-black/20 p-4 text-sm text-slate-400">No matches found for current filters.</div>
              ) : null}
            </div>
          </article>
        </section>

        <aside className="space-y-3">
          <article className="rounded-2xl border border-white/10 bg-[#0a1020] p-3">
            <h4 className="text-sm font-semibold">Popular Live Matches</h4>
            <div className="mt-2 space-y-2">
              {liveMatches.slice(0, 3).map((m, idx) => (
                <div key={`${m.teamA}-${idx}`} className="rounded-lg border border-white/10 bg-black/20 p-2.5">
                  <div className="text-xs text-slate-400">{m.league}</div>
                  <div className="mt-1 text-sm">{m.teamA} vs {m.teamB}</div>
                  <div className="mt-2 grid grid-cols-3 gap-1.5 text-[11px]">
                    <div className="rounded-md bg-black/40 px-2 py-1 text-center">1.20</div>
                    <div className="rounded-md bg-black/40 px-2 py-1 text-center">2.10</div>
                    <div className="rounded-md bg-black/40 px-2 py-1 text-center">1.45</div>
                  </div>
                </div>
              ))}
              {liveMatches.length === 0 ? <div className="rounded-lg bg-black/20 p-2.5 text-xs text-slate-400">No live matches right now.</div> : null}
            </div>
          </article>

          <article className="rounded-2xl border border-white/10 bg-[#0a1020] p-3">
            <h4 className="text-sm font-semibold">Match Slip (Prototype)</h4>
            <div className="mt-2 rounded-lg bg-black/20 p-2.5 text-xs text-slate-300">
              <p className="font-medium">{featured ? `${featured.teamA} vs ${featured.teamB}` : 'No match selected'}</p>
              <p className="mt-1 text-slate-400">{featured?.league ?? '--'} | {featured?.sport ?? '--'}</p>
              <p className="mt-2 text-[#f4a30a]">Potential: 330.00 USD</p>
            </div>
            <button className="mt-3 w-full rounded-lg bg-[#f4a30a] px-3 py-2 text-sm font-semibold text-black">Place Bet (Prototype)</button>
          </article>
        </aside>
      </div>

      {open ? (
        <div className="fixed inset-0 z-50 bg-black/70 p-4 backdrop-blur-sm">
          <div className="mx-auto mt-8 w-full max-w-3xl rounded-2xl border border-white/10 bg-[#0b1220] p-5">
            <h3 className="text-lg font-semibold">{editIndex === null ? 'Add Sports Item' : 'Edit Sports Item'}</h3>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <select value={form.sport} onChange={(e) => setForm((p) => ({ ...p, sport: e.target.value as SportsRow['sport'] }))} className="rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm">
                <option>Football</option>
                <option>Basketball</option>
                <option>Volleyball</option>
              </select>
              <div className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-slate-300">
                <Calendar size={14} />
                Calendar auto-status enabled
              </div>
              <input value={form.teamA} onChange={(e) => setForm((p) => ({ ...p, teamA: e.target.value }))} placeholder="Team A" className="rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm" />
              <input value={form.teamB} onChange={(e) => setForm((p) => ({ ...p, teamB: e.target.value }))} placeholder="Team B" className="rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm" />
              <input value={form.teamALogo ?? ''} onChange={(e) => setForm((p) => ({ ...p, teamALogo: e.target.value }))} placeholder="Team A logo URL (optional)" className="rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm" />
              <input value={form.teamBLogo ?? ''} onChange={(e) => setForm((p) => ({ ...p, teamBLogo: e.target.value }))} placeholder="Team B logo URL (optional)" className="rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm" />
              <select value={leagueMode} onChange={(e) => setLeagueMode(e.target.value as 'preset' | 'custom')} className="rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm">
                <option value="preset">Select league option</option>
                <option value="custom">Type custom league</option>
              </select>
              {leagueMode === 'preset' ? (
                <select value={form.league} onChange={(e) => setForm((p) => ({ ...p, league: e.target.value }))} className="rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm">
                  {leagueOptions.map((league) => (
                    <option key={league}>{league}</option>
                  ))}
                </select>
              ) : (
                <input value={form.league} onChange={(e) => setForm((p) => ({ ...p, league: e.target.value }))} placeholder="Type league name" className="rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm" />
              )}
              <input value={form.leagueLogo ?? ''} onChange={(e) => setForm((p) => ({ ...p, leagueLogo: e.target.value }))} placeholder="League logo URL (optional)" className="rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm" />
              <input type="date" value={form.date} onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))} className="rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm" />
              <select value={form.status} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value as SportsRow['status'] }))} className="rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm">
                <option>Live</option>
                <option>Upcoming</option>
                <option>Finished</option>
              </select>
              <input value={form.stream} onChange={(e) => setForm((p) => ({ ...p, stream: e.target.value }))} placeholder="streamfy.live/..." className="md:col-span-2 rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm" />
              <div className="md:col-span-2 rounded-2xl border border-white/10 bg-black/25 p-3">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Team Image Preview</p>
                <div className="mt-3 grid gap-3 md:grid-cols-3">
                  <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3 text-center">
                    <div className="relative mx-auto h-16 w-16 overflow-hidden rounded-full border border-white/10 bg-white/10">
                      <Image src={getLogoSrc(form.teamALogo, form.teamA || 'Team A')} alt={form.teamA || 'Team A'} fill className="object-contain p-1.5" unoptimized />
                    </div>
                    <p className="mt-2 text-sm font-medium text-white">{form.teamA || 'Team A'}</p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3 text-center">
                    <div className="relative mx-auto h-16 w-16 overflow-hidden rounded-full border border-white/10 bg-white/10">
                      <Image src={getHeroSrc(form.league || 'Champions League')} alt={form.league || 'League'} fill className="object-cover" />
                    </div>
                    <p className="mt-2 text-sm font-medium text-white">{form.league || 'League'}</p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3 text-center">
                    <div className="relative mx-auto h-16 w-16 overflow-hidden rounded-full border border-white/10 bg-white/10">
                      <Image src={getLogoSrc(form.teamBLogo, form.teamB || 'Team B')} alt={form.teamB || 'Team B'} fill className="object-contain p-1.5" unoptimized />
                    </div>
                    <p className="mt-2 text-sm font-medium text-white">{form.teamB || 'Team B'}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => setOpen(false)} className="rounded-xl border border-white/10 px-4 py-2 text-sm">Cancel</button>
              <button onClick={save} className="rounded-xl bg-[#f4a30a] px-4 py-2 text-sm font-semibold text-black">Save</button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
