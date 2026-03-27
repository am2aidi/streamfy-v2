'use client'

import Link from 'next/link'
import { useRef } from 'react'
import { PlayCircle } from 'lucide-react'
import type { ShortVideo } from '@/lib/shorts-data'
import { SmartCover } from '@/components/SmartCover'

export function ShortPreviewCard({ short }: { short: ShortVideo }) {
  const videoRef = useRef<HTMLVideoElement | null>(null)

  return (
    <Link
      href={`/shorts/${short.id}`}
      className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
      onMouseEnter={() => {
        const el = videoRef.current
        if (!el) return
        el.currentTime = 0
        void el.play().catch(() => {})
      }}
      onMouseLeave={() => {
        const el = videoRef.current
        if (!el) return
        el.pause()
      }}
    >
      <div className="relative h-48">
        <SmartCover src={short.image} alt={short.title} className="object-cover opacity-90 group-hover:opacity-100 transition-opacity" sizes="420px" />

        {short.videoUrl ? (
          <video
            ref={videoRef}
            muted
            playsInline
            loop
            preload="metadata"
            src={short.videoUrl}
            className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-200 group-hover:opacity-100"
          />
        ) : null}

        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />
        <div className="absolute bottom-3 left-3 right-3">
          <p className="text-white text-sm font-semibold line-clamp-2">{short.title}</p>
          <p className="text-gray-300 text-xs mt-1 line-clamp-1">0:{short.durationSeconds.toString().padStart(2, '0')}s</p>
        </div>
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <PlayCircle size={34} className="text-[#f4a30a]" />
        </div>
      </div>
    </Link>
  )
}

