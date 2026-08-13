const bcrypt = require("bcrypt");
const crypto = require("crypto");
const { v4: uuidv4 } = require("uuid");
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

const register = async (req, res, next) => {
  try {
    const { name, identifier, password, role } = req.body;
    const parsed = parseIdentifier(identifier);

    if (!name?.trim() || !identifier?.trim() || !password) {
      return error(res, {
        message: `Name, ${parsed.type === "email" ? "Email" : "Nomor HP"} wajib diisi`,
        status: 400,
      });
    }

    if (!parsed) {
      return error(res, {
        message: `${parsed.type === "email" ? "Email" : "Nomor HP"} tidak valid`,
        status: 400,
      });
    }

    if (password.length < 8) {
      return error(res, {
        message: "Password minimal 8 karakter",
        status: 400,
      });
    }

    const existing = await user.findMany({
      where: buildWhereFromIdentifier(identifier),
    });

    if (existing.length > 0) {
      return error(res, {
        message: `${parsed.type === "email" ? "Email" : "Nomor HP"} sudah terdaftar`,
        status: 409,
      });
    }

    // 🔐 VALIDASI ROLE
    const allowedRoles = Object.values(ROLE);
    let userRole = ROLE.CUSTOMER;

    if (role) {
      if (!allowedRoles.includes(role)) {
        return error(res, {
          message: "Role tidak valid",
          status: 400,
        });
      }

      const forbiddenRoles = [ROLE.ADMIN, ROLE.OWNER];

      // if (forbiddenRoles.includes(role)) {
      //   return error(res, {
      //     message: "Tidak diizinkan memilih role ini",
      //     status: 403,
      //   });
      // }

      userRole = role;
    }

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

    const tokenPayload = {
      userId: userData.id,
      role: userData.role,
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    await token.create({
      data: {
        user_id: userData.id,
        token: refreshToken,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

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

const login = async (req, res, next) => {
  try {
    const { identifier, password } = req.body;
    const parsed = parseIdentifier(identifier);

    if (!identifier?.trim() || !password) {
      return error(res, {
        message: `${parsed.type === "email" ? "Email" : "Nomor HP"} wajib diisi`,
        status: 400,
      });
    }

    if (!parsed) {
      return error(res, {
        message: `${parsed.type === "email" ? "Email" : "Nomor HP"} tidak valid`,
        status: 400,
      });
    }

    // 🔥 OPTIMAL QUERY (NO OR)
    let userData = null;

    if (parsed.type === "email") {
      userData = await user.findFirst({
        where: { email: parsed.value },
      });
    } else {
      userData = await user.findFirst({
        where: { phone: parsed.value },
      });
    }

    if (!userData) {
      return error(res, {
        message: `${parsed.type === "email" ? "Email" : "Nomor HP"} yang Anda masukkan tidak sesuai!`,
        status: 401,
      });
    }

    if (!userData.is_active) {
      return error(res, {
        message: "Akun kamu dinonaktifkan",
        status: 403,
      });
    }

    const passwordMatch = await bcrypt.compare(password, userData.password);
    if (!passwordMatch) {
      return error(res, {
        message: `${parsed.type === "email" ? "Email" : "Nomor HP"} yang Anda masukkan tidak sesuai!`,
        status: 401,
      });
    }

    const tokenPayload = {
      userId: userData.id,
      role: userData.role,
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    // 🔐 HASH TOKEN (WAJIB)
    const hashedToken = crypto
      .createHash("sha256")
      .update(refreshToken)
      .digest("hex");

    await token.create({
      data: {
        user_id: userData.id, // FIX snake_case
        token: hashedToken,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

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

const refreshTokenHandler = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return error(res, {
        message: "refreshToken wajib diisi",
        status: 400,
      });
    }

    // 🔐 VERIFY JWT
    let decoded;
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch {
      return error(res, {
        message: "Refresh token tidak valid atau kedaluwarsa",
        status: 401,
      });
    }

    // 🔐 HASH TOKEN (WAJIB)
    const hashedToken = crypto
      .createHash("sha256")
      .update(refreshToken)
      .digest("hex");

    // 🔎 CEK DB
    const stored = await token.findFirst({
      where: { token: hashedToken },
    });

    if (!stored) {
      // ⚠️ kemungkinan token reuse / dicuri
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

    // 🔥 ambil user manual (WAJIB)
    const userData = await user.findFirst({
      where: { id: stored.user_id },
    });

    if (!userData || !userData.is_active) {
      return error(res, {
        message: "Akun dinonaktifkan",
        status: 403,
      });
    }

    // 🔥 ROTATION (WAJIB)
    await token.delete({
      where: { id: stored.id },
    });

    const payload = {
      user_id: userData.id,
      role: userData.role,
    };

    const newAccessToken = generateAccessToken(payload);
    const newRefreshToken = generateRefreshToken(payload);

    const newHashedToken = crypto
      .createHash("sha256")
      .update(newRefreshToken)
      .digest("hex");

    await token.create({
      data: {
        user_id: userData.id,
        token: newHashedToken,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

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

const forgotPassword = async (req, res, next) => {
  try {
    const { identifier } = req.body;

    if (!identifier?.trim()) {
      return error(res, { message: "identifier wajib diisi", status: 400 });
    }

    // Selalu success untuk mencegah user enumeration
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

      // Kirim email (fire and forget — jangan block response)
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
// Body: { token, password }
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

    if (
      !resetRecord ||
      resetRecord.used ||
      resetRecord.expiresAt < new Date()
    ) {
      return error(res, {
        message: "Token reset tidak valid atau sudah kedaluwarsa",
        status: 400,
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await user.update({
      where: { id: resetRecord.userId },
      data: { password: hashedPassword },
    });
    await passwordReset.update({
      where: { id: resetRecord.id },
      data: { used: true },
    });

    await token.deleteMany({ where: { userId: resetRecord.userId } });

    return success(res, {
      message: "Password berhasil direset. Silakan login dengan password baru.",
    });
  } catch (err) {
    next(err);
  }
};

const getMe = async (req, res) => {
  return success(res, { data: { user: req.user } });
};

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
  logout,
  refreshTokenHandler,
  forgotPassword,
  resetPassword,
  getMe,
  changePassword,
};
