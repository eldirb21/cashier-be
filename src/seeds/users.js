const bcrypt = require("bcrypt");

module.exports = {
  name: "users",

  run: async (db) => {
    const password = await bcrypt.hash("admin123", 10);

    await db.query(
      `
      INSERT INTO users
        (name, email, phone, password, role, is_active)
      VALUES
        (?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        name = VALUES(name),
        phone = VALUES(phone),
        role = VALUES(role),
        is_active = VALUES(is_active)
      `,
      [
        "Administrator",
        "admin@cashier.com",
        "081234567890",
        password,
        "ADMIN",
        true,
      ],
    );

    console.log("✅ Admin user seeded");
    console.log("   Email    : admin@cashier.com");
    console.log("   Password : admin123");
  },
};
