const { supplier, product } = require("../models");
const { success, error } = require("../utils/response");

// ─── Helper: generate supplier code ──────────────────────────
const generateSupplierCode = () => {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 5).toUpperCase();
  return `SUP-${ts}-${rand}`;
};

// ─────────────────────────────────────────────────────────────
// 🔹 CREATE SUPPLIER
// ─────────────────────────────────────────────────────────────
const createSupplier = async (req, res) => {
  try {
    const {
      id,
      name,
      code,
      contact_person,
      phone,
      email,
      address,
      city,
      province,
      bank_name,
      bank_account_number,
      bank_account_name,
      notes,
      is_active,
    } = req.body;

    if (!name || !name.trim()) {
      return error(res, { message: "Nama supplier wajib diisi", status: 400 });
    }

    const suppId = id && id.trim() ? id.trim() : `SUPP-${Date.now()}`;

    // Cek duplikasi ID
    const existingId = await supplier.findUnique({ where: { id: suppId } });
    if (existingId) {
      return error(res, { message: "ID supplier sudah digunakan", status: 409 });
    }

    // Cek duplikasi code
    const suppCode = code && code.trim() ? code.trim().toUpperCase() : generateSupplierCode();
    const existingCode = await supplier.findUnique({ where: { code: suppCode } });
    if (existingCode) {
      return error(res, { message: "Kode supplier sudah digunakan", status: 409 });
    }

    const newSupplier = await supplier.create({
      data: {
        id: suppId,
        name: name.trim(),
        code: suppCode,
        contact_person: contact_person || null,
        phone: phone || null,
        email: email ? email.toLowerCase().trim() : null,
        address: address || null,
        city: city || null,
        province: province || null,
        bank_name: bank_name || null,
        bank_account_number: bank_account_number || null,
        bank_account_name: bank_account_name || null,
        notes: notes || null,
        is_active: is_active !== undefined ? Boolean(is_active) : true,
      },
    });

    return success(res, {
      message: "Supplier berhasil ditambahkan",
      data: newSupplier,
      status: 201,
    });
  } catch (err) {
    return error(res, {
      message: "Gagal menambahkan supplier",
      status: 500,
      errors: err.message,
    });
  }
};

// ─────────────────────────────────────────────────────────────
// 🔹 GET ALL SUPPLIERS
// ─────────────────────────────────────────────────────────────
const getSuppliers = async (req, res) => {
  try {
    const { search, is_active, city, province } = req.query;

    const where = {};
    if (is_active !== undefined) {
      where.is_active = is_active === "true" || is_active === "1";
    }
    if (city) where.city = city;
    if (province) where.province = province;

    let data = await supplier.findMany({ where });

    if (search && search.trim()) {
      const kw = search.trim().toLowerCase();
      data = data.filter(
        (s) =>
          s.name.toLowerCase().includes(kw) ||
          (s.code && s.code.toLowerCase().includes(kw)) ||
          (s.contact_person && s.contact_person.toLowerCase().includes(kw)) ||
          (s.phone && s.phone.includes(kw)) ||
          (s.email && s.email.toLowerCase().includes(kw))
      );
    }

    return success(res, { message: "List supplier", data });
  } catch (err) {
    return error(res, {
      message: "Gagal mengambil data supplier",
      status: 500,
      errors: err.message,
    });
  }
};

// ─────────────────────────────────────────────────────────────
// 🔹 GET SUPPLIER BY ID / code
// ─────────────────────────────────────────────────────────────
const getSupplierById = async (req, res) => {
  try {
    const { id } = req.params;

    let data = await supplier.findUnique({ where: { id } });

    // Coba cari by code jika tidak ketemu by ID
    if (!data) data = await supplier.findUnique({ where: { code: id.toUpperCase() } });

    if (!data) {
      return error(res, { message: "Supplier tidak ditemukan", status: 404 });
    }

    // Ambil produk yang terhubung ke supplier ini
    const suppliedProducts = await product.findMany({ where: { supplier_id: data.id } });

    return success(res, {
      message: "Detail supplier",
      data: { ...data, products: suppliedProducts },
    });
  } catch (err) {
    return error(res, {
      message: "Gagal mengambil detail supplier",
      status: 500,
      errors: err.message,
    });
  }
};

// ─────────────────────────────────────────────────────────────
// 🔹 UPDATE SUPPLIER
// ─────────────────────────────────────────────────────────────
const updateSupplier = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name, code, contact_person, phone, email,
      address, city, province,
      bank_name, bank_account_number, bank_account_name,
      notes, is_active,
    } = req.body;

    const existing = await supplier.findUnique({ where: { id } });
    if (!existing) {
      return error(res, { message: "Supplier tidak ditemukan", status: 404 });
    }

    const updateData = {};

    if (name !== undefined && name.trim() !== "") updateData.name = name.trim();
    if (contact_person !== undefined) updateData.contact_person = contact_person;
    if (phone !== undefined) updateData.phone = phone;
    if (address !== undefined) updateData.address = address;
    if (city !== undefined) updateData.city = city;
    if (province !== undefined) updateData.province = province;
    if (bank_name !== undefined) updateData.bank_name = bank_name;
    if (bank_account_number !== undefined) updateData.bank_account_number = bank_account_number;
    if (bank_account_name !== undefined) updateData.bank_account_name = bank_account_name;
    if (notes !== undefined) updateData.notes = notes;
    if (is_active !== undefined) updateData.is_active = Boolean(is_active);

    // Cek duplikasi code (jika berubah)
    if (code !== undefined && code.trim().toUpperCase() !== existing.code) {
      const newCode = code.trim().toUpperCase();
      const dupCode = await supplier.findUnique({ where: { code: newCode } });
      if (dupCode && dupCode.id !== id) {
        return error(res, { message: "Kode supplier sudah digunakan", status: 409 });
      }
      updateData.code = newCode;
    }

    // Cek duplikasi email (jika berubah)
    if (email !== undefined && email.toLowerCase().trim() !== existing.email) {
      if (email) {
        const dupEmail = await supplier.findUnique({ where: { email: email.toLowerCase().trim() } });
        if (dupEmail && dupEmail.id !== id) {
          return error(res, { message: "Email sudah digunakan supplier lain", status: 409 });
        }
      }
      updateData.email = email ? email.toLowerCase().trim() : null;
    }

    if (Object.keys(updateData).length > 0) {
      await supplier.update({ where: { id }, data: updateData });
    }

    const updated = await supplier.findUnique({ where: { id } });

    return success(res, { message: "Supplier berhasil diupdate", data: updated });
  } catch (err) {
    return error(res, {
      message: "Gagal update supplier",
      status: 500,
      errors: err.message,
    });
  }
};

// ─────────────────────────────────────────────────────────────
// 🔹 DELETE SUPPLIER
// ─────────────────────────────────────────────────────────────
const deleteSupplier = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await supplier.findUnique({ where: { id } });
    if (!existing) {
      return error(res, { message: "Supplier tidak ditemukan", status: 404 });
    }

    // Cek apakah masih ada produk yang terhubung
    const linkedProducts = await product.findMany({ where: { supplier_id: id } });
    if (linkedProducts.length > 0) {
      return error(res, {
        message: `Supplier tidak bisa dihapus, masih terhubung ke ${linkedProducts.length} produk`,
        status: 409,
      });
    }

    await supplier.delete({ where: { id } });

    return success(res, { message: "Supplier berhasil dihapus" });
  } catch (err) {
    return error(res, {
      message: "Gagal hapus supplier",
      status: 500,
      errors: err.message,
    });
  }
};

module.exports = {
  createSupplier,
  getSuppliers,
  getSupplierById,
  updateSupplier,
  deleteSupplier,
};
