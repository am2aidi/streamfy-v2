import { Suspense } from 'react'
import { Sidebar } from '@/components/Sidebar'
import { Header } from '@/components/Header'
import { ChatClient } from '@/app/chat/ChatClient'

export default function ChatPage() {
  // `useSearchParams` requires a Suspense boundary to avoid failing static prerender/export.
  // This keeps `/chat` deployable even when `output: 'export'` is enabled.
  return (
    <Suspense fallback={<ChatPageFallback />}>
      <ChatClient />
    </Suspense>
  )
}

function ChatPageFallback() {
  return (
    <div className="flex min-h-screen bg-black">
      <Sidebar />
      <div className="w-full md:ml-[92px] md:w-[calc(100vw-92px)] min-h-[100dvh] overflow-x-hidden pb-24 md:pb-8">
        <Header />
        <main className="px-6">
          <div className="mb-5">
            <h1 className="text-white text-3xl font-bold">Chat</h1>
            <p className="text-gray-400 text-sm mt-1">Loading...</p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 text-gray-200">
            <p>Loading chat...</p>
          </div>
        </main>
      </div>
    </div>
  )
}
