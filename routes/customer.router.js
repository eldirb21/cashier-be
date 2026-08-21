const express = require("express");
const { authenticate, authorize } = require("../src/middleware/authenticate");
const { ROLE } = require("../src/libs/enum");
const ctrl = require("../src/controllers/customer.controller");

const router = express.Router();

// ➕ Daftar member baru
router.post(
  "/",
  authenticate,
  authorize(ROLE.CASHIER, ROLE.ADMIN, ROLE.MANAGER, ROLE.OWNER, ROLE.SPV),
  ctrl.createCustomer
);

// 📋 List semua customer (filter: search, member_level, is_active)
router.get("/", authenticate, ctrl.getCustomers);

// 🔍 Detail by ID / member_code / phone
router.get("/:id", authenticate, ctrl.getCustomerById);

// ✏️ Update data customer
router.put(
  "/:id",
  authenticate,
  authorize(ROLE.CASHIER, ROLE.ADMIN, ROLE.MANAGER, ROLE.OWNER, ROLE.SPV),
  ctrl.updateCustomer
);

// 🎁 Tambah poin & spending setelah transaksi
router.patch(
  "/:id/points/add",
  authenticate,
  authorize(ROLE.CASHIER, ROLE.ADMIN, ROLE.MANAGER, ROLE.OWNER, ROLE.SPV),
  ctrl.addPoints
);

// 💸 Redeem poin
router.patch(
  "/:id/points/redeem",
  authenticate,
  authorize(ROLE.CASHIER, ROLE.ADMIN, ROLE.MANAGER, ROLE.OWNER, ROLE.SPV),
  ctrl.redeemPoints
);

// ❌ Delete customer — admin & owner saja
router.delete(
  "/:id",
  authenticate,
  authorize(ROLE.ADMIN, ROLE.OWNER),
  ctrl.deleteCustomer
);

module.exports = router;
