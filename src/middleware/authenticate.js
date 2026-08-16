const { verifyAccessToken } = require("../utils/jwt");
const { error } = require("../utils/response");
const { user } = require("../models");

const authenticate = async (req, res, next) => {
  try {
    let token;

    // 🔥 ambil dari header dulu
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }

    // 🔥 fallback ke cookie
    if (!token && req.cookies?.authorization) {
      token = req.cookies.authorization;
    }    

    if (!token) {
      return error(res, {
        message: "Access token diperlukan",
        status: 401,
      });
    }

    // ── Verifikasi token — tangkap error JWT secara eksplisit ──
    let decoded;
    try {
      decoded = verifyAccessToken(token);
    } catch (jwtErr) {
      // JsonWebTokenError, TokenExpiredError, NotBeforeError
      return error(res, {
        message:
          jwtErr.name === "TokenExpiredError"
            ? "Access token kedaluwarsa"
            : "Access token tidak valid",
        status: 401,
      });
    }

    const userData = await user.findFirst({
      where: { id: decoded.userId },
    });

    if (!userData) {
      return error(res, { message: "User tidak ditemukan", status: 401 });
    }

    if (!userData.is_active) {
      return error(res, { message: "Akun dinonaktifkan", status: 403 });
    }

    req.user = userData;
    next();
  } catch (err) {
    next(err);
  }
};

/**
 * Middleware otorisasi role
 * @param {...string} roles
 */
const authorize =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user?.role)) {
      return error(res, {
        message: "Tidak punya izin untuk aksi ini",
        status: 403,
      });
    }
    next();
  };

module.exports = { authenticate, authorize };
