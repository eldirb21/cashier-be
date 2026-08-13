module.exports = {
  name: "products",

  run: async (db) => {
    const products = [
      [
        "PROD-001",
        null,
        null,
        "Indomie Goreng",
        "899999900001",
        3500,
        2500,
        100,
        10,
        null,
        true,
      ],
      [
        "PROD-002",
        null,
        null,
        "Indomie Ayam Bawang",
        "899999900002",
        3500,
        2500,
        100,
        10,
        null,
        true,
      ],
      [
        "PROD-003",
        null,
        null,
        "Aqua 600ml",
        "899999900003",
        4000,
        2500,
        50,
        10,
        null,
        true,
      ],
      [
        "PROD-004",
        null,
        null,
        "Teh Botol Sosro",
        "899999900004",
        5000,
        3500,
        50,
        10,
        null,
        true,
      ],
      [
        "PROD-005",
        null,
        null,
        "Kopi Kapal Api",
        "899999900005",
        2500,
        1500,
        100,
        20,
        null,
        true,
      ],
    ];

    for (const product of products) {
      await db.query(
        `
        INSERT INTO products (
          id,
          category_id,
          supplier_id,
          name,
          barcode,
          price,
          cost_price,
          stock,
          min_stock,
          img_url,
          is_active
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          name = VALUES(name),
          barcode = VALUES(barcode),
          price = VALUES(price),
          cost_price = VALUES(cost_price),
          stock = VALUES(stock),
          min_stock = VALUES(min_stock),
          is_active = VALUES(is_active)
        `,
        product,
      );
    }

    console.log(`✅ ${products.length} products seeded`);
  },
};
