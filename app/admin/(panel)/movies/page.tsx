'use client'

import { useState } from 'react'
import { Plus, Upload } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

const defaultRows = [
  { title: 'Dark Pursuit', category: 'Thriller', quality: '4K', date: '2026-02-27', status: 'Active', poster: '' },
  { title: 'KYLEXY', category: 'Sci-Fi', quality: 'HD', date: '2026-02-26', status: 'Draft', poster: '' },
  { title: 'Top Rated', category: 'Drama', quality: '4K', date: '2026-02-21', status: 'Active', poster: '' },
]

export default function AdminMoviesPage() {
  const { toast } = useToast()
  const [rows, setRows] = useState(defaultRows)
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [editIndex, setEditIndex] = useState<number | null>(null)
  const [form, setForm] = useState({
    title: '',
    category: 'Action',
    quality: 'HD',
    status: 'Active',
    date: '2026-03-04',
    poster: '',
  })

  const startAdd = () => {
    setEditIndex(null)
    setForm({ title: '', category: 'Action', quality: 'HD', status: 'Active', date: '2026-03-04', poster: '' })
    setOpen(true)
  }

  const startEdit = (index: number) => {
    setEditIndex(index)
    setForm(rows[index])
    setOpen(true)
  }

  const saveMovie = () => {
    if (!form.title.trim()) {
      toast({ title: 'Missing title', description: 'Movie title is required.' })
      return
    }
    if (editIndex === null) {
      setRows((prev) => [{ ...form, title: form.title.trim() }, ...prev])
      toast({ title: 'Movie added', description: `${form.title} was added.` })
    } else {
      setRows((prev) => prev.map((item, idx) => (idx === editIndex ? { ...form, title: form.title.trim() } : item)))
      toast({ title: 'Movie updated', description: `${form.title} was updated.` })
    }
    setOpen(false)
  }

  const removeMovie = (index: number) => {
    const name = rows[index].title
    setRows((prev) => prev.filter((_, idx) => idx !== index))
    toast({ title: 'Movie deleted', description: `${name} removed from list.` })
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Movies Management</h2>
        <button
          onClick={startAdd}
          className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-black"
          style={{ background: 'linear-gradient(to right, var(--admin-accent-a), var(--admin-accent-b))' }}
        >
          <Plus size={16} />
          Add New Movie
        </button>
      </div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Filter by title, category, quality..."
        className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm"
      />

      <section className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead className="bg-black/25 text-xs text-slate-400">
              <tr>
                <th className="px-4 py-3">Poster</th>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Quality</th>
                <th className="px-4 py-3">Upload Date</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows
                .filter((movie) => {
                  const q = query.trim().toLowerCase()
                  return !q || [movie.title, movie.category, movie.quality, movie.status].join(' ').toLowerCase().includes(q)
                })
                .map((movie) => (
                <tr key={movie.title} className="border-t border-white/10">
                  <td className="px-4 py-3">
                    {movie.poster ? (
                      <img src={movie.poster} alt={`${movie.title} poster`} className="h-12 w-10 rounded-lg object-cover" />
                    ) : (
                      <div className="h-12 w-10 rounded-lg" style={{ background: 'linear-gradient(to bottom, color-mix(in oklab, var(--admin-accent-a) 40%, transparent), color-mix(in oklab, var(--admin-accent-b) 20%, transparent))' }} />
                    )}
                  </td>
                  <td className="px-4 py-3 font-medium">{movie.title}</td>
                  <td className="px-4 py-3 text-slate-300">{movie.category}</td>
                  <td className="px-4 py-3 text-slate-300">{movie.quality}</td>
                  <td className="px-4 py-3 text-slate-400">{movie.date}</td>
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
                        onClick={() => startEdit(rows.indexOf(movie))}
                        className="rounded-lg border px-2.5 py-1 text-xs"
                        style={{ borderColor: 'color-mix(in oklab, var(--admin-accent-a) 40%, transparent)', background: 'color-mix(in oklab, var(--admin-accent-a) 10%, transparent)', color: 'var(--admin-accent-a)' }}
                      >
                        Edit
                      </button>
                      <button onClick={() => removeMovie(rows.indexOf(movie))} className="rounded-lg border border-[#EF4444]/40 bg-[#EF4444]/10 px-2.5 py-1 text-xs text-[#fca5a5]">Delete</button>
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
          <div className="mx-auto mt-12 w-full max-w-2xl rounded-2xl border border-white/10 bg-[#0b1220] p-5">
            <h3 className="text-lg font-semibold">{editIndex === null ? 'Upload Movie' : 'Edit Movie'}</h3>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <input value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} placeholder="Movie Title" className="rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm" />
              <select value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))} className="rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm">
                <option>Action</option>
                <option>Comedy</option>
                <option>Sci-Fi</option>
                <option>Drama</option>
                <option>Thriller</option>
              </select>
              <input value={form.poster} onChange={(e) => setForm((p) => ({ ...p, poster: e.target.value }))} placeholder="Poster URL (optional)" className="md:col-span-2 rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm" />
              <textarea placeholder="Description" className="md:col-span-2 rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm" rows={3} />
              <label className="rounded-xl border border-dashed border-white/20 bg-black/20 px-3 py-4 text-xs text-slate-300">
                <span className="inline-flex items-center gap-2"><Upload size={14} /> Upload Video File</span>
                <input type="file" className="mt-2 block text-xs" />
              </label>
              <label className="rounded-xl border border-dashed border-white/20 bg-black/20 px-3 py-4 text-xs text-slate-300">
                <span className="inline-flex items-center gap-2"><Upload size={14} /> Upload Thumbnail</span>
                <input type="file" className="mt-2 block text-xs" />
              </label>
              <select value={form.quality} onChange={(e) => setForm((p) => ({ ...p, quality: e.target.value }))} className="rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm">
                <option>HD</option>
                <option>4K</option>
              </select>
              <label className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm">
                <input
                  type="checkbox"
                  checked={form.status === 'Active'}
                  onChange={(e) => setForm((p) => ({ ...p, status: e.target.checked ? 'Active' : 'Draft' }))}
                  className="accent-[var(--admin-accent-a)]"
                />
                Publish
              </label>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => setOpen(false)} className="rounded-xl border border-white/10 px-4 py-2 text-sm">Cancel</button>
              <button onClick={saveMovie} className="rounded-xl px-4 py-2 text-sm font-semibold text-black" style={{ background: 'linear-gradient(to right, var(--admin-accent-a), var(--admin-accent-b))' }}>Save</button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
