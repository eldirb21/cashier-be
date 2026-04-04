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
      title: "API Documentation",
      version: "1.0.0",
      description: "Dokumentasi API menggunakan Swagger",
    },
    servers: [
      {
        url: "http://localhost:4000",
      },
    ],
    components: {
      securitySchemes: {
        cookieAuth: {
          type: "apiKey",
          in: "cookie",
          name: "accessToken",
        },
      },
    },
    security: [{ cookieAuth: [] }],
  },
  apis: yamlFiles, // Gunakan semua file YAML yang ditemukan
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
module.exports = swaggerDocs;
