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
    title: "New album rollouts: what's trending this week",
    category: 'music',
    summary: "From surprise drops to viral hooks, here are the releases fans can't stop replaying.",
    content:
      "The week's biggest releases are leaning into shorter intros, louder choruses, and collaborations that travel fast on social platforms.\n\nProducers say the new playbook is clear: make the hook land early, keep the drums tight, and leave room for remix culture to take over.\n\nStreamfy's editors picked five projects worth a full listen, plus the singles that are already climbing playlists.",
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
      "Great hooks feel simple, but they're engineered: repetition, contrast, and one unforgettable line.\n\nWriters recommend testing the chorus without the beat. If it still works, it's probably a keeper.",
    source: `${BRAND_NAME} Music Desk`,
    time: '45m ago',
    image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=900&q=80',
  },
  {
    id: 'sports-1',
    title: 'Guardiola faces fresh questions after a painful European exit',
    category: 'sports',
    summary: 'Manchester City are regrouping after a tough night in Europe, with attention already turning to the next domestic test.',
    content:
      'A painful exit always changes the mood around a squad.\n\nAttention is now shifting to squad rotation, energy levels, and whether the manager will use the setback as fuel for the remaining fixtures.\n\nWe break down the reaction, the tactical debate, and what comes next.',
    source: `${BRAND_NAME} Sports Desk`,
    time: '10m ago',
    image: 'https://images.unsplash.com/photo-1547347298-4074fc3086f0?w=900&q=80',
  },
  {
    id: 'sports-2',
    title: 'Premier League transfer chase heats up around Salah and Fernandez',
    category: 'sports',
    summary: 'Recruitment teams are moving early, with attacking depth and midfield control driving the latest rumors.',
    content:
      'Transfer season rewards clubs that move before the market gets noisy.\n\nThis week, conversations around wide attackers and high-touch midfielders are shaping the early headlines, and several decision-makers are already laying groundwork for summer moves.\n\nWe look at which squads are pushing hardest and why.',
    source: `${BRAND_NAME} Sports Desk`,
    time: '28m ago',
    image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=900&q=80',
  },
  {
    id: 'sports-3',
    title: 'Raphinha injury forces a Barcelona reshuffle before the next big test',
    category: 'sports',
    summary: 'Barcelona are adjusting the front line after a new setback, with multiple options under discussion on the right side.',
    content:
      'One injury can change an entire attacking plan.\n\nBarcelona now have to balance width, pressing, and ball progression without one of their most direct threats, which could open the door for a different profile in the next lineup.\n\nHere is what the staff may change and who stands to benefit.',
    source: `${BRAND_NAME} Football Desk`,
    time: '41m ago',
    image: 'https://images.unsplash.com/photo-1518604666860-9ed391f76460?w=900&q=80',
  },
  {
    id: 'sports-4',
    title: 'Champions League nights are reshaping the title race at home',
    category: 'sports',
    summary: 'European intensity is now affecting squad freshness, league rotation, and the next round of headline fixtures.',
    content:
      'Top clubs often say they can compete on every front, but the schedule keeps asking difficult questions.\n\nThe after-effects of midweek football are already showing in training plans, recovery windows, and likely team selections for the weekend.\n\nWe highlight the clubs managing the balance best.',
    source: `${BRAND_NAME} Matchday`,
    time: '58m ago',
    image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=900&q=80',
  },
  {
    id: 'movies-1',
    title: 'Trailer watch: the most anticipated premieres',
    category: 'movies',
    summary: 'A quick roundup of upcoming releases and what to expect from each story.',
    content:
      "Studios are doubling down on big concepts and tighter runtimes.\n\nOur roundup includes the trailers that sparked the most conversation, plus the small details you might have missed.\n\nWatch the teaser, then see what's next on the calendar.",
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
      "Today's funniest clips were all about timing: tight edits, clean punchlines, and relatable chaos.\n\nWe curated a quick list of moments you can share instantly, plus a couple of longer sets that are worth the full watch.",
    source: `${BRAND_NAME} Culture Desk`,
    time: '2h ago',
    image: 'https://images.unsplash.com/photo-1527224857830-43a7acc85260?w=900&q=80',
  },
]

export function getNewsByCategory(category: NewsCategory) {
  return newsItems.filter((item) => item.category === category)
}
