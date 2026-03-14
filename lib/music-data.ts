export interface MusicTrack {
  id: string
  title: string
  artist: string
  album?: string
  image: string
  genre: string
  duration: string // formatted mm:ss
  durationSeconds: number
  url?: string
  popularity?: number
  releaseDate?: string // ISO date
  lyrics?: string
}

// Helper utilities to generate sample tracks
const sampleImages = ['/trending-songs.jpg', '/new-releases.jpg', '/pop-hits.jpg', '/music-featured.jpg', '/cover1.jpg', '/cover2.jpg']
const sampleArtists = ['Nova Bloom', 'JVKE', 'Lewis Capaldi', 'The Weeknd', 'Aria Lane', 'Midnight City', 'Echoes', 'Solaris', 'Neon Drift', 'Paper Boats']
const sampleTitles = [
  'Night Drive', 'Golden Hour', 'Before You Go', 'Blinding Lights', 'Lost In Time', 'City Lights', 'Fading Echoes', 'Sunset Glow', 'Paper Trails', 'Midnight Run',
  'Deep Sea', 'Starlit', 'Weekend', 'After Hours', 'Silver Lining', 'Northern Sky', 'Paradise', 'Gravity', 'Waves', 'Horizon',
]
const sampleGenres = ['Pop', 'Electronic', 'Synth Pop', 'Indie', 'Hip-Hop', 'Rock', 'Chill', 'Dance']
const sampleUrls = [
  'https://samplelib.com/lib/preview/mp3/sample-3s.mp3',
  'https://samplelib.com/lib/preview/mp3/sample-6s.mp3',
  'https://samplelib.com/lib/preview/mp3/sample-12s.mp3',
]

function fmtsecs(s: number) {
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  return `${m}:${sec.toString().padStart(2, '0')}`
}

export const musicTracks: MusicTrack[] = Array.from({ length: 100 }).map((_, i) => {
  const title = sampleTitles[i % sampleTitles.length] + (i >= sampleTitles.length ? ` ${Math.floor(i / sampleTitles.length)}` : '')
  const artist = sampleArtists[i % sampleArtists.length]
  const genre = sampleGenres[i % sampleGenres.length]
  const image = sampleImages[i % sampleImages.length]
  const durationSeconds = [30, 45, 60, 90, 120][i % 5] // short demo snippets: 30s-2min
  const url = sampleUrls[i % sampleUrls.length]
  const popularity = Math.max(0, 100 - (i % 100))
  const releaseDate = new Date(Date.now() - i * 86400000).toISOString()
  const lyrics = [
    `(${artist}) ${title}`,
    '',
    'Verse',
    "I’m chasing lights in the city glow,",
    'Counting moments, moving slow,',
    'Every heartbeat keeps the rhythm close,',
    'Hold on tight—don’t let it go.',
    '',
    'Chorus',
    `${title}, ${title}, let it play,`,
    'Sing it loud and fade away,',
  ].join('\n')
  return {
    id: `track-${i + 1}`,
    title,
    artist,
    album: `Album ${Math.floor(i / 10) + 1}`,
    image,
    genre,
    duration: fmtsecs(durationSeconds),
    durationSeconds,
    url,
    popularity,
    releaseDate,
    lyrics: i < 30 ? lyrics : undefined,
  }
})

export function getTrackById(id: string): MusicTrack | null {
  return musicTracks.find((track) => track.id === id) ?? null
}
