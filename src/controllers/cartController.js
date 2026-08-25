const { cartItem, cart, product } = require("../models");

const getOrCreateCart = async ({ userId, sessionId }) => {
  const where = userId ? { user_id: userId } : { session_id: sessionId };
  let existingCart = await cart.findFirst({ where });

  if (!existingCart) {
    existingCart = await cart.create({
      data: userId ? { user_id: userId } : { session_id: sessionId },
    });
  }

  return existingCart;
};

const getCartWithItems = async (cartId) => {
  const items = await cartItem.findMany({ where: { cart_id: cartId } });

  const itemsWithProduct = await Promise.all(
    items.map(async (item) => {
      const productDetail = await product.findFirst({
        where: { id: item.product_id },
      });
      return {
        id: item.id,
        product: productDetail,
        qty: item.qty,
        price: item.price_snapshot,
        subtotal: item.price_snapshot * item.qty,
      };
    }),
  );

  return itemsWithProduct;
};

const getCart = async (req, res) => {
  try {
    const cartData = await getOrCreateCart(req.cartIdentity);
    const items = await getCartWithItems(cartData.id);

    return res.json({
      message: "Cart",
      data: { cart_id: cartData.id, items },
    });
  } catch (err) {
    console.error("getCart error:", err);
    return res
      .status(500)
      .json({ message: "Gagal mengambil cart", error: err.message });
  }
};

const addCartItem = async (req, res) => {
  try {
    const { product_id, qty = 1 } = req.body;

    if (!product_id) {
      return res.status(400).json({ message: "product_id wajib diisi" });
    }

    const productData = await product.findFirst({
      where: { id: product_id, is_active: true },
    });
    if (!productData) {
      return res.status(404).json({ message: "Produk tidak ditemukan" });
    }

    if (productData.stock < qty) {
      return res.status(400).json({ message: "Stok tidak mencukupi" });
    }

    const cartData = await getOrCreateCart(req.cartIdentity);

    const existingItem = await cartItem.findFirst({
      where: { cart_id: cartData.id, product_id },
    });

    if (existingItem) {
      const newQty = existingItem.qty + qty;
      if (productData.stock < newQty) {
        return res.status(400).json({ message: "Stok tidak mencukupi" });
      }
      await cartItem.update({
        where: { id: existingItem.id },
        data: { qty: newQty },
      });
    } else {
      await cartItem.create({
        data: {
          cart_id: cartData.id,
          product_id,
          qty,
          price_snapshot: productData.price,
        },
      });
    }

    const items = await getCartWithItems(cartData.id);

    return res.json({
      message: "Item ditambahkan",
      data: { cart_id: cartData.id, items },
    });
  } catch (err) {
    console.error("addCartItem error:", err);
    return res
      .status(500)
      .json({ message: "Gagal menambah item", error: err.message });
  }
};

const updateCartItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { qty } = req.body;

    if (!qty || qty < 1) {
      return res.status(400).json({ message: "qty harus lebih dari 0" });
    }

    const item = await cartItem.findFirst({ where: { id } });
    if (!item) {
      return res.status(404).json({ message: "Item tidak ditemukan" });
    }

    const productData = await product.findFirst({
      where: { id: item.product_id },
    });
    if (productData.stock < qty) {
      return res.status(400).json({ message: "Stok tidak mencukupi" });
    }

    await cartItem.update({ where: { id }, data: { qty } });

    const items = await getCartWithItems(item.cart_id);

    return res.json({ message: "Item diupdate", data: { items } });
  } catch (err) {
    console.error("updateCartItem error:", err);
    return res
      .status(500)
      .json({ message: "Gagal update item", error: err.message });
  }
};

const removeCartItem = async (req, res) => {
  try {
    const { id } = req.params;

    const item = await cartItem.findFirst({ where: { id } });
    if (!item) {
      return res.status(404).json({ message: "Item tidak ditemukan" });
    }

    await cartItem.delete({ where: { id } });

    const items = await getCartWithItems(item.cart_id);

    return res.json({ message: "Item dihapus", data: { items } });
  } catch (err) {
    console.error("removeCartItem error:", err);
    return res
      .status(500)
      .json({ message: "Gagal menghapus item", error: err.message });
  }
};

const mergeCart = async (req, res) => {
  try {
    const { session_id } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Harus login untuk merge cart" });
    }
    if (!session_id) {
      return res.status(400).json({ message: "session_id diperlukan" });
    }

    const guestCart = await cart.findFirst({ where: { session_id } });
    if (!guestCart) {
      return res.json({
        message: "Tidak ada cart guest untuk di-merge",
        data: { items: [] },
      });
    }

    let userCart = await cart.findFirst({ where: { user_id: userId } });

    if (!userCart) {
      await cart.update({
        where: { id: guestCart.id },
        data: { user_id: userId, session_id: null },
      });
      userCart = { id: guestCart.id }; // update() cuma return {where, data}, bukan row lengkap—lihat catatan
    } else {
      const guestItems = await cartItem.findMany({
        where: { cart_id: guestCart.id },
      });

      for (const gItem of guestItems) {
        const existing = await cartItem.findFirst({
          where: { cart_id: userCart.id, product_id: gItem.product_id },
        });
        if (existing) {
          await cartItem.update({
            where: { id: existing.id },
            data: { qty: existing.qty + gItem.qty },
          });
        } else {
          await cartItem.create({
            data: {
              cart_id: userCart.id,
              product_id: gItem.product_id,
              qty: gItem.qty,
              price_snapshot: gItem.price_snapshot,
            },
          });
        }
      }

      await cart.delete({ where: { id: guestCart.id } });
    }

    const items = await getCartWithItems(userCart.id);

    return res.json({ message: "Cart berhasil digabung", data: { items } });
  } catch (err) {
    console.error("mergeCart error:", err);
    return res
      .status(500)
      .json({ message: "Gagal merge cart", error: err.message });
  }
};

module.exports = {
  getCart,
  addCartItem,
  updateCartItem,
  removeCartItem,
  mergeCart,
};
