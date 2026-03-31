'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search as SearchIcon } from 'lucide-react'
import { Sidebar } from '@/components/Sidebar'
import { Header } from '@/components/Header'
import { movieCards } from '@/lib/movies-data'
import { musicTracks } from '@/lib/music-data'
import { getAllMatches } from '@/lib/sports-data'
import { shortVideos } from '@/lib/shorts-data'
import { useNewsItems } from '@/hooks/useNewsItems'
import { useCommunity } from '@/hooks/useCommunity'

export function SearchClient() {
  const router = useRouter()
  const params = useSearchParams()
  const qParam = params.get('q') ?? ''
  const [q, setQ] = useState(qParam)
  const { items: newsItems } = useNewsItems()
  const { items: communityItems } = useCommunity()

  const query = qParam.trim().toLowerCase()

  const movies = useMemo(() => {
    if (!query) return []
    return movieCards.filter((m) => (m.title + ' ' + m.description + ' ' + m.genre).toLowerCase().includes(query)).slice(0, 20)
  }, [query])

  const tracks = useMemo(() => {
    if (!query) return []
    return musicTracks.filter((t) => (t.title + ' ' + t.artist + ' ' + t.genre).toLowerCase().includes(query)).slice(0, 20)
  }, [query])

  const matches = useMemo(() => {
    if (!query) return []
    return getAllMatches().filter((m) => (m.league + ' ' + m.team1.name + ' ' + m.team2.name).toLowerCase().includes(query)).slice(0, 20)
  }, [query])

  const shorts = useMemo(() => {
    if (!query) return []
    return shortVideos.filter((s) => (s.title + ' ' + s.caption).toLowerCase().includes(query)).slice(0, 20)
  }, [query])

  const news = useMemo(() => {
    if (!query) return []
    return newsItems.filter((n) => (n.title + ' ' + n.summary + ' ' + n.source).toLowerCase().includes(query)).slice(0, 20)
  }, [newsItems, query])

  const community = useMemo(() => {
    if (!query) return []
    return communityItems
      .filter((i) => i.status === 'published')
      .filter((i) => (i.title + ' ' + i.description + ' ' + i.kind).toLowerCase().includes(query))
      .slice(0, 20)
  }, [communityItems, query])

  const hasResults = movies.length + tracks.length + matches.length + shorts.length + news.length + community.length > 0

  const submit = () => {
    const next = q.trim()
    router.push(next ? `/search?q=${encodeURIComponent(next)}` : '/search')
  }

  return (
    <div className="flex min-h-screen bg-black">
      <Sidebar />
      <div className="w-full md:ml-[92px] md:w-[calc(100vw-92px)] min-h-[100dvh] overflow-x-hidden pb-24 md:pb-8">
        <Header />

        <main className="px-6 flex flex-col gap-6">
          <div>
            <h1 className="text-white text-3xl font-bold">Search</h1>
            <p className="text-gray-400 text-sm mt-1">Movies, music, sports, shorts, news, and community.</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
            <div className="relative">
              <SearchIcon size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') submit()
                }}
                placeholder="Search..."
                className="w-full rounded-xl border border-white/10 bg-black/40 py-3 pl-10 pr-4 text-sm text-white placeholder-gray-500 focus:border-[#f4a30a]/50 focus:outline-none"
              />
            </div>
            <div className="mt-3 flex justify-end">
              <button onClick={submit} className="rounded-xl bg-[#f4a30a] px-4 py-2 text-sm font-semibold text-black">
                Search
              </button>
            </div>
          </div>

          {!query ? (
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 text-gray-300">Type something to search.</div>
          ) : !hasResults ? (
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 text-gray-300">
              No results for <span className="text-white font-semibold">{qParam}</span>.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {movies.length ? (
                <ResultSection title="Movies / TV / Animation">
                  {movies.map((m) => (
                    <ResultItem key={m.id} href={`/movies/${m.id}`} title={m.title} meta={`${m.year} • ${m.genre}`} />
                  ))}
                </ResultSection>
              ) : null}

              {tracks.length ? (
                <ResultSection title="Music">
                  {tracks.map((t) => (
                    <ResultItem key={t.id} href={`/music/${t.id}`} title={t.title} meta={`${t.artist} • ${t.genre}`} />
                  ))}
                </ResultSection>
              ) : null}

              {matches.length ? (
                <ResultSection title="Sports">
                  {matches.map((m) => (
                    <ResultItem
                      key={m.id}
                      href={`/sports/${m.id}`}
                      title={`${m.team1.name} vs ${m.team2.name}`}
                      meta={`${m.league} • ${m.date}`}
                    />
                  ))}
                </ResultSection>
              ) : null}

              {shorts.length ? (
                <ResultSection title="Shorts">
                  {shorts.map((s) => (
                    <ResultItem key={s.id} href={`/shorts/${s.id}`} title={s.title} meta={s.caption} />
                  ))}
                </ResultSection>
              ) : null}

              {news.length ? (
                <ResultSection title="News">
                  {news.map((n) => (
                    <ResultItem key={n.id} href={`/community#news-${n.id}`} title={n.title} meta={n.source} />
                  ))}
                </ResultSection>
              ) : null}

              {community.length ? (
                <ResultSection title="Community">
                  {community.map((i) => (
                    <ResultItem key={i.id} href={`/community#${i.id}`} title={i.title} meta={i.kind} />
                  ))}
                </ResultSection>
              ) : null}

            </div>
          )}
        </main>
      </div>
    </div>
  )
}

function ResultSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-white text-lg font-semibold">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">{children}</div>
    </section>
  )
}

function ResultItem({ href, title, meta }: { href: string; title: string; meta?: string }) {
  return (
    <Link href={href} className="rounded-xl border border-white/10 bg-white/[0.04] p-3 hover:bg-white/[0.07] transition-colors">
      <p className="text-white text-sm font-semibold">{title}</p>
      {meta ? <p className="text-gray-400 text-xs mt-1">{meta}</p> : null}
    </Link>
  )
}

