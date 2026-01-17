import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Radio,
  Shield,
  Crosshair,
  Heart,
  DollarSign,
  Target,
  Skull,
  Award,
  Bomb,
} from 'lucide-react';
import { useLiveMatch } from '../hooks/useLiveMatch';
import { useSocket } from '../hooks/useSocket';
import type { LivePlayer } from '../api';

interface KillEvent {
  matchId: number;
  event: {
    killerSteamId: string | null;
    victimSteamId: string;
    weapon: string;
    headshot: boolean;
    killerPlayerId: number | null;
    victimPlayerId: number;
  };
}

export default function LiveMatch() {
  const { isLive, state, isLoading } = useLiveMatch();
  const [killFeed, setKillFeed] = useState<KillEvent['event'][]>([]);

  // Listen for kill events
  useSocket<KillEvent>('kill', (data) => {
    setKillFeed((prev) => [data.event, ...prev].slice(0, 10));
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent-orange"></div>
      </div>
    );
  }

  if (!isLive || !state) {
    return (
      <div className="text-center py-16">
        <div className="cs-card inline-block p-8">
          <Radio size={48} className="mx-auto text-gray-600 mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">
            No Live Match
          </h2>
          <p className="text-gray-400 mb-4">
            Start a CS2 match to see live stats here.
          </p>
          <Link to="/" className="cs-button-secondary">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const ctPlayers = state.players.filter((p) => p.team === 'CT');
  const tPlayers = state.players.filter((p) => p.team === 'T');

  return (
    <div className="space-y-6 animate-in">
      {/* Match Header */}
      <div className="cs-card p-6 border-red-500/30">
        <div className="flex items-center justify-between">
          {/* Live Badge */}
          <div className="flex items-center gap-4">
            <div className="live-indicator">
              <span>LIVE</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{state.map}</h1>
              <p className="text-gray-400">
                Round {state.round} • {state.roundPhase}
              </p>
            </div>
          </div>

          {/* Score */}
          <div className="flex items-center gap-8">
            <div className="text-center">
              <div className="flex items-center gap-2 mb-1">
                <Shield size={20} className="text-ct" />
                <span className="text-sm text-ct font-medium">
                  Counter-Terrorists
                </span>
              </div>
              <span className="text-5xl font-bold text-ct glow-ct">
                {state.ctScore}
              </span>
            </div>

            <div className="text-4xl text-gray-600 font-light">:</div>

            <div className="text-center">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm text-t font-medium">Terrorists</span>
                <Crosshair size={20} className="text-t" />
              </div>
              <span className="text-5xl font-bold text-t glow-t">
                {state.tScore}
              </span>
            </div>
          </div>

          {/* Bomb Status */}
          <div className="text-right">
            {state.bombState === 'planted' && (
              <div className="inline-flex items-center gap-2 px-3 py-2 rounded bg-red-500/20 border border-red-500/50 animate-pulse">
                <Bomb className="text-red-500" />
                <span className="text-red-400 font-bold">BOMB PLANTED</span>
              </div>
            )}
            {state.bombState === 'defused' && (
              <div className="inline-flex items-center gap-2 px-3 py-2 rounded bg-ct/20 border border-ct/50">
                <Shield className="text-ct" />
                <span className="text-ct font-bold">DEFUSED</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* CT Team */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Shield className="text-ct" />
            <h2 className="text-lg font-semibold text-ct">
              Counter-Terrorists
            </h2>
          </div>
          <div className="space-y-2">
            {ctPlayers.map((player) => (
              <PlayerRow key={player.steamId} player={player} />
            ))}
          </div>
        </div>

        {/* Kill Feed */}
        <div>
          <h2 className="text-lg font-semibold text-white mb-4">Kill Feed</h2>
          <div className="cs-card p-4 min-h-[300px]">
            {killFeed.length > 0 ? (
              <div className="space-y-2">
                {killFeed.map((kill, index) => (
                  <div
                    key={index}
                    className="kill-feed-item text-sm"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <span className="text-white font-medium">
                      {kill.killerSteamId ? 'Player' : '?'}
                    </span>
                    <span className="text-gray-400">
                      [{kill.weapon}]
                      {kill.headshot && (
                        <Target size={12} className="inline ml-1 text-accent-gold" />
                      )}
                    </span>
                    <span className="text-red-400">Player</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">
                No kills this round yet...
              </p>
            )}
          </div>
        </div>

        {/* T Team */}
        <div>
          <div className="flex items-center gap-2 mb-4 justify-end">
            <h2 className="text-lg font-semibold text-t">Terrorists</h2>
            <Crosshair className="text-t" />
          </div>
          <div className="space-y-2">
            {tPlayers.map((player) => (
              <PlayerRow key={player.steamId} player={player} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function PlayerRow({ player }: { player: LivePlayer }) {
  const isAlive = player.health > 0;
  const healthColor =
    player.health > 50
      ? 'bg-accent-green'
      : player.health > 25
      ? 'bg-yellow-500'
      : 'bg-red-500';

  return (
    <div
      className={`cs-card p-3 ${
        !isAlive ? 'opacity-50' : ''
      } ${
        player.team === 'CT' ? 'border-l-2 border-l-ct' : 'border-l-2 border-l-t'
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="font-medium text-white">{player.name}</span>
        {player.hasDefuseKit && (
          <Shield size={14} className="text-ct" aria-label="Defuse Kit" />
        )}
      </div>

      {/* Health & Armor */}
      <div className="flex items-center gap-4 mb-2">
        <div className="flex items-center gap-2 flex-1">
          <Heart size={14} className={isAlive ? 'text-red-400' : 'text-gray-600'} />
          <div className="flex-1 h-2 bg-cs-border rounded-full overflow-hidden">
            <div
              className={`h-full ${healthColor} transition-all duration-300`}
              style={{ width: `${player.health}%` }}
            />
          </div>
          <span className="text-xs text-gray-400 w-8">{player.health}</span>
        </div>
        <div className="flex items-center gap-1">
          <Shield size={14} className="text-ct" />
          <span className="text-xs text-gray-400">{player.armor}</span>
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-accent-green">
            <Target size={12} />
            {player.kills}
          </span>
          <span className="flex items-center gap-1 text-red-400">
            <Skull size={12} />
            {player.deaths}
          </span>
          <span className="text-gray-400">A: {player.assists}</span>
        </div>
        <div className="flex items-center gap-3">
          {player.mvps > 0 && (
            <span className="flex items-center gap-1 text-yellow-400">
              <Award size={12} />
              {player.mvps}
            </span>
          )}
          <span className="flex items-center gap-1 text-accent-gold">
            <DollarSign size={12} />
            ${player.money}
          </span>
        </div>
      </div>
    </div>
  );
}
