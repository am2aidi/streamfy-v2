'use client'

import React from 'react'

const externalUrlPattern = /(https?:\/\/|www\.)/i
const urlPattern = /https?:\/\/[^\s]+/gi
const internalPathPattern = /(\/(movies|music|sports|shorts|community|search|settings|about|downloader)(\/[^\s]*)?)/gi

function sanitizeInternalPath(path: string) {
  if (!path.startsWith('/')) return null
  if (path.startsWith('//')) return null
  if (path.toLowerCase().includes('javascript:')) return null
  return path
}

export function isTextAllowed(text: string) {
  if (!externalUrlPattern.test(text)) return true
  if (typeof window === 'undefined') return false

  const urls = Array.from(text.matchAll(urlPattern)).map((m) => m[0])
  for (const raw of urls) {
    try {
      const parsed = new URL(raw)
      if (parsed.origin !== window.location.origin) return false
      const safe = sanitizeInternalPath(parsed.pathname + parsed.search + parsed.hash)
      if (!safe) return false
    } catch {
      return false
    }
  }
  return !/www\./i.test(text)
}

export function internalizeLinks(text: string): React.ReactNode {
  let normalizedText = text
  if (typeof window !== 'undefined' && externalUrlPattern.test(normalizedText)) {
    normalizedText = normalizedText.replace(urlPattern, (raw) => {
      try {
        const parsed = new URL(raw)
        if (parsed.origin !== window.location.origin) return raw
        return parsed.pathname + parsed.search + parsed.hash
      } catch {
        return raw
      }
    })
  }

  const parts: Array<string | { href: string; label: string }> = []
  let lastIndex = 0
  const matches = Array.from(normalizedText.matchAll(internalPathPattern))

  for (const m of matches) {
    const raw = m[0]
    const index = m.index ?? 0
    if (index > lastIndex) parts.push(normalizedText.slice(lastIndex, index))
    const safe = sanitizeInternalPath(raw)
    if (safe) parts.push({ href: safe, label: raw })
    else parts.push(raw)
    lastIndex = index + raw.length
  }

  if (lastIndex < normalizedText.length) parts.push(normalizedText.slice(lastIndex))

  return (
    <>
      {parts.map((p, i) => {
        if (typeof p === 'string') return <React.Fragment key={i}>{p}</React.Fragment>
        return (
          <a key={i} href={p.href} className="underline decoration-white/30 hover:decoration-white">
            {p.label}
          </a>
        )
      })}
    </>
  )
}
