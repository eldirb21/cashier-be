module.exports = {
  name: "001_create_users",

  up: async (db) => {
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE,
        phone VARCHAR(20) UNIQUE,
        password TEXT NOT NULL,
        role ENUM(
          'CUSTOMER',
          'CASHIER',
          'ADMIN',
          'SPV',
          'MANAGER',
          'OWNER',
          'OTHER'
        ) NOT NULL DEFAULT 'CUSTOMER',
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
    `);

    // Buat index jika belum ada
    const [indexes] = await db.query(`
      SHOW INDEX FROM users
      WHERE Key_name = 'idx_users_role';
    `);

    if (indexes.length === 0) {
      await db.query(`
        CREATE INDEX idx_users_role ON users(role);
      `);

      console.log("✅ idx_users_role dibuat");
    } else {
      console.log("⏭️ idx_users_role sudah ada");
    }
  },

  down: async (db) => {
    await db.query(`DROP TABLE IF EXISTS users;`);
  },
};
