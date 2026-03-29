'use client'

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import type { Language } from '@/lib/translations'

export type AccentTheme =
  | 'gold'
  | 'water'
  | 'movies'
  | 'music'
  | 'sports'
  | 'ads'
  | 'users'
  | 'analytics'
  | 'settings'

export const accentThemePresets: Record<AccentTheme, { a: string; b: string; name: string }> = {
  gold: { a: '#f4a30a', b: '#e67e22', name: 'Classic Gold' },
  water: { a: '#22d3ee', b: '#3b82f6', name: 'Water Flow' },
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
  subscriptionPlan: 'movie' | 'day' | 'week' | 'twoWeeks' | 'month'
  paymentMethod: string
  favoriteLeagues: string[]
  favoriteTracks: string[]
  watchlistMovies: string[]
  watchlistTracks: string[]
  watchlistMatches: string[]
  watchlistShorts: string[]
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
  subscriptionPlan: 'day',
  paymentMethod: 'rw-mtn-airtel',
  favoriteLeagues: ['Champions League', 'NBA'],
  favoriteTracks: [],
  watchlistMovies: [],
  watchlistTracks: [],
  watchlistMatches: [],
  watchlistShorts: [],
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
  Kinyarwanda: 'rw',
}

function normalizeLanguage(value: unknown): Language {
  if (value === 'en' || value === 'fr' || value === 'rw') return value
  if (value === 'lg') return 'en'
  if (typeof value === 'string' && legacyLanguageMap[value]) {
    return legacyLanguageMap[value]
  }
  return 'en'
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const normalized = hex.trim().replace('#', '')
  if (!/^[0-9a-fA-F]{6}$/.test(normalized)) return null
  const r = Number.parseInt(normalized.slice(0, 2), 16)
  const g = Number.parseInt(normalized.slice(2, 4), 16)
  const b = Number.parseInt(normalized.slice(4, 6), 16)
  return { r, g, b }
}

function relativeLuminance({ r, g, b }: { r: number; g: number; b: number }) {
  const srgb = [r, g, b].map((v) => v / 255).map((c) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)))
  return 0.2126 * srgb[0] + 0.7152 * srgb[1] + 0.0722 * srgb[2]
}

function pickAccentForeground(accentHex: string) {
  const rgb = hexToRgb(accentHex)
  if (!rgb) return '#000000'
  const lum = relativeLuminance(rgb)
  return lum > 0.55 ? '#000000' : '#ffffff'
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
    const root = document.documentElement
    root.lang = settings.language
    if (settings.theme === 'light') {
      root.classList.add('light-theme')
      // Keep the app UI dark even in "light" preference to preserve visibility
      // (mobile nav/status bars and icon dock stay consistent).
      root.classList.add('dark')
      root.classList.remove('dark-theme')
      root.style.colorScheme = 'dark'
    } else {
      root.classList.add('dark')
      root.classList.remove('light-theme')
      root.classList.remove('dark-theme')
      root.style.colorScheme = 'dark'
    }

    const accent = accentThemePresets[settings.accentTheme] ?? accentThemePresets.gold
    root.style.setProperty('--app-accent-a', accent.a)
    root.style.setProperty('--app-accent-b', accent.b)
    root.style.setProperty('--app-accent-fg', pickAccentForeground(accent.a))
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
