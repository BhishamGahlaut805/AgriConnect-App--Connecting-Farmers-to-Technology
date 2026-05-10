const express = require("express");
const router = express.Router();

router.use("/products", require("./productRoutes"));
router.use("/crops", require("./cropRoutes"));
router.use("/auctions", require("./AuctionRoutes"));
router.use("/cart", require("./CartRoutes"));
router.use("/orders", require("./OrderRoutes"));
router.use("/inventory", require("./InventoryRoutes"));
router.use("/reviews", require("./ReviewRoutes"));
router.use("/chat", require("./chatRoutes"));
router.use("/shipment", require("./ShipmentRoutes"));
router.use("/payments", require("./PaymentRoutes"));
router.use("/admin", require("./AdminRoutes"));
router.use("/cms", require("./cmsRoutes"));
router.use("/listings", require("./ListingRoutes"));
router.use("/dashboard", require("./DashboardRoutes"));
router.use("/tracking", require("./TrackOrderShipmentRoutes"));
router.use("/addresses", require("./AddressRoutes"));

module.exports = router;
