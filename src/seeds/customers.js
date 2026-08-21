module.exports = {
  name: "customers",

  run: async (db) => {
    const customers = [
      {
        id: "CUST-001",
        name: "Budi Santoso",
        phone: "081298765401",
        email: "budi.santoso@gmail.com",
        address: "Jl. Sudirman No. 45, Kebayoran Baru",
        gender: "male",
        birth_date: "1990-04-12",
        member_code: "MBR-BUDI-001",
        member_level: "regular",
        points: 80,
        total_spending: 800000,
        is_active: true,
      },
      {
        id: "CUST-002",
        name: "Siti Nurhaliza",
        phone: "081298765402",
        email: "siti.nurhaliza@yahoo.com",
        address: "Jl. Melati No. 12, Tebet",
        gender: "female",
        birth_date: "1995-08-23",
        member_code: "MBR-SITI-002",
        member_level: "silver",
        points: 220,
        total_spending: 2200000,
        is_active: true,
      },
      {
        id: "CUST-003",
        name: "Hendra Gunawan",
        phone: "081298765403",
        email: "hendra.gunawan@gmail.com",
        address: "Jl. Boulevard Barat Raya Blok LC-6, Kelapa Gading",
        gender: "male",
        birth_date: "1988-11-05",
        member_code: "MBR-HNDR-003",
        member_level: "gold",
        points: 650,
        total_spending: 6500000,
        is_active: true,
      },
      {
        id: "CUST-004",
        name: "Dewi Anggraini",
        phone: "081298765404",
        email: "dewi.anggraini@outlook.com",
        address: "Jl. Senopati No. 88, Kebayoran Baru",
        gender: "female",
        birth_date: "1992-02-18",
        member_code: "MBR-DEWI-004",
        member_level: "platinum",
        points: 1350,
        total_spending: 13500000,
        is_active: true,
      },
    ];

    for (const c of customers) {
      await db.query(
        `
        INSERT INTO customers (
          id, name, phone, email, address, gender,
          birth_date, member_code, member_level, points,
          total_spending, is_active
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          name = VALUES(name),
          phone = VALUES(phone),
          email = VALUES(email),
          address = VALUES(address),
          gender = VALUES(gender),
          birth_date = VALUES(birth_date),
          member_code = VALUES(member_code),
          member_level = VALUES(member_level),
          points = VALUES(points),
          total_spending = VALUES(total_spending),
          is_active = VALUES(is_active)
        `,
        [
          c.id,
          c.name,
          c.phone,
          c.email,
          c.address,
          c.gender,
          c.birth_date,
          c.member_code,
          c.member_level,
          c.points,
          c.total_spending,
          c.is_active,
        ]
      );
    }

    console.log(`✅ ${customers.length} customers seeded`);
  },
};
