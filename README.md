# CS2 Office Stats Tracker

A modern web application for tracking Counter-Strike 2 match statistics in your office. Features real-time updates, player leaderboards, match history, and a beautiful CS2-inspired dark theme.

## Features

- **Live Match Tracking**: Real-time scoreboard, kill feed, and player stats during matches
- **Leaderboards**: Track top players by kills, K/D ratio, headshots, and more
- **Player Profiles**: Detailed stats, performance charts, and match history
- **Match History**: Complete record of all matches with round-by-round breakdown
- **Admin Panel**: Manage players and delete matches
- **Background Music**: CS2 menu music with volume control
- **Modern UI**: CS2-inspired dark theme with smooth animations

## Quick Start

### Option 1: Docker (Recommended)

```bash
# Build and run
docker-compose up -d

# The app will be available at http://localhost:3000
```

### Option 2: Manual Setup

#### Prerequisites
- Node.js 18+ installed
- npm or yarn

#### Backend Setup
```bash
cd backend
npm install
npm run dev
```

#### Frontend Setup (in a new terminal)
```bash
cd frontend
npm install
npm run dev
```

The app will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000

## CS2 Game State Integration Setup

1. **Copy the GSI config file** to your CS2 cfg folder:
   ```
   Copy: gamestate_integration_fizmasoft.cfg
   To: Steam\steamapps\common\Counter-Strike Global Offensive\game\csgo\cfg\
   ```

2. **Restart CS2** if it's running

3. **Start a private match** - the app will automatically receive match data!

## Adding Background Music

Place your CS2 music file at:
```
frontend/public/audio/cs2-menu.mp3
```

You can extract CS2 menu music from the game files or use royalty-free CS-style music.

## Network Access

For office users to view the dashboard:

1. Find your computer's IP address:
   ```bash
   # Windows
   ipconfig

   # Mac/Linux
   ifconfig
   ```

2. Share the URL with your colleagues:
   ```
   http://YOUR_IP:3000
   ```

## Tech Stack

- **Backend**: Node.js, Express, TypeScript, SQLite, Socket.io
- **Frontend**: React, Vite, TailwindCSS, Recharts
- **Database**: SQLite with Drizzle ORM
- **Real-time**: WebSocket + Polling fallback

## Project Structure

```
FizmasoftCS/
├── backend/
│   ├── src/
│   │   ├── routes/       # API endpoints
│   │   ├── services/     # Business logic
│   │   ├── db/           # Database schema
│   │   └── types/        # TypeScript types
│   └── data/             # SQLite database
├── frontend/
│   ├── src/
│   │   ├── pages/        # React pages
│   │   ├── components/   # UI components
│   │   ├── hooks/        # Custom hooks
│   │   └── api/          # API client
│   └── public/audio/     # Audio files
├── Dockerfile
├── docker-compose.yml
└── gamestate_integration_fizmasoft.cfg
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/gsi | Receive CS2 GSI events |
| GET | /api/players | List all players |
| GET | /api/players/:id | Get player details |
| GET | /api/matches | List all matches |
| GET | /api/matches/:id | Get match details |
| GET | /api/stats/leaderboard | Get leaderboard |
| GET | /api/live | Get live match state |
| PUT | /api/admin/players/:id | Update player |
| DELETE | /api/admin/matches/:id | Delete match |

## Troubleshooting

### GSI not working?
1. Make sure the config file is in the correct folder
2. Restart CS2 after adding the config
3. Check that the backend is running on port 3000
4. Try launching CS2 with `-netconport 3000`

### Can't connect from other devices?
1. Check your firewall settings
2. Make sure port 3000 is open
3. Use `0.0.0.0:3000` instead of `localhost:3000`

### Database issues?
Delete the database file and restart the server:
```bash
rm backend/data/fizmasoft_cs.db
```

## License

MIT License - Fizmasoft 2024
