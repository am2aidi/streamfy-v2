'use client'

import { useMemo, useState } from 'react'
import { UploadCloud } from 'lucide-react'
import { Sidebar } from '@/components/Sidebar'
import { Header } from '@/components/Header'
import { useAuth } from '@/components/AuthProvider'
import { useToast } from '@/hooks/use-toast'
import { BRAND_NAME } from '@/lib/brand'
import { useUploads } from '@/hooks/useUploads'
import type { UploadKind, UploadStatus } from '@/lib/uploads-store'

const kindOptions: Array<{ id: UploadKind; label: string }> = [
  { id: 'movie', label: 'Movie' },
  { id: 'music', label: 'Music' },
  { id: 'sports', label: 'Sports' },
  { id: 'shorts', label: 'Shorts' },
  { id: 'news', label: 'News' },
  { id: 'ad', label: 'Ad' },
  { id: 'other', label: 'Other' },
]

function statusLabel(status: UploadStatus) {
  if (status === 'approved') return 'Approved'
  if (status === 'rejected') return 'Rejected'
  if (status === 'removed') return 'Removed'
  return 'Pending'
}

export default function UploadPage() {
  const { user, isAuthenticated, openSignIn } = useAuth()
  const { toast } = useToast()
  const { items, createUpload } = useUploads()

  const me = user?.id ?? ''
  const myItems = useMemo(() => items.filter((x) => x.createdByUserId === me), [items, me])

  const [kind, setKind] = useState<UploadKind>('movie')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [posterUrl, setPosterUrl] = useState('')
  const [tags, setTags] = useState('')
  const [attachments, setAttachments] = useState<FileList | null>(null)

  const submit = () => {
    if (!me) return
    if (!title.trim()) {
      toast({ title: 'Missing title', description: 'Please add a title.' })
      return
    }

    const parsedTags = tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)
      .slice(0, 20)

    const parsedAttachments =
      attachments && attachments.length
        ? Array.from(attachments)
            .slice(0, 6)
            .map((f) => ({ name: f.name, size: f.size, type: f.type }))
        : undefined

    createUpload({
      kind,
      title,
      description,
      posterUrl: posterUrl.trim() || undefined,
      tags: parsedTags.length ? parsedTags : undefined,
      attachments: parsedAttachments,
      createdByUserId: me,
    })

    setTitle('')
    setDescription('')
    setPosterUrl('')
    setTags('')
    setAttachments(null)
    toast({ title: 'Submitted', description: 'Your upload was submitted for admin review.' })
  }

  return (
    <div className="flex min-h-screen bg-black">
      <Sidebar />
      <div className="w-full md:ml-[92px] md:w-[calc(100vw-92px)] min-h-[100dvh] overflow-x-hidden pb-24 md:pb-8">
        <Header />

        <main className="px-6">
          <div className="mb-5">
            <h1 className="text-white text-3xl font-bold">Uploads</h1>
            <p className="text-gray-400 text-sm mt-1">
              Upload content to {BRAND_NAME}. Admins approve it before it’s shown publicly.
            </p>
          </div>

          {!isAuthenticated ? (
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 text-gray-200">
              <p>You’re in Guest mode. Sign in to upload.</p>
              <button
                onClick={() => openSignIn('Sign in to upload')}
                className="mt-4 rounded-xl px-4 py-2.5 text-sm font-semibold text-[color:var(--app-accent-fg)]"
                style={{ backgroundImage: 'linear-gradient(135deg, var(--app-accent-a), var(--app-accent-b))' }}
              >
                Sign in
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-[440px_1fr]">
              <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
                <p className="text-xs uppercase tracking-[0.22em] text-white/45">Submit</p>
                <div className="mt-3 space-y-3">
                  <select
                    value={kind}
                    onChange={(e) => setKind(e.target.value as UploadKind)}
                    className="w-full rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-sm text-white outline-none"
                  >
                    {kindOptions.map((k) => (
                      <option key={k.id} value={k.id}>
                        {k.label}
                      </option>
                    ))}
                  </select>

                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Title"
                    className="w-full rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-sm text-white placeholder:text-white/35 outline-none"
                  />

                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Description (what is it, language, quality, etc.)"
                    rows={5}
                    className="w-full rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-sm text-white placeholder:text-white/35 outline-none"
                  />

                  <input
                    value={posterUrl}
                    onChange={(e) => setPosterUrl(e.target.value)}
                    placeholder="Poster/thumbnail URL (optional)"
                    className="w-full rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-sm text-white placeholder:text-white/35 outline-none"
                  />

                  <input
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="Tags (comma-separated, optional)"
                    className="w-full rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-sm text-white placeholder:text-white/35 outline-none"
                  />

                  <label className="block rounded-2xl border border-dashed border-white/15 bg-black/25 px-4 py-4 text-sm text-gray-300">
                    <span className="inline-flex items-center gap-2">
                      <UploadCloud size={16} /> Attach files (recommended: ZIP)
                    </span>
                    <input
                      type="file"
                      multiple
                      onChange={(e) => setAttachments(e.target.files)}
                      className="mt-2 block w-full text-xs text-gray-300 file:mr-3 file:rounded-lg file:border-0 file:bg-white/10 file:px-3 file:py-2 file:text-xs file:text-white hover:file:bg-white/15"
                    />
                    <p className="mt-2 text-xs text-white/45">
                      Tip: zip large videos before uploading to reduce storage.
                    </p>
                  </label>

                  <button
                    onClick={submit}
                    className="w-full rounded-2xl px-4 py-3 text-sm font-semibold text-[color:var(--app-accent-fg)]"
                    style={{ backgroundImage: 'linear-gradient(135deg, var(--app-accent-a), var(--app-accent-b))' }}
                  >
                    Submit for review
                  </button>

                  <p className="text-xs text-white/45">
                    Copyright: if a valid claim is made, we remove the content.
                  </p>
                </div>
              </section>

              <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
                <p className="text-xs uppercase tracking-[0.22em] text-white/45">My submissions</p>
                <div className="mt-3 space-y-2">
                  {myItems.map((x) => (
                    <div key={x.id} className="rounded-2xl border border-white/10 bg-black/25 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-white text-sm font-semibold">{x.title}</p>
                          <p className="text-xs text-gray-400 mt-1">
                            {x.kind.toUpperCase()} • {statusLabel(x.status)}
                          </p>
                        </div>
                        <span
                          className={`rounded-full border px-2.5 py-1 text-[11px] ${
                            x.status === 'approved'
                              ? 'border-emerald-400/30 bg-emerald-500/10 text-emerald-300'
                              : x.status === 'rejected'
                                ? 'border-red-400/30 bg-red-500/10 text-red-300'
                                : x.status === 'removed'
                                  ? 'border-amber-400/30 bg-amber-500/10 text-amber-300'
                                  : 'border-white/10 bg-white/[0.04] text-white/70'
                          }`}
                        >
                          {statusLabel(x.status)}
                        </span>
                      </div>
                      {x.statusReason ? <p className="mt-2 text-xs text-white/55">Reason: {x.statusReason}</p> : null}
                      {x.description ? <p className="mt-2 text-xs text-gray-300 whitespace-pre-line">{x.description}</p> : null}
                      {x.attachments?.length ? (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {x.attachments.map((a) => (
                            <span key={a.name} className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[11px] text-gray-200">
                              {a.name}
                            </span>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  ))}
                  {myItems.length === 0 ? <p className="text-sm text-gray-400">No submissions yet.</p> : null}
                </div>
              </section>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

