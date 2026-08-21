const swaggerJsdoc = require("swagger-jsdoc");
const path = require("path");
const fs = require("fs");

const docsDir = path.join(__dirname, "../../swagger");
const yamlFiles = fs
  .readdirSync(docsDir)
  .filter((file) => file.endsWith(".yaml"))
  .sort()
  .map((file) => path.join(docsDir, file));

const port = process.env.PORT || 4000;

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Cashier App — Backend REST API Documentation",
      version: "1.0.0",
      description: `
### Dokumentasi Lengkap REST API POS / Kasir

Modul yang tersedia:
- **Auth**: Registrasi, Login, Google OAuth, Refresh Token, Logout, Lupa Password, Reset Password, & Profile
- **Category**: Manajemen Kategori Produk
- **Product**: Manajemen Stok dan Produk Barang
- **Customer**: Manajemen Pelanggan & Loyalty Membership Poin
- **Supplier**: Manajemen Data Vendor & Supplier Produk
- **Transaction**: Kasir POS Penjualan & Summary / Rekap Penjualan

---

### Cara Autentikasi di Swagger UI:
1. Jalankan endpoint **POST /api/auth/login** atau **POST /api/auth/register**.
2. Salin token dari field \`accessToken\` yang ada di response data.
3. Klik tombol **Authorize 🔒** di pojok kanan atas halaman ini.
4. Pada modal dialog, masukkan nilai \`accessToken\` di kolom **BearerAuth** (format cukup paste token, *tanpa* perlu mengetik kata 'Bearer').
5. Klik **Authorize** dan **Close**.
6. Sekarang semua endpoint berproteksi (memerlukan token) sudah bisa dites secara langsung.
      `.trim(),
    },
    servers: [
      {
        url: `http://localhost:${port}`,
        description: "Development Server",
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Masukkan JWT Access Token yang didapatkan dari login / register",
        },
        cookieAuth: {
          type: "apiKey",
          in: "cookie",
          name: "authorization",
          description: "Token otorisasi via cookie",
        },
      },
    },
    tags: [
      { name: "Auth", description: "Autentikasi, JWT token rotation, Google OAuth, & Profile" },
      { name: "Category", description: "Manajemen kategori produk barang" },
      { name: "Product", description: "Manajemen data barang dan stok produk kasir" },
      { name: "Customer", description: "Manajemen customer dan program membership / loyalty poin" },
      { name: "Supplier", description: "Manajemen data supplier dan vendor barang" },
      { name: "Transaction", description: "Transaksi penjualan kasir dan ringkasan/rekapitulasi pendapatan" },
    ],
  },
  apis: yamlFiles,
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
module.exports = swaggerDocs;
