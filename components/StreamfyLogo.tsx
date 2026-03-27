import * as React from 'react'
import { BRAND_NAME } from '@/lib/brand'

export type StreamfyLogoProps = Omit<React.SVGProps<SVGSVGElement>, 'width' | 'height'> & {
  size?: number
  title?: string
}

export function StreamfyLogo({ size = 32, title = BRAND_NAME, className, ...props }: StreamfyLogoProps) {
  const isHidden = props['aria-hidden'] === true || props['aria-hidden'] === 'true'
  const ariaProps = isHidden ? { 'aria-hidden': true } : { role: 'img', 'aria-label': title }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 512 512"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      focusable="false"
      className={className}
      {...ariaProps}
      {...props}
    >
      {/* Black badge */}
      <rect x="64" y="64" width="384" height="384" rx="128" fill="#000" />

      {/* Gold frame + half-ring accent (follows selected theme color) */}
      <g style={{ color: 'var(--app-accent-a)' }} vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" opacity="0.98">
        <rect x="78" y="78" width="356" height="356" rx="116" stroke="currentColor" strokeWidth="18" />
        <path d="M168 344 A152 152 0 0 0 344 168" stroke="currentColor" strokeWidth="24" />
      </g>

      {/* White camera icon */}
      <g stroke="#ffffff" vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round">
        <rect x="152" y="196" width="220" height="150" rx="40" strokeWidth="22" />
        <path d="M372 236 L430 256 L372 276 Z" strokeWidth="22" fill="none" />
      </g>
    </svg>
  )
}
