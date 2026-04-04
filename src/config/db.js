const db = require("./connection");

async function query(sql, params = []) {
    try {
        const [rows] = await db.query(sql, params);
        return rows;
    } catch (err) {
        console.error("DB ERROR:", err);
        throw err;
    }
}

async function queryOne(sql, params = []) {
    const rows = await query(sql, params);
    return rows[0] || null;
}

module.exports = { query, queryOne };