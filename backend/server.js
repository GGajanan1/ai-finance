require('dotenv').config();

const express      = require('express');

const cors         = require('cors');
const cookieParser = require('cookie-parser');

const connectDB    = require('./config/db');
const passport     = require('./config/passport');   // registers GoogleStrategy
const authRoutes   = require('./routes/auth');
const userRoutes   = require('./routes/user');

// ── Init ──────────────────────────────────────────────────────────────────────
connectDB();

const app = express();

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());   // required for passport.authenticate() to work

// ── Routes ────────────────────────────────────────────────────────────────────
app.use(authRoutes);
app.use(userRoutes);

// ── Health ────────────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'HMS Auth Backend' }));

// ── Start ─────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Auth backend running on http://localhost:${PORT}`);
  console.log(`   OAuth callback: ${process.env.CALLBACK_URL}`);
  console.log(`   Frontend:       ${process.env.FRONTEND_URL}`);
});
