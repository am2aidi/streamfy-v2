'use client'

import { StreamfyLogo } from '@/components/StreamfyLogo'
import { BRAND_NAME } from '@/lib/brand'

export function AdminLogo() {
  return (
    <div className="flex items-center gap-3">
      <StreamfyLogo size={48} className="streamfy-logo-cinematic" aria-hidden="true" />
      <div className="leading-tight">
        <p className="text-sm font-black tracking-[0.2em] text-white">{BRAND_NAME.toUpperCase()}</p>
        <p className="text-[11px] text-slate-400">ADMIN CONSOLE</p>
      </div>
    </div>
  )
}
