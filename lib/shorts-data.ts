export type ShortsCategory = 'movies' | 'music' | 'sports' | 'comedy'

export interface ShortVideo {
  id: string
  title: string
  category: ShortsCategory
  durationSeconds: number
  image: string
  videoUrl?: string
  caption: string
}

const demoVideo = 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4'

export const shortVideos: ShortVideo[] = [
  {
    id: 'short-movie-1',
    title: 'Trailer: Dark Pursuit (Teaser)',
    category: 'movies',
    durationSeconds: 42,
    image: '/dark-pursuit.jpg',
    videoUrl: demoVideo,
    caption: 'A fast teaser cut with the best moments.',
  },
  {
    id: 'short-movie-2',
    title: 'Now in Theaters: First look',
    category: 'movies',
    durationSeconds: 35,
    image: '/now-in-theaters.jpg',
    videoUrl: demoVideo,
    caption: 'A quick first look at the new release.',
  },
  {
    id: 'short-music-1',
    title: 'Studio snippet: chorus hook',
    category: 'music',
    durationSeconds: 28,
    image: '/music-featured.jpg',
    videoUrl: demoVideo,
    caption: 'A short behind-the-scenes hook preview.',
  },
  {
    id: 'short-music-2',
    title: 'Lyrics highlight: sing-along moment',
    category: 'music',
    durationSeconds: 24,
    image: '/trending-songs.jpg',
    videoUrl: demoVideo,
    caption: 'A short lyrics highlight clip.',
  },
  {
    id: 'short-sports-1',
    title: 'Match clip: last-minute save',
    category: 'sports',
    durationSeconds: 19,
    image: '/sports-hero.jpg',
    videoUrl: demoVideo,
    caption: "A quick highlight from today’s match.",
  },
  {
    id: 'short-sports-2',
    title: 'Top 3 plays: quick recap',
    category: 'sports',
    durationSeconds: 33,
    image: '/nba-highlights.jpg',
    videoUrl: demoVideo,
    caption: 'Fast recap of the best plays.',
  },
  {
    id: 'short-comedy-1',
    title: 'Comedy: one-liner that broke the room',
    category: 'comedy',
    durationSeconds: 22,
    image: '/top-rated.jpg',
    videoUrl: demoVideo,
    caption: 'A short comedy moment clip.',
  },
  {
    id: 'short-comedy-2',
    title: 'Comedy: crowd work highlight',
    category: 'comedy',
    durationSeconds: 31,
    image: '/now-in-theaters.jpg',
    videoUrl: demoVideo,
    caption: 'Quick crowd work highlight from a set.',
  },
]

export function getShortById(id: string): ShortVideo | null {
  return shortVideos.find((s) => s.id === id) ?? null
}

