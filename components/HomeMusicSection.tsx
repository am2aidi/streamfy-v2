'use client'

import { useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronRight, Play, Plus } from 'lucide-react'
import { musicTracks } from '@/lib/music-data'
import { useAuth } from '@/components/AuthProvider'
import { useToast } from '@/hooks/use-toast'
import { useAppSettings } from '@/components/AppSettingsProvider'
import { getTranslation } from '@/lib/translations'

const categories = ['New Music', 'Rap', 'Pop', 'Featured Albums', 'Trending']

export function HomeMusicSection() {
  const { requireAuth } = useAuth()
  const { toast } = useToast()
  const { settings } = useAppSettings()
  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(settings.language, key)
  const previewRef = useRef<HTMLAudioElement | null>(null)

  const [activeCategory, setActiveCategory] = useState('New Music')
  const [yearFilter, setYearFilter] = useState('All')
  const [genreFilter, setGenreFilter] = useState('All')
  const [library, setLibrary] = useState<string[]>([])
  const [previewingId, setPreviewingId] = useState<string | null>(null)

  const albums = useMemo(() => {
    return musicTracks
      .slice(0, 36)
      .map((track) => ({
        id: track.id,
        title: track.album ?? track.title,
        artist: track.artist,
        image: track.image.includes('cover') ? '/music-featured.jpg' : track.image,
        genre: track.genre,
        year: track.releaseDate ? String(new Date(track.releaseDate).getFullYear()) : '2026',
        url: track.url,
        popularity: track.popularity ?? 0,
      }))
  }, [])

  const years = useMemo(() => ['All', ...Array.from(new Set(albums.map((album) => album.year))).sort().reverse()], [albums])
  const genres = useMemo(() => ['All', ...Array.from(new Set(albums.map((album) => album.genre)))], [albums])

  const categoryFiltered = useMemo(() => {
    let list = albums.slice()
    if (activeCategory === 'Rap') list = list.filter((album) => album.genre.toLowerCase().includes('hip-hop'))
    if (activeCategory === 'Pop') list = list.filter((album) => album.genre.toLowerCase().includes('pop'))
    if (activeCategory === 'New Music') list = list.sort((a, b) => Number(b.year) - Number(a.year))
    if (activeCategory === 'Trending') list = list.sort((a, b) => b.popularity - a.popularity)
    return list
  }, [activeCategory, albums])

  const filteredAlbums = useMemo(() => {
    return categoryFiltered.filter((album) => {
      const byYear = yearFilter === 'All' || album.year === yearFilter
      const byGenre = genreFilter === 'All' || album.genre === genreFilter
      return byYear && byGenre
    })
  }, [categoryFiltered, genreFilter, yearFilter])

  const featured = filteredAlbums[0]

  const playSnippet = (url?: string, id?: string) => {
    requireAuth(
      () => {
        if (!url || !id) return
        try {
          previewRef.current?.pause()
          const audio = new Audio(url)
          previewRef.current = audio
          void audio.play()
          setPreviewingId(id)
          window.setTimeout(() => {
            audio.pause()
            setPreviewingId((prev) => (prev === id ? null : prev))
          }, 3000)
        } catch {
          // ignore preview failures
        }
      },
      t('authSigninPrompt')
    )
  }

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">{t('music')}</h2>
          <p className="text-sm text-gray-400">{t('albumsCategoriesReleases')}</p>
        </div>
        <Link href="/music" className="flex items-center gap-1 text-[#f4a30a] text-sm hover:underline">
          {t('seeAll')} <ChevronRight size={14} />
        </Link>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
                activeCategory === category
                  ? 'border-[#f4a30a]/60 bg-[#f4a30a]/15 text-[#f4a30a]'
                  : 'border-white/15 bg-white/5 text-gray-300 hover:bg-white/10'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
        <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
          <select
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
            className="rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm text-white"
          >
            {years.map((year) => (
              <option key={year} value={year}>
                {t('year')}: {year}
              </option>
            ))}
          </select>
          <select
            value={genreFilter}
            onChange={(e) => setGenreFilter(e.target.value)}
            className="rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm text-white"
          >
            {genres.map((genre) => (
              <option key={genre} value={genre}>
                {t('genre')}: {genre}
              </option>
            ))}
          </select>
        </div>
      </div>

      {featured ? (
        <article className="streamfy-fade-slide rounded-2xl border border-white/10 bg-white/[0.04] p-4">
          <div className="flex items-center gap-4">
            <div className="relative h-20 w-20 overflow-hidden rounded-xl">
              <Image src={featured.image} alt={featured.title} fill className="object-cover" loading="lazy" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs uppercase text-gray-500">{t('featuredAlbum')}</p>
              <p className="text-white text-sm font-semibold streamfy-soft-float truncate">{featured.title}</p>
              <p className="text-gray-400 text-xs truncate">
                {featured.artist} | {featured.year}
              </p>
            </div>
            <button
              onClick={() => playSnippet(featured.url, featured.id)}
              className="inline-flex items-center gap-2 rounded-lg bg-[#f4a30a] px-3 py-2 text-xs font-semibold text-black"
            >
              <Play size={13} fill="black" />
              {previewingId === featured.id ? t('playing') : t('playPreview')}
            </button>
          </div>
        </article>
      ) : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredAlbums.slice(0, 12).map((album) => (
          <article key={album.id} className="overflow-hidden rounded-xl border border-white/10 bg-white/5">
            <div className="relative h-52">
              <Image src={album.image} alt={album.title} fill className="object-cover transition-transform duration-500 hover:scale-[1.03] will-change-transform" loading="lazy" />
            </div>
            <div className="space-y-2 p-4">
              <p className="text-white text-base font-semibold">{album.title}</p>
              <p className="text-gray-400 text-xs">
                {album.artist} | {album.year}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => playSnippet(album.url, album.id)}
                  className="inline-flex items-center gap-1 rounded-lg border border-white/20 px-3 py-1.5 text-xs text-white hover:bg-white/10"
                >
                  <Play size={12} />
                  {previewingId === album.id ? 'Playing...' : 'Play'}
                </button>
                <button
                  onClick={() => {
                    const inLibrary = library.includes(album.id)
                    const next = inLibrary ? library.filter((id) => id !== album.id) : [...library, album.id]
                    setLibrary(next)
                    toast({
                      title: inLibrary ? t('removedFromLibrary') : t('addedToLibrary'),
                      description: album.title,
                    })
                  }}
                  className="inline-flex items-center gap-1 rounded-lg bg-white/10 px-3 py-1.5 text-xs text-white hover:bg-white/15"
                >
                  <Plus size={12} />
                  {library.includes(album.id) ? t('inLibrary') : t('addToLibrary')}
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
