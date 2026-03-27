import { BRAND_NAME } from '@/lib/brand'

export type NewsCategory = 'music' | 'sports' | 'movies' | 'comedy'

export interface NewsItem {
  id: string
  title: string
  category: NewsCategory
  summary: string
  content?: string
  source: string
  time: string
  image: string
  url?: string
  videoUrl?: string
}

export const newsItems: NewsItem[] = [
  {
    id: 'music-1',
    title: "New album rollouts: what’s trending this week",
    category: 'music',
    summary: "From surprise drops to viral hooks, here are the releases fans can’t stop replaying.",
    content:
      "The week’s biggest releases are leaning into shorter intros, louder choruses, and collaborations that travel fast on social platforms.\n\nProducers say the new playbook is clear: make the hook land early, keep the drums tight, and leave room for remix culture to take over.\n\nStreamfy’s editors picked five projects worth a full listen—plus the singles that are already climbing playlists.",
    source: `${BRAND_NAME} Music Desk`,
    time: '12m ago',
    image: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=900&q=80',
  },
  {
    id: 'music-2',
    title: 'Behind the lyrics: writing hooks that stick',
    category: 'music',
    summary: 'Producers break down the patterns that turn a chorus into a chant.',
    content:
      'Great hooks feel simple, but they’re engineered: repetition, contrast, and one unforgettable line.\n\nWriters recommend testing the chorus without the beat—if it still works, it’s probably a keeper.',
    source: `${BRAND_NAME} Music Desk`,
    time: '45m ago',
    image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=900&q=80',
  },
  {
    id: 'sports-1',
    title: 'Title race gets tighter after late winner',
    category: 'sports',
    summary: 'A last-minute goal reshuffles the table and sparks debate over tactics.',
    content:
      'A late winner always changes the mood—and the math.\n\nManagers are already shifting their approaches: some will sit deeper, others will press earlier, but the next two fixtures could decide everything.\n\nWe break down the key moments, the standout performances, and what it means for the run-in.',
    source: `${BRAND_NAME} Sports Desk`,
    time: '10m ago',
    image: 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=900&q=80',
  },
  {
    id: 'sports-2',
    title: 'Derby injury updates before kickoff',
    category: 'sports',
    summary: 'Key starters are questionable as both teams announce their matchday squads.',
    content:
      'The derby always brings intensity, but injuries can rewrite the story.\n\nHere’s the latest: a key midfielder returns to training, while two defenders are still being assessed.\n\nExpect late changes and a tactical switch if the starting XI is forced to rotate.',
    source: `${BRAND_NAME} Sports Desk`,
    time: '28m ago',
    image: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=900&q=80',
  },
  {
    id: 'movies-1',
    title: 'Trailer watch: the most anticipated premieres',
    category: 'movies',
    summary: 'A quick roundup of upcoming releases and what to expect from each story.',
    content:
      'Studios are doubling down on big concepts and tighter runtimes.\n\nOur roundup includes the trailers that sparked the most conversation, plus the small details you might have missed.\n\nWatch the teaser, then see what’s next on the calendar.',
    source: `${BRAND_NAME} Film Desk`,
    time: '1h ago',
    image: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=900&q=80',
    videoUrl: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
  },
  {
    id: 'comedy-1',
    title: 'Comedy clips that made everyone laugh today',
    category: 'comedy',
    summary: 'Short, punchy moments from creators and stand-up sets trending right now.',
    content:
      'Today’s funniest clips were all about timing—tight edits, clean punchlines, and relatable chaos.\n\nWe curated a quick list of moments you can share instantly, plus a couple of longer sets that are worth the full watch.',
    source: `${BRAND_NAME} Culture Desk`,
    time: '2h ago',
    image: 'https://images.unsplash.com/photo-1527224857830-43a7acc85260?w=900&q=80',
  },
]

export function getNewsByCategory(category: NewsCategory) {
  return newsItems.filter((item) => item.category === category)
}
