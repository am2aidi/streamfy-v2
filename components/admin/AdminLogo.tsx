'use client'

import Image from 'next/image'

export function AdminLogo() {
  return (
    <div className="flex items-center gap-3">
      <span
        className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/10 shadow-[0_14px_34px_rgba(0,0,0,0.35)]"
        style={{ backgroundImage: 'linear-gradient(135deg, var(--admin-accent-a), var(--admin-accent-b))' }}
      >
        <Image src="/streamfy-s-logo.svg" alt="Streamfy Logo" width={36} height={36} className="streamfy-logo-cinematic" />
      </span>
      <div className="leading-tight">
        <p className="text-sm font-black tracking-[0.2em] text-white">STREAMFY</p>
        <p className="text-[11px] text-slate-400">ADMIN CONSOLE</p>
      </div>
    </div>
  )
}
