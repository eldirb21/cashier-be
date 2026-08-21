module.exports = {
  name: "002_create_refresh_tokens",

  up: async (db) => {
    // Buat table jika belum ada
    await db.query(`
      CREATE TABLE IF NOT EXISTS refresh_tokens (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        user_id BIGINT UNSIGNED NOT NULL,
        token TEXT NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

        CONSTRAINT fk_refresh_tokens_user
          FOREIGN KEY(user_id)
          REFERENCES users(id)
          ON DELETE CASCADE
      );
    `);

    // Index user_id
    const [userIdIndexes] = await db.query(`
      SHOW INDEX FROM refresh_tokens
      WHERE Key_name = 'idx_refresh_tokens_user_id';
    `);

    if (userIdIndexes.length === 0) {
      await db.query(`
        CREATE INDEX idx_refresh_tokens_user_id
        ON refresh_tokens(user_id);
      `);

      console.log("✅ idx_refresh_tokens_user_id dibuat");
    } else {
      console.log("⏭️ idx_refresh_tokens_user_id sudah ada");
    }

    // Index token
    const [tokenIndexes] = await db.query(`
      SHOW INDEX FROM refresh_tokens
      WHERE Key_name = 'idx_refresh_tokens_token';
    `);

    if (tokenIndexes.length === 0) {
      await db.query(`
        CREATE INDEX idx_refresh_tokens_token
        ON refresh_tokens(token(255));
      `);

      console.log("✅ idx_refresh_tokens_token dibuat");
    } else {
      console.log("⏭️ idx_refresh_tokens_token sudah ada");
    }
  },

  down: async (db) => {
    await db.query(`DROP TABLE IF EXISTS refresh_tokens;`);
  },
};
