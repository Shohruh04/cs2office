import { Router } from 'express';
import { gsiParser } from '../services/gsiParser.js';
import { matchManager } from '../services/matchManager.js';
import type { GSIPayload } from '../types/gsi.js';

const router = Router();

/**
 * POST /api/gsi
 * Receives Game State Integration events from CS2
 */
router.post('/', async (req, res) => {
  try {
    const payload: GSIPayload = req.body;

    // Log incoming GSI data for debugging
    if (payload.map) {
      const hasAllPlayers = payload.allplayers && Object.keys(payload.allplayers).length > 0;
      const hasPlayer = payload.player && payload.player.steamid;
      console.log(`[GSI] Map: ${payload.map.name}, Phase: ${payload.map.phase}, Round: ${payload.map.round}, AllPlayers: ${hasAllPlayers ? Object.keys(payload.allplayers!).length : 0}, SinglePlayer: ${hasPlayer ? payload.player!.name : 'none'}`);
    }

    // Parse the match state
    const matchState = gsiParser.parseMatchState(payload);

    if (!matchState) {
      return res.status(200).json({ status: 'no_match' });
    }

    // Check if new match started
    if (gsiParser.isNewMatch(payload)) {
      console.log('New match detected');
      gsiParser.reset();
      await matchManager.startMatch(matchState);
    }

    // Check if match ended
    if (gsiParser.isMatchEnd(payload)) {
      console.log('Match ended');
      await matchManager.endMatch();
      gsiParser.reset();
      return res.status(200).json({ status: 'match_ended' });
    }

    // Detect round end
    const roundEnd = gsiParser.detectRoundEnd(payload);
    if (roundEnd) {
      await matchManager.recordRound(roundEnd);
    }

    // Detect kills
    const kills = gsiParser.detectKills(payload);
    for (const kill of kills) {
      await matchManager.recordKill(kill);
    }

    // Update match state
    await matchManager.updateMatch(matchState);

    res.status(200).json({ status: 'ok' });
  } catch (error) {
    console.error('GSI processing error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
