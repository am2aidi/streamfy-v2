export interface MovieItem {
  id: string
  title: string
  subtitle?: string
  image: string
  featured?: boolean
  description: string
  duration: string
  year: number
  rating: number
  genre: string
  type: 'movie' | 'series' | 'animation'
  language: 'en' | 'fr' | 'rw'
}

export const movieCards: MovieItem[] = [
  {
    id: 'dark-pursuit',
    title: 'Dark Pursuit',
    subtitle: 'Featured Movie',
    image: '/now-in-theaters.jpg',
    featured: true,
    description: 'A detective uncovers a global conspiracy while chasing a missing witness.',
    duration: '2h 08m',
    year: 2024,
    rating: 8.8,
    genre: 'Thriller',
    type: 'movie',
    language: 'en',
  },
  {
    id: 'now-in-theaters',
    title: 'Now in Theaters',
    image: '/dark-pursuit.jpg',
    description: 'An action-packed thriller with stunning visuals and nonstop tension.',
    duration: '1h 55m',
    year: 2025,
    rating: 8.2,
    genre: 'Action',
    type: 'movie',
    language: 'fr',
  },
  {
    id: 'top-rated',
    title: 'Top Rated',
    image: '/top-rated.jpg',
    description: 'Award-winning drama about ambition, loyalty, and second chances.',
    duration: '2h 16m',
    year: 2023,
    rating: 8.6,
    genre: 'Drama',
    type: 'movie',
    language: 'en',
  },
  {
    id: 'city-shadow',
    title: 'City Shadow',
    image: '/top-rated.svg',
    description: 'A crime reporter tracks a string of disappearances in a sleepless city.',
    duration: '2h 01m',
    year: 2025,
    rating: 8.1,
    genre: 'Mystery',
    type: 'movie',
    language: 'rw',
  },
  {
    id: 'final-whistle',
    title: 'Final Whistle',
    image: '/champions-league.jpg',
    description: 'An underdog team rises through heartbreak, pressure, and impossible odds.',
    duration: '1h 48m',
    year: 2024,
    rating: 7.9,
    genre: 'Sports',
    type: 'movie',
    language: 'en',
  },
  {
    id: 'kylexy',
    title: 'KYLEXY',
    image: '/now-in-theaters.jpg',
    description: 'A gifted outsider discovers a hidden network that predicts city-wide disasters.',
    duration: '52m',
    year: 2026,
    rating: 9.1,
    genre: 'Sci-Fi',
    type: 'series',
    language: 'rw',
  },
  {
    id: 'loud-silence',
    title: 'Loud Silence',
    image: '/top-rated.jpg',
    description: 'A stand-up comic and a journalist unravel a scandal while trying to save their careers.',
    duration: '1h 42m',
    year: 2025,
    rating: 8.0,
    genre: 'Comedy',
    type: 'movie',
    language: 'fr',
  },
  {
    id: 'strike-zone',
    title: 'Strike Zone',
    image: '/champions-league.jpg',
    description: 'A retired coach trains a rebellious prodigy for one final championship.',
    duration: '2h 03m',
    year: 2026,
    rating: 8.3,
    genre: 'Action',
    type: 'movie',
    language: 'en',
  },
  {
    id: 'quantum-border',
    title: 'Quantum Border',
    image: '/dark-pursuit.jpg',
    description: 'Time glitches force a scientist to relive a mission that could reset reality.',
    duration: '2h 11m',
    year: 2026,
    rating: 8.7,
    genre: 'Sci-Fi',
    type: 'animation',
    language: 'fr',
  },
]

export function getMovieById(id: string): MovieItem | null {
  return movieCards.find((movie) => movie.id === id) ?? null
}
