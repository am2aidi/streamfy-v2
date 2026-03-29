'use client'

import { useEffect, useMemo, useState } from 'react'
import { Bot, Send, UserSearch, Users as UsersIcon } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { Sidebar } from '@/components/Sidebar'
import { Header } from '@/components/Header'
import { useAuth } from '@/components/AuthProvider'
import { useAppSettings } from '@/components/AppSettingsProvider'
import { useChat } from '@/hooks/useChat'
import { useToast } from '@/hooks/use-toast'
import { BRAND_NAME } from '@/lib/brand'
import { getRoomThreadId, getThreadId } from '@/lib/chat-store'
import { internalizeLinks, isTextAllowed } from '@/lib/link-guard'
import { getBotReply, type BotQuickReply } from '@/lib/streamfy-bot'
import { getTranslation } from '@/lib/translations'
import { listPublicUsers, subscribeToUsers, type PublicUser } from '@/lib/users-store'

type ActiveTarget =
  | { kind: 'room'; roomId: string }
  | { kind: 'dm'; userId: string }

const ROOMS = [{ id: 'feedback', name: 'Feedback Room', description: 'Share ideas, report issues, and request features.' }] as const
const BOT_USER: PublicUser = { id: 'u-bot', name: `${BRAND_NAME} Bot`, username: 'cinepro_bot' }

export function ChatClient() {
  const params = useSearchParams()
  const { user, isAuthenticated, openSignIn } = useAuth()
  const { messages, send, sendRoom } = useChat()
  const { settings } = useAppSettings()
  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(settings.language, key)
  const { toast } = useToast()

  const [users, setUsers] = useState(() => listPublicUsers())
  const [query, setQuery] = useState('')
  const [active, setActive] = useState<ActiveTarget>({ kind: 'room', roomId: 'feedback' })
  const [text, setText] = useState('')
  const [botReplies, setBotReplies] = useState<BotQuickReply[]>([])

  useEffect(() => subscribeToUsers(() => setUsers(listPublicUsers())), [])

  useEffect(() => {
    const next = params.get('u')
    if (next) setActive({ kind: 'dm', userId: next })
  }, [params])

  const me = user?.id ?? ''

  const usersWithBot = useMemo(() => {
    const base = users.filter((u) => u.id !== me)
    return base.some((u) => u.id === BOT_USER.id) ? base : [BOT_USER, ...base]
  }, [users, me])

  const filteredUsers = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return usersWithBot
    return usersWithBot.filter((u) => (u.name + ' ' + (u.username ?? '') + ' ' + (u.email ?? '') + ' ' + (u.phone ?? '')).toLowerCase().includes(q))
  }, [usersWithBot, query])

  const userById = useMemo(() => {
    const map = new Map<string, PublicUser>()
    for (const u of [...usersWithBot, { id: me, name: user?.name || (user?.username ? `@${user.username}` : 'Me'), username: user?.username, email: user?.email, phone: user?.phone }]) {
      if (u.id) map.set(u.id, u)
    }
    return map
  }, [usersWithBot, me, user])

  const activeTitle = useMemo(() => {
    if (active.kind === 'room') return ROOMS.find((r) => r.id === active.roomId)?.name ?? 'Room'
    const u = userById.get(active.userId)
    return u ? u.name : 'Chat'
  }, [active, userById])

  const activeMeta = useMemo(() => {
    if (active.kind === 'room') return ROOMS.find((r) => r.id === active.roomId)?.description ?? ''
    const u = userById.get(active.userId)
    return u ? (u.username ? `@${u.username}` : u.email || u.phone || u.id) : ''
  }, [active, userById])

  const activeThreadId = useMemo(() => {
    if (!me) return ''
    if (active.kind === 'room') return getRoomThreadId(active.roomId)
    return getThreadId(me, active.userId)
  }, [active, me])

  const threadMessages = useMemo(() => {
    if (!activeThreadId) return []
    return messages
      .filter((m) => m.threadId === activeThreadId)
      .slice()
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
  }, [messages, activeThreadId])

  const lastTextForThread = (threadId: string) => {
    const msg = messages.find((m) => m.threadId === threadId)
    return msg ? msg.text : ''
  }

  const sendNow = (nextText: string) => {
    if (!me) return
    const trimmed = nextText.trim()
    if (!trimmed) return
    if (!isTextAllowed(trimmed)) {
      toast({ title: 'Link blocked', description: `Only ${BRAND_NAME} links are allowed (no external links).` })
      return
    }

    if (active.kind === 'room') {
      sendRoom(active.roomId, me, trimmed)
      setText('')
      return
    }

    send(me, active.userId, trimmed)
    setText('')

    if (active.userId === BOT_USER.id) {
      const reply = getBotReply(trimmed)
      if (reply) {
        send(BOT_USER.id, me, reply.text)
        setBotReplies(reply.quickReplies ?? [])
      }
    }
  }

  return (
    <div className="flex min-h-screen bg-black">
      <Sidebar />
      <div className="w-full md:ml-[92px] md:w-[calc(100vw-92px)] min-h-[100dvh] overflow-x-hidden pb-24 md:pb-8">
        <Header />

        <main className="px-6">
          <div className="mb-5">
            <h1 className="text-white text-3xl font-bold">{t('chat')}</h1>
            <p className="text-gray-400 text-sm mt-1">Messages auto-delete after 2 weeks.</p>
          </div>

          {!isAuthenticated ? (
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 text-gray-200">
              <p>You’re in Guest mode. Sign in to chat.</p>
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
                    {ROOMS.map((r) => {
                      const tid = getRoomThreadId(r.id)
                      const activeRoom = active.kind === 'room' && active.roomId === r.id
                      return (
                        <button
                          key={r.id}
                          onClick={() => setActive({ kind: 'room', roomId: r.id })}
                          className={`w-full rounded-2xl border px-3 py-3 text-left transition-colors ${
                            activeRoom ? 'border-[color:var(--app-accent-a)]/40 bg-white/[0.06]' : 'border-white/10 bg-black/25 hover:bg-white/[0.04]'
                          }`}
                        >
                          <p className="text-white text-sm font-semibold inline-flex items-center gap-2">
                            <UsersIcon size={16} className="text-white/70" />
                            {r.name}
                          </p>
                          <p className="mt-1 text-xs text-gray-400 line-clamp-1">{lastTextForThread(tid) || r.description}</p>
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div className="mt-4 relative">
                  <UserSearch size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/45" />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search users..."
                    className="w-full rounded-2xl border border-white/10 bg-black/35 py-3 pl-10 pr-4 text-sm text-white placeholder:text-white/35 outline-none"
                  />
                </div>

                <div className="mt-3 space-y-2">
                  {filteredUsers.map((u) => {
                    const tid = me ? getThreadId(me, u.id) : ''
                    const activeDm = active.kind === 'dm' && active.userId === u.id
                    return (
                      <button
                        key={u.id}
                        onClick={() => setActive({ kind: 'dm', userId: u.id })}
                        className={`w-full rounded-2xl border px-3 py-3 text-left transition-colors ${
                          activeDm ? 'border-[color:var(--app-accent-a)]/40 bg-white/[0.06]' : 'border-white/10 bg-black/25 hover:bg-white/[0.04]'
                        }`}
                      >
                        <p className="text-white text-sm font-semibold inline-flex items-center gap-2">
                          {u.id === BOT_USER.id ? <Bot size={16} className="text-white/70" /> : null}
                          {u.name}
                          {u.username ? <span className="text-xs text-white/45">@{u.username}</span> : null}
                        </p>
                        <p className="mt-1 text-xs text-gray-400 line-clamp-1">{(tid && lastTextForThread(tid)) || u.email || u.phone || 'No messages yet'}</p>
                      </button>
                    )
                  })}
                  {filteredUsers.length === 0 ? <p className="text-sm text-gray-400">No users found.</p> : null}
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
                <div className="mb-3 rounded-2xl border border-white/10 bg-black/25 px-4 py-3">
                  <p className="text-white font-semibold">{activeTitle}</p>
                  <p className="text-xs text-gray-400">{activeMeta}</p>
                  {active.kind === 'room' ? (
                    <p className="mt-2 text-xs text-gray-300">Group chat: everyone can post. Keep it respectful.</p>
                  ) : active.userId === BOT_USER.id ? (
                    <p className="mt-2 text-xs text-gray-300">Non‑AI helper bot. Ask about downloads, watchlist, plans, and reporting issues.</p>
                  ) : null}
                </div>

                <div className="flex h-[70vh] flex-col">
                  <div className="flex-1 overflow-y-auto rounded-2xl border border-white/10 bg-black/25 p-4">
                    <div className="space-y-2">
                      {threadMessages.map((m) => {
                        const mine = m.fromUserId === me
                        const sender = userById.get(m.fromUserId)
                        return (
                          <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                            <div
                              className={`max-w-[78%] rounded-2xl px-4 py-2.5 text-sm ${
                                mine ? 'bg-[color:var(--app-accent-a)]/15 text-white border border-[color:var(--app-accent-a)]/30' : 'bg-white/[0.04] text-gray-100 border border-white/10'
                              }`}
                            >
                              {!mine && active.kind === 'room' ? (
                                <div className="mb-1 text-[10px] text-white/55">{sender?.username ? `@${sender.username}` : sender?.name ?? m.fromUserId}</div>
                              ) : null}
                              <div className="whitespace-pre-line">{internalizeLinks(m.text)}</div>
                              <div className="mt-1 text-[10px] text-white/45">{new Date(m.createdAt).toLocaleString()}</div>
                            </div>
                          </div>
                        )
                      })}
                      {threadMessages.length === 0 ? <p className="text-sm text-gray-400">No messages yet. Say hi.</p> : null}
                    </div>
                  </div>

                  {active.kind === 'dm' && active.userId === BOT_USER.id && botReplies.length ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {botReplies.map((r) => (
                        <button
                          key={r.id}
                          onClick={() => sendNow(r.text)}
                          className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-xs text-gray-200 hover:bg-white/[0.06]"
                        >
                          {r.label}
                        </button>
                      ))}
                    </div>
                  ) : null}

                  <div className="mt-3 flex items-center gap-2">
                    <input
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key !== 'Enter') return
                        sendNow(text)
                      }}
                      placeholder={active.kind === 'room' ? 'Write to the room…' : 'Type a message…'}
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

