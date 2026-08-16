module.exports = {
  name: "007_customers",

  up: async (db) => {
    await db.query(`SELECT 1;`);
  },

  down: async (db) => {
    await db.query(`SELECT 1;`);
  },
};
