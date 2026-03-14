'use client'

import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  BarChart3,
  Bell,
  Clapperboard,
  Newspaper,
  LogOut,
  Megaphone,
  Music2,
  Plus,
  PlaySquare,
  Search,
  Settings,
  ShieldCheck,
  Tv,
  Users,
} from 'lucide-react'
import { AdminLogo } from '@/components/admin/AdminLogo'
import { useToast } from '@/hooks/use-toast'
import { useAppSettings } from '@/components/AppSettingsProvider'
import { getTranslation, languages, type TranslationKey } from '@/lib/translations'

const ADMIN_SESSION_KEY = 'streamfy-admin-session'

type AdminNavItem = { href: string; labelKey: TranslationKey; icon: typeof BarChart3 }

const pageAccentByHref: Record<string, { a: string; b: string }> = {
  '/admin': { a: '#22c55e', b: '#14b8a6' },
  '/admin/movies': { a: '#f59e0b', b: '#f97316' },
  '/admin/music': { a: '#a855f7', b: '#6366f1' },
  '/admin/sports': { a: '#22c55e', b: '#06b6d4' },
  '/admin/news': { a: '#38bdf8', b: '#6366f1' },
  '/admin/shorts': { a: '#f4a30a', b: '#e67e22' },
  '/admin/ads': { a: '#ef4444', b: '#f59e0b' },
  '/admin/users': { a: '#38bdf8', b: '#818cf8' },
  '/admin/analytics': { a: '#8b5cf6', b: '#ec4899' },
  '/admin/settings': { a: '#14b8a6', b: '#a855f7' },
}

export function AdminShell({ children }: { children: ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { toast } = useToast()
  const { settings, updateSetting } = useAppSettings()
  const [authorized, setAuthorized] = useState(false)
  const t = (key: TranslationKey) => getTranslation(settings.language, key)

  const navItems = useMemo<AdminNavItem[]>(
    () => [
      { href: '/admin', labelKey: 'dashboardOverview', icon: BarChart3 },
      { href: '/admin/movies', labelKey: 'moviesManagement', icon: Clapperboard },
      { href: '/admin/sports', labelKey: 'sportsManagement', icon: Tv },
      { href: '/admin/music', labelKey: 'musicManagement', icon: Music2 },
      { href: '/admin/news', labelKey: 'newsManagement', icon: Newspaper },
      { href: '/admin/shorts', labelKey: 'shortsManagement', icon: PlaySquare },
      { href: '/admin/ads', labelKey: 'adsManagement', icon: Megaphone },
      { href: '/admin/users', labelKey: 'usersManagement', icon: Users },
      { href: '/admin/analytics', labelKey: 'analytics', icon: BarChart3 },
      { href: '/admin/settings', labelKey: 'settings', icon: Settings },
    ],
    [settings.language]
  )

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem(ADMIN_SESSION_KEY) : null
    if (!token) {
      router.replace('/admin/login')
      return
    }
    setAuthorized(true)
  }, [router])

  const activeLabel = useMemo(() => {
    const active = navItems.find((item) => (item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href)))
    return active ? t(active.labelKey) : 'Admin'
  }, [pathname, navItems, settings.language])

  const accent = useMemo(() => {
    const active = navItems.find((item) => (item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href)))
    return (active && pageAccentByHref[active.href]) || pageAccentByHref['/admin']
  }, [pathname, navItems])

  const accentVars = useMemo(
    () =>
      ({
        '--admin-accent-a': accent.a,
        '--admin-accent-b': accent.b,
      }) as CSSProperties,
    [accent],
  )

  if (!authorized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#020617] via-[#0f172a] to-black text-white">
        <div className="flex min-h-screen items-center justify-center">
          <div className="rounded-2xl border border-white/10 bg-white/5 px-6 py-4 text-sm text-slate-300 backdrop-blur-xl">
            {t('checkingAdminSession')}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={accentVars} className="min-h-screen overflow-x-hidden bg-gradient-to-br from-[#01050f] via-[#070d1c] to-black text-white">
      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-[280px] border-r border-white/10 bg-[#060b18]/88 p-5 backdrop-blur-2xl lg:block">
        <AdminLogo />

        <nav className="mt-8 space-y-1">
          {navItems.map((item) => {
            const isActive = item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href)
            const itemAccent = pageAccentByHref[item.href] ?? pageAccentByHref['/admin']
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all ${
                  isActive ? '' : 'text-slate-300 hover:bg-white/5 hover:text-white'
                }`}
                style={
                  isActive
                    ? {
                        border: `1px solid ${itemAccent.a}55`,
                        background: `${itemAccent.a}1a`,
                        color: itemAccent.a,
                        boxShadow: `0 0 18px ${itemAccent.a}44`,
                      }
                    : undefined
                }
              >
                <item.icon size={17} />
                <span>{t(item.labelKey)}</span>
              </Link>
            )
          })}
        </nav>

        <button
          onClick={() => {
            localStorage.removeItem(ADMIN_SESSION_KEY)
            router.replace('/admin/login')
          }}
          className="mt-10 flex w-full items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm text-slate-300 transition-colors hover:border-[#EF4444]/40 hover:text-[#EF4444]"
        >
          <LogOut size={17} />
          {t('adminLogout')}
        </button>
      </aside>

      <div className="relative lg:ml-[280px]">
        <div
          className="pointer-events-none absolute -top-40 right-[-80px] z-0 h-80 w-80 rounded-full blur-3xl"
          style={{ background: `radial-gradient(circle, ${accent.a}38 0%, transparent 65%)` }}
        />
        <header className="sticky top-0 z-30 border-b border-white/10 bg-[#080e1d]/72 px-4 py-4 backdrop-blur-2xl sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-slate-400">{t('adminWorkspace')}</p>
              <h1 className="text-lg font-semibold text-white">{activeLabel}</h1>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <select
                value={settings.language}
                onChange={(e) => updateSetting('language', e.target.value as typeof settings.language)}
                className="hidden rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-slate-200 sm:block"
                aria-label={t('languageMenu')}
                title={t('languageMenu')}
              >
                {languages.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>

              <div className="hidden items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 sm:flex">
                <Search size={15} className="text-slate-400" />
                <input
                  placeholder={t('adminSearchPlaceholder')}
                  className="w-56 bg-transparent text-sm text-white placeholder:text-slate-500 focus:outline-none"
                />
              </div>

              <button
                onClick={() => toast({ title: t('notifications'), description: t('notificationsPrototypeDesc') })}
                className="relative rounded-xl border border-white/10 bg-white/[0.03] p-2.5 text-slate-300 transition-colors hover:text-white"
                aria-label={t('notifications')}
              >
                <Bell size={16} />
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full" style={{ backgroundColor: accent.a }} />
              </button>

              <button
                onClick={() => toast({ title: t('addContent'), description: 'Use Movies/Sports/Music pages to add content.' })}
                className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-black transition-transform hover:scale-[1.02]"
                style={{ backgroundImage: `linear-gradient(to right, ${accent.a}, ${accent.b})`, boxShadow: `0 10px 25px ${accent.a}44` }}
              >
                <Plus size={15} />
                {t('addContent')}
              </button>

              <div className="inline-flex items-center gap-2 rounded-xl px-2.5 py-1.5" style={{ border: `1px solid ${accent.a}55`, background: `${accent.a}1a` }}>
                <ShieldCheck size={14} style={{ color: accent.a }} />
                <span className="text-[11px] font-semibold" style={{ color: accent.a }}>{t('adminPanel')}</span>
              </div>

              <div className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold text-black" style={{ backgroundImage: `linear-gradient(to bottom right, ${accent.a}, ${accent.b})` }}>
                AD
              </div>
            </div>
          </div>
        </header>

        <main className="relative z-10 mx-auto min-h-[calc(100vh-82px)] w-full max-w-[1500px] p-4 sm:p-6">{children}</main>
      </div>
    </div>
  )
}
