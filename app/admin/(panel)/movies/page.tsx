'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import { Plus, Upload } from 'lucide-react'
import { useAuth } from '@/components/AuthProvider'
import { useToast } from '@/hooks/use-toast'
import { useFilterOptions } from '@/lib/admin-filters'
import { fileToDataUrl, isStoredImageSource, summarizeStoredAsset } from '@/lib/file-data-url'

type MovieLanguage = 'en' | 'fr' | 'rw'
type MovieStatus = 'Active' | 'Draft'

type MovieRow = {
  id: string
  title: string
  category: string
  language: MovieLanguage
  quality: string
  date: string
  status: MovieStatus
  poster: string
  descriptionHtml: string
  createdBy: string
  createdByEmail: string
  videoLabel: string
  thumbnailLabel: string
}

const defaultRows: MovieRow[] = [
  {
    id: 'movie-dark-pursuit',
    title: 'Dark Pursuit',
    category: 'Thriller',
    language: 'en',
    quality: '4K',
    date: '2026-02-27',
    status: 'Active',
    poster: '',
    descriptionHtml: '<p>A tense thriller with polished visuals and a fast-moving plot.</p>',
    createdBy: 'Zaidi Kwizera',
    createdByEmail: 'zaidikwizera@gmail.com',
    videoLabel: '',
    thumbnailLabel: '',
  },
  {
    id: 'movie-kylexy',
    title: 'KYLEXY',
    category: 'Sci-Fi',
    language: 'rw',
    quality: 'HD',
    date: '2026-02-26',
    status: 'Draft',
    poster: '',
    descriptionHtml: '<p>A sci-fi draft prepared for the next featured release.</p>',
    createdBy: 'Zaidi Kwizera',
    createdByEmail: 'zaidikwizera@gmail.com',
    videoLabel: '',
    thumbnailLabel: '',
  },
  {
    id: 'movie-top-rated',
    title: 'Top Rated',
    category: 'Drama',
    language: 'fr',
    quality: '4K',
    date: '2026-02-21',
    status: 'Active',
    poster: '',
    descriptionHtml: '<p>A prestige drama curated for the premium catalog.</p>',
    createdBy: 'Zaidi Kwizera',
    createdByEmail: 'zaidikwizera@gmail.com',
    videoLabel: '',
    thumbnailLabel: '',
  },
]

function createForm(adminName: string, adminEmail: string): MovieRow {
  return {
    id: '',
    title: '',
    category: 'Action',
    language: 'en',
    quality: 'HD',
    status: 'Active',
    date: new Date().toISOString().slice(0, 10),
    poster: '',
    descriptionHtml: '<p></p>',
    createdBy: adminName,
    createdByEmail: adminEmail,
    videoLabel: '',
    thumbnailLabel: '',
  }
}

export default function AdminMoviesPage() {
  const { toast } = useToast()
  const { user } = useAuth()
  const categoryOptions = useFilterOptions('movies')
  const adminName = user?.name || user?.username || 'Zaidi Kwizera'
  const adminEmail = user?.email || 'zaidikwizera@gmail.com'
  const editorRef = useRef<HTMLDivElement | null>(null)

  const [rows, setRows] = useState<MovieRow[]>(defaultRows)
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [languageFilter, setLanguageFilter] = useState<'All' | MovieLanguage>('All')
  const [editIndex, setEditIndex] = useState<number | null>(null)
  const [form, setForm] = useState<MovieRow>(() => createForm(adminName, adminEmail))

  useEffect(() => {
    let cancelled = false

    ;(async () => {
      try {
        const res = await fetch('/api/movies?admin=1', { cache: 'no-store' })
        if (!res.ok) return
        const data = (await res.json()) as { items: MovieRow[] }
        if (!cancelled) setRows(data.items)
      } catch {
        // keep default fallback
      }
    })()

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!open || !editorRef.current) return
    if (editorRef.current.innerHTML !== form.descriptionHtml) {
      editorRef.current.innerHTML = form.descriptionHtml
    }
  }, [form.descriptionHtml, open])

  const refreshRows = async () => {
    const res = await fetch('/api/movies?admin=1', { cache: 'no-store' })
    if (!res.ok) throw new Error('Failed to refresh movies')
    const data = (await res.json()) as { items: MovieRow[] }
    setRows(data.items)
  }

  const filteredRows = useMemo(() => {
    return rows.filter((movie) => {
      const q = query.trim().toLowerCase()
      const byQuery =
        !q ||
        [
          movie.title,
          movie.category,
          movie.language,
          movie.quality,
          movie.status,
          movie.createdBy,
          movie.createdByEmail,
        ]
          .join(' ')
          .toLowerCase()
          .includes(q)
      const byLang = languageFilter === 'All' || movie.language === languageFilter
      return byQuery && byLang
    })
  }, [languageFilter, query, rows])

  const startAdd = () => {
    setEditIndex(null)
    setForm(createForm(adminName, adminEmail))
    setOpen(true)
  }

  const startEdit = (index: number) => {
    if (index < 0 || !rows[index]) return
    setEditIndex(index)
    setForm(rows[index])
    setOpen(true)
  }

  const closeModal = () => {
    setOpen(false)
    setEditIndex(null)
  }

  const saveMovie = async () => {
    const cleanedTitle = form.title.trim()
    if (!cleanedTitle) {
      toast({ title: 'Missing title', description: 'Movie title is required.' })
      return
    }

    const nextMovie: MovieRow = {
      ...form,
      id: form.id || `movie-${Date.now()}`,
      title: cleanedTitle,
      descriptionHtml: editorRef.current?.innerHTML || form.descriptionHtml || '<p></p>',
      createdBy: adminName,
      createdByEmail: adminEmail,
      date: form.date || new Date().toISOString().slice(0, 10),
    }

    await fetch('/api/movies', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(nextMovie),
    })
    await refreshRows()
    toast({
      title: editIndex === null ? 'Movie added' : 'Movie updated',
      description: `${nextMovie.title} was ${editIndex === null ? 'added' : 'updated'} by ${adminName}.`,
    })

    closeModal()
  }

  const removeMovie = async (movieId: string) => {
    const movie = rows.find((item) => item.id === movieId)
    await fetch(`/api/movies/${movieId}`, { method: 'DELETE' })
    await refreshRows()
    toast({ title: 'Movie deleted', description: `${movie?.title || 'Movie'} removed from list.` })
  }

  const applyFormat = (command: string, value?: string) => {
    editorRef.current?.focus()
    document.execCommand(command, false, value)
    setForm((prev) => ({
      ...prev,
      descriptionHtml: editorRef.current?.innerHTML || prev.descriptionHtml,
    }))
  }

  const updateDescription = () => {
    setForm((prev) => ({
      ...prev,
      descriptionHtml: editorRef.current?.innerHTML || '<p></p>',
    }))
  }

  const saveImageField = async (field: 'poster' | 'thumbnailLabel', file: File | null) => {
    if (!file) return
    try {
      const dataUrl = await fileToDataUrl(file)
      setForm((prev) => ({ ...prev, [field]: dataUrl }))
      toast({ title: 'Image saved', description: `${file.name} is ready to be stored in the database.` })
    } catch {
      toast({ title: 'Upload failed', description: 'We could not read that image file.' })
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Movies Management</h2>
          <p className="mt-1 text-sm text-slate-400">Your admin account is attached to every movie you add or update.</p>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search..."
            className="w-44 rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white placeholder:text-slate-500 outline-none"
          />
          <select
            value={languageFilter}
            onChange={(e) => setLanguageFilter(e.target.value as typeof languageFilter)}
            className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white"
            aria-label="Language filter"
          >
            <option value="All">All languages</option>
            <option value="en">English</option>
            <option value="fr">Francais</option>
            <option value="rw">Kinyarwanda</option>
          </select>
          <button
            onClick={startAdd}
            className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-black"
            style={{ background: 'linear-gradient(to right, var(--admin-accent-a), var(--admin-accent-b))' }}
          >
            <Plus size={16} />
            Add New Movie
          </button>
        </div>
      </div>

      <div className="mb-3 flex flex-wrap gap-2">
        {categoryOptions.map((category) => (
          <span key={category} className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-white">
            {category}
          </span>
        ))}
      </div>

      <section className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1120px] text-left text-sm">
            <thead className="bg-black/25 text-xs text-slate-400">
              <tr>
                <th className="px-4 py-3">Poster</th>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Language</th>
                <th className="px-4 py-3">Quality</th>
                <th className="px-4 py-3">Upload Date</th>
                <th className="px-4 py-3">Added By</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((movie) => (
                <tr key={movie.id} className="border-t border-white/10">
                  <td className="px-4 py-3">
                    {movie.poster ? (
                      <Image src={movie.poster} alt={`${movie.title} poster`} width={40} height={48} className="h-12 w-10 rounded-lg object-cover" />
                    ) : (
                      <div className="h-12 w-10 rounded-lg" style={{ background: 'linear-gradient(to bottom, color-mix(in oklab, var(--admin-accent-a) 40%, transparent), color-mix(in oklab, var(--admin-accent-b) 20%, transparent))' }} />
                    )}
                  </td>
                  <td className="px-4 py-3 font-medium">{movie.title}</td>
                  <td className="px-4 py-3 text-slate-300">{movie.category}</td>
                  <td className="px-4 py-3 text-slate-300 uppercase">{movie.language}</td>
                  <td className="px-4 py-3 text-slate-300">{movie.quality}</td>
                  <td className="px-4 py-3 text-slate-400">{movie.date}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-white">{movie.createdBy}</p>
                    <p className="text-xs text-slate-400">{movie.createdByEmail}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs ${movie.status === 'Active' ? '' : 'bg-amber-400/15 text-amber-300'}`}
                      style={movie.status === 'Active' ? { background: 'color-mix(in oklab, var(--admin-accent-a) 15%, transparent)', color: 'var(--admin-accent-a)' } : undefined}
                    >
                      {movie.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => startEdit(rows.findIndex((row) => row.id === movie.id))}
                        className="rounded-lg border px-2.5 py-1 text-xs"
                        style={{ borderColor: 'color-mix(in oklab, var(--admin-accent-a) 40%, transparent)', background: 'color-mix(in oklab, var(--admin-accent-a) 10%, transparent)', color: 'var(--admin-accent-a)' }}
                      >
                        Edit
                      </button>
                      <button onClick={() => removeMovie(movie.id)} className="rounded-lg border border-[#EF4444]/40 bg-[#EF4444]/10 px-2.5 py-1 text-xs text-[#fca5a5]">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {open ? (
        <div className="fixed inset-0 z-50 bg-black/70 p-4 backdrop-blur-sm">
          <div className="mx-auto mt-8 w-full max-w-4xl rounded-2xl border border-white/10 bg-[#0b1220] p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold">{editIndex === null ? 'Upload Movie' : 'Edit Movie'}</h3>
                <p className="mt-1 text-sm text-slate-400">
                  Saving this movie will attach it to {adminName} ({adminEmail}).
                </p>
              </div>
              <div className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-slate-300">
                Admin author: <span className="font-medium text-white">{adminName}</span>
              </div>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <input
                value={form.title}
                onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="Movie Title"
                className="rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm"
              />
              <select
                value={form.category}
                onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
                className="rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm"
              >
                {categoryOptions.map((category) => (
                  <option key={category}>{category}</option>
                ))}
              </select>
              <select
                value={form.language}
                onChange={(e) => setForm((prev) => ({ ...prev, language: e.target.value as MovieLanguage }))}
                className="rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm"
              >
                <option value="en">English</option>
                <option value="fr">Francais</option>
                <option value="rw">Kinyarwanda</option>
              </select>
              <input
                value={form.poster}
                onChange={(e) => setForm((prev) => ({ ...prev, poster: e.target.value }))}
                placeholder="Poster URL or use the upload below"
                className="rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm"
              />
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm((prev) => ({ ...prev, date: e.target.value }))}
                className="rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm"
              />
              <select
                value={form.quality}
                onChange={(e) => setForm((prev) => ({ ...prev, quality: e.target.value }))}
                className="rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm"
              >
                <option>HD</option>
                <option>4K</option>
              </select>

              <div className="md:col-span-2 rounded-2xl border border-white/10 bg-black/20 p-3">
                <div className="flex flex-wrap items-center gap-2 border-b border-white/10 pb-3">
                  <button onMouseDown={(e) => e.preventDefault()} onClick={() => applyFormat('bold')} className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-sm font-semibold text-white">
                    Bold
                  </button>
                  <button onMouseDown={(e) => e.preventDefault()} onClick={() => applyFormat('italic')} className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-sm italic text-white">
                    Italic
                  </button>
                  <button onMouseDown={(e) => e.preventDefault()} onClick={() => applyFormat('underline')} className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-sm underline text-white">
                    Underline
                  </button>
                  <button onMouseDown={(e) => e.preventDefault()} onClick={() => applyFormat('insertUnorderedList')} className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-sm text-white">
                    Bullets
                  </button>
                  <label className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-sm text-white">
                    Text
                    <input
                      type="color"
                      defaultValue="#f59e0b"
                      onChange={(e) => applyFormat('foreColor', e.target.value)}
                      className="h-6 w-8 cursor-pointer rounded border-0 bg-transparent p-0"
                    />
                  </label>
                  <label className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-sm text-white">
                    Highlight
                    <input
                      type="color"
                      defaultValue="#fde047"
                      onChange={(e) => applyFormat('hiliteColor', e.target.value)}
                      className="h-6 w-8 cursor-pointer rounded border-0 bg-transparent p-0"
                    />
                  </label>
                </div>

                <div
                  ref={editorRef}
                  contentEditable
                  suppressContentEditableWarning
                  onInput={updateDescription}
                  className="mt-3 min-h-40 rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none"
                  style={{ whiteSpace: 'pre-wrap' }}
                />
                <p className="mt-2 text-xs text-slate-400">
                  Rich description editor: bold, underline, list styling, text color, and highlight are all saved.
                </p>
              </div>

              <div className="rounded-xl border border-dashed border-white/20 bg-black/20 px-3 py-4 text-xs text-slate-300">
                <span className="inline-flex items-center gap-2"><Upload size={14} /> Upload Poster Image</span>
                <input
                  type="file"
                  accept="image/*"
                  className="mt-2 block text-xs"
                  onChange={(e) => void saveImageField('poster', e.target.files?.[0] ?? null)}
                />
                <p className="mt-2 text-[11px] text-slate-400">{summarizeStoredAsset(form.poster, 'No poster selected')}</p>
                {isStoredImageSource(form.poster) ? (
                  <div className="relative mt-3 h-36 overflow-hidden rounded-xl border border-white/10">
                    <Image src={form.poster} alt="Poster preview" fill className="object-cover" unoptimized />
                  </div>
                ) : null}
              </div>

              <label className="rounded-xl border border-dashed border-white/20 bg-black/20 px-3 py-4 text-xs text-slate-300">
                <span className="inline-flex items-center gap-2"><Upload size={14} /> Upload Video File</span>
                <input
                  type="file"
                  className="mt-2 block text-xs"
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      videoLabel: e.target.files?.[0]?.name || prev.videoLabel,
                    }))
                  }
                />
                {form.videoLabel ? <p className="mt-2 text-[11px] text-slate-400">{form.videoLabel}</p> : null}
              </label>

              <label className="rounded-xl border border-dashed border-white/20 bg-black/20 px-3 py-4 text-xs text-slate-300">
                <span className="inline-flex items-center gap-2"><Upload size={14} /> Upload Thumbnail</span>
                <input
                  type="file"
                  accept="image/*"
                  className="mt-2 block text-xs"
                  onChange={(e) => void saveImageField('thumbnailLabel', e.target.files?.[0] ?? null)}
                />
                <p className="mt-2 text-[11px] text-slate-400">{summarizeStoredAsset(form.thumbnailLabel, 'No thumbnail selected')}</p>
                {isStoredImageSource(form.thumbnailLabel) ? (
                  <div className="relative mt-3 h-24 overflow-hidden rounded-xl border border-white/10">
                    <Image src={form.thumbnailLabel} alt="Thumbnail preview" fill className="object-cover" unoptimized />
                  </div>
                ) : null}
              </label>

              <label className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm">
                <input
                  type="checkbox"
                  checked={form.status === 'Active'}
                  onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.checked ? 'Active' : 'Draft' }))}
                  className="accent-[var(--admin-accent-a)]"
                />
                Publish
              </label>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button onClick={closeModal} className="rounded-xl border border-white/10 px-4 py-2 text-sm">Cancel</button>
              <button onClick={saveMovie} className="rounded-xl px-4 py-2 text-sm font-semibold text-black" style={{ background: 'linear-gradient(to right, var(--admin-accent-a), var(--admin-accent-b))' }}>Save</button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
