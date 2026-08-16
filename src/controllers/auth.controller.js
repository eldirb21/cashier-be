const bcrypt = require("bcrypt");
const crypto = require("crypto");
const { v4: uuidv4 } = require("uuid");
const { OAuth2Client } = require("google-auth-library");
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} = require("../utils/jwt");
const {
  parseIdentifier,
  buildWhereFromIdentifier,
} = require("../utils/identifier");
const { sendResetPasswordEmail } = require("../utils/email");
const { success, error } = require("../utils/response");
const { user, token, passwordReset } = require("../models");
const { ROLE } = require("../libs/enum");

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// HELPER: Buat access + refresh token & simpan ke DB
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const issueTokens = async (userData) => {
  const payload = { userId: userData.id, role: userData.role };
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  const hashedToken = crypto
    .createHash("sha256")
    .update(refreshToken)
    .digest("hex");

  await token.create({
    data: {
      user_id: userData.id,
      token: hashedToken,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  return { accessToken, refreshToken };
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// REGISTER
// POST /api/auth/register
// Body: { name, identifier, password, role? }
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const register = async (req, res, next) => {
  try {
    const { name, identifier, password, role } = req.body;

    // ── Validasi input dasar ──────────────────────────────────
    if (!name?.trim() || !identifier?.trim() || !password) {
      return error(res, {
        message: "Nama, email/nomor HP, dan password wajib diisi",
        status: 400,
      });
    }

    const parsed = parseIdentifier(identifier);

    if (!parsed) {
      return error(res, {
        message: "Format email atau nomor HP tidak valid",
        status: 400,
      });
    }

    if (password.length < 8) {
      return error(res, {
        message: "Password minimal 8 karakter",
        status: 400,
      });
    }

    // ── Cek duplikat ─────────────────────────────────────────
    const existing = await user.findMany({
      where: buildWhereFromIdentifier(identifier),
    });

    if (existing.length > 0) {
      return error(res, {
        message: `${parsed.type === "email" ? "Email" : "Nomor HP"} sudah terdaftar`,
        status: 409,
      });
    }

    // ── Validasi role ─────────────────────────────────────────
    const allowedRoles = Object.values(ROLE);
    let userRole = ROLE.CUSTOMER;

    if (role) {
      if (!allowedRoles.includes(role)) {
        return error(res, {
          message: "Role tidak valid",
          status: 400,
        });
      }
      userRole = role;
    }

    // ── Buat user ─────────────────────────────────────────────
    const hashedPassword = await bcrypt.hash(password, 12);

    const userData = await user.create({
      data: {
        name: name.trim(),
        email: parsed.type === "email" ? parsed.value : null,
        phone: parsed.type === "phone" ? parsed.value : null,
        password: hashedPassword,
        role: userRole,
        is_active: true,
      },
    });

    const { accessToken, refreshToken } = await issueTokens(userData);

    return success(res, {
      message: "Registrasi berhasil",
      status: 201,
      data: {
        user: {
          id: userData.id,
          name: userData.name,
          email: userData.email,
          phone: userData.phone,
          role: userData.role,
        },
        accessToken,
        refreshToken,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// LOGIN
// POST /api/auth/login
// Body: { identifier, password }
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const login = async (req, res, next) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier?.trim() || !password) {
      return error(res, {
        message: "Email/nomor HP dan password wajib diisi",
        status: 400,
      });
    }

    const parsed = parseIdentifier(identifier);

    if (!parsed) {
      return error(res, {
        message: "Format email atau nomor HP tidak valid",
        status: 400,
      });
    }

    // ── Cari user ─────────────────────────────────────────────
    let userData = null;
    if (parsed.type === "email") {
      userData = await user.findFirst({ where: { email: parsed.value } });
    } else {
      userData = await user.findFirst({ where: { phone: parsed.value } });
    }

    if (!userData) {
      return error(res, {
        message: "Email/nomor HP atau password salah",
        status: 401,
      });
    }

    if (!userData.is_active) {
      return error(res, {
        message: "Akun kamu dinonaktifkan",
        status: 403,
      });
    }

    // ── Guard: user Google-only tidak punya password ──────────
    if (!userData.password) {
      return error(res, {
        message: "Akun ini terdaftar via Google. Silakan login dengan Google.",
        status: 400,
      });
    }

    const passwordMatch = await bcrypt.compare(password, userData.password);
    if (!passwordMatch) {
      return error(res, {
        message: "Email/nomor HP atau password salah",
        status: 401,
      });
    }

    const { accessToken, refreshToken } = await issueTokens(userData);

    const { password: _pwd, ...safeUser } = userData;

    return success(res, {
      message: "Login berhasil",
      data: {
        user: safeUser,
        accessToken,
        refreshToken,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// GOOGLE LOGIN
// POST /api/auth/google
// Body: { idToken }
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const googleLogin = async (req, res, next) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return error(res, {
        message: "idToken Google wajib diisi",
        status: 400,
      });
    }

    // ── Verifikasi ID Token Google ────────────────────────────
    let ticket;
    try {
      ticket = await googleClient.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
    } catch {
      return error(res, {
        message: "Token Google tidak valid atau kedaluwarsa",
        status: 401,
      });
    }

    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;

    if (!email) {
      return error(res, {
        message: "Akun Google tidak memiliki email",
        status: 400,
      });
    }

    // ── Cari user existing by google_id atau email ────────────
    let userData = await user.findFirst({ where: { google_id: googleId } });

    if (!userData) {
      // Coba cari by email (akun lama yang mau link ke Google)
      userData = await user.findFirst({
        where: { email: email.toLowerCase() },
      });

      if (userData) {
        // Link akun existing ke Google ID
        await user.update({
          where: { id: userData.id },
          data: {
            google_id: googleId,
            avatar: picture || null,
          },
        });
        userData.google_id = googleId;
        userData.avatar = picture || null;
      }
    }

    // ── Auto-create jika belum ada ────────────────────────────
    if (!userData) {
      userData = await user.create({
        data: {
          name: name || email.split("@")[0],
          email: email.toLowerCase(),
          phone: null,
          password: null, // Google-only user, tidak punya password
          google_id: googleId,
          avatar: picture || null,
          role: ROLE.CUSTOMER,
          is_active: true,
        },
      });
    }

    if (!userData.is_active) {
      return error(res, {
        message: "Akun kamu dinonaktifkan",
        status: 403,
      });
    }

    const { accessToken, refreshToken } = await issueTokens(userData);

    const { password: _pwd, ...safeUser } = userData;

    return success(res, {
      message: "Login dengan Google berhasil",
      data: {
        user: safeUser,
        accessToken,
        refreshToken,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// REFRESH TOKEN
// POST /api/auth/refresh
// Body: { refreshToken }
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const refreshTokenHandler = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return error(res, {
        message: "refreshToken wajib diisi",
        status: 400,
      });
    }

    // ── Verifikasi JWT ────────────────────────────────────────
    let decoded;
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch {
      return error(res, {
        message: "Refresh token tidak valid atau kedaluwarsa",
        status: 401,
      });
    }

    // ── Cek di DB ─────────────────────────────────────────────
    const hashedToken = crypto
      .createHash("sha256")
      .update(refreshToken)
      .digest("hex");

    const stored = await token.findFirst({ where: { token: hashedToken } });

    if (!stored) {
      return error(res, {
        message: "Refresh token tidak valid",
        status: 401,
      });
    }

    if (stored.expires_at < new Date()) {
      return error(res, {
        message: "Refresh token kedaluwarsa",
        status: 401,
      });
    }

    // ── Ambil user ────────────────────────────────────────────
    const userData = await user.findFirst({ where: { id: stored.user_id } });

    if (!userData || !userData.is_active) {
      return error(res, {
        message: "Akun dinonaktifkan",
        status: 403,
      });
    }

    // ── Token rotation: hapus lama, buat baru ─────────────────
    await token.delete({ where: { id: stored.id } });

    const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
      await issueTokens(userData);

    return success(res, {
      message: "Token diperbarui",
      data: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// LOGOUT
// POST /api/auth/logout
// Body: { refreshToken? }
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      const hashedToken = crypto
        .createHash("sha256")
        .update(refreshToken)
        .digest("hex");

      await token.deleteMany({
        where: {
          token: hashedToken,
          user_id: req.user.id,
        },
      });
    }

    return success(res, { message: "Logout berhasil" });
  } catch (err) {
    next(err);
  }
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// FORGOT PASSWORD
// POST /api/auth/forgot-password
// Body: { identifier }
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const forgotPassword = async (req, res, next) => {
  try {
    const { identifier } = req.body;

    if (!identifier?.trim()) {
      return error(res, { message: "Identifier wajib diisi", status: 400 });
    }

    // Selalu response success untuk mencegah user enumeration
    const userData = await user.findFirst({
      where: buildWhereFromIdentifier(identifier),
    });

    if (userData && userData.email) {
      // Batalkan token reset lama
      await passwordReset.updateMany({
        where: { user_id: userData.id, used: false },
        data: { used: true },
      });

      const resetToken = uuidv4();
      const expires_at = new Date(Date.now() + 60 * 60 * 1000); // 1 jam

      await passwordReset.create({
        data: { user_id: userData.id, token: resetToken, expires_at },
      });

      const resetUrl = `${process.env.FRONTEND_URL}/auth/reset-password?token=${resetToken}`;

      // Kirim email (fire and forget)
      sendResetPasswordEmail({
        to: userData.email,
        name: userData.name,
        resetUrl,
      }).catch((e) => console.error("Email error:", e));
    }

    return success(res, {
      message:
        "Jika akun dengan identifier tersebut terdaftar dan memiliki email, link reset telah dikirim.",
    });
  } catch (err) {
    next(err);
  }
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// RESET PASSWORD
// POST /api/auth/reset-password
// Body: { tokenAccess, password }
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const resetPassword = async (req, res, next) => {
  try {
    const { tokenAccess, password } = req.body;

    if (!tokenAccess || !password) {
      return error(res, {
        message: "token dan password wajib diisi",
        status: 400,
      });
    }

    if (password.length < 8) {
      return error(res, {
        message: "Password minimal 8 karakter",
        status: 400,
      });
    }

    const resetRecord = await passwordReset.findUnique({
      where: { token: tokenAccess },
    });

    // ✅ FIX: gunakan expires_at (snake_case dari DB), bukan expiresAt
    if (!resetRecord || resetRecord.used || resetRecord.expires_at < new Date()) {
      return error(res, {
        message: "Token reset tidak valid atau sudah kedaluwarsa",
        status: 400,
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    // ✅ FIX: gunakan user_id (snake_case dari DB), bukan userId
    await user.update({
      where: { id: resetRecord.user_id },
      data: { password: hashedPassword },
    });

    await passwordReset.update({
      where: { id: resetRecord.id },
      data: { used: true },
    });

    // ✅ FIX: gunakan user_id bukan userId
    await token.deleteMany({ where: { user_id: resetRecord.user_id } });

    return success(res, {
      message: "Password berhasil direset. Silakan login dengan password baru.",
    });
  } catch (err) {
    next(err);
  }
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// GET ME
// GET /api/auth/me
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const getMe = async (req, res) => {
  const { password: _pwd, ...safeUser } = req.user;
  return success(res, { data: { user: safeUser } });
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CHANGE PASSWORD
// PATCH /api/auth/change-password
// Body: { currentPassword, newPassword }
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return error(res, {
        message: "currentPassword dan newPassword wajib diisi",
        status: 400,
      });
    }

    if (newPassword.length < 8) {
      return error(res, {
        message: "Password baru minimal 8 karakter",
        status: 400,
      });
    }

    const userData = await user.findUnique({ where: { id: req.user.id } });

    // Guard: user Google-only tidak punya password
    if (!userData.password) {
      return error(res, {
        message: "Akun Google tidak bisa mengubah password dengan cara ini. Gunakan set-password.",
        status: 400,
      });
    }

    const isMatch = await bcrypt.compare(currentPassword, userData.password);

    if (!isMatch) {
      return error(res, {
        message: "Password saat ini tidak cocok",
        status: 400,
      });
    }

    const hashed = await bcrypt.hash(newPassword, 12);
    await user.update({
      where: { id: req.user.id },
      data: { password: hashed },
    });

    return success(res, { message: "Password berhasil diubah" });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  register,
  login,
  googleLogin,
  logout,
  refreshTokenHandler,
  forgotPassword,
  resetPassword,
  getMe,
  changePassword,
};
