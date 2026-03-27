'use client'

import { useMemo, useState } from 'react'
import { Heart, UploadCloud } from 'lucide-react'
import { Sidebar } from '@/components/Sidebar'
import { Header } from '@/components/Header'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/components/AuthProvider'
import { useCommunity } from '@/hooks/useCommunity'
import type { CommunityKind } from '@/lib/community-store'
import { StarRating } from '@/components/community/StarRating'
import { SmartCover } from '@/components/SmartCover'
import { useAppSettings } from '@/components/AppSettingsProvider'
import { getTranslation } from '@/lib/translations'

type Tab = 'published' | 'submit' | 'all'

export default function CommunityPage() {
  const { toast } = useToast()
  const { user, requireAuth } = useAuth()
  const community = useCommunity()
  const { settings } = useAppSettings()
  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(settings.language, key)

  const [tab, setTab] = useState<Tab>('published')
  const [kind, setKind] = useState<CommunityKind>('movie')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [filePreview, setFilePreview] = useState<string>('')
  const [trailerUrl, setTrailerUrl] = useState('')

  const list = useMemo(() => {
    if (tab === 'published') return community.items.filter((i) => i.status === 'published')
    if (tab === 'all') return community.items.filter((i) => i.status !== 'rejected')
    return []
  }, [community.items, tab])

  const pickFile = (file: File | null) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const result = String(reader.result || '')
      setFilePreview(result)
    }
    reader.readAsDataURL(file)
  }

  const submit = () => {
    requireAuth(
      () => {
        const finalImage = (filePreview || imageUrl).trim()
        if (!title.trim()) {
          toast({ title: 'Missing title', description: 'Add a title for your upload.' })
          return
        }
        if (!finalImage) {
          toast({ title: 'Missing image', description: 'Upload an image or paste an image URL.' })
          return
        }

        community.createItem({
          kind,
          title,
          description,
          imageUrl: finalImage,
          trailerUrl: trailerUrl.trim() || undefined,
          createdBy: user!.id,
        })

        toast({ title: 'Submitted', description: 'Your upload is now visible. It auto-publishes after enough likes/ratings.' })
        setTab('all')
        setTitle('')
        setDescription('')
        setImageUrl('')
        setFilePreview('')
        setTrailerUrl('')
      },
      'Sign in to upload',
    )
  }

  return (
    <div className="flex min-h-screen bg-black">
      <Sidebar />
      <div className="w-full md:ml-[92px] md:w-[calc(100vw-92px)] min-h-[100dvh] overflow-x-hidden pb-24 md:pb-10">
        <Header />

        <main className="px-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-white text-3xl font-bold">{t('community')}</h1>
            <p className="text-gray-400 text-sm">
              Upload a movie poster, song cover, match image, or short clip artwork. Items auto-publish after <span className="text-white">10 likes</span>{' '}
              or <span className="text-white">5 ratings</span> with an average of <span className="text-white">4.0+</span>.
            </p>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {([
              { id: 'published', label: 'Published' },
              { id: 'all', label: 'All uploads' },
              { id: 'submit', label: 'Upload' },
            ] as const).map((x) => (
              <button
                key={x.id}
                onClick={() => setTab(x.id)}
                className={`rounded-full border px-4 py-2 text-sm ${
                  tab === x.id ? 'border-[color:var(--app-accent-a)]/60 bg-[color:var(--app-accent-a)]/15 text-[color:var(--app-accent-a)]' : 'border-white/15 bg-white/5 text-gray-300'
                }`}
              >
                {x.label}
              </button>
            ))}
          </div>

          {tab === 'submit' ? (
            <section className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_360px]">
              <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
                <h2 className="text-white text-lg font-bold">Upload content</h2>
                <p className="mt-1 text-xs text-gray-400">This is a prototype stored in your browser (localStorage).</p>

                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="text-xs text-gray-400">Type</label>
                    <select
                      value={kind}
                      onChange={(e) => setKind(e.target.value as CommunityKind)}
                      className="mt-1 w-full rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-sm text-white"
                    >
                      <option value="movie">Movie</option>
                      <option value="song">Song</option>
                      <option value="match">Match</option>
                      <option value="short">Short</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-xs text-gray-400">Title</label>
                    <input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Example: The Last Run"
                      className="mt-1 w-full rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-sm text-white placeholder:text-white/35"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-xs text-gray-400">Description (optional)</label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Short description..."
                      rows={4}
                      className="mt-1 w-full resize-none rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-sm text-white placeholder:text-white/35"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-xs text-gray-400">Trailer / Video URL (optional)</label>
                    <input
                      value={trailerUrl}
                      onChange={(e) => setTrailerUrl(e.target.value)}
                      placeholder="https://..."
                      className="mt-1 w-full rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-sm text-white placeholder:text-white/35"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-xs text-gray-400">Upload image</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => pickFile(e.target.files?.[0] ?? null)}
                      className="mt-1 w-full rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-sm text-white file:mr-3 file:rounded-xl file:border-0 file:bg-white/10 file:px-3 file:py-2 file:text-white"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-xs text-gray-400">or Image URL</label>
                    <input
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="https://..."
                      className="mt-1 w-full rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-sm text-white placeholder:text-white/35"
                    />
                  </div>
                </div>

                <button
                  onClick={submit}
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold text-[color:var(--app-accent-fg)]"
                  style={{ backgroundImage: 'linear-gradient(135deg, var(--app-accent-a), var(--app-accent-b))' }}
                >
                  <UploadCloud size={16} />
                  Submit upload
                </button>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
                <p className="text-white font-semibold">Preview</p>
                <div className="mt-3 overflow-hidden rounded-2xl border border-white/10 bg-black/25">
                  <div className="relative h-64">
                    <SmartCover
                      src={(filePreview || imageUrl || '/now-in-theaters.jpg').trim()}
                      alt=""
                      className="object-cover"
                      sizes="360px"
                      priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3">
                      <p className="text-white text-sm font-bold line-clamp-2">{title || 'Your title'}</p>
                      <p className="text-gray-300 text-xs mt-1 line-clamp-2">{description || 'Short description...'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          ) : null}

          {tab !== 'submit' ? (
            <section className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {list.map((item) => {
                const stats = community.statsFor(item.id)
                const me = user?.id ?? 'guest'
                const myStars = user ? community.myRatingFor(item.id, me) : 0
                const liked = user ? community.likedByMe(item.id, me) : false
                return (
                  <article key={item.id} className="group overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.06] transition-colors">
                    <div className="relative h-64">
                      <SmartCover src={item.imageUrl} alt={item.title} className="object-cover opacity-95 group-hover:opacity-100 transition-opacity" sizes="480px" />
                      {item.trailerUrl && item.trailerUrl.toLowerCase().includes('.mp4') ? (
                        <video
                          muted
                          playsInline
                          autoPlay
                          loop
                          preload="metadata"
                          src={item.trailerUrl}
                          className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                        />
                      ) : null}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />
                      <div className="absolute left-4 top-4 flex items-center gap-2">
                        <span className="rounded-full bg-black/55 px-3 py-1 text-[11px] font-semibold text-white">{item.kind.toUpperCase()}</span>
                        <span className={`rounded-full px-3 py-1 text-[11px] font-semibold ${item.status === 'published' ? 'bg-emerald-500/15 text-emerald-200' : 'bg-white/10 text-gray-200'}`}>
                          {item.status === 'published' ? 'PUBLISHED' : 'PENDING'}
                        </span>
                      </div>
                    </div>

                    <div className="p-4">
                      <p className="text-white text-lg font-bold line-clamp-1">{item.title}</p>
                      <p className="mt-1 text-xs text-gray-400">Avg {stats.avgStars.toFixed(1)} • {stats.ratingCount} ratings • {stats.likeCount} likes</p>
                      {item.description ? <p className="mt-2 text-sm text-gray-300 line-clamp-2">{item.description}</p> : null}

                      <div className="mt-3 flex items-center justify-between gap-3">
                        <button
                          onClick={() =>
                            requireAuth(() => community.toggleLike(item.id, user!.id), 'Sign in to like')
                          }
                          className={`inline-flex items-center gap-2 rounded-2xl border px-3 py-2 text-xs font-semibold ${
                            liked ? 'border-[color:var(--app-accent-a)]/40 bg-[color:var(--app-accent-a)]/10 text-[color:var(--app-accent-a)]' : 'border-white/10 bg-white/[0.03] text-gray-200 hover:bg-white/[0.06]'
                          }`}
                        >
                          <Heart size={14} fill={liked ? 'currentColor' : 'transparent'} />
                          Like
                        </button>

                        <div className="flex items-center gap-2">
                          <StarRating
                            value={myStars}
                            onChange={(n) => requireAuth(() => community.rate(item.id, user!.id, n), 'Sign in to rate')}
                          />
                        </div>
                      </div>
                    </div>
                  </article>
                )
              })}

              {list.length === 0 ? (
                <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 text-gray-300 sm:col-span-2 lg:col-span-3">
                  No community uploads yet. Be the first to upload!
                </div>
              ) : null}
            </section>
          ) : null}
        </main>
      </div>
    </div>
  )
}
