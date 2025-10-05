const express = require("express");
const router = express.Router();
const requireAuth = require("../Middlewares/requireAuth");
const ctrl = require("../controllers/ShipmentController");
const { auth, protect } = require("../Middlewares/auth");
router.post("/quote", auth, ctrl.quote);
router.post("/book", auth, ctrl.bookShipment);

module.exports = router;
