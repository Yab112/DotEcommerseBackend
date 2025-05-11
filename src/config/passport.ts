// src/config/passport.ts
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';

import User from '@/models/profile.model';

export const setupPassport = () => {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        callbackURL: '/auth/google/callback',
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Find user by googleId
          let user = await User.findOne({ googleId: profile.id });

          if (user) {
            // Existing Google user
            if (user.loginMethod === 'password') {
              user.loginMethod = 'both';
              user.googleId = profile.id;
              await user.save();
            }
            return done(null, user);
          }

          // Find user by email (linking)
          user = await User.findOne({ email: profile.emails?.[0].value });

          if (user) {
            // Link account if email matches but Google ID is not set
            if (!user.googleId) {
              user.googleId = profile.id;
              user.loginMethod = user.loginMethod === 'password' ? 'both' : 'google';
              await user.save();
            }
            return done(null, user);
          }

          // Create new user
          user = new User({
            firstName: profile.name?.givenName || 'Unknown',
            lastName: profile.name?.familyName || 'User',
            email: profile.emails?.[0].value,
            password: '',
            googleId: profile.id,
            loginMethod: 'google',
            isVerified: true,
          });
          await user.save();
          return done(null, user);
        } catch (error) {
          return done(error);
        }
      },
    ),
  );
};
