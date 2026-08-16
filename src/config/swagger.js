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
## Cara Autentikasi

1. Panggil **POST /api/auth/login** dan catat nilai \`accessToken\` dari response.
2. Klik tombol **Authorize 🔒** di kanan atas.
3. Pada field **bearerAuth**, masukkan \`accessToken\` (bukan refreshToken!).
4. Klik **Authorize** → selesai.

> ⚠️ **refreshToken** hanya digunakan di endpoint \`POST /api/auth/refresh\`. Jangan gunakan sebagai Bearer token!
      `.trim(),
    },
    servers: [
      {
        url: "http://localhost:4000",
        description: "Development server",
      },
    ],
    components: {
      securitySchemes: {
        // ✅ Bearer token (gunakan accessToken dari response login)
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description:
            "Masukkan **accessToken** (bukan refreshToken) yang didapat dari response login.",
        },
        // Cookie fallback
        cookieAuth: {
          type: "apiKey",
          in: "cookie",
          name: "authorization",
        },
      },
    },
    // Terapkan bearerAuth sebagai default global
    security: [{ bearerAuth: [] }, { cookieAuth: [] }],
  },
  apis: yamlFiles,
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
module.exports = swaggerDocs;
