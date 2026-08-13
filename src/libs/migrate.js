const db = require("../config/connection");

async function createMigrationsTable() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS migrations (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL UNIQUE,
      executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

async function runMigration(name, up) {
  const [rows] = await db.query("SELECT * FROM migrations WHERE name = ?", [
    name,
  ]);

  if (rows.length > 0) {
    console.log(`⏭️ ${name} sudah dijalankan`);
    return;
  }

  console.log(`🚀 Menjalankan ${name}...`);

  await up(db);

  await db.query("INSERT INTO migrations (name) VALUES (?)", [name]);

  console.log(`✅ ${name} berhasil`);
}

module.exports = {
  createMigrationsTable,
  runMigration,
};
