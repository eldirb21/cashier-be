const express = require("express");

const {
  getCart,
  addCartItem,
  updateCartItem,
  removeCartItem,
  mergeCart,
} = require("../src/controllers/cartController");
const resolveCartIdentity = require("../src/middleware/resolveCartIdentity");

const router = express.Router();

router.get("/", resolveCartIdentity, getCart);
router.post("/items", resolveCartIdentity, addCartItem);
router.patch("/items/:id", updateCartItem);
router.delete("/items/:id", removeCartItem);
router.post("/merge", mergeCart);

module.exports = router;
