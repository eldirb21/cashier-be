const { customer, transaction } = require("../models");
const { success, error } = require("../utils/response");

// ─── Helper: generate member_code ─────────────────────────────
const generateMemberCode = () => {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `MBR-${ts}-${rand}`;
};

// ─── Helper: tentukan member_level dari total_spending ────────
const resolveMemberLevel = (totalSpending) => {
  const amount = Number(totalSpending);
  if (amount >= 10_000_000) return "platinum";
  if (amount >= 5_000_000) return "gold";
  if (amount >= 1_000_000) return "silver";
  return "regular";
};

// ─────────────────────────────────────────────────────────────
// 🔹 CREATE CUSTOMER / DAFTAR MEMBER
// ─────────────────────────────────────────────────────────────
const createCustomer = async (req, res) => {
  try {
    const {
      id,
      name,
      phone,
      email,
      address,
      gender,
      birth_date,
      member_code,
      is_active,
    } = req.body;

    if (!name || !name.trim()) {
      return error(res, { message: "Nama customer wajib diisi", status: 400 });
    }

    const custId = id && id.trim() ? id.trim() : `CUST-${Date.now()}`;

    // Cek duplikasi ID
    const existingId = await customer.findUnique({ where: { id: custId } });
    if (existingId) {
      return error(res, { message: "ID customer sudah digunakan", status: 409 });
    }

    // Cek duplikasi phone
    if (phone) {
      const existingPhone = await customer.findUnique({ where: { phone } });
      if (existingPhone) {
        return error(res, { message: "Nomor HP sudah terdaftar", status: 409 });
      }
    }

    // Cek duplikasi email
    if (email) {
      const existingEmail = await customer.findUnique({ where: { email } });
      if (existingEmail) {
        return error(res, { message: "Email sudah terdaftar", status: 409 });
      }
    }

    const custMemberCode = member_code && member_code.trim()
      ? member_code.trim()
      : generateMemberCode();

    const newCustomer = await customer.create({
      data: {
        id: custId,
        name: name.trim(),
        phone: phone || null,
        email: email ? email.toLowerCase().trim() : null,
        address: address || null,
        gender: gender || null,
        birth_date: birth_date || null,
        member_code: custMemberCode,
        member_level: "regular",
        points: 0,
        total_spending: 0,
        is_active: is_active !== undefined ? Boolean(is_active) : true,
      },
    });

    return success(res, {
      message: "Customer berhasil didaftarkan",
      data: newCustomer,
      status: 201,
    });
  } catch (err) {
    return error(res, {
      message: "Gagal mendaftarkan customer",
      status: 500,
      errors: err.message,
    });
  }
};

// ─────────────────────────────────────────────────────────────
// 🔹 GET ALL CUSTOMERS
// ─────────────────────────────────────────────────────────────
const getCustomers = async (req, res) => {
  try {
    const { search, member_level, is_active } = req.query;

    const where = {};
    if (member_level) where.member_level = member_level;
    if (is_active !== undefined) {
      where.is_active = is_active === "true" || is_active === "1";
    }

    let data = await customer.findMany({ where });

    if (search && search.trim()) {
      const kw = search.trim().toLowerCase();
      data = data.filter(
        (c) =>
          c.name.toLowerCase().includes(kw) ||
          (c.phone && c.phone.includes(kw)) ||
          (c.email && c.email.toLowerCase().includes(kw)) ||
          (c.member_code && c.member_code.toLowerCase().includes(kw))
      );
    }

    return success(res, { message: "List customer", data });
  } catch (err) {
    return error(res, {
      message: "Gagal mengambil data customer",
      status: 500,
      errors: err.message,
    });
  }
};

// ─────────────────────────────────────────────────────────────
// 🔹 GET CUSTOMER BY ID / member_code / phone
// ─────────────────────────────────────────────────────────────
const getCustomerById = async (req, res) => {
  try {
    const { id } = req.params;

    let data = await customer.findUnique({ where: { id } });

    if (!data) data = await customer.findUnique({ where: { member_code: id } });
    if (!data) data = await customer.findUnique({ where: { phone: id } });

    if (!data) {
      return error(res, { message: "Customer tidak ditemukan", status: 404 });
    }

    // Ambil riwayat transaksi customer
    const history = await transaction.findMany({ where: { customer_id: data.id } });

    return success(res, {
      message: "Detail customer",
      data: { ...data, transaction_history: history },
    });
  } catch (err) {
    return error(res, {
      message: "Gagal mengambil detail customer",
      status: 500,
      errors: err.message,
    });
  }
};

// ─────────────────────────────────────────────────────────────
// 🔹 UPDATE CUSTOMER
// ─────────────────────────────────────────────────────────────
const updateCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, email, address, gender, birth_date, is_active } = req.body;

    const existing = await customer.findUnique({ where: { id } });
    if (!existing) {
      return error(res, { message: "Customer tidak ditemukan", status: 404 });
    }

    const updateData = {};

    if (name !== undefined && name.trim() !== "") updateData.name = name.trim();
    if (address !== undefined) updateData.address = address;
    if (gender !== undefined) updateData.gender = gender;
    if (birth_date !== undefined) updateData.birth_date = birth_date;
    if (is_active !== undefined) updateData.is_active = Boolean(is_active);

    // Cek duplikasi phone (jika berubah)
    if (phone !== undefined && phone !== existing.phone) {
      if (phone) {
        const dup = await customer.findUnique({ where: { phone } });
        if (dup && dup.id !== id) {
          return error(res, { message: "Nomor HP sudah digunakan customer lain", status: 409 });
        }
      }
      updateData.phone = phone || null;
    }

    // Cek duplikasi email (jika berubah)
    if (email !== undefined && email !== existing.email) {
      if (email) {
        const dup = await customer.findUnique({ where: { email: email.toLowerCase().trim() } });
        if (dup && dup.id !== id) {
          return error(res, { message: "Email sudah digunakan customer lain", status: 409 });
        }
      }
      updateData.email = email ? email.toLowerCase().trim() : null;
    }

    if (Object.keys(updateData).length > 0) {
      await customer.update({ where: { id }, data: updateData });
    }

    const updated = await customer.findUnique({ where: { id } });

    return success(res, { message: "Customer berhasil diupdate", data: updated });
  } catch (err) {
    return error(res, {
      message: "Gagal update customer",
      status: 500,
      errors: err.message,
    });
  }
};

// ─────────────────────────────────────────────────────────────
// 🔹 TAMBAH POIN & UPDATE TOTAL SPENDING (dipanggil setelah transaksi)
// ─────────────────────────────────────────────────────────────
const addPoints = async (req, res) => {
  try {
    const { id } = req.params;
    const { points_to_add = 0, spending_to_add = 0 } = req.body;

    const existing = await customer.findUnique({ where: { id } });
    if (!existing) {
      return error(res, { message: "Customer tidak ditemukan", status: 404 });
    }

    const newPoints = Number(existing.points) + Number(points_to_add);
    const newSpending = Number(existing.total_spending) + Number(spending_to_add);
    const newLevel = resolveMemberLevel(newSpending);

    await customer.update({
      where: { id },
      data: {
        points: newPoints,
        total_spending: newSpending,
        member_level: newLevel,
      },
    });

    const updated = await customer.findUnique({ where: { id } });

    return success(res, {
      message: "Poin & spending berhasil diupdate",
      data: updated,
    });
  } catch (err) {
    return error(res, {
      message: "Gagal update poin customer",
      status: 500,
      errors: err.message,
    });
  }
};

// ─────────────────────────────────────────────────────────────
// 🔹 REDEEM POIN
// ─────────────────────────────────────────────────────────────
const redeemPoints = async (req, res) => {
  try {
    const { id } = req.params;
    const { points_to_redeem } = req.body;

    if (!points_to_redeem || Number(points_to_redeem) <= 0) {
      return error(res, { message: "points_to_redeem wajib > 0", status: 400 });
    }

    const existing = await customer.findUnique({ where: { id } });
    if (!existing) {
      return error(res, { message: "Customer tidak ditemukan", status: 404 });
    }

    if (Number(existing.points) < Number(points_to_redeem)) {
      return error(res, {
        message: `Poin tidak cukup. Sisa poin: ${existing.points}`,
        status: 400,
      });
    }

    const newPoints = Number(existing.points) - Number(points_to_redeem);
    await customer.update({ where: { id }, data: { points: newPoints } });

    const updated = await customer.findUnique({ where: { id } });

    return success(res, {
      message: `${points_to_redeem} poin berhasil diredeem`,
      data: updated,
    });
  } catch (err) {
    return error(res, {
      message: "Gagal redeem poin",
      status: 500,
      errors: err.message,
    });
  }
};

// ─────────────────────────────────────────────────────────────
// 🔹 DELETE CUSTOMER
// ─────────────────────────────────────────────────────────────
const deleteCustomer = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await customer.findUnique({ where: { id } });
    if (!existing) {
      return error(res, { message: "Customer tidak ditemukan", status: 404 });
    }

    await customer.delete({ where: { id } });

    return success(res, { message: "Customer berhasil dihapus" });
  } catch (err) {
    return error(res, {
      message: "Gagal hapus customer",
      status: 500,
      errors: err.message,
    });
  }
};

module.exports = {
  createCustomer,
  getCustomers,
  getCustomerById,
  updateCustomer,
  addPoints,
  redeemPoints,
  deleteCustomer,
};
