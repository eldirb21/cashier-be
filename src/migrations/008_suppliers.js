module.exports = {
  name: "008_suppliers",

  up: async (db) => {
    // =========================
    // SUPPLIERS TABLE
    // =========================
    await db.query(`
      CREATE TABLE IF NOT EXISTS suppliers (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(150) NOT NULL,
        code VARCHAR(50) UNIQUE,
        contact_person VARCHAR(100),
        phone VARCHAR(20),
        email VARCHAR(150),
        address TEXT,
        city VARCHAR(100),
        province VARCHAR(100),
        bank_name VARCHAR(100),
        bank_account_number VARCHAR(50),
        bank_account_name VARCHAR(100),
        notes TEXT,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
    `);

    // =========================
    // INDEX CODE
    // =========================
    const [codeIndex] = await db.query(`
      SHOW INDEX FROM suppliers
      WHERE Key_name = 'idx_suppliers_code';
    `);

    if (codeIndex.length === 0) {
      await db.query(`
        CREATE INDEX idx_suppliers_code
        ON suppliers(code);
      `);

      console.log("✅ idx_suppliers_code dibuat");
    } else {
      console.log("⏭️ idx_suppliers_code sudah ada");
    }

    // =========================
    // INDEX NAME
    // =========================
    const [nameIndex] = await db.query(`
      SHOW INDEX FROM suppliers
      WHERE Key_name = 'idx_suppliers_name';
    `);

    if (nameIndex.length === 0) {
      await db.query(`
        CREATE INDEX idx_suppliers_name
        ON suppliers(name);
      `);

      console.log("✅ idx_suppliers_name dibuat");
    } else {
      console.log("⏭️ idx_suppliers_name sudah ada");
    }

    // =========================
    // INDEX IS ACTIVE
    // =========================
    const [activeIndex] = await db.query(`
      SHOW INDEX FROM suppliers
      WHERE Key_name = 'idx_suppliers_is_active';
    `);

    if (activeIndex.length === 0) {
      await db.query(`
        CREATE INDEX idx_suppliers_is_active
        ON suppliers(is_active);
      `);

      console.log("✅ idx_suppliers_is_active dibuat");
    } else {
      console.log("⏭️ idx_suppliers_is_active sudah ada");
    }
  },

  down: async (db) => {
    await db.query(`DROP TABLE IF EXISTS suppliers;`);
  },
};
