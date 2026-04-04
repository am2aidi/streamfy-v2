'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { authHeaders } from '@/lib/auth-client'
import type { ChatMessage, ChatRoom } from '@/lib/chat-store'

export function useChat(roomId = 'room-feedback') {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [rooms, setRooms] = useState<ChatRoom[]>([])
  const [loaded, setLoaded] = useState(false)

  const refresh = useCallback(async () => {
    const [roomsRes, messagesRes] = await Promise.all([
      fetch('/api/chat/rooms', { cache: 'no-store' }),
      fetch(`/api/chat/messages?roomId=${encodeURIComponent(roomId)}`, { cache: 'no-store' }),
    ])

    if (!roomsRes.ok || !messagesRes.ok) throw new Error('Failed to load chat')

    const roomsData = (await roomsRes.json()) as { items: ChatRoom[] }
    const messagesData = (await messagesRes.json()) as { items: ChatMessage[] }
    setRooms(roomsData.items)
    setMessages(messagesData.items)
  }, [roomId])

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      try {
        await refresh()
      } catch {
        // ignore for now
      } finally {
        if (!cancelled) setLoaded(true)
      }
    }

    void load()
    const timer = window.setInterval(() => {
      void refresh().catch(() => {})
    }, 5000)

    return () => {
      cancelled = true
      window.clearInterval(timer)
    }
  }, [refresh])

  return useMemo(
    () => ({
      messages,
      rooms,
      loaded,
      sendRoom: async (targetRoomId: string, fromUserId: string, text: string) => {
        await fetch('/api/chat/messages', {
          method: 'POST',
          headers: { 'content-type': 'application/json', ...authHeaders() },
          body: JSON.stringify({ roomId: targetRoomId, fromUserId, text }),
        })
        await refresh()
      },
      deleteMessage: async (messageId: string) => {
        await fetch(`/api/chat/messages/${messageId}`, { method: 'DELETE' })
        await refresh()
      },
      refresh,
    }),
    [loaded, messages, refresh, rooms],
  )
}
