'use client'

import { useState } from 'react'
import { Play } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useFilterOptions } from '@/lib/admin-filters'

type MusicRow = {
  title: string
  artist: string
  genre: string
  duration: string
  cover?: string
  status: 'Active' | 'Draft'
}

const initialRows: MusicRow[] = [
  { title: 'Neon Drive', artist: 'Ari Vox', genre: 'Synthwave', duration: '3:24', cover: '', status: 'Active' },
  { title: 'Golden Pulse', artist: 'Mika Y', genre: 'Pop', duration: '2:56', cover: '', status: 'Draft' },
  { title: 'Crowd Roar', artist: 'DJ Volt', genre: 'EDM', duration: '4:12', cover: '', status: 'Active' },
]

export default function AdminMusicPage() {
  const { toast } = useToast()
  const genreOptions = useFilterOptions('music')
  const [rows, setRows] = useState<MusicRow[]>(initialRows)
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

  const save = () => {
    if (!form.title.trim()) {
      toast({ title: 'Missing title', description: 'Song title is required.' })
      return
    }
    if (editIndex === null) {
      setRows((prev) => [{ ...form, title: form.title.trim() }, ...prev])
      toast({ title: 'Added', description: `${form.title} was added.` })
    } else {
      setRows((prev) => prev.map((row, idx) => (idx === editIndex ? { ...form, title: form.title.trim() } : row)))
      toast({ title: 'Updated', description: `${form.title} was updated.` })
    }
    setOpen(false)
  }

  const remove = (idx: number) => {
    const name = rows[idx].title
    setRows((prev) => prev.filter((_, i) => i !== idx))
    toast({ title: 'Deleted', description: `${name} removed.` })
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
                .map((row, idx) => (
                <tr key={`${row.title}-${idx}`} className="border-t border-white/10">
                  <td className="px-4 py-3">
                    {row.cover ? (
                      <img src={row.cover} alt={`${row.title} cover`} className="h-10 w-10 rounded-lg object-cover" />
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
                        onClick={() => openEdit(idx)}
                        className="rounded-lg border px-2.5 py-1 text-xs"
                        style={{ borderColor: 'color-mix(in oklab, var(--admin-accent-a) 40%, transparent)', background: 'color-mix(in oklab, var(--admin-accent-a) 10%, transparent)', color: 'var(--admin-accent-a)' }}
                      >
                        Edit
                      </button>
                      <button onClick={() => remove(idx)} className="rounded-lg border border-[#EF4444]/40 bg-[#EF4444]/10 px-2.5 py-1 text-xs text-[#fca5a5]">Delete</button>
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
              <input value={form.cover ?? ''} onChange={(e) => setForm((p) => ({ ...p, cover: e.target.value }))} placeholder="Cover URL (optional)" className="md:col-span-2 rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm" />
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
