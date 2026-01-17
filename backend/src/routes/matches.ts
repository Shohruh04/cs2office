import { Router } from 'express';
import { query, queryOne } from '../db/index.js';

const router = Router();

/**
 * GET /api/matches
 * List all matches
 */
router.get('/', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;

    const allMatches = query<{
      id: number;
      map: string;
      startTime: string;
      endTime: string | null;
      teamCtScore: number;
      teamTScore: number;
      status: string;
    }>(`
      SELECT id, map, start_time as startTime, end_time as endTime,
             team_ct_score as teamCtScore, team_t_score as teamTScore, status
      FROM matches
      ORDER BY start_time DESC
      LIMIT ? OFFSET ?
    `, [limit, offset]);

    // Get player count for each match
    const matchesWithPlayers = allMatches.map((match) => {
      const result = queryOne<{ count: number }>(`
        SELECT COUNT(*) as count FROM match_players WHERE match_id = ?
      `, [match.id]);

      return {
        ...match,
        playerCount: result?.count ?? 0,
      };
    });

    res.json(matchesWithPlayers);
  } catch (error) {
    console.error('Error fetching matches:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/matches/:id
 * Get match details with all player stats
 */
router.get('/:id', async (req, res) => {
  try {
    const matchId = parseInt(req.params.id);

    const match = queryOne<{
      id: number;
      map: string;
      startTime: string;
      endTime: string | null;
      teamCtScore: number;
      teamTScore: number;
      status: string;
    }>(`
      SELECT id, map, start_time as startTime, end_time as endTime,
             team_ct_score as teamCtScore, team_t_score as teamTScore, status
      FROM matches WHERE id = ?
    `, [matchId]);

    if (!match) {
      return res.status(404).json({ error: 'Match not found' });
    }

    // Get all players in match with their stats
    const matchPlayerStats = query<{
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
    }>(`
      SELECT p.id as playerId, p.steam_id as steamId, p.name, p.avatar_url as avatarUrl,
             mp.team, mp.kills, mp.deaths, mp.assists, mp.headshots, mp.mvps, mp.score, mp.damage
      FROM match_players mp
      INNER JOIN players p ON mp.player_id = p.id
      WHERE mp.match_id = ?
      ORDER BY mp.score DESC
    `, [matchId]);

    // Separate by team
    const ctPlayers = matchPlayerStats.filter(p => p.team === 'CT');
    const tPlayers = matchPlayerStats.filter(p => p.team === 'T');

    res.json({
      ...match,
      teams: {
        ct: {
          score: match.teamCtScore,
          players: ctPlayers,
        },
        t: {
          score: match.teamTScore,
          players: tPlayers,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching match:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/matches/:id/rounds
 * Get round-by-round data for a match
 */
router.get('/:id/rounds', async (req, res) => {
  try {
    const matchId = parseInt(req.params.id);

    const matchRounds = query<{
      id: number;
      matchId: number;
      roundNumber: number;
      winnerTeam: string | null;
      bombPlanted: number;
      bombDefused: number;
    }>(`
      SELECT id, match_id as matchId, round_number as roundNumber,
             winner_team as winnerTeam, bomb_planted as bombPlanted, bomb_defused as bombDefused
      FROM rounds
      WHERE match_id = ?
      ORDER BY round_number
    `, [matchId]);

    // Get kills for each round
    const roundsWithKills = matchRounds.map((round) => {
      const kills = query<{
        id: number;
        killerName: string | null;
        killerId: number | null;
        victimName: string | null;
        victimId: number | null;
        weapon: string;
        headshot: number;
        timestamp: string | null;
      }>(`
        SELECT rk.id, killer.name as killerName, rk.killer_player_id as killerId,
               victim.name as victimName, rk.victim_player_id as victimId,
               rk.weapon, rk.headshot, rk.timestamp
        FROM round_kills rk
        LEFT JOIN players killer ON rk.killer_player_id = killer.id
        LEFT JOIN players victim ON rk.victim_player_id = victim.id
        WHERE rk.round_id = ?
        ORDER BY rk.timestamp
      `, [round.id]);

      return {
        ...round,
        kills,
      };
    });

    res.json(roundsWithKills);
  } catch (error) {
    console.error('Error fetching rounds:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
