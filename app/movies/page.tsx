'use client'

import { Sidebar } from '@/components/Sidebar'
import { Header } from '@/components/Header'
import { MoviesSection } from '@/components/MoviesSection'
import { LiveMomentsBanner } from '@/components/LiveMomentsBanner'
import { SocialShareLinks } from '@/components/SocialShareLinks'

export default function MoviesPage() {
  return (
    <div className="flex min-h-screen bg-black">
      <Sidebar />
      <div className="ml-[92px] w-[calc(100vw-92px)] min-h-[100dvh] overflow-x-hidden pb-8">
        <Header />
        <main className="px-6">
          <div className="mb-5">
            <LiveMomentsBanner section="movies" />
          </div>
          <div className="mb-5 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
            <SocialShareLinks title="Share Movies Page" />
          </div>
          <MoviesSection />
        </main>
      </div>
    </div>
  )
}
