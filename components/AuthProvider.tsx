'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import Image from 'next/image'
import { Eye, EyeOff, Lock, Mail, UserPlus, X } from 'lucide-react'
import { useAppSettings } from '@/components/AppSettingsProvider'
import { getTranslation, type TranslationKey } from '@/lib/translations'

type AuthMode = 'signin' | 'signup'

interface AuthUser {
  id: string
  email?: string
  phone?: string
  provider?: 'email' | 'gmail' | 'facebook' | 'twitter' | 'pro'
}

interface StoredUser extends AuthUser {
  password: string
}

interface AuthContextType {
  user: AuthUser | null
  isAuthenticated: boolean
  openSignIn: (reason?: string) => void
  openSignUp: (reason?: string) => void
  logout: () => void
  requireAuth: (onAuthorized: () => void, reason?: string) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const STORAGE_USERS_KEY = 'streamfy-users'
const STORAGE_SESSION_KEY = 'streamfy-auth-session'
const DEFAULT_DEMO_USER: StoredUser = {
  id: 'u-demo',
  email: 'joe.don@example.com',
  password: 'streamfy123',
  provider: 'email',
}

const countryCodes = [
  { code: '+250', label: 'Rwanda', flag: '🇷🇼' },
  { code: '+256', label: 'Uganda', flag: '🇺🇬' },
  { code: '+254', label: 'Kenya', flag: '🇰🇪' },
  { code: '+255', label: 'Tanzania', flag: '🇹🇿' },
  { code: '+257', label: 'Burundi', flag: '🇧🇮' },
  { code: '+260', label: 'Zambia', flag: '🇿🇲' },
  { code: '+237', label: 'Cameroon', flag: '🇨🇲' },
  { code: '+234', label: 'Nigeria', flag: '🇳🇬' },
  { code: '+233', label: 'Ghana', flag: '🇬🇭' },
  { code: '+20', label: 'Egypt', flag: '🇪🇬' },
  { code: '+27', label: 'South Africa', flag: '🇿🇦' },
  { code: '+1', label: 'United States', flag: '🇺🇸' },
  { code: '+44', label: 'United Kingdom', flag: '🇬🇧' },
  { code: '+33', label: 'France', flag: '🇫🇷' },
  { code: '+49', label: 'Germany', flag: '🇩🇪' },
  { code: '+39', label: 'Italy', flag: '🇮🇹' },
  { code: '+34', label: 'Spain', flag: '🇪🇸' },
  { code: '+55', label: 'Brazil', flag: '🇧🇷' },
  { code: '+52', label: 'Mexico', flag: '🇲🇽' },
  { code: '+971', label: 'UAE', flag: '🇦🇪' },
  { code: '+91', label: 'India', flag: '🇮🇳' },
  { code: '+92', label: 'Pakistan', flag: '🇵🇰' },
  { code: '+81', label: 'Japan', flag: '🇯🇵' },
  { code: '+82', label: 'South Korea', flag: '🇰🇷' },
  { code: '+86', label: 'China', flag: '🇨🇳' },
  { code: '+61', label: 'Australia', flag: '🇦🇺' },
]

const authBackdropPosters = [
  '/dark-pursuit.jpg',
  '/top-rated.jpg',
  '/champions-league.jpg',
  '/now-in-theaters.jpg',
  '/music-featured.jpg',
  '/trending-songs.jpg',
  '/new-releases.jpg',
  '/pop-hits.jpg',
]

export function AuthProvider({ children }: { children: ReactNode }) {
  const { settings } = useAppSettings()
  const t = (key: TranslationKey) => getTranslation(settings.language, key)
  const [user, setUser] = useState<AuthUser | null>(null)
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<AuthMode>('signin')
  const [reason, setReason] = useState('')
  const pendingActionRef = useRef<(() => void) | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    try {
      const rawUsers = localStorage.getItem(STORAGE_USERS_KEY)
      if (!rawUsers) {
        localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify([DEFAULT_DEMO_USER]))
      }
      const rawSession = localStorage.getItem(STORAGE_SESSION_KEY)
      if (rawSession) {
        setUser(JSON.parse(rawSession) as AuthUser)
      } else if (localStorage.getItem('streamfy-session') === 'active') {
        const compatUser: AuthUser = {
          id: 'u-compat',
          email: 'joe.don@example.com',
          provider: 'email',
        }
        setUser(compatUser)
        localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(compatUser))
      }
    } catch {
      // ignore malformed local storage
    } finally {
      setReady(true)
    }
  }, [])

  const commitAuth = useCallback((next: AuthUser) => {
    setUser(next)
    localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(next))
    localStorage.setItem('streamfy-session', 'active')
    setOpen(false)
    const pending = pendingActionRef.current
    pendingActionRef.current = null
    if (pending) pending()
  }, [])

  const openSignIn = useCallback((nextReason?: string) => {
    setMode('signin')
    setReason(nextReason ?? '')
    setOpen(true)
  }, [])

  const openSignUp = useCallback((nextReason?: string) => {
    setMode('signup')
    setReason(nextReason ?? '')
    setOpen(true)
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    localStorage.removeItem(STORAGE_SESSION_KEY)
    localStorage.removeItem('streamfy-session')
  }, [])

  const requireAuth = useCallback(
    (onAuthorized: () => void, nextReason?: string) => {
      if (user) {
        onAuthorized()
        return
      }
      pendingActionRef.current = onAuthorized
      setMode('signin')
      setReason(nextReason ?? t('authRequiredDefault'))
      setOpen(true)
    },
    [t, user]
  )

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      openSignIn,
      openSignUp,
      logout,
      requireAuth,
    }),
    [logout, openSignIn, openSignUp, requireAuth, user]
  )

  return (
    <AuthContext.Provider value={value}>
      {children}
      {ready ? (
        <AuthModal
          open={open}
          mode={mode}
          reason={reason}
          onClose={() => setOpen(false)}
          onModeChange={setMode}
          onAuthSuccess={commitAuth}
        />
      ) : null}
    </AuthContext.Provider>
  )
}

interface AuthModalProps {
  open: boolean
  mode: AuthMode
  reason: string
  onClose: () => void
  onModeChange: (mode: AuthMode) => void
  onAuthSuccess: (user: AuthUser) => void
}

function AuthModal({ open, mode, reason, onClose, onModeChange, onAuthSuccess }: AuthModalProps) {
  const [identifier, setIdentifier] = useState('joe.don@example.com')
  const [signInCountryCode, setSignInCountryCode] = useState('+250')
  const [password, setPassword] = useState('')
  const [email, setEmail] = useState('joe.don@example.com')
  const [phone, setPhone] = useState('')
  const [countryCode, setCountryCode] = useState('+250')
  const [rememberMe, setRememberMe] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [forgotOpen, setForgotOpen] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('joe.don@example.com')

  useEffect(() => {
    if (!open) return
    setError('')
    setMessage('')
    setForgotOpen(false)
  }, [open, mode])

  if (!open) return null

  const readUsers = (): StoredUser[] => {
    try {
      const raw = localStorage.getItem(STORAGE_USERS_KEY)
      return raw ? (JSON.parse(raw) as StoredUser[]) : [DEFAULT_DEMO_USER]
    } catch {
      return [DEFAULT_DEMO_USER]
    }
  }

  const writeUsers = (users: StoredUser[]) => {
    localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users))
  }

  const handleSignIn = () => {
    setError('')
    setMessage('')
    const value = identifier.trim()
    if (!value || !password.trim()) {
      setError('Invalid credentials. Please try again.')
      return
    }
    const users = readUsers()
    const phoneCandidate =
      value.includes('@')
        ? value
        : value.startsWith('+')
          ? value
          : `${signInCountryCode}${value.replace(/\D/g, '')}`
    const user = users.find((entry) => {
      const byEmail = entry.email?.toLowerCase() === value.toLowerCase()
      const byPhone = entry.phone === phoneCandidate
      return (byEmail || byPhone) && entry.password === password
    })
    if (!user) {
      setError('Invalid credentials. Please try again.')
      return
    }
    onAuthSuccess({
      id: user.id,
      email: user.email,
      phone: user.phone,
      provider: user.provider ?? 'email',
    })
  }

  const handleSignUp = () => {
    setError('')
    setMessage('')
    const trimmedEmail = email.trim()
    const trimmedPhone = phone.trim()
    if (!trimmedEmail && !trimmedPhone) {
      setError('Enter an email or phone number.')
      return
    }
    if (!password.trim() || password.trim().length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    const fullPhone = trimmedPhone ? `${countryCode}${trimmedPhone}` : undefined
    const users = readUsers()
    const existing = users.find(
      (entry) =>
        (trimmedEmail && entry.email?.toLowerCase() === trimmedEmail.toLowerCase()) ||
        (fullPhone && entry.phone === fullPhone)
    )
    if (existing) {
      setError('Account already exists for this email or phone.')
      return
    }
    const newUser: StoredUser = {
      id: `u-${Date.now()}`,
      email: trimmedEmail || undefined,
      phone: fullPhone,
      password: password.trim(),
      provider: 'email',
    }
    writeUsers([...users, newUser])
    onAuthSuccess({
      id: newUser.id,
      email: newUser.email,
      phone: newUser.phone,
      provider: newUser.provider,
    })
  }

  const socialAuth = () => {
    onAuthSuccess({
      id: `u-gmail-${Date.now()}`,
      email: 'joe.don@example.com',
      provider: 'gmail',
    })
  }

  return (
    <div className="fixed inset-0 z-[80] overflow-y-auto bg-black">
      <button
        onClick={onClose}
        className="absolute left-4 top-4 z-20 rounded-full bg-black/40 p-2 text-white hover:bg-black/70"
        aria-label="Close"
      >
        <X size={20} />
      </button>

      <div className="pointer-events-none absolute inset-0 overflow-hidden bg-black">
        <div className="absolute -left-20 -top-10 flex w-[130%] rotate-[-12deg] gap-2">
          {authBackdropPosters.concat(authBackdropPosters).slice(0, 8).map((poster, i) => (
            <div key={`row1-${poster}-${i}`} className="relative h-40 w-64 shrink-0 overflow-hidden rounded-md">
              <Image src={poster} alt="" fill className="object-cover" />
            </div>
          ))}
        </div>
        <div className="absolute -left-16 top-[24%] flex w-[130%] rotate-[-12deg] gap-2">
          {authBackdropPosters.concat(authBackdropPosters).slice(1, 9).map((poster, i) => (
            <div key={`row2-${poster}-${i}`} className="relative h-44 w-72 shrink-0 overflow-hidden rounded-md">
              <Image src={poster} alt="" fill className="object-cover" />
            </div>
          ))}
        </div>
        <div className="absolute -left-24 top-[57%] flex w-[130%] rotate-[-12deg] gap-2">
          {authBackdropPosters.concat(authBackdropPosters).slice(2, 10).map((poster, i) => (
            <div key={`row3-${poster}-${i}`} className="relative h-44 w-72 shrink-0 overflow-hidden rounded-md">
              <Image src={poster} alt="" fill className="object-cover" />
            </div>
          ))}
        </div>
      </div>

      <div className="absolute inset-0 bg-black/60" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(244,163,10,0.22),transparent_60%)]" />

      <div className="relative flex min-h-[100dvh] items-center justify-center px-4 py-8">
        <div className="auth-liquid-panel w-full max-w-[430px] max-h-[95vh] overflow-y-auto rounded-2xl p-5 md:p-6">
            <div className="mx-auto mb-4 flex w-fit items-center gap-2">
              <Image src="/streamfy-s-logo.svg" alt="Streamfy Logo" width={30} height={30} className="streamfy-logo-cinematic transition-transform duration-300 hover:scale-105" />
              <span className="text-lg font-bold text-white">Streamfy</span>
            </div>

            <h2 className="text-center text-2xl font-extrabold text-white md:text-3xl">
              {mode === 'signin' ? 'Sign In' : 'Sign Up'}
            </h2>
            <p className="mx-auto mt-2 max-w-md text-center text-sm leading-relaxed text-gray-300 md:text-base">
              {mode === 'signin'
                ? 'Enter your Email or Phone Number'
                : 'Create a new account to start watching movies'}
            </p>
            {reason ? <p className="mt-3 text-center text-sm text-[#f4a30a]">{reason}</p> : null}

            <div className="mt-6 space-y-4">
              {mode === 'signin' ? (
                <>
                  <div className="grid grid-cols-[140px_1fr] gap-2">
                    <select
                      value={signInCountryCode}
                      onChange={(e) => setSignInCountryCode(e.target.value)}
                      className="rounded-xl border border-[#f4a30a]/70 bg-black/25 px-2 py-2.5 text-sm text-white"
                    >
                      {countryCodes.map((item) => (
                        <option key={`signin-${item.code}`} value={item.code}>
                          {`${item.flag} ${item.code}`}
                        </option>
                      ))}
                    </select>
                    <input
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder="joe.don@example.com"
                      className="w-full rounded-xl border border-[#f4a30a]/70 bg-white/85 px-4 py-2.5 text-base text-black outline-none"
                    />
                  </div>
                  <div className="relative">
                    <Lock size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Password"
                      className="w-full rounded-xl border border-[#f4a30a]/70 bg-black/25 pl-9 pr-12 py-2.5 text-base text-white outline-none"
                    />
                    <button
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                      aria-label="Toggle password visibility"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  <div className="grid grid-cols-[1fr_auto] gap-3">
                    <button
                      onClick={() => {
                        setForgotOpen(true)
                        setForgotEmail(identifier.includes('@') ? identifier : 'joe.don@example.com')
                      }}
                      className="rounded-xl bg-white/10 px-4 py-2.5 text-center text-base text-white hover:bg-white/15"
                    >
                      Forgot password
                    </button>
                    <button
                      onClick={handleSignIn}
                      className="rounded-xl bg-[#f4a30a] px-8 py-2.5 text-base font-semibold text-black hover:opacity-90"
                    >
                      Sign In
                    </button>
                  </div>
                  <label className="inline-flex items-center gap-2 text-sm text-gray-300">
                    <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="accent-[#f4a30a]" />
                    Remember Me
                  </label>
                </>
              ) : (
                <>
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="joe.don@example.com"
                    className="w-full rounded-xl border border-[#f4a30a] bg-black/30 px-4 py-2.5 text-base text-white outline-none"
                  />
                  <p className="text-center text-base text-gray-300">or</p>
                  <div className="grid grid-cols-[140px_1fr] gap-3">
                    <select
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                      className="rounded-xl border border-[#f4a30a] bg-black/30 px-3 py-2.5 text-base text-white"
                    >
                      {countryCodes.map((item) => (
                        <option key={item.code} value={item.code}>
                          {`${item.flag} ${item.code}`}
                        </option>
                      ))}
                    </select>
                    <input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                      placeholder="Phone"
                      className="w-full rounded-xl border border-[#f4a30a] bg-black/30 px-4 py-2.5 text-base text-white outline-none"
                    />
                  </div>
                  <div className="relative">
                    <Lock size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your Password"
                      className="w-full rounded-xl border border-[#f4a30a] bg-black/30 pl-9 pr-12 py-2.5 text-base text-white outline-none"
                    />
                    <button
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                      aria-label="Toggle password visibility"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  <button
                    onClick={handleSignUp}
                    className="w-full rounded-xl bg-[#f4a30a] px-4 py-2.5 text-base font-semibold text-black hover:opacity-90"
                  >
                    Sign Up
                  </button>
                </>
              )}
            </div>

            <div className="mt-6 space-y-3">
              <button onClick={socialAuth} className="w-full rounded-xl border border-white/20 bg-black/40 px-4 py-2.5 text-sm text-white hover:bg-white/10">
                <span className="inline-flex items-center gap-2"><Mail size={18} /> Continue with Google</span>
              </button>
              <button
                onClick={() => {
                  onModeChange('signin')
                  setMessage('Continue with Email selected.')
                }}
                className="w-full rounded-xl border border-white/20 bg-black/40 px-4 py-2.5 text-sm text-white hover:bg-white/10"
              >
                <span className="inline-flex items-center gap-2"><Mail size={18} /> Continue with Email</span>
              </button>
            </div>

            {forgotOpen ? (
              <div className="mt-4 rounded-xl border border-[#f4a30a]/30 bg-[#f4a30a]/10 p-3">
                <p className="text-sm font-medium text-white">Forgot Password</p>
                <input
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="joe.don@example.com"
                  className="mt-2 w-full rounded-lg border border-white/20 bg-black/30 px-3 py-2 text-sm text-white outline-none"
                />
                <div className="mt-2 flex gap-2">
                  <button
                    onClick={() => {
                      setForgotOpen(false)
                      setMessage(`Reset link sent to ${forgotEmail}.`)
                    }}
                    className="rounded-lg bg-[#f4a30a] px-3 py-2 text-xs font-semibold text-black"
                  >
                    Send reset link
                  </button>
                  <button
                    onClick={() => setForgotOpen(false)}
                    className="rounded-lg border border-white/20 px-3 py-2 text-xs text-white"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : null}

            {error ? <p className="mt-4 text-sm text-red-400">{error}</p> : null}
            {message ? <p className="mt-4 text-sm text-[#f4a30a]">{message}</p> : null}

            <div className="mt-6 flex items-center justify-center gap-2 text-sm">
              <span className="text-gray-300">{mode === 'signin' ? "Don't have an account?" : 'Have an account?'}</span>
              <button
                onClick={() => onModeChange(mode === 'signin' ? 'signup' : 'signin')}
                className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-4 py-2 text-white hover:bg-white/10"
              >
                <UserPlus size={16} />
                {mode === 'signin' ? 'Sign Up' : 'Sign In'}
              </button>
            </div>
          </div>
      </div>
    </div>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
