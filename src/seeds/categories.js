module.exports = {
  name: "categories",

  run: async (db) => {
    const categories = [
      ["CAT-001", "Makanan", "Kategori produk makanan & camilan", "makanan", true],
      ["CAT-002", "Minuman", "Kategori produk minuman & penyegar", "minuman", true],
      ["CAT-003", "Snack", "Kategori produk jajan & snack ringan", "snack", true],
      ["CAT-004", "Sembako", "Kategori kebutuhan pokok harian", "sembako", true],
    ];

    for (const item of categories) {
      await db.query(
        `
        INSERT INTO categories (id, name, description, slug, is_active)
        VALUES (?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          name = VALUES(name),
          description = VALUES(description),
          slug = VALUES(slug),
          is_active = VALUES(is_active)
        `,
        item
      );
    }

    console.log(`✅ ${categories.length} categories seeded`);
  },
};
