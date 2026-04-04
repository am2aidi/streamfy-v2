'use client'

import { useMemo, useState } from 'react'
import { Send, Users as UsersIcon } from 'lucide-react'
import { Sidebar } from '@/components/Sidebar'
import { Header } from '@/components/Header'
import { useAuth } from '@/components/AuthProvider'
import { useAppSettings } from '@/components/AppSettingsProvider'
import { useChat } from '@/hooks/useChat'
import { useToast } from '@/hooks/use-toast'
import { BRAND_NAME } from '@/lib/brand'
import { getRoomThreadId } from '@/lib/chat-store'
import { internalizeLinks, isTextAllowed } from '@/lib/link-guard'
import { getTranslation } from '@/lib/translations'

const ROOM_ID = 'room-feedback'

export function ChatClient() {
  const { user, isAuthenticated, openSignIn } = useAuth()
  const { messages, rooms, sendRoom, loaded } = useChat(ROOM_ID)
  const { settings } = useAppSettings()
  const { toast } = useToast()
  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(settings.language, key)

  const [text, setText] = useState('')

  const me = user?.id ?? ''

  const currentRoom = rooms.find((room) => room.id === ROOM_ID) ?? {
    id: ROOM_ID,
    slug: 'feedback',
    name: 'Feedback Room',
    description: 'Share ideas, report issues, and request features.',
    isAnonymous: true,
    retentionDays: 30,
  }

  const roomThreadId = useMemo(() => getRoomThreadId(currentRoom.slug), [currentRoom.slug])

  const roomMessages = useMemo(() => {
    if (!roomThreadId) return []
    return messages
      .filter((m) => m.threadId === roomThreadId)
      .slice()
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
  }, [messages, roomThreadId])

  const lastTextForRoom = useMemo(() => roomMessages[roomMessages.length - 1]?.text ?? '', [roomMessages])

  const sendNow = (nextText: string) => {
    if (!me) return
    const trimmed = nextText.trim()
    if (!trimmed) return
    if (!isTextAllowed(trimmed)) {
      toast({ title: 'Link blocked', description: `Only ${BRAND_NAME} links are allowed (no external links).` })
      return
    }

    void sendRoom(ROOM_ID, me, trimmed)
    setText('')
  }

  return (
    <div className="flex min-h-screen bg-black">
      <Sidebar />
      <div className="w-full md:ml-[92px] md:w-[calc(100vw-92px)] min-h-[100dvh] overflow-x-hidden pb-24 md:pb-8">
        <Header />

        <main className="px-6">
          <div className="mb-5">
            <h1 className="text-white text-3xl font-bold">{t('chat')}</h1>
            <p className="text-gray-400 text-sm mt-1">Messages auto-delete after 30 days.</p>
          </div>

          {!isAuthenticated ? (
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 text-gray-200">
              <p>You&apos;re in Guest mode. Sign in to chat.</p>
              <button
                onClick={() => openSignIn('Sign in to chat')}
                className="mt-4 rounded-xl px-4 py-2.5 text-sm font-semibold text-[color:var(--app-accent-fg)]"
                style={{ backgroundImage: 'linear-gradient(135deg, var(--app-accent-a), var(--app-accent-b))' }}
              >
                Sign in
              </button>
            </div>
          ) : (
            <section className="grid grid-cols-1 gap-4 lg:grid-cols-[360px_1fr]">
              <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
                <div className="rounded-2xl border border-white/10 bg-black/25 p-3">
                  <p className="text-xs uppercase tracking-[0.22em] text-white/45">Rooms</p>
                  <div className="mt-2 space-y-2">
                    {(rooms.length ? rooms : [currentRoom]).map((r) => {
                      const activeRoom = r.id === ROOM_ID
                      return (
                        <button
                          key={r.id}
                          onClick={() => toast({ title: r.name, description: r.description })}
                          className={`w-full rounded-2xl border px-3 py-3 text-left transition-colors ${
                            activeRoom ? 'border-[color:var(--app-accent-a)]/40 bg-white/[0.06]' : 'border-white/10 bg-black/25 hover:bg-white/[0.04]'
                          }`}
                        >
                          <p className="text-white text-sm font-semibold inline-flex items-center gap-2">
                            <UsersIcon size={16} className="text-white/70" />
                            {r.name}
                          </p>
                          <p className="mt-1 text-xs text-gray-400 line-clamp-1">{(activeRoom ? lastTextForRoom : '') || r.description}</p>
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div className="mt-4 rounded-2xl border border-white/10 bg-black/25 p-4">
                  <p className="text-sm font-semibold text-white">Anonymous group chat</p>
                  <p className="mt-1 text-xs text-gray-300">Users can&apos;t see other users. Only messages are shown.</p>
                  <p className="mt-2 text-xs text-gray-400">Use this for feedback and sharing ideas. Messages stay for 30 days.</p>
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
                <div className="mb-3 rounded-2xl border border-white/10 bg-black/25 px-4 py-3">
                  <p className="text-white font-semibold">{currentRoom.name}</p>
                  <p className="text-xs text-gray-400">{currentRoom.description}</p>
                  <p className="mt-2 text-xs text-gray-300">Group chat for feedback. Keep it respectful.</p>
                </div>

                <div className="flex h-[70vh] flex-col">
                  <div className="flex-1 overflow-y-auto rounded-2xl border border-white/10 bg-black/25 p-4">
                    <div className="space-y-2">
                      {roomMessages.map((m) => {
                        const mine = m.fromUserId === me
                        return (
                          <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                            <div
                              className={`max-w-[78%] rounded-2xl px-4 py-2.5 text-sm ${
                                mine ? 'bg-[color:var(--app-accent-a)]/15 text-white border border-[color:var(--app-accent-a)]/30' : 'bg-white/[0.04] text-gray-100 border border-white/10'
                              }`}
                            >
                              <div className="whitespace-pre-line">{internalizeLinks(m.text)}</div>
                              <div className="mt-1 text-[10px] text-white/45">{new Date(m.createdAt).toLocaleString()}</div>
                            </div>
                          </div>
                        )
                      })}
                      {!loaded ? <p className="text-sm text-gray-400">Loading messages...</p> : null}
                      {loaded && roomMessages.length === 0 ? <p className="text-sm text-gray-400">No messages yet. Say hi.</p> : null}
                    </div>
                  </div>

                  <div className="mt-3 flex items-center gap-2">
                    <input
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key !== 'Enter') return
                        sendNow(text)
                      }}
                      placeholder="Write to the room..."
                      className="flex-1 rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-sm text-white placeholder:text-white/35 outline-none"
                    />
                    <button
                      onClick={() => sendNow(text)}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold text-[color:var(--app-accent-fg)]"
                      style={{ backgroundImage: 'linear-gradient(135deg, var(--app-accent-a), var(--app-accent-b))' }}
                      aria-label="Send"
                    >
                      <Send size={16} />
                      Send
                    </button>
                  </div>
                </div>
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  )
}
