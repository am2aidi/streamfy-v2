export type NewsCategory = 'music' | 'sports' | 'movies' | 'comedy'

export interface NewsItem {
  id: string
  title: string
  category: NewsCategory
  summary: string
  source: string
  time: string
  image: string
}

export const newsItems: NewsItem[] = [
  {
    id: 'music-1',
    title: 'New album rollouts: what’s trending this week',
    category: 'music',
    summary: 'From surprise drops to viral hooks, here are the releases fans can’t stop replaying.',
    source: 'Streamfy Music Desk',
    time: '12m ago',
    image: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=900&q=80',
  },
  {
    id: 'music-2',
    title: 'Behind the lyrics: writing hooks that stick',
    category: 'music',
    summary: 'Producers break down the patterns that turn a chorus into a chant.',
    source: 'Streamfy Music Desk',
    time: '45m ago',
    image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=900&q=80',
  },
  {
    id: 'sports-1',
    title: 'Title race gets tighter after late winner',
    category: 'sports',
    summary: 'A last-minute goal reshuffles the table and sparks debate over tactics.',
    source: 'Streamfy Sports Desk',
    time: '10m ago',
    image: 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=900&q=80',
  },
  {
    id: 'sports-2',
    title: 'Derby injury updates before kickoff',
    category: 'sports',
    summary: 'Key starters are questionable as both teams announce their matchday squads.',
    source: 'Streamfy Sports Desk',
    time: '28m ago',
    image: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=900&q=80',
  },
  {
    id: 'movies-1',
    title: 'Trailer watch: the most anticipated premieres',
    category: 'movies',
    summary: 'A quick roundup of upcoming releases and what to expect from each story.',
    source: 'Streamfy Film Desk',
    time: '1h ago',
    image: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=900&q=80',
  },
  {
    id: 'comedy-1',
    title: 'Comedy clips that made everyone laugh today',
    category: 'comedy',
    summary: 'Short, punchy moments from creators and stand-up sets trending right now.',
    source: 'Streamfy Culture Desk',
    time: '2h ago',
    image: 'https://images.unsplash.com/photo-1527224857830-43a7acc85260?w=900&q=80',
  },
]

export function getNewsByCategory(category: NewsCategory) {
  return newsItems.filter((item) => item.category === category)
}

