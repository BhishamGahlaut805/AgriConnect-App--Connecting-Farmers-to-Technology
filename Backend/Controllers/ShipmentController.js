const Shipment = require("../Models/Shipment");

// simple pincode-based quote
exports.quote = async (req, res) => {
  const { fromPincode, toPincode, weightKg } = req.body;
  // simple rate calc: base + per-kg * km-estimate (we'll fake distance)
  const base = 50;
  const perKg = 10;
  const rate = base + perKg * (weightKg || 1);
  res.json({ rate, currency: "INR" });
};

exports.bookShipment = async (req, res) => {
  const {
    orderId,
    courier = "LocalCourier",
    rate,
    fromPincode,
    toPincode,
  } = req.body;
  const trackingNumber = "TRK" + Date.now();
  const s = await Shipment.create({
    order: orderId,
    courier,
    trackingNumber,
    rate,
    fromPincode,
    toPincode,
    status: "BOOKED",
  });
  res.json(s);
};
