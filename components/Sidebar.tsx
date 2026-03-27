'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Heart, Home, Info, MessageCircle, Music, PlaySquare, Search, Settings, Share2, Trophy, Tv2, Users } from 'lucide-react'
import { useAppSettings } from '@/components/AppSettingsProvider'
import { StreamfyLogo } from '@/components/StreamfyLogo'
import { BRAND_NAME } from '@/lib/brand'
import { getTranslation } from '@/lib/translations'
import { useToast } from '@/hooks/use-toast'

export function Sidebar() {
  const pathname = usePathname()
  const { settings } = useAppSettings()
  const { toast } = useToast()
  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(settings.language, key)

  const isActive = (href: string) => (href === '/' ? pathname === '/' : pathname.startsWith(href))

  const sharePage = async () => {
    const url = typeof window !== 'undefined' ? window.location.href : ''
    if (!url) return
    try {
      const nav = navigator as unknown as { share?: (data: { title?: string; url?: string }) => Promise<void>; clipboard?: Clipboard }
      if (nav.share) {
        await nav.share({ title: BRAND_NAME, url })
        return
      }
      await nav.clipboard?.writeText(url)
      toast({ title: t('linkCopied'), description: t('shareWithFriends') })
    } catch {
      toast({ title: t('couldNotShare'), description: t('copyLinkFromAddressBar') })
    }
  }

  return (
    <>
    <aside className="fixed left-0 top-0 bottom-0 z-50 hidden w-[92px] p-3 md:block">
      <div className="flex h-full items-center justify-center">
        <div className="flex w-[64px] flex-col items-center rounded-full border border-[#f4a30a]/30 bg-gradient-to-b from-[#0a0a0a]/95 via-[#050505]/95 to-[#0a0a0a]/95 py-4 shadow-[0_18px_45px_rgba(0,0,0,0.5)] backdrop-blur-xl">
          {/* Logo */}
          <div className="mb-4 flex items-center justify-center">
            <StreamfyLogo size={40} className="streamfy-logo-cinematic" aria-hidden="true" />
          </div>

          {/* Navigation */}
          <nav className="flex flex-col gap-2">
            <NavItemLink href="/" label={t('home')} icon={Home} active={isActive('/')} />
            <NavItemLink href="/search" label={t('search')} icon={Search} active={isActive('/search')} />
            <NavItemLink href="/community" label={t('community')} icon={Users} active={isActive('/community')} />
            <NavItemLink href="/chat" label={t('chat')} icon={MessageCircle} active={isActive('/chat')} />
            <div className="my-1 h-px w-8 bg-white/10" />
            <NavItemLink href="/movies" label={t('movies')} icon={Tv2} active={isActive('/movies')} />
            <NavItemLink href="/music" label={t('music')} icon={Music} active={isActive('/music')} />
            <NavItemLink href="/sports" label="Live Sports" icon={Trophy} active={isActive('/sports')} />
            <NavItemLink href="/shorts" label="Shorts" icon={PlaySquare} active={isActive('/shorts')} />
            <NavItemLink href="/watchlist" label="Watchlist" icon={Heart} active={isActive('/watchlist')} />
            <div className="my-1 h-px w-8 bg-white/10" />
            <NavItemLink href="/settings" label={t('settings')} icon={Settings} active={isActive('/settings')} />
            <NavItemLink href="/about" label={t('learnMore')} icon={Info} active={isActive('/about')} />
          </nav>

          {/* Social Dock */}
          <div className="mt-auto flex flex-col items-center justify-center gap-2 pt-3">
            <button
              onClick={sharePage}
              title="Share"
              aria-label="Share"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white/80 hover:bg-white/[0.08] hover:text-white transition-colors"
            >
              <Share2 size={15} />
            </button>
            <a
              href="https://wa.me/250700000000"
              target="_blank"
              rel="noreferrer"
              title="WhatsApp"
              aria-label="WhatsApp"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-emerald-400/35 bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25 transition-colors"
            >
              <Image src="/whatsapp.svg" alt="" width={18} height={18} />
            </a>
          </div>
        </div>
      </div>
    </aside>

    {/* Mobile bottom navigation */}
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-black/85 backdrop-blur-xl md:hidden">
      <div className="mx-auto grid max-w-[900px] grid-cols-6 px-2 py-2">
        <MobileNavItem href="/" label={t('home')} icon={Home} active={isActive('/')} />
        <MobileNavItem href="/search" label={t('search')} icon={Search} active={isActive('/search')} />
        <MobileNavItem href="/movies" label={t('movies')} icon={Tv2} active={isActive('/movies')} />
        <MobileNavItem href="/music" label={t('music')} icon={Music} active={isActive('/music')} />
        <MobileNavItem href="/sports" label={t('sports')} icon={Trophy} active={isActive('/sports')} />
        <MobileNavItem href="/chat" label={t('chat')} icon={MessageCircle} active={isActive('/chat')} />
      </div>
    </nav>
    </>
  )
}

interface NavItemLinkProps {
  href: string
  label: string
  icon: React.ComponentType<{ size?: number }>
  active?: boolean
}

function NavItemLink({ href, label, icon: Icon, active }: NavItemLinkProps) {
  return (
    <Link
      href={href}
      className={`relative flex items-center justify-center rounded-full text-sm font-medium transition-all duration-200 ${
        active ? 'text-white' : 'text-gray-400 hover:text-white'
      }`}
      title={label}
      aria-label={label}
    >
      <span
        className={`inline-flex h-8 w-8 items-center justify-center rounded-full transition-all duration-200 ${
          active
            ? 'border border-white/10 shadow-[0_10px_24px_rgba(0,0,0,0.35)] text-[color:var(--app-accent-fg)]'
            : 'bg-[#111]/85 border border-white/10 text-gray-300 hover:bg-white/[0.06]'
        }`}
        style={
          active
            ? {
                background:
                  'linear-gradient(135deg, color-mix(in oklab, var(--app-accent-a) 78%, white), color-mix(in oklab, var(--app-accent-b) 72%, white))',
              }
            : undefined
        }
      >
        <Icon size={19} />
      </span>
    </Link>
  )
}

function MobileNavItem({
  href,
  label,
  icon: Icon,
  active,
}: {
  href: string
  label: string
  icon: React.ComponentType<{ size?: number }>
  active?: boolean
}) {
  return (
    <Link
      href={href}
      className={`flex flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 text-[10px] transition-colors ${
        active ? 'text-[color:var(--app-accent-a)]' : 'text-white/70 hover:text-white'
      }`}
      aria-label={label}
      title={label}
    >
      <span
        className={`inline-flex h-9 w-9 items-center justify-center rounded-2xl border ${
          active ? 'border-[color:var(--app-accent-a)]/30 bg-[color:var(--app-accent-a)]/10' : 'border-white/10 bg-white/[0.03]'
        }`}
      >
        <Icon size={18} />
      </span>
      <span className="leading-none">{label}</span>
    </Link>
  )
}
