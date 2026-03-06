'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Music, Home, Tv2, Settings, Trophy, Info, MessageCircle } from 'lucide-react'
import { useAppSettings } from '@/components/AppSettingsProvider'
import { getTranslation } from '@/lib/translations'

export function Sidebar() {
  const pathname = usePathname()
  const { settings } = useAppSettings()
  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(settings.language, key)

  const isActive = (path: string) => pathname === path

  return (
    <aside className="fixed left-0 top-0 bottom-0 z-50 w-[92px] p-3">
      <div className="flex h-full items-center justify-center">
        <div className="flex h-[calc(100vh-28px)] w-[64px] flex-col items-center rounded-full border border-[#f4a30a]/30 bg-gradient-to-b from-[#0a0a0a]/95 via-[#050505]/95 to-[#0a0a0a]/95 py-4 shadow-[0_18px_45px_rgba(0,0,0,0.5)] backdrop-blur-xl">
          {/* Logo */}
          <div className="mb-4 flex items-center justify-center">
            <div className="relative flex h-8 w-8 items-center justify-center rounded-full border border-[#f4a30a]/40 bg-[#f4a30a]/10">
              <Image src="/streamfy-s-logo.svg" alt="Streamfy Logo" width={18} height={18} className="streamfy-logo-cinematic" />
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex flex-1 flex-col gap-2.5">
            <NavItemLink href="/" label={t('home')} icon={Home} active={isActive('/')} highlight={isActive('/')} />
            <NavItemLink href="/music" label={t('music')} icon={Music} active={isActive('/music')} />
            <NavItemLink href="/sports" label={t('sports')} icon={Trophy} active={isActive('/sports')} />
            <NavItemLink href="/movies" label={t('movies')} icon={Tv2} active={isActive('/movies')} />
            <NavItemLink href="/settings" label={t('settings')} icon={Settings} active={isActive('/settings')} />
            <NavItemLink href="/about" label={t('about')} icon={Info} active={isActive('/about')} />
          </nav>

          {/* Social Icon */}
          <div className="mt-2 flex flex-col items-center justify-center">
            <SocialIcon Icon={MessageCircle} />
          </div>
        </div>
      </div>
    </aside>
  )
}

interface NavItemLinkProps {
  href: string
  label: string
  icon: React.ComponentType<{ size?: number }>
  active?: boolean
  highlight?: boolean
}

function NavItemLink({ href, label, icon: Icon, active, highlight }: NavItemLinkProps) {
  return (
    <Link
      href={href}
      className={`relative flex items-center justify-center rounded-full text-sm font-medium transition-all duration-200 ${
        active ? 'text-white' : 'text-gray-400 hover:text-white'
      }`}
      title={label}
      aria-label={label}
    >
      {highlight && (
        <div className="absolute -left-[8px] top-1/2 -translate-y-1/2 h-4 w-[2px] rounded-full bg-[#f4a30a]" />
      )}
      <span
        className={`inline-flex h-8 w-8 items-center justify-center rounded-full transition-all duration-200 ${
          active
            ? 'bg-[#f4a30a] text-black border border-[#f4a30a]/70 shadow-[0_8px_20px_rgba(244,163,10,0.35)]'
            : 'bg-[#111]/85 border border-white/10 text-gray-300'
        }`}
      >
        <Icon size={18} />
      </span>
    </Link>
  )
}

interface SocialIconProps {
  Icon: React.ComponentType<{ size?: number }>
}

function SocialIcon({ Icon }: SocialIconProps) {
  return (
    <button
      title="WhatsApp"
      aria-label="WhatsApp"
      className="w-7 h-7 rounded-full border border-emerald-400/35 bg-emerald-500/15 flex items-center justify-center text-emerald-400 hover:bg-emerald-500/25 transition-colors"
    >
      <Icon size={14} />
    </button>
  )
}
