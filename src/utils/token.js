const jwt = require('jsonwebtoken');

// membuat access token (durasi pendek)
const generateAccessToken = (user) => {
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role
  };
  
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '15m'
  });
};

// membuat refresh token (durasi panjang)
const generateRefreshToken = (user) => {
  const payload = {
    id: user.id
  };
  
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
  });
};

module.exports = {
  generateAccessToken,
  generateRefreshToken
};