const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const userGoogle = require('../models/Auth');
const jwt = require("jsonwebtoken");

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "/auth/google/callback",
}, async (accessToken, refreshToken, profile, done) => {
  try {
    // Find or create user logic by google ID
    let user = await userGoogle.findOne({ googleId: profile.id });
    if (!user) {
      user = new userGoogle({
        googleId: profile.id,
        displayName: profile.displayName,
        email: profile.emails[0].value,
      });
      await user.save();
    }
    // Create JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );
    done(null, token);
  } catch (error) {
    done(error, null);
  }
}));

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((obj, done) => {
  done(null, obj);
});
