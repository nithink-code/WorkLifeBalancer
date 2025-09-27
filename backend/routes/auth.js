const express = require("express");
const router = express.Router();
const passport = require("passport");
const jwt = require("jsonwebtoken");
const UserAuth = require("../models/Auth");
const bcrypt = require("bcrypt");
const authenticateJWT = require("../middleware/authenticateJWT");

// Verify Token
router.get("/verify", authenticateJWT, (req, res) => {
  if (req.user) {
    res.json({
      registered: true,
      user: {
        id: req.user._id,
        email: req.user.email,
        name: req.user.displayName,
      },
    });
  } else {
    res.status(401).json({ registered: false });
  }
});

// Google OAuth login
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/auth/failure", session: false }),
  (req, res) => {
    const token = req.user.token || req.user;
    res.cookie("jwt", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 2 * 60 * 60 * 1000,
    });
    res.redirect("http://localhost:5173/?google_signup_success=true");
  }
);

router.get("/failure", (req, res) => res.status(401).send("Failed to authenticate."));

// Logout
router.get("/logout", (req, res, next) => {
  req.logout(() => {
    res.clearCookie("jwt");
    res.json({ message: "Logged out" });
  });
});

// Signup - auto login
router.post("/signup", async (req, res) => {
  const { fullName, email, password } = req.body;
  try {
    const existingUser = await UserAuth.findOne({ email });
    if (existingUser) return res.status(409).json({ message: "Email already registered" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new UserAuth({
      displayName: fullName,
      email,
      passwordHash: hashedPassword,
    });
    await newUser.save();

    const token = jwt.sign(
      { id: newUser._id, email: newUser.email },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    res.cookie("jwt", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 2 * 60 * 60 * 1000,
    });

    res.status(201).json({ message: "User registered & logged in" });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Server error during signup" });
  }
});

module.exports = router;
