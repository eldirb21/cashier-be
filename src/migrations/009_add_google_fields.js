module.exports = {
  name: "009_add_google_fields",

  up: async (db) => {
    // Cek google_id
    const [googleIdColumns] = await db.query(`
      SHOW COLUMNS FROM users
      WHERE Field = 'google_id';
    `);

    if (googleIdColumns.length === 0) {
      await db.query(`
        ALTER TABLE users
        ADD COLUMN google_id VARCHAR(255) UNIQUE DEFAULT NULL
        AFTER is_active;
      `);

      console.log("✅ google_id dibuat");
    } else {
      console.log("⏭️ google_id sudah ada");
    }

    // Cek avatar
    const [avatarColumns] = await db.query(`
      SHOW COLUMNS FROM users
      WHERE Field = 'avatar';
    `);

    if (avatarColumns.length === 0) {
      await db.query(`
        ALTER TABLE users
        ADD COLUMN avatar VARCHAR(500) DEFAULT NULL
        AFTER google_id;
      `);

      console.log("✅ avatar dibuat");
    } else {
      console.log("⏭️ avatar sudah ada");
    }

    // Pastikan password boleh NULL
    await db.query(`
      ALTER TABLE users
      MODIFY COLUMN password TEXT NULL;
    `);

    // Cek index google_id
    const [indexes] = await db.query(`
      SHOW INDEX FROM users
      WHERE Key_name = 'idx_users_google_id';
    `);

    if (indexes.length === 0) {
      await db.query(`
        CREATE INDEX idx_users_google_id
        ON users(google_id);
      `);

      console.log("✅ idx_users_google_id dibuat");
    } else {
      console.log("⏭️ idx_users_google_id sudah ada");
    }
  },

  down: async (db) => {
    const [indexes] = await db.query(`
      SHOW INDEX FROM users
      WHERE Key_name = 'idx_users_google_id';
    `);

    if (indexes.length > 0) {
      await db.query(`
        DROP INDEX idx_users_google_id ON users;
      `);
    }

    const [googleIdColumns] = await db.query(`
      SHOW COLUMNS FROM users
      WHERE Field = 'google_id';
    `);

    const [avatarColumns] = await db.query(`
      SHOW COLUMNS FROM users
      WHERE Field = 'avatar';
    `);

    if (googleIdColumns.length > 0) {
      await db.query(`
        ALTER TABLE users DROP COLUMN google_id;
      `);
    }

    if (avatarColumns.length > 0) {
      await db.query(`
        ALTER TABLE users DROP COLUMN avatar;
      `);
    }

    await db.query(`
      ALTER TABLE users
      MODIFY COLUMN password TEXT NOT NULL;
    `);
  },
};
