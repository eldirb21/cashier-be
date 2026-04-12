const router = require("express").Router();
const ctrl = require("../src/controllers/auth.controller");
const { authenticate } = require("../src/middleware/authenticate");
const { loginLimiter, forgotLimiter } = require("../src/config/rateLimit");

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