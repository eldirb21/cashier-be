const bcrypt = require("bcrypt");

module.exports = {
  name: "users",

  run: async (db) => {
    const defaultPassword = await bcrypt.hash("admin123", 10);
    const cashierPassword = await bcrypt.hash("kasir123", 10);
    const managerPassword = await bcrypt.hash("manager123", 10);
    const ownerPassword = await bcrypt.hash("owner123", 10);
    const spvPassword = await bcrypt.hash("spv123", 10);
    const customerPassword = await bcrypt.hash("customer123", 10);

    const users = [
      {
        name: "Administrator",
        email: "admin@cashier.com",
        phone: "081234567890",
        password: defaultPassword,
        role: "ADMIN",
      },
      {
        name: "Kasir Toko",
        email: "kasir@cashier.com",
        phone: "081234567891",
        password: cashierPassword,
        role: "CASHIER",
      },
      {
        name: "Store Manager",
        email: "manager@cashier.com",
        phone: "081234567892",
        password: managerPassword,
        role: "MANAGER",
      },
      {
        name: "Business Owner",
        email: "owner@cashier.com",
        phone: "081234567893",
        password: ownerPassword,
        role: "OWNER",
      },
      {
        name: "Supervisor Shift",
        email: "spv@cashier.com",
        phone: "081234567894",
        password: spvPassword,
        role: "SPV",
      },
      {
        name: "Customer User",
        email: "customer@cashier.com",
        phone: "081234567895",
        password: customerPassword,
        role: "CUSTOMER",
      },
    ];

    for (const u of users) {
      await db.query(
        `
        INSERT INTO users
          (name, email, phone, password, role, is_active)
        VALUES
          (?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          name = VALUES(name),
          phone = VALUES(phone),
          password = VALUES(password),
          role = VALUES(role),
          is_active = VALUES(is_active)
        `,
        [u.name, u.email, u.phone, u.password, u.role, true]
      );
    }

    console.log(`✅ ${users.length} users seeded:`);
    console.log("   👑 Admin   : admin@cashier.com    / admin123");
    console.log("   💳 Kasir   : kasir@cashier.com    / kasir123");
    console.log("   📊 Manager : manager@cashier.com  / manager123");
    console.log("   🏢 Owner   : owner@cashier.com    / owner123");
    console.log("   🛡️ SPV     : spv@cashier.com      / spv123");
    console.log("   👤 Customer: customer@cashier.com / customer123");
  },
};
