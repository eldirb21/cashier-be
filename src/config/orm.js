const { query, queryOne } = require("./db");

function createModel(table) {
  return {
    // 🔍 findUnique
    async findUnique({ where, select = ["*"] }) {
      const key = Object.keys(where)[0];
      const value = where[key];

      const columns = select.join(", ");
      const sql = `SELECT ${columns} FROM ${table} WHERE ${key} = ? LIMIT 1`;

      return queryOne(sql, [value]);
    },

    // 🔍 findMany
    async findMany({ where = {}, select = ["*"] } = {}) {
      const columns = select.join(", ");

      let sql = `SELECT ${columns} FROM ${table}`;
      const values = [];

      if (Object.keys(where).length > 0) {
        const conditions = Object.keys(where)
          .map((key) => {
            values.push(where[key]);
            return `${key} = ?`;
          })
          .join(" AND ");

        sql += ` WHERE ${conditions}`;
      }

      return query(sql, values);
    },

    // 🔍 findFirst
    async findFirst({ where = {}, select = ["*"], orderBy } = {}) {
      const columns = select.join(", ");

      let sql = `SELECT ${columns} FROM ${table}`;
      const values = [];

      // WHERE
      if (Object.keys(where).length > 0) {
        const conditions = Object.keys(where)
          .map((key) => {
            values.push(where[key]);
            return `${key} = ?`;
          })
          .join(" AND ");

        sql += ` WHERE ${conditions}`;
      }

      // ORDER BY (optional)
      if (orderBy) {
        const key = Object.keys(orderBy)[0];
        const direction =
          orderBy[key].toUpperCase() === "DESC" ? "DESC" : "ASC";
        sql += ` ORDER BY ${key} ${direction}`;
      }

      sql += ` LIMIT 1`;

      return queryOne(sql, values);
    },

    // ➕ create
    async create({ data }) {
      const keys = Object.keys(data);
      const values = Object.values(data);

      const columns = keys.join(", ");
      const placeholders = keys.map(() => "?").join(", ");

      const sql = `INSERT INTO ${table} (${columns}) VALUES (${placeholders})`;

      const result = await query(sql, values);

      return { id: result.insertId, ...data };
    },

    // ✏️ update
    async update({ where, data }) {
      const key = Object.keys(where)[0];
      const value = where[key];

      const updates = Object.keys(data)
        .map((k) => `${k} = ?`)
        .join(", ");

      const values = [...Object.values(data), value];

      const sql = `UPDATE ${table} SET ${updates} WHERE ${key} = ?`;

      await query(sql, values);

      return { ...where, ...data };
    },

    async updateMany({ where = {}, data }) {
      const updates = Object.keys(data)
        .map((k) => `${k} = ?`)
        .join(", ");

      const values = [...Object.values(data)];

      let sql = `UPDATE ${table} SET ${updates}`;

      if (Object.keys(where).length > 0) {
        const conditions = Object.keys(where)
          .map((key) => {
            values.push(where[key]);
            return `${key} = ?`;
          })
          .join(" AND ");

        sql += ` WHERE ${conditions}`;
      }

      await query(sql, values);
      return true;
    },

    // ❌ delete
    async delete({ where }) {
      const key = Object.keys(where)[0];
      const value = where[key];

      const sql = `DELETE FROM ${table} WHERE ${key} = ?`;

      await query(sql, [value]);

      return true;
    },

    // ❌ deleteMany
    async deleteMany({ where = {} }) {
      let sql = `DELETE FROM ${table}`;
      const values = [];

      if (Object.keys(where).length > 0) {
        const conditions = Object.keys(where)
          .map((key) => {
            values.push(where[key]);
            return `${key} = ?`;
          })
          .join(" AND ");

        sql += ` WHERE ${conditions}`;
      }

      await query(sql, values);
      return true;
    },
  };
}

module.exports = { createModel };
