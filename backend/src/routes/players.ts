import { Router } from 'express';
import { query, queryOne } from '../db/index.js';

const router = Router();

interface PlayerRow {
  id: number;
  steam_id: string;
  name: string;
  avatar_url: string | null;
  created_at: number;
}

interface StatsRow {
  total_kills: number;
  total_deaths: number;
  total_assists: number;
  total_headshots: number;
  total_mvps: number;
  total_score: number;
  total_damage: number;
  matches_played: number;
}

router.get('/', async (req, res) => {
  try {
    // Filter out bots (steam_id starting with BOT)
    const allPlayers = query<PlayerRow>(`
      SELECT * FROM players
      WHERE steam_id NOT LIKE 'BOT%'
      ORDER BY created_at DESC
    `);

    const playersWithStats = allPlayers.map((player) => {
      const stats = queryOne<StatsRow>(`
        SELECT
          COALESCE(SUM(kills), 0) as total_kills,
          COALESCE(SUM(deaths), 0) as total_deaths,
          COALESCE(SUM(assists), 0) as total_assists,
          COALESCE(SUM(headshots), 0) as total_headshots,
          COALESCE(SUM(mvps), 0) as total_mvps,
          COUNT(DISTINCT match_id) as matches_played
        FROM match_players WHERE player_id = ?
      `, [player.id]);

      const kills = stats?.total_kills ?? 0;
      const deaths = stats?.total_deaths ?? 0;
      const headshots = stats?.total_headshots ?? 0;

      const kdRatio = deaths > 0 ? kills / deaths : kills;
      const headshotPercentage = kills > 0 ? (headshots / kills) * 100 : 0;

      return {
        id: player.id,
        steamId: player.steam_id,
        name: player.name,
        avatarUrl: player.avatar_url,
        createdAt: new Date(player.created_at).toISOString(),
        stats: {
          kills,
          deaths,
          assists: stats?.total_assists ?? 0,
          headshots,
          mvps: stats?.total_mvps ?? 0,
          matchesPlayed: stats?.matches_played ?? 0,
          kdRatio: parseFloat(kdRatio.toFixed(2)),
          headshotPercentage: parseFloat(headshotPercentage.toFixed(1)),
        },
      };
    });

    res.json(playersWithStats);
  } catch (error) {
    console.error('Error fetching players:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const playerId = parseInt(req.params.id);

    const player = queryOne<PlayerRow>('SELECT * FROM players WHERE id = ?', [playerId]);

    if (!player) {
      return res.status(404).json({ error: 'Player not found' });
    }

    const stats = queryOne<StatsRow>(`
      SELECT
        COALESCE(SUM(kills), 0) as total_kills,
        COALESCE(SUM(deaths), 0) as total_deaths,
        COALESCE(SUM(assists), 0) as total_assists,
        COALESCE(SUM(headshots), 0) as total_headshots,
        COALESCE(SUM(mvps), 0) as total_mvps,
        COALESCE(SUM(score), 0) as total_score,
        COALESCE(SUM(damage), 0) as total_damage,
        COUNT(DISTINCT match_id) as matches_played
      FROM match_players WHERE player_id = ?
    `, [playerId]);

    interface MatchHistoryRow {
      match_id: number;
      map: string;
      start_time: number;
      end_time: number | null;
      team_ct_score: number;
      team_t_score: number;
      status: string;
      team: string;
      kills: number;
      deaths: number;
      assists: number;
      score: number;
    }

    const matchHistory = query<MatchHistoryRow>(`
      SELECT
        m.id as match_id, m.map, m.start_time, m.end_time,
        m.team_ct_score, m.team_t_score, m.status,
        mp.team, mp.kills, mp.deaths, mp.assists, mp.score
      FROM match_players mp
      INNER JOIN matches m ON mp.match_id = m.id
      WHERE mp.player_id = ?
      ORDER BY m.start_time DESC
      LIMIT 20
    `, [playerId]);

    let wins = 0;
    let losses = 0;
    for (const match of matchHistory) {
      if (match.status !== 'completed') continue;
      const playerWon =
        (match.team === 'CT' && match.team_ct_score > match.team_t_score) ||
        (match.team === 'T' && match.team_t_score > match.team_ct_score);
      if (playerWon) wins++;
      else losses++;
    }

    const kills = stats?.total_kills ?? 0;
    const deaths = stats?.total_deaths ?? 0;
    const headshots = stats?.total_headshots ?? 0;

    const kdRatio = deaths > 0 ? kills / deaths : kills;
    const headshotPercentage = kills > 0 ? (headshots / kills) * 100 : 0;
    const winRate = (wins + losses) > 0 ? (wins / (wins + losses)) * 100 : 0;

    res.json({
      id: player.id,
      steamId: player.steam_id,
      name: player.name,
      avatarUrl: player.avatar_url,
      createdAt: new Date(player.created_at).toISOString(),
      stats: {
        kills,
        deaths,
        assists: stats?.total_assists ?? 0,
        headshots,
        mvps: stats?.total_mvps ?? 0,
        score: stats?.total_score ?? 0,
        damage: stats?.total_damage ?? 0,
        matchesPlayed: stats?.matches_played ?? 0,
        kdRatio: parseFloat(kdRatio.toFixed(2)),
        headshotPercentage: parseFloat(headshotPercentage.toFixed(1)),
        wins,
        losses,
        winRate: parseFloat(winRate.toFixed(1)),
      },
      matchHistory: matchHistory.map(m => ({
        matchId: m.match_id,
        map: m.map,
        startTime: new Date(m.start_time).toISOString(),
        endTime: m.end_time ? new Date(m.end_time).toISOString() : null,
        ctScore: m.team_ct_score,
        tScore: m.team_t_score,
        status: m.status,
        playerTeam: m.team,
        playerKills: m.kills,
        playerDeaths: m.deaths,
        playerAssists: m.assists,
        playerScore: m.score,
      })),
    });
  } catch (error) {
    console.error('Error fetching player:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
