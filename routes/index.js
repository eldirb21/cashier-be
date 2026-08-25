const express = require("express");
const router = express.Router();

const authRouter = require("./auth.router");
const productRouter = require("./product.router");
const supplierRouter = require("./supplier.router");
const categoriesRouter = require("./categories.router");
const transactionRouter = require("./transaction.router");
const customerRouter = require("./customer.router");
const configRouter = require("./config.routes");
const cartRouter = require("./cart.route");

router.use("/auth", authRouter);
router.use("/products", productRouter);
router.use("/supplier", supplierRouter);
router.use("/categories", categoriesRouter);
router.use("/transactions", transactionRouter);
router.use("/customers", customerRouter);
router.use("/config", configRouter);
router.use("/cart", cartRouter);

module.exports = router;
