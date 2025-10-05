const express = require("express");
const router = express.Router();
const requireAuth = require("../middlewares/requireAuth");
const ctrl = require("../controllers/CartController");

router.get("/", requireAuth, ctrl.getCart);
router.post("/items", requireAuth, ctrl.addItem);
router.patch("/items", requireAuth, ctrl.updateItem);
router.delete("/items/:productId", requireAuth, ctrl.removeItem);

module.exports = router;
