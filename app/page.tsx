import Link from 'next/link'
import { Sidebar } from '@/components/Sidebar'
import { Header } from '@/components/Header'
import { HeroSection } from '@/components/HeroSection'
import { MoviesSection } from '@/components/MoviesSection'
import { HomeMusicSection } from '@/components/HomeMusicSection'
import { SportsPreviewSection } from '@/components/SportsPreviewSection'

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
          <section className="rounded-2xl border border-white/10 bg-white/5 p-6 md:p-8">
            <div className="flex flex-col gap-3 max-w-3xl">
              <h2 className="text-white text-2xl font-bold">About Streamfy</h2>
              <p className="text-gray-300 text-sm md:text-base">
                Streamfy is your all-in-one entertainment hub for movies, live sports, and trending music.
                Browse freely, then sign in only when you want to use restricted features.
              </p>
              <div className="flex gap-3 pt-2">
                <Link href="/about" className="inline-flex items-center rounded-xl bg-[#f4a30a] px-4 py-2.5 text-black text-sm font-semibold">
                  Learn More
                </Link>
                <Link href="/movies" className="inline-flex items-center rounded-xl border border-white/20 px-4 py-2.5 text-white text-sm font-medium">
                  Start Exploring
                </Link>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}
