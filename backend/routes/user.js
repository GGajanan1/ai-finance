const express     = require('express');
const User        = require('../models/User');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// GET /api/user/me — current user profile + all settings
router.get('/api/user/me', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).lean();
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/user/settings — update app preferences
router.patch('/api/user/settings', requireAuth, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.userId,
      { $set: { settings: req.body } },
      { new: true, runValidators: true }
    );
    res.json(user.settings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/user/watchlist
router.patch('/api/user/watchlist', requireAuth, async (req, res) => {
  try {
    const { watchlist } = req.body;
    if (!Array.isArray(watchlist))
      return res.status(400).json({ error: 'watchlist must be an array' });
    const user = await User.findByIdAndUpdate(
      req.userId,
      { $set: { watchlist } },
      { new: true }
    );
    res.json({ watchlist: user.watchlist });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/user/macro — save countries + indicators preferences
router.patch('/api/user/macro', requireAuth, async (req, res) => {
  try {
    const { countries, indicators } = req.body;
    const user = await User.findByIdAndUpdate(
      req.userId,
      { $set: { macro: { countries, indicators } } },
      { new: true }
    );
    res.json(user.macro);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/user/portfolio
router.get('/api/user/portfolio', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).lean();
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ portfolio: user.portfolio || [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/user/portfolio — replace full holdings array
router.patch('/api/user/portfolio', requireAuth, async (req, res) => {
  try {
    const { portfolio } = req.body;
    if (!Array.isArray(portfolio))
      return res.status(400).json({ error: 'portfolio must be an array' });
    const user = await User.findByIdAndUpdate(
      req.userId,
      { $set: { portfolio } },
      { new: true }
    );
    res.json({ portfolio: user.portfolio });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/user/chat-history
router.get('/api/user/chat-history', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).lean();
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ chatHistory: user.chatHistory || [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/user/chat-history — append messages
router.post('/api/user/chat-history', requireAuth, async (req, res) => {
  try {
    const { messages } = req.body; // [{role, content}]
    if (!Array.isArray(messages))
      return res.status(400).json({ error: 'messages must be an array' });
    const user = await User.findByIdAndUpdate(
      req.userId,
      { $push: { chatHistory: { $each: messages } } },
      { new: true }
    );
    res.json({ chatHistory: user.chatHistory });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/user/chat-history — clear all chat history
router.delete('/api/user/chat-history', requireAuth, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.userId, { $set: { chatHistory: [] } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
