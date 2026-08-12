const express = require('express');
const router = express.Router();


const authRouter = require("./auth.router")
const productRouter = require("./product.router")
const supplierRouter = require("./supplier.router")
const categoriesRouter = require("./categories.router")



router.use("/auth", authRouter)
router.use("/products", productRouter)
router.use("/supplier", supplierRouter)
router.use("/categories", categoriesRouter)

module.exports = router;
