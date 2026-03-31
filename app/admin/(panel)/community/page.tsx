'use client'

import { useMemo, useState } from 'react'
import { CheckCircle2, Search, Trash2, XCircle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useCommunity } from '@/hooks/useCommunity'
import { listPublicUsers } from '@/lib/users-store'
import type { CommunityStatus } from '@/lib/community-store'

export default function AdminCommunityPage() {
  const { toast } = useToast()
  const community = useCommunity()
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<'all' | CommunityStatus>('all')

  const users = useMemo(() => listPublicUsers(), [])
  const userFor = (id: string) => users.find((u) => u.id === id)
  const nameFor = (id: string) => userFor(id)?.name ?? id
  const emailFor = (id: string) => userFor(id)?.email ?? ''

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return community.items.filter((i) => {
      const byStatus = status === 'all' || i.status === status
      const byQuery = !q || (i.title + ' ' + i.description + ' ' + i.kind).toLowerCase().includes(q)
      return byStatus && byQuery
    })
  }, [community.items, query, status])

  const remove = (id: string) => {
    community.setItems((prev) => prev.filter((x) => x.id !== id))
    toast({ title: 'Deleted', description: 'Community upload removed.' })
  }

  const setStatusFor = (id: string, next: CommunityStatus) => {
    community.updateItemStatus(id, next)
    toast({ title: 'Updated', description: `Status set to ${next}.` })
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold">Community Uploads</h2>
          <p className="mt-1 text-sm text-slate-300">Review user uploads, publish, reject, or remove.</p>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <div className="relative">
            <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search..."
              className="w-48 rounded-xl border border-white/10 bg-black/30 py-2 pl-9 pr-3 text-sm text-white placeholder:text-slate-500 outline-none"
            />
          </div>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as typeof status)}
            className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white"
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="published">Published</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead className="bg-black/25 text-xs text-slate-400">
              <tr>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Ratings</th>
                <th className="px-4 py-3">Likes</th>
                <th className="px-4 py-3">Created by</th>
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((i) => {
                const stats = community.statsFor(i.id)
                const uploaderEmail = emailFor(i.createdBy)
                return (
                  <tr key={i.id} className="border-t border-white/10">
                    <td className="px-4 py-3 text-white font-medium">{i.title}</td>
                    <td className="px-4 py-3 text-slate-300">{i.kind}</td>
                    <td className="px-4 py-3 text-slate-300">{i.status}</td>
                    <td className="px-4 py-3 text-slate-300">{stats.ratingCount ? `${stats.avgStars.toFixed(1)} (${stats.ratingCount})` : '—'}</td>
                    <td className="px-4 py-3 text-slate-300">{stats.likeCount}</td>
                    <td className="px-4 py-3 text-slate-300">
                      <div className="flex flex-col">
                        <span>{nameFor(i.createdBy)}</span>
                        {uploaderEmail ? <span className="text-xs text-slate-400">{uploaderEmail}</span> : null}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-300">{new Date(i.createdAt).toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {uploaderEmail ? (
                          <a
                            href={`mailto:${encodeURIComponent(uploaderEmail)}?subject=${encodeURIComponent(`${i.title} on Streamfy`)}&body=${encodeURIComponent(
                              `Hi,\\n\\nWe are contacting you about your upload (“${i.title}”).\\n\\nThanks,\\nStreamfy Admin`,
                            )}`}
                            className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-black/30 px-3 py-1.5 text-xs text-white hover:bg-white/5"
                          >
                            Email
                          </a>
                        ) : null}
                        <button
                          onClick={() => setStatusFor(i.id, 'published')}
                          className="inline-flex items-center gap-1 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs text-emerald-200 hover:bg-emerald-500/15"
                        >
                          <CheckCircle2 size={12} /> Publish
                        </button>
                        <button
                          onClick={() => setStatusFor(i.id, 'rejected')}
                          className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-black/30 px-3 py-1.5 text-xs text-white hover:bg-white/5"
                        >
                          <XCircle size={12} /> Reject
                        </button>
                        <button
                          onClick={() => remove(i.id)}
                          className="inline-flex items-center gap-1 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs text-red-200 hover:bg-red-500/15"
                        >
                          <Trash2 size={12} /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
              {filtered.length === 0 ? (
                <tr className="border-t border-white/10">
                  <td className="px-4 py-6 text-slate-400" colSpan={8}>
                    No uploads found.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

