import { WorldUserMap } from '@/components/admin/WorldUserMap'

export default function AdminAnalyticsPage() {
  return (
    <div className="space-y-5">
      <h2 className="text-xl font-bold">Analytics</h2>

      <section className="grid gap-4 md:grid-cols-3">
        {[
          ['Sessions Today', '89,421', '+7.2%'],
          ['Avg. Watch Time', '28m 14s', '+3.1%'],
          ['Conversion Rate', '4.9%', '+0.8%'],
        ].map((card) => (
          <article key={card[0]} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
            <p className="text-xs text-slate-400">{card[0]}</p>
            <p className="mt-1 text-2xl font-bold text-white">{card[1]}</p>
            <p className="text-xs" style={{ color: 'var(--admin-accent-a)' }}>{card[2]}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        {[
          'Monthly Revenue',
          'User Growth',
          'Stream Hours',
          'Most Watched Content',
          'Most Played Songs',
          'Most Viewed Sports',
        ].map((chart) => (
          <article key={chart} className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
            <h3 className="text-sm font-semibold">{chart}</h3>
            <div
              className="mt-4 h-60 rounded-xl border border-white/10 p-3"
              style={{ background: 'linear-gradient(to bottom, color-mix(in oklab, var(--admin-accent-a) 15%, transparent), color-mix(in oklab, var(--admin-accent-b) 8%, transparent), transparent)' }}
            >
              <svg viewBox="0 0 600 220" className="h-full w-full">
                <polyline fill="none" stroke="var(--admin-accent-a)" strokeWidth="4" points="0,170 60,155 120,160 180,125 240,130 300,115 360,90 420,85 480,65 540,60 600,40" />
              </svg>
            </div>
          </article>
        ))}
      </section>

      <WorldUserMap />
    </div>
  )
}
