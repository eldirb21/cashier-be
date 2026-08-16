const swaggerJsdoc = require("swagger-jsdoc");
const path = require("path");
const fs = require("fs");

// Ambil semua file .yaml dari folder docs
const docsDir = path.join(__dirname, "../../swagger");
const yamlFiles = fs
  .readdirSync(docsDir)
  .filter((file) => file.endsWith(".yaml"))
  .map((file) => path.join(docsDir, file));

// Konfigurasi Swagger
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Cashier App — API Documentation",
      version: "1.0.0",
      description: `
## Cara Autentikasi di Swagger

1. Panggil **POST /api/auth/login** dan catat nilai \`accessToken\` dari response.
2. Klik tombol **Authorize 🔒** di kanan atas.
3. Pada field **BearerAuth**, masukkan nilai \`accessToken\` (bukan refreshToken!).
4. Klik **Authorize** → selesai, semua request akan otomatis menyertakan token.

> ⚠️ **refreshToken** hanya digunakan di endpoint \`POST /api/auth/refresh\`. Jangan gunakan sebagai Bearer token!
      `.trim(),
    },
    servers: [
      {
        url: "http://localhost:4000",
        description: "Development server",
      },
    ],
    // securitySchemes didefinisikan di file YAML masing-masing
  },
  apis: yamlFiles,
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
module.exports = swaggerDocs;

