const mongoose = require("mongoose");
const Cart = require("../Models/Cart");
const Order = require("../Models/Order");
const Product = require("../Models/Product");
const Inventory = require("../Models/Inventory");
const Payment = require("../Models/Payment");

// create order from cart
exports.createOrderFromCart = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const cart = await Cart.findOne({ user: req.user._id })
      .populate("items.product")
      .session(session);
    if (!cart || !cart.items.length) {
      await session.abortTransaction();
      return res.status(400).json({ message: "Cart empty" });
    }

    // group items by seller
    const sellers = {};
    cart.items.forEach((it) => {
      const sellerId = String(it.product.seller);
      sellers[sellerId] = sellers[sellerId] || [];
      sellers[sellerId].push(it);
    });

    // For simplification: create one order per seller. Here we create first seller order.
    const sellerId = Object.keys(sellers)[0];
    const items = sellers[sellerId].map((it) => ({
      refType: "PRODUCT",
      refId: it.product._id,
      title: it.product.title,
      unitPrice: it.product.price,
      qty: it.qty,
      unit: it.product.unit,
    }));

    // reserve stock atomically
    for (let it of sellers[sellerId]) {
      const prod = await Product.findById(it.product._id).session(session);
      if (!prod) throw { status: 400, message: "Product not found" };
      if (prod.stock < it.qty)
        throw { status: 400, message: `Insufficient stock for ${prod.title}` };

      prod.stock -= it.qty;
      await prod.save({ session });

      await Inventory.updateOne(
        { owner: prod.seller, product: prod._id },
        { $inc: { reserved: it.qty } },
        { session }
      );
    }

    const subtotal = items.reduce((s, i) => s + i.unitPrice * i.qty, 0);
    const tax = Math.round(subtotal * 0.05); // 5% sample
    const shippingFee = 0;
    const total = subtotal + tax + shippingFee;

    const order = await Order.create(
      [
        {
          buyer: req.user._id,
          seller: sellerId,
          items,
          subtotal,
          tax,
          shippingFee,
          total,
          payment: { status: "PENDING" },
          shippingAddress: req.body.shippingAddress || req.user.address,
        },
      ],
      { session }
    );

    // clear cart items we used
    cart.items = cart.items.filter(
      (it) => String(it.product.seller) !== sellerId
    );
    await cart.save({ session });

    await session.commitTransaction();
    session.endSession();
    res.status(201).json(order[0]);
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
};

exports.getOrder = async (req, res) => {
  const o = await Order.findById(req.params.id).populate("buyer seller");
  if (!o) return res.status(404).json({ message: "Not found" });
  // only buyer, seller or admin allowed
  if (
    String(req.user._id) !== String(o.buyer._id) &&
    String(req.user._id) !== String(o.seller._id) &&
    req.user.role !== "Admin"
  ) {
    return res.status(403).json({ message: "Forbidden" });
  }
  res.json(o);
};

exports.cancelOrder = async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ message: "Not found" });
  if (String(order.buyer) !== String(req.user._id) && req.user.role !== "Admin")
    return res.status(403).json({ message: "Forbidden" });
  if (order.status !== "CREATED" && order.status !== "CONFIRMED")
    return res.status(400).json({ message: "Cannot cancel" });

  // restore inventory - simple logic
  for (let item of order.items) {
    if (item.refType === "PRODUCT") {
      await Product.findByIdAndUpdate(item.refId, {
        $inc: { stock: item.qty },
      });
      await Inventory.updateOne(
        { product: item.refId },
        { $inc: { reserved: -item.qty } }
      );
    }
  }
  order.status = "CANCELLED";
  order.payment.status = "FAILED";
  await order.save();
  res.json({ message: "Cancelled" });
};

exports.advanceOrderStatus = async (req, res) => {
  // seller or admin advances status
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ message: "Not found" });
  if (
    String(req.user._id) !== String(order.seller) &&
    req.user.role !== "Admin"
  )
    return res.status(403).json({ message: "Forbidden" });

  const to = req.body.status;
  order.status = to;
  order.tracking.push({
    status: to,
    at: new Date(),
    note: req.body.note || "",
  });
  await order.save();
  res.json(order);
};
