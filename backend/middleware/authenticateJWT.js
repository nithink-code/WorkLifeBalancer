require('dotenv').config();
const jwt = require('jsonwebtoken');
const UserAuth = require('../models/Auth');

async function authenticateJWT(req, res, next) {
  console.log(`Auth middleware hit for ${req.method} ${req.path}`);
  try {
    // Extract token from header or cookie
    const authHeader = req.headers['authorization'];
    let token;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1]; // Extract from Bearer header
      console.log("Token found in Authorization header");
    } else if (req.cookies && req.cookies.jwt) {
      token = req.cookies.jwt; // Extract from cookie
      console.log("Token found in cookie");
    }

    if (!token) {
      console.log("No token found in request");
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    console.log("Token present, verifying...");
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Token verified, user ID:", decoded.id);
    
    // Fetch user from DB by id in decoded token
    const user = await UserAuth.findById(decoded.id);
    if (!user) {
      console.log("User not found in database for ID:", decoded.id);
      return res.status(404).json({ message: 'User not found' });
    }

    console.log("User authenticated successfully:", user.id);
    // Attach user object to request
    req.user = user;
    next();
  } catch (error) {
    console.error("Authentication error:", error.message);
    return res.status(403).json({ message: 'Invalid or expired token.' });
  }
}

module.exports = authenticateJWT;
