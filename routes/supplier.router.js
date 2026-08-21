const express = require("express");
const { authenticate, authorize } = require("../src/middleware/authenticate");
const { ROLE } = require("../src/libs/enum");
const ctrl = require("../src/controllers/supplier.controller");

const router = express.Router();

// ➕ Tambah supplier baru
router.post(
  "/",
  authenticate,
  authorize(ROLE.ADMIN, ROLE.MANAGER, ROLE.OWNER),
  ctrl.createSupplier
);

// 📋 List semua supplier (filter: search, is_active, city, province)
router.get("/", authenticate, ctrl.getSuppliers);

// 🔍 Detail by ID atau code — termasuk daftar produk terhubung
router.get("/:id", authenticate, ctrl.getSupplierById);

// ✏️ Update supplier
router.put(
  "/:id",
  authenticate,
  authorize(ROLE.ADMIN, ROLE.MANAGER, ROLE.OWNER),
  ctrl.updateSupplier
);

// ❌ Delete supplier (gagal jika masih ada produk terhubung)
router.delete(
  "/:id",
  authenticate,
  authorize(ROLE.ADMIN, ROLE.OWNER),
  ctrl.deleteSupplier
);

module.exports = router;