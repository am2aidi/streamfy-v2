'use client'

import { useMemo, useState } from 'react'
import { Eye, Search, Trash2, XCircle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useCommunity } from '@/hooks/useCommunity'
import type { CommunityStatus } from '@/lib/community-store'

export default function AdminCommunityPage() {
  const { toast } = useToast()
  const community = useCommunity()
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<'all' | CommunityStatus>('all')

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    return community.items.filter((item) => {
      const searchable = [
        item.title,
        item.description,
        item.kind,
        item.createdByName ?? '',
        item.createdByEmail ?? '',
      ]
        .join(' ')
        .toLowerCase()

      const byStatus = status === 'all' || item.status === status
      const byQuery = !normalizedQuery || searchable.includes(normalizedQuery)
      return byStatus && byQuery
    })
  }, [community.items, query, status])

  const remove = (id: string) => {
    community.setItems((previous) => previous.filter((item) => item.id !== id))
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
          <p className="mt-1 text-sm text-slate-300">
            Uploads go live immediately. Use this page to hide, restore, contact the uploader, or remove reported content.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <div className="relative">
            <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search..."
              className="w-48 rounded-xl border border-white/10 bg-black/30 py-2 pl-9 pr-3 text-sm text-white placeholder:text-slate-500 outline-none"
            />
          </div>
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value as typeof status)}
            className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white"
          >
            <option value="all">All</option>
            <option value="published">Published</option>
            <option value="pending">Pending</option>
            <option value="rejected">Hidden</option>
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
              {filtered.map((item) => {
                const stats = community.statsFor(item.id)
                const uploaderName = item.createdByName ?? item.createdBy
                const uploaderEmail = item.createdByEmail ?? ''
                const isPublished = item.status === 'published'

                return (
                  <tr key={item.id} className="border-t border-white/10">
                    <td className="px-4 py-3 font-medium text-white">{item.title}</td>
                    <td className="px-4 py-3 text-slate-300">{item.kind}</td>
                    <td className="px-4 py-3 text-slate-300">{item.status}</td>
                    <td className="px-4 py-3 text-slate-300">{stats.ratingCount ? `${stats.avgStars.toFixed(1)} (${stats.ratingCount})` : '-'}</td>
                    <td className="px-4 py-3 text-slate-300">{stats.likeCount}</td>
                    <td className="px-4 py-3 text-slate-300">
                      <div className="flex flex-col">
                        <span>{uploaderName}</span>
                        {uploaderEmail ? <span className="text-xs text-slate-400">{uploaderEmail}</span> : null}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-300">{new Date(item.createdAt).toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {uploaderEmail ? (
                          <a
                            href={`mailto:${encodeURIComponent(uploaderEmail)}?subject=${encodeURIComponent(`${item.title} on Streamfy`)}&body=${encodeURIComponent(
                              `Hi,\n\nWe are contacting you about your upload ("${item.title}").\n\nThanks,\nStreamfy Admin`,
                            )}`}
                            className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-black/30 px-3 py-1.5 text-xs text-white hover:bg-white/5"
                          >
                            Email
                          </a>
                        ) : null}
                        <button
                          onClick={() => setStatusFor(item.id, isPublished ? 'rejected' : 'published')}
                          className={`inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs ${
                            isPublished
                              ? 'border border-white/10 bg-black/30 text-white hover:bg-white/5'
                              : 'border border-emerald-500/30 bg-emerald-500/10 text-emerald-200 hover:bg-emerald-500/15'
                          }`}
                        >
                          {isPublished ? <XCircle size={12} /> : <Eye size={12} />}
                          {isPublished ? 'Hide' : 'Restore'}
                        </button>
                        <button
                          onClick={() => remove(item.id)}
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
