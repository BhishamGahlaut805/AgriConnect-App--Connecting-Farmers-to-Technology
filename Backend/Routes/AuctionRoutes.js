const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/AuctionController");
const requireAuth = require("../Middlewares/requireAuth");
const { auth, protect } = require("../Middlewares/auth");

router.get("/", ctrl.listAuctions);
router.get("/:id", ctrl.getAuction);
router.post("/:id/bid", auth, ctrl.placeBid); // validated via socket as well

module.exports = router;
