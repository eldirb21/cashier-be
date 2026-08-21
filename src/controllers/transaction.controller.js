const { transaction, transactionItem, product } = require("../models");
const { query } = require("../config/db");
const { success, error } = require("../utils/response");

// 🔹 Generate invoice number  →  TRX-YYYYMMDD-XXXXX
const generateInvoice = () => {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, "");
  const rand = Math.floor(10000 + Math.random() * 90000);
  return `TRX-${date}-${rand}`;
};

// ─────────────────────────────────────────────────────────────
// 🔹 CREATE TRANSACTION
// ─────────────────────────────────────────────────────────────
const createTransaction = async (req, res) => {
  try {
    const {
      id,
      customer_id,
      items,            // Array: [{ product_id, qty, discount }]
      discount = 0,
      tax = 0,
      payment_method = "cash",
      payment_amount,
      notes,
    } = req.body;

    const user_id = req.user.id;

    // Validasi wajib
    if (!items || !Array.isArray(items) || items.length === 0) {
      return error(res, { message: "Items transaksi wajib diisi", status: 400 });
    }
    if (payment_amount === undefined || payment_amount === null) {
      return error(res, { message: "payment_amount wajib diisi", status: 400 });
    }

    // Hitung total dari setiap item
    let total_amount = 0;
    const itemRows = [];

    for (const item of items) {
      if (!item.product_id || !item.qty || item.qty < 1) {
        return error(res, {
          message: "Setiap item harus punya product_id dan qty >= 1",
          status: 400,
        });
      }

      const prod = await product.findUnique({ where: { id: item.product_id } });
      if (!prod) {
        return error(res, {
          message: `Product '${item.product_id}' tidak ditemukan`,
          status: 404,
        });
      }

      const itemDiscount = Number(item.discount || 0);
      const subtotal = (Number(prod.price) * item.qty) - itemDiscount;

      total_amount += subtotal;
      itemRows.push({
        product_id: prod.id,
        product_name: prod.name,
        price: prod.price,
        cost_price: prod.cost_price,
        qty: item.qty,
        discount: itemDiscount,
        subtotal,
      });
    }

    const grand_total = total_amount - Number(discount) + Number(tax);
    const change_amount = Number(payment_amount) - grand_total;

    if (change_amount < 0) {
      return error(res, {
        message: "Jumlah bayar kurang dari grand total",
        status: 400,
      });
    }

    const trxId = id && id.trim() ? id.trim() : `TRX-${Date.now()}`;
    const invoice_number = generateInvoice();

    // Simpan header transaksi
    await transaction.create({
      data: {
        id: trxId,
        customer_id: customer_id || null,
        user_id,
        invoice_number,
        total_amount,
        discount: Number(discount),
        tax: Number(tax),
        grand_total,
        payment_method,
        payment_amount: Number(payment_amount),
        change_amount,
        status: "completed",
        notes: notes || null,
      },
    });

    // Simpan setiap item
    for (const item of itemRows) {
      await transactionItem.create({
        data: {
          id: `ITEM-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          transaction_id: trxId,
          ...item,
        },
      });
    }

    // Ambil data lengkap untuk response
    const newTrx = await transaction.findUnique({ where: { id: trxId } });
    const newItems = await transactionItem.findMany({ where: { transaction_id: trxId } });

    return success(res, {
      message: "Transaksi berhasil dibuat",
      data: { ...newTrx, items: newItems },
      status: 201,
    });
  } catch (err) {
    return error(res, {
      message: "Gagal membuat transaksi",
      status: 500,
      errors: err.message,
    });
  }
};

// ─────────────────────────────────────────────────────────────
// 🔹 GET ALL TRANSACTIONS
// ─────────────────────────────────────────────────────────────
const getTransactions = async (req, res) => {
  try {
    const { status, payment_method, customer_id, user_id, search } = req.query;

    const where = {};
    if (status) where.status = status;
    if (payment_method) where.payment_method = payment_method;
    if (customer_id) where.customer_id = customer_id;
    if (user_id) where.user_id = user_id;

    let data = await transaction.findMany({ where });

    // Filter by invoice number via search
    if (search && search.trim()) {
      const keyword = search.trim().toLowerCase();
      data = data.filter(
        (t) =>
          t.invoice_number.toLowerCase().includes(keyword) ||
          (t.notes && t.notes.toLowerCase().includes(keyword))
      );
    }

    return success(res, {
      message: "List transaksi",
      data,
    });
  } catch (err) {
    return error(res, {
      message: "Gagal mengambil data transaksi",
      status: 500,
      errors: err.message,
    });
  }
};

// ─────────────────────────────────────────────────────────────
// 🔹 GET TRANSACTION BY ID (with items)
// ─────────────────────────────────────────────────────────────
const getTransactionById = async (req, res) => {
  try {
    const { id } = req.params;

    let data = await transaction.findUnique({ where: { id } });

    // Coba juga cari by invoice_number
    if (!data) {
      data = await transaction.findFirst({ where: { invoice_number: id } });
    }

    if (!data) {
      return error(res, { message: "Transaksi tidak ditemukan", status: 404 });
    }

    const items = await transactionItem.findMany({ where: { transaction_id: data.id } });

    return success(res, {
      message: "Detail transaksi",
      data: { ...data, items },
    });
  } catch (err) {
    return error(res, {
      message: "Gagal mengambil detail transaksi",
      status: 500,
      errors: err.message,
    });
  }
};

// ─────────────────────────────────────────────────────────────
// 🔹 UPDATE STATUS TRANSACTION (cancel / re-open)
// ─────────────────────────────────────────────────────────────
const updateTransactionStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const VALID_STATUS = ["pending", "completed", "cancelled"];
    if (!status || !VALID_STATUS.includes(status)) {
      return error(res, {
        message: `Status harus salah satu dari: ${VALID_STATUS.join(", ")}`,
        status: 400,
      });
    }

    const existing = await transaction.findUnique({ where: { id } });
    if (!existing) {
      return error(res, { message: "Transaksi tidak ditemukan", status: 404 });
    }

    const updateData = { status };
    if (notes !== undefined) updateData.notes = notes;

    await transaction.update({ where: { id }, data: updateData });

    const updated = await transaction.findUnique({ where: { id } });
    const items = await transactionItem.findMany({ where: { transaction_id: id } });

    return success(res, {
      message: "Status transaksi berhasil diupdate",
      data: { ...updated, items },
    });
  } catch (err) {
    return error(res, {
      message: "Gagal update status transaksi",
      status: 500,
      errors: err.message,
    });
  }
};

// ─────────────────────────────────────────────────────────────
// 🔹 DELETE TRANSACTION
// ─────────────────────────────────────────────────────────────
const deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await transaction.findUnique({ where: { id } });
    if (!existing) {
      return error(res, { message: "Transaksi tidak ditemukan", status: 404 });
    }

    // Hapus items dulu baru header
    await transactionItem.deleteMany({ where: { transaction_id: id } });
    await transaction.delete({ where: { id } });

    return success(res, { message: "Transaksi berhasil dihapus" });
  } catch (err) {
    return error(res, {
      message: "Gagal hapus transaksi",
      status: 500,
      errors: err.message,
    });
  }
};

// ─────────────────────────────────────────────────────────────
// 🔹 SUMMARY / REKAP (total penjualan, jumlah transaksi)
// ─────────────────────────────────────────────────────────────
const getTransactionSummary = async (req, res) => {
  try {
    const { date_from, date_to } = req.query;

    let whereSql = `WHERE status = 'completed'`;
    const params = [];

    if (date_from) {
      whereSql += ` AND DATE(created_at) >= ?`;
      params.push(date_from);
    }
    if (date_to) {
      whereSql += ` AND DATE(created_at) <= ?`;
      params.push(date_to);
    }

    const [summary] = await query(
      `SELECT
         COUNT(*) AS total_transactions,
         COALESCE(SUM(grand_total), 0) AS total_revenue,
         COALESCE(SUM(discount), 0) AS total_discount,
         COALESCE(SUM(tax), 0) AS total_tax,
         COALESCE(AVG(grand_total), 0) AS avg_transaction
       FROM transactions
       ${whereSql}`,
      params
    );

    const byMethod = await query(
      `SELECT payment_method, COUNT(*) AS count, SUM(grand_total) AS total
       FROM transactions
       ${whereSql}
       GROUP BY payment_method`,
      params
    );

    return success(res, {
      message: "Rekap transaksi",
      data: { summary, by_payment_method: byMethod },
    });
  } catch (err) {
    return error(res, {
      message: "Gagal mengambil rekap transaksi",
      status: 500,
      errors: err.message,
    });
  }
};

module.exports = {
  createTransaction,
  getTransactions,
  getTransactionById,
  updateTransactionStatus,
  deleteTransaction,
  getTransactionSummary,
};
