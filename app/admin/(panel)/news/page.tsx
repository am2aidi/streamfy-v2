'use client'

import { useMemo, useState } from 'react'
import { Plus, Save, Trash2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { newsItems, type NewsCategory } from '@/lib/news-data'

type Row = {
  id: string
  title: string
  category: NewsCategory
  summary: string
  source: string
  time: string
  image: string
}

export default function AdminNewsPage() {
  const { toast } = useToast()
  const [rows, setRows] = useState<Row[]>(newsItems)
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<'all' | NewsCategory>('all')

  const [form, setForm] = useState<Omit<Row, 'id'> & { id?: string }>({
    title: '',
    category: 'music',
    summary: '',
    source: 'Streamfy Desk',
    time: 'Just now',
    image: '',
  })

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return rows.filter((r) => {
      const byCategory = category === 'all' || r.category === category
      const byQuery = !q || (r.title + ' ' + r.summary + ' ' + r.source).toLowerCase().includes(q)
      return byCategory && byQuery
    })
  }, [rows, query, category])

  const startNew = () => {
    setForm({ title: '', category: 'music', summary: '', source: 'Streamfy Desk', time: 'Just now', image: '' })
  }

  const save = () => {
    if (!form.title.trim()) {
      toast({ title: 'Missing title', description: 'News title is required.' })
      return
    }
    if (!form.summary.trim()) {
      toast({ title: 'Missing summary', description: 'News summary is required.' })
      return
    }
    const nextRow: Row = {
      id: form.id ?? `news-${Date.now()}`,
      title: form.title.trim(),
      category: form.category,
      summary: form.summary.trim(),
      source: form.source.trim() || 'Streamfy Desk',
      time: form.time.trim() || 'Just now',
      image: form.image.trim() || 'https://images.unsplash.com/photo-1526948128573-703ee1aeb6fa?w=900&q=80',
    }
    setRows((prev) => {
      const idx = prev.findIndex((x) => x.id === nextRow.id)
      if (idx === -1) return [nextRow, ...prev]
      return prev.map((x) => (x.id === nextRow.id ? nextRow : x))
    })
    toast({ title: form.id ? 'News updated' : 'News created', description: nextRow.title })
    startNew()
  }

  const edit = (row: Row) => setForm({ ...row })

  const remove = (id: string) => {
    setRows((prev) => prev.filter((x) => x.id !== id))
    toast({ title: 'Deleted', description: 'News item removed.' })
    if (form.id === id) startNew()
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-bold">News Management</h2>
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
            <option value="music">Music</option>
            <option value="sports">Sports</option>
            <option value="movies">Movies</option>
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
                  <th className="px-4 py-3">Source</th>
                  <th className="px-4 py-3">Time</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id} className="border-t border-white/10">
                    <td className="px-4 py-3 text-white font-medium">{r.title}</td>
                    <td className="px-4 py-3 text-slate-300">{r.category}</td>
                    <td className="px-4 py-3 text-slate-300">{r.source}</td>
                    <td className="px-4 py-3 text-slate-300">{r.time}</td>
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
                    <td className="px-4 py-6 text-slate-400" colSpan={5}>
                      No news found.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
          <h3 className="text-sm font-semibold text-white">{form.id ? 'Edit news' : 'Create news'}</h3>
          <div className="mt-4 space-y-3">
            <input
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              placeholder="Title"
              className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white placeholder:text-slate-500 outline-none"
            />
            <select
              value={form.category}
              onChange={(e) => setForm((p) => ({ ...p, category: e.target.value as NewsCategory }))}
              className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white"
            >
              <option value="music">Music</option>
              <option value="sports">Sports</option>
              <option value="movies">Movies</option>
              <option value="comedy">Comedy</option>
            </select>
            <textarea
              value={form.summary}
              onChange={(e) => setForm((p) => ({ ...p, summary: e.target.value }))}
              placeholder="Summary"
              rows={4}
              className="w-full resize-none rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white placeholder:text-slate-500 outline-none"
            />
            <input
              value={form.source}
              onChange={(e) => setForm((p) => ({ ...p, source: e.target.value }))}
              placeholder="Source"
              className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white placeholder:text-slate-500 outline-none"
            />
            <input
              value={form.time}
              onChange={(e) => setForm((p) => ({ ...p, time: e.target.value }))}
              placeholder="Time (e.g. 10m ago)"
              className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white placeholder:text-slate-500 outline-none"
            />
            <input
              value={form.image}
              onChange={(e) => setForm((p) => ({ ...p, image: e.target.value }))}
              placeholder="Image URL"
              className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white placeholder:text-slate-500 outline-none"
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

