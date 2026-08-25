module.exports = {
  name: "010_cart",

  up: async (db) => {
    await db.query(`
      CREATE TABLE IF NOT EXISTS cart (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NULL,
        session_id VARCHAR(64) NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_user_id (user_id),
        INDEX idx_session_id (session_id)
      );
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS cart_item (
        id INT AUTO_INCREMENT PRIMARY KEY,
        cart_id INT NOT NULL,
        product_id VARCHAR(100) NOT NULL,
        qty INT NOT NULL DEFAULT 1,
        price_snapshot DECIMAL(12,2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (cart_id) REFERENCES cart(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
        UNIQUE KEY unique_cart_product (cart_id, product_id)
      );
    `);

    const [productIndex] = await db.query(`
      SHOW INDEX FROM cart_item
      WHERE Key_name = 'idx_product_id';
    `);

    if (productIndex.length === 0) {
      await db.query(`
        CREATE INDEX idx_product_id
        ON cart_item(product_id);
      `);
      console.log("✅ idx_product_id dibuat");
    } else {
      console.log("⏭️ idx_product_id sudah ada");
    }
  },

  down: async (db) => {
    await db.query(`DROP TABLE IF EXISTS cart_item;`);
    await db.query(`DROP TABLE IF EXISTS cart;`);
  },
};
