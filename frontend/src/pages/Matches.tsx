import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { History, MapPin, Users, Clock, ChevronRight } from 'lucide-react';
import { matchesAPI, type Match } from '../api';

export default function Matches() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMatches() {
      try {
        const data = await matchesAPI.getAll(50);
        setMatches(data);
      } catch (error) {
        console.error('Failed to fetch matches:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchMatches();
  }, []);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6 animate-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <History className="text-accent-orange" size={28} />
        <div>
          <h1 className="text-2xl font-bold text-white">Match History</h1>
          <p className="text-gray-400">{matches.length} matches played</p>
        </div>
      </div>

      {/* Matches List */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent-orange"></div>
        </div>
      ) : matches.length > 0 ? (
        <div className="space-y-2">
          {matches.map((match) => (
            <Link key={match.id} to={`/matches/${match.id}`}>
              <div className="cs-card-hover p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {/* Map */}
                    <div className="flex items-center gap-2">
                      <MapPin size={18} className="text-accent-orange" />
                      <span className="font-medium text-white text-lg">
                        {match.map}
                      </span>
                    </div>

                    {/* Status */}
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-medium ${
                        match.status === 'ongoing'
                          ? 'bg-red-500/20 text-red-400'
                          : match.status === 'completed'
                          ? 'bg-accent-green/20 text-accent-green'
                          : 'bg-gray-500/20 text-gray-400'
                      }`}
                    >
                      {match.status.toUpperCase()}
                    </span>
                  </div>

                  {/* Score */}
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl font-bold text-ct">
                        {match.teamCtScore}
                      </span>
                      <span className="text-gray-600">-</span>
                      <span className="text-2xl font-bold text-t">
                        {match.teamTScore}
                      </span>
                    </div>
                  </div>

                  {/* Meta */}
                  <div className="flex items-center gap-6 text-sm text-gray-400">
                    <span className="flex items-center gap-1">
                      <Users size={14} />
                      {match.playerCount} players
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={14} />
                      {formatDate(match.startTime)}
                    </span>
                    <ChevronRight className="text-gray-600" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="cs-card p-12 text-center">
          <History size={48} className="mx-auto text-gray-600 mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">
            No Matches Yet
          </h2>
          <p className="text-gray-400">
            Start playing CS2 to see your match history here!
          </p>
        </div>
      )}
    </div>
  );
}
