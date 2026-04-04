const db = require("../config/connection");

async function createTableIfNotExists(tableName, schema) {
    try {
        const sql = `CREATE TABLE IF NOT EXISTS ${tableName} (${schema})`;
        await db.query(sql);
        console.log(`✅ Table "${tableName}" ready`);
    } catch (err) {
        console.error(`❌ Failed create table ${tableName}:`, err);
    }
}

async function createMigrationsTable() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS migrations (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

async function hasMigration(name) {
  const [rows] = await db.query(
    `SELECT * FROM migrations WHERE name = ? LIMIT 1`,
    [name]
  );
  return rows.length > 0;
}

async function runMigration(name, up) {
  const exists = await hasMigration(name);

  if (exists) {
    console.log(`⏩ Skip: ${name}`);
    return;
  }

  console.log(`🚀 Running: ${name}`);
  await up(db);

  await db.query(`INSERT INTO migrations (name) VALUES (?)`, [name]);
}


module.exports = { createTableIfNotExists, createMigrationsTable, runMigration };
