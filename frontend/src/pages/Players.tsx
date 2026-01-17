import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Search, Target, Skull, Award, ChevronRight } from 'lucide-react';
import { playersAPI, type Player } from '../api';

export default function Players() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function fetchPlayers() {
      try {
        const data = await playersAPI.getAll();
        setPlayers(data);
      } catch (error) {
        console.error('Failed to fetch players:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchPlayers();
  }, []);

  const filteredPlayers = players.filter((player) =>
    player.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="text-cs2-orange" size={28} />
          <div>
            <h1 className="text-2xl font-bold text-white">Players</h1>
            <p className="text-cs2-gray">{players.length} registered players</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-cs2-gray"
          />
          <input
            type="text"
            placeholder="Search players..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="cs-input pl-10 w-64"
          />
        </div>
      </div>

      {/* Players Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cs2-orange"></div>
        </div>
      ) : filteredPlayers.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPlayers.map((player) => (
            <Link key={player.id} to={`/players/${player.id}`}>
              <div className="cs-card-hover p-4">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 rounded-lg bg-cs-border flex items-center justify-center">
                    <span className="text-2xl font-bold text-cs2-gray">
                      {player.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-white text-lg">
                      {player.name}
                    </h3>
                    <p className="text-sm text-cs2-gray">
                      {player.stats.matchesPlayed} matches
                    </p>
                  </div>
                  <ChevronRight className="text-gray-600" />
                </div>

                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-cs-dark rounded p-2">
                    <div className="flex items-center justify-center gap-1 text-accent-green">
                      <Target size={14} />
                      <span className="font-bold">{player.stats.kills}</span>
                    </div>
                    <span className="text-xs text-gray-500">Kills</span>
                  </div>
                  <div className="bg-cs-dark rounded p-2">
                    <div className="flex items-center justify-center gap-1 text-red-400">
                      <Skull size={14} />
                      <span className="font-bold">{player.stats.deaths}</span>
                    </div>
                    <span className="text-xs text-gray-500">Deaths</span>
                  </div>
                  <div className="bg-cs-dark rounded p-2">
                    <div className="flex items-center justify-center gap-1 text-yellow-400">
                      <Award size={14} />
                      <span className="font-bold">{player.stats.mvps}</span>
                    </div>
                    <span className="text-xs text-gray-500">MVPs</span>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-cs-border flex justify-between text-sm">
                  <span className="text-cs2-gray">K/D Ratio</span>
                  <span
                    className={`font-bold ${
                      player.stats.kdRatio >= 1
                        ? 'text-accent-green'
                        : 'text-red-400'
                    }`}
                  >
                    {player.stats.kdRatio.toFixed(2)}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="cs-card p-12 text-center">
          <Users size={48} className="mx-auto text-gray-600 mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">
            {search ? 'No Players Found' : 'No Players Yet'}
          </h2>
          <p className="text-cs2-gray">
            {search
              ? 'Try a different search term.'
              : 'Players will appear here after they play matches.'}
          </p>
        </div>
      )}
    </div>
  );
}
