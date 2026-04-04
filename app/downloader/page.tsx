'use client'

import { useMemo, useState } from 'react'
import { Download, Facebook, Instagram, Smartphone, Star, Youtube } from 'lucide-react'
import { Sidebar } from '@/components/Sidebar'
import { Header } from '@/components/Header'
import { useToast } from '@/hooks/use-toast'
import { DownloadOptionsModal } from '@/components/download/DownloadOptionsModal'
import { useCommunity } from '@/hooks/useCommunity'
import { useAuth } from '@/components/AuthProvider'
import { SmartCover } from '@/components/SmartCover'
import { useAppSettings } from '@/components/AppSettingsProvider'
import { getTranslation } from '@/lib/translations'
import { useMovies } from '@/hooks/useMovies'

type ResultItem = {
  id: string
  title: string
  image: string
  year?: number
  tags: string[]
  rating?: number
  type: 'Movie' | 'TV Series' | 'Anime' | 'Community'
  description: string
}

export default function DownloaderPage() {
  const { toast } = useToast()
  const { user, requireAuth } = useAuth()
  const { items: movies } = useMovies()
  const { items: communityItems } = useCommunity()
  const { settings } = useAppSettings()
  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(settings.language, key)
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<ResultItem | null>(null)

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    const base: ResultItem[] = movies.map((m) => ({
      id: m.id,
      title: m.title,
      image: m.image,
      year: m.year,
      tags: [m.genre, m.language.toUpperCase(), m.type === 'series' ? 'TV Series' : m.type === 'animation' ? 'Anime' : 'Movie'].slice(0, 3),
      rating: m.rating,
      type: m.type === 'series' ? 'TV Series' : m.type === 'animation' ? 'Anime' : 'Movie',
      description: m.description,
    }))

    const publishedCommunity: ResultItem[] = communityItems
      .filter((i) => i.status === 'published')
      .map((i) => ({
        id: i.id,
        title: i.title,
        image: i.imageUrl,
        tags: [i.kind.toUpperCase(), 'Community'],
        type: 'Community',
        description: i.description,
      }))

    const all = [...publishedCommunity, ...base]
    if (!q) return all.slice(0, 18)
    return all.filter((r) => (r.title + ' ' + r.tags.join(' ') + ' ' + r.description).toLowerCase().includes(q)).slice(0, 24)
  }, [communityItems, movies, query])

  return (
    <div className="flex min-h-screen bg-black">
      <Sidebar />
      <div className="w-full md:ml-[92px] md:w-[calc(100vw-92px)] min-h-[100dvh] overflow-x-hidden pb-24 md:pb-10">
        <Header />

        <main className="px-6">
          <section className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#041a1d] via-[#071325] to-black p-6 shadow-[0_22px_70px_rgba(0,0,0,0.55)]">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-white/60">Video Downloader</p>
                <h1 className="mt-2 text-4xl font-black tracking-tight text-white">Free Online Video Downloader</h1>
                <p className="mt-3 max-w-2xl text-sm text-gray-300">
                  Search by title, pick quality, then download. Only download content you have the rights to share.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Pill icon={Youtube} label="YouTube" />
                <Pill icon={Facebook} label="Facebook" />
                <Pill icon={Instagram} label="Instagram" />
                <Pill icon={Smartphone} label="App" />
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-2 text-xs text-white/70">
              <StepChip n="01" label="Search" />
              <span className="text-white/30">›</span>
              <StepChip n="02" label="Pick quality" />
              <span className="text-white/30">›</span>
              <StepChip n="03" label="Download" />
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative w-full">
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search movies, TV shows, and anime by title..."
                  className="w-full rounded-full border border-white/10 bg-black/45 px-6 py-4 text-white placeholder:text-white/40 outline-none focus:border-[color:var(--app-accent-a)]/50"
                />
              </div>
              <button
                onClick={() => {
                  if (!results.length) toast({ title: 'No results', description: 'Try another title.' })
                }}
                className="rounded-full px-8 py-4 text-sm font-semibold text-[color:var(--app-accent-fg)]"
                style={{ backgroundImage: 'linear-gradient(135deg, var(--app-accent-a), var(--app-accent-b))' }}
              >
                {t('search')}
              </button>
            </div>
          </section>

          <div className="mt-8 flex items-center justify-between">
            <p className="text-xs uppercase tracking-[0.22em] text-white/45">Matching videos</p>
            <p className="text-xs text-white/45">Found {results.length} matching video resources</p>
          </div>

          <section className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((r) => (
              <article key={r.id} className="group overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.06] transition-colors">
                <div className="relative h-64">
                  <SmartCover src={r.image} alt={r.title} className="object-cover opacity-95 group-hover:opacity-100 transition-opacity" sizes="520px" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />
                  <div className="absolute left-4 top-4 flex items-center gap-2">
                    <span className="rounded-full bg-black/55 px-3 py-1 text-[11px] font-semibold text-white">{r.type.toUpperCase()}</span>
                    {typeof r.rating === 'number' ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-black/55 px-3 py-1 text-[11px] font-semibold text-white">
                        <Star size={12} className="text-[color:var(--app-accent-a)]" fill="currentColor" />
                        {r.rating.toFixed(1)}
                      </span>
                    ) : null}
                  </div>
                </div>

                <div className="p-4">
                  <p className="text-white text-lg font-bold line-clamp-1">{r.title}</p>
                  <p className="mt-1 text-xs text-gray-400">{r.year ? `${r.year}` : 'Community upload'}</p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {r.tags.slice(0, 3).map((t) => (
                      <span key={`${r.id}-${t}`} className="rounded-full border border-white/10 bg-black/25 px-3 py-1 text-xs text-gray-200">
                        {t}
                      </span>
                    ))}
                  </div>

                  <button
                    onClick={() => requireAuth(() => setSelected(r), 'Sign in to download')}
                    className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold text-[color:var(--app-accent-fg)]"
                    style={{ backgroundImage: 'linear-gradient(135deg, var(--app-accent-a), var(--app-accent-b))' }}
                  >
                    <Download size={16} />
                    {t('download')}
                  </button>
                </div>
              </article>
            ))}
          </section>
        </main>
      </div>

      <DownloadOptionsModal
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        title={selected?.title ?? ''}
        imageUrl={selected?.image ?? '/now-in-theaters.jpg'}
        description={selected?.description}
        tags={selected?.tags ?? []}
        mediaType={selected?.type === 'TV Series' ? 'series' : selected?.type === 'Anime' ? 'anime' : 'movie'}
        seasonCount={2}
        episodesPerSeason={24}
        onConfirm={(selection) => {
          const who = user?.email ?? user?.phone ?? user?.id ?? 'User'
          toast({
            title: 'Download queued',
            description: `${selected?.title ?? 'Item'} • ${selection.quality} • ${selection.subtitle} • by ${who}`,
          })
          setSelected(null)
        }}
      />
    </div>
  )
}

function StepChip({ n, label }: { n: string; label: string }) {
  return <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1">{n} {label}</span>
}

function Pill({ icon: Icon, label }: { icon: React.ComponentType<{ size?: number; className?: string }>; label: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs text-gray-200">
      <Icon size={16} className="text-white/80" />
      {label}
    </span>
  )
}
