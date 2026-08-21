module.exports = {
  name: "005_transactions",

  up: async (db) => {
    // =========================
    // TRANSACTIONS
    // =========================
    await db.query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id VARCHAR(50) PRIMARY KEY,
        customer_id VARCHAR(50),
        user_id VARCHAR(50) NOT NULL,
        invoice_number VARCHAR(100) UNIQUE NOT NULL,
        total_amount DECIMAL(12,2) NOT NULL,
        discount DECIMAL(12,2) DEFAULT 0,
        tax DECIMAL(12,2) DEFAULT 0,
        grand_total DECIMAL(12,2) NOT NULL,
        payment_method ENUM('cash', 'transfer', 'qris', 'card') DEFAULT 'cash',
        payment_amount DECIMAL(12,2) NOT NULL,
        change_amount DECIMAL(12,2) DEFAULT 0,
        status ENUM('pending', 'completed', 'cancelled') DEFAULT 'completed',
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
    `);

    // =========================
    // TRANSACTION ITEMS
    // =========================
    await db.query(`
      CREATE TABLE IF NOT EXISTS transaction_items (
        id VARCHAR(50) PRIMARY KEY,
        transaction_id VARCHAR(50) NOT NULL,
        product_id VARCHAR(50) NOT NULL,
        product_name VARCHAR(150) NOT NULL,
        price DECIMAL(12,2) NOT NULL,
        cost_price DECIMAL(12,2) NOT NULL,
        qty INT NOT NULL,
        discount DECIMAL(12,2) DEFAULT 0,
        subtotal DECIMAL(12,2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // =========================
    // INDEX TRANSACTIONS
    // =========================

    const [customerIndex] = await db.query(`
      SHOW INDEX FROM transactions
      WHERE Key_name = 'idx_transactions_customer';
    `);

    if (customerIndex.length === 0) {
      await db.query(`
        CREATE INDEX idx_transactions_customer
        ON transactions(customer_id);
      `);

      console.log("✅ idx_transactions_customer dibuat");
    } else {
      console.log("⏭️ idx_transactions_customer sudah ada");
    }

    const [userIndex] = await db.query(`
      SHOW INDEX FROM transactions
      WHERE Key_name = 'idx_transactions_user';
    `);

    if (userIndex.length === 0) {
      await db.query(`
        CREATE INDEX idx_transactions_user
        ON transactions(user_id);
      `);

      console.log("✅ idx_transactions_user dibuat");
    } else {
      console.log("⏭️ idx_transactions_user sudah ada");
    }

    const [statusIndex] = await db.query(`
      SHOW INDEX FROM transactions
      WHERE Key_name = 'idx_transactions_status';
    `);

    if (statusIndex.length === 0) {
      await db.query(`
        CREATE INDEX idx_transactions_status
        ON transactions(status);
      `);

      console.log("✅ idx_transactions_status dibuat");
    } else {
      console.log("⏭️ idx_transactions_status sudah ada");
    }

    // =========================
    // INDEX TRANSACTION ITEMS
    // =========================

    const [transactionIndex] = await db.query(`
      SHOW INDEX FROM transaction_items
      WHERE Key_name = 'idx_transaction_items_transaction';
    `);

    if (transactionIndex.length === 0) {
      await db.query(`
        CREATE INDEX idx_transaction_items_transaction
        ON transaction_items(transaction_id);
      `);

      console.log("✅ idx_transaction_items_transaction dibuat");
    } else {
      console.log("⏭️ idx_transaction_items_transaction sudah ada");
    }

    const [productIndex] = await db.query(`
      SHOW INDEX FROM transaction_items
      WHERE Key_name = 'idx_transaction_items_product';
    `);

    if (productIndex.length === 0) {
      await db.query(`
        CREATE INDEX idx_transaction_items_product
        ON transaction_items(product_id);
      `);

      console.log("✅ idx_transaction_items_product dibuat");
    } else {
      console.log("⏭️ idx_transaction_items_product sudah ada");
    }
  },

  down: async (db) => {
    await db.query(`DROP TABLE IF EXISTS transaction_items;`);
    await db.query(`DROP TABLE IF EXISTS transactions;`);
  },
};
