'use client'

import { Star } from 'lucide-react'

export function StarRating({
  value,
  onChange,
  readOnly = false,
  size = 16,
}: {
  value: number
  onChange?: (next: number) => void
  readOnly?: boolean
  size?: number
}) {
  return (
    <div className="inline-flex items-center gap-1">
      {Array.from({ length: 5 }, (_, i) => i + 1).map((n) => {
        const filled = n <= value
        return (
          <button
            key={n}
            type="button"
            onClick={() => (readOnly ? null : onChange?.(n))}
            className={readOnly ? 'cursor-default' : 'hover:scale-[1.02]'}
            aria-label={`Rate ${n} star`}
          >
            <Star
              size={size}
              className={filled ? 'text-[color:var(--app-accent-a)]' : 'text-white/30'}
              fill={filled ? 'currentColor' : 'transparent'}
            />
          </button>
        )
      })}
    </div>
  )
}

