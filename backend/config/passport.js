const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const UserAuth = require("../models/Auth");
const jwt = require("jsonwebtoken");

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "/auth/google/callback",
}, async (accessToken, refreshToken, profile, done) => {
  try {
    // Find or create user logic
    let user = await UserAuth.findOne({ email: profile.emails[0].value });
    if (!user) {
      user = new UserAuth({
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
