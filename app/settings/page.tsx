'use client'

import { useEffect, useState, type ComponentType, type ReactNode } from 'react'
import {
  Bell,
  Camera,
  Check,
  ChevronRight,
  CreditCard,
  Download,
  Globe,
  Lock,
  LogOut,
  Mail,
  Moon,
  MessageCircle,
  Phone,
  Share2,
  Shield,
  Star,
  Trash2,
  User,
  Volume2,
  Zap,
  Instagram,
  Music2,
  Youtube,
  Facebook,
} from 'lucide-react'

import { Header } from '@/components/Header'
import { Sidebar } from '@/components/Sidebar'
import { accentThemePresets, useAppSettings, type AccentTheme } from '@/components/AppSettingsProvider'
import { useAuth } from '@/components/AuthProvider'
import { authHeaders, patchStoredAuthUser } from '@/lib/auth-client'
import { getTranslation, languages, type TranslationKey } from '@/lib/translations'
import { SocialShareLinks } from '@/components/SocialShareLinks'
import { BRAND_NAME } from '@/lib/brand'
import { useToast } from '@/hooks/use-toast'

type TabId = 'profile' | 'security' | 'preferences' | 'social' | 'subscription'

const tabs: Array<{ id: TabId; labelKey: TranslationKey; icon: ComponentType<{ size?: number }> }> = [
  { id: 'profile', labelKey: 'profile', icon: User },
  { id: 'security', labelKey: 'security', icon: Shield },
  { id: 'preferences', labelKey: 'preferences', icon: Moon },
  { id: 'social', labelKey: 'social', icon: Share2 },
  { id: 'subscription', labelKey: 'subscription', icon: CreditCard },
]

type SubscriptionPlanId = 'movie' | 'day' | 'week' | 'twoWeeks' | 'month'
type SubscriptionPlanIcon = 'Star' | 'Zap' | 'CreditCard'

type SubscriptionPlan = {
  id: SubscriptionPlanId
  label: string
  priceRwf: number
  desc: string
  icon: SubscriptionPlanIcon
  popular: boolean
}

const planIcons: Record<SubscriptionPlanIcon, ComponentType<{ size?: number; className?: string }>> = {
  Star,
  Zap,
  CreditCard,
}

const fallbackPaymentMethods = [
  { id: 'rw-mtn-airtel', title: 'MTN | Airtel Rwanda', desc: 'Koresha MTN cyangwa Airtel Mobile Money muri RWANDA', flag: '🇷🇼' },
  { id: 'visa-mastercard', title: 'VISA & MasterCard', desc: 'Koresha ikarita ya bank: VISA / MasterCard', flag: '💳' },
  { id: 'ug-mtn-airtel', title: 'MTN | Airtel Uganda', desc: 'Koresha MTN Uganda cyangwa Airtel Uganda', flag: '🇺🇬' },
  { id: 'ke-mpesa', title: 'MPESA Kenya', desc: 'Koresha MPESA niba uri muri KENYA', flag: '🇰🇪' },
  { id: 'zm-mtn-airtel-zamtel', title: 'MTN | AIRTEL | ZAMTEL (Zambia)', desc: 'Koresha MTN / Airtel / Zamtel niba uri muri ZAMBIA', flag: '🇿🇲' },
  { id: 'bi-lumicash-ecocash', title: 'LUMICASH | EcoCash (Burundi)', desc: 'Koresha Lumicash cyangwa EcoCash niba uri muri BURUNDI', flag: '🇧🇮' },
  { id: 'cd-airtel-vodacom-orange', title: 'AIRTEL | VODACOM | ORANGE (DRC)', desc: 'Koresha Airtel / Vodacom / Orange niba uri muri DRC', flag: '🇨🇩' },
  { id: 'tz-mpesa', title: 'MPESA Tanzania', desc: 'Koresha MPESA niba uri muri Tanzania', flag: '🇹🇿' },
  { id: 'cm-mtn-orange', title: 'MTN | ORANGE (Cameroon)', desc: 'Koresha MTN cyangwa Orange niba uri muri Cameroon', flag: '🇨🇲' },
] as const

const inputClass =
  'w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-gray-500 focus:border-[color:var(--app-accent-a)]/50 focus:outline-none transition-colors'

export default function SettingsPage() {
  const { settings, updateSetting } = useAppSettings()
  const { user } = useAuth()
  const { toast } = useToast()
  const t = (key: TranslationKey) => getTranslation(settings.language, key)
  const [activeTab, setActiveTab] = useState<TabId>('profile')
  const [showPayment, setShowPayment] = useState(false)
  const [payPhone, setPayPhone] = useState('+250')
  const [paymentId, setPaymentId] = useState<string | null>(null)
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'starting' | 'pending' | 'succeeded' | 'failed'>('idle')
  const [publicProfile, setPublicProfile] = useState(true)
  const [remotePlans, setRemotePlans] = useState<SubscriptionPlan[] | null>(null)
  const [remotePaymentMethods, setRemotePaymentMethods] = useState<
    Array<{ id: string; title: string; desc: string; flag: string }>
  >([])
  const [profileData, setProfileData] = useState({
    fullName: `${BRAND_NAME} User`,
    username: 'streamfyuser',
    email: 'user@streamfy.com',
    phone: '+250 798 123 456',
    bio: 'A passionate streaming enthusiast',
  })

  const accentThemes = Object.entries(accentThemePresets) as Array<[AccentTheme, (typeof accentThemePresets)[AccentTheme]]>

  useEffect(() => {
    const mode = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('mode') : null
    if (mode === 'gift') {
      setActiveTab('subscription')
      setShowPayment(true)
    }
  }, [])

  useEffect(() => {
    // Prefill payment phone from profile if available.
    const normalized = profileData.phone.replace(/\s+/g, '')
    if (normalized.startsWith('+')) setPayPhone(normalized)
  }, [profileData.phone])

  useEffect(() => {
    if (!user) return
    setProfileData((prev) => ({
      ...prev,
      fullName: user.name || prev.fullName,
      username: user.username || prev.username,
      email: user.email || prev.email,
      phone: user.phone || prev.phone,
    }))
  }, [user])

  useEffect(() => {
    const session = authHeaders()
    if (!session['x-session-token']) return

    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch('/api/user/profile', {
          cache: 'no-store',
          headers: {
            ...session,
          },
        })
        if (!res.ok) return
        const data = (await res.json()) as {
          profile?: {
            fullName?: string
            username?: string
            email?: string
            phone?: string
            bio?: string
            publicProfile?: boolean
          }
        }
        if (cancelled || !data.profile) return
        setProfileData((prev) => ({
          ...prev,
          fullName: data.profile?.fullName || prev.fullName,
          username: data.profile?.username || prev.username,
          email: data.profile?.email || prev.email,
          phone: data.profile?.phone || prev.phone,
          bio: data.profile?.bio || prev.bio,
        }))
        setPublicProfile(data.profile.publicProfile !== false)
      } catch {
        // ignore
      }
    })()

    return () => {
      cancelled = true
    }
  }, [])

  const fallbackPlans: SubscriptionPlan[] = [
    { id: 'movie', label: t('planMovieLabel'), priceRwf: 100, desc: t('planMovieDesc'), icon: 'Star', popular: false },
    { id: 'day', label: t('planDayLabel'), priceRwf: 200, desc: t('planDayDesc'), icon: 'Zap', popular: true },
    { id: 'week', label: t('planWeekLabel'), priceRwf: 400, desc: t('planWeekDesc'), icon: 'CreditCard', popular: false },
    { id: 'twoWeeks', label: t('planTwoWeeksLabel'), priceRwf: 700, desc: t('planTwoWeeksDesc'), icon: 'CreditCard', popular: false },
    { id: 'month', label: t('planMonthLabel'), priceRwf: 1000, desc: t('planMonthDesc'), icon: 'CreditCard', popular: false },
  ]

  useEffect(() => {
    let cancelled = false
    const controller = new AbortController()

    ;(async () => {
      try {
        const res = await fetch(`/api/subscription/plans?lang=${settings.language}`, { signal: controller.signal })
        if (!res.ok) throw new Error('Failed to load plans')
        const data = (await res.json()) as { plans: SubscriptionPlan[] }
        if (!cancelled) setRemotePlans(data.plans)
      } catch {
        if (!cancelled) setRemotePlans(null)
      }
    })()

    return () => {
      cancelled = true
      controller.abort()
    }
  }, [settings.language])

  useEffect(() => {
    let cancelled = false

    ;(async () => {
      try {
        const res = await fetch('/api/admin/settings', { cache: 'no-store' })
        if (!res.ok) return
        const data = (await res.json()) as {
          paymentMethods?: Array<{ id: string; label: string; enabled: boolean; feePercent: number }>
        }
        if (cancelled || !data.paymentMethods) return
        setRemotePaymentMethods(
          data.paymentMethods
            .filter((method) => method.enabled)
            .map((method) => ({
              id: method.id,
              title: method.label,
              desc: method.feePercent > 0 ? `Fee: ${method.feePercent}%` : 'No extra fee',
              flag: '💳',
            })),
        )
      } catch {
        // keep fallback methods
      }
    })()

    return () => {
      cancelled = true
    }
  }, [])

  const plans = remotePlans ?? fallbackPlans
  const paymentMethods = remotePaymentMethods.length ? remotePaymentMethods : fallbackPaymentMethods
  const selectedPlanData = plans.find((p) => p.id === (settings.subscriptionPlan as SubscriptionPlanId)) ?? plans[0]

  const initiateMoMoPayment = async () => {
    setPaymentStatus('starting')
    setPaymentId(null)
    try {
      const res = await fetch('/api/payments/momo/initiate', {
        method: 'POST',
        headers: { 'content-type': 'application/json', ...authHeaders() },
        body: JSON.stringify({
          phone: payPhone,
          amountRwf: selectedPlanData.priceRwf,
          planId: selectedPlanData.id,
        }),
      })
      if (!res.ok) throw new Error('initiate failed')
      const data = (await res.json()) as { paymentId: string; status: string }
      setPaymentId(data.paymentId)
      setPaymentStatus('pending')
    } catch {
      setPaymentStatus('failed')
    }
  }

  const saveProfile = async () => {
    const headers = authHeaders()
    if (!headers['x-session-token']) {
      toast({ title: 'Sign in required', description: 'Please sign in first.' })
      return
    }

    const res = await fetch('/api/user/profile', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        ...headers,
      },
      body: JSON.stringify({
        fullName: profileData.fullName,
        username: profileData.username,
        email: profileData.email,
        phone: profileData.phone,
        bio: profileData.bio,
        publicProfile,
      }),
    }).catch(() => null)

    if (!res?.ok) {
      const data = res ? (((await res.json().catch(() => null)) as null | { error?: string }) ?? null) : null
      toast({
        title: 'Save failed',
        description:
          data?.error === 'exists'
            ? 'That email, phone number, or username is already being used by another account.'
            : 'Could not update your profile.',
      })
      return
    }

    patchStoredAuthUser({
      name: profileData.fullName,
      username: profileData.username,
      email: profileData.email,
      phone: profileData.phone,
    })
    toast({ title: 'Profile saved', description: 'Your account details were updated.' })
  }

  useEffect(() => {
    if (!paymentId) return
    if (paymentStatus !== 'pending') return

    let cancelled = false
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/payments/momo/status/${paymentId}`)
        if (!res.ok) return
        const data = (await res.json()) as { payment: { status: string } }
        if (cancelled) return
        if (data.payment.status === 'succeeded') {
          setPaymentStatus('succeeded')
          setShowPayment(false)
          return
        }
        if (data.payment.status === 'failed' || data.payment.status === 'cancelled') {
          setPaymentStatus('failed')
        }
      } catch {
        // ignore polling errors
      }
    }, 1500)

    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [paymentId, paymentStatus])

  return (
    <div className="flex min-h-screen bg-black">
      <Sidebar />
      <div className="w-full md:ml-[92px] md:w-[calc(100vw-92px)] min-h-[100dvh] overflow-x-hidden pb-24 md:pb-8">
        <Header />
        <main className="mx-auto w-full max-w-[1280px] px-4 pb-10 sm:px-6">
          <section className="mb-6 rounded-2xl border border-[#f4a30a]/20 bg-gradient-to-r from-[#f4a30a]/10 to-transparent p-4 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#f4a30a] to-[#e67e22] text-xl font-bold text-white">
                  {profileData.fullName.charAt(0)}
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">Settings</h1>
                  <p className="text-sm text-gray-400">Manage your account, preferences, and security</p>
                </div>
              </div>
              <button
                onClick={() => setActiveTab('profile')}
                className="inline-flex items-center gap-2 rounded-xl border border-[#f4a30a]/30 bg-[#f4a30a]/10 px-4 py-2.5 text-sm font-medium text-[#f4a30a] hover:bg-[#f4a30a]/20"
              >
                Edit Profile <ChevronRight size={14} />
              </button>
            </div>
          </section>

          <section className="mb-6 overflow-x-auto rounded-xl border border-white/[0.06] bg-white/[0.03] p-1">
            <div className="flex min-w-max gap-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`inline-flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2.5 text-sm font-medium transition-all sm:px-4 ${
                    activeTab === tab.id ? 'bg-[#f4a30a] text-black' : 'text-gray-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <tab.icon size={14} />
                  {t(tab.labelKey)}
                </button>
              ))}
            </div>
          </section>

          {activeTab === 'profile' && (
            <section className="flex flex-col gap-4">
              <SettingsCard icon={User} title="Basic Information" description="Update your personal details">
                <Field label="Full Name" value={profileData.fullName} onChange={(v) => setProfileData((p) => ({ ...p, fullName: v }))} />
                <Field label="Username" value={profileData.username} onChange={(v) => setProfileData((p) => ({ ...p, username: v }))} />
                <Field label="Email Address" type="email" value={profileData.email} onChange={(v) => setProfileData((p) => ({ ...p, email: v }))} />
                <Field label="Phone Number" type="tel" value={profileData.phone} onChange={(v) => setProfileData((p) => ({ ...p, phone: v }))} />
                <div>
                  <label className="mb-2 block text-xs font-medium text-gray-400">Bio</label>
                  <textarea
                    value={profileData.bio}
                    onChange={(e) => setProfileData((p) => ({ ...p, bio: e.target.value }))}
                    className={`${inputClass} resize-none`}
                    rows={4}
                  />
                </div>
                <button onClick={() => void saveProfile()} className="rounded-xl bg-[#f4a30a] py-3 text-sm font-bold text-black">Save Changes</button>
              </SettingsCard>

              <SettingsCard icon={Camera} title="Profile Photo" description="Upload and manage your profile picture">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <button className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#f4a30a]/30 bg-[#f4a30a]/10 px-4 py-2 text-sm font-medium text-[#f4a30a]">
                    <Camera size={14} /> Upload Photo
                  </button>
                  <button className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-400">
                    <Trash2 size={14} /> Remove Photo
                  </button>
                </div>
              </SettingsCard>
            </section>
          )}

          {activeTab === 'security' && (
            <section className="flex flex-col gap-4">
              <SettingsCard icon={Lock} title="Password & Authentication" description="Protect your account">
                <ToggleRow label="Two-Factor Authentication (2FA)" enabled={settings.twoFactor} onToggle={() => updateSetting('twoFactor', !settings.twoFactor)} />
                <Divider />
                <ToggleRow label="Login Notifications" enabled={settings.loginNotifs} onToggle={() => updateSetting('loginNotifs', !settings.loginNotifs)} />
              </SettingsCard>

              <SettingsCard icon={Mail} title="Active Sessions" description="Manage devices logged into your account">
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4 text-sm text-gray-300">Chrome on Windows (Current)</div>
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4 text-sm text-gray-300">Safari on iPhone</div>
                <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
                  <p className="mb-3 text-xs text-red-400/70">Danger Zone</p>
                  <div className="flex flex-wrap gap-2">
                    <button className="inline-flex items-center gap-2 rounded-xl border border-red-500/20 px-4 py-2 text-sm text-red-400"><LogOut size={14} /> Log Out</button>
                    <button className="inline-flex items-center gap-2 rounded-xl border border-red-500/20 px-4 py-2 text-sm text-red-400"><Trash2 size={14} /> Delete Account</button>
                  </div>
                </div>
              </SettingsCard>
            </section>
          )}

          {activeTab === 'preferences' && (
            <section className="flex flex-col gap-4">
              <SettingsCard icon={Moon} title={t('display')} description="Customize your viewing experience">
                <ToggleRow label={t('dark')} enabled={settings.theme === 'dark'} onToggle={() => updateSetting('theme', settings.theme === 'dark' ? 'light' : 'dark')} />
              </SettingsCard>

              <SettingsCard icon={Check} title={t('advancedThemeColors')} description="Choose admin-style accent colors for the whole website">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-xs text-gray-400">Choose a style, or reset to the default website colors.</p>
                  <button
                    onClick={() => updateSetting('accentTheme', 'gold')}
                    className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-gray-200 hover:bg-white/[0.06]"
                  >
                    {t('defaultTheme')}
                  </button>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {accentThemes.map(([key, palette]) => {
                    const active = settings.accentTheme === key
                    return (
                      <button
                        key={key}
                        onClick={() => updateSetting('accentTheme', key)}
                        className={`rounded-xl border p-3 text-left transition-all ${
                          active ? 'streamfy-mirror-tile' : 'border-white/10 bg-white/[0.03] hover:bg-white/[0.06]'
                        }`}
                      >
                        <div className="mb-2 flex items-center justify-between">
                          <p className="text-sm font-semibold text-white">{palette.name}</p>
                          {active && <Check size={14} style={{ color: 'var(--app-accent-a)' }} />}
                        </div>
                        <div className="flex gap-2">
                          <span className="h-6 flex-1 rounded-lg" style={{ backgroundColor: palette.a }} />
                          <span className="h-6 flex-1 rounded-lg" style={{ backgroundColor: palette.b }} />
                        </div>
                      </button>
                    )
                  })}
                </div>
              </SettingsCard>

              <SettingsCard icon={Globe} title={t('localization')} description="Select your language and region">
                <div className="flex flex-wrap gap-1.5">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => updateSetting('language', lang.code)}
                      className={`rounded-lg border px-3 py-1.5 text-xs font-medium ${
                        settings.language === lang.code ? 'border-[#f4a30a]/30 bg-[#f4a30a]/15 text-[#f4a30a]' : 'border-white/10 text-gray-400'
                      }`}
                    >
                      {lang.name}
                    </button>
                  ))}
                </div>
              </SettingsCard>

              <SettingsCard icon={Volume2} title="Sound" description="Audio and playback settings">
                <ToggleRow label="Sound Effects" enabled={settings.soundEffects} onToggle={() => updateSetting('soundEffects', !settings.soundEffects)} />
              </SettingsCard>

              <SettingsCard icon={Bell} title="Notifications" description="Choose how we notify you">
                <ToggleRow label="Push Notifications" enabled={settings.pushNotifs} onToggle={() => updateSetting('pushNotifs', !settings.pushNotifs)} />
                <Divider />
                <ToggleRow label="Email Notifications" enabled={settings.emailNotifs} onToggle={() => updateSetting('emailNotifs', !settings.emailNotifs)} />
              </SettingsCard>
            </section>
          )}

          {activeTab === 'social' && (
            <section className="flex flex-col gap-4">
              <SettingsCard icon={Share2} title="Share Profile" description="Manage profile visibility">
                <ToggleRow label="Public Profile" enabled={publicProfile} onToggle={() => setPublicProfile(!publicProfile)} />
                {publicProfile && (
                  <>
                    <Field label="Profile Link" value="streamfy.com/u/streamfy" onChange={() => {}} disabled />
                    <SocialShareLinks targetUrl="https://streamfy.com/u/streamfy" title="Share To" />
                  </>
                )}
              </SettingsCard>
              <SettingsCard
                icon={Share2}
                title="Share Sports Page"
                description="Send friends a quick link to the sports hub"
              >
                <div className="grid gap-3 sm:grid-cols-2">
                  {[ 
                    { name: 'WhatsApp', icon: MessageCircle, href: 'https://wa.me/?text=Check%20out%20Streamfy%20Sports%3A%20https%3A%2F%2Fstreamfy.com%2Fsports', bg: 'bg-emerald-500/20', color: 'text-emerald-400' },
                    { name: 'Instagram', icon: Instagram, href: 'https://instagram.com/streamfy', bg: 'bg-pink-500/20', color: 'text-pink-400' },
                    { name: 'TikTok', icon: Music2, href: 'https://tiktok.com/@streamfy', bg: 'bg-cyan-500/20', color: 'text-cyan-300' },
                    { name: 'YouTube', icon: Youtube, href: 'https://youtube.com/@streamfy', bg: 'bg-red-500/20', color: 'text-red-400' },
                    { name: 'Facebook', icon: Facebook, href: 'https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Fstreamfy.com%2Fsports', bg: 'bg-blue-500/20', color: 'text-blue-400' },
                  ].map((item) => (
                    <a
                      key={item.name}
                      href={item.href}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm text-gray-200 hover:bg-white/[0.05]"
                    >
                      <span className="inline-flex items-center gap-2">
                        <span className={`flex h-7 w-7 items-center justify-center rounded-full ${item.bg} ${item.color}`}>
                          <item.icon size={14} />
                        </span>
                        {item.name}
                      </span>
                      <span className="text-xs text-gray-400">Share</span>
                    </a>
                  ))}
                </div>
                <CopyLinkAction url="https://streamfy.com/sports" label="Copy Sports Link" />
              </SettingsCard>
            </section>
          )}

          {activeTab === 'subscription' && (
            <section className="space-y-4">
              <SettingsCard icon={Star} title={t('subscriptionCurrentPlanTitle')} description={t('subscriptionCurrentPlanDesc')}>
                <div className="rounded-xl border border-[color:var(--app-accent-a)]/20 bg-[color:var(--app-accent-a)]/10 p-4">
                  <p className="text-white">
                    {selectedPlanData.label} - {selectedPlanData.priceRwf} RWF
                  </p>
                  <p className="text-xs text-[color:var(--app-accent-a)]">
                    {t('subscriptionNextBillingLabel')}: March 18, 2026
                  </p>
                </div>
              </SettingsCard>

              <SettingsCard icon={CreditCard} title={t('subscriptionChoosePlanTitle')} description={t('subscriptionChoosePlanDesc')}>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                  {plans.map((plan) => {
                    const active = settings.subscriptionPlan === plan.id
                    const Icon = planIcons[plan.icon]
                    return (
                      <button
                        key={plan.id}
                        onClick={() => {
                          updateSetting('subscriptionPlan', plan.id)
                          setShowPayment(true)
                        }}
                        className={`w-full rounded-2xl border p-4 text-left transition-colors ${
                          active
                            ? 'border-[color:var(--app-accent-a)]/45 bg-[color:var(--app-accent-a)]/10'
                            : 'border-white/10 bg-white/[0.03] hover:bg-white/[0.06]'
                        }`}
                      >
                        <div className="mb-3 flex items-center justify-between gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5">
                            <Icon size={16} className="text-[color:var(--app-accent-a)]" />
                          </div>
                          {plan.popular ? (
                            <span className="rounded-full border border-[color:var(--app-accent-a)]/35 bg-[color:var(--app-accent-a)]/10 px-2.5 py-1 text-[10px] font-semibold text-[color:var(--app-accent-a)]">
                              {t('mostPopular')}
                            </span>
                          ) : null}
                        </div>
                        <p className="text-sm font-bold text-white">{plan.label}</p>
                        <p className="mt-1 text-lg font-extrabold text-[color:var(--app-accent-a)]">{plan.priceRwf} RWF</p>
                        <p className="mt-1 text-xs text-gray-400">{plan.desc}</p>
                      </button>
                    )
                  })}
                </div>
              </SettingsCard>

              {showPayment && (
                <SettingsCard icon={Phone} title={t('subscriptionPaymentTitle')} description={t('subscriptionPaymentDesc')}>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-xs text-gray-400">
                      {t('subscriptionPlanLabel')}: <span className="text-white font-semibold">{selectedPlanData.label}</span> - {t('subscriptionAmountLabel')}:&nbsp;
                      <span className="text-white font-semibold">{selectedPlanData.priceRwf} RWF</span>
                    </p>
                    <button
                      onClick={() => setShowPayment(false)}
                      className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-gray-200 hover:bg-white/[0.06]"
                    >
                      {t('close')}
                    </button>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <p className="text-sm font-semibold text-white">{t('payNowLabel')}</p>
                    <p className="mt-1 text-xs text-gray-400">{t('momoPromptHint')}</p>
                    <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
                      <div>
                        <label className="mb-2 block text-xs font-medium text-gray-400">{t('phoneNumberLabel')}</label>
                        <input
                          value={payPhone}
                          onChange={(e) => setPayPhone(e.target.value)}
                          placeholder="+2507xxxxxxxx"
                          className={inputClass}
                        />
                        <p className="mt-1 text-[11px] text-gray-500">{t('phoneNumberHint')}</p>
                      </div>
                      <button
                        onClick={initiateMoMoPayment}
                        className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[color:var(--app-accent-a)] px-5 text-sm font-semibold text-[color:var(--app-accent-fg)] hover:bg-[color:var(--app-accent-a)]/90"
                      >
                        {paymentStatus === 'starting' ? t('paymentStarting') : t('payNowLabel')}
                      </button>
                    </div>

                    {paymentStatus === 'pending' ? (
                      <p className="mt-3 text-sm text-[color:var(--app-accent-a)]">{t('paymentPending')}</p>
                    ) : null}
                    {paymentStatus === 'failed' ? (
                      <p className="mt-3 text-sm text-red-400">{t('paymentFailed')}</p>
                    ) : null}

                    {paymentId && process.env.NODE_ENV !== 'production' ? (
                      <div className="mt-3 flex flex-wrap gap-2">
                        <button
                          onClick={async () => {
                            await fetch('/api/payments/momo/mock/approve', {
                              method: 'POST',
                              headers: { 'content-type': 'application/json', ...authHeaders() },
                              body: JSON.stringify({ paymentId }),
                            })
                          }}
                          className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-gray-200 hover:bg-white/[0.06]"
                        >
                          {t('simulateApproveLabel')}
                        </button>
                      </div>
                    ) : null}
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {paymentMethods.map((method) => {
                      const active = settings.paymentMethod === method.id
                      return (
                        <div
                          key={method.id}
                          className={`rounded-2xl border p-4 shadow-[0_18px_50px_rgba(0,0,0,0.25)] ${
                            active ? 'border-[color:var(--app-accent-a)]/30 bg-[color:var(--app-accent-a)]/10' : 'border-white/10 bg-black/30'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-white">{method.title}</p>
                              <p className="mt-2 line-clamp-3 text-xs text-gray-400">{method.desc}</p>
                            </div>
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-lg">
                              {method.flag}
                            </div>
                          </div>

                          <button
                            onClick={() => updateSetting('paymentMethod', method.id)}
                            className={`mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-colors ${
                              active
                                ? 'bg-[color:var(--app-accent-a)] text-[color:var(--app-accent-fg)]'
                                : 'bg-[color:var(--app-accent-a)]/90 text-[color:var(--app-accent-fg)] hover:bg-[color:var(--app-accent-a)]'
                            }`}
                          >
                            <Check size={16} />
                            {t('continueLabel')}
                          </button>
                        </div>
                      )
                    })}
                  </div>
                </SettingsCard>
              )}

              <SettingsCard icon={Download} title="Mobile Application" description={`Download ${BRAND_NAME} on your smartphone`}>
                <div className="flex flex-col gap-3">
                  <button className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#f4a30a]/30 bg-[#f4a30a]/10 px-4 py-3 text-[#f4a30a]"><Download size={16} /> Download for iOS</button>
                  <button className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#f4a30a]/30 bg-[#f4a30a]/10 px-4 py-3 text-[#f4a30a]"><Download size={16} /> Download for Android</button>
                </div>
              </SettingsCard>
            </section>
          )}
        </main>
      </div>
    </div>
  )
}

function SettingsCard({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon?: ComponentType<{ size?: number; className?: string }>
  title: string
  description?: string
  children: ReactNode
}) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5 sm:p-6">
      <div className="mb-5 flex items-start gap-3">
        {Icon && (
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f4a30a]/10">
            <Icon size={16} className="text-[#f4a30a]" />
          </div>
        )}
        <div>
          <h3 className="text-sm font-bold text-white">{title}</h3>
          {description && <p className="mt-0.5 text-xs text-gray-500">{description}</p>}
        </div>
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  )
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
  disabled,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  type?: string
  disabled?: boolean
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-medium text-gray-400">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={`${inputClass} ${disabled ? 'cursor-not-allowed opacity-60' : ''}`}
      />
    </div>
  )
}

function ToggleRow({
  label,
  enabled,
  onToggle,
}: {
  label: string
  enabled: boolean
  onToggle: () => void
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm text-gray-200">{label}</span>
      <button
        onClick={onToggle}
        className={`relative h-6 w-11 rounded-full transition-colors duration-200 ${enabled ? 'bg-[#f4a30a]' : 'bg-white/15'}`}
      >
        <span className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-all ${enabled ? 'left-6' : 'left-1'}`} />
      </button>
    </div>
  )
}

function Divider() {
  return <div className="border-t border-white/[0.04]" />
}

function CopyLinkAction({ url, label }: { url: string; label: string }) {
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url)
    } catch {
      // ignore
    }
  }

  return (
    <button
      onClick={copyLink}
      className="inline-flex items-center gap-2 rounded-xl border border-[#f4a30a]/30 bg-[#f4a30a]/10 px-3 py-2 text-xs font-medium text-[#f4a30a]"
    >
      <Share2 size={13} />
      {label}
    </button>
  )
}

