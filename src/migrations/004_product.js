module.exports = {
  name: "001_create_products",

  up: async (db) => {
    await db.query(`
      CREATE TABLE products (
        id VARCHAR(50) PRIMARY KEY,
        category_id VARCHAR(50),
        supplier_id VARCHAR(50),
        name VARCHAR(150) NOT NULL,
        barcode VARCHAR(100) UNIQUE,
        price DECIMAL(12,2) NOT NULL,
        cost_price DECIMAL(12,2) NOT NULL,
        stock INT DEFAULT 0,
        min_stock INT DEFAULT 0,
        img_url TEXT,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
    `);

    // -- INDEX biar query cepat
    await db.query(`
      CREATE INDEX idx_products_category ON products(category_id);
    `);

    await db.query(`
      CREATE INDEX idx_products_supplier ON products(supplier_id);
    `);
  },

  down: async (db) => {
    await db.query(`DROP TABLE IF EXISTS products;`);
  },
};
