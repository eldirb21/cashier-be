const express = require("express");
const { authenticate, authorize } = require("../src/middleware/authenticate");
const { ROLE } = require("../src/libs/enum");
const ctrl = require("../src/controllers/product.controller");

const router = express.Router();

router.post("/", authenticate, authorize(ROLE.ADMIN), ctrl.createProduct);

router.put("/:id", authenticate, authorize(ROLE.ADMIN, ROLE.MANAGER), ctrl.updateProduct);
router.get("/", ctrl.getProducts);
router.get("/:id", ctrl.getProductById);

router.delete("/:id", authenticate, authorize(ROLE.ADMIN), ctrl.deleteProduct);

module.exports = router;
