module.exports = {
  name: "006_categories",

  up: async (db) => {
    await db.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        slug VARCHAR(100) UNIQUE,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
    `);

    await db.query(`
      CREATE INDEX idx_categories_name ON categories(name);
    `);

    await db.query(`
      CREATE INDEX idx_categories_is_active ON categories(is_active);
    `);
  },

  down: async (db) => {
    await db.query(`DROP TABLE IF EXISTS categories;`);
  },
};

