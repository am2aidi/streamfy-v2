type RegionPoint = {
  id: string
  label: string
  users: string
  x: number
  y: number
}

const regionPoints: RegionPoint[] = [
  { id: 'na', label: 'North America', users: '84.2K', x: 24, y: 36 },
  { id: 'sa', label: 'South America', users: '31.7K', x: 31, y: 67 },
  { id: 'eu', label: 'Europe', users: '63.1K', x: 51, y: 30 },
  { id: 'af', label: 'Africa', users: '29.4K', x: 52, y: 52 },
  { id: 'me', label: 'Middle East', users: '18.2K', x: 59, y: 42 },
  { id: 'as', label: 'Asia', users: '95.8K', x: 70, y: 41 },
  { id: 'oc', label: 'Oceania', users: '12.5K', x: 82, y: 70 },
]

export function WorldUserMap() {
  return (
    <article className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-white">Global User Heatmap</h3>
          <p className="text-xs text-slate-400">Live user presence by region</p>
        </div>
        <span
          className="rounded-full px-2.5 py-1 text-[11px] font-semibold"
          style={{
            color: 'var(--admin-accent-a)',
            border: '1px solid color-mix(in oklab, var(--admin-accent-a) 55%, transparent)',
            background: 'color-mix(in oklab, var(--admin-accent-a) 12%, transparent)',
          }}
        >
          LIVE
        </span>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1.65fr_1fr]">
        <div className="relative overflow-hidden rounded-xl border border-white/10 bg-[#071022] p-4">
          <div
            className="pointer-events-none absolute inset-0 opacity-35"
            style={{
              background:
                'radial-gradient(circle at 50% 50%, color-mix(in oklab, var(--admin-accent-a) 28%, transparent) 0%, transparent 64%)',
            }}
          />

          <svg viewBox="0 0 1000 420" className="relative h-[260px] w-full">
            <path d="M56 160l86-35 92 28 72-34 88 20 92-20 96 31 76-18 93 28 79 45-39 35-81 4-76 26-105-2-92 32-95-9-88 23-78-20-81-46z" fill="#0d1a34" stroke="#1e2a4d" strokeWidth="2" />
            <path d="M253 250l43 46 61 15 73-13 52-37-17-40-65-12-82 3z" fill="#0f2142" stroke="#223258" strokeWidth="2" />
            <path d="M610 236l73 18 67 43-16 52-69 13-87-27-24-48z" fill="#102449" stroke="#223258" strokeWidth="2" />
            <path d="M762 317l70 18 36 43-27 20-63-11-31-26z" fill="#102449" stroke="#223258" strokeWidth="2" />

            {regionPoints.map((point) => (
              <g key={point.id} transform={`translate(${point.x * 10}, ${point.y * 4.2})`}>
                <circle
                  r="8"
                  fill="var(--admin-accent-a)"
                  style={{ filter: 'drop-shadow(0 0 10px color-mix(in oklab, var(--admin-accent-a) 65%, transparent))' }}
                />
                <circle r="16" fill="none" stroke="var(--admin-accent-a)" strokeOpacity="0.35">
                  <animate attributeName="r" values="10;22;10" dur="2.8s" repeatCount="indefinite" />
                  <animate attributeName="stroke-opacity" values="0.45;0.08;0.45" dur="2.8s" repeatCount="indefinite" />
                </circle>
              </g>
            ))}
          </svg>
        </div>

        <div className="space-y-2">
          {regionPoints.map((point) => (
            <div key={point.id} className="rounded-lg border border-white/10 bg-black/20 px-3 py-2.5">
              <p className="text-xs text-slate-400">{point.label}</p>
              <p className="text-sm font-semibold" style={{ color: 'var(--admin-accent-a)' }}>
                {point.users} users
              </p>
            </div>
          ))}
        </div>
      </div>
    </article>
  )
}
