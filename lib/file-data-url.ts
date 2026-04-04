'use client'

export function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result || ''))
    reader.onerror = () => reject(new Error(`Failed to read ${file.name}`))
    reader.readAsDataURL(file)
  })
}

export function isStoredImageSource(value?: string | null) {
  if (!value) return false
  const trimmed = value.trim()
  return trimmed.startsWith('data:image/') || trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('/')
}

export function summarizeStoredAsset(value?: string | null, emptyLabel = 'No file selected') {
  if (!value) return emptyLabel
  const trimmed = value.trim()
  if (!trimmed) return emptyLabel
  if (trimmed.startsWith('data:image/')) return 'Image saved in database'
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return 'Image linked by URL'
  if (trimmed.startsWith('/')) return trimmed
  if (trimmed.length > 48) return `${trimmed.slice(0, 45)}...`
  return trimmed
}
