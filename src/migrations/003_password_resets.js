module.exports = {
    name: "003_password_resets",

    up: async (db) => {
        await db.query(`
        CREATE TABLE password_resets (
            id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            user_id BIGINT UNSIGNED NOT NULL,
            token VARCHAR(255) NOT NULL UNIQUE,
            expires_at DATETIME NOT NULL,
            used BOOLEAN DEFAULT FALSE,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );
    `);


    },

    down: async (db) => {
        await db.query(`DROP TABLE IF EXISTS password_resets;`);
    },
};