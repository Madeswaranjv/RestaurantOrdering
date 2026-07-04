import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.js';

const configurePassport = () => {
  // JWT Strategy
  const jwtOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET || 'jwt_default_secret_key_12345!'
  };

  passport.use(
    new JwtStrategy(jwtOptions, async (jwtPayload, done) => {
      try {
        const user = await User.findById(jwtPayload.id);
        if (user) {
          return done(null, user);
        }
        return done(null, false);
      } catch (error) {
        return done(error, false);
      }
    })
  );

  // Google OAuth Strategy
  // Check if client ID and secret exist, otherwise use dummy placeholders to prevent passport crash on start
  const googleClientId = process.env.GOOGLE_CLIENT_ID || 'dummy_client_id';
  const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET || 'dummy_client_secret';

  passport.use(
    new GoogleStrategy(
      {
        clientID: googleClientId,
        clientSecret: googleClientSecret,
        callbackURL: '/api/auth/google/callback',
        scope: ['profile', 'email']
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;
          
          if (!email) {
            return done(new Error('Google account does not have an email associated.'), null);
          }

          // 1. Try to find user by Google ID
          let user = await User.findOne({ googleId: profile.id });
          if (user) {
            if (user.isBlocked) {
              return done(new Error(`Your account has been blocked. Reason: ${user.blockedReason || 'No reason provided'}`), null);
            }
            return done(null, user);
          }

          // 2. Try to find user by Email
          user = await User.findOne({ email });
          if (user) {
            if (user.isBlocked) {
              return done(new Error(`Your account has been blocked. Reason: ${user.blockedReason || 'No reason provided'}`), null);
            }
            // Update user with googleId and avatar if not set
            user.googleId = profile.id;
            if (!user.avatar && profile.photos && profile.photos[0]) {
              user.avatar = profile.photos[0].value;
            }
            await user.save();
            return done(null, user);
          }

          // 3. Create a new user if not found
          const newUser = new User({
            name: profile.displayName || `${profile.name.givenName} ${profile.name.familyName}`,
            email: email,
            googleId: profile.id,
            avatar: profile.photos && profile.photos[0] ? profile.photos[0].value : '',
            role: 'customer', // default role
            // Since password is required for local login but not OAuth, we can generate a random one or leave it empty/hashed
            password: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
          });

          await newUser.save();
          return done(null, newUser);
        } catch (error) {
          return done(error, null);
        }
      }
    )
  );
};

export default configurePassport;
