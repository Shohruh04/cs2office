import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import CS2Loader from "./components/CS2Loader";
import Dashboard from "./pages/Dashboard";
import Leaderboard from "./pages/Leaderboard";
import Players from "./pages/Players";
import PlayerProfile from "./pages/PlayerProfile";
import Matches from "./pages/Matches";
import MatchDetail from "./pages/MatchDetail";
import LiveMatch from "./pages/LiveMatch";
import Admin from "./pages/Admin";

export default function App() {
  const [isLoading, setIsLoading] = useState(true);

  if (isLoading) {
    return <CS2Loader onLoadComplete={() => setIsLoading(false)} minDuration={3000} />;
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/players" element={<Players />} />
        <Route path="/players/:id" element={<PlayerProfile />} />
        <Route path="/matches" element={<Matches />} />
        <Route path="/matches/:id" element={<MatchDetail />} />
        <Route path="/live" element={<LiveMatch />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </Layout>
  );
}
