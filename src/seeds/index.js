const db = require("../config/connection");

const seeds = [require("./users"), require("./products")];

async function seed() {
  try {
    console.log("🌱 Starting database seed...\n");

    for (const seed of seeds) {
      console.log(`🚀 Running seed: ${seed.name}`);

      await seed.run(db);

      console.log(`✅ Seed ${seed.name} berhasil\n`);
    }

    console.log("🎉 All seeds completed");
  } catch (error) {
    console.error("❌ Seed failed:");
    console.error(error);
    process.exitCode = 1;
  }
}

seed();
