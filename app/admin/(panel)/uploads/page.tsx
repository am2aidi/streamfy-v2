'use client'

import { useEffect, useMemo, useState } from 'react'
import { Check, Pencil, Trash2, X } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useUploads } from '@/hooks/useUploads'
import { listPublicUsers, subscribeToUsers, type PublicUser } from '@/lib/users-store'
import type { UploadKind, UploadStatus, UploadSubmission } from '@/lib/uploads-store'

const statusOptions: UploadStatus[] = ['pending', 'approved', 'rejected', 'removed']
const kindOptions: UploadKind[] = ['movie', 'music', 'sports', 'shorts', 'news', 'ad', 'other']

function badgeFor(status: UploadStatus) {
  if (status === 'approved') return 'border-emerald-400/30 bg-emerald-500/10 text-emerald-300'
  if (status === 'rejected') return 'border-red-400/30 bg-red-500/10 text-red-300'
  if (status === 'removed') return 'border-amber-400/30 bg-amber-500/10 text-amber-300'
  return 'border-white/10 bg-white/[0.04] text-white/75'
}

export default function AdminUploadsPage() {
  const { toast } = useToast()
  const { items, setUploadStatus, deleteUpload, updateUpload } = useUploads()

  const [users, setUsers] = useState(() => listPublicUsers())
  useEffect(() => subscribeToUsers(() => setUsers(listPublicUsers())), [])

  const userById = useMemo(() => {
    const map = new Map<string, PublicUser>()
    for (const u of users) map.set(u.id, u)
    return map
  }, [users])

  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<UploadStatus | 'all'>('pending')
  const [kindFilter, setKindFilter] = useState<UploadKind | 'all'>('all')
  const [editing, setEditing] = useState<UploadSubmission | null>(null)
  const [editForm, setEditForm] = useState({ title: '', description: '', posterUrl: '', tags: '', statusReason: '' })

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return items.filter((x) => {
      if (statusFilter !== 'all' && x.status !== statusFilter) return false
      if (kindFilter !== 'all' && x.kind !== kindFilter) return false
      if (!q) return true
      const u = userById.get(x.createdByUserId)
      const who = u ? `${u.name} ${u.username ?? ''} ${u.email ?? ''}` : x.createdByUserId
      return (x.title + ' ' + x.description + ' ' + x.kind + ' ' + who).toLowerCase().includes(q)
    })
  }, [items, query, statusFilter, kindFilter, userById])

  const startEdit = (x: UploadSubmission) => {
    setEditing(x)
    setEditForm({
      title: x.title,
      description: x.description ?? '',
      posterUrl: x.posterUrl ?? '',
      tags: (x.tags ?? []).join(', '),
      statusReason: x.statusReason ?? '',
    })
  }

  const saveEdit = () => {
    if (!editing) return
    if (!editForm.title.trim()) {
      toast({ title: 'Missing title', description: 'Title is required.' })
      return
    }
    const tags = editForm.tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)
      .slice(0, 20)

    updateUpload(editing.id, {
      title: editForm.title,
      description: editForm.description,
      posterUrl: editForm.posterUrl.trim() || undefined,
      tags: tags.length ? tags : undefined,
      statusReason: editForm.statusReason.trim() || undefined,
    })
    toast({ title: 'Saved', description: 'Upload updated.' })
    setEditing(null)
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold">User Uploads</h2>
          <p className="text-sm text-slate-400">Approve or reject submissions before they appear on the platform.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search..."
            className="w-48 rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white placeholder:text-slate-500 outline-none"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
            className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white"
          >
            <option value="all">All status</option>
            {statusOptions.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <select
            value={kindFilter}
            onChange={(e) => setKindFilter(e.target.value as typeof kindFilter)}
            className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white"
          >
            <option value="all">All kinds</option>
            {kindOptions.map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>
        </div>
      </div>

      <section className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead className="bg-black/25 text-xs text-slate-400">
              <tr>
                <th className="px-4 py-3">Kind</th>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filtered.map((x) => {
                const u = userById.get(x.createdByUserId)
                return (
                  <tr key={x.id} className="hover:bg-white/[0.03]">
                    <td className="px-4 py-3">
                      <span className="rounded-full border border-white/10 bg-black/25 px-2.5 py-1 text-xs text-slate-200">{x.kind}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="max-w-[420px]">
                        <p className="font-semibold text-white line-clamp-1">{x.title}</p>
                        <p className="mt-1 text-xs text-slate-400 line-clamp-1">{x.description || '—'}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-200">{u ? u.name : x.createdByUserId}</td>
                    <td className="px-4 py-3 text-slate-300">{new Date(x.createdAt).toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full border px-2.5 py-1 text-xs ${badgeFor(x.status)}`}>{x.status}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => {
                            setUploadStatus(x.id, 'approved')
                            toast({ title: 'Approved', description: 'Upload approved.' })
                          }}
                          className="inline-flex items-center gap-1 rounded-lg border border-emerald-400/30 bg-emerald-500/10 px-2.5 py-1 text-xs text-emerald-200 hover:bg-emerald-500/15"
                        >
                          <Check size={14} /> Approve
                        </button>
                        <button
                          onClick={() => {
                            setUploadStatus(x.id, 'rejected', 'Not a fit / missing info')
                            toast({ title: 'Rejected', description: 'Upload rejected.' })
                          }}
                          className="inline-flex items-center gap-1 rounded-lg border border-red-400/30 bg-red-500/10 px-2.5 py-1 text-xs text-red-200 hover:bg-red-500/15"
                        >
                          <X size={14} /> Reject
                        </button>
                        <button
                          onClick={() => {
                            setUploadStatus(x.id, 'removed', 'Removed after copyright claim')
                            toast({ title: 'Removed', description: 'Upload marked as removed.' })
                          }}
                          className="rounded-lg border border-amber-400/30 bg-amber-500/10 px-2.5 py-1 text-xs text-amber-200 hover:bg-amber-500/15"
                        >
                          Copyright remove
                        </button>
                        <button
                          onClick={() => startEdit(x)}
                          className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-1 text-xs text-slate-200 hover:bg-white/[0.06]"
                        >
                          <Pencil size={14} /> Edit
                        </button>
                        <button
                          onClick={() => {
                            deleteUpload(x.id)
                            toast({ title: 'Deleted', description: 'Upload deleted.' })
                          }}
                          className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-1 text-xs text-slate-200 hover:border-red-400/40 hover:text-red-300"
                        >
                          <Trash2 size={14} /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-sm text-slate-400">
                    No uploads found.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      {editing ? (
        <div className="fixed inset-0 z-50 bg-black/70 p-4 backdrop-blur-sm">
          <div className="mx-auto mt-12 w-full max-w-2xl rounded-2xl border border-white/10 bg-[#0b1220] p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold">Edit upload</h3>
                <p className="text-xs text-slate-400">ID: {editing.id}</p>
              </div>
              <button onClick={() => setEditing(null)} className="rounded-xl border border-white/10 px-3 py-2 text-sm text-slate-200 hover:bg-white/[0.04]">
                Close
              </button>
            </div>

            <div className="mt-4 grid gap-3">
              <input
                value={editForm.title}
                onChange={(e) => setEditForm((p) => ({ ...p, title: e.target.value }))}
                placeholder="Title"
                className="rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white"
              />
              <textarea
                value={editForm.description}
                onChange={(e) => setEditForm((p) => ({ ...p, description: e.target.value }))}
                placeholder="Description"
                rows={4}
                className="rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white"
              />
              <input
                value={editForm.posterUrl}
                onChange={(e) => setEditForm((p) => ({ ...p, posterUrl: e.target.value }))}
                placeholder="Poster URL (optional)"
                className="rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white"
              />
              <input
                value={editForm.tags}
                onChange={(e) => setEditForm((p) => ({ ...p, tags: e.target.value }))}
                placeholder="Tags (comma-separated)"
                className="rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white"
              />
              <input
                value={editForm.statusReason}
                onChange={(e) => setEditForm((p) => ({ ...p, statusReason: e.target.value }))}
                placeholder="Status reason (optional)"
                className="rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white"
              />
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => setEditing(null)} className="rounded-xl border border-white/10 px-4 py-2 text-sm text-slate-200">
                Cancel
              </button>
              <button
                onClick={saveEdit}
                className="rounded-xl px-4 py-2 text-sm font-semibold text-black"
                style={{ background: 'linear-gradient(to right, var(--admin-accent-a), var(--admin-accent-b))' }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

