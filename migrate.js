const fs = require("fs");
const path = require("path");

const { createMigrationsTable, runMigration } = require("./src/libs/migrate");

const migrationsPath = path.join(__dirname, "src/migrations");

const migrations = fs
  .readdirSync(migrationsPath)
  .filter((file) => file.endsWith(".js"))
  .sort()
  .map((file) => require(path.join(migrationsPath, file)));

async function migrate() {
  try {
    await createMigrationsTable();

    for (const migration of migrations) {
      await runMigration(migration.name, migration.up);
    }

    console.log("✅ All migrations done");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exitCode = 1;
  } finally {
    process.exit();
  }
}

migrate();
