require('dotenv').config();
const jwt = require('jsonwebtoken');
const UserAuth = require('../models/Auth'); // your user model

async function authenticateJWT(req, res, next) {
  try {
    // Extract token from header or cookie
    const authHeader = req.headers['authorization'];
    let token;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1]; // Correct split by space
    } else if (req.cookies && req.cookies.jwt) {
      token = req.cookies.jwt;
    }

    if (!token) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Fetch user from DB by id in decoded token
    const user = await UserAuth.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Attach user object to request
    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid or expired token.' });
  }
}

module.exports = authenticateJWT;
