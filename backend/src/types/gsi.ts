// CS2 Game State Integration Types

export interface GSIPayload {
  provider?: GSIProvider;
  map?: GSIMap;
  round?: GSIRound;
  player?: GSIPlayer;
  allplayers?: Record<string, GSIPlayerData>;
  previously?: Partial<GSIPayload>;
  added?: Partial<GSIPayload>;
}

export interface GSIProvider {
  name: string;
  appid: number;
  version: number;
  steamid: string;
  timestamp: number;
}

export interface GSIMap {
  mode: string;
  name: string;
  phase: 'live' | 'warmup' | 'intermission' | 'gameover';
  round: number;
  team_ct: GSITeamInfo;
  team_t: GSITeamInfo;
  num_matches_to_win_series: number;
  current_spectators: number;
  souvenirs_total: number;
}

export interface GSITeamInfo {
  score: number;
  consecutive_round_losses: number;
  timeouts_remaining: number;
  matches_won_this_series: number;
  name?: string;
}

export interface GSIRound {
  phase: 'freezetime' | 'live' | 'over';
  win_team?: 'CT' | 'T';
  bomb?: 'planted' | 'exploded' | 'defused';
}

export interface GSIPlayer {
  steamid: string;
  name: string;
  observer_slot?: number;
  team?: 'CT' | 'T';
  activity: string;
  state?: GSIPlayerState;
  match_stats?: GSIMatchStats;
  weapons?: Record<string, GSIWeapon>;
  spectarget?: string;
  position?: string;
  forward?: string;
}

export interface GSIPlayerData {
  steamid: string;
  name: string;
  observer_slot?: number;
  team: 'CT' | 'T';
  state: GSIPlayerState;
  match_stats: GSIMatchStats;
  weapons?: Record<string, GSIWeapon>;
  position?: string;
  forward?: string;
}

export interface GSIPlayerState {
  health: number;
  armor: number;
  helmet: boolean;
  flashed: number;
  smoked: number;
  burning: number;
  money: number;
  round_kills: number;
  round_killhs: number;
  round_totaldmg: number;
  equip_value: number;
  defusekit?: boolean;
}

export interface GSIMatchStats {
  kills: number;
  assists: number;
  deaths: number;
  mvps: number;
  score: number;
}

export interface GSIWeapon {
  name: string;
  paintkit: string;
  type: string;
  ammo_clip?: number;
  ammo_clip_max?: number;
  ammo_reserve?: number;
  state: 'active' | 'holstered';
}

// Parsed/processed types for our application
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
  players: ParsedPlayerState[];
}

export interface ParsedPlayerState {
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

export interface KillEvent {
  killerSteamId: string | null;
  victimSteamId: string;
  weapon: string;
  headshot: boolean;
  timestamp: Date;
}

export interface RoundEndEvent {
  roundNumber: number;
  winnerTeam: 'CT' | 'T';
  winReason: string;
  bombPlanted: boolean;
  bombDefused: boolean;
}
