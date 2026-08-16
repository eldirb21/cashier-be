const jwt = require("jsonwebtoken");
require("dotenv").config();

const generateAccessToken = (payload) =>
  jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRES || "15m",
  });

const generateRefreshToken = (payload) =>
  jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES || "7d",
  });

/**
 * Verifikasi access token — support legacy JWT_SECRET sebagai fallback
 * agar token lama (yang di-sign pakai secret berbeda) tetap valid selama transisi.
 */
const verifyAccessToken = (token) => {
  // Coba dengan secret utama dulu
  try {
    return jwt.verify(token, process.env.JWT_ACCESS_SECRET);
  } catch (primaryErr) {
    // Fallback ke JWT_SECRET lama (jika berbeda dari JWT_ACCESS_SECRET)
    const legacySecret = process.env.JWT_SECRET;
    if (legacySecret && legacySecret !== process.env.JWT_ACCESS_SECRET) {
      try {
        return jwt.verify(token, legacySecret);
      } catch {
        // Token benar-benar tidak valid — lempar error original
        throw primaryErr;
      }
    }
    throw primaryErr;
  }
};

/**
 * Verifikasi refresh token — support legacy JWT_SECRET sebagai fallback
 */
const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch (primaryErr) {
    const legacySecret = process.env.JWT_SECRET;
    if (legacySecret && legacySecret !== process.env.JWT_REFRESH_SECRET) {
      try {
        return jwt.verify(token, legacySecret);
      } catch {
        throw primaryErr;
      }
    }
    throw primaryErr;
  }
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};