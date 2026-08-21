module.exports = {
  name: "005_transactions",

  up: async (db) => {
    await db.query(`
      CREATE TABLE transactions (
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

    await db.query(`
      CREATE TABLE transaction_items (
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

    // -- INDEX biar query cepat
    await db.query(`
      CREATE INDEX idx_transactions_customer ON transactions(customer_id);
    `);

    await db.query(`
      CREATE INDEX idx_transactions_user ON transactions(user_id);
    `);

    await db.query(`
      CREATE INDEX idx_transactions_status ON transactions(status);
    `);

    await db.query(`
      CREATE INDEX idx_transaction_items_transaction ON transaction_items(transaction_id);
    `);

    await db.query(`
      CREATE INDEX idx_transaction_items_product ON transaction_items(product_id);
    `);
  },

  down: async (db) => {
    await db.query(`DROP TABLE IF EXISTS transaction_items;`);
    await db.query(`DROP TABLE IF EXISTS transactions;`);
  },
};
