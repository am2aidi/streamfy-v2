import { Sidebar } from '@/components/Sidebar'
import { Header } from '@/components/Header'
import { HeroSection } from '@/components/HeroSection'
import { MoviesSection } from '@/components/MoviesSection'
import { HomeMusicSection } from '@/components/HomeMusicSection'
import { SportsPreviewSection } from '@/components/SportsPreviewSection'
import { AboutStreamfySection } from '@/components/AboutStreamfySection'
import { CommunityShelf } from '@/components/community/CommunityShelf'
import { ShortsShelf } from '@/components/shorts/ShortsShelf'

export default function Home() {
  return (
    <div className="flex min-h-screen bg-black">
      <Sidebar />
      <div className="w-full md:ml-[92px] md:w-[calc(100vw-92px)] min-h-[100dvh] overflow-x-hidden pb-24 md:pb-8">
        <Header />
        <main className="flex flex-col gap-8 px-6">
          <HeroSection />
          <CommunityShelf />
          <ShortsShelf title="Trailers" subtitle="Hover to preview. Click to play." category="movies" limit={4} />
          <MoviesSection />
          <ShortsShelf title="Music Reels" subtitle="Hover snippets and highlights." category="music" limit={4} />
          <HomeMusicSection />
          <ShortsShelf title="Sports Clips" subtitle="Hover match moments." category="sports" limit={4} />
          <SportsPreviewSection />
          <AboutStreamfySection />
        </main>
      </div>
    </div>
  )
}
