module.exports = {
  name: "007_customers",

  up: async (db) => {
    // =========================
    // CUSTOMERS TABLE
    // =========================
    await db.query(`
      CREATE TABLE IF NOT EXISTS customers (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(150) NOT NULL,
        phone VARCHAR(20) UNIQUE,
        email VARCHAR(150) UNIQUE,
        address TEXT,
        gender ENUM('male', 'female', 'other') DEFAULT NULL,
        birth_date DATE DEFAULT NULL,
        member_code VARCHAR(50) UNIQUE,
        member_level ENUM('regular', 'silver', 'gold', 'platinum') DEFAULT 'regular',
        points INT DEFAULT 0,
        total_spending DECIMAL(14,2) DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
    `);

    // =========================
    // INDEX PHONE
    // =========================
    const [phoneIndex] = await db.query(`
      SHOW INDEX FROM customers
      WHERE Key_name = 'idx_customers_phone';
    `);

    if (phoneIndex.length === 0) {
      await db.query(`
        CREATE INDEX idx_customers_phone
        ON customers(phone);
      `);

      console.log("✅ idx_customers_phone dibuat");
    } else {
      console.log("⏭️ idx_customers_phone sudah ada");
    }

    // =========================
    // INDEX EMAIL
    // =========================
    const [emailIndex] = await db.query(`
      SHOW INDEX FROM customers
      WHERE Key_name = 'idx_customers_email';
    `);

    if (emailIndex.length === 0) {
      await db.query(`
        CREATE INDEX idx_customers_email
        ON customers(email);
      `);

      console.log("✅ idx_customers_email dibuat");
    } else {
      console.log("⏭️ idx_customers_email sudah ada");
    }

    // =========================
    // INDEX MEMBER CODE
    // =========================
    const [memberCodeIndex] = await db.query(`
      SHOW INDEX FROM customers
      WHERE Key_name = 'idx_customers_member_code';
    `);

    if (memberCodeIndex.length === 0) {
      await db.query(`
        CREATE INDEX idx_customers_member_code
        ON customers(member_code);
      `);

      console.log("✅ idx_customers_member_code dibuat");
    } else {
      console.log("⏭️ idx_customers_member_code sudah ada");
    }

    // =========================
    // INDEX MEMBER LEVEL
    // =========================
    const [memberLevelIndex] = await db.query(`
      SHOW INDEX FROM customers
      WHERE Key_name = 'idx_customers_member_level';
    `);

    if (memberLevelIndex.length === 0) {
      await db.query(`
        CREATE INDEX idx_customers_member_level
        ON customers(member_level);
      `);

      console.log("✅ idx_customers_member_level dibuat");
    } else {
      console.log("⏭️ idx_customers_member_level sudah ada");
    }
  },

  down: async (db) => {
    await db.query(`DROP TABLE IF EXISTS customers;`);
  },
};
