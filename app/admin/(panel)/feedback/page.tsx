'use client'

import { useMemo } from 'react'
import { MessageSquareText } from 'lucide-react'
import { useChat } from '@/hooks/useChat'
import { getRoomThreadId } from '@/lib/chat-store'
import { BRAND_NAME } from '@/lib/brand'

const ROOM_ID = 'room-feedback'

export default function AdminFeedbackPage() {
  const { messages, rooms, deleteMessage } = useChat(ROOM_ID)

  const feedback = useMemo(() => {
    const room = rooms.find((item) => item.id === ROOM_ID)
    const tid = getRoomThreadId(room?.slug ?? 'feedback')
    return messages
      .filter((m) => m.threadId === tid)
      .slice()
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }, [messages, rooms])

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold">Feedback</h2>
          <p className="mt-1 text-sm text-slate-300">Messages sent to {BRAND_NAME} Support from the Chat feedback portal.</p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-slate-200">
          <MessageSquareText size={16} className="text-[color:var(--admin-accent-a)]" />
          {feedback.length} items
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead className="bg-black/25 text-xs text-slate-400">
              <tr>
                <th className="px-4 py-3">From</th>
                <th className="px-4 py-3">Message</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {feedback.map((m) => (
                <tr key={m.id} className="border-t border-white/10 align-top">
                  <td className="px-4 py-3 text-white font-medium">{m.senderName || 'Anonymous user'}</td>
                  <td className="px-4 py-3 text-slate-200">{m.text}</td>
                  <td className="px-4 py-3 text-slate-300">{new Date(m.createdAt).toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => void deleteMessage(m.id)}
                      className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs text-red-200 hover:bg-red-500/15"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {feedback.length === 0 ? (
                <tr className="border-t border-white/10">
                  <td className="px-4 py-6 text-slate-400" colSpan={4}>
                    No feedback yet.
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
