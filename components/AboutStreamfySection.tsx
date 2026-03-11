'use client'

import Link from 'next/link'
import { useAppSettings } from '@/components/AppSettingsProvider'
import { getTranslation } from '@/lib/translations'

export function AboutStreamfySection() {
  const { settings } = useAppSettings()
  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(settings.language, key)

  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-6 md:p-8">
      <div className="flex max-w-3xl flex-col gap-3">
        <h2 className="text-2xl font-bold text-white">{t('aboutStreamfyTitle')}</h2>
        <p className="text-sm text-gray-300 md:text-base">{t('aboutStreamfyDesc')}</p>
        <div className="flex gap-3 pt-2">
          <Link
            href="/about"
            className="inline-flex items-center rounded-xl bg-[#f4a30a] px-4 py-2.5 text-sm font-semibold text-black"
          >
            {t('learnMore')}
          </Link>
          <Link
            href="/movies"
            className="inline-flex items-center rounded-xl border border-white/20 px-4 py-2.5 text-sm font-medium text-white"
          >
            {t('startExploring')}
          </Link>
        </div>
      </div>
    </section>
  )
}

