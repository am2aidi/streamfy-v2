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
  Phone,
  Share2,
  Shield,
  Smartphone as MobileIcon,
  Star,
  Trash2,
  User,
  Volume2,
  Zap,
} from 'lucide-react'

import { Header } from '@/components/Header'
import { Sidebar } from '@/components/Sidebar'
import { accentThemePresets, useAppSettings, type AccentTheme } from '@/components/AppSettingsProvider'
import { languages } from '@/lib/translations'
import { SocialShareLinks } from '@/components/SocialShareLinks'

type TabId = 'profile' | 'security' | 'preferences' | 'social' | 'subscription' | 'connections'

const tabs: Array<{ id: TabId; label: string; icon: ComponentType<{ size?: number }> }> = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'preferences', label: 'Preferences', icon: Moon },
  { id: 'social', label: 'Social', icon: Share2 },
  { id: 'subscription', label: 'Subscription', icon: CreditCard },
  { id: 'connections', label: 'Connections', icon: Globe },
]

const plans = [
  { id: 'movie', label: 'Per Movie', price: '100 RWF', desc: 'Watch any single movie', icon: Star },
  { id: 'weekly', label: 'Weekly', price: '500 RWF', desc: 'Unlimited access for 7 days', icon: Zap, popular: true },
  { id: 'monthly', label: 'Monthly', price: '1,500 RWF', desc: 'Unlimited access for 30 days', icon: CreditCard },
]

const inputClass =
  'w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-gray-500 focus:border-[#f4a30a]/50 focus:outline-none transition-colors'

export default function SettingsPage() {
  const { settings, updateSetting } = useAppSettings()
  const [activeTab, setActiveTab] = useState<TabId>('profile')
  const [showPayment, setShowPayment] = useState(false)
  const [publicProfile, setPublicProfile] = useState(true)
  const [apps, setApps] = useState({ spotify: true, appleMusic: false, youtube: true })
  const [profileData, setProfileData] = useState({
    fullName: 'Streamfy User',
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

  return (
    <div className="flex min-h-screen bg-black">
      <Sidebar />
      <div className="ml-[92px] w-[calc(100vw-92px)] min-h-[100dvh] overflow-x-hidden pb-8">
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
                  {tab.label}
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
                <button className="rounded-xl bg-[#f4a30a] py-3 text-sm font-bold text-black">Save Changes</button>
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
              <SettingsCard icon={Moon} title="Display" description="Customize your viewing experience">
                <ToggleRow label="Dark Theme" enabled={settings.theme === 'dark'} onToggle={() => updateSetting('theme', settings.theme === 'dark' ? 'light' : 'dark')} />
              </SettingsCard>

              <SettingsCard icon={Check} title="Advanced Theme Colors" description="Choose admin-style accent colors for the whole website">
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

              <SettingsCard icon={Globe} title="Localization" description="Select your language and region">
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
            </section>
          )}

          {activeTab === 'subscription' && (
            <section className="space-y-4">
              <SettingsCard icon={Star} title="Current Plan" description="Your active subscription">
                <div className="rounded-xl border border-[#f4a30a]/20 bg-[#f4a30a]/10 p-4">
                  <p className="text-white">Weekly Plan - 500 RWF / week</p>
                  <p className="text-xs text-emerald-400">Next billing date: March 10, 2026</p>
                </div>
              </SettingsCard>

              <SettingsCard icon={CreditCard} title="Upgrade / Downgrade" description="Change your subscription plan">
                <div className="flex flex-col gap-3">
                  {plans.map((plan) => (
                    <button
                      key={plan.id}
                      onClick={() => setShowPayment(true)}
                      className={`rounded-xl border p-4 text-left ${plan.popular ? 'border-[#f4a30a]/40 bg-[#f4a30a]/10' : 'border-white/[0.06] bg-white/[0.03]'}`}
                    >
                      <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-white/5"><plan.icon size={16} className="text-[#f4a30a]" /></div>
                      <p className="text-sm font-bold text-white">{plan.label}</p>
                      <p className="text-[#f4a30a]">{plan.price}</p>
                      <p className="text-xs text-gray-500">{plan.desc}</p>
                    </button>
                  ))}
                </div>
              </SettingsCard>

              {showPayment && (
                <SettingsCard icon={Phone} title="Payment Method" description="Choose payment method">
                  <div className="flex flex-col gap-2">
                    {['RW Mobile Money', 'Visa & Mastercard', 'MPESA'].map((method) => (
                      <button key={method} className="rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-3 text-left text-sm text-white hover:bg-white/[0.06]">
                        {method}
                      </button>
                    ))}
                  </div>
                </SettingsCard>
              )}

              <SettingsCard icon={Download} title="Mobile Application" description="Download Streamfy on your smartphone">
                <div className="flex flex-col gap-3">
                  <button className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#f4a30a]/30 bg-[#f4a30a]/10 px-4 py-3 text-[#f4a30a]"><Download size={16} /> Download for iOS</button>
                  <button className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#f4a30a]/30 bg-[#f4a30a]/10 px-4 py-3 text-[#f4a30a]"><Download size={16} /> Download for Android</button>
                </div>
              </SettingsCard>
            </section>
          )}

          {activeTab === 'connections' && (
            <section>
              <SettingsCard icon={MobileIcon} title="Connected Apps" description="Manage your connected services">
                <ToggleRow label="Spotify" enabled={apps.spotify} onToggle={() => setApps((p) => ({ ...p, spotify: !p.spotify }))} />
                <Divider />
                <ToggleRow label="Apple Music" enabled={apps.appleMusic} onToggle={() => setApps((p) => ({ ...p, appleMusic: !p.appleMusic }))} />
                <Divider />
                <ToggleRow label="YouTube" enabled={apps.youtube} onToggle={() => setApps((p) => ({ ...p, youtube: !p.youtube }))} />
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
