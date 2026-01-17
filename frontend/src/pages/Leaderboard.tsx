import { useState, useEffect } from 'react';
import { Trophy, Target, Skull, Crosshair, Award, Filter } from 'lucide-react';
import { statsAPI, type LeaderboardEntry } from '../api';
import PlayerCard from '../components/PlayerCard';

type SortOption = 'kills' | 'kd' | 'headshots' | 'mvps' | 'score';

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortOption>('kills');

  useEffect(() => {
    async function fetchLeaderboard() {
      setLoading(true);
      try {
        const data = await statsAPI.getLeaderboard(sortBy);
        setLeaderboard(data);
      } catch (error) {
        console.error('Failed to fetch leaderboard:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchLeaderboard();
  }, [sortBy]);

  const sortOptions: { value: SortOption; label: string; icon: React.ReactNode }[] = [
    { value: 'kills', label: 'Kills', icon: <Target size={14} /> },
    { value: 'kd', label: 'K/D Ratio', icon: <Skull size={14} /> },
    { value: 'headshots', label: 'Headshots', icon: <Crosshair size={14} /> },
    { value: 'mvps', label: 'MVPs', icon: <Award size={14} /> },
    { value: 'score', label: 'Score', icon: <Trophy size={14} /> },
  ];

  return (
    <div className="space-y-6 animate-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Trophy className="text-accent-gold" size={28} />
          <div>
            <h1 className="text-2xl font-bold text-white">Leaderboard</h1>
            <p className="text-gray-400">Top players ranked by performance</p>
          </div>
        </div>

        {/* Sort Options */}
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-gray-400" />
          <span className="text-sm text-gray-400">Sort by:</span>
          <div className="flex gap-1">
            {sortOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setSortBy(option.value)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded text-sm transition-all ${
                  sortBy === option.value
                    ? 'bg-accent-orange text-black font-medium'
                    : 'bg-cs-card text-gray-400 hover:text-white hover:bg-cs-hover'
                }`}
              >
                {option.icon}
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Leaderboard List */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent-orange"></div>
        </div>
      ) : leaderboard.length > 0 ? (
        <div className="space-y-2">
          {leaderboard.map((player) => (
            <PlayerCard
              key={player.playerId}
              rank={player.rank}
              playerId={player.playerId}
              name={player.name}
              kills={player.totalKills}
              deaths={player.totalDeaths}
              kdRatio={player.kdRatio}
              headshotPercentage={player.headshotPercentage}
              mvps={player.totalMvps}
              matchesPlayed={player.matchesPlayed}
            />
          ))}
        </div>
      ) : (
        <div className="cs-card p-12 text-center">
          <Trophy size={48} className="mx-auto text-gray-600 mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">
            No Players Yet
          </h2>
          <p className="text-gray-400">
            Play some matches to see players on the leaderboard!
          </p>
        </div>
      )}
    </div>
  );
}
