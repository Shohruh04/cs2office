import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Gamepad2,
  Target,
  Trophy,
  MapPin,
  Clock,
  ChevronRight,
} from 'lucide-react';
import { statsAPI, type StatsSummary, type LeaderboardEntry } from '../api';
import StatCard from '../components/StatCard';
import PlayerCard from '../components/PlayerCard';
import { useLiveMatch } from '../hooks/useLiveMatch';

export default function Dashboard() {
  const [stats, setStats] = useState<StatsSummary | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const { isLive, state: liveState } = useLiveMatch();

  useEffect(() => {
    async function fetchData() {
      try {
        const [summaryData, leaderboardData] = await Promise.all([
          statsAPI.getSummary(),
          statsAPI.getLeaderboard('kills'),
        ]);
        setStats(summaryData);
        setLeaderboard(leaderboardData.slice(0, 5));
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cs2-orange"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in">
      {/* Live Match Banner */}
      {isLive && liveState && (
        <Link to="/live">
          <div className="cs-card p-6 border-red-500/30 bg-gradient-to-r from-red-500/10 to-transparent cursor-pointer hover:border-red-500/50 transition-all">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="live-indicator">
                  <span>LIVE</span>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">
                    {liveState.map}
                  </h2>
                  <p className="text-cs2-gray">Round {liveState.round}</p>
                </div>
              </div>
              <div className="flex items-center gap-8">
                <div className="text-center">
                  <span className="text-3xl font-bold text-ct">
                    {liveState.ctScore}
                  </span>
                  <p className="text-xs text-cs2-gray">CT</p>
                </div>
                <span className="text-2xl text-gray-600">:</span>
                <div className="text-center">
                  <span className="text-3xl font-bold text-t">
                    {liveState.tScore}
                  </span>
                  <p className="text-xs text-cs2-gray">T</p>
                </div>
              </div>
              <ChevronRight className="text-cs2-gray" />
            </div>
          </div>
        </Link>
      )}

      {/* Stats Overview */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Overview</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            label="Total Players"
            value={stats?.totals.players ?? 0}
            icon={Users}
          />
          <StatCard
            label="Matches Played"
            value={stats?.totals.completedMatches ?? 0}
            icon={Gamepad2}
          />
          <StatCard
            label="Total Kills"
            value={stats?.totals.kills?.toLocaleString() ?? 0}
            icon={Target}
            highlight
          />
          <StatCard
            label="Top Killer"
            value={stats?.topKiller?.name ?? '-'}
            icon={Trophy}
          />
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Leaderboard */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Top Players</h2>
            <Link
              to="/leaderboard"
              className="text-sm text-cs2-orange hover:text-cs2-orange-light transition-colors"
            >
              View all
            </Link>
          </div>
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
                matchesPlayed={player.matchesPlayed}
              />
            ))}
            {leaderboard.length === 0 && (
              <div className="cs-card p-8 text-center text-cs2-gray">
                No players yet. Play a match to get started!
              </div>
            )}
          </div>
        </div>

        {/* Recent Matches & Map Stats */}
        <div className="space-y-6">
          {/* Recent Matches */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">
                Recent Matches
              </h2>
              <Link
                to="/matches"
                className="text-sm text-cs2-orange hover:text-cs2-orange-light transition-colors"
              >
                View all
              </Link>
            </div>
            <div className="space-y-2">
              {stats?.recentMatches.map((match) => (
                <Link key={match.id} to={`/matches/${match.id}`}>
                  <div className="cs-card-hover p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <MapPin size={16} className="text-cs2-orange" />
                        <span className="font-medium text-white">
                          {match.map}
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-ct font-bold">
                          {match.teamCtScore}
                        </span>
                        <span className="text-gray-600">-</span>
                        <span className="text-t font-bold">
                          {match.teamTScore}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-cs2-gray">
                        <Clock size={14} />
                        {new Date(match.startTime).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
              {(!stats?.recentMatches || stats.recentMatches.length === 0) && (
                <div className="cs-card p-8 text-center text-cs2-gray">
                  No matches played yet.
                </div>
              )}
            </div>
          </div>

          {/* Map Stats */}
          <div>
            <h2 className="text-lg font-semibold text-white mb-4">
              Popular Maps
            </h2>
            <div className="cs-card p-4">
              {stats?.mapStats && stats.mapStats.length > 0 ? (
                <div className="space-y-3">
                  {stats.mapStats.map((map, index) => (
                    <div key={map.map} className="flex items-center gap-3">
                      <span className="text-sm text-cs2-gray w-4">
                        {index + 1}
                      </span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-white font-medium">
                            {map.map}
                          </span>
                          <span className="text-sm text-cs2-gray">
                            {map.count} games
                          </span>
                        </div>
                        <div className="h-1 bg-cs-border rounded-full overflow-hidden">
                          <div
                            className="h-full bg-cs2-orange rounded-full"
                            style={{
                              width: `${
                                (map.count / (stats.mapStats[0]?.count || 1)) *
                                100
                              }%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-cs2-gray py-4">
                  No map data yet.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
