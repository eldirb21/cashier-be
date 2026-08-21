module.exports = {
  name: "transactions",

  run: async (db) => {
    // Ambil user kasir / admin
    const [cashiers] = await db.query(
      "SELECT id FROM users WHERE role = 'CASHIER' LIMIT 1"
    );
    const [admins] = await db.query(
      "SELECT id FROM users WHERE role = 'ADMIN' LIMIT 1"
    );

    const cashierId = cashiers[0]?.id || admins[0]?.id || 1;

    const sampleTransactions = [
      {
        id: "TRX-SEED-001",
        customer_id: "CUST-001",
        user_id: cashierId,
        invoice_number: "TRX-20260820-10001",
        total_amount: 18500,
        discount: 0,
        tax: 0,
        grand_total: 18500,
        payment_method: "cash",
        payment_amount: 20000,
        change_amount: 1500,
        status: "completed",
        notes: "Pelanggan bayar cash",
        items: [
          {
            id: "ITEM-SEED-001",
            product_id: "PROD-001",
            product_name: "Indomie Goreng Spesial 85g",
            price: 3500,
            cost_price: 2800,
            qty: 3,
            discount: 0,
            subtotal: 10500,
          },
          {
            id: "ITEM-SEED-002",
            product_id: "PROD-003",
            product_name: "Aqua Air Mineral Botol 600ml",
            price: 4000,
            cost_price: 2700,
            qty: 2,
            discount: 0,
            subtotal: 8000,
          },
        ],
      },
      {
        id: "TRX-SEED-002",
        customer_id: "CUST-002",
        user_id: cashierId,
        invoice_number: "TRX-20260820-10002",
        total_amount: 108000,
        discount: 5000,
        tax: 0,
        grand_total: 103000,
        payment_method: "qris",
        payment_amount: 103000,
        change_amount: 0,
        status: "completed",
        notes: "Diskon voucher member silver Rp 5.000",
        items: [
          {
            id: "ITEM-SEED-003",
            product_id: "PROD-007",
            product_name: "Beras Ramos Premium 5kg",
            price: 72000,
            cost_price: 65000,
            qty: 1,
            discount: 0,
            subtotal: 72000,
          },
          {
            id: "ITEM-SEED-004",
            product_id: "PROD-008",
            product_name: "Minyak Goreng Bimoli Pouch 2L",
            price: 36000,
            cost_price: 32000,
            qty: 1,
            discount: 0,
            subtotal: 36000,
          },
        ],
      },
      {
        id: "TRX-SEED-003",
        customer_id: "CUST-003",
        user_id: cashierId,
        invoice_number: "TRX-20260821-10003",
        total_amount: 50500,
        discount: 0,
        tax: 0,
        grand_total: 50500,
        payment_method: "transfer",
        payment_amount: 50500,
        change_amount: 0,
        status: "completed",
        notes: "Pembayaran via transfer BCA",
        items: [
          {
            id: "ITEM-SEED-005",
            product_id: "PROD-006",
            product_name: "Chitato Sapi Panggang 68g",
            price: 11500,
            cost_price: 9500,
            qty: 2,
            discount: 0,
            subtotal: 23000,
          },
          {
            id: "ITEM-SEED-006",
            product_id: "PROD-004",
            product_name: "Teh Botol Sosro Original 350ml",
            price: 5000,
            cost_price: 3800,
            qty: 3,
            discount: 0,
            subtotal: 15000,
          },
          {
            id: "ITEM-SEED-007",
            product_id: "PROD-005",
            product_name: "Kopi Kapal Api Special Mix 24g",
            price: 2500,
            cost_price: 1700,
            qty: 5,
            discount: 0,
            subtotal: 12500,
          },
        ],
      },
    ];

    for (const trx of sampleTransactions) {
      await db.query(
        `
        INSERT INTO transactions (
          id, customer_id, user_id, invoice_number, total_amount,
          discount, tax, grand_total, payment_method, payment_amount,
          change_amount, status, notes
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          customer_id = VALUES(customer_id),
          user_id = VALUES(user_id),
          total_amount = VALUES(total_amount),
          discount = VALUES(discount),
          tax = VALUES(tax),
          grand_total = VALUES(grand_total),
          payment_method = VALUES(payment_method),
          payment_amount = VALUES(payment_amount),
          change_amount = VALUES(change_amount),
          status = VALUES(status),
          notes = VALUES(notes)
        `,
        [
          trx.id,
          trx.customer_id,
          trx.user_id,
          trx.invoice_number,
          trx.total_amount,
          trx.discount,
          trx.tax,
          trx.grand_total,
          trx.payment_method,
          trx.payment_amount,
          trx.change_amount,
          trx.status,
          trx.notes,
        ]
      );

      for (const item of trx.items) {
        await db.query(
          `
          INSERT INTO transaction_items (
            id, transaction_id, product_id, product_name,
            price, cost_price, qty, discount, subtotal
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE
            product_id = VALUES(product_id),
            product_name = VALUES(product_name),
            price = VALUES(price),
            cost_price = VALUES(cost_price),
            qty = VALUES(qty),
            discount = VALUES(discount),
            subtotal = VALUES(subtotal)
          `,
          [
            item.id,
            trx.id,
            item.product_id,
            item.product_name,
            item.price,
            item.cost_price,
            item.qty,
            item.discount,
            item.subtotal,
          ]
        );
      }
    }

    console.log(`✅ ${sampleTransactions.length} transactions & items seeded`);
  },
};
