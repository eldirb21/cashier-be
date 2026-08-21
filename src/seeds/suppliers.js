module.exports = {
  name: "suppliers",

  run: async (db) => {
    const suppliers = [
      {
        id: "SUPP-001",
        name: "PT Indofood Sukses Makmur Tbk",
        code: "SUP-INDF-01",
        contact_person: "Bambang Sudiro",
        phone: "02157958822",
        email: "corporate@indofood.co.id",
        address: "Sudirman Plaza, Indofood Tower Lt. 27, Jl. Jend. Sudirman Kav. 76-78",
        city: "Jakarta Selatan",
        province: "DKI Jakarta",
        bank_name: "BCA",
        bank_account_number: "0353123456",
        bank_account_name: "PT Indofood Sukses Makmur",
        notes: "Supplier aneka mie, snack, bumbu & minyak goreng",
        is_active: true,
      },
      {
        id: "SUPP-002",
        name: "PT Tirta Investama (Danone Aqua)",
        code: "SUP-AQUA-01",
        contact_person: "Ratna Sari",
        phone: "02129961000",
        email: "order@aqua.co.id",
        address: "Cyber 2 Tower Lt. 12, Jl. HR Rasuna Said Blok X-5 No. 13",
        city: "Jakarta Selatan",
        province: "DKI Jakarta",
        bank_name: "Mandiri",
        bank_account_number: "1230009876543",
        bank_account_name: "PT Tirta Investama",
        notes: "Distribusi galon dan botol Aqua",
        is_active: true,
      },
      {
        id: "SUPP-003",
        name: "PT Sinar Sosro",
        code: "SUP-SOSRO-01",
        contact_person: "Agus Pratama",
        phone: "0218840855",
        email: "sales@sosro.com",
        address: "Jl. Raya Sultan Agung KM 28, Medan Satria",
        city: "Bekasi",
        province: "Jawa Barat",
        bank_name: "BCA",
        bank_account_number: "8730998877",
        bank_account_name: "PT Sinar Sosro",
        notes: "Teh botol, Fruit Tea, dan Tebs",
        is_active: true,
      },
      {
        id: "SUPP-004",
        name: "PT Santos Jaya Abadi (Kapal Api)",
        code: "SUP-KAPAL-01",
        contact_person: "Widodo Santoso",
        phone: "0318912345",
        email: "sales@kapalapi.co.id",
        address: "Jl. Raya Gilang 159, Taman",
        city: "Sidoarjo",
        province: "Jawa Timur",
        bank_name: "BNI",
        bank_account_number: "0192837465",
        bank_account_name: "PT Santos Jaya Abadi",
        notes: "Aneka produk kopi bubuk dan kopi sachet",
        is_active: true,
      },
      {
        id: "SUPP-005",
        name: "PT Unilever Indonesia Tbk",
        code: "SUP-UNVR-01",
        contact_person: "Lina Marlina",
        phone: "02180827000",
        email: "distribusi@unilever.com",
        address: "BSD Green Office Park Kav. 3, Jl. BSD Grand Boulevard",
        city: "Tangerang",
        province: "Banten",
        bank_name: "CIMB Niaga",
        bank_account_number: "800123456700",
        bank_account_name: "PT Unilever Indonesia Tbk",
        notes: "Produk sabun, sampo, pasta gigi, dan pembersih",
        is_active: true,
      },
    ];

    for (const s of suppliers) {
      await db.query(
        `
        INSERT INTO suppliers (
          id, name, code, contact_person, phone, email,
          address, city, province, bank_name, bank_account_number,
          bank_account_name, notes, is_active
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          name = VALUES(name),
          code = VALUES(code),
          contact_person = VALUES(contact_person),
          phone = VALUES(phone),
          email = VALUES(email),
          address = VALUES(address),
          city = VALUES(city),
          province = VALUES(province),
          bank_name = VALUES(bank_name),
          bank_account_number = VALUES(bank_account_number),
          bank_account_name = VALUES(bank_account_name),
          notes = VALUES(notes),
          is_active = VALUES(is_active)
        `,
        [
          s.id,
          s.name,
          s.code,
          s.contact_person,
          s.phone,
          s.email,
          s.address,
          s.city,
          s.province,
          s.bank_name,
          s.bank_account_number,
          s.bank_account_name,
          s.notes,
          s.is_active,
        ]
      );
    }

    console.log(`✅ ${suppliers.length} suppliers seeded`);
  },
};
