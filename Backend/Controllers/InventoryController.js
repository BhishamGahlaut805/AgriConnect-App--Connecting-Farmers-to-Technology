const Inventory = require("../Models/Inventory");
const Product = require("../Models/Product");

exports.listInventory = async (req, res) => {
  const owner = req.user._id;
  const items = await Inventory.find({ owner }).populate("product");
  res.json(items);
};

exports.updateInventory = async (req, res) => {
  // seller updates their inventory for a product
  const { productId, quantity } = req.body;
  const product = await Product.findById(productId);
  if (!product) return res.status(404).json({ message: "Product not found" });
  if (
    String(product.seller) !== String(req.user._id) &&
    req.user.role !== "Admin"
  )
    return res.status(403).json({ message: "Forbidden" });

  await Inventory.updateOne(
    { owner: product.seller, product: productId },
    { $set: { quantity } },
    { upsert: true }
  );
  product.stock = quantity;
  await product.save();
  res.json({ message: "updated" });
};
