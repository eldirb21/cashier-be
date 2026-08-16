const fs = require("fs");
const path = require("path");

const name = process.argv[2];

if (!name) {
  console.error(
    "Migration name is required.\n" +
      "Example: npm run migration:create -- create_products",
  );
  process.exit(1);
}

const migrationsDir = path.join(__dirname, "..", "migrations");

if (!fs.existsSync(migrationsDir)) {
  fs.mkdirSync(migrationsDir, { recursive: true });
}

const files = fs
  .readdirSync(migrationsDir)
  .filter((file) => /^\d+_.+\.js$/.test(file));

const numbers = files.map((file) => {
  const match = file.match(/^(\d+)_/);
  return match ? Number(match[1]) : 0;
});

const nextNumber = numbers.length ? Math.max(...numbers) + 1 : 1;

const prefix = String(nextNumber).padStart(3, "0");
const migrationName = `${prefix}_${name}`;
const fileName = `${migrationName}.js`;
const filePath = path.join(migrationsDir, fileName);

const content = `module.exports = {
  name: "${migrationName}",

  up: async (db) => {
    await db.query(\`
      
    \`);
  },

  down: async (db) => {
    await db.query(\`
      
    \`);
  },
};
`;

fs.writeFileSync(filePath, content);

console.log(`✅ Migration created: src/migrations/${fileName}`);
