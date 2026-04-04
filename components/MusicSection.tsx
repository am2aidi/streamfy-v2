'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Play, Pause, Plus, Star, ChevronRight, ChevronDown, ChevronUp, SkipBack, SkipForward } from 'lucide-react'
import type { MusicTrack } from '@/lib/music-data'
import { authHeaders } from '@/lib/auth-client'
import { useAppSettings } from '@/components/AppSettingsProvider'
import { useAuth } from '@/components/AuthProvider'
import { getTranslation } from '@/lib/translations'
import { useToast } from '@/hooks/use-toast'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { useTracks } from '@/hooks/useTracks'

export function MusicSection() {
  const { settings, updateSetting } = useAppSettings()
  const { user, ready, requireAuth } = useAuth()
  const { items: tracks } = useTracks()
  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(settings.language, key)
  const { toast } = useToast()

  // Filters & sorting
  const genres = useMemo(() => Array.from(new Set(tracks.map((t) => t.genre))), [tracks])
  const artists = useMemo(() => Array.from(new Set(tracks.map((t) => t.artist))), [tracks])
  const [genreFilter, setGenreFilter] = useState<string>('All')
  const [artistFilter, setArtistFilter] = useState<string>('All')
  const [query, setQuery] = useState('')
  const [sortBy, setSortBy] = useState<'popular' | 'newest' | 'recentlyPlayed'>('popular')
  const [favoritesOnly, setFavoritesOnly] = useState(false)

  // Playback state (single audio element for the section)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [currentIndex, setCurrentIndex] = useState<number | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)

  const [playlists, setPlaylists] = useState<{ name: string; tracks: string[] }[]>([])
  const playlistsHydrated = useRef(false)

  useEffect(() => {
    if (!ready) return
    const headers = authHeaders()
    if (!headers['x-session-token'] || !user) {
      playlistsHydrated.current = true
      setPlaylists([])
      return
    }

    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch('/api/user/playlists', {
          cache: 'no-store',
          headers: {
            ...headers,
          },
        })
        if (!res.ok) return
        const data = (await res.json()) as { playlists?: { name: string; tracks: string[] }[] }
        if (!cancelled) {
          setPlaylists(data.playlists ?? [])
        }
      } catch {
        // ignore
      } finally {
        playlistsHydrated.current = true
      }
    })()

    return () => {
      cancelled = true
    }
  }, [ready, user])

  useEffect(() => {
    if (!playlistsHydrated.current) return
    const headers = authHeaders()
    if (!headers['x-session-token'] || !user) return

    const timer = window.setTimeout(() => {
      void fetch('/api/user/playlists', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          ...headers,
        },
        body: JSON.stringify({ playlists }),
      }).catch(() => {})
    }, 250)

    return () => {
      window.clearTimeout(timer)
    }
  }, [playlists, user])

  // Derived list
  const filtered = useMemo(() => {
    let list = tracks.slice()
    if (favoritesOnly) list = list.filter((x) => settings.favoriteTracks.includes(x.id))
    if (genreFilter !== 'All') list = list.filter((x) => x.genre === genreFilter)
    if (artistFilter !== 'All') list = list.filter((x) => x.artist === artistFilter)
    if (query.trim()) {
      const q = query.toLowerCase()
      list = list.filter((x) => x.title.toLowerCase().includes(q) || x.artist.toLowerCase().includes(q) || (x.album || '').toLowerCase().includes(q))
    }
    if (sortBy === 'popular') list.sort((a, b) => (b.popularity ?? 0) - (a.popularity ?? 0))
    if (sortBy === 'newest') list.sort((a, b) => (new Date(b.releaseDate || 0).getTime() - new Date(a.releaseDate || 0).getTime()))
    return list
  }, [artistFilter, favoritesOnly, genreFilter, query, settings.favoriteTracks, sortBy, tracks])

  // Audio control helpers
  const playAt = async (index: number) => {
    const track = filtered[index]
    if (!track || !track.url) return
    if (!audioRef.current) audioRef.current = new Audio()
    const audio = audioRef.current
    if (audio.src !== track.url) {
      audio.pause()
      audio.src = track.url
      audio.currentTime = 0
    }
    try {
      await audio.play()
      setCurrentIndex(index)
      setIsPlaying(true)
      audio.onended = () => setIsPlaying(false)
    } catch {
      // ignore play errors
    }
  }

  const togglePlayAt = async (index: number) => {
    requireAuth(
      () => {
        if (currentIndex === index && isPlaying) {
          audioRef.current?.pause()
          setIsPlaying(false)
          return
        }
        void playAt(index)
      },
      t('authSigninPrompt')
    )
  }

  const playNext = async (index: number) => {
    requireAuth(
      () => {
        const next = index + 1 < filtered.length ? index + 1 : 0
        void playAt(next)
      },
      t('authSigninPrompt')
    )
  }

  const playPrev = async (index: number) => {
    requireAuth(
      () => {
        const prev = index - 1 >= 0 ? index - 1 : filtered.length - 1
        void playAt(prev)
      },
      t('authSigninPrompt')
    )
  }

  // Playlist management state & handlers
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogTrack, setDialogTrack] = useState<MusicTrack | null>(null)
  const [newPlaylistName, setNewPlaylistName] = useState('')

  const handleOpenDialog = (track: MusicTrack | null) => {
    requireAuth(() => {
      setDialogTrack(track)
      setNewPlaylistName('')
      setDialogOpen(true)
    }, t('authSigninPrompt'))
  }

  const handleCreatePlaylist = () => {
    const name = newPlaylistName.trim()
    if (!name) return
    if (playlists.find((p) => p.name === name)) {
      toast({ title: 'Playlist exists', description: `A playlist named "${name}" already exists.` })
      return
    }
    const next = [...playlists, { name, tracks: [] }]
    setPlaylists(next)
    toast({ title: 'Playlist created', description: `"${name}" has been created.` })
    if (dialogTrack) {
      const idx = next.findIndex((p) => p.name === name)
      if (idx > -1) next[idx].tracks.push(dialogTrack.id)
      setPlaylists(next)
      toast({ title: 'Added', description: `${dialogTrack.title} added to ${name}.` })
      setDialogOpen(false)
    }
  }

  const handleAddToPlaylist = (track: MusicTrack, playlistName: string) => {
    const idx = playlists.findIndex((p) => p.name === playlistName)
    if (idx === -1) {
      toast({ title: 'Playlist not found', description: `No playlist named "${playlistName}".` })
      return
    }
    const next = playlists.slice()
    if (!next[idx].tracks.includes(track.id)) next[idx].tracks.push(track.id)
    setPlaylists(next)
    toast({ title: 'Added', description: `${track.title} added to ${playlistName}.` })
    setDialogOpen(false)
  }

  return (
    <section className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-white text-2xl font-bold streamfy-fade-slide">{t('trendingMusicTitle')}</h2>
          <p className="text-gray-400 text-sm">{t('topHitsWeek')}</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleOpenDialog(null)}
            className="inline-flex items-center gap-2 bg-white/6 hover:bg-white/10 text-white/90 px-3 py-2 rounded-md"
            aria-label="Create playlist"
            title="Create playlist"
          >
            <Plus size={14} />
            {t('addPlaylist')}
          </button>
          <Link href="/music" className="flex items-center gap-1 text-[#f4a30a] text-sm hover:underline">
            {t('seeAll')} <ChevronRight size={14} />
          </Link>
        </div>
      </div>

      {filtered[0] ? (
        <div className="streamfy-fade-slide rounded-xl border border-white/[0.06] bg-white/[0.03] p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wider text-gray-500">Featured Track</p>
              <p className="text-white text-sm font-semibold streamfy-soft-float">{filtered[0].title}</p>
              <p className="text-gray-400 text-xs">{filtered[0].artist}</p>
            </div>
            <button
              onClick={() => togglePlayAt(0)}
              className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-xs text-white hover:bg-white/15"
            >
              <Play size={14} />
              {currentIndex === 0 && isPlaying ? t('pause') : t('play')}
            </button>
          </div>
        </div>
      ) : null}

      {/* Filters & Sort */}
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-1 text-gray-400 text-sm">
          <input type="checkbox" checked={favoritesOnly} onChange={(e) => setFavoritesOnly(e.target.checked)} className="accent-[#f4a30a]" />
          {t('favoritesOnly')}
        </label>
        <select aria-label="Filter by genre" title="Filter by genre" value={genreFilter} onChange={(e) => setGenreFilter(e.target.value)} className="rounded-md border border-white/10 bg-black/30 px-3 py-2 text-sm text-white">
          <option>All</option>
          {genres.map((g) => (
            <option key={g} value={g}>{g}</option>
          ))}
        </select>
        <select aria-label="Filter by artist" title="Filter by artist" value={artistFilter} onChange={(e) => setArtistFilter(e.target.value)} className="rounded-md border border-white/10 bg-black/30 px-3 py-2 text-sm text-white">
          <option>All</option>
          {artists.map((a) => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search title, artist, album" className="min-w-[180px] flex-1 rounded-md border border-white/10 bg-black/30 px-3 py-2 text-sm text-white" />
        <select aria-label="Sort tracks" title="Sort tracks" value={sortBy} onChange={(e) => setSortBy(e.target.value as any)} className="rounded-md border border-white/10 bg-black/30 px-3 py-2 text-sm text-white">
          <option value="popular">{t('mostPopular')}</option>
          <option value="newest">{t('newest')}</option>
        </select>
      </div>

      {/* Track List - vertical scroll area */}
      <div className="flex flex-col gap-2 max-h-[520px] overflow-y-auto pr-2">
        {filtered.map((track, i) => (
          <div
            key={track.id}
            className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${currentIndex === i ? 'bg-white/[0.06]' : 'hover:bg-white/5'} ${i === 0 ? 'streamfy-fade-slide' : ''}`}
          >
            {/* Thumbnail */}
            <div className="relative w-14 h-14 rounded-md overflow-hidden flex-shrink-0 bg-white/5">
              <Image src={track.image} alt={track.title} fill className="object-cover" loading="lazy" />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => togglePlayAt(i)}
                  aria-label={currentIndex === i && isPlaying ? `Pause ${track.title}` : `Play ${track.title}`}
                  className="w-9 h-9 rounded-full bg-[#0f0f0f] flex items-center justify-center text-[#f4a30a] hover:scale-105 transition-transform"
                >
                  {currentIndex === i && isPlaying ? <Pause size={16} /> : <Play size={16} />}
                </button>
                <div className="flex flex-col min-w-0">
                  <span className="text-white text-sm font-medium truncate">{track.title}</span>
                  <span className="text-gray-400 text-xs truncate">{track.artist} • {track.album}</span>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-3">
              <button
                onClick={(e) => {
                  e.preventDefault()
                  const isFav = settings.favoriteTracks.includes(track.id)
                  const next = isFav
                    ? settings.favoriteTracks.filter((id) => id !== track.id)
                    : [...settings.favoriteTracks, track.id]
                  updateSetting('favoriteTracks', next)
                  toast({
                    title: isFav ? 'Removed from favorites' : 'Added to favorites',
                    description: `${track.title} ${isFav ? 'removed from' : 'added to'} favorites.`,
                  })
                }}
                aria-label={settings.favoriteTracks.includes(track.id) ? 'Unfavorite track' : 'Favorite track'}
                className={`text-gray-400 hover:text-white ${settings.favoriteTracks.includes(track.id) ? 'text-[#f4a30a]' : ''}`}
              >
                <Star size={14} />
              </button>
              <button onClick={() => playPrev(i)} aria-label="Previous" className="text-gray-400 hover:text-white"><SkipBack size={16} /></button>
              <button onClick={() => playNext(i)} aria-label="Next" className="text-gray-400 hover:text-white"><SkipForward size={16} /></button>
              <button onClick={() => handleOpenDialog(track)} aria-label={`Add ${track.title} to playlist`} className="text-gray-400 hover:text-white"><Plus size={14} /></button>
              <span className="text-gray-400 text-xs w-12 text-right">{track.duration}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Playlist dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {dialogTrack ? 'Add to playlist' : 'Create playlist'}
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            {dialogTrack && playlists.length > 0 && (
              <div className="flex flex-col gap-2">
                <span className="text-gray-400 text-sm">Select a playlist:</span>
                <ul className="flex flex-col gap-1">
                  {playlists.map((p) => (
                    <li key={p.name}>
                      <button
                        className="text-white hover:underline text-left w-full"
                        onClick={() => dialogTrack && handleAddToPlaylist(dialogTrack, p.name)}
                      >
                        {p.name}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className="flex flex-col gap-2">
              <label htmlFor="new-playlist" className="text-gray-400 text-sm">
                {dialogTrack ? 'Or create new playlist' : 'Playlist name'}
              </label>
              <Input
                id="new-playlist"
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
                placeholder="Enter name"
              />
              <button
                className="mt-1 inline-flex items-center gap-2 bg-[#f4a30a] text-black px-3 py-1 rounded-md"
                onClick={handleCreatePlaylist}
              >
                {dialogTrack ? 'Create & add' : 'Create'}
              </button>
            </div>
          </div>
          <DialogFooter>
            <DialogClose className="text-gray-400">Close</DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  )
}
