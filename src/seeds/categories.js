module.exports = {
  name: "categories",

  run: async (db) => {
    const categories = [
      ["CAT-001", "Makanan", "Kategori aneka produk makanan & mie instan", "makanan", true],
      ["CAT-002", "Minuman", "Kategori aneka minuman dingin, air mineral, teh & kopi", "minuman", true],
      ["CAT-003", "Snack", "Kategori makanan ringan, biskuit & keripik", "snack", true],
      ["CAT-004", "Sembako", "Kategori bahan pokok seperti beras, minyak goreng & gula", "sembako", true],
      ["CAT-005", "Perawatan Diri", "Kategori sabun, shampo, pasta gigi & deterjen", "perawatan-diri", true],
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
