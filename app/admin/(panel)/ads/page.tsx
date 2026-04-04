'use client'

import { useEffect, useState } from 'react'
import { useToast } from '@/hooks/use-toast'

type AdRow = {
  id?: string
  banner: string
  advertiser: string
  placement: 'Home' | 'Movie' | 'Sport' | 'Music'
  start: string
  end: string
  status: 'Active' | 'Paused' | 'Completed'
  performance: string
}

const emptyForm: AdRow = {
  banner: '',
  advertiser: '',
  placement: 'Home',
  start: '2026-03-05',
  end: '2026-04-05',
  status: 'Active',
  performance: '0.0% CTR',
}

export default function AdminAdsPage() {
  const { toast } = useToast()
  const [rows, setRows] = useState<AdRow[]>([])
  const [open, setOpen] = useState(false)
  const [editIndex, setEditIndex] = useState<number | null>(null)
  const [form, setForm] = useState<AdRow>(emptyForm)

  const refresh = async () => {
    const res = await fetch('/api/ads', { cache: 'no-store' })
    if (!res.ok) throw new Error('Failed to load ads')
    const data = (await res.json()) as { items: AdRow[] }
    setRows(data.items)
  }

  useEffect(() => {
    void refresh().catch(() => {})
  }, [])

  const startAdd = () => {
    setEditIndex(null)
    setForm(emptyForm)
    setOpen(true)
  }

  const startEdit = (idx: number) => {
    setEditIndex(idx)
    setForm(rows[idx])
    setOpen(true)
  }

  const save = async () => {
    if (!form.banner.trim() || !form.advertiser.trim()) {
      toast({ title: 'Missing data', description: 'Banner name and advertiser are required.' })
      return
    }
    if (new Date(form.end) <= new Date(form.start)) {
      toast({ title: 'Invalid dates', description: 'End date must be after start date.' })
      return
    }

    await fetch('/api/ads', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ...form, id: form.id }),
    })
    await refresh()
    toast({ title: editIndex === null ? 'Ad added' : 'Ad updated', description: `${form.banner} campaign saved.` })
    setOpen(false)
  }

  const remove = async (idx: number) => {
    const item = rows[idx]
    if (item.id) {
      await fetch(`/api/ads/${item.id}`, { method: 'DELETE' })
      await refresh()
    }
    toast({ title: 'Ad deleted', description: `${item.banner} removed.` })
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Ads Board</h2>
        <button onClick={startAdd} className="rounded-xl bg-[#f4a30a] px-4 py-2 text-sm font-semibold text-black">Add New Ad</button>
      </div>

      <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
        <div className="h-44 rounded-xl border border-white/10 bg-gradient-to-r from-[#f4a30a]/20 via-[#f4a30a]/10 to-transparent p-3">
          <p className="text-sm font-semibold">Performance Graph Per Ad</p>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px] text-left text-sm">
            <thead className="bg-black/25 text-xs text-slate-400">
              <tr>
                <th className="px-4 py-3">Ad Banner</th>
                <th className="px-4 py-3">Advertiser</th>
                <th className="px-4 py-3">Placement</th>
                <th className="px-4 py-3">Start Date</th>
                <th className="px-4 py-3">End Date</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Performance</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, idx) => (
                <tr key={row.id ?? `${row.banner}-${idx}`} className="border-t border-white/10">
                  <td className="px-4 py-3"><div className="h-10 w-20 rounded-lg bg-gradient-to-r from-[#f4a30a]/35 to-[#f4a30a]/20" /></td>
                  <td className="px-4 py-3">{row.advertiser}</td>
                  <td className="px-4 py-3 text-slate-300">{row.placement}</td>
                  <td className="px-4 py-3 text-slate-400">{row.start}</td>
                  <td className="px-4 py-3 text-slate-400">{row.end}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => {
                        const nextStatus = row.status === 'Active' ? 'Paused' : 'Active'
                        void fetch('/api/ads', {
                          method: 'POST',
                          headers: { 'content-type': 'application/json' },
                          body: JSON.stringify({ ...row, status: nextStatus }),
                        }).then(refresh)
                      }}
                      className={`rounded-full px-2.5 py-1 text-xs ${row.status === 'Active' ? 'bg-[#f4a30a]/15 text-[#ffd089]' : 'bg-white/10 text-slate-300'}`}
                    >
                      {row.status}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-[#f4a30a]">{row.performance}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => startEdit(idx)} className="rounded-lg border border-[#f4a30a]/40 bg-[#f4a30a]/10 px-2.5 py-1 text-xs text-[#ffd089]">Edit</button>
                      <button onClick={() => void remove(idx)} className="rounded-lg border border-[#EF4444]/40 bg-[#EF4444]/10 px-2.5 py-1 text-xs text-[#fca5a5]">Delete</button>
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
            <h3 className="text-lg font-semibold">{editIndex === null ? 'Add Ad Campaign' : 'Edit Ad Campaign'}</h3>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <input value={form.banner} onChange={(e) => setForm((p) => ({ ...p, banner: e.target.value }))} placeholder="Banner name" className="rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm" />
              <input value={form.advertiser} onChange={(e) => setForm((p) => ({ ...p, advertiser: e.target.value }))} placeholder="Advertiser" className="rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm" />
              <select value={form.placement} onChange={(e) => setForm((p) => ({ ...p, placement: e.target.value as AdRow['placement'] }))} className="rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm">
                <option>Home</option>
                <option>Movie</option>
                <option>Sport</option>
                <option>Music</option>
              </select>
              <select value={form.status} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value as AdRow['status'] }))} className="rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm">
                <option>Active</option>
                <option>Paused</option>
                <option>Completed</option>
              </select>
              <input type="date" value={form.start} onChange={(e) => setForm((p) => ({ ...p, start: e.target.value }))} className="rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm" />
              <input type="date" value={form.end} onChange={(e) => setForm((p) => ({ ...p, end: e.target.value }))} className="rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm" />
              <input value={form.performance} onChange={(e) => setForm((p) => ({ ...p, performance: e.target.value }))} placeholder="8.4% CTR" className="md:col-span-2 rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm" />
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => setOpen(false)} className="rounded-xl border border-white/10 px-4 py-2 text-sm">Cancel</button>
              <button onClick={() => void save()} className="rounded-xl bg-[#f4a30a] px-4 py-2 text-sm font-semibold text-black">Save</button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
