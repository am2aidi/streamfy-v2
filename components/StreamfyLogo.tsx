import * as React from 'react'
import { BRAND_NAME } from '@/lib/brand'

export type StreamfyLogoProps = Omit<React.SVGProps<SVGSVGElement>, 'width' | 'height'> & {
  size?: number
  title?: string
}

export function StreamfyLogo({ size = 32, title = BRAND_NAME, className, ...props }: StreamfyLogoProps) {
  const isHidden = props['aria-hidden'] === true || props['aria-hidden'] === 'true'
  const ariaProps = isHidden ? { 'aria-hidden': true } : { role: 'img', 'aria-label': title }
  const style = {
    ['--logo-gold' as never]: 'var(--app-accent-a)',
    ['--logo-gold-dk' as never]: '#9a5600',
    ['--logo-ink' as never]: '#000000',
    ...(props.style ?? {}),
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 512 512"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      focusable="false"
      className={className}
      style={style}
      {...ariaProps}
      {...props}
    >
      <defs>
        <linearGradient id="streamfyGold" x1="112" y1="88" x2="408" y2="424" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#ffe1a6" />
          <stop offset="0.5" stopColor="var(--logo-gold)" />
          <stop offset="1" stopColor="var(--logo-gold-dk)" />
        </linearGradient>
      </defs>

      {/* Transparent background: the mark uses only strokes/fills */}
      <g vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round">
        {/* Outer circle (gold) - expanded to fill icon */}
        <circle cx="256" cy="256" r="232" stroke="url(#streamfyGold)" strokeWidth="22" fill="none" />
        <circle cx="256" cy="256" r="206" stroke="url(#streamfyGold)" strokeWidth="6" opacity="0.45" fill="none" />

        {/* Central video sign */}
        <g>
          <rect x="140" y="178" width="232" height="156" rx="36" stroke="url(#streamfyGold)" strokeWidth="22" fill="none" />
          <path d="M372 214 L444 186 V326 L372 298 Z" stroke="url(#streamfyGold)" strokeWidth="22" fill="none" />

          {/* Inner bezel + play (dark/ink) */}
          <rect x="170" y="210" width="172" height="92" rx="24" stroke="var(--logo-ink)" strokeWidth="10" fill="none" opacity="0.92" />
          <path d="M246 232 L246 280 L300 256 Z" fill="var(--logo-ink)" stroke="none" opacity="0.92" />
        </g>

        {/* Small music note */}
        <g>
          <path
            d="M148 368 C148 354 158 344 172 344 C184 344 192 352 192 364 C192 378 182 388 168 388 C154 388 148 380 148 368 Z"
            fill="var(--logo-ink)"
            stroke="none"
            opacity="0.92"
          />
          <path d="M192 364 V316 L262 302 V350" stroke="url(#streamfyGold)" strokeWidth="16" fill="none" />
          <path
            d="M236 384 C236 370 246 360 260 360 C272 360 280 368 280 380 C280 394 270 404 256 404 C242 404 236 396 236 384 Z"
            fill="var(--logo-ink)"
            stroke="none"
            opacity="0.92"
          />
        </g>

        {/* Small football (soccer ball) */}
        <g>
          <circle cx="364" cy="378" r="44" stroke="url(#streamfyGold)" strokeWidth="16" fill="none" />
          <path d="M332 368 C346 356 382 356 396 368" stroke="var(--logo-ink)" strokeWidth="8" fill="none" opacity="0.9" />
          <path d="M326 392 C342 406 386 406 402 392" stroke="var(--logo-ink)" strokeWidth="8" fill="none" opacity="0.9" />
          <path d="M364 336 V420" stroke="var(--logo-ink)" strokeWidth="8" fill="none" opacity="0.6" />
        </g>
      </g>
    </svg>
  )
}
