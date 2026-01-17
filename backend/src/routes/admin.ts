import { Router } from 'express';
import { queryOne, run } from '../db/index.js';

const router = Router();

/**
 * GET /api/admin/status
 * Get system status
 */
router.get('/status', async (req, res) => {
  try {
    const playerCount = queryOne<{ count: number }>(`
      SELECT COUNT(*) as count FROM players
    `);

    const matchCount = queryOne<{ count: number }>(`
      SELECT COUNT(*) as count FROM matches
    `);

    const ongoingMatch = queryOne<{
      id: number;
      map: string;
      teamCtScore: number;
      teamTScore: number;
    }>(`
      SELECT id, map, team_ct_score as teamCtScore, team_t_score as teamTScore
      FROM matches WHERE status = 'ongoing' LIMIT 1
    `);

    res.json({
      status: 'healthy',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      database: {
        players: playerCount?.count ?? 0,
        matches: matchCount?.count ?? 0,
      },
      currentMatch: ongoingMatch ? {
        id: ongoingMatch.id,
        map: ongoingMatch.map,
        score: `${ongoingMatch.teamCtScore} - ${ongoingMatch.teamTScore}`,
      } : null,
    });
  } catch (error) {
    console.error('Error fetching status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * PUT /api/admin/players/:id
 * Update player details
 */
router.put('/players/:id', async (req, res) => {
  try {
    const playerId = parseInt(req.params.id);
    const { name, avatarUrl } = req.body;

    const player = queryOne<{ id: number }>(`
      SELECT id FROM players WHERE id = ?
    `, [playerId]);

    if (!player) {
      return res.status(404).json({ error: 'Player not found' });
    }

    const updates: string[] = [];
    const values: any[] = [];

    if (name) {
      updates.push('name = ?');
      values.push(name);
    }
    if (avatarUrl !== undefined) {
      updates.push('avatar_url = ?');
      values.push(avatarUrl);
    }

    if (updates.length > 0) {
      values.push(playerId);
      run(`UPDATE players SET ${updates.join(', ')} WHERE id = ?`, values);
    }

    const updated = queryOne<{
      id: number;
      steamId: string;
      name: string;
      avatarUrl: string | null;
      createdAt: string;
    }>(`
      SELECT id, steam_id as steamId, name, avatar_url as avatarUrl, created_at as createdAt
      FROM players WHERE id = ?
    `, [playerId]);

    res.json(updated);
  } catch (error) {
    console.error('Error updating player:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * DELETE /api/admin/matches/:id
 * Delete a match and all related data
 */
router.delete('/matches/:id', async (req, res) => {
  try {
    const matchId = parseInt(req.params.id);

    const match = queryOne<{ id: number }>(`
      SELECT id FROM matches WHERE id = ?
    `, [matchId]);

    if (!match) {
      return res.status(404).json({ error: 'Match not found' });
    }

    // Delete in correct order due to foreign keys
    // 1. Delete round kills
    run(`DELETE FROM round_kills WHERE match_id = ?`, [matchId]);

    // 2. Delete rounds
    run(`DELETE FROM rounds WHERE match_id = ?`, [matchId]);

    // 3. Delete match players
    run(`DELETE FROM match_players WHERE match_id = ?`, [matchId]);

    // 4. Delete match
    run(`DELETE FROM matches WHERE id = ?`, [matchId]);

    res.json({ success: true, message: `Match ${matchId} deleted` });
  } catch (error) {
    console.error('Error deleting match:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * DELETE /api/admin/players/:id
 * Delete a player (only if they have no match history)
 */
router.delete('/players/:id', async (req, res) => {
  try {
    const playerId = parseInt(req.params.id);

    const player = queryOne<{ id: number }>(`
      SELECT id FROM players WHERE id = ?
    `, [playerId]);

    if (!player) {
      return res.status(404).json({ error: 'Player not found' });
    }

    // Check if player has match history
    const matchHistory = queryOne<{ count: number }>(`
      SELECT COUNT(*) as count FROM match_players WHERE player_id = ?
    `, [playerId]);

    if (matchHistory && matchHistory.count > 0) {
      return res.status(400).json({
        error: 'Cannot delete player with match history',
        matchCount: matchHistory.count,
      });
    }

    run(`DELETE FROM players WHERE id = ?`, [playerId]);

    res.json({ success: true, message: `Player ${playerId} deleted` });
  } catch (error) {
    console.error('Error deleting player:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
