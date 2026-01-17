import { useState, useEffect, useCallback } from 'react';
import { useSocket } from './useSocket';
import { useInterval } from './useInterval';
import { liveAPI, type LiveState, type ParsedMatchState } from '../api';

interface MatchUpdate {
  matchId: number;
  state: ParsedMatchState;
}

export function useLiveMatch() {
  const [liveState, setLiveState] = useState<LiveState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // WebSocket updates (primary)
  useSocket<MatchUpdate>('match:update', (data) => {
    setLiveState({
      isLive: true,
      matchId: data.matchId,
      state: data.state,
    });
  });

  useSocket<{ matchId: number }>('match:start', (data) => {
    console.log('Match started:', data.matchId);
  });

  useSocket<{ matchId: number }>('match:end', () => {
    setLiveState({
      isLive: false,
      matchId: null,
      state: null,
    });
  });

  // Polling fallback (every 2 seconds)
  const fetchLive = useCallback(async () => {
    try {
      const data = await liveAPI.getState();
      setLiveState(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch live state');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchLive();
  }, [fetchLive]);

  // Poll every 2 seconds
  useInterval(fetchLive, 2000);

  return {
    liveState,
    isLoading,
    error,
    isLive: liveState?.isLive ?? false,
    matchId: liveState?.matchId ?? null,
    state: liveState?.state ?? null,
  };
}
