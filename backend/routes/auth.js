const express  = require('express');
const passport = require('../config/passport');
const { signToken, COOKIE_NAME, COOKIE_OPTS } = require('../middleware/auth');

const router = express.Router();

// Step 1: Redirect to Google consent screen
router.get(
  '/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })
);

// Step 2: Google redirects back with auth code
router.get(
  '/auth/google/callback',
  passport.authenticate('google', {
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL}/login?error=auth_failed`,
  }),
  (req, res) => {
    const token = signToken(req.user._id);
    res.cookie(COOKIE_NAME, token, COOKIE_OPTS);
    res.redirect(process.env.FRONTEND_URL || 'http://localhost:5173');
  }
);

// Sign out
router.post('/auth/logout', (req, res) => {
  res.clearCookie(COOKIE_NAME);
  res.json({ success: true });
});

module.exports = router;
