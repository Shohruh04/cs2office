import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';

// Database - must await initialization
import { initDatabase } from './db/index.js';

// Routes
import gsiRouter from './routes/gsi.js';
import playersRouter from './routes/players.js';
import matchesRouter from './routes/matches.js';
import statsRouter from './routes/stats.js';
import liveRouter from './routes/live.js';
import adminRouter from './routes/admin.js';

// Services
import { matchManager } from './services/matchManager.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const httpServer = createServer(app);

// Socket.io setup
const io = new SocketServer(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Connect Socket.io to match manager
matchManager.setSocketServer(io);

// API Routes
app.use('/api/gsi', gsiRouter);
app.use('/api/players', playersRouter);
app.use('/api/matches', matchesRouter);
app.use('/api/stats', statsRouter);
app.use('/api/live', liveRouter);
app.use('/api/admin', adminRouter);

// Leaderboard shortcut
app.get('/api/leaderboard', (req, res) => {
  res.redirect('/api/stats/leaderboard');
});

// Serve static frontend files in production
const frontendPath = path.join(__dirname, '../../frontend/dist');
app.use(express.static(frontendPath));

// SPA fallback - serve index.html for all non-API routes
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(frontendPath, 'index.html'));
  }
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);

  // Send current live state if available
  const liveState = matchManager.getLiveState();
  if (liveState) {
    socket.emit('match:update', {
      matchId: matchManager.getCurrentMatchId(),
      state: liveState,
    });
  }

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

// Initialize database and start server
const PORT = process.env.PORT || 8000;
const HOST = process.env.HOST || '0.0.0.0';

async function start() {
  try {
    // Initialize database
    initDatabase();

    // Start server
    httpServer.listen(Number(PORT), HOST, () => {
      console.log('');
      console.log('='.repeat(50));
      console.log('  CS2 Office Stats Tracker');
      console.log('='.repeat(50));
      console.log(`  Server running on http://${HOST}:${PORT}`);
      console.log(`  GSI endpoint: http://127.0.0.1:${PORT}/api/gsi`);
      console.log('');
      console.log('  To access from other devices on your network:');
      console.log(`  http://<your-ip>:${PORT}`);
      console.log('='.repeat(50));
      console.log('');
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

start();
