const LOCAL_LEAGUE_HERO_IMAGES: Record<string, string> = {
  'Premier League': '/sports-hero.jpg',
  'La Liga': '/sports-hero.jpg',
  'Serie A': '/champions-league.jpg',
  'Bundesliga': '/sports-hero.jpg',
  'Champions League': '/champions-league.jpg',
  NBA: '/nba-highlights.jpg',
  'Volleyball Nations League': '/nfl-future.jpg',
  FIBA: '/nba-highlights.jpg',
  EuroLeague: '/nba-highlights.jpg',
  'CEV Champions League': '/sports-hero.jpg',
}

const TEAM_PALETTES: Record<string, { primary: string; secondary: string; accent?: string }> = {
  Arsenal: { primary: '#EF0107', secondary: '#9C0E12', accent: '#F7D117' },
  Chelsea: { primary: '#034694', secondary: '#0A2F6F', accent: '#FFFFFF' },
  'Man United': { primary: '#DA291C', secondary: '#7A1A10', accent: '#FBE122' },
  Liverpool: { primary: '#C8102E', secondary: '#7A1020', accent: '#F6EB61' },
  Barcelona: { primary: '#A50044', secondary: '#004D98', accent: '#F4A300' },
  Atletico: { primary: '#CB3524', secondary: '#0C2340', accent: '#FFFFFF' },
  'Real Madrid': { primary: '#E5D3A6', secondary: '#7C6A37', accent: '#FFFFFF' },
  Sevilla: { primary: '#D71920', secondary: '#6B0E14', accent: '#FFFFFF' },
  'AC Milan': { primary: '#D61F2C', secondary: '#111111', accent: '#FFFFFF' },
  Inter: { primary: '#0B57A3', secondary: '#111111', accent: '#F4A300' },
  Juventus: { primary: '#111111', secondary: '#585858', accent: '#FFFFFF' },
  Napoli: { primary: '#12A0D7', secondary: '#094865', accent: '#FFFFFF' },
  Bayern: { primary: '#DC052D', secondary: '#143A6B', accent: '#FFFFFF' },
  PSG: { primary: '#004170', secondary: '#0F1E46', accent: '#E33B5B' },
  'Man City': { primary: '#6CABDD', secondary: '#0A2D52', accent: '#FFFFFF' },
  Dortmund: { primary: '#FDE100', secondary: '#131313', accent: '#FFFFFF' },
  Lakers: { primary: '#552583', secondary: '#FDB927', accent: '#FFFFFF' },
  Warriors: { primary: '#1D428A', secondary: '#FFC72C', accent: '#FFFFFF' },
  Celtics: { primary: '#007A33', secondary: '#0E3B24', accent: '#FFFFFF' },
  Heat: { primary: '#98002E', secondary: '#111111', accent: '#F9A01B' },
  Nuggets: { primary: '#0E2240', secondary: '#FEC524', accent: '#FFFFFF' },
  Bucks: { primary: '#00471B', secondary: '#EEE1C6', accent: '#FFFFFF' },
  Poland: { primary: '#DC2626', secondary: '#8B1111', accent: '#FFFFFF' },
  Brazil: { primary: '#16A34A', secondary: '#0B4F28', accent: '#FDE047' },
  USA: { primary: '#1D4ED8', secondary: '#991B1B', accent: '#FFFFFF' },
  Spain: { primary: '#DC2626', secondary: '#F59E0B', accent: '#FFFFFF' },
  Italy: { primary: '#16A34A', secondary: '#DC2626', accent: '#FFFFFF' },
  Japan: { primary: '#FFFFFF', secondary: '#DC2626', accent: '#111111' },
}

function initialsForTeam(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean)
  if (words.length === 0) return 'TM'
  if (words.length === 1) return words[0].slice(0, 3).toUpperCase()
  return words.slice(0, 2).map((word) => word[0]?.toUpperCase() ?? '').join('')
}

function encodeSvg(svg: string) {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

export function getLeagueHeroImage(leagueName: string) {
  return LOCAL_LEAGUE_HERO_IMAGES[leagueName] || '/sports-hero.jpg'
}

export function getTeamArtwork(teamName: string) {
  const palette = TEAM_PALETTES[teamName] || { primary: '#0F172A', secondary: '#334155', accent: '#F8FAFC' }
  const initials = initialsForTeam(teamName)
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${palette.primary}" />
          <stop offset="100%" stop-color="${palette.secondary}" />
        </linearGradient>
      </defs>
      <rect width="128" height="128" rx="30" fill="url(#bg)" />
      <circle cx="64" cy="64" r="47" fill="none" stroke="${palette.accent || '#FFFFFF'}" stroke-opacity="0.38" stroke-width="4" />
      <path d="M26 28 L102 28 L92 102 L36 102 Z" fill="${palette.accent || '#FFFFFF'}" fill-opacity="0.08" />
      <text x="64" y="73" font-family="Arial, Helvetica, sans-serif" font-size="31" font-weight="700" text-anchor="middle" fill="${palette.accent || '#FFFFFF'}">${initials}</text>
    </svg>
  `
  return encodeSvg(svg)
}
