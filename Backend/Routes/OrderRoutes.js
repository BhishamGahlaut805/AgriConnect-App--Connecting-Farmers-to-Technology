const express = require("express");
const router = express.Router();
const requireAuth = require("../Middlewares/requireAuth");
const ctrl = require("../controllers/OrderController");
const { auth, protect } = require("../Middlewares/auth");

router.post("/", auth, ctrl.createOrderFromCart);
router.get("/:id", auth, ctrl.getOrder);
router.post("/:id/cancel", auth, ctrl.cancelOrder);
router.post("/:id/advance", auth, ctrl.advanceOrderStatus); // seller/admin action

module.exports = router;
