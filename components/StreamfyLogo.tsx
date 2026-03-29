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
    ['--logo-bg' as never]: 'var(--app-accent-a)',
    ['--logo-fg' as never]: '#000000',
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
