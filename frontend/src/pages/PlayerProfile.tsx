import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Target,
  Skull,
  Crosshair,
  Award,
  Trophy,
  TrendingUp,
  Gamepad2,
  Clock,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { playersAPI, type PlayerDetail } from '../api';
import StatCard from '../components/StatCard';

export default function PlayerProfile() {
  const { id } = useParams<{ id: string }>();
  const [player, setPlayer] = useState<PlayerDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPlayer() {
      if (!id) return;
      try {
        const data = await playersAPI.getById(parseInt(id));
        setPlayer(data);
      } catch (error) {
        console.error('Failed to fetch player:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchPlayer();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent-orange"></div>
      </div>
    );
  }

  if (!player) {
    return (
      <div className="text-center py-16">
        <div className="cs-card inline-block p-8">
          <h2 className="text-xl font-semibold text-white mb-4">
            Player Not Found
          </h2>
          <Link to="/players" className="cs-button-secondary">
            Back to Players
          </Link>
        </div>
      </div>
    );
  }

  // Prepare chart data
  const performanceData = player.matchHistory.slice(0, 10).reverse().map((match, i) => ({
    game: `Game ${i + 1}`,
    kills: match.playerKills,
    deaths: match.playerDeaths,
    kd: match.playerDeaths > 0 ? match.playerKills / match.playerDeaths : match.playerKills,
  }));

  const winLossData = [
    { name: 'Wins', value: player.stats.wins, color: '#4caf50' },
    { name: 'Losses', value: player.stats.losses, color: '#f44336' },
  ];

  return (
    <div className="space-y-6 animate-in">
      {/* Back Button */}
      <Link
        to="/players"
        className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
      >
        <ArrowLeft size={18} />
        Back to Players
      </Link>

      {/* Player Header */}
      <div className="cs-card p-6">
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 rounded-xl bg-gradient-to-br from-accent-orange to-accent-gold flex items-center justify-center">
            <span className="text-4xl font-bold text-black">
              {player.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-white mb-2">{player.name}</h1>
            <div className="flex items-center gap-6 text-sm text-gray-400">
              <span className="flex items-center gap-1">
                <Gamepad2 size={16} />
                {player.stats.matchesPlayed} matches
              </span>
              <span className="flex items-center gap-1">
                <Trophy size={16} />
                {player.stats.wins} wins
              </span>
              <span className="flex items-center gap-1">
                <Clock size={16} />
                Joined {new Date(player.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold gradient-text">
              {player.stats.winRate}%
            </div>
            <span className="text-sm text-gray-400">Win Rate</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <StatCard label="Kills" value={player.stats.kills} icon={Target} highlight />
        <StatCard label="Deaths" value={player.stats.deaths} icon={Skull} />
        <StatCard label="K/D Ratio" value={player.stats.kdRatio.toFixed(2)} icon={TrendingUp} />
        <StatCard label="Headshots" value={player.stats.headshots} icon={Crosshair} />
        <StatCard label="HS %" value={`${player.stats.headshotPercentage}%`} />
        <StatCard label="MVPs" value={player.stats.mvps} icon={Award} />
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Performance Chart */}
        <div className="cs-card p-6">
          <h2 className="text-lg font-semibold text-white mb-4">
            Recent Performance
          </h2>
          {performanceData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={performanceData}>
                <defs>
                  <linearGradient id="colorKills" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4caf50" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#4caf50" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorDeaths" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f44336" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f44336" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e2029" />
                <XAxis dataKey="game" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#12131a',
                    border: '1px solid #1e2029',
                    borderRadius: '8px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="kills"
                  stroke="#4caf50"
                  fillOpacity={1}
                  fill="url(#colorKills)"
                />
                <Area
                  type="monotone"
                  dataKey="deaths"
                  stroke="#f44336"
                  fillOpacity={1}
                  fill="url(#colorDeaths)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400 text-center py-8">
              No match data available
            </p>
          )}
        </div>

        {/* Win/Loss Pie Chart */}
        <div className="cs-card p-6">
          <h2 className="text-lg font-semibold text-white mb-4">
            Win/Loss Ratio
          </h2>
          {player.stats.wins + player.stats.losses > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={winLossData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {winLossData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#12131a',
                    border: '1px solid #1e2029',
                    borderRadius: '8px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400 text-center py-8">
              No completed matches yet
            </p>
          )}
          <div className="flex justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-accent-green" />
              <span className="text-sm text-gray-400">
                Wins ({player.stats.wins})
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span className="text-sm text-gray-400">
                Losses ({player.stats.losses})
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Match History */}
      <div className="cs-card p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Match History</h2>
        <div className="overflow-x-auto">
          <table className="cs-table">
            <thead>
              <tr>
                <th>Map</th>
                <th>Team</th>
                <th>Result</th>
                <th>K/D/A</th>
                <th>Score</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {player.matchHistory.map((match) => {
                const playerWon =
                  (match.playerTeam === 'CT' && match.ctScore > match.tScore) ||
                  (match.playerTeam === 'T' && match.tScore > match.ctScore);
                const isDraw = match.ctScore === match.tScore;

                return (
                  <tr key={match.matchId}>
                    <td>
                      <Link
                        to={`/matches/${match.matchId}`}
                        className="text-accent-orange hover:text-accent-gold"
                      >
                        {match.map}
                      </Link>
                    </td>
                    <td>
                      <span
                        className={
                          match.playerTeam === 'CT' ? 'text-ct' : 'text-t'
                        }
                      >
                        {match.playerTeam}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`font-medium ${
                          isDraw
                            ? 'text-gray-400'
                            : playerWon
                            ? 'text-accent-green'
                            : 'text-red-400'
                        }`}
                      >
                        {match.ctScore} - {match.tScore}
                      </span>
                    </td>
                    <td>
                      {match.playerKills}/{match.playerDeaths}/
                      {match.playerAssists}
                    </td>
                    <td>{match.playerScore}</td>
                    <td className="text-gray-400">
                      {new Date(match.startTime).toLocaleDateString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
