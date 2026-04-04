'use client'

import { useEffect, useMemo, useState } from 'react'
import { Plus, RotateCcw, Save, Trash2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

type BotFaqEntry = {
  id: string
  title: string
  keywords: string[]
  responseText: string
  isActive?: boolean
  sortOrder?: number
}

function uid() {
  return `bot-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

const defaultEntry: BotFaqEntry = {
  id: '',
  title: '',
  keywords: [],
  responseText: '',
}

export default function AdminChatbotPage() {
  const { toast } = useToast()
  const [entries, setEntries] = useState<BotFaqEntry[]>([])
  const [query, setQuery] = useState('')
  const [form, setForm] = useState<BotFaqEntry>(defaultEntry)

  const refresh = async () => {
    const res = await fetch('/api/bot-faq', { cache: 'no-store' })
    if (!res.ok) throw new Error('Failed to load bot FAQ')
    const data = (await res.json()) as { items: BotFaqEntry[] }
    setEntries(data.items)
  }

  useEffect(() => {
    void refresh().catch(() => {})
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return entries
    return entries.filter((e) => (e.title + ' ' + e.keywords.join(' ') + ' ' + e.responseText).toLowerCase().includes(q))
  }, [entries, query])

  const startNew = () => setForm(defaultEntry)

  const save = async () => {
    if (!form.title.trim()) return toast({ title: 'Missing title', description: 'Add a title.' })
    if (!form.keywords.length) return toast({ title: 'Missing keywords', description: 'Add at least one keyword.' })
    if (!form.responseText.trim()) return toast({ title: 'Missing response', description: 'Add a response text.' })

    await fetch('/api/bot-faq', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        id: form.id || uid(),
        title: form.title.trim(),
        keywords: form.keywords.map((k) => k.trim()).filter(Boolean),
        responseText: form.responseText.trim(),
        sortOrder: form.sortOrder ?? entries.length + 1,
      }),
    })

    await refresh()
    toast({ title: form.id ? 'Updated' : 'Created', description: form.title.trim() })
    startNew()
  }

  const edit = (entry: BotFaqEntry) => setForm(entry)

  const remove = async (id: string) => {
    await fetch(`/api/bot-faq/${id}`, { method: 'DELETE' })
    await refresh()
    toast({ title: 'Deleted', description: 'Entry removed.' })
    if (form.id === id) startNew()
  }

  const reset = async () => {
    await Promise.all(entries.map((entry) => fetch(`/api/bot-faq/${entry.id}`, { method: 'DELETE' })))
    await refresh()
    toast({ title: 'Cleared', description: 'Bot FAQ list cleared. Add the rules you want.' })
    startNew()
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold">Chatbot FAQ</h2>
          <p className="mt-1 text-sm text-slate-300">Manage keyword-based replies stored in your database.</p>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search..."
            className="w-44 rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white placeholder:text-slate-500 outline-none"
          />
          <button
            onClick={() => void reset()}
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white hover:bg-white/[0.07]"
          >
            <RotateCcw size={16} /> Clear
          </button>
          <button
            onClick={startNew}
            className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-black"
            style={{ background: 'linear-gradient(to right, var(--admin-accent-a), var(--admin-accent-b))' }}
          >
            <Plus size={16} /> New
          </button>
        </div>
      </div>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_420px]">
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="bg-black/25 text-xs text-slate-400">
                <tr>
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Keywords</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((entry) => (
                  <tr key={entry.id} className="border-t border-white/10">
                    <td className="px-4 py-3 text-white font-medium">{entry.title}</td>
                    <td className="px-4 py-3 text-slate-300">{entry.keywords.join(', ')}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => edit(entry)}
                          className="rounded-lg border border-white/10 bg-black/30 px-3 py-1.5 text-xs text-white hover:bg-white/5"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => void remove(entry.id)}
                          className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs text-red-200 hover:bg-red-500/15"
                        >
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
                    <td className="px-4 py-6 text-slate-400" colSpan={3}>
                      No entries found.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
          <h3 className="text-sm font-semibold text-white">{form.id ? 'Edit rule' : 'Create rule'}</h3>
          <div className="mt-4 space-y-3">
            <input
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              placeholder="Title"
              className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white placeholder:text-slate-500 outline-none"
            />
            <input
              value={form.keywords.join(', ')}
              onChange={(e) => setForm((p) => ({ ...p, keywords: e.target.value.split(',').map((x) => x.trim()).filter(Boolean) }))}
              placeholder="Keywords (comma-separated)"
              className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white placeholder:text-slate-500 outline-none"
            />
            <textarea
              value={form.responseText}
              onChange={(e) => setForm((p) => ({ ...p, responseText: e.target.value }))}
              placeholder="Bot response"
              rows={8}
              className="w-full resize-none rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white placeholder:text-slate-500 outline-none"
            />
            <button
              onClick={() => void save()}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-black"
              style={{ background: 'linear-gradient(to right, var(--admin-accent-a), var(--admin-accent-b))' }}
            >
              <Save size={15} /> Save
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
