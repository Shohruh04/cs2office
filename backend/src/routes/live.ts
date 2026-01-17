import { Router } from 'express';
import { matchManager } from '../services/matchManager.js';

const router = Router();

/**
 * GET /api/live
 * Get current live match state (for polling)
 */
router.get('/', async (req, res) => {
  try {
    const liveState = matchManager.getLiveState();
    const currentMatchId = matchManager.getCurrentMatchId();

    if (!liveState || !currentMatchId) {
      return res.json({
        isLive: false,
        matchId: null,
        state: null,
      });
    }

    res.json({
      isLive: true,
      matchId: currentMatchId,
      state: liveState,
    });
  } catch (error) {
    console.error('Error fetching live state:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
