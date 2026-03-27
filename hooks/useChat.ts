'use client'

import { useEffect, useMemo, useState } from 'react'
import type { ChatMessage } from '@/lib/chat-store'
import { cleanupOldMessages, getChatMessages, sendChatMessage, sendRoomMessage, subscribeToChat } from '@/lib/chat-store'

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>(() => getChatMessages())

  useEffect(() => {
    cleanupOldMessages()
    return subscribeToChat(() => {
      cleanupOldMessages()
      setMessages(getChatMessages())
    })
  }, [])

  return useMemo(
    () => ({
      messages,
      send: sendChatMessage,
      sendRoom: sendRoomMessage,
    }),
    [messages],
  )
}
