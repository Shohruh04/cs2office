import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Shield,
  Crosshair,
  Award,
  Clock,
  MapPin,
} from 'lucide-react';
import { matchesAPI, type MatchDetail as MatchDetailType, type Round } from '../api';

export default function MatchDetail() {
  const { id } = useParams<{ id: string }>();
  const [match, setMatch] = useState<MatchDetailType | null>(null);
  const [rounds, setRounds] = useState<Round[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMatch() {
      if (!id) return;
      try {
        const [matchData, roundsData] = await Promise.all([
          matchesAPI.getById(parseInt(id)),
          matchesAPI.getRounds(parseInt(id)),
        ]);
        setMatch(matchData);
        setRounds(roundsData);
      } catch (error) {
        console.error('Failed to fetch match:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchMatch();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cs2-orange"></div>
      </div>
    );
  }

  if (!match) {
    return (
      <div className="text-center py-16">
        <div className="cs-card inline-block p-8">
          <h2 className="text-xl font-semibold text-white mb-4">
            Match Not Found
          </h2>
          <Link to="/matches" className="cs-button-secondary">
            Back to Matches
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in">
      {/* Back Button */}
      <Link
        to="/matches"
        className="inline-flex items-center gap-2 text-cs2-gray hover:text-white transition-colors"
      >
        <ArrowLeft size={18} />
        Back to Matches
      </Link>

      {/* Match Header */}
      <div className="cs-card p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <MapPin size={24} className="text-cs2-orange" />
            <div>
              <h1 className="text-2xl font-bold text-white">{match.map}</h1>
              <div className="flex items-center gap-4 text-sm text-cs2-gray">
                <span className="flex items-center gap-1">
                  <Clock size={14} />
                  {new Date(match.startTime).toLocaleString()}
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-xs font-medium ${
                    match.status === 'completed'
                      ? 'bg-accent-green/20 text-accent-green'
                      : 'bg-red-500/20 text-red-400'
                  }`}
                >
                  {match.status.toUpperCase()}
                </span>
              </div>
            </div>
          </div>

          {/* Final Score */}
          <div className="flex items-center gap-8">
            <div className="text-center">
              <div className="flex items-center gap-2 mb-1">
                <Shield size={20} className="text-ct" />
                <span className="text-sm text-ct font-medium">CT</span>
              </div>
              <span className="text-4xl font-bold text-ct">
                {match.teamCtScore}
              </span>
            </div>
            <span className="text-3xl text-gray-600">:</span>
            <div className="text-center">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm text-t font-medium">T</span>
                <Crosshair size={20} className="text-t" />
              </div>
              <span className="text-4xl font-bold text-t">
                {match.teamTScore}
              </span>
            </div>
          </div>
        </div>

        {/* Round Timeline */}
        <div>
          <h3 className="text-sm font-medium text-cs2-gray mb-3">
            Round History
          </h3>
          <div className="flex gap-1 flex-wrap">
            {rounds.map((round) => (
              <div
                key={round.id}
                className={`w-6 h-6 rounded flex items-center justify-center text-xs font-medium ${
                  round.winnerTeam === 'CT'
                    ? 'bg-ct/20 text-ct border border-ct/30'
                    : round.winnerTeam === 'T'
                    ? 'bg-t/20 text-t border border-t/30'
                    : 'bg-gray-700 text-cs2-gray'
                }`}
                title={`Round ${round.roundNumber}: ${round.winnerTeam || '?'} - ${round.winReason || ''}`}
              >
                {round.roundNumber}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Teams */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* CT Team */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Shield className="text-ct" />
            <h2 className="text-lg font-semibold text-ct">Counter-Terrorists</h2>
            <span className="text-cs2-gray text-sm">
              ({match.teams.ct.players.length} players)
            </span>
          </div>
          <div className="cs-card overflow-hidden">
            <table className="cs-table">
              <thead>
                <tr>
                  <th>Player</th>
                  <th className="text-center">K</th>
                  <th className="text-center">D</th>
                  <th className="text-center">A</th>
                  <th className="text-center">HS</th>
                  <th className="text-center">MVP</th>
                  <th className="text-center">Score</th>
                </tr>
              </thead>
              <tbody>
                {match.teams.ct.players.map((player) => (
                  <tr key={player.playerId}>
                    <td>
                      <Link
                        to={`/players/${player.playerId}`}
                        className="text-white hover:text-cs2-orange-light transition-colors"
                      >
                        {player.name}
                      </Link>
                    </td>
                    <td className="text-center text-accent-green font-medium">
                      {player.kills}
                    </td>
                    <td className="text-center text-red-400 font-medium">
                      {player.deaths}
                    </td>
                    <td className="text-center text-cs2-gray">
                      {player.assists}
                    </td>
                    <td className="text-center text-cs2-orange-light">
                      {player.headshots}
                    </td>
                    <td className="text-center text-yellow-400">
                      {player.mvps > 0 && (
                        <span className="flex items-center justify-center gap-1">
                          <Award size={12} />
                          {player.mvps}
                        </span>
                      )}
                    </td>
                    <td className="text-center font-bold">{player.score}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* T Team */}
        <div>
          <div className="flex items-center gap-2 mb-4 justify-end">
            <span className="text-cs2-gray text-sm">
              ({match.teams.t.players.length} players)
            </span>
            <h2 className="text-lg font-semibold text-t">Terrorists</h2>
            <Crosshair className="text-t" />
          </div>
          <div className="cs-card overflow-hidden">
            <table className="cs-table">
              <thead>
                <tr>
                  <th>Player</th>
                  <th className="text-center">K</th>
                  <th className="text-center">D</th>
                  <th className="text-center">A</th>
                  <th className="text-center">HS</th>
                  <th className="text-center">MVP</th>
                  <th className="text-center">Score</th>
                </tr>
              </thead>
              <tbody>
                {match.teams.t.players.map((player) => (
                  <tr key={player.playerId}>
                    <td>
                      <Link
                        to={`/players/${player.playerId}`}
                        className="text-white hover:text-cs2-orange-light transition-colors"
                      >
                        {player.name}
                      </Link>
                    </td>
                    <td className="text-center text-accent-green font-medium">
                      {player.kills}
                    </td>
                    <td className="text-center text-red-400 font-medium">
                      {player.deaths}
                    </td>
                    <td className="text-center text-cs2-gray">
                      {player.assists}
                    </td>
                    <td className="text-center text-cs2-orange-light">
                      {player.headshots}
                    </td>
                    <td className="text-center text-yellow-400">
                      {player.mvps > 0 && (
                        <span className="flex items-center justify-center gap-1">
                          <Award size={12} />
                          {player.mvps}
                        </span>
                      )}
                    </td>
                    <td className="text-center font-bold">{player.score}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
