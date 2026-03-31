import { getLeagueHeroImage, getTeamArtwork } from '@/lib/sports-media'

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

function getTeamLogo(teamName: string): string {
  return getTeamArtwork(teamName)
}

function getLeagueHero(leagueName: string): string {
  return getLeagueHeroImage(leagueName)
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
        logo: getTeamLogo('Poland'),
      },
      team2: {
        name: 'Brazil',
        record: '7-3',
        initial: 'BRA',
        color: '#16A34A',
        logo: getTeamLogo('Brazil'),
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
        logo: getTeamLogo('USA'),
      },
      team2: {
        name: 'Spain',
        record: '8-2',
        initial: 'ESP',
        color: '#DC2626',
        logo: getTeamLogo('Spain'),
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
        logo: getTeamLogo('Italy'),
      },
      team2: {
        name: 'Japan',
        record: '6-4',
        initial: 'JPN',
        color: '#EF4444',
        logo: getTeamLogo('Japan'),
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
