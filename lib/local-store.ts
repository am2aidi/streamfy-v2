export function canUseDOM() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

export function readJson<T>(key: string, fallback: T): T {
  if (!canUseDOM()) return fallback
  try {
    const raw = window.localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export function writeJson<T>(key: string, value: T) {
  if (!canUseDOM()) return
  window.localStorage.setItem(key, JSON.stringify(value))
}

export function dispatchAppEvent(eventName: string) {
  if (!canUseDOM()) return
  window.dispatchEvent(new Event(eventName))
}

export function subscribeToKey(key: string, eventName: string, callback: () => void) {
  if (!canUseDOM()) return () => {}

  const onStorage = (e: StorageEvent) => {
    if (e.key === key) callback()
  }
  const onLocal = () => callback()

  window.addEventListener('storage', onStorage)
  window.addEventListener(eventName, onLocal)

  return () => {
    window.removeEventListener('storage', onStorage)
    window.removeEventListener(eventName, onLocal)
  }
}

