'use client'

import { useEffect, useState } from 'react'
import { StreamfyLogo } from '@/components/StreamfyLogo'
import { BRAND_NAME } from '@/lib/brand'

export function StreamfyIntro() {
  const [show, setShow] = useState(false)
  const [fadeOut, setFadeOut] = useState(false)

  useEffect(() => {
    setShow(true)
    const fadeTimer = window.setTimeout(() => setFadeOut(true), 1250)
    const doneTimer = window.setTimeout(() => setShow(false), 1850)
    return () => {
      window.clearTimeout(fadeTimer)
      window.clearTimeout(doneTimer)
    }
  }, [])

  if (!show) return null

  return (
    <div
      className={`pointer-events-none fixed inset-0 z-[120] flex items-center justify-center bg-black transition-opacity duration-500 ${
        fadeOut ? 'opacity-0' : 'opacity-100'
      }`}
      aria-hidden="true"
    >
      <div className="streamfy-intro-light absolute inset-0" />
      <div className="streamfy-intro-threads absolute inset-0" />
      <div className="relative flex flex-col items-center gap-3">
        <StreamfyLogo size={112} className="streamfy-intro-logo" aria-hidden="true" />
        <p className="text-sm font-semibold tracking-[0.28em] text-[color:var(--app-accent-a)]">{BRAND_NAME.toUpperCase()}</p>
      </div>
    </div>
  )
}
