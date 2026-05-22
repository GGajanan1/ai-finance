const mongoose = require('mongoose');

// ── User Schema ───────────────────────────────────────────────────────────────
// MongoDB is ideal here because:
//   - Each user's settings are a flexible JSON doc (no fixed schema needed)
//   - Macro indicators are arbitrary string arrays (World Bank codes like
//     "NY.GDP.MKTP.KD.ZG") — impossible to model cleanly as SQL columns
//   - Zero ALTER TABLE migrations needed when users add new indicator types
// ─────────────────────────────────────────────────────────────────────────────
const userSchema = new mongoose.Schema(
  {
    _id: String, // Google OAuth "sub" (subject) ID — stable unique identifier

    email:   { type: String, required: true },
    name:    { type: String, default: '' },
    picture: { type: String, default: '' },

    settings: {
      defaultTicker:   { type: String, default: null }, // null = use general market news
      newsLimit:       { type: Number, default: 5 },
      refreshInterval: { type: Number, default: 60 },
      language:        { type: String, default: 'en' },
    },

    watchlist: {
      type: [String],
      default: ['RELIANCE.NS', 'AAPL', 'BTC-USD'],
    },

    macro: {
      countries:  { type: [String], default: ['IND', 'USA', 'CHN'] },
      indicators: {
        type: [String],
        default: ['NY.GDP.MKTP.KD.ZG', 'FP.CPI.TOTL.ZG'],
      },
    },

    portfolio: {
      type: [{
        ticker:      { type: String, required: true },
        shares:      { type: Number, required: true },
        avgBuyPrice: { type: Number, required: true },
        name:        { type: String, default: '' },
        addedAt:     { type: Date,   default: Date.now },
      }],
      default: [],
    },

    chatHistory: {
      type: [{
        role:      { type: String, enum: ['user', 'assistant'], required: true },
        content:   { type: String, required: true },
        timestamp: { type: Date,   default: Date.now },
      }],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
