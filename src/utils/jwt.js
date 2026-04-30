const jwt = require('jsonwebtoken');
const config = require('../config');

const generateToken = (userId, role) => {
  return jwt.sign(
    { id: userId, role },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn }
  );
};

const verifyToken = (token) => {
  return jwt.verify(token, config.jwt.secret);
};

module.exports = { generateToken, verifyToken };
