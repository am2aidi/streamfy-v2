'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { ExternalLink, Heart, PlayCircle, UploadCloud } from 'lucide-react'
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

const artworkByKind: Record<CommunityKind, string> = {
  movie: '/now-in-theaters.jpg',
  song: '/music-featured.jpg',
  match: '/champions-league.jpg',
  short: '/new-releases.jpg',
}

function isDirectVideoUrl(value?: string) {
  if (!value) return false
  return /\.(mp4|webm|ogg)(\?|#|$)/i.test(value)
}

function formatUploaderLabel(item: {
  createdBy: string
  createdByName?: string
  createdByEmail?: string
}, currentUserId?: string) {
  if (item.createdBy === currentUserId) return 'Uploaded by you'
  if (item.createdByName) return `Uploaded by ${item.createdByName}`
  if (item.createdByEmail) return `Uploaded by ${item.createdByEmail}`
  return 'Uploaded by member'
}

export default function CommunityPage() {
  const { toast } = useToast()
  const { user, requireAuth } = useAuth()
  const community = useCommunity()
  const { settings } = useAppSettings()
  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(settings.language, key)

  const [tab, setTab] = useState<Tab>(() => {
    if (typeof window === 'undefined') return 'published'
    const raw = new URLSearchParams(window.location.search).get('tab')
    if (raw === 'submit' || raw === 'all' || raw === 'published') return raw
    return 'published'
  })
  const [kind, setKind] = useState<CommunityKind>('movie')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [filePreview, setFilePreview] = useState<string>('')
  const [trailerUrl, setTrailerUrl] = useState('')

  const list = useMemo(() => {
    if (tab === 'published') return community.items.filter((item) => item.status === 'published')
    if (tab === 'all') return community.items.filter((item) => item.status !== 'rejected')
    return []
  }, [community.items, tab])

  const previewImage = (filePreview || imageUrl).trim() || artworkByKind[kind]

  const pickFile = (file: File | null) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      setFilePreview(String(reader.result || ''))
    }
    reader.readAsDataURL(file)
  }

  const submit = () => {
    requireAuth(
      () => {
        const resolvedImage = (filePreview || imageUrl).trim() || artworkByKind[kind]
        if (!title.trim()) {
          toast({ title: 'Missing title', description: 'Add a title for your upload.' })
          return
        }

        community.createItem({
          kind,
          title,
          description,
          imageUrl: resolvedImage,
          trailerUrl: trailerUrl.trim() || undefined,
          createdBy: user!.id,
        })

        toast({
          title: 'Upload is live',
          description: 'Your content is now visible right away. Admin can still remove reported items.',
        })
        setTab('published')
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
      <div className="w-full min-h-[100dvh] overflow-x-hidden pb-24 md:ml-[92px] md:w-[calc(100vw-92px)] md:pb-10">
        <Header />

        <main className="px-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold text-white">{t('community')}</h1>
            <p className="text-sm text-gray-400">
              Members can upload movies, songs, sports clips, and shorts. Every upload goes live immediately, appears on the interface, and admins can remove it later if it gets reported.
            </p>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {([
              { id: 'published', label: 'Live now' },
              { id: 'all', label: 'All uploads' },
              { id: 'submit', label: 'Upload' },
            ] as const).map((item) => (
              <button
                key={item.id}
                onClick={() => setTab(item.id)}
                className={`rounded-full border px-4 py-2 text-sm ${
                  tab === item.id
                    ? 'border-[color:var(--app-accent-a)]/60 bg-[color:var(--app-accent-a)]/15 text-[color:var(--app-accent-a)]'
                    : 'border-white/15 bg-white/5 text-gray-300'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {tab === 'submit' ? (
            <section className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_360px]">
              <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
                <h2 className="text-lg font-bold text-white">Upload content</h2>
                <p className="mt-1 text-xs text-gray-400">Everything here saves to the real database. Add artwork, then paste a video or stream link if you want people to watch it.</p>

                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="text-xs text-gray-400">Type</label>
                    <select
                      value={kind}
                      onChange={(event) => setKind(event.target.value as CommunityKind)}
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
                      onChange={(event) => setTitle(event.target.value)}
                      placeholder="Example: The Last Run"
                      className="mt-1 w-full rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-sm text-white placeholder:text-white/35"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-xs text-gray-400">Description</label>
                    <textarea
                      value={description}
                      onChange={(event) => setDescription(event.target.value)}
                      placeholder="Tell viewers what they are about to watch..."
                      rows={4}
                      className="mt-1 w-full resize-none rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-sm text-white placeholder:text-white/35"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-xs text-gray-400">Video / stream URL</label>
                    <input
                      value={trailerUrl}
                      onChange={(event) => setTrailerUrl(event.target.value)}
                      placeholder="https://example.com/video.mp4"
                      className="mt-1 w-full rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-sm text-white placeholder:text-white/35"
                    />
                    <p className="mt-2 text-xs text-gray-500">Paste a hosted MP4 or stream link so viewers can open and watch the upload.</p>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-xs text-gray-400">Upload cover image</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(event) => pickFile(event.target.files?.[0] ?? null)}
                      className="mt-1 w-full rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-sm text-white file:mr-3 file:rounded-xl file:border-0 file:bg-white/10 file:px-3 file:py-2 file:text-white"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-xs text-gray-400">or Cover image URL</label>
                    <input
                      value={imageUrl}
                      onChange={(event) => setImageUrl(event.target.value)}
                      placeholder="https://example.com/poster.jpg"
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
                  Publish upload
                </button>

                <div className="mt-3 rounded-2xl border border-white/10 bg-black/25 p-4 text-xs text-gray-300">
                  Uploads go live right away. If someone reports copyright or abuse, admins can hide or remove the content.
                  {' '}
                  <Link href="/legal/copyright" className="text-[color:var(--app-accent-a)] hover:underline">
                    Learn more
                  </Link>
                  .
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
                <p className="font-semibold text-white">Preview</p>
                <div className="mt-3 overflow-hidden rounded-2xl border border-white/10 bg-black/25">
                  <div className="relative h-64">
                    <SmartCover
                      src={previewImage}
                      alt=""
                      className="object-cover"
                      sizes="360px"
                      priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />
                    <div className="absolute left-3 top-3 rounded-full bg-black/60 px-3 py-1 text-[11px] font-semibold text-white">
                      {kind.toUpperCase()}
                    </div>
                    <div className="absolute bottom-3 left-3 right-3">
                      <p className="line-clamp-2 text-sm font-bold text-white">{title || 'Your title'}</p>
                      <p className="mt-1 line-clamp-2 text-xs text-gray-300">{description || 'Your upload will appear here as soon as you publish it.'}</p>
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
                const currentUserId = user?.id
                const myStars = currentUserId ? community.myRatingFor(item.id, currentUserId) : 0
                const liked = currentUserId ? community.likedByMe(item.id, currentUserId) : false
                const directVideo = isDirectVideoUrl(item.trailerUrl)
                const uploaderLabel = formatUploaderLabel(item, currentUserId)

                return (
                  <article
                    key={item.id}
                    className="group overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] transition-colors hover:bg-white/[0.06]"
                  >
                    <div className="relative h-64">
                      <SmartCover
                        src={item.imageUrl}
                        alt={item.title}
                        className="object-cover opacity-95 transition-opacity group-hover:opacity-100"
                        sizes="480px"
                      />
                      {directVideo && item.trailerUrl ? (
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
                        <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-[11px] font-semibold text-emerald-200">
                          LIVE
                        </span>
                      </div>
                      {item.trailerUrl ? (
                        <div className="absolute bottom-4 right-4 inline-flex items-center gap-2 rounded-full bg-black/55 px-3 py-2 text-xs font-semibold text-white">
                          <PlayCircle size={14} />
                          Stream link
                        </div>
                      ) : null}
                    </div>

                    <div className="p-4">
                      <p className="line-clamp-1 text-lg font-bold text-white">{item.title}</p>
                      <p className="mt-1 text-xs text-gray-400">{uploaderLabel}</p>
                      <p className="mt-1 text-xs text-gray-400">Avg {stats.avgStars.toFixed(1)} | {stats.ratingCount} ratings | {stats.likeCount} likes</p>
                      {item.description ? <p className="mt-2 line-clamp-2 text-sm text-gray-300">{item.description}</p> : null}

                      {item.trailerUrl ? (
                        <a
                          href={item.trailerUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-3 inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-black/30 px-3 py-2 text-xs font-semibold text-white hover:bg-white/5"
                        >
                          <ExternalLink size={13} />
                          Watch upload
                        </a>
                      ) : null}

                      <div className="mt-3 flex items-center justify-between gap-3">
                        <button
                          onClick={() => requireAuth(() => community.toggleLike(item.id, user!.id), 'Sign in to like')}
                          className={`inline-flex items-center gap-2 rounded-2xl border px-3 py-2 text-xs font-semibold ${
                            liked
                              ? 'border-[color:var(--app-accent-a)]/40 bg-[color:var(--app-accent-a)]/10 text-[color:var(--app-accent-a)]'
                              : 'border-white/10 bg-white/[0.03] text-gray-200 hover:bg-white/[0.06]'
                          }`}
                        >
                          <Heart size={14} fill={liked ? 'currentColor' : 'transparent'} />
                          Like
                        </button>

                        <div className="flex items-center gap-2">
                          <StarRating
                            value={myStars}
                            onChange={(stars) => requireAuth(() => community.rate(item.id, user!.id, stars), 'Sign in to rate')}
                          />
                        </div>
                      </div>
                    </div>
                  </article>
                )
              })}

              {list.length === 0 ? (
                <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 text-gray-300 sm:col-span-2 lg:col-span-3">
                  No community uploads yet. Be the first to publish something.
                </div>
              ) : null}
            </section>
          ) : null}
        </main>
      </div>
    </div>
  )
}
