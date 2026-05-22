/** Google OAuth strategy — registers the GoogleStrategy with passport. */
const passport       = require('passport');

const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User           = require('../models/User');

passport.use(
  new GoogleStrategy(
    {
      clientID:     process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL:  process.env.CALLBACK_URL || 'http://localhost:3001/auth/google/callback',
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        let user = await User.findById(profile.id);
        if (!user) {
          user = await User.create({
            _id:     profile.id,
            email:   profile.emails?.[0]?.value ?? '',
            name:    profile.displayName ?? '',
            picture: profile.photos?.[0]?.value ?? '',
          });
          console.log(`👤 New user created: ${user.email}`);
        } else {
          user.name    = profile.displayName ?? user.name;
          user.picture = profile.photos?.[0]?.value ?? user.picture;
          await user.save();
        }
        done(null, user);
      } catch (err) {
        done(err, null);
      }
    }
  )
);

module.exports = passport;
