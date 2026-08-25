const express = require("express");
const { authenticate, authorize } = require("../src/middleware/authenticate");
const { ROLE } = require("../src/libs/enum");
const ctrl = require("../src/controllers/config.controller");

const router = express.Router();

router.get("/", authenticate, ctrl.getConfig);

module.exports = router;
