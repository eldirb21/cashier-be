module.exports = {
  name: "006_categories",

  up: async (db) => {
    // Buat table jika belum ada
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

    // Index name
    const [nameIndexes] = await db.query(`
      SHOW INDEX FROM categories
      WHERE Key_name = 'idx_categories_name';
    `);

    if (nameIndexes.length === 0) {
      await db.query(`
        CREATE INDEX idx_categories_name
        ON categories(name);
      `);

      console.log("✅ idx_categories_name dibuat");
    } else {
      console.log("⏭️ idx_categories_name sudah ada");
    }

    // Index is_active
    const [activeIndexes] = await db.query(`
      SHOW INDEX FROM categories
      WHERE Key_name = 'idx_categories_is_active';
    `);

    if (activeIndexes.length === 0) {
      await db.query(`
        CREATE INDEX idx_categories_is_active
        ON categories(is_active);
      `);

      console.log("✅ idx_categories_is_active dibuat");
    } else {
      console.log("⏭️ idx_categories_is_active sudah ada");
    }
  },

  down: async (db) => {
    await db.query(`DROP TABLE IF EXISTS categories;`);
  },
};
