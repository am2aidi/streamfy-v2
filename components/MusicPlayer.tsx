'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Play, Pause, SkipBack, SkipForward, Volume2, Settings, MessageCircle, Maximize2, Radio, Shuffle, Repeat } from 'lucide-react'
import { useAuth } from '@/components/AuthProvider'
import { useAppSettings } from '@/components/AppSettingsProvider'
import { getTranslation } from '@/lib/translations'

export function MusicPlayer() {
  const { requireAuth } = useAuth()
  const { settings } = useAppSettings()
  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(settings.language, key)
  const tracks = useMemo(
    () => [
      {
        title: 'Before you Go',
        artist: 'Lewis Capaldi',
        url: 'https://samplelib.com/lib/preview/mp3/sample-3s.mp3',
      },
      {
        title: 'Golden Hour',
        artist: 'JVKE',
        url: 'https://samplelib.com/lib/preview/mp3/sample-6s.mp3',
      },
      {
        title: 'Blinding Lights',
        artist: 'The Weeknd',
        url: 'https://samplelib.com/lib/preview/mp3/sample-12s.mp3',
      },
    ],
    []
  )
  const [index, setIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(0.7)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    const audio = new Audio(tracks[index].url)
    audioRef.current = audio
    audio.volume = volume
    audio.onloadedmetadata = () => setDuration(audio.duration || 0)
    audio.ontimeupdate = () => setProgress(audio.currentTime)
    audio.onended = () => setIsPlaying(false)
    if (isPlaying) void audio.play()
    return () => {
      audio.pause()
      audioRef.current = null
    }
  }, [index, tracks, isPlaying, volume])

  useEffect(() => {
    if (!audioRef.current) return
    audioRef.current.volume = volume
  }, [volume])

  const togglePlay = async () => {
    requireAuth(
      async () => {
        const audio = audioRef.current
        if (!audio) return
        if (isPlaying) {
          audio.pause()
          setIsPlaying(false)
          return
        }
        await audio.play()
        setIsPlaying(true)
      },
      t('authSigninPrompt')
    )
  }

  const fmt = (value: number) => {
    const mins = Math.floor(value / 60)
    const secs = Math.floor(value % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const progressPct = duration ? (progress / duration) * 100 : 0

  return (
    <div className="fixed bottom-0 left-[220px] right-0 z-50 bg-black/95 backdrop-blur-md border-t border-white/10">
      <div className="flex flex-col">
        {/* Progress Bar */}
        <div className="flex items-center gap-3 px-6 pt-2">
          <span className="text-gray-400 text-xs w-10 text-right">{fmt(progress)}</span>
          <div
            className="flex-1 h-1 bg-white/10 rounded-full relative group cursor-pointer"
            onClick={(e) => {
              const target = e.currentTarget.getBoundingClientRect()
              const pct = (e.clientX - target.left) / target.width
              const next = pct * duration
              if (audioRef.current && Number.isFinite(next)) {
                audioRef.current.currentTime = next
                setProgress(next)
              }
            }}
          >
            <div className="absolute left-0 top-0 h-full bg-[#f4a30a] rounded-full" style={{ width: `${progressPct}%` }} />
          </div>
          <span className="text-gray-400 text-xs w-10">{fmt(duration)}</span>
        </div>

        {/* Main Controls */}
        <div className="flex items-center justify-between px-6 py-3">
          {/* Left: Album Art and Info */}
          <div className="flex items-center gap-3 min-w-0 w-1/4">
            {/* Album Thumbnail */}
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#f4a30a] to-[#e67e22] flex-shrink-0 flex items-center justify-center text-white">
              <Radio size={16} />
            </div>

            {/* Song Info */}
            <div className="flex flex-col min-w-0">
              <span className="text-white text-sm font-medium truncate">{tracks[index].title}</span>
              <span className="text-gray-400 text-xs truncate">{tracks[index].artist}</span>
            </div>
          </div>

          {/* Center: Controls */}
          <div className="flex items-center gap-4">
            <button className="text-gray-400 hover:text-white transition-colors">
              <Shuffle size={18} />
            </button>
            <button className="text-gray-400 hover:text-white transition-colors" onClick={() => requireAuth(() => setIndex((prev) => (prev === 0 ? tracks.length - 1 : prev - 1)), t('authSigninPrompt'))}>
              <SkipBack size={18} />
            </button>
            <button onClick={togglePlay} className="w-10 h-10 rounded-full bg-[#f4a30a] flex items-center justify-center text-black hover:scale-105 transition-transform">
              {isPlaying ? <Pause size={18} fill="black" /> : <Play size={18} fill="black" />}
            </button>
            <button className="text-gray-400 hover:text-white transition-colors" onClick={() => requireAuth(() => setIndex((prev) => (prev + 1) % tracks.length), t('authSigninPrompt'))}>
              <SkipForward size={18} />
            </button>
            <button className="text-gray-400 hover:text-white transition-colors">
              <Repeat size={18} />
            </button>
          </div>

          {/* Right: Volume and Settings */}
          <div className="flex items-center gap-3 w-1/4 justify-end">
            <button className="text-gray-400 hover:text-white transition-colors">
              <MessageCircle size={16} />
            </button>
            <button className="text-gray-400 hover:text-white transition-colors">
              <Volume2 size={16} />
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="w-20 accent-[#f4a30a]"
            />
            <button className="text-gray-400 hover:text-white transition-colors">
              <Settings size={16} />
            </button>
            <button className="text-gray-400 hover:text-white transition-colors">
              <Maximize2 size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
