const { product } = require("../models");

// 🔹 CREATE PRODUCT
const createProduct = async (req, res) => {
  try {
    const {
      id,
      category_id,
      supplier_id,
      name,
      barcode,
      price,
      cost_price,
      stock,
      min_stock,
      img_url,
      is_active,
    } = req.body;

    if (!id || !name || !price || !cost_price) {
      return res.status(400).json({
        message: "id, name, price, cost_price wajib diisi",
      });
    }

    const newProduct = await product.create({
      id,
      category_id,
      supplier_id,
      name,
      barcode,
      price,
      cost_price,
      stock,
      min_stock,
      img_url,
      is_active,
    });

    return res.status(201).json({
      message: "Product berhasil dibuat",
      data: newProduct,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Gagal membuat product",
      error: err.message,
    });
  }
};

// 🔹 GET ALL PRODUCTS
const getProducts = async (req, res) => {
  try {
    const data = await product.findMany();

    return res.json({
      message: "List product",
      data,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Gagal mengambil data",
      error: err.message,
    });
  }
};

// 🔹 GET PRODUCT BY ID
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const data = await product.findFirst({ where: { id } });

    if (!data) {
      return res.status(404).json({
        message: "Product tidak ditemukan",
      });
    }

    return res.json({
      message: "Detail product",
      data,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Error ambil product",
      error: err.message,
    });
  }
};

// 🔹 UPDATE PRODUCT
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await product.findFirst({ where: { id } });
    if (!existing) {
      return res.status(404).json({
        message: "Product tidak ditemukan",
      });
    }

    await product.update({ where: { id }, data: req.body });

    const updated = await product.findUnique({ where: { id } });

    return res.json({
      message: "Product berhasil diupdate",
      data: updated,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Gagal update product",
      error: err.message,
    });
  }
};

// 🔹 DELETE PRODUCT
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await product.findFirst({ where: { id } });
    if (!existing) {
      return res.status(404).json({
        message: "Product tidak ditemukan",
      });
    }

    await product.delete({ where: { id } });

    return res.json({
      message: "Product berhasil dihapus",
    });
  } catch (err) {
    return res.status(500).json({
      message: "Gagal hapus product",
      error: err.message,
    });
  }
};

module.exports = {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};
