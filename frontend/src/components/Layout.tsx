import { Link, useLocation } from "react-router-dom";
import { Home, Trophy, Users, History, Settings, Radio } from "lucide-react";
import { useLiveMatch } from "../hooks/useLiveMatch";
import AudioPlayer from "./AudioPlayer";
import CS2Logo from "./CS2Logo";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const { isLive } = useLiveMatch();

  const navItems = [
    { path: "/", icon: Home, label: "Dashboard" },
    { path: "/leaderboard", icon: Trophy, label: "Leaderboard" },
    { path: "/players", icon: Users, label: "Players" },
    { path: "/matches", icon: History, label: "Matches" },
    { path: "/admin", icon: Settings, label: "Admin" },
  ];

  return (
    <div className="min-h-screen bg-cs2-darker">

      {/* Header */}
      <header className="sticky top-0 z-40 bg-cs2-dark/90 backdrop-blur-md border-b border-cs2-orange/20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <CS2Logo
                size={44}
                className="transition-transform group-hover:scale-105"
              />
              <div>
                <h1 className="font-display font-bold text-lg text-white">
                  CS2 Stats
                </h1>
                <p className="text-xs text-cs2-orange">Fizmasoft</p>
              </div>
            </Link>

            {/* Navigation */}
            <nav className="flex items-center gap-1">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                      isActive
                        ? "bg-cs2-orange/20 text-cs2-orange-light border border-cs2-orange/30"
                        : "text-cs2-gray hover:text-white hover:bg-white/10"
                    }`}
                  >
                    <Icon size={18} />
                    <span className="hidden md:inline text-sm font-medium">
                      {item.label}
                    </span>
                  </Link>
                );
              })}

              {/* Live Match Indicator */}
              {isLive && (
                <Link
                  to="/live"
                  className="ml-4 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse"
                >
                  <Radio size={16} className="animate-pulse" />
                  <span className="text-sm font-medium">LIVE</span>
                </Link>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 py-6">
        {children}
      </main>

      {/* Audio Player */}
      <AudioPlayer />
    </div>
  );
}
