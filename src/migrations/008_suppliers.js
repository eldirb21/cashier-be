module.exports = {
  name: "008_suppliers",

  up: async (db) => {
    await db.query(`SELECT 1;`);
  },

  down: async (db) => {
    await db.query(`SELECT 1;`);
  },
};
