import { Link } from 'react-router-dom';
import { Target, Skull, Award, Crosshair } from 'lucide-react';

interface PlayerCardProps {
  rank?: number;
  playerId: number;
  name: string;
  avatarUrl?: string | null;
  kills: number;
  deaths: number;
  kdRatio: number;
  headshotPercentage: number;
  mvps?: number;
  matchesPlayed?: number;
  showRank?: boolean;
}

export default function PlayerCard({
  rank,
  playerId,
  name,
  kills,
  deaths,
  kdRatio,
  headshotPercentage,
  mvps,
  matchesPlayed,
  showRank = true,
}: PlayerCardProps) {
  const getRankStyle = (rank: number) => {
    if (rank === 1) return 'rank-1';
    if (rank === 2) return 'rank-2';
    if (rank === 3) return 'rank-3';
    return 'bg-cs-border text-gray-300';
  };

  return (
    <Link to={`/players/${playerId}`}>
      <div className="cs-card-hover p-4 flex items-center gap-4">
        {/* Rank Badge */}
        {showRank && rank && (
          <div
            className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg ${getRankStyle(
              rank
            )}`}
          >
            {rank}
          </div>
        )}

        {/* Avatar */}
        <div className="w-12 h-12 rounded-lg bg-cs-border flex items-center justify-center overflow-hidden">
          <span className="text-xl font-bold text-gray-400">
            {name.charAt(0).toUpperCase()}
          </span>
        </div>

        {/* Player Info */}
        <div className="flex-1">
          <h3 className="font-semibold text-white">{name}</h3>
          {matchesPlayed !== undefined && (
            <p className="text-sm text-gray-400">{matchesPlayed} matches</p>
          )}
        </div>

        {/* Stats */}
        <div className="flex items-center gap-6 text-sm">
          <div className="text-center">
            <div className="flex items-center gap-1 text-accent-green">
              <Target size={14} />
              <span className="font-bold">{kills}</span>
            </div>
            <span className="text-xs text-gray-500">Kills</span>
          </div>

          <div className="text-center">
            <div className="flex items-center gap-1 text-red-400">
              <Skull size={14} />
              <span className="font-bold">{deaths}</span>
            </div>
            <span className="text-xs text-gray-500">Deaths</span>
          </div>

          <div className="text-center">
            <div className={`font-bold ${kdRatio >= 1 ? 'text-accent-green' : 'text-red-400'}`}>
              {kdRatio.toFixed(2)}
            </div>
            <span className="text-xs text-gray-500">K/D</span>
          </div>

          <div className="text-center">
            <div className="flex items-center gap-1 text-accent-gold">
              <Crosshair size={14} />
              <span className="font-bold">{headshotPercentage}%</span>
            </div>
            <span className="text-xs text-gray-500">HS%</span>
          </div>

          {mvps !== undefined && (
            <div className="text-center">
              <div className="flex items-center gap-1 text-yellow-400">
                <Award size={14} />
                <span className="font-bold">{mvps}</span>
              </div>
              <span className="text-xs text-gray-500">MVPs</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
