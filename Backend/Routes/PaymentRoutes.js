const express = require("express");
const router = express.Router();
const requireAuth = require("../Middlewares/requireAuth");
const ctrl = require("../controllers/PaymentController");
const { auth, protect } = require("../Middlewares/auth");

router.post("/create", auth, ctrl.createPaymentIntent); // returns providerOrder stub
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  ctrl.webhook
); // provider posts here

module.exports = router;
