const { category } = require("../models");
const { success, error } = require("../utils/response");

// Helper untuk buat slug dari string nama
const generateSlug = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
};

// 🔹 CREATE CATEGORY
const createCategory = async (req, res) => {
  try {
    const { id, name, description, slug, is_active } = req.body;

    if (!name || !name.trim()) {
      return error(res, {
        message: "Nama kategori wajib diisi",
        status: 400,
      });
    }

    const catId = id && id.trim() ? id.trim() : `CAT-${Date.now()}`;
    const catSlug = slug && slug.trim() ? generateSlug(slug) : generateSlug(name);

    // Cek duplikasi ID
    const existingId = await category.findUnique({ where: { id: catId } });
    if (existingId) {
      return error(res, {
        message: "ID Kategori sudah digunakan",
        status: 409,
      });
    }

    // Cek duplikasi slug
    if (catSlug) {
      const existingSlug = await category.findUnique({ where: { slug: catSlug } });
      if (existingSlug) {
        return error(res, {
          message: "Slug kategori sudah digunakan",
          status: 409,
        });
      }
    }

    const newCategory = await category.create({
      data: {
        id: catId,
        name: name.trim(),
        description: description || null,
        slug: catSlug,
        is_active: is_active !== undefined ? Boolean(is_active) : true,
      },
    });

    return success(res, {
      message: "Kategori berhasil dibuat",
      data: newCategory,
      status: 201,
    });
  } catch (err) {
    return error(res, {
      message: "Gagal membuat kategori",
      status: 500,
      errors: err.message,
    });
  }
};

// 🔹 GET ALL CATEGORIES
const getCategories = async (req, res) => {
  try {
    const { search, is_active } = req.query;

    const where = {};
    if (is_active !== undefined) {
      where.is_active = is_active === "true" || is_active === "1";
    }

    let data = await category.findMany({ where });

    if (search && search.trim()) {
      const keyword = search.trim().toLowerCase();
      data = data.filter(
        (c) =>
          c.name.toLowerCase().includes(keyword) ||
          (c.description && c.description.toLowerCase().includes(keyword)) ||
          (c.slug && c.slug.toLowerCase().includes(keyword))
      );
    }

    return success(res, {
      message: "List kategori berhasil diambil",
      data,
    });
  } catch (err) {
    return error(res, {
      message: "Gagal mengambil data kategori",
      status: 500,
      errors: err.message,
    });
  }
};

// 🔹 GET CATEGORY BY ID
const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;

    let data = await category.findUnique({ where: { id } });

    // Jika tidak ketemu berdasarkan ID, coba cari via slug
    if (!data) {
      data = await category.findUnique({ where: { slug: id } });
    }

    if (!data) {
      return error(res, {
        message: "Kategori tidak ditemukan",
        status: 404,
      });
    }

    return success(res, {
      message: "Detail kategori",
      data,
    });
  } catch (err) {
    return error(res, {
      message: "Gagal mengambil detail kategori",
      status: 500,
      errors: err.message,
    });
  }
};

// 🔹 UPDATE CATEGORY
const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, slug, is_active } = req.body;

    const existing = await category.findUnique({ where: { id } });
    if (!existing) {
      return error(res, {
        message: "Kategori tidak ditemukan",
        status: 404,
      });
    }

    const updateData = {};
    if (name !== undefined && name.trim() !== "") {
      updateData.name = name.trim();
    }
    if (description !== undefined) {
      updateData.description = description;
    }
    if (slug !== undefined) {
      const newSlug = generateSlug(slug);
      if (newSlug !== existing.slug) {
        const slugCheck = await category.findUnique({ where: { slug: newSlug } });
        if (slugCheck) {
          return error(res, {
            message: "Slug kategori sudah digunakan",
            status: 409,
          });
        }
        updateData.slug = newSlug;
      }
    } else if (name !== undefined && name.trim() !== existing.name) {
      const newSlug = generateSlug(name);
      if (newSlug !== existing.slug) {
        const slugCheck = await category.findUnique({ where: { slug: newSlug } });
        if (!slugCheck) {
          updateData.slug = newSlug;
        }
      }
    }

    if (is_active !== undefined) {
      updateData.is_active = Boolean(is_active);
    }

    if (Object.keys(updateData).length > 0) {
      await category.update({
        where: { id },
        data: updateData,
      });
    }

    const updated = await category.findUnique({ where: { id } });

    return success(res, {
      message: "Kategori berhasil diupdate",
      data: updated,
    });
  } catch (err) {
    return error(res, {
      message: "Gagal update kategori",
      status: 500,
      errors: err.message,
    });
  }
};

// 🔹 DELETE CATEGORY
const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await category.findUnique({ where: { id } });
    if (!existing) {
      return error(res, {
        message: "Kategori tidak ditemukan",
        status: 404,
      });
    }

    await category.delete({ where: { id } });

    return success(res, {
      message: "Kategori berhasil dihapus",
    });
  } catch (err) {
    return error(res, {
      message: "Gagal menghapus kategori",
      status: 500,
      errors: err.message,
    });
  }
};

module.exports = {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
};
