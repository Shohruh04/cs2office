const API_BASE = '/api';

// Generic fetch wrapper
async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  return response.json();
}

// Players API
export const playersAPI = {
  getAll: () => fetchAPI<Player[]>('/players'),
  getById: (id: number) => fetchAPI<PlayerDetail>(`/players/${id}`),
};

// Matches API
export const matchesAPI = {
  getAll: (limit = 20, offset = 0) =>
    fetchAPI<Match[]>(`/matches?limit=${limit}&offset=${offset}`),
  getById: (id: number) => fetchAPI<MatchDetail>(`/matches/${id}`),
  getRounds: (id: number) => fetchAPI<Round[]>(`/matches/${id}/rounds`),
};

// Stats API
export const statsAPI = {
  getLeaderboard: (sort = 'kills') =>
    fetchAPI<LeaderboardEntry[]>(`/stats/leaderboard?sort=${sort}`),
  getSummary: () => fetchAPI<StatsSummary>('/stats/summary'),
};

// Live API
export const liveAPI = {
  getState: () => fetchAPI<LiveState>('/live'),
};

// Admin API
export const adminAPI = {
  getStatus: () => fetchAPI<AdminStatus>('/admin/status'),
  updatePlayer: (id: number, data: { name?: string; avatarUrl?: string }) =>
    fetchAPI<Player>(`/admin/players/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteMatch: (id: number) =>
    fetchAPI<{ success: boolean }>(`/admin/matches/${id}`, {
      method: 'DELETE',
    }),
};

// Types
export interface Player {
  id: number;
  steamId: string;
  name: string;
  avatarUrl: string | null;
  createdAt: string;
  stats: PlayerStats;
}

export interface PlayerStats {
  kills: number;
  deaths: number;
  assists: number;
  headshots: number;
  mvps: number;
  matchesPlayed: number;
  kdRatio: number;
  headshotPercentage: number;
}

export interface PlayerDetail extends Player {
  stats: PlayerStats & {
    score: number;
    damage: number;
    wins: number;
    losses: number;
    winRate: number;
  };
  matchHistory: MatchHistoryItem[];
}

export interface MatchHistoryItem {
  matchId: number;
  map: string;
  startTime: string;
  endTime: string | null;
  ctScore: number;
  tScore: number;
  status: string;
  playerTeam: string;
  playerKills: number;
  playerDeaths: number;
  playerAssists: number;
  playerScore: number;
}

export interface Match {
  id: number;
  map: string;
  mode: string | null;
  startTime: string;
  endTime: string | null;
  teamCtScore: number;
  teamTScore: number;
  status: string;
  roundsPlayed: number;
  playerCount: number;
}

export interface MatchDetail extends Match {
  teams: {
    ct: TeamData;
    t: TeamData;
  };
}

export interface TeamData {
  score: number;
  players: MatchPlayerStats[];
}

export interface MatchPlayerStats {
  playerId: number;
  steamId: string;
  name: string;
  avatarUrl: string | null;
  team: string;
  kills: number;
  deaths: number;
  assists: number;
  headshots: number;
  mvps: number;
  score: number;
  damage: number;
}

export interface Round {
  id: number;
  matchId: number;
  roundNumber: number;
  winnerTeam: string | null;
  winReason: string | null;
  bombPlanted: boolean;
  bombDefused: boolean;
  kills: RoundKill[];
}

export interface RoundKill {
  id: number;
  killerName: string | null;
  killerId: number | null;
  victimName: string;
  victimId: number;
  weapon: string;
  headshot: boolean;
  timestamp: string;
}

export interface LeaderboardEntry {
  rank: number;
  playerId: number;
  steamId: string;
  name: string;
  avatarUrl: string | null;
  totalKills: number;
  totalDeaths: number;
  totalAssists: number;
  totalHeadshots: number;
  totalMvps: number;
  totalScore: number;
  matchesPlayed: number;
  kdRatio: number;
  headshotPercentage: number;
}

export interface StatsSummary {
  totals: {
    players: number;
    matches: number;
    completedMatches: number;
    kills: number;
  };
  mapStats: { map: string; count: number }[];
  topKiller: { playerId: number; name: string; kills: number } | null;
  recentMatches: Match[];
  weaponStats: { weapon: string; kills: number; headshots: number }[];
}

export interface LiveState {
  isLive: boolean;
  matchId: number | null;
  state: ParsedMatchState | null;
}

export interface ParsedMatchState {
  isLive: boolean;
  map: string;
  mode: string;
  phase: string;
  round: number;
  ctScore: number;
  tScore: number;
  roundPhase: string;
  bombState?: string;
  players: LivePlayer[];
}

export interface LivePlayer {
  steamId: string;
  name: string;
  team: 'CT' | 'T';
  health: number;
  armor: number;
  helmet: boolean;
  money: number;
  kills: number;
  deaths: number;
  assists: number;
  mvps: number;
  score: number;
  roundKills: number;
  roundDamage: number;
  equipValue: number;
  hasDefuseKit: boolean;
}

export interface AdminStatus {
  status: string;
  uptime: number;
  memory: {
    heapUsed: number;
    heapTotal: number;
    rss: number;
  };
  database: {
    players: number;
    matches: number;
  };
  currentMatch: {
    id: number;
    map: string;
    score: string;
  } | null;
}
