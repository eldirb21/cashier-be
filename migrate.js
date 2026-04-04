const { createMigrationsTable, runMigration } = require("./src/libs/migrate");

const migrations = [
  require("./src/migrations/001_create_users"),
  require("./src/migrations/002_create_refresh_tokens"),
  require("./src/migrations/003_password_resets"),
];

async function migrate() {
  await createMigrationsTable();

  for (const m of migrations) {
    await runMigration(m.name, m.up);
  }

  console.log("✅ All migrations done");
  process.exit();
}

migrate();