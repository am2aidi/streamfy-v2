import { Suspense } from 'react'
import { Sidebar } from '@/components/Sidebar'
import { Header } from '@/components/Header'
import { SearchClient } from '@/app/search/SearchClient'

export default function SearchPage() {
  // `useSearchParams` requires a Suspense boundary to avoid failing static prerender/export.
  return (
    <Suspense fallback={<SearchPageFallback />}>
      <SearchClient />
    </Suspense>
  )
}

function SearchPageFallback() {
  return (
    <div className="flex min-h-screen bg-black">
      <Sidebar />
      <div className="w-full md:ml-[92px] md:w-[calc(100vw-92px)] min-h-[100dvh] overflow-x-hidden pb-24 md:pb-8">
        <Header />
        <main className="px-6">
          <div>
            <h1 className="text-white text-3xl font-bold">Search</h1>
            <p className="text-gray-400 text-sm mt-1">Loading...</p>
          </div>
        </main>
      </div>
    </div>
  )
}

