const Cart = require("../Models/Cart");
const Product = require("../Models/Product");

exports.getCart = async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id }).populate(
    "items.product"
  );
  res.json(cart || { items: [] });
};

exports.addItem = async (req, res) => {
  const { productId, qty = 1 } = req.body;
  const product = await Product.findById(productId);
  if (!product || !product.active)
    return res.status(404).json({ message: "Product not available" });

  const cart = await Cart.findOneAndUpdate(
    { user: req.user._id },
    { $setOnInsert: { user: req.user._id } },
    { upsert: true, new: true }
  );
  const idx = cart.items.findIndex(
    (it) => String(it.product) === String(productId)
  );
  if (idx >= 0) {
    cart.items[idx].qty += qty;
  } else {
    cart.items.push({ product: productId, qty });
  }
  await cart.save();
  res.json(cart);
};

exports.updateItem = async (req, res) => {
  const { productId, qty } = req.body;
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) return res.status(404).json({ message: "Cart empty" });
  const idx = cart.items.findIndex(
    (it) => String(it.product) === String(productId)
  );
  if (idx < 0) return res.status(404).json({ message: "Item not in cart" });
  if (qty <= 0) cart.items.splice(idx, 1);
  else cart.items[idx].qty = qty;
  await cart.save();
  res.json(cart);
};

exports.removeItem = async (req, res) => {
  const { productId } = req.params;
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) return res.status(404).json({ message: "Cart empty" });
  cart.items = cart.items.filter(
    (it) => String(it.product) !== String(productId)
  );
  await cart.save();
  res.json(cart);
};
