require("dotenv").config();

var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const helmet = require("helmet");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");

var swaggerDocs = require("./src/config/swagger");
var indexRouter = require("./routes/index");
const { notFound } = require("./src/middleware/notfound.middleware");
const { limiter } = require("./src/config/rateLimit");
const { errorHandler } = require("./src/middleware/errorHandler");
const { requestLogger } = require("./src/libs/logger");

var app = express();

// ✅ Trust proxy (deploy ready)
app.set("trust proxy", 1);

// ✅ Security
app.use(helmet());
app.use(cors({ origin: "*" }));

// ✅ Parsing (limit body)
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: false, limit: "1mb" }));

// ✅ Logger
app.use(logger("dev"));
app.use(requestLogger);

// ✅ Static & cookies
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use(limiter);

// ✅ Swagger (dev only)
if (process.env.NODE_ENV !== "production") {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));
}

// ✅ Routes
app.use("/api", indexRouter);

// ✅ Error handler
app.use(notFound);
app.use(errorHandler);

module.exports = app;
