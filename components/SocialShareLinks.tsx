'use client'

import { useEffect, useMemo, useState } from 'react'
import { Facebook, Instagram, MessageCircle, Music2, Share2, Youtube } from 'lucide-react'

const socialProfiles = {
  whatsapp: 'https://wa.me/250700000000',
  instagram: 'https://instagram.com/streamfy',
  tiktok: 'https://tiktok.com/@streamfy',
  youtube: 'https://youtube.com/@streamfy',
  facebook: 'https://facebook.com/streamfy',
}

export function SocialShareLinks({ targetUrl, title = 'Share To' }: { targetUrl?: string; title?: string }) {
  const [currentUrl, setCurrentUrl] = useState('')

  useEffect(() => {
    setCurrentUrl(typeof window !== 'undefined' ? window.location.href : '')
  }, [])

  const url = targetUrl || currentUrl
  const encoded = useMemo(() => encodeURIComponent(url), [url])
  const encodedMessage = useMemo(() => encodeURIComponent(`Check this on Streamfy: ${url}`), [url])

  const items = [
    { name: 'WhatsApp', icon: MessageCircle, href: `https://wa.me/?text=${encodedMessage}`, bg: 'bg-emerald-500/20', color: 'text-emerald-400' },
    { name: 'Instagram', icon: Instagram, href: socialProfiles.instagram, bg: 'bg-pink-500/20', color: 'text-pink-400' },
    { name: 'TikTok', icon: Music2, href: socialProfiles.tiktok, bg: 'bg-cyan-500/20', color: 'text-cyan-300' },
    { name: 'YouTube', icon: Youtube, href: socialProfiles.youtube, bg: 'bg-red-500/20', color: 'text-red-400' },
    { name: 'Facebook', icon: Facebook, href: `https://www.facebook.com/sharer/sharer.php?u=${encoded}`, bg: 'bg-blue-500/20', color: 'text-blue-400' },
  ] as const

  const copyLink = async () => {
    if (!url) return
    try {
      await navigator.clipboard.writeText(url)
    } catch {
      // ignore clipboard errors
    }
  }

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-gray-400">{title}</p>
      {items.map((social) => (
        <a
          key={social.name}
          href={social.href}
          target="_blank"
          rel="noreferrer"
          className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm hover:bg-white/[0.05]"
        >
          <span className="inline-flex items-center gap-2">
            <span className={`flex h-7 w-7 items-center justify-center rounded-full ${social.bg} ${social.color}`}>
              <social.icon size={14} />
            </span>
            <span className="text-gray-200">{social.name}</span>
          </span>
          <span className="text-xs text-gray-400">Share</span>
        </a>
      ))}

      <button
        onClick={copyLink}
        className="inline-flex items-center gap-2 rounded-lg border border-[#f4a30a]/30 bg-[#f4a30a]/10 px-3 py-2 text-xs font-medium text-[#f4a30a]"
      >
        <Share2 size={13} />
        Copy Link
      </button>
    </div>
  )
}
