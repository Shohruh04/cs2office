import { Router } from 'express';
import { query, queryOne } from '../db/index.js';

const router = Router();

/**
 * GET /api/leaderboard
 * Get overall leaderboard sorted by various metrics
 */
router.get('/leaderboard', async (req, res) => {
  try {
    const sortBy = (req.query.sort as string) || 'kills';

    let orderClause = 'totalKills DESC';
    if (sortBy === 'kd') {
      orderClause = 'CAST(totalKills AS REAL) / NULLIF(totalDeaths, 0) DESC';
    } else if (sortBy === 'headshots') {
      orderClause = 'totalHeadshots DESC';
    } else if (sortBy === 'mvps') {
      orderClause = 'totalMvps DESC';
    } else if (sortBy === 'score') {
      orderClause = 'totalScore DESC';
    }

    const leaderboard = query<{
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
    }>(`
      SELECT p.id as playerId, p.steam_id as steamId, p.name, p.avatar_url as avatarUrl,
             COALESCE(SUM(mp.kills), 0) as totalKills,
             COALESCE(SUM(mp.deaths), 0) as totalDeaths,
             COALESCE(SUM(mp.assists), 0) as totalAssists,
             COALESCE(SUM(mp.headshots), 0) as totalHeadshots,
             COALESCE(SUM(mp.mvps), 0) as totalMvps,
             COALESCE(SUM(mp.score), 0) as totalScore,
             COUNT(DISTINCT mp.match_id) as matchesPlayed
      FROM players p
      LEFT JOIN match_players mp ON p.id = mp.player_id
      WHERE p.steam_id NOT LIKE 'BOT%'
      GROUP BY p.id
      ORDER BY ${orderClause}
    `);

    // Calculate additional stats
    const leaderboardWithStats = leaderboard.map((player, index) => {
      const kdRatio = player.totalDeaths > 0 ?
        (player.totalKills / player.totalDeaths).toFixed(2) :
        player.totalKills.toFixed(2);

      const headshotPercentage = player.totalKills > 0 ?
        ((player.totalHeadshots / player.totalKills) * 100).toFixed(1) :
        '0.0';

      return {
        rank: index + 1,
        ...player,
        kdRatio: parseFloat(kdRatio),
        headshotPercentage: parseFloat(headshotPercentage),
      };
    });

    res.json(leaderboardWithStats);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/stats/summary
 * Get aggregate statistics for the dashboard
 */
router.get('/summary', async (req, res) => {
  try {
    // Total counts (excluding bots)
    const totalPlayers = queryOne<{ count: number }>(`
      SELECT COUNT(*) as count FROM players
      WHERE steam_id NOT LIKE 'BOT%'
    `);

    const totalMatches = queryOne<{ count: number }>(`
      SELECT COUNT(*) as count FROM matches
    `);

    const completedMatches = queryOne<{ count: number }>(`
      SELECT COUNT(*) as count FROM matches WHERE status = 'completed'
    `);

    // Total kills
    const totalKills = queryOne<{ sum: number }>(`
      SELECT COALESCE(SUM(kills), 0) as sum FROM match_players
    `);

    // Most popular map
    const mapStats = query<{ map: string; count: number }>(`
      SELECT map, COUNT(*) as count
      FROM matches
      GROUP BY map
      ORDER BY count DESC
      LIMIT 5
    `);

    // Top killer (excluding bots)
    const topKiller = queryOne<{
      playerId: number;
      name: string;
      kills: number;
    }>(`
      SELECT p.id as playerId, p.name, SUM(mp.kills) as kills
      FROM match_players mp
      INNER JOIN players p ON mp.player_id = p.id
      WHERE p.steam_id NOT LIKE 'BOT%'
      GROUP BY p.id
      ORDER BY kills DESC
      LIMIT 1
    `);

    // Recent matches
    const recentMatches = query<{
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
      LIMIT 5
    `);

    // Weapon stats
    const weaponStats = query<{
      weapon: string;
      kills: number;
      headshots: number;
    }>(`
      SELECT weapon, COUNT(*) as kills,
             SUM(CASE WHEN headshot = 1 THEN 1 ELSE 0 END) as headshots
      FROM round_kills
      GROUP BY weapon
      ORDER BY kills DESC
      LIMIT 10
    `);

    res.json({
      totals: {
        players: totalPlayers?.count ?? 0,
        matches: totalMatches?.count ?? 0,
        completedMatches: completedMatches?.count ?? 0,
        kills: totalKills?.sum ?? 0,
      },
      mapStats,
      topKiller,
      recentMatches,
      weaponStats,
    });
  } catch (error) {
    console.error('Error fetching stats summary:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
