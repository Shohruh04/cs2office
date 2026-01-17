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
  Download,
  FileText,
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
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cs2-orange"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Settings className="text-cs2-orange" size={28} />
          <div>
            <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
            <p className="text-cs2-gray">Manage players and matches</p>
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
            <span className="text-sm text-cs2-gray">Status</span>
          </div>
          <span className="text-lg font-semibold text-accent-green">
            {status?.status ?? 'Unknown'}
          </span>
        </div>
        <div className="cs-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <RefreshCw size={16} className="text-cs2-orange" />
            <span className="text-sm text-cs2-gray">Uptime</span>
          </div>
          <span className="text-lg font-semibold text-white">
            {formatUptime(status?.uptime ?? 0)}
          </span>
        </div>
        <div className="cs-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Database size={16} className="text-ct" />
            <span className="text-sm text-cs2-gray">Memory</span>
          </div>
          <span className="text-lg font-semibold text-white">
            {formatBytes(status?.memory.heapUsed ?? 0)}
          </span>
        </div>
        <div className="cs-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Gamepad2 size={16} className="text-t" />
            <span className="text-sm text-cs2-gray">Current Match</span>
          </div>
          <span className="text-lg font-semibold text-white">
            {status?.currentMatch?.map ?? 'None'}
          </span>
        </div>
      </div>

      {/* GSI Config Download - Host */}
      <div className="cs-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <FileText size={20} className="text-cs2-orange" />
          <h2 className="text-lg font-semibold text-white">
            GSI Config - For Host (This PC)
          </h2>
        </div>
        <div className="flex items-start gap-6">
          <div className="flex-1">
            <p className="text-cs2-gray mb-3">
              Install this config on the PC running the tracker (localhost).
            </p>
            <div className="bg-cs2-darker p-3 rounded-lg font-mono text-sm text-cs2-gray mb-4">
              <span className="text-cs2-orange">Path:</span> Steam\steamapps\common\Counter-Strike Global Offensive\game\csgo\cfg\
            </div>
          </div>
          <a
            href="/gamestate_integration_fizmasoft.cfg"
            download="gamestate_integration_fizmasoft.cfg"
            className="cs-button flex items-center gap-2"
          >
            <Download size={18} />
            Host Config
          </a>
        </div>
      </div>

      {/* GSI Config Download - Other Players */}
      <div className="cs-card p-6 border-l-4 border-accent-green">
        <div className="flex items-center gap-2 mb-4">
          <Users size={20} className="text-accent-green" />
          <h2 className="text-lg font-semibold text-white">
            GSI Config - For Other Players (Network)
          </h2>
        </div>
        <div className="space-y-4">
          <p className="text-cs2-gray">
            Share this config with other players. They need to edit the IP address before using.
          </p>
          <div className="bg-cs2-darker p-4 rounded-lg space-y-3">
            <p className="text-white font-semibold">Setup Instructions:</p>
            <ol className="list-decimal list-inside space-y-2 text-sm text-cs2-gray">
              <li>Download the config file</li>
              <li>Open it in Notepad</li>
              <li>Replace <code className="text-red-400">REPLACE_WITH_HOST_IP</code> with the host's IP (e.g., <code className="text-accent-green">192.168.5.77</code>)</li>
              <li>Save and copy to CS2 cfg folder</li>
              <li>Restart CS2</li>
            </ol>
          </div>
          <div className="bg-cs2-darker p-3 rounded-lg">
            <p className="text-sm text-cs2-gray mb-2">Find host IP by running in CMD:</p>
            <code className="text-cs2-orange">ipconfig | findstr IPv4</code>
          </div>
          <a
            href="/gamestate_integration_fizmasoft_network.cfg"
            download="gamestate_integration_fizmasoft_network.cfg"
            className="cs-button-secondary flex items-center gap-2 w-fit"
          >
            <Download size={18} />
            Network Config (for other players)
          </a>
        </div>
      </div>

      {/* How it works */}
      <div className="cs-card p-6 border-l-4 border-ct">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-ct text-xl">ℹ️</span>
          <h2 className="text-lg font-semibold text-white">
            How Multi-Player Tracking Works
          </h2>
        </div>
        <div className="space-y-3 text-cs2-gray">
          <p>
            When <strong className="text-white">everyone installs the GSI config</strong>, each player's CS2 sends their own stats to the tracker. This means:
          </p>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li><span className="text-accent-green">Everyone can play</span> - no one needs to spectate</li>
            <li>Each player's kills, deaths, assists are tracked individually</li>
            <li>All stats are combined in the leaderboard</li>
            <li>Live match shows all connected players</li>
          </ul>
          <p className="text-yellow-500 text-sm mt-4">
            Note: Players must be on the same network (LAN) or the host must port-forward 8000.
          </p>
        </div>
      </div>

      {/* Players Management */}
      <div className="cs-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Users size={20} className="text-cs2-orange" />
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
                  <td className="text-cs2-gray">{player.id}</td>
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
                  <td className="text-cs2-gray text-sm font-mono">
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
                          className="text-cs2-gray hover:text-white"
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
                        className="text-cs2-gray hover:text-cs2-orange"
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
          <Gamepad2 size={20} className="text-cs2-orange" />
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
                  <td className="text-cs2-gray">{match.id}</td>
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
                          : 'bg-gray-500/20 text-cs2-gray'
                      }`}
                    >
                      {match.status}
                    </span>
                  </td>
                  <td className="text-cs2-gray">
                    {new Date(match.startTime).toLocaleDateString()}
                  </td>
                  <td>
                    <button
                      onClick={() => handleDeleteMatch(match.id)}
                      className="text-cs2-gray hover:text-red-400"
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
