const Payment = require("../Models/Payment");
const Order = require("../Models/Order");

// create a payment (stub)
exports.createPaymentIntent = async (req, res) => {
  const { orderId } = req.body;
  const order = await Order.findById(orderId);
  if (!order) return res.status(404).json({ message: "Order not found" });
  // create a Payment record
  const p = await Payment.create({
    order: order._id,
    provider: "DummyPay",
    amount: order.total,
    status: "INIT",
  });
  // respond with fake provider order id
  res.json({
    providerOrderId: "DUMMY-" + p._id,
    paymentId: p._id,
    amount: p.amount,
  });
};

// webhook to mark payment success/fail
exports.webhook = async (req, res) => {
  // in real system verify signatures
  const payload = JSON.parse(req.body.toString());
  const { providerOrderId, providerPaymentId, status } = payload;
  // find payment by providerOrderId or internal id
  const payment =
    (await Payment.findOne({ providerOrderId })) ||
    (await Payment.findById(payload.paymentId));
  if (!payment) return res.status(404).json({ message: "Payment not found" });

  payment.status = status === "SUCCESS" ? "SUCCESS" : "FAILED";
  payment.providerPaymentId = providerPaymentId;
  payment.raw = payload;
  await payment.save();

  if (payment.status === "SUCCESS") {
    // mark order paid
    const order = await Order.findById(payment.order);
    order.payment.status = "PAID";
    order.payment.provider = payment.provider;
    order.payment.providerPaymentId = providerPaymentId;
    await order.save();
  }
  res.json({ ok: true });
};
