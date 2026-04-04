'use client'

import * as React from 'react'
import { BRAND_NAME } from '@/lib/brand'

export type StreamfyLogoProps = Omit<React.HTMLAttributes<HTMLSpanElement>, 'children'> & {
  size?: number
  title?: string
  /**
   * Put your logo file at `public/streamfy-logo.png` (recommended).
   * This component will crop/zoom it into a perfect circle.
   */
  src?: string
  /**
   * Manual zoom override (e.g. 2.4). When provided, auto-crop zoom detection is skipped.
   */
  zoom?: number
}

const autoCropZoomCache = new Map<string, number>()

function detectTightZoom(img: HTMLImageElement) {
  const canvasSize = 256
  const canvas = document.createElement('canvas')
  canvas.width = canvasSize
  canvas.height = canvasSize

  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  if (!ctx) return null

  ctx.clearRect(0, 0, canvasSize, canvasSize)
  ctx.drawImage(img, 0, 0, canvasSize, canvasSize)
  const { data } = ctx.getImageData(0, 0, canvasSize, canvasSize)

  const threshold = 28
  let minX = canvasSize
  let minY = canvasSize
  let maxX = -1
  let maxY = -1

  for (let y = 0; y < canvasSize; y += 2) {
    for (let x = 0; x < canvasSize; x += 2) {
      const idx = (y * canvasSize + x) * 4
      const r = data[idx]
      const g = data[idx + 1]
      const b = data[idx + 2]
      const a = data[idx + 3]
      if (a < 10) continue
      if (r <= threshold && g <= threshold && b <= threshold) continue

      if (x < minX) minX = x
      if (y < minY) minY = y
      if (x > maxX) maxX = x
      if (y > maxY) maxY = y
    }
  }

  if (maxX < 0 || maxY < 0) return null

  const bbox = Math.max(maxX - minX + 1, maxY - minY + 1)
  const rawZoom = canvasSize / bbox
  return Math.min(4, Math.max(1, rawZoom * 1.04))
}

export function StreamfyLogo({
  size = 32,
  title = BRAND_NAME,
  className,
  src = '/streamfy-logo.png',
  zoom,
  style,
  ...props
}: StreamfyLogoProps) {
  const [useImage, setUseImage] = React.useState(true)
  const [autoZoom, setAutoZoom] = React.useState<number | null>(() => autoCropZoomCache.get(src) ?? null)

  const isHidden = props['aria-hidden'] === true || props['aria-hidden'] === 'true'
  const ariaProps = isHidden ? { 'aria-hidden': true } : { role: 'img', 'aria-label': title }

  if (useImage) {
    const wrapperStyle: React.CSSProperties = {
      width: size,
      height: size,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 9999,
      overflow: 'hidden',
      background: 'transparent',
      ...(style ?? {}),
    }

    return (
      <span className={className} style={wrapperStyle} {...ariaProps} {...props}>
        {/* Custom crop detection needs a real <img> element so we can measure image pixels after load. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt=""
          aria-hidden="true"
          draggable={false}
          onError={() => setUseImage(false)}
          onLoad={(e) => {
            if (typeof zoom === 'number') return
            if (autoCropZoomCache.has(src)) return
            const computed = detectTightZoom(e.currentTarget)
            if (!computed) return
            autoCropZoomCache.set(src, computed)
            setAutoZoom(computed)
          }}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transform: `scale(${autoZoom ?? zoom ?? 1.35})`,
            transformOrigin: 'center',
            display: 'block',
          }}
        />
      </span>
    )
  }

  const svgStyle = {
    ['--logo-gold' as never]: 'var(--app-accent-a)',
    ['--logo-gold-dk' as never]: '#9a5600',
    ['--logo-ink' as never]: '#000000',
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
      style={svgStyle}
      {...(ariaProps as React.SVGProps<SVGSVGElement>)}
      {...(props as React.SVGProps<SVGSVGElement>)}
    >
      <defs>
        <linearGradient id="streamfyGold" x1="112" y1="88" x2="408" y2="424" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#ffe1a6" />
          <stop offset="0.5" stopColor="var(--logo-gold)" />
          <stop offset="1" stopColor="var(--logo-gold-dk)" />
        </linearGradient>
      </defs>

      <g vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="256" cy="256" r="232" stroke="url(#streamfyGold)" strokeWidth="22" fill="none" />
        <circle cx="256" cy="256" r="206" stroke="url(#streamfyGold)" strokeWidth="6" opacity="0.45" fill="none" />

        <g>
          <rect x="140" y="178" width="232" height="156" rx="36" stroke="url(#streamfyGold)" strokeWidth="22" fill="none" />
          <path d="M372 214 L444 186 V326 L372 298 Z" stroke="url(#streamfyGold)" strokeWidth="22" fill="none" />
          <rect x="170" y="210" width="172" height="92" rx="24" stroke="var(--logo-ink)" strokeWidth="10" fill="none" opacity="0.92" />
          <path d="M246 232 L246 280 L300 256 Z" fill="var(--logo-ink)" stroke="none" opacity="0.92" />
        </g>

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
