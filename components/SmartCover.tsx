'use client'

import Image from 'next/image'

function isNextSafe(src: string) {
  return src.startsWith('/') || src.startsWith('data:') || src.startsWith('blob:')
}

export function SmartCover({
  src,
  alt,
  className,
  sizes,
  priority,
}: {
  src: string
  alt: string
  className?: string
  sizes?: string
  priority?: boolean
}) {
  if (isNextSafe(src)) {
    return <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className={className} />
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className={['absolute inset-0 h-full w-full', className ?? ''].join(' ')}
      loading={priority ? 'eager' : 'lazy'}
      referrerPolicy="no-referrer"
    />
  )
}

