import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { AppSettingsProvider } from '@/components/AppSettingsProvider'
import { AuthProvider } from '@/components/AuthProvider'
import { Toaster } from '@/components/ui/toaster'
import { StreamfyIntro } from '@/components/StreamfyIntro'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'Streamfy - Movies, Music & Sports',
  description: 'Streamfy entertainment platform',
  generator: 'v0.app',
  icons: {
    icon: [
      { url: '/streamfy-s-logo.svg', media: '(prefers-color-scheme: light)', type: 'image/svg+xml' },
      { url: '/streamfy-s-logo.svg', media: '(prefers-color-scheme: dark)', type: 'image/svg+xml' },
      { url: '/streamfy-s-logo.svg', type: 'image/svg+xml' },
    ],
    shortcut: '/streamfy-s-logo.svg',
    apple: '/streamfy-s-logo.svg',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="overflow-x-hidden font-sans antialiased">
        <StreamfyIntro />
        <AppSettingsProvider>
          <AuthProvider>
            {children}
            <Toaster />
          </AuthProvider>
        </AppSettingsProvider>
        <Analytics />
      </body>
    </html>
  )
}
