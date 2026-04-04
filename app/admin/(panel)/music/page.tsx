'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { Play } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useFilterOptions } from '@/lib/admin-filters'
import { fileToDataUrl, isStoredImageSource, summarizeStoredAsset } from '@/lib/file-data-url'

type MusicRow = {
  id?: string
  title: string
  artist: string
  genre: string
  duration: string
  cover?: string
  status: 'Active' | 'Draft'
}

export default function AdminMusicPage() {
  const { toast } = useToast()
  const genreOptions = useFilterOptions('music')
  const [rows, setRows] = useState<MusicRow[]>([])
  const [query, setQuery] = useState('')
  const [editIndex, setEditIndex] = useState<number | null>(null)
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<MusicRow>({
    title: '',
    artist: '',
    genre: 'Pop',
    duration: '3:00',
    cover: '',
    status: 'Active',
  })

  const refreshRows = async () => {
    const res = await fetch('/api/tracks?admin=1', { cache: 'no-store' })
    if (!res.ok) throw new Error('Failed to refresh tracks')
    const data = (await res.json()) as { items: MusicRow[] }
    setRows(data.items)
  }

  useEffect(() => {
    void refreshRows().catch(() => {})
  }, [])

  const openAdd = (kind: 'song' | 'album' | 'artist') => {
    setEditIndex(null)
    setForm({ title: '', artist: kind === 'artist' ? 'New Artist' : '', genre: 'Pop', duration: '3:00', cover: '', status: 'Draft' })
    setOpen(true)
  }

  const openEdit = (idx: number) => {
    setEditIndex(idx)
    setForm(rows[idx])
    setOpen(true)
  }

  const save = async () => {
    if (!form.title.trim()) {
      toast({ title: 'Missing title', description: 'Song title is required.' })
      return
    }

    const payload = {
      ...(form.id ? { id: form.id } : {}),
      ...form,
      title: form.title.trim(),
    }

    await fetch('/api/tracks', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    })
    await refreshRows()
    toast({ title: editIndex === null ? 'Added' : 'Updated', description: `${form.title} was ${editIndex === null ? 'added' : 'updated'}.` })
    setOpen(false)
  }

  const remove = async (idx: number) => {
    const name = rows[idx].title
    const id = rows[idx].id
    if (id) await fetch(`/api/tracks/${id}`, { method: 'DELETE' })
    await refreshRows()
    toast({ title: 'Deleted', description: `${name} removed.` })
  }

  const saveCoverFile = async (file: File | null) => {
    if (!file) return
    try {
      const dataUrl = await fileToDataUrl(file)
      setForm((prev) => ({ ...prev, cover: dataUrl }))
      toast({ title: 'Cover saved', description: `${file.name} will be stored in the database.` })
    } catch {
      toast({ title: 'Upload failed', description: 'We could not read that image file.' })
    }
  }

  return (
    <div className="space-y-5">
      <h2 className="text-xl font-bold">Music Management</h2>
      <div className="mb-3 flex flex-wrap gap-2">
        {genreOptions.map((genre) => (
          <span key={genre} className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-white">
            {genre}
          </span>
        ))}
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        <button onClick={() => openAdd('song')} className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-4 text-left text-sm font-semibold" style={{ borderColor: 'color-mix(in oklab, var(--admin-accent-a) 35%, transparent)' }}>Add New Song</button>
        <button onClick={() => openAdd('album')} className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-4 text-left text-sm font-semibold" style={{ borderColor: 'color-mix(in oklab, var(--admin-accent-a) 35%, transparent)' }}>Upload Album</button>
        <button onClick={() => openAdd('artist')} className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-4 text-left text-sm font-semibold" style={{ borderColor: 'color-mix(in oklab, var(--admin-accent-a) 35%, transparent)' }}>Manage Artists</button>
      </div>

      <section className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[960px] text-left text-sm">
            <thead className="bg-black/25 text-xs text-slate-400">
              <tr>
                <th className="px-4 py-3">Cover</th>
                <th className="px-4 py-3">Song Title</th>
                <th className="px-4 py-3">Artist</th>
                <th className="px-4 py-3">Genre</th>
                <th className="px-4 py-3">Duration</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Preview</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows
                .filter((row) => {
                  const q = query.trim().toLowerCase()
                  return !q || [row.title, row.artist, row.genre, row.status].join(' ').toLowerCase().includes(q)
                })
                .map((row, idx) => {
                const rowIndex = rows.findIndex((item) => item.id === row.id)
                return (
                <tr key={row.id ?? `${row.title}-${idx}`} className="border-t border-white/10">
                  <td className="px-4 py-3">
                    {row.cover ? (
                      <Image src={row.cover} alt={`${row.title} cover`} width={40} height={40} className="h-10 w-10 rounded-lg object-cover" unoptimized />
                    ) : (
                      <div className="h-10 w-10 rounded-lg" style={{ background: 'linear-gradient(to bottom right, color-mix(in oklab, var(--admin-accent-a) 40%, transparent), color-mix(in oklab, var(--admin-accent-b) 25%, transparent))' }} />
                    )}
                  </td>
                  <td className="px-4 py-3">{row.title}</td>
                  <td className="px-4 py-3 text-slate-300">{row.artist}</td>
                  <td className="px-4 py-3 text-slate-300">{row.genre}</td>
                  <td className="px-4 py-3 text-slate-400">{row.duration}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs ${row.status === 'Active' ? '' : 'bg-amber-400/15 text-amber-300'}`}
                      style={row.status === 'Active' ? { background: 'color-mix(in oklab, var(--admin-accent-a) 15%, transparent)', color: 'var(--admin-accent-a)' } : undefined}
                    >
                      {row.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toast({ title: 'Preview', description: `Playing 3s preview of ${row.title}.` })}
                      className="inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs"
                      style={{ borderColor: 'color-mix(in oklab, var(--admin-accent-a) 40%, transparent)', background: 'color-mix(in oklab, var(--admin-accent-a) 10%, transparent)', color: 'var(--admin-accent-a)' }}
                    >
                      <Play size={11} />
                      Preview
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEdit(rowIndex)}
                        className="rounded-lg border px-2.5 py-1 text-xs"
                        style={{ borderColor: 'color-mix(in oklab, var(--admin-accent-a) 40%, transparent)', background: 'color-mix(in oklab, var(--admin-accent-a) 10%, transparent)', color: 'var(--admin-accent-a)' }}
                      >
                        Edit
                      </button>
                      <button onClick={() => remove(rowIndex)} className="rounded-lg border border-[#EF4444]/40 bg-[#EF4444]/10 px-2.5 py-1 text-xs text-[#fca5a5]">Delete</button>
                    </div>
                  </td>
                </tr>
              )})}
            </tbody>
          </table>
        </div>
      </section>

      {open ? (
        <div className="fixed inset-0 z-50 bg-black/70 p-4 backdrop-blur-sm">
          <div className="mx-auto mt-10 w-full max-w-xl rounded-2xl border border-white/10 bg-[#0b1220] p-5">
            <h3 className="text-lg font-semibold">{editIndex === null ? 'Add Music Item' : 'Edit Music Item'}</h3>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <input value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} placeholder="Song title" className="rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm" />
              <input value={form.artist} onChange={(e) => setForm((p) => ({ ...p, artist: e.target.value }))} placeholder="Artist" className="rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm" />
              <select value={form.genre} onChange={(e) => setForm((p) => ({ ...p, genre: e.target.value }))} className="rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm">
                {genreOptions.map((genre) => (
                  <option key={genre}>{genre}</option>
                ))}
              </select>
              <input value={form.duration} onChange={(e) => setForm((p) => ({ ...p, duration: e.target.value }))} placeholder="3:00" className="rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm" />
              <input value={form.cover ?? ''} onChange={(e) => setForm((p) => ({ ...p, cover: e.target.value }))} placeholder="Cover URL or use the upload below" className="md:col-span-2 rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm" />
              <div className="md:col-span-2 rounded-xl border border-dashed border-white/20 bg-black/20 px-3 py-4 text-xs text-slate-300">
                <span>Upload cover image</span>
                <input type="file" accept="image/*" className="mt-2 block text-xs" onChange={(e) => void saveCoverFile(e.target.files?.[0] ?? null)} />
                <p className="mt-2 text-[11px] text-slate-400">{summarizeStoredAsset(form.cover, 'No cover selected')}</p>
                {isStoredImageSource(form.cover) ? (
                  <div className="relative mt-3 h-32 overflow-hidden rounded-xl border border-white/10">
                    <Image src={form.cover!} alt="Cover preview" fill className="object-cover" unoptimized />
                  </div>
                ) : null}
              </div>
              <label className="md:col-span-2 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm">
                <input type="checkbox" checked={form.status === 'Active'} onChange={(e) => setForm((p) => ({ ...p, status: e.target.checked ? 'Active' : 'Draft' }))} className="accent-[var(--admin-accent-a)]" />
                Active
              </label>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => setOpen(false)} className="rounded-xl border border-white/10 px-4 py-2 text-sm">Cancel</button>
              <button onClick={save} className="rounded-xl px-4 py-2 text-sm font-semibold text-black" style={{ background: 'linear-gradient(to right, var(--admin-accent-a), var(--admin-accent-b))' }}>Save</button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
