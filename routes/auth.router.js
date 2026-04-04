// src/routes/auth.routes.js
const router = require("express").Router();
const rateLimit = require("express-rate-limit");
const ctrl = require("../src/controllers/auth.controller");
const { authenticate } = require("../src/middleware/authenticate");

// ── Rate limiters ──────────────────────────────────────────────

// Login & register: 10 percobaan per 15 menit
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { success: false, message: "Terlalu banyak percobaan. Coba lagi dalam 15 menit." },
    standardHeaders: true,
    legacyHeaders: false,
});

// Forgot password: 5 request per jam
const forgotLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 5,
    message: { success: false, message: "Terlalu banyak request reset password. Coba lagi dalam 1 jam." },
    standardHeaders: true,
    legacyHeaders: false,
});

// ── Public routes ──────────────────────────────────────────────
router.post("/register", loginLimiter, ctrl.register);
router.post("/login", loginLimiter, ctrl.login);
router.post("/refresh", ctrl.refreshTokenHandler);
router.post("/forgot-password", forgotLimiter, ctrl.forgotPassword);
router.post("/reset-password", ctrl.resetPassword);

// ── Protected routes ───────────────────────────────────────────
router.get("/me", authenticate, ctrl.getMe);
router.patch("/change-password", authenticate, ctrl.changePassword);
router.post("/logout", authenticate, ctrl.logout);

module.exports = router;