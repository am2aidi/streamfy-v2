'use client'

import Image from 'next/image'

export function AdminLogo() {
  return (
    <div className="flex items-center gap-3">
      <Image src="/streamfy-s-logo.svg" alt="Streamfy Logo" width={40} height={40} className="streamfy-logo-cinematic" />
      <div className="leading-tight">
        <p className="text-sm font-black tracking-[0.2em] text-white">STREAMFY</p>
        <p className="text-[11px] text-slate-400">ADMIN CONSOLE</p>
      </div>
    </div>
  )
}
