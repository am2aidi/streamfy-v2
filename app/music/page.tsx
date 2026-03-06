'use client'

import { Sidebar } from '@/components/Sidebar'
import { Header } from '@/components/Header'
import { MusicSection } from '@/components/MusicSection'
import { MusicPlayer } from '@/components/MusicPlayer'
import { Music, Star } from 'lucide-react'
import Link from 'next/link'
import { musicTracks } from '@/lib/music-data'
import Image from 'next/image'
import { useAppSettings } from '@/components/AppSettingsProvider'
import { useState } from 'react'
import { LiveMomentsBanner } from '@/components/LiveMomentsBanner'
import { SocialShareLinks } from '@/components/SocialShareLinks'

export default function MusicPage() {
  const { settings, updateSetting } = useAppSettings()
  const [favoritesOnly, setFavoritesOnly] = useState(false)

  const filteredTracks = settings.favoriteTracks && favoritesOnly
    ? musicTracks.filter((t) => settings.favoriteTracks.includes(t.id))
    : musicTracks

  return (
    <div className="flex min-h-screen bg-black">
      <Sidebar />

      <div className="ml-[92px] w-[calc(100vw-92px)] min-h-[100dvh] overflow-x-hidden pb-24">
        <Header />

        <main className="flex flex-col gap-8 px-6">
          <LiveMomentsBanner section="music" />
          <div>
            <h2 className="text-white text-2xl font-bold">Music</h2>
            <p className="text-gray-400 text-sm mt-1">Explore trending tracks and new releases</p>
          </div>

          <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
            <SocialShareLinks title="Share Music Page" />
          </section>

          <MusicSection />

          <section className="flex flex-col gap-4">
            <h3 className="text-white text-xl font-bold">All Tracks</h3>
            <div className="flex items-center gap-2 mb-2">
            <label className="flex items-center gap-1 text-gray-400 text-sm">
              <input type="checkbox" className="accent-[#f4a30a]" checked={favoritesOnly} onChange={(e) => setFavoritesOnly(e.target.checked)} />
              Favorites only
            </label>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredTracks.map((track) => (
                <div key={track.id} className="group relative rounded-xl overflow-hidden border border-white/10 bg-white/5">
                  <Link href={`/music/${track.id}`} className="block">
                    <div className="relative h-56">
                      <Image src={track.image} alt={track.title} fill className="object-cover transition-transform duration-500 group-hover:scale-110" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent" />
                      <div className="absolute bottom-3 left-3 right-3">
                        <p className="text-white text-sm font-semibold">{track.title}</p>
                        <p className="text-gray-400 text-xs">{track.artist} • {track.genre}</p>
                      </div>
                    </div>
                  </Link>
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      const isFav = settings.favoriteTracks.includes(track.id)
                      const next = isFav
                        ? settings.favoriteTracks.filter((id) => id !== track.id)
                        : [...settings.favoriteTracks, track.id]
                      updateSetting('favoriteTracks', next)
                    }}
                    className="absolute top-2 right-2 text-white/70 hover:text-[#f4a30a]"
                    aria-label={settings.favoriteTracks.includes(track.id) ? 'Unfavorite' : 'Favorite'}
                  >
                    <Star size={18} fill={settings.favoriteTracks.includes(track.id) ? '#f4a30a' : 'transparent'} />
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Additional Music Collections */}
          <section className="flex flex-col gap-4">
            <h3 className="text-white text-xl font-bold">For You</h3>
            <div className="grid grid-cols-3 gap-4">
              {[
                { title: 'Workout Beats', desc: 'High energy music for your fitness routine' },
                { title: 'Chill Vibes', desc: 'Relaxing music for everyday moments' },
                { title: 'Party Mix', desc: 'The hottest tracks to get the party started' },
              ].map((playlist, i) => (
                <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/10 transition-colors cursor-pointer">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#f4a30a] to-[#e67e22] flex items-center justify-center text-white mb-3">
                    <Music size={20} />
                  </div>
                  <h4 className="text-white font-medium text-sm">{playlist.title}</h4>
                  <p className="text-gray-400 text-xs mt-1">{playlist.desc}</p>
                </div>
              ))}
            </div>
          </section>
        </main>

        <MusicPlayer />
      </div>
    </div>
  )
}
