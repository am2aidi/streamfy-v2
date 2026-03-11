'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Lock, Mail } from 'lucide-react'
import { AdminLogo } from '@/components/admin/AdminLogo'
import { useAppSettings } from '@/components/AppSettingsProvider'
import { getTranslation, type TranslationKey } from '@/lib/translations'

const ADMIN_SESSION_KEY = 'streamfy-admin-session'

export default function AdminLoginPage() {
  const router = useRouter()
  const { settings } = useAppSettings()
  const t = (key: TranslationKey) => getTranslation(settings.language, key)
  const [email, setEmail] = useState('admin@streamfy.com')
  const [password, setPassword] = useState('admin123')
  const [error, setError] = useState('')

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email.toLowerCase() !== 'admin@streamfy.com' || password !== 'admin123') {
      setError(t('invalidAdminCredentials'))
      return
    }
    localStorage.setItem(ADMIN_SESSION_KEY, 'active')
    router.replace('/admin')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#020617] via-[#0f172a] to-black p-6 text-white">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-5xl items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] shadow-[0_25px_60px_rgba(2,6,23,0.6)] backdrop-blur-2xl lg:grid-cols-2">
          <div className="hidden flex-col justify-between bg-gradient-to-br from-[#f4a30a]/15 via-transparent to-[#e67e22]/15 p-8 lg:flex">
            <AdminLogo />
            <div>
              <h2 className="text-3xl font-black">STREAMFY ADMIN</h2>
              <p className="mt-3 max-w-sm text-sm text-slate-300">
                Secure access for content operations, analytics, ad campaigns, and full platform management.
              </p>
            </div>
          </div>

          <form onSubmit={submit} className="p-8">
            <div className="mb-8 lg:hidden">
              <AdminLogo />
            </div>
            <h1 className="text-2xl font-bold">{t('adminLogin')}</h1>
            <p className="mt-1 text-sm text-slate-400">{t('authorizedStaffOnly')}</p>

            <div className="mt-6 space-y-4">
              <label className="block">
                <span className="mb-1 block text-xs text-slate-400">{t('email')}</span>
                <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/30 px-3 py-2.5">
                  <Mail size={15} className="text-slate-500" />
                  <input
                    className="w-full bg-transparent text-sm outline-none"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </label>

              <label className="block">
                <span className="mb-1 block text-xs text-slate-400">{t('password')}</span>
                <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/30 px-3 py-2.5">
                  <Lock size={15} className="text-slate-500" />
                  <input
                    type="password"
                    className="w-full bg-transparent text-sm outline-none"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </label>
            </div>

            {error ? <p className="mt-3 text-sm text-[#EF4444]">{error}</p> : null}

            <button
              type="submit"
              className="mt-6 w-full rounded-xl bg-gradient-to-r from-[#f4a30a] to-[#e67e22] px-4 py-2.5 text-sm font-bold text-black"
            >
              {t('enterAdminPanel')}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
