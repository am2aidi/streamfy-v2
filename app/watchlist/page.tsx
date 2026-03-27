'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Sidebar } from '@/components/Sidebar'
import { Header } from '@/components/Header'
import { useAppSettings } from '@/components/AppSettingsProvider'
import { movieCards } from '@/lib/movies-data'
import { musicTracks } from '@/lib/music-data'
import { getMatchById } from '@/lib/sports-data'
import { getShortById } from '@/lib/shorts-data'

type Tab = 'all' | 'movies' | 'music' | 'sports' | 'shorts'

export default function WatchlistPage() {
  const { settings, updateSetting } = useAppSettings()
  const [tab, setTab] = useState<Tab>('all')

  const movies = useMemo(
    () => movieCards.filter((m) => settings.watchlistMovies.includes(m.id)),
    [settings.watchlistMovies]
  )
  const tracks = useMemo(
    () => musicTracks.filter((t) => settings.watchlistTracks.includes(t.id)),
    [settings.watchlistTracks]
  )
  const matches = useMemo(
    () =>
      settings.watchlistMatches
        .map((id) => getMatchById(id))
        .filter((match): match is NonNullable<ReturnType<typeof getMatchById>> => match !== null),
    [settings.watchlistMatches]
  )
  const shorts = useMemo(
    () =>
      settings.watchlistShorts
        .map((id) => getShortById(id))
        .filter((short): short is NonNullable<ReturnType<typeof getShortById>> => short !== null),
    [settings.watchlistShorts]
  )

  const isEmpty = movies.length === 0 && tracks.length === 0 && matches.length === 0 && shorts.length === 0

  const clear = () => {
    updateSetting('watchlistMovies', [])
    updateSetting('watchlistTracks', [])
    updateSetting('watchlistMatches', [])
    updateSetting('watchlistShorts', [])
  }

  return (
    <div className="flex min-h-screen bg-black">
      <Sidebar />
      <div className="w-full md:ml-[92px] md:w-[calc(100vw-92px)] min-h-[100dvh] overflow-x-hidden pb-24 md:pb-8">
        <Header />

        <main className="px-6 flex flex-col gap-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h1 className="text-white text-3xl font-bold">Watchlist</h1>
              <p className="text-gray-400 text-sm mt-1">Save movies, tracks, matches, and shorts to watch later.</p>
            </div>
            <button
              onClick={clear}
              disabled={isEmpty}
              className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-gray-200 disabled:opacity-40"
            >
              Clear all
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              { id: 'all', label: 'All' },
              { id: 'movies', label: 'Movies' },
              { id: 'music', label: 'Music' },
              { id: 'sports', label: 'Sports' },
              { id: 'shorts', label: 'Shorts' },
            ].map((x) => (
              <button
                key={x.id}
                onClick={() => setTab(x.id as Tab)}
                className={`rounded-full border px-4 py-2 text-sm ${
                  tab === x.id ? 'border-[#f4a30a]/60 bg-[#f4a30a]/15 text-[#f4a30a]' : 'border-white/15 bg-white/5 text-gray-300'
                }`}
              >
                {x.label}
              </button>
            ))}
          </div>

          {isEmpty ? (
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 text-gray-300">
              Your watchlist is empty.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {(tab === 'all' || tab === 'movies') && movies.length > 0 ? (
                <section className="flex flex-col gap-3">
                  <h2 className="text-white text-lg font-semibold">Movies</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                    {movies.map((m) => (
                      <Link
                        key={m.id}
                        href={`/movies/${m.id}`}
                        className="group overflow-hidden rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
                      >
                        <div className="relative h-44">
                          <Image src={m.image} alt={m.title} fill className="object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
                        </div>
                        <div className="p-3">
                          <p className="text-white text-sm font-semibold truncate">{m.title}</p>
                          <p className="text-gray-400 text-xs">{m.year}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </section>
              ) : null}

              {(tab === 'all' || tab === 'music') && tracks.length > 0 ? (
                <section className="flex flex-col gap-3">
                  <h2 className="text-white text-lg font-semibold">Music</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                    {tracks.map((t) => (
                      <Link
                        key={t.id}
                        href={`/music/${t.id}`}
                        className="group overflow-hidden rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
                      >
                        <div className="relative h-44">
                          <Image src={t.image} alt={t.title} fill className="object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
                        </div>
                        <div className="p-3">
                          <p className="text-white text-sm font-semibold truncate">{t.title}</p>
                          <p className="text-gray-400 text-xs truncate">{t.artist}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </section>
              ) : null}

              {(tab === 'all' || tab === 'sports') && matches.length > 0 ? (
                <section className="flex flex-col gap-3">
                  <h2 className="text-white text-lg font-semibold">Sports</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {matches.map((m) => (
                      <Link
                        key={m.id}
                        href={`/sports/${m.id}`}
                        className="rounded-xl border border-white/10 bg-white/[0.04] p-4 hover:bg-white/[0.07] transition-colors"
                      >
                        <p className="text-white text-sm font-semibold">{m.team1.name} vs {m.team2.name}</p>
                        <p className="text-gray-400 text-xs mt-1">{m.league}</p>
                      </Link>
                    ))}
                  </div>
                </section>
              ) : null}

              {(tab === 'all' || tab === 'shorts') && shorts.length > 0 ? (
                <section className="flex flex-col gap-3">
                  <h2 className="text-white text-lg font-semibold">Shorts</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                    {shorts.map((s) => (
                      <Link
                        key={s.id}
                        href={`/shorts/${s.id}`}
                        className="group overflow-hidden rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
                      >
                        <div className="relative h-44">
                          <Image src={s.image} alt={s.title} fill className="object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
                        </div>
                        <div className="p-3">
                          <p className="text-white text-sm font-semibold line-clamp-2">{s.title}</p>
                          <p className="text-gray-400 text-xs">{s.category.toUpperCase()}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </section>
              ) : null}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
