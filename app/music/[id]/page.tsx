'use client'

import Link from 'next/link'
import { useMemo } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import { ChevronLeft, Play } from 'lucide-react'
import { Sidebar } from '@/components/Sidebar'
import { Header } from '@/components/Header'
import { getTrackById, musicTracks } from '@/lib/music-data'
import { MusicPlayer } from '@/components/MusicPlayer'
import { useAuth } from '@/components/AuthProvider'
import { SocialShareLinks } from '@/components/SocialShareLinks'
import { useAppSettings } from '@/components/AppSettingsProvider'
import { getTranslation } from '@/lib/translations'

export default function MusicDetailPage() {
  const params = useParams<{ id: string }>()
  const track = useMemo(() => getTrackById(params.id), [params.id])
  const { requireAuth } = useAuth()
  const { settings } = useAppSettings()
  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(settings.language, key)

  if (!track) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        {t('trackNotFound')}
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-black">
      <Sidebar />

      <div className="ml-[92px] w-[calc(100vw-92px)] min-h-[100dvh] overflow-x-hidden pb-24">
        <Header />
        <main className="px-6 flex flex-col gap-6">
          <Link href="/music" className="inline-flex items-center gap-2 text-gray-300 hover:text-white text-sm">
            <ChevronLeft size={14} />
            {t('backToMusic')}
          </Link>

          <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
            <SocialShareLinks title={t('shareThisTrack')} />
          </section>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 flex gap-5">
            <div className="relative w-52 h-52 rounded-xl overflow-hidden">
              <Image src={track.image} alt={track.title} fill className="object-cover" />
            </div>
            <div className="flex flex-col justify-center">
              <h1 className="text-white text-3xl font-bold">{track.title}</h1>
              <p className="text-gray-400 mt-2">{track.artist} • {track.genre} • {track.duration}</p>
              <button
                onClick={() => requireAuth(() => {}, t('authSigninPrompt'))}
                className="mt-6 inline-flex items-center gap-2 bg-[#f4a30a] text-black px-4 py-2.5 rounded-xl font-semibold w-fit"
              >
                <Play size={16} fill="black" />
                {t('playNow')}
              </button>
            </div>
          </div>

          <section>
            <h2 className="text-white text-xl font-bold mb-3">{t('playlistTitle')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {musicTracks.map((song) => (
                <Link key={song.id} href={`/music/${song.id}`} className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 hover:bg-white/10">
                  <p className="text-white text-sm font-medium">{song.title}</p>
                  <p className="text-gray-400 text-xs">{song.artist} • {song.duration}</p>
                </Link>
              ))}
            </div>
          </section>
        </main>
        <MusicPlayer />
      </div>
    </div>
  )
}
