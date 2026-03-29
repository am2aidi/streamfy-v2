'use client'

import * as React from 'react'
import { BRAND_NAME } from '@/lib/brand'

export type StreamfyLogoProps = Omit<React.HTMLAttributes<HTMLSpanElement>, 'children'> & {
  size?: number
  title?: string
  /**
   * Place your logo file at this path (recommended): `public/streamfy-logo.png`
   * The component auto-crops/zooms it into a perfect circle.
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
  const zoom = Math.min(4, Math.max(1, rawZoom * 1.04))
  return zoom
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
      background: 'var(--background)',
      ...(style ?? {}),
    }

    return (
      <span className={className} style={wrapperStyle} {...ariaProps} {...props}>
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
    ['--logo-bg' as never]: 'var(--app-accent-a)',
    ['--logo-fg' as never]: '#000000',
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
      <circle cx="256" cy="256" r="232" fill="var(--logo-bg)" />
      <g vectorEffect="non-scaling-stroke" stroke="var(--logo-fg)" strokeLinecap="round">
        <line x1="116" y1="172" x2="396" y2="172" strokeWidth="22" />
        <line x1="126" y1="208" x2="386" y2="208" strokeWidth="22" opacity="0.98" />
        <line x1="136" y1="244" x2="376" y2="244" strokeWidth="22" opacity="0.96" />
        <line x1="146" y1="280" x2="366" y2="280" strokeWidth="22" opacity="0.94" />
        <line x1="156" y1="316" x2="356" y2="316" strokeWidth="22" opacity="0.92" />
        <line x1="166" y1="352" x2="346" y2="352" strokeWidth="22" opacity="0.9" />
        <line x1="176" y1="388" x2="336" y2="388" strokeWidth="22" opacity="0.88" />
        <line x1="186" y1="424" x2="326" y2="424" strokeWidth="22" opacity="0.86" />
      </g>
    </svg>
  )
}
