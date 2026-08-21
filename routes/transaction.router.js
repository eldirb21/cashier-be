const express = require("express");
const { authenticate, authorize } = require("../src/middleware/authenticate");
const { ROLE } = require("../src/libs/enum");
const ctrl = require("../src/controllers/transaction.controller");

const router = express.Router();

// 📊 Rekap/Summary — letakkan di atas /:id agar tidak tertimpa
router.get("/summary", authenticate, ctrl.getTransactionSummary);

// ➕ Buat transaksi baru — semua role yang login boleh (kasir, admin, dll)
router.post(
  "/",
  authenticate,
  authorize(ROLE.CASHIER, ROLE.ADMIN, ROLE.MANAGER, ROLE.OWNER, ROLE.SPV),
  ctrl.createTransaction
);

// 📋 List semua transaksi
router.get("/", authenticate, ctrl.getTransactions);

// 🔍 Detail transaksi by ID atau invoice_number
router.get("/:id", authenticate, ctrl.getTransactionById);

// ✏️ Update status transaksi (cancel, dll)
router.patch(
  "/:id/status",
  authenticate,
  authorize(ROLE.ADMIN, ROLE.MANAGER, ROLE.OWNER, ROLE.SPV),
  ctrl.updateTransactionStatus
);

// ❌ Delete transaksi — admin & owner saja
router.delete(
  "/:id",
  authenticate,
  authorize(ROLE.ADMIN, ROLE.OWNER),
  ctrl.deleteTransaction
);

module.exports = router;
