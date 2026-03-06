import { ArrowUpRight, Clapperboard, DollarSign, Radio, Users } from 'lucide-react'
import Link from 'next/link'
import { WorldUserMap } from '@/components/admin/WorldUserMap'

const stats = [
  { label: 'Total Users', value: '248,901', growth: '+12.3%', icon: Users },
  { label: 'Total Movies', value: '8,430', growth: '+4.8%', icon: Clapperboard },
  { label: 'Total Sports Streams', value: '1,284', growth: '+9.1%', icon: Radio },
  { label: 'Total Revenue', value: '$1,284,500', growth: '+18.4%', icon: DollarSign },
]

export default function AdminOverviewPage() {
  const coverage = [
    { title: 'Movies', href: '/admin/movies', value: '8,430 titles', status: 'Healthy' },
    { title: 'Sports', href: '/admin/sports', value: '1,284 streams', status: 'Healthy' },
    { title: 'Music', href: '/admin/music', value: '18,220 tracks', status: 'Review Needed' },
    { title: 'Ads', href: '/admin/ads', value: '36 campaigns', status: 'Healthy' },
    { title: 'Users', href: '/admin/users', value: '248,901 users', status: 'Healthy' },
    { title: 'Settings', href: '/admin/settings', value: '24 configs', status: 'Updated' },
  ]

  return (
    <div className="space-y-5">
      <section className="grid gap-4 xl:grid-cols-4 md:grid-cols-2">
        {stats.map((item) => (
          <article key={item.label} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl shadow-[0_12px_30px_rgba(2,6,23,0.4)]">
            <div className="flex items-center justify-between">
              <div
                className="rounded-xl p-2"
                style={{
                  color: 'var(--admin-accent-a)',
                  border: '1px solid color-mix(in oklab, var(--admin-accent-a) 45%, transparent)',
                  background: 'color-mix(in oklab, var(--admin-accent-a) 12%, transparent)',
                }}
              >
                <item.icon size={16} />
              </div>
              <span className="inline-flex items-center gap-1 text-xs" style={{ color: 'var(--admin-accent-a)' }}>
                <ArrowUpRight size={12} />
                {item.growth}
              </span>
            </div>
            <p className="mt-4 text-2xl font-bold">{item.value}</p>
            <p className="text-xs text-slate-400">{item.label}</p>
            <div
              className="mt-4 h-10 rounded-lg"
              style={{ background: 'linear-gradient(to right, color-mix(in oklab, var(--admin-accent-a) 22%, transparent), color-mix(in oklab, var(--admin-accent-b) 10%, transparent), transparent)' }}
            />
          </article>
        ))}
      </section>

      <WorldUserMap />

      <section className="grid gap-5 xl:grid-cols-[1.55fr_1fr]">
        <article className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
          <h2 className="text-sm font-semibold text-white">Streaming Activity</h2>
          <p className="text-xs text-slate-400">Live stream consumption across movies, music, and sports</p>
          <div
            className="mt-4 h-[280px] rounded-xl border border-white/10 p-4"
            style={{ background: 'linear-gradient(to bottom, color-mix(in oklab, var(--admin-accent-a) 12%, transparent), transparent)' }}
          >
            <svg viewBox="0 0 800 250" className="h-full w-full">
              <polyline fill="none" stroke="var(--admin-accent-a)" strokeWidth="4" points="0,190 80,150 160,165 240,120 320,130 400,95 480,110 560,72 640,90 720,55 800,70" />
              <polyline fill="none" stroke="var(--admin-accent-b)" strokeWidth="3" points="0,210 80,200 160,185 240,175 320,165 400,145 480,150 560,135 640,128 720,120 800,100" />
            </svg>
          </div>
        </article>

        <article className="space-y-5">
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
            <h3 className="text-sm font-semibold">Latest Registered Users</h3>
            <div className="mt-3 space-y-3">
              {['jane.m', 'bruce_17', 'kai_stream', 'felixpro'].map((name) => (
                <div key={name} className="flex items-center justify-between rounded-xl bg-black/20 px-3 py-2">
                  <span className="text-sm">{name}</span>
                  <span className="text-xs text-slate-400">Just now</span>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
            <h3 className="text-sm font-semibold">Active Ads Performance</h3>
            <div className="mt-3 h-32 rounded-xl bg-gradient-to-r from-[#e67e22]/20 via-[#f4a30a]/10 to-transparent" />
          </div>
        </article>
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">Website Coverage</h3>
          <span className="text-xs" style={{ color: 'var(--admin-accent-a)' }}>All modules monitored</span>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {coverage.map((item) => (
            <Link key={item.title} href={item.href} className="rounded-xl border border-white/10 bg-black/20 p-4 transition-colors hover:bg-black/30">
              <p className="text-sm font-semibold text-white">{item.title}</p>
              <p className="mt-1 text-xs text-slate-400">{item.value}</p>
              <p className="mt-2 text-xs font-medium" style={{ color: item.status === 'Review Needed' ? '#f59e0b' : 'var(--admin-accent-a)' }}>
                {item.status}
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
        <h3 className="text-sm font-semibold">Recent Uploads</h3>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[680px] text-left text-sm">
            <thead className="text-xs text-slate-400">
              <tr>
                <th className="pb-2">Title</th>
                <th className="pb-2">Type</th>
                <th className="pb-2">Uploader</th>
                <th className="pb-2">Date</th>
                <th className="pb-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['KYLEXY S2E8', 'Movie', 'Admin A', '2026-03-01', 'Published'],
                ['UCL Highlights', 'Sports', 'Admin S', '2026-03-01', 'Published'],
                ['Midnight Pulse', 'Music', 'Admin M', '2026-02-28', 'Draft'],
              ].map((row) => (
                <tr key={row[0]} className="border-t border-white/10">
                  <td className="py-3">{row[0]}</td>
                  <td className="py-3 text-slate-300">{row[1]}</td>
                  <td className="py-3 text-slate-300">{row[2]}</td>
                  <td className="py-3 text-slate-400">{row[3]}</td>
                  <td className="py-3">
                    <span className={`rounded-full px-2.5 py-1 text-xs ${row[4] === 'Published' ? 'bg-[#f4a30a]/15 text-[#ffd089]' : 'bg-amber-400/15 text-amber-300'}`}>
                      {row[4]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
