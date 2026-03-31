'use client'

import Link from 'next/link'
import { Sidebar } from '@/components/Sidebar'
import { Header } from '@/components/Header'
import { useAppSettings } from '@/components/AppSettingsProvider'
import { BRAND_NAME } from '@/lib/brand'
import { getTranslation } from '@/lib/translations'

export default function CopyrightPolicyPage() {
  const { settings } = useAppSettings()
  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(settings.language, key)

  return (
    <div className="flex min-h-screen bg-black">
      <Sidebar />
      <div className="w-full md:ml-[92px] md:w-[calc(100vw-92px)] min-h-[100dvh] overflow-x-hidden pb-24 md:pb-10">
        <Header />

        <main className="px-6">
          <div className="max-w-3xl">
            <h1 className="text-white text-3xl font-bold">Copyright &amp; Takedown Policy</h1>
            <p className="mt-2 text-sm text-gray-300">
              {BRAND_NAME} respects creators and copyright holders. If someone reports that an upload infringes their rights, we may remove it to protect the platform.
            </p>

            <div className="mt-6 space-y-4">
              <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
                <h2 className="text-white text-lg font-semibold">Before you upload</h2>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-gray-300">
                  <li>Only upload content you own or have permission to share.</li>
                  <li>Do not upload pirated movies, TV episodes, or copyrighted posters without rights.</li>
                  <li>Repeated infringement reports can lead to removal of content and loss of access.</li>
                </ul>
              </section>

              <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
                <h2 className="text-white text-lg font-semibold">Report a claim</h2>
                <p className="mt-2 text-sm text-gray-300">
                  Send a message in the <span className="text-white font-semibold">Chat</span> feedback room and include:
                </p>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-gray-300">
                  <li>Your full name and your relationship to the rights holder.</li>
                  <li>The title and a link/screenshot of the content on {BRAND_NAME}.</li>
                  <li>Proof of ownership or authorization (where available).</li>
                  <li>A short statement requesting removal.</li>
                </ul>
                <p className="mt-3 text-sm text-gray-300">
                  Go to <Link className="text-[color:var(--app-accent-a)] hover:underline" href="/chat">{t('chat')}</Link>.
                </p>
              </section>

              <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
                <h2 className="text-white text-lg font-semibold">What we do</h2>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-gray-300">
                  <li>We review reports and may remove content while reviewing.</li>
                  <li>We may ask for more details to confirm the claim.</li>
                  <li>We may notify the uploader with next steps.</li>
                </ul>
              </section>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

