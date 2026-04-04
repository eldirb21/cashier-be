module.exports = {
  name: "002_create_refresh_tokens",

  up: async (db) => {
    await db.query(`
      CREATE TABLE refresh_tokens (
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

    await db.query(`
      CREATE INDEX idx_refresh_tokens_user_id
      ON refresh_tokens(user_id);
    `);

    await db.query(`
      CREATE INDEX idx_refresh_tokens_token
      ON refresh_tokens(token(255));
    `);
  },

  down: async (db) => {
    await db.query(`DROP TABLE IF EXISTS refresh_tokens;`);
  },
};