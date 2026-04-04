'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import { Plus, Save, Trash2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import type { ShortsCategory } from '@/lib/shorts-data'
import { fileToDataUrl, isStoredImageSource, summarizeStoredAsset } from '@/lib/file-data-url'

type Row = {
  id: string
  title: string
  category: ShortsCategory
  durationSeconds: number
  image: string
  caption: string
}

export default function AdminShortsPage() {
  const { toast } = useToast()
  const [rows, setRows] = useState<Row[]>([])
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<'all' | ShortsCategory>('all')

  const [form, setForm] = useState<Omit<Row, 'id'> & { id?: string }>({
    title: '',
    category: 'movies',
    durationSeconds: 20,
    image: '',
    caption: '',
  })

  const refreshRows = async () => {
    const res = await fetch('/api/shorts', { cache: 'no-store' })
    if (!res.ok) throw new Error('Failed to refresh shorts')
    const data = (await res.json()) as { items: Row[] }
    setRows(data.items)
  }

  useEffect(() => {
    void refreshRows().catch(() => {})
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return rows.filter((r) => {
      const byCategory = category === 'all' || r.category === category
      const byQuery = !q || (r.title + ' ' + r.caption).toLowerCase().includes(q)
      return byCategory && byQuery
    })
  }, [rows, query, category])

  const startNew = () => setForm({ title: '', category: 'movies', durationSeconds: 20, image: '', caption: '' })

  const save = async () => {
    if (!form.title.trim()) {
      toast({ title: 'Missing title', description: 'Short title is required.' })
      return
    }

    const nextRow = {
      ...(form.id ? { id: form.id } : {}),
      title: form.title.trim(),
      category: form.category,
      durationSeconds: Math.max(1, Math.min(59, Number(form.durationSeconds) || 20)),
      image: form.image.trim() || '/placeholder.jpg',
      caption: form.caption.trim() || 'Short clip ready to publish.',
    }

    await fetch('/api/shorts', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(nextRow),
    })
    await refreshRows()
    toast({ title: form.id ? 'Short updated' : 'Short created', description: nextRow.title })
    startNew()
  }

  const edit = (row: Row) => setForm({ ...row })

  const remove = async (id: string) => {
    await fetch(`/api/shorts/${id}`, { method: 'DELETE' })
    await refreshRows()
    toast({ title: 'Deleted', description: 'Short removed.' })
    if (form.id === id) startNew()
  }

  const saveImageFile = async (file: File | null) => {
    if (!file) return
    try {
      const dataUrl = await fileToDataUrl(file)
      setForm((prev) => ({ ...prev, image: dataUrl }))
      toast({ title: 'Image saved', description: `${file.name} will be stored in the database.` })
    } catch {
      toast({ title: 'Upload failed', description: 'We could not read that image file.' })
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-bold">Shorts Management</h2>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search..."
            className="w-44 rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white placeholder:text-slate-500 outline-none"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as typeof category)}
            className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white"
          >
            <option value="all">All categories</option>
            <option value="movies">Movies</option>
            <option value="music">Music</option>
            <option value="sports">Sports</option>
            <option value="comedy">Comedy</option>
          </select>
          <button
            onClick={startNew}
            className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-black"
            style={{ background: 'linear-gradient(to right, var(--admin-accent-a), var(--admin-accent-b))' }}
          >
            <Plus size={16} />
            New
          </button>
        </div>
      </div>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_420px]">
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-left text-sm">
              <thead className="bg-black/25 text-xs text-slate-400">
                <tr>
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Duration</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id} className="border-t border-white/10">
                    <td className="px-4 py-3 text-white font-medium">{r.title}</td>
                    <td className="px-4 py-3 text-slate-300">{r.category}</td>
                    <td className="px-4 py-3 text-slate-300">0:{r.durationSeconds.toString().padStart(2, '0')}s</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => edit(r)} className="rounded-lg border border-white/10 bg-black/30 px-3 py-1.5 text-xs text-white hover:bg-white/5">
                          Edit
                        </button>
                        <button onClick={() => remove(r.id)} className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs text-red-200 hover:bg-red-500/15">
                          <span className="inline-flex items-center gap-1">
                            <Trash2 size={12} /> Delete
                          </span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 ? (
                  <tr className="border-t border-white/10">
                    <td className="px-4 py-6 text-slate-400" colSpan={4}>
                      No shorts found.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
          <h3 className="text-sm font-semibold text-white">{form.id ? 'Edit short' : 'Create short'}</h3>
          <div className="mt-4 space-y-3">
            <input
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              placeholder="Title"
              className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white placeholder:text-slate-500 outline-none"
            />
            <select
              value={form.category}
              onChange={(e) => setForm((p) => ({ ...p, category: e.target.value as ShortsCategory }))}
              className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white"
            >
              <option value="movies">Movies</option>
              <option value="music">Music</option>
              <option value="sports">Sports</option>
              <option value="comedy">Comedy</option>
            </select>
            <input
              type="number"
              min={1}
              max={59}
              value={form.durationSeconds}
              onChange={(e) => setForm((p) => ({ ...p, durationSeconds: Number(e.target.value) }))}
              placeholder="Duration seconds"
              className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white placeholder:text-slate-500 outline-none"
            />
            <input
              value={form.image}
              onChange={(e) => setForm((p) => ({ ...p, image: e.target.value }))}
              placeholder="Image URL or use the upload below"
              className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white placeholder:text-slate-500 outline-none"
            />
            <div className="rounded-xl border border-dashed border-white/20 bg-black/20 px-3 py-4 text-xs text-slate-300">
              <span>Upload short image</span>
              <input type="file" accept="image/*" className="mt-2 block text-xs" onChange={(e) => void saveImageFile(e.target.files?.[0] ?? null)} />
              <p className="mt-2 text-[11px] text-slate-400">{summarizeStoredAsset(form.image, 'No image selected')}</p>
              {isStoredImageSource(form.image) ? (
                <div className="relative mt-3 h-32 overflow-hidden rounded-xl border border-white/10">
                  <Image src={form.image} alt="Short image preview" fill className="object-cover" unoptimized />
                </div>
              ) : null}
            </div>
            <textarea
              value={form.caption}
              onChange={(e) => setForm((p) => ({ ...p, caption: e.target.value }))}
              placeholder="Caption"
              rows={4}
              className="w-full resize-none rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white placeholder:text-slate-500 outline-none"
            />
            <button
              onClick={save}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-black"
              style={{ background: 'linear-gradient(to right, var(--admin-accent-a), var(--admin-accent-b))' }}
            >
              <Save size={15} />
              Save
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}

