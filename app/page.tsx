import { Sidebar } from '@/components/Sidebar'
import { Header } from '@/components/Header'
import { HeroSection } from '@/components/HeroSection'
import { MoviesSection } from '@/components/MoviesSection'
import { HomeMusicSection } from '@/components/HomeMusicSection'
import { SportsPreviewSection } from '@/components/SportsPreviewSection'
import { AboutStreamfySection } from '@/components/AboutStreamfySection'

export default function Home() {
  return (
    <div className="flex min-h-screen bg-black">
      <Sidebar />
      <div className="ml-[92px] w-[calc(100vw-92px)] min-h-[100dvh] overflow-x-hidden pb-8">
        <Header />
        <main className="flex flex-col gap-8 px-6">
          <HeroSection />
          <MoviesSection />
          <HomeMusicSection />
          <SportsPreviewSection />
          <AboutStreamfySection />
        </main>
      </div>
    </div>
  )
}
