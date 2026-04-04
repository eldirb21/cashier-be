module.exports = {
  name: "001_create_users",

  up: async (db) => {
    await db.query(`
      CREATE TABLE users (
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

    // 🚀 INDEX (optional tapi bagus)
    await db.query(`
      CREATE INDEX idx_users_role ON users(role);
    `);
  },

  down: async (db) => {
    await db.query(`DROP TABLE IF EXISTS users;`);
  },
};