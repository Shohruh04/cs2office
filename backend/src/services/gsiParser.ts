import type {
  GSIPayload,
  ParsedMatchState,
  ParsedPlayerState,
  KillEvent,
  RoundEndEvent
} from '../types/gsi.js';

export class GSIParser {
  private previousState: GSIPayload | null = null;
  private previousPlayers: Map<string, { health: number; roundKills: number }> = new Map();

  /**
   * Parse raw GSI payload into a structured match state
   */
  parseMatchState(payload: GSIPayload): ParsedMatchState | null {
    if (!payload.map) {
      return null;
    }

    const players: ParsedPlayerState[] = [];

    // Parse all players
    if (payload.allplayers) {
      for (const [steamId, playerData] of Object.entries(payload.allplayers)) {
        players.push({
          steamId,
          name: playerData.name,
          team: playerData.team,
          health: playerData.state?.health ?? 0,
          armor: playerData.state?.armor ?? 0,
          helmet: playerData.state?.helmet ?? false,
          money: playerData.state?.money ?? 0,
          kills: playerData.match_stats?.kills ?? 0,
          deaths: playerData.match_stats?.deaths ?? 0,
          assists: playerData.match_stats?.assists ?? 0,
          mvps: playerData.match_stats?.mvps ?? 0,
          score: playerData.match_stats?.score ?? 0,
          roundKills: playerData.state?.round_kills ?? 0,
          roundDamage: playerData.state?.round_totaldmg ?? 0,
          equipValue: playerData.state?.equip_value ?? 0,
          hasDefuseKit: playerData.state?.defusekit ?? false,
        });
      }
    }

    return {
      isLive: payload.map.phase === 'live',
      map: payload.map.name,
      mode: payload.map.mode,
      phase: payload.map.phase,
      round: payload.map.round,
      ctScore: payload.map.team_ct?.score ?? 0,
      tScore: payload.map.team_t?.score ?? 0,
      roundPhase: payload.round?.phase ?? 'unknown',
      bombState: payload.round?.bomb,
      players,
    };
  }

  /**
   * Detect kill events by comparing player states
   */
  detectKills(payload: GSIPayload): KillEvent[] {
    const kills: KillEvent[] = [];

    if (!payload.allplayers || !this.previousState?.allplayers) {
      this.updatePreviousState(payload);
      return kills;
    }

    // Check for players who died (health went from > 0 to 0)
    for (const [steamId, playerData] of Object.entries(payload.allplayers)) {
      const prevPlayerData = this.previousPlayers.get(steamId);
      const currentHealth = playerData.state?.health ?? 0;
      const prevHealth = prevPlayerData?.health ?? 100;

      if (prevHealth > 0 && currentHealth === 0) {
        // Player died - try to find killer
        const killer = this.findKiller(payload, steamId);

        kills.push({
          killerSteamId: killer?.steamId ?? null,
          victimSteamId: steamId,
          weapon: killer?.weapon ?? 'unknown',
          headshot: killer?.headshot ?? false,
          timestamp: new Date(),
        });
      }
    }

    this.updatePreviousState(payload);
    return kills;
  }

  /**
   * Try to find the killer based on round_kills increment
   */
  private findKiller(payload: GSIPayload, victimSteamId: string): { steamId: string; weapon: string; headshot: boolean } | null {
    if (!payload.allplayers) return null;

    const victim = payload.allplayers[victimSteamId];
    if (!victim) return null;

    // Look for a player on the opposite team whose round_kills increased
    for (const [steamId, playerData] of Object.entries(payload.allplayers)) {
      if (steamId === victimSteamId) continue;
      if (playerData.team === victim.team) continue; // Skip teammates

      const prevRoundKills = this.previousPlayers.get(steamId)?.roundKills ?? 0;
      const currentRoundKills = playerData.state?.round_kills ?? 0;

      if (currentRoundKills > prevRoundKills) {
        // This player got a kill - find active weapon
        let activeWeapon = 'unknown';
        let isHeadshot = false;

        if (playerData.weapons) {
          for (const weapon of Object.values(playerData.weapons)) {
            if (weapon.state === 'active') {
              activeWeapon = weapon.name.replace('weapon_', '');
              break;
            }
          }
        }

        // Check if it was a headshot (round_killhs increased)
        const prevRoundKillHs = 0; // We'd need to track this too for accuracy
        const currentRoundKillHs = playerData.state?.round_killhs ?? 0;
        isHeadshot = currentRoundKillHs > prevRoundKillHs;

        return {
          steamId,
          weapon: activeWeapon,
          headshot: isHeadshot,
        };
      }
    }

    return null;
  }

  /**
   * Detect round end events
   */
  detectRoundEnd(payload: GSIPayload): RoundEndEvent | null {
    // Check if round phase changed to 'over' and we have a winner
    if (
      payload.round?.phase === 'over' &&
      payload.round?.win_team &&
      this.previousState?.round?.phase !== 'over'
    ) {
      let winReason = 'elimination';
      let bombPlanted = false;
      let bombDefused = false;

      if (payload.round.bomb === 'exploded') {
        winReason = 'bomb_exploded';
        bombPlanted = true;
      } else if (payload.round.bomb === 'defused') {
        winReason = 'bomb_defused';
        bombPlanted = true;
        bombDefused = true;
      } else if (payload.round.bomb === 'planted') {
        bombPlanted = true;
      }

      return {
        roundNumber: payload.map?.round ?? 0,
        winnerTeam: payload.round.win_team,
        winReason,
        bombPlanted,
        bombDefused,
      };
    }

    return null;
  }

  /**
   * Check if a new match started
   */
  isNewMatch(payload: GSIPayload): boolean {
    // New match if:
    // 1. Map changed
    // 2. Round is 0 or 1 and scores are 0-0
    // 3. Phase changed from gameover to live/warmup

    if (!payload.map) return false;

    const isFirstRound = payload.map.round <= 1;
    const scoresZero = payload.map.team_ct?.score === 0 && payload.map.team_t?.score === 0;
    const mapChanged = this.previousState?.map?.name !== payload.map.name;
    const phaseChangedToLive =
      this.previousState?.map?.phase === 'gameover' &&
      (payload.map.phase === 'live' || payload.map.phase === 'warmup');

    return mapChanged || (isFirstRound && scoresZero) || phaseChangedToLive;
  }

  /**
   * Check if match ended
   */
  isMatchEnd(payload: GSIPayload): boolean {
    return (
      payload.map?.phase === 'gameover' &&
      this.previousState?.map?.phase !== 'gameover'
    );
  }

  /**
   * Update previous state for comparison
   */
  private updatePreviousState(payload: GSIPayload): void {
    this.previousState = payload;

    // Update player tracking
    this.previousPlayers.clear();
    if (payload.allplayers) {
      for (const [steamId, playerData] of Object.entries(payload.allplayers)) {
        this.previousPlayers.set(steamId, {
          health: playerData.state?.health ?? 0,
          roundKills: playerData.state?.round_kills ?? 0,
        });
      }
    }
  }

  /**
   * Reset parser state (call when match ends)
   */
  reset(): void {
    this.previousState = null;
    this.previousPlayers.clear();
  }
}

export const gsiParser = new GSIParser();
