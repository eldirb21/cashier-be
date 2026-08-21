module.exports = {
  name: "007_customers",

  up: async (db) => {
    await db.query(`
      CREATE TABLE customers (
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

    // -- INDEX biar query cepat
    await db.query(`
      CREATE INDEX idx_customers_phone ON customers(phone);
    `);

    await db.query(`
      CREATE INDEX idx_customers_email ON customers(email);
    `);

    await db.query(`
      CREATE INDEX idx_customers_member_code ON customers(member_code);
    `);

    await db.query(`
      CREATE INDEX idx_customers_member_level ON customers(member_level);
    `);
  },

  down: async (db) => {
    await db.query(`DROP TABLE IF EXISTS customers;`);
  },
};

