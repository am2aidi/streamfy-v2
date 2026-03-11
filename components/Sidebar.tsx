'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, MessageCircle, Music, Settings, Share2, Trophy, Tv2 } from 'lucide-react'
import { useAppSettings } from '@/components/AppSettingsProvider'
import { getTranslation } from '@/lib/translations'
import { useToast } from '@/hooks/use-toast'

export function Sidebar() {
  const pathname = usePathname()
  const { settings } = useAppSettings()
  const { toast } = useToast()
  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(settings.language, key)

  const isActive = (path: string) => pathname === path
  const showSocialDock = pathname.startsWith('/movies') || pathname.startsWith('/music') || pathname.startsWith('/sports')

  const sharePage = async () => {
    const url = typeof window !== 'undefined' ? window.location.href : ''
    if (!url) return
    try {
      const nav = navigator as unknown as { share?: (data: { title?: string; url?: string }) => Promise<void>; clipboard?: Clipboard }
      if (nav.share) {
        await nav.share({ title: 'Streamfy', url })
        return
      }
      await nav.clipboard?.writeText(url)
      toast({ title: t('linkCopied'), description: t('shareWithFriends') })
    } catch {
      toast({ title: t('couldNotShare'), description: t('copyLinkFromAddressBar') })
    }
  }

  return (
    <aside className="fixed left-0 top-0 bottom-0 z-50 w-[92px] p-3">
      <div className="flex h-full items-center justify-center">
        <div className="flex w-[64px] flex-col items-center rounded-full border border-[#f4a30a]/30 bg-gradient-to-b from-[#0a0a0a]/95 via-[#050505]/95 to-[#0a0a0a]/95 py-4 shadow-[0_18px_45px_rgba(0,0,0,0.5)] backdrop-blur-xl">
          {/* Logo */}
          <div className="mb-4 flex items-center justify-center">
            <div
              className="relative flex h-10 w-10 items-center justify-center rounded-full border border-white/10 shadow-[0_12px_28px_rgba(0,0,0,0.45)]"
              style={{
                background:
                  'linear-gradient(135deg, color-mix(in oklab, var(--app-accent-a) 78%, white), color-mix(in oklab, var(--app-accent-b) 72%, white))',
              }}
            >
              <Image src="/streamfy-s-logo.svg" alt="Streamfy Logo" width={24} height={24} className="streamfy-logo-cinematic" />
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex flex-col gap-2">
            <NavItemLink href="/" label={t('home')} icon={Home} active={isActive('/')} />
            <NavItemLink href="/music" label={t('music')} icon={Music} active={isActive('/music')} />
            <NavItemLink href="/sports" label={t('sports')} icon={Trophy} active={isActive('/sports')} />
            <NavItemLink href="/movies" label={t('movies')} icon={Tv2} active={isActive('/movies')} />
            <div className="my-1 h-px w-8 bg-white/10" />
            <NavItemLink href="/settings" label={t('settings')} icon={Settings} active={isActive('/settings')} />
          </nav>

          {/* Social Icon */}
          {showSocialDock ? (
            <div className="mt-3 flex flex-col items-center justify-center gap-2">
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
          ) : null}
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
