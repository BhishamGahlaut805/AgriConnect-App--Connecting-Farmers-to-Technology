const express = require("express");
const router = express.Router();
const requireAuth = require("../Middlewares/requireAuth");
const ctrl = require("../controllers/InventoryController");
const { auth, protect } = require("../Middlewares/auth");

router.get("/", auth, ctrl.listInventory);
router.post("/", auth, ctrl.updateInventory);

module.exports = router;
