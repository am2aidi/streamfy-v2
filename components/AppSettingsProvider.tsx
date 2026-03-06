'use client'

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import type { Language } from '@/lib/translations'

export type AccentTheme =
  | 'gold'
  | 'movies'
  | 'music'
  | 'sports'
  | 'ads'
  | 'users'
  | 'analytics'
  | 'settings'

export const accentThemePresets: Record<AccentTheme, { a: string; b: string; name: string }> = {
  gold: { a: '#f4a30a', b: '#e67e22', name: 'Classic Gold' },
  movies: { a: '#f59e0b', b: '#f97316', name: 'Movies Amber' },
  music: { a: '#a855f7', b: '#6366f1', name: 'Music Neon' },
  sports: { a: '#22c55e', b: '#06b6d4', name: 'Sports Aqua' },
  ads: { a: '#ef4444', b: '#f59e0b', name: 'Ads Flame' },
  users: { a: '#38bdf8', b: '#818cf8', name: 'Users Sky' },
  analytics: { a: '#8b5cf6', b: '#ec4899', name: 'Analytics Pulse' },
  settings: { a: '#14b8a6', b: '#a855f7', name: 'Settings Mint' },
}

interface AppSettings {
  theme: 'dark' | 'light'
  accentTheme: AccentTheme
  language: Language
  audioQuality: string
  favoriteLeagues: string[]
  favoriteTracks: string[]
  twoFactor: boolean
  loginNotifs: boolean
  pushNotifs: boolean
  emailNotifs: boolean
  soundEffects: boolean
}

interface AppSettingsContextType {
  settings: AppSettings
  updateSetting: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void
}

const defaultSettings: AppSettings = {
  theme: 'dark',
  accentTheme: 'gold',
  language: 'en',
  audioQuality: 'High',
  favoriteLeagues: ['Champions League', 'NBA'],
  favoriteTracks: [],
  twoFactor: false,
  loginNotifs: true,
  pushNotifs: true,
  emailNotifs: false,
  soundEffects: true,
}

const AppSettingsContext = createContext<AppSettingsContextType | undefined>(undefined)

const legacyLanguageMap: Record<string, Language> = {
  English: 'en',
  French: 'fr',
  Luganda: 'lg',
  Kinyarwanda: 'rw',
}

function normalizeLanguage(value: unknown): Language {
  if (value === 'en' || value === 'fr' || value === 'lg' || value === 'rw') {
    return value
  }
  if (typeof value === 'string' && legacyLanguageMap[value]) {
    return legacyLanguageMap[value]
  }
  return 'en'
}

export function AppSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    try {
      const saved = localStorage.getItem('streamfy-settings')
      if (saved) {
        const parsed = JSON.parse(saved) as Partial<AppSettings> & { language?: unknown }
        setSettings({
          ...defaultSettings,
          ...parsed,
          language: normalizeLanguage(parsed.language),
        })
      }
    } catch {
      // ignore parse errors
    }
  }, [])

  useEffect(() => {
    if (!mounted) return
    localStorage.setItem('streamfy-settings', JSON.stringify(settings))

    // Apply theme
    if (settings.theme === 'light') {
      document.documentElement.classList.add('light-theme')
      document.documentElement.classList.remove('dark-theme')
    } else {
      document.documentElement.classList.add('dark-theme')
      document.documentElement.classList.remove('light-theme')
    }

    const accent = accentThemePresets[settings.accentTheme] ?? accentThemePresets.gold
    document.documentElement.style.setProperty('--app-accent-a', accent.a)
    document.documentElement.style.setProperty('--app-accent-b', accent.b)
  }, [settings, mounted])

  const updateSetting = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <AppSettingsContext.Provider value={{ settings, updateSetting }}>
      {children}
    </AppSettingsContext.Provider>
  )
}

export function useAppSettings() {
  const ctx = useContext(AppSettingsContext)
  if (!ctx) throw new Error('useAppSettings must be used inside AppSettingsProvider')
  return ctx
}
