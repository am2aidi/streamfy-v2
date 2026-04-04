export interface ChatMessage {
  id: string
  threadId: string
  roomId?: string
  fromUserId: string
  toUserId?: string
  text: string
  createdAt: string
  expiresAt?: string
  senderName?: string
}

export interface ChatRoom {
  id: string
  slug: string
  name: string
  description: string
  isAnonymous: boolean
  retentionDays: number
}

export const CHAT_RETENTION_DAYS = 30

export function getThreadId(a: string, b: string) {
  return [a, b].sort().join('__')
}

export function getRoomThreadId(roomId: string) {
  return `room__${roomId}`
}
