'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useToast } from '@/hooks/use-toast'
import { languages, type Language, type TranslationKey, translations } from '@/lib/translations'

type SocialLink = { name: 'TikTok' | 'WhatsApp' | 'YouTube'; url: string; enabled: boolean }
type PaymentMethod = { id: string; label: string; enabled: boolean; feePercent: number }
type FilterOptions = { movies: string[]; music: string[]; sports: string[] }

const defaultSocial: SocialLink[] = [
  { name: 'TikTok', url: 'https://tiktok.com/@streamfy', enabled: true },
  { name: 'WhatsApp', url: 'https://wa.me/250700000000', enabled: true },
  { name: 'YouTube', url: 'https://youtube.com/@streamfy', enabled: true },
]

const defaultPayments: PaymentMethod[] = [
  { id: 'rw-mtn-airtel', label: 'MTN | Airtel Rwanda', enabled: true, feePercent: 0 },
  { id: 'visa-mastercard', label: 'VISA & MasterCard', enabled: true, feePercent: 2.5 },
  { id: 'ke-mpesa', label: 'MPESA Kenya', enabled: true, feePercent: 1.2 },
]

const defaultFilters: FilterOptions = {
  movies: ['Action', 'Comedy', 'Sci-Fi', 'Drama'],
  music: ['Pop', 'Rap', 'EDM'],
  sports: ['Football', 'Basketball', 'Volleyball'],
}

export default function AdminSettingsPage() {
  const { toast } = useToast()
  const [social, setSocial] = useState<SocialLink[]>(defaultSocial)
  const [payments, setPayments] = useState<PaymentMethod[]>(defaultPayments)
  const [filters, setFilters] = useState<FilterOptions>(defaultFilters)
  const [playlists, setPlaylists] = useState<string[]>(['Workout Mix', 'Night Drive'])
  const [newPlaylist, setNewPlaylist] = useState('')
  const [lang, setLang] = useState<Language>('en')
  const [key, setKey] = useState<TranslationKey>('watchNow')
  const [translationOverrides, setTranslationOverrides] = useState<Partial<Record<Language, Partial<Record<TranslationKey, string>>>>>({})
  const [value, setValue] = useState('')

  const resolveTranslationValue = useCallback(
    (
      nextLang: Language,
      nextKey: TranslationKey,
      overrides = translationOverrides,
    ) => {
      const selected = translations[nextLang] as Partial<Record<TranslationKey, string>>
      const fallback = translations.en as Record<TranslationKey, string>
      return overrides[nextLang]?.[nextKey] ?? selected[nextKey] ?? fallback[nextKey] ?? ''
    },
    [translationOverrides],
  )

  useEffect(() => {
    let cancelled = false

    ;(async () => {
      try {
        const res = await fetch('/api/admin/settings', { cache: 'no-store' })
        if (!res.ok) return
        const data = (await res.json()) as {
          socialLinks?: SocialLink[]
          paymentMethods?: PaymentMethod[]
          filterOptions?: FilterOptions
          playlistPresets?: { name: string }[]
          translationOverrides?: Partial<Record<Language, Partial<Record<TranslationKey, string>>>>
        }

        if (cancelled) return

        setSocial(data.socialLinks?.length ? data.socialLinks : defaultSocial)
        setPayments(data.paymentMethods?.length ? data.paymentMethods : defaultPayments)
        setFilters(data.filterOptions ?? defaultFilters)
        setPlaylists(data.playlistPresets?.length ? data.playlistPresets.map((item) => item.name) : ['Workout Mix', 'Night Drive'])
        const overrides = data.translationOverrides ?? {}
        setTranslationOverrides(overrides)
        if (typeof window !== 'undefined') {
          localStorage.setItem('streamfy-translation-overrides', JSON.stringify(overrides))
        }
        setValue(resolveTranslationValue('en', 'watchNow', overrides))
      } catch {
        // keep defaults
      }
    })()

    return () => {
      cancelled = true
    }
  }, [resolveTranslationValue])

  const saveSection = async (section: string, items: unknown, description: string) => {
    await fetch('/api/admin/settings', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ section, items }),
    })
    toast({ title: 'Saved', description })
  }

  const saveSocial = async () => {
    await saveSection('socialLinks', social, 'Social links updated.')
  }

  const savePayments = async () => {
    const invalid = payments.find((p) => p.feePercent < 0 || p.feePercent > 100)
    if (invalid) {
      toast({ title: 'Invalid fee', description: `${invalid.label} fee must be 0-100%.` })
      return
    }
    await saveSection('paymentMethods', payments, 'Payment methods updated.')
  }

  const saveFilters = async () => {
    await saveSection('filterOptions', filters, 'Filter options updated.')
  }

  const savePlaylists = async () => {
    await saveSection('playlistPresets', playlists, 'Playlist options updated.')
  }

  const saveTranslation = async () => {
    if (!value.trim()) {
      toast({ title: 'Missing value', description: 'Translation text is required.' })
      return
    }
    const next = {
      ...translationOverrides,
      [lang]: {
        ...(translationOverrides[lang] ?? {}),
        [key]: value.trim(),
      },
    }
    setTranslationOverrides(next)
    if (typeof window !== 'undefined') {
      localStorage.setItem('streamfy-translation-overrides', JSON.stringify(next))
    }
    await fetch('/api/admin/settings', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ section: 'translationOverride', language: lang, key, value }),
    })
    toast({ title: 'Translation saved', description: `${lang} -> ${key}` })
  }

  const allKeys = useMemo(() => Object.keys(translations.en) as TranslationKey[], [])

  return (
    <div className="space-y-5">
      <h2 className="text-xl font-bold">Admin Settings</h2>

      <section className="flex flex-col gap-4">
        <article className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
          <h3 className="text-sm font-semibold">Social Media Links</h3>
          <div className="mt-4 space-y-3">
            {social.map((item, idx) => (
              <div key={item.name} className="rounded-xl border border-white/10 bg-black/25 p-3">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-sm font-medium">{item.name}</p>
                  <label className="inline-flex items-center gap-2 text-xs">
                    <input
                      type="checkbox"
                      checked={item.enabled}
                      onChange={(e) => setSocial((prev) => prev.map((s, i) => (i === idx ? { ...s, enabled: e.target.checked } : s)))}
                      className="accent-[#f4a30a]"
                    />
                    Enabled
                  </label>
                </div>
                <input
                  value={item.url}
                  onChange={(e) => setSocial((prev) => prev.map((s, i) => (i === idx ? { ...s, url: e.target.value } : s)))}
                  className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm"
                />
              </div>
            ))}
            <button onClick={() => void saveSocial()} className="rounded-xl bg-[#f4a30a] px-4 py-2 text-sm font-semibold text-black">Save Social Links</button>
          </div>
        </article>

        <article className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
          <h3 className="text-sm font-semibold">Payment Methods</h3>
          <div className="mt-4 space-y-3">
            {payments.map((item, idx) => (
              <div key={item.id} className="rounded-xl border border-white/10 bg-black/25 p-3">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-sm font-medium">{item.label}</p>
                  <label className="inline-flex items-center gap-2 text-xs">
                    <input
                      type="checkbox"
                      checked={item.enabled}
                      onChange={(e) => setPayments((prev) => prev.map((p, i) => (i === idx ? { ...p, enabled: e.target.checked } : p)))}
                      className="accent-[#f4a30a]"
                    />
                    Enabled
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Fee %</span>
                  <input
                    type="number"
                    value={item.feePercent}
                    onChange={(e) => setPayments((prev) => prev.map((p, i) => (i === idx ? { ...p, feePercent: Number(e.target.value) } : p)))}
                    className="w-24 rounded-lg border border-white/10 bg-black/30 px-2 py-1.5 text-sm"
                  />
                </div>
              </div>
            ))}
            <button onClick={() => void savePayments()} className="rounded-xl bg-[#f4a30a] px-4 py-2 text-sm font-semibold text-black">Save Payment Methods</button>
          </div>
        </article>
      </section>

      <section className="flex flex-col gap-4">
        <article className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
          <h3 className="text-sm font-semibold">Filter Options Manager</h3>
          <div className="mt-4 space-y-3">
            {(['movies', 'music', 'sports'] as const).map((section) => (
              <div key={section}>
                <p className="mb-1 text-xs uppercase tracking-wider text-slate-400">{section}</p>
                <div className="flex flex-wrap gap-2">
                  {filters[section].map((item, idx) => (
                    <span key={`${section}-${idx}`} className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-xs">
                      {item}
                      <button
                        onClick={() => setFilters((prev) => ({ ...prev, [section]: prev[section].filter((_, i) => i !== idx) }))}
                        className="text-red-300"
                      >
                        x
                      </button>
                    </span>
                  ))}
                  <button
                    onClick={() => {
                      const next = prompt(`Add ${section} filter option`)
                      if (!next) return
                      setFilters((prev) => ({ ...prev, [section]: [...prev[section], next] }))
                    }}
                    className="rounded-full border border-[#f4a30a]/40 bg-[#f4a30a]/10 px-2.5 py-1 text-xs text-[#ffd089]"
                  >
                    + Add
                  </button>
                </div>
              </div>
            ))}
            <button onClick={() => void saveFilters()} className="rounded-xl bg-[#f4a30a] px-4 py-2 text-sm font-semibold text-black">Save Filter Options</button>
          </div>
        </article>

        <article className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
          <h3 className="text-sm font-semibold">Playlists Manager</h3>
          <div className="mt-4 space-y-3">
            <div className="flex gap-2">
              <input
                value={newPlaylist}
                onChange={(e) => setNewPlaylist(e.target.value)}
                placeholder="New playlist name"
                className="flex-1 rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm"
              />
              <button
                onClick={() => {
                  if (!newPlaylist.trim()) return
                  setPlaylists((prev) => [...prev, newPlaylist.trim()])
                  setNewPlaylist('')
                }}
                className="rounded-xl border border-[#f4a30a]/40 bg-[#f4a30a]/10 px-3 py-2 text-sm text-[#ffd089]"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {playlists.map((p, idx) => (
                <span key={`${p}-${idx}`} className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-xs">
                  {p}
                  <button onClick={() => setPlaylists((prev) => prev.filter((_, i) => i !== idx))} className="text-red-300">x</button>
                </span>
              ))}
            </div>
            <button onClick={() => void savePlaylists()} className="rounded-xl bg-[#f4a30a] px-4 py-2 text-sm font-semibold text-black">Save Playlists</button>
          </div>
        </article>
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
        <h3 className="text-sm font-semibold">Language Translation Manager</h3>
        <div className="mt-4 grid gap-3 md:grid-cols-[180px_220px_1fr_auto]">
          <select
            value={lang}
            onChange={(e) => {
              const nextLang = e.target.value as Language
              setLang(nextLang)
              setValue(resolveTranslationValue(nextLang, key))
            }}
            className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm"
          >
            {languages.map((l) => (
              <option key={l.code} value={l.code}>{l.name}</option>
            ))}
          </select>
          <select
            value={key}
            onChange={(e) => {
              const nextKey = e.target.value as TranslationKey
              setKey(nextKey)
              setValue(resolveTranslationValue(lang, nextKey))
            }}
            className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm"
          >
            {allKeys.map((k) => (
              <option key={k} value={k}>{k}</option>
            ))}
          </select>
          <input value={value} onChange={(e) => setValue(e.target.value)} className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm" />
          <button onClick={() => void saveTranslation()} className="rounded-xl bg-[#f4a30a] px-4 py-2 text-sm font-semibold text-black">Save</button>
        </div>
        <p className="mt-2 text-xs text-slate-400">Changes apply instantly to UI text and are saved in the database.</p>
      </section>
    </div>
  )
}
