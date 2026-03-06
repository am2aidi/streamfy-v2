'use client'

import { useMemo, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Image from 'next/image'
import { ArrowUpCircle, Bell, CircleHelp, Download, Gift, Globe, Info, LogOut, Moon, Search, Settings, Sun, UserCircle2 } from 'lucide-react'
import { useAppSettings } from '@/components/AppSettingsProvider'
import { useAuth } from '@/components/AuthProvider'
import { getTranslation, languages } from '@/lib/translations'
import { useToast } from '@/hooks/use-toast'
import { LiveMomentsBanner } from '@/components/LiveMomentsBanner'

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
  const showCompactBanner = !['/', '/movies', '/music', '/sports'].includes(pathname)

  return (
    <header className="relative px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <Image src="/streamfy-s-logo.svg" alt="Streamfy Logo" width={22} height={22} className="streamfy-logo-cinematic" />
            <span className="text-sm text-gray-400">{t('welcome')}</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">{t('discoverEnjoy')}</h1>
        </div>

        <div className="flex items-center gap-3">
        <select
          value={settings.language}
          onChange={(e) => updateSetting('language', e.target.value as typeof settings.language)}
          className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-gray-200"
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

        <div className="relative hidden md:block">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={t('searchPlaceholder')}
            className="w-[220px] rounded-full border border-white/10 bg-white/5 py-2 pl-10 pr-4 text-sm text-white placeholder-gray-500 focus:border-[#f4a30a]/50 focus:outline-none"
          />
        </div>

        <button
          onClick={() =>
            toast({
              title: 'Notifications',
              description: 'You have 3 new alerts: live match, new release, and playlist update.',
            })
          }
          className="relative flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
          aria-label="Notifications"
        >
          <Bell size={16} />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[#f4a30a]" />
        </button>

        <div className="relative">
          <button
            onClick={() => setShowMenu((prev) => !prev)}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#f4a30a] to-[#e67e22] text-black"
            aria-label="Account menu"
          >
            <UserCircle2 size={17} />
          </button>

          {showMenu && (
            <div className="absolute right-0 top-12 z-50 w-64 rounded-2xl border border-white/10 bg-black/95 p-2">
              <div className="border-b border-white/10 px-3 py-2">
                <p className="text-sm font-semibold text-white">{isAuthenticated ? user?.email ?? user?.phone ?? 'User' : 'Guest mode'}</p>
                <p className="text-xs text-gray-400">{languageName}</p>
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

              <MenuAction
                icon={Settings}
                label="Settings"
                onClick={() => {
                  router.push('/settings')
                  setShowMenu(false)
                }}
              />
              <MenuAction
                icon={Globe}
                label={`Language: ${languageName}`}
                onClick={() =>
                  toast({
                    title: 'Language',
                    description: `Current: ${languageName}`,
                  })
                }
              />
              <MenuAction
                icon={CircleHelp}
                label="Get help"
                onClick={() =>
                  toast({
                    title: 'Help',
                    description: 'Support center prototype action.',
                  })
                }
              />
              <div className="my-1 border-t border-white/10" />
              <MenuAction
                icon={ArrowUpCircle}
                label="Upgrade plan"
                onClick={() => {
                  router.push('/settings')
                  setShowMenu(false)
                }}
              />
              <MenuAction
                icon={Download}
                label="Get apps and extensions"
                onClick={() =>
                  toast({
                    title: 'Apps',
                    description: 'Apps and extensions prototype action.',
                  })
                }
              />
              <MenuAction
                icon={Gift}
                label="Gift Streamfy"
                onClick={() => {
                  router.push('/settings?mode=gift')
                  setShowMenu(false)
                }}
              />
              <MenuAction
                icon={Info}
                label="Learn more"
                onClick={() => {
                  router.push('/about')
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
