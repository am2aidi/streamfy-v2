// Sports teams data with real logos and information
// Images sourced from free APIs and public resources

export interface Team {
  name: string
  initial: string
  color: string
  logo: string
  record: string
}

export interface SportsMatch {
  id?: string
  league: string
  leagueColor: string
  team1: Team
  team2: Team
  time: string
  status?: 'live' | 'final' | 'upcoming'
  score1?: number
  score2?: number
  starred?: boolean
  heroImage?: string
}

// Team logos from TheSportsDB (free API) and Wikimedia Commons
const TEAM_LOGOS: Record<string, string> = {
  // Premier League
  Arsenal: 'https://www.thesportsdb.com/images/media/team/logo/tsr4l51609599131.png',
  Chelsea: 'https://www.thesportsdb.com/images/media/team/logo/vrxpry1457102402.png',
  'Man United': 'https://www.thesportsdb.com/images/media/team/logo/rrttqq1442901624.png',
  Liverpool: 'https://www.thesportsdb.com/images/media/team/logo/qsytwa1457099131.png',

  // La Liga
  'Barcelona': 'https://www.thesportsdb.com/images/media/team/logo/62f98d1653384124.png',
  'Atletico': 'https://www.thesportsdb.com/images/media/team/logo/w5hqf41609596852.png',
  'Real Madrid': 'https://www.thesportsdb.com/images/media/team/logo/i6o0x01609601370.png',
  'Sevilla': 'https://www.thesportsdb.com/images/media/team/logo/twy4bv1604494913.png',

  // Serie A
  'AC Milan': 'https://www.thesportsdb.com/images/media/team/logo/oesodo1457102382.png',
  'Inter': 'https://www.thesportsdb.com/images/media/team/logo/fsdfsddsfdsf1457102413.png',
  'Juventus': 'https://www.thesportsdb.com/images/media/team/logo/4uewes1457102360.png',
  'Napoli': 'https://www.thesportsdb.com/images/media/team/logo/4ttqie1604494832.png',

  // Champions League / Bundesliga
  'Bayern': 'https://www.thesportsdb.com/images/media/team/logo/t43v851609602122.png',
  'PSG': 'https://www.thesportsdb.com/images/media/team/logo/zus4te1457104370.png',
  'Man City': 'https://www.thesportsdb.com/images/media/team/logo/xwxypu1457102468.png',
  'Dortmund': 'https://www.thesportsdb.com/images/media/team/logo/sqt5ew1457102421.png',

  // NBA
  'Lakers': 'https://www.thesportsdb.com/images/media/team/logo/qvvvvq1467460447.png',
  'Warriors': 'https://www.thesportsdb.com/images/media/team/logo/5l0awe1467460491.png',
  'Celtics': 'https://www.thesportsdb.com/images/media/team/logo/ooueww1467460584.png',
  'Heat': 'https://www.thesportsdb.com/images/media/team/logo/7hbhj1467460495.png',
  'Nuggets': 'https://www.thesportsdb.com/images/media/team/logo/u36u561467461048.png',
  'Bucks': 'https://www.thesportsdb.com/images/media/team/logo/4rwwqq1467461112.png',
}

const LEAGUE_HERO_IMAGES: Record<string, string> = {
  'Premier League': 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&q=80',
  'La Liga': 'https://images.unsplash.com/photo-1522869635100-ce306475b3ce?w=800&q=80',
  'Serie A': 'https://images.unsplash.com/photo-1579952363873-27f3bade9e55?w=800&q=80',
  'Bundesliga': 'https://images.unsplash.com/photo-1456283591236-e1ad6a4c2d7a?w=800&q=80',
  'Champions League': 'https://images.unsplash.com/photo-1526232216027-f891400cb1d7?w=800&q=80',
  'NBA': 'https://images.unsplash.com/photo-1546519638-68711109f78f?w=800&q=80',
  'Volleyball Nations League': 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&q=80',
  'FIBA': 'https://images.unsplash.com/photo-1519861531473-9200262188bf?w=800&q=80',
}

function getTeamLogo(teamName: string): string {
  return TEAM_LOGOS[teamName] || '/placeholder-logo.png'
}

function getLeagueHero(leagueName: string): string {
  return LEAGUE_HERO_IMAGES[leagueName] || 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&q=80'
}

export const sportsData = {
  yesterday: [
    {
      league: 'Premier League',
      leagueColor: '#3D195B',
      team1: {
        name: 'Arsenal',
        record: '22-3-5',
        initial: 'ARS',
        color: '#EF0107',
        logo: getTeamLogo('Arsenal'),
      },
      team2: {
        name: 'Chelsea',
        record: '18-6-6',
        initial: 'CHE',
        color: '#034694',
        logo: getTeamLogo('Chelsea'),
      },
      time: 'FT',
      status: 'final' as const,
      score1: 2,
      score2: 1,
      heroImage: getLeagueHero('Premier League'),
    },
    {
      league: 'La Liga',
      leagueColor: '#EE8707',
      team1: {
        name: 'Barcelona',
        record: '24-4-2',
        initial: 'BAR',
        color: '#A50044',
        logo: getTeamLogo('Barcelona'),
      },
      team2: {
        name: 'Atletico',
        record: '19-5-6',
        initial: 'ATM',
        color: '#CB3524',
        logo: getTeamLogo('Atletico'),
      },
      time: 'FT',
      status: 'final' as const,
      score1: 3,
      score2: 0,
      heroImage: getLeagueHero('La Liga'),
    },
    {
      league: 'NBA',
      leagueColor: '#1D428A',
      team1: {
        name: 'Lakers',
        record: '38-20',
        initial: 'LAL',
        color: '#FDB927',
        logo: getTeamLogo('Lakers'),
      },
      team2: {
        name: 'Warriors',
        record: '35-23',
        initial: 'GSW',
        color: '#1D428A',
        logo: getTeamLogo('Warriors'),
      },
      time: 'FT',
      status: 'final' as const,
      score1: 112,
      score2: 108,
      heroImage: getLeagueHero('NBA'),
    },
  ] as SportsMatch[],

  today: [
    {
      league: 'Champions League',
      leagueColor: '#003399',
      team1: {
        name: 'Real Madrid',
        record: '20-5-3',
        initial: 'RMA',
        color: '#FEBE10',
        logo: getTeamLogo('Real Madrid'),
      },
      team2: {
        name: 'Man City',
        record: '21-3-4',
        initial: 'MCI',
        color: '#6CABDD',
        logo: getTeamLogo('Man City'),
      },
      time: 'LIVE',
      status: 'live' as const,
      score1: 1,
      score2: 1,
      starred: true,
      heroImage: getLeagueHero('Champions League'),
    },
    {
      league: 'Champions League',
      leagueColor: '#003399',
      team1: {
        name: 'PSG',
        record: '19-6-3',
        initial: 'PSG',
        color: '#004170',
        logo: getTeamLogo('PSG'),
      },
      team2: {
        name: 'Bayern',
        record: '22-2-4',
        initial: 'BAY',
        color: '#DC052D',
        logo: getTeamLogo('Bayern'),
      },
      time: '9:00 PM',
      status: 'upcoming' as const,
      heroImage: getLeagueHero('Champions League'),
    },
    {
      league: 'NBA',
      leagueColor: '#1D428A',
      team1: {
        name: 'Celtics',
        record: '42-12',
        initial: 'BOS',
        color: '#007A33',
        logo: getTeamLogo('Celtics'),
      },
      team2: {
        name: 'Heat',
        record: '33-21',
        initial: 'MIA',
        color: '#98002E',
        logo: getTeamLogo('Heat'),
      },
      time: 'LIVE',
      status: 'live' as const,
      score1: 89,
      score2: 85,
      heroImage: getLeagueHero('NBA'),
    },
    {
      league: 'Serie A',
      leagueColor: '#008FD7',
      team1: {
        name: 'AC Milan',
        record: '18-7-5',
        initial: 'MIL',
        color: '#FB090B',
        logo: getTeamLogo('AC Milan'),
      },
      team2: {
        name: 'Inter',
        record: '21-4-5',
        initial: 'INT',
        color: '#010E80',
        logo: getTeamLogo('Inter'),
      },
      time: '10:00 PM',
      status: 'upcoming' as const,
      heroImage: getLeagueHero('Serie A'),
    },
    {
      league: 'Volleyball Nations League',
      leagueColor: '#16A34A',
      team1: {
        name: 'Poland',
        record: '8-2',
        initial: 'POL',
        color: '#DC2626',
        logo: '/placeholder-logo.png',
      },
      team2: {
        name: 'Brazil',
        record: '7-3',
        initial: 'BRA',
        color: '#16A34A',
        logo: '/placeholder-logo.png',
      },
      time: '8:30 PM',
      status: 'upcoming' as const,
      heroImage: getLeagueHero('Volleyball Nations League'),
    },
  ] as SportsMatch[],

  upcoming: [
    {
      league: 'Premier League',
      leagueColor: '#3D195B',
      team1: {
        name: 'Man United',
        record: '16-8-6',
        initial: 'MUN',
        color: '#DA291C',
        logo: getTeamLogo('Man United'),
      },
      team2: {
        name: 'Liverpool',
        record: '23-4-3',
        initial: 'LIV',
        color: '#C8102E',
        logo: getTeamLogo('Liverpool'),
      },
      time: 'Sat 3:00 PM',
      status: 'upcoming' as const,
      starred: true,
      heroImage: getLeagueHero('Premier League'),
    },
    {
      league: 'La Liga',
      leagueColor: '#EE8707',
      team1: {
        name: 'Real Madrid',
        record: '20-5-3',
        initial: 'RMA',
        color: '#FEBE10',
        logo: getTeamLogo('Real Madrid'),
      },
      team2: {
        name: 'Sevilla',
        record: '14-8-8',
        initial: 'SEV',
        color: '#F43333',
        logo: getTeamLogo('Sevilla'),
      },
      time: 'Sat 8:00 PM',
      status: 'upcoming' as const,
      heroImage: getLeagueHero('La Liga'),
    },
    {
      league: 'NBA',
      leagueColor: '#1D428A',
      team1: {
        name: 'Nuggets',
        record: '40-14',
        initial: 'DEN',
        color: '#0E2240',
        logo: getTeamLogo('Nuggets'),
      },
      team2: {
        name: 'Bucks',
        record: '36-18',
        initial: 'MIL',
        color: '#00471B',
        logo: getTeamLogo('Bucks'),
      },
      time: 'Sun 7:30 PM',
      status: 'upcoming' as const,
      heroImage: getLeagueHero('NBA'),
    },
    {
      league: 'Bundesliga',
      leagueColor: '#D20515',
      team1: {
        name: 'Dortmund',
        record: '17-6-5',
        initial: 'BVB',
        color: '#FDE100',
        logo: getTeamLogo('Dortmund'),
      },
      team2: {
        name: 'Bayern',
        record: '22-2-4',
        initial: 'BAY',
        color: '#DC052D',
        logo: getTeamLogo('Bayern'),
      },
      time: 'Sun 5:30 PM',
      status: 'upcoming' as const,
      heroImage: getLeagueHero('Bundesliga'),
    },
    {
      league: 'FIBA',
      leagueColor: '#2563EB',
      team1: {
        name: 'USA',
        record: '9-1',
        initial: 'USA',
        color: '#1D4ED8',
        logo: '/placeholder-logo.png',
      },
      team2: {
        name: 'Spain',
        record: '8-2',
        initial: 'ESP',
        color: '#DC2626',
        logo: '/placeholder-logo.png',
      },
      time: 'Mon 7:00 PM',
      status: 'upcoming' as const,
      heroImage: getLeagueHero('FIBA'),
    },
    {
      league: 'Volleyball Nations League',
      leagueColor: '#16A34A',
      team1: {
        name: 'Italy',
        record: '7-3',
        initial: 'ITA',
        color: '#16A34A',
        logo: '/placeholder-logo.svg',
      },
      team2: {
        name: 'Japan',
        record: '6-4',
        initial: 'JPN',
        color: '#EF4444',
        logo: '/placeholder-logo.png',
      },
      time: 'Tue 8:00 PM',
      status: 'upcoming' as const,
      heroImage: getLeagueHero('Volleyball Nations League'),
    },
    {
      league: 'Serie A',
      leagueColor: '#008FD7',
      team1: {
        name: 'Juventus',
        record: '19-5-4',
        initial: 'JUV',
        color: '#000000',
        logo: getTeamLogo('Juventus'),
      },
      team2: {
        name: 'Napoli',
        record: '20-4-4',
        initial: 'NAP',
        color: '#12A0D7',
        logo: getTeamLogo('Napoli'),
      },
      time: 'Mon 8:45 PM',
      status: 'upcoming' as const,
      heroImage: getLeagueHero('Serie A'),
    },
  ] as SportsMatch[],
}

export type SportsTab = keyof typeof sportsData

export function getMatchId(tab: SportsTab, index: number): string {
  return `${tab}-${index}`
}

export function getAllMatches(): Array<SportsMatch & { id: string; tab: SportsTab }> {
  return (Object.keys(sportsData) as SportsTab[]).flatMap((tab) =>
    sportsData[tab].map((match, index) => ({
      ...match,
      id: getMatchId(tab, index),
      tab,
    }))
  )
}

export function getMatchById(id: string): (SportsMatch & { id: string; tab: SportsTab }) | null {
  const all = getAllMatches()
  return all.find((match) => match.id === id) ?? null
}
