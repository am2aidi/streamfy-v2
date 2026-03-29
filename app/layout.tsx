import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/next'
import { AppSettingsProvider } from '@/components/AppSettingsProvider'
import { AuthProvider } from '@/components/AuthProvider'
import { Toaster } from '@/components/ui/toaster'
import { StreamfyIntro } from '@/components/StreamfyIntro'
import { BRAND_NAME } from '@/lib/brand'
import './globals.css'

export const metadata: Metadata = {
  title: `${BRAND_NAME} - Movies, Music & Sports`,
  description: `${BRAND_NAME} entertainment platform`,
  generator: 'v0.app',
  themeColor: '#000000',
  icons: {
    icon: [
      { url: '/streamfy-s-logo-light.svg', media: '(prefers-color-scheme: light)', type: 'image/svg+xml' },
      { url: '/streamfy-s-logo-dark.svg', media: '(prefers-color-scheme: dark)', type: 'image/svg+xml' },
      { url: '/streamfy-s-logo-light.svg', type: 'image/svg+xml' },
    ],
    shortcut: '/streamfy-s-logo-light.svg',
    apple: '/streamfy-s-logo-light.svg',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
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
