'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { ArrowUpCircle, Bell, CircleHelp, Download, Gift, Globe, Heart, Info, LayoutDashboard, LogOut, MessageCircle, Moon, Phone, PlaySquare, Settings, Share2, Sun, UserCircle2 } from 'lucide-react'
import { useAppSettings } from '@/components/AppSettingsProvider'
import { useAuth } from '@/components/AuthProvider'
import { getTranslation, languages } from '@/lib/translations'
import { useToast } from '@/hooks/use-toast'
import { LiveMomentsBanner } from '@/components/LiveMomentsBanner'
import { StreamfyLogo } from '@/components/StreamfyLogo'
import { BRAND_NAME } from '@/lib/brand'

export function Header() {
  const router = useRouter()
  const pathname = usePathname()
  const { settings, updateSetting } = useAppSettings()
  const { user, isAuthenticated, openSignIn, openSignUp, logout } = useAuth()
  const { toast } = useToast()
  const [showMenu, setShowMenu] = useState(false)
  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(settings.language, key)
  const languageName = useMemo(
    () => languages.find((l) => l.code === settings.language)?.name ?? 'English',
    [settings.language]
  )
  const isAdminUser = useMemo(
    () => Boolean(isAuthenticated && user?.role === 'admin' && user?.status !== 'blocked' && user?.status !== 'deleted'),
    [isAuthenticated, user],
  )
  const showCompactBanner = !['/', '/movies', '/music', '/sports'].includes(pathname)
  const notificationCount = 3

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
    <header className="relative px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <StreamfyLogo size={40} className="streamfy-logo-cinematic shrink-0" aria-hidden="true" />
            <span className="text-sm text-gray-400">{t('welcome')}</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">{t('discoverEnjoy')}</h1>
        </div>

        <div className="flex items-center gap-3">
        {isAdminUser ? (
          <button
            onClick={() => router.push('/admin')}
            className="hidden items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-black shadow-[0_12px_30px_rgba(0,0,0,0.25)] md:inline-flex"
            style={{
              background:
                'linear-gradient(135deg, color-mix(in oklab, var(--app-accent-a) 82%, white), color-mix(in oklab, var(--app-accent-b) 76%, white))',
            }}
          >
            <LayoutDashboard size={16} />
            Dashboard
          </button>
        ) : null}

        <select
          value={settings.language}
          onChange={(e) => updateSetting('language', e.target.value as typeof settings.language)}
          className="hidden rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-gray-200 md:block"
        >
          {languages.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.name}
            </option>
          ))}
        </select>

        <button
          onClick={() => updateSetting('theme', settings.theme === 'dark' ? 'light' : 'dark')}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-gray-300 transition-colors hover:bg-white/10 hover:text-white"
          aria-label={t('selectTheme')}
        >
          {settings.theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        {/* Search lives on /search (sidebar) */}

        <button
          onClick={() => router.push('/shorts')}
          className="hidden h-9 w-9 items-center justify-center rounded-full bg-white/5 text-gray-400 transition-colors hover:bg-white/10 hover:text-white sm:flex"
          aria-label="Shorts"
          title="Shorts"
        >
          <PlaySquare size={16} />
        </button>

        <button
          onClick={() => router.push('/watchlist')}
          className="hidden h-9 w-9 items-center justify-center rounded-full bg-white/5 text-gray-400 transition-colors hover:bg-white/10 hover:text-white sm:flex"
          aria-label="Watchlist"
          title="Watchlist"
        >
          <Heart size={16} />
        </button>

        <button
          onClick={() => router.push('/chat')}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
          aria-label={t('chat')}
          title={t('chat')}
        >
          <MessageCircle size={16} />
        </button>

        <button
          onClick={() =>
            toast({
              title: t('notifications'),
              description: t('notificationsPrototypeDesc'),
            })
          }
          className="relative flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
          aria-label={t('notifications')}
        >
          <Bell size={16} />
          {notificationCount > 0 ? (
            <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#f4a30a] px-1 text-[10px] font-bold leading-none text-black">
              {notificationCount > 9 ? '9+' : notificationCount}
            </span>
          ) : null}
        </button>

        <div className="relative">
          <button
            onClick={() => setShowMenu((prev) => !prev)}
            className="flex h-9 w-9 items-center justify-center rounded-full shadow-[0_10px_30px_rgba(0,0,0,0.35)] text-[color:var(--app-accent-fg)]"
            style={{
              background:
                'linear-gradient(135deg, color-mix(in oklab, var(--app-accent-a) 78%, white), color-mix(in oklab, var(--app-accent-b) 72%, white))',
            }}
            aria-label="Account menu"
          >
            {isAuthenticated && user?.avatarUrl ? (
              <Image
                src={user.avatarUrl}
                alt=""
                width={36}
                height={36}
                className="h-9 w-9 rounded-full object-cover"
                priority
              />
            ) : (
              <UserCircle2 size={17} />
            )}
          </button>

          {showMenu && (
            <div className="absolute right-0 top-12 z-50 w-64 rounded-2xl border border-white/10 bg-black/95 p-2">
              <div className="border-b border-white/10 px-3 py-2">
                <div className="flex items-center gap-3">
                  {isAuthenticated && user?.avatarUrl ? (
                    <Image
                      src={user.avatarUrl}
                      alt=""
                      width={36}
                      height={36}
                      className="h-9 w-9 rounded-full object-cover"
                      priority
                    />
                  ) : (
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-gray-300">
                      <UserCircle2 size={18} />
                    </div>
                  )}

                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-white">
                      {isAuthenticated ? user?.name ?? (user?.username ? `@${user.username}` : null) ?? user?.email ?? user?.phone ?? 'User' : t('guestMode')}
                    </p>
                    <p className="text-xs text-gray-400">{languageName}</p>
                  </div>
                </div>
              </div>
              {!isAuthenticated ? (
                <>
                  <button
                    onClick={() => {
                      openSignIn(t('authSigninPrompt'))
                      setShowMenu(false)
                    }}
                    className="mt-1 w-full rounded-lg px-3 py-2 text-left text-sm text-gray-200 transition-colors hover:bg-white/5"
                  >
                    {t('signIn')}
                  </button>
                  <button
                    onClick={() => {
                      openSignUp(t('authSignupPrompt'))
                      setShowMenu(false)
                    }}
                    className="w-full rounded-lg px-3 py-2 text-left text-sm text-gray-200 transition-colors hover:bg-white/5"
                  >
                    {t('signUp')}
                  </button>
                  <div className="my-1 border-t border-white/10" />
                </>
              ) : null}

              {isAdminUser ? (
                <>
                  <MenuAction
                    icon={LayoutDashboard}
                    label="Dashboard"
                    onClick={() => {
                      router.push('/admin')
                      setShowMenu(false)
                    }}
                  />
                  <div className="my-1 border-t border-white/10" />
                </>
              ) : null}

              <MenuAction
                icon={Settings}
                label={t('settings')}
                onClick={() => {
                  router.push('/settings')
                  setShowMenu(false)
                }}
              />
              <MenuAction
                icon={Globe}
                label={`${t('languageMenu')}: ${languageName}`}
                onClick={() =>
                  toast({
                    title: t('languageMenu'),
                    description: `${t('languageCurrent')}: ${languageName}`,
                  })
                }
              />
              <MenuAction
                icon={CircleHelp}
                label={t('getHelp')}
                onClick={() =>
                  toast({
                    title: t('getHelp'),
                    description: t('helpPrototypeDesc'),
                  })
                }
              />
              <div className="my-1 border-t border-white/10" />
              <MenuAction
                icon={ArrowUpCircle}
                label={t('upgradePlan')}
                onClick={() => {
                  router.push('/settings')
                  setShowMenu(false)
                }}
              />
              <MenuAction
                icon={Download}
                label={t('getAppsExtensions')}
                onClick={() =>
                  toast({
                    title: t('getAppsExtensions'),
                    description: t('appsPrototypeDesc'),
                  })
                }
              />
              <MenuAction
                icon={Gift}
                label={t('giftStreamfy')}
                onClick={() => {
                  router.push('/settings?mode=gift')
                  setShowMenu(false)
                }}
              />
              <MenuAction
                icon={Info}
                label={t('learnMore')}
                onClick={() => {
                  router.push('/about')
                  setShowMenu(false)
                }}
              />
              <MenuAction
                icon={Share2}
                label="Share"
                onClick={() => {
                  sharePage()
                  setShowMenu(false)
                }}
              />
              <MenuAction
                icon={Phone}
                label="WhatsApp"
                onClick={() => {
                  window.open('https://wa.me/250700000000', '_blank', 'noopener,noreferrer')
                  setShowMenu(false)
                }}
              />
              <div className="my-1 border-t border-white/10" />

              {isAuthenticated ? (
                <button
                  onClick={() => {
                    logout()
                    setShowMenu(false)
                  }}
                  className="mt-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-red-400 transition-colors hover:bg-red-500/10"
                >
                  <LogOut size={15} />
                  {t('logout')}
                </button>
              ) : null}
            </div>
          )}
        </div>
        </div>
      </div>
      {showCompactBanner ? <div className="mt-4"><LiveMomentsBanner section="compact" /></div> : null}
    </header>
  )
}

function MenuAction({
  icon: Icon,
  label,
  onClick,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>
  label: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="w-full rounded-lg px-3 py-2 text-left text-sm text-gray-200 transition-colors hover:bg-white/5"
    >
      <span className="inline-flex items-center gap-2">
        <Icon size={15} className="text-gray-400" />
        {label}
      </span>
    </button>
  )
}
