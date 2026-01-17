import { useState, useEffect } from 'react';
import {
  Settings,
  Server,
  Database,
  Users,
  Gamepad2,
  Trash2,
  Edit,
  Save,
  X,
  RefreshCw,
} from 'lucide-react';
import { adminAPI, playersAPI, matchesAPI, type AdminStatus, type Player, type Match } from '../api';

export default function Admin() {
  const [status, setStatus] = useState<AdminStatus | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPlayer, setEditingPlayer] = useState<number | null>(null);
  const [editName, setEditName] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    try {
      const [statusData, playersData, matchesData] = await Promise.all([
        adminAPI.getStatus(),
        playersAPI.getAll(),
        matchesAPI.getAll(20),
      ]);
      setStatus(statusData);
      setPlayers(playersData);
      setMatches(matchesData);
    } catch (error) {
      console.error('Failed to fetch admin data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdatePlayer(id: number) {
    try {
      await adminAPI.updatePlayer(id, { name: editName });
      setEditingPlayer(null);
      fetchData();
    } catch (error) {
      console.error('Failed to update player:', error);
    }
  }

  async function handleDeleteMatch(id: number) {
    if (!confirm('Are you sure you want to delete this match?')) return;
    try {
      await adminAPI.deleteMatch(id);
      fetchData();
    } catch (error) {
      console.error('Failed to delete match:', error);
    }
  }

  const formatBytes = (bytes: number) => {
    const mb = bytes / 1024 / 1024;
    return `${mb.toFixed(1)} MB`;
  };

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent-orange"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Settings className="text-accent-orange" size={28} />
          <div>
            <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
            <p className="text-gray-400">Manage players and matches</p>
          </div>
        </div>
        <button
          onClick={fetchData}
          className="cs-button-secondary flex items-center gap-2"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {/* System Status */}
      <div className="grid md:grid-cols-4 gap-4">
        <div className="cs-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Server size={16} className="text-accent-green" />
            <span className="text-sm text-gray-400">Status</span>
          </div>
          <span className="text-lg font-semibold text-accent-green">
            {status?.status ?? 'Unknown'}
          </span>
        </div>
        <div className="cs-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <RefreshCw size={16} className="text-accent-orange" />
            <span className="text-sm text-gray-400">Uptime</span>
          </div>
          <span className="text-lg font-semibold text-white">
            {formatUptime(status?.uptime ?? 0)}
          </span>
        </div>
        <div className="cs-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Database size={16} className="text-ct" />
            <span className="text-sm text-gray-400">Memory</span>
          </div>
          <span className="text-lg font-semibold text-white">
            {formatBytes(status?.memory.heapUsed ?? 0)}
          </span>
        </div>
        <div className="cs-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Gamepad2 size={16} className="text-t" />
            <span className="text-sm text-gray-400">Current Match</span>
          </div>
          <span className="text-lg font-semibold text-white">
            {status?.currentMatch?.map ?? 'None'}
          </span>
        </div>
      </div>

      {/* Players Management */}
      <div className="cs-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Users size={20} className="text-accent-orange" />
          <h2 className="text-lg font-semibold text-white">
            Players ({players.length})
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="cs-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Steam ID</th>
                <th>Matches</th>
                <th>Kills</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {players.map((player) => (
                <tr key={player.id}>
                  <td className="text-gray-400">{player.id}</td>
                  <td>
                    {editingPlayer === player.id ? (
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="cs-input py-1"
                        autoFocus
                      />
                    ) : (
                      <span className="text-white">{player.name}</span>
                    )}
                  </td>
                  <td className="text-gray-400 text-sm font-mono">
                    {player.steamId}
                  </td>
                  <td>{player.stats.matchesPlayed}</td>
                  <td className="text-accent-green">{player.stats.kills}</td>
                  <td>
                    {editingPlayer === player.id ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleUpdatePlayer(player.id)}
                          className="text-accent-green hover:text-green-400"
                        >
                          <Save size={16} />
                        </button>
                        <button
                          onClick={() => setEditingPlayer(null)}
                          className="text-gray-400 hover:text-white"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setEditingPlayer(player.id);
                          setEditName(player.name);
                        }}
                        className="text-gray-400 hover:text-accent-orange"
                      >
                        <Edit size={16} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Matches Management */}
      <div className="cs-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Gamepad2 size={20} className="text-accent-orange" />
          <h2 className="text-lg font-semibold text-white">
            Recent Matches ({matches.length})
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="cs-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Map</th>
                <th>Score</th>
                <th>Players</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {matches.map((match) => (
                <tr key={match.id}>
                  <td className="text-gray-400">{match.id}</td>
                  <td className="text-white">{match.map}</td>
                  <td>
                    <span className="text-ct">{match.teamCtScore}</span>
                    <span className="text-gray-600"> - </span>
                    <span className="text-t">{match.teamTScore}</span>
                  </td>
                  <td>{match.playerCount}</td>
                  <td>
                    <span
                      className={`px-2 py-0.5 rounded text-xs ${
                        match.status === 'completed'
                          ? 'bg-accent-green/20 text-accent-green'
                          : match.status === 'ongoing'
                          ? 'bg-red-500/20 text-red-400'
                          : 'bg-gray-500/20 text-gray-400'
                      }`}
                    >
                      {match.status}
                    </span>
                  </td>
                  <td className="text-gray-400">
                    {new Date(match.startTime).toLocaleDateString()}
                  </td>
                  <td>
                    <button
                      onClick={() => handleDeleteMatch(match.id)}
                      className="text-gray-400 hover:text-red-400"
                      title="Delete match"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
