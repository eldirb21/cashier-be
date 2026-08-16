module.exports = {
  name: "009_add_google_fields",

  up: async (db) => {
    // Tambah kolom google_id dan avatar ke tabel users
    await db.query(`
      ALTER TABLE users
        ADD COLUMN google_id VARCHAR(255) UNIQUE DEFAULT NULL AFTER is_active,
        ADD COLUMN avatar VARCHAR(500) DEFAULT NULL AFTER google_id;
    `);

    // Buat password bisa NULL untuk user Google-only
    await db.query(`
      ALTER TABLE users
        MODIFY COLUMN password TEXT NULL;
    `);

    // Index untuk google_id agar lookup cepat
    await db.query(`
      CREATE INDEX idx_users_google_id ON users(google_id);
    `);
  },

  down: async (db) => {
    await db.query(`DROP INDEX idx_users_google_id ON users;`);
    await db.query(`
      ALTER TABLE users
        DROP COLUMN google_id,
        DROP COLUMN avatar;
    `);
    await db.query(`
      ALTER TABLE users
        MODIFY COLUMN password TEXT NOT NULL;
    `);
  },
};
