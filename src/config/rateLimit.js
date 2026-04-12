import rateLimit from "express-rate-limit";

// ✅ Rate limiter
export const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === "production" ? 100 : 1000,
  message: "Terlalu banyak permintaan, coba lagi nanti.",
});

// Login & register: 10 percobaan per 15 menit
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: "Terlalu banyak percobaan. Coba lagi dalam 15 menit." },
  standardHeaders: true,
  legacyHeaders: false,
});

// Forgot password: 5 request per jam
export const forgotLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: { success: false, message: "Terlalu banyak request reset password. Coba lagi dalam 1 jam." },
  standardHeaders: true,
  legacyHeaders: false,
});

