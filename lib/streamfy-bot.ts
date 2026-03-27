import { BRAND_NAME } from '@/lib/brand'

export type BotQuickReply = { id: string; label: string; text: string }

type BotResponse = { text: string; quickReplies?: BotQuickReply[] }

export type BotFaqEntry = {
  id: string
  title: string
  keywords: string[]
  responseText: string
}

const STORAGE_KEY = 'streamfy-bot-faq'

const quickReplies: BotQuickReply[] = [
  { id: 'download', label: 'How to download?', text: 'How do I download?' },
  { id: 'watchlist', label: 'Watchlist help', text: 'How do I use watchlist?' },
  { id: 'report', label: 'Report a problem', text: 'I want to report a problem' },
  { id: 'plans', label: 'Subscription plans', text: 'What plans do you have?' },
  { id: 'share', label: 'Share a link', text: 'How do I share with friends?' },
  { id: 'chat', label: 'Chat rules', text: 'What are the chat rules?' },
]

const defaultFaq: BotFaqEntry[] = [
  {
    id: 'greeting',
    title: 'Greeting',
    keywords: ['hi', 'hello', 'hey'],
    responseText: `Hi! I’m ${BRAND_NAME} Bot. I can help with downloads, watchlist, sharing, plans, and reporting issues.`,
  },
  {
    id: 'download',
    title: 'Download',
    keywords: ['download', 'downloader', 'save video'],
    responseText:
      "To download:\n1) Open a movie.\n2) Tap Download.\n3) Pick quality + subtitles.\n\nNote: only download content you have the rights to share.",
  },
  {
    id: 'watchlist',
    title: 'Watchlist',
    keywords: ['watchlist', 'watch later', 'saved'],
    responseText:
      "Watchlist:\n- Tap the heart / Watch Later button on movies or shorts.\n- Open Watchlist from the sidebar to see everything you saved.",
  },
  {
    id: 'report',
    title: 'Report',
    keywords: ['report', 'problem', 'bug', 'issue', 'not working', 'error'],
    responseText:
      "Please include:\n- What page you were on\n- What you clicked\n- What you expected\n- What happened instead\n- Your device/browser\n\nYou can also post it in the Feedback Room so admins can review it.",
  },
  {
    id: 'plans',
    title: 'Plans',
    keywords: ['plan', 'price', 'subscription', 'pay'],
    responseText: "Plans are in Settings → Subscription.\nTip: pick Day/Week/Month depending on how often you watch.",
  },
  {
    id: 'share',
    title: 'Share',
    keywords: ['share', 'link', 'send to friend'],
    responseText:
      `You can share ${BRAND_NAME} links by copying the page URL and sending it in chat.\nOnly ${BRAND_NAME} internal links are allowed in chat (no external links).`,
  },
  {
    id: 'rules',
    title: 'Rules',
    keywords: ['rule', 'rules', 'ban', 'abuse'],
    responseText: `Chat rules:\n- Be respectful.\n- Don’t spam.\n- Only share ${BRAND_NAME} internal links.\nMessages auto-delete after 2 weeks.`,
  },
]

export function getDefaultBotFaqEntries() {
  return defaultFaq.slice()
}

export function getBotFaqEntries(): BotFaqEntry[] {
  if (typeof window === 'undefined') return defaultFaq
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultFaq
    const parsed = JSON.parse(raw) as BotFaqEntry[]
    return Array.isArray(parsed) && parsed.length ? parsed : defaultFaq
  } catch {
    return defaultFaq
  }
}

export function setBotFaqEntries(entries: BotFaqEntry[]) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
}

export function resetBotFaqEntries() {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(STORAGE_KEY)
}

export function getBotReply(userText: string): BotResponse | null {
  const text = userText.trim()
  if (!text) return null
  const lower = text.toLowerCase()
  for (const entry of getBotFaqEntries()) {
    if (entry.keywords.some((k) => k.trim() && lower.includes(k.trim().toLowerCase()))) {
      return { text: entry.responseText, quickReplies }
    }
  }
  return { text: "I didn’t catch that. Try: download, watchlist, share, plans, or report.", quickReplies }
}
