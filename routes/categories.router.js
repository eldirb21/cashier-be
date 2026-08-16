const express = require("express");
const { authenticate, authorize } = require("../src/middleware/authenticate");
const { ROLE } = require("../src/libs/enum");
const ctrl = require("../src/controllers/categories.controller");

const router = express.Router();

router.get("/", ctrl.getCategories);
router.get("/:id", ctrl.getCategoryById);

router.post("/", authenticate, authorize(ROLE.ADMIN, ROLE.MANAGER, ROLE.OWNER), ctrl.createCategory);
router.put("/:id", authenticate, authorize(ROLE.ADMIN, ROLE.MANAGER, ROLE.OWNER), ctrl.updateCategory);
router.delete("/:id", authenticate, authorize(ROLE.ADMIN, ROLE.OWNER), ctrl.deleteCategory);

module.exports = router;