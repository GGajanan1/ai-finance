const jwt = require('jsonwebtoken');

const COOKIE_NAME = 'hms_auth';

const COOKIE_OPTS = {
  httpOnly: true,
  secure:   process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge:   7 * 24 * 60 * 60 * 1000, // 7 days
};

const signToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });

/** Express middleware — verifies the JWT cookie and sets req.userId. */
const requireAuth = (req, res, next) => {
  const token = req.cookies[COOKIE_NAME];
  if (!token) return res.status(401).json({ error: 'Not authenticated' });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = payload.id;
    next();
  } catch {
    res.clearCookie(COOKIE_NAME);
    return res.status(401).json({ error: 'Session expired. Please sign in again.' });
  }
};

module.exports = { requireAuth, signToken, COOKIE_NAME, COOKIE_OPTS };
