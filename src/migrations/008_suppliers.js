module.exports = {
  name: "008_suppliers",

  up: async (db) => {
    await db.query(`
      CREATE TABLE suppliers (
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

    // -- INDEX biar query cepat
    await db.query(`
      CREATE INDEX idx_suppliers_code ON suppliers(code);
    `);

    await db.query(`
      CREATE INDEX idx_suppliers_name ON suppliers(name);
    `);

    await db.query(`
      CREATE INDEX idx_suppliers_is_active ON suppliers(is_active);
    `);
  },

  down: async (db) => {
    await db.query(`DROP TABLE IF EXISTS suppliers;`);
  },
};

