import { queryOne, run } from '../db/index.js';
import type { ParsedMatchState, ParsedPlayerState, KillEvent, RoundEndEvent } from '../types/gsi.js';
import type { Server as SocketServer } from 'socket.io';

export class MatchManager {
  private currentMatchId: number | null = null;
  private currentRoundId: number | null = null;
  private io: SocketServer | null = null;
  private liveState: ParsedMatchState | null = null;

  setSocketServer(io: SocketServer) {
    this.io = io;
  }

  getLiveState(): ParsedMatchState | null {
    return this.liveState;
  }

  /**
   * Check if a steam ID belongs to a bot
   */
  private isBot(steamId: string): boolean {
    // Bot steam IDs start with "BOT" in CS2 GSI data
    return steamId.startsWith('BOT');
  }

  async getOrCreatePlayer(steamId: string, name: string): Promise<number> {
    // Skip bots
    if (this.isBot(steamId)) {
      return -1;
    }

    const existing = queryOne<{ id: number; name: string }>(
      'SELECT id, name FROM players WHERE steam_id = ?',
      [steamId]
    );

    if (existing) {
      if (existing.name !== name) {
        run('UPDATE players SET name = ? WHERE id = ?', [name, existing.id]);
      }
      return existing.id;
    }

    const result = run(
      'INSERT INTO players (steam_id, name, created_at) VALUES (?, ?, ?)',
      [steamId, name, Date.now()]
    );

    console.log(`New player registered: ${name} (${steamId})`);
    return result.lastInsertRowId;
  }

  async startMatch(state: ParsedMatchState): Promise<number> {
    if (this.currentMatchId) {
      await this.endMatch();
    }

    const result = run(
      'INSERT INTO matches (map, mode, start_time, status, team_ct_score, team_t_score, rounds_played) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [state.map, state.mode, Date.now(), 'ongoing', 0, 0, 0]
    );

    this.currentMatchId = result.lastInsertRowId;
    console.log(`Match started: ${state.map} (ID: ${this.currentMatchId})`);

    for (const player of state.players) {
      await this.addPlayerToMatch(player);
    }

    this.emit('match:start', { matchId: this.currentMatchId, map: state.map });
    return this.currentMatchId;
  }

  private async addPlayerToMatch(player: ParsedPlayerState): Promise<void> {
    if (!this.currentMatchId) return;

    const playerId = await this.getOrCreatePlayer(player.steamId, player.name);

    // Skip bots (playerId is -1 for bots)
    if (playerId < 0) return;

    const existing = queryOne(
      'SELECT id FROM match_players WHERE match_id = ? AND player_id = ?',
      [this.currentMatchId, playerId]
    );

    if (!existing) {
      run(
        'INSERT INTO match_players (match_id, player_id, team, kills, deaths, assists, headshots, mvps, score, damage) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [this.currentMatchId, playerId, player.team, 0, 0, 0, 0, 0, 0, 0]
      );
    }
  }

  async updateMatch(state: ParsedMatchState): Promise<void> {
    this.liveState = state;

    if (!this.currentMatchId) {
      await this.startMatch(state);
      return;
    }

    run(
      'UPDATE matches SET team_ct_score = ?, team_t_score = ?, rounds_played = ? WHERE id = ?',
      [state.ctScore, state.tScore, state.round, this.currentMatchId]
    );

    for (const player of state.players) {
      await this.updatePlayerStats(player);
    }

    this.emit('match:update', { matchId: this.currentMatchId, state });
  }

  private async updatePlayerStats(player: ParsedPlayerState): Promise<void> {
    if (!this.currentMatchId) return;

    const playerId = await this.getOrCreatePlayer(player.steamId, player.name);

    // Skip bots (playerId is -1 for bots)
    if (playerId < 0) return;

    run(
      'UPDATE match_players SET team = ?, kills = ?, deaths = ?, assists = ?, mvps = ?, score = ?, damage = ? WHERE match_id = ? AND player_id = ?',
      [player.team, player.kills, player.deaths, player.assists, player.mvps, player.score, player.roundDamage, this.currentMatchId, playerId]
    );
  }

  async recordRound(event: RoundEndEvent): Promise<void> {
    if (!this.currentMatchId) return;

    const result = run(
      'INSERT INTO rounds (match_id, round_number, winner_team, win_reason, bomb_planted, bomb_defused) VALUES (?, ?, ?, ?, ?, ?)',
      [this.currentMatchId, event.roundNumber, event.winnerTeam, event.winReason, event.bombPlanted ? 1 : 0, event.bombDefused ? 1 : 0]
    );

    this.currentRoundId = result.lastInsertRowId;
    this.emit('round:end', { matchId: this.currentMatchId, roundId: this.currentRoundId, event });
  }

  async recordKill(event: KillEvent): Promise<void> {
    if (!this.currentMatchId) return;

    let killerPlayerId: number | null = null;
    if (event.killerSteamId) {
      const killer = queryOne<{ id: number }>('SELECT id FROM players WHERE steam_id = ?', [event.killerSteamId]);
      killerPlayerId = killer?.id ?? null;

      if (event.headshot && killerPlayerId) {
        run('UPDATE match_players SET headshots = headshots + 1 WHERE match_id = ? AND player_id = ?', [this.currentMatchId, killerPlayerId]);
      }
    }

    const victim = queryOne<{ id: number }>('SELECT id FROM players WHERE steam_id = ?', [event.victimSteamId]);
    if (!victim) return;

    if (this.currentRoundId) {
      run(
        'INSERT INTO round_kills (round_id, match_id, killer_player_id, victim_player_id, weapon, headshot, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [this.currentRoundId, this.currentMatchId, killerPlayerId, victim.id, event.weapon, event.headshot ? 1 : 0, Date.now()]
      );
    }

    this.emit('kill', { matchId: this.currentMatchId, event: { ...event, killerPlayerId, victimPlayerId: victim.id } });
  }

  async endMatch(): Promise<void> {
    if (!this.currentMatchId) return;

    run('UPDATE matches SET status = ?, end_time = ? WHERE id = ?', ['completed', Date.now(), this.currentMatchId]);
    console.log(`Match ended: ID ${this.currentMatchId}`);

    this.emit('match:end', { matchId: this.currentMatchId });
    this.currentMatchId = null;
    this.currentRoundId = null;
    this.liveState = null;
  }

  getCurrentMatchId(): number | null {
    return this.currentMatchId;
  }

  private emit(event: string, data: unknown): void {
    if (this.io) {
      this.io.emit(event, data);
    }
  }
}

export const matchManager = new MatchManager();
