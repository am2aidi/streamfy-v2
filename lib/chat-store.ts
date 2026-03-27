import { dispatchAppEvent, readJson, subscribeToKey, writeJson } from '@/lib/local-store'

export interface ChatMessage {
  id: string
  threadId: string
  fromUserId: string
  toUserId: string
  text: string
  createdAt: string
}

const MESSAGES_KEY = 'streamfy-chat-messages'
const EVENT_NAME = 'streamfy:chat-updated'
const TWO_WEEKS_MS = 14 * 24 * 60 * 60 * 1000

function uid(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

export function getThreadId(a: string, b: string) {
  return [a, b].sort().join('__')
}

export function getRoomThreadId(roomId: string) {
  return `room__${roomId}`
}

function prune(messages: ChatMessage[]) {
  const cutoff = Date.now() - TWO_WEEKS_MS
  return messages.filter((m) => {
    const t = new Date(m.createdAt).getTime()
    return Number.isFinite(t) && t >= cutoff
  })
}

export function getChatMessages() {
  return prune(readJson<ChatMessage[]>(MESSAGES_KEY, []))
}

export function setChatMessages(messages: ChatMessage[]) {
  writeJson(MESSAGES_KEY, prune(messages))
  dispatchAppEvent(EVENT_NAME)
}

export function subscribeToChat(callback: () => void) {
  return subscribeToKey(MESSAGES_KEY, EVENT_NAME, callback)
}

export function cleanupOldMessages() {
  const current = readJson<ChatMessage[]>(MESSAGES_KEY, [])
  const next = prune(current)
  if (next.length === current.length) return
  writeJson(MESSAGES_KEY, next)
  dispatchAppEvent(EVENT_NAME)
}

export function sendChatMessage(fromUserId: string, toUserId: string, text: string) {
  const trimmed = text.trim()
  if (!trimmed) return
  const message: ChatMessage = {
    id: uid('msg'),
    threadId: getThreadId(fromUserId, toUserId),
    fromUserId,
    toUserId,
    text: trimmed,
    createdAt: new Date().toISOString(),
  }
  setChatMessages([message, ...getChatMessages()])
}

export function sendRoomMessage(roomId: string, fromUserId: string, text: string) {
  const trimmed = text.trim()
  if (!trimmed) return
  const message: ChatMessage = {
    id: uid('room'),
    threadId: getRoomThreadId(roomId),
    fromUserId,
    toUserId: roomId,
    text: trimmed,
    createdAt: new Date().toISOString(),
  }
  setChatMessages([message, ...getChatMessages()])
}
