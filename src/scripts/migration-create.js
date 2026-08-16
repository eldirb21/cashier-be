const fs = require("fs");
const path = require("path");

const name = process.argv[2];

if (!name) {
  console.error("Migration name is required.");
  console.error("Example: npm run migration:create -- transactions");
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

const nextNumber = numbers.length > 0 ? Math.max(...numbers) + 1 : 1;

const prefix = String(nextNumber).padStart(3, "0");

const fileName = `${prefix}_${name}.js`;
const filePath = path.join(migrationsDir, fileName);

const migrationName = `${prefix}_${name}`;

const content = `const db = require('../src/config/database');

module.exports = {
  name: '${migrationName}',

  async up() {
    await db.query(\`
      
    \`);
  },

  async down() {
    await db.query(\`
      
    \`);
  },
};
`;

fs.writeFileSync(filePath, content);

console.log(`Migration created: migrations/${fileName}`);
