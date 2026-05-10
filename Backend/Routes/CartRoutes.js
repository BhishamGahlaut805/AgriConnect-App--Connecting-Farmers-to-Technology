const express = require("express");
const router = express.Router();
const { check } = require("express-validator");
const validate = require("../Middlewares/validate");
const { auth } = require("../Middlewares/auth");
const controller = require("../Controllers/CartController");

router.get("/", auth, controller.getCart);

router.post(
  "/add",
  [
    auth,
    check("listingId", "Valid product ID required").isMongoId(),
    check("qty", "Quantity must be greater than 0").isInt({ gt: 0 }),
    validate,
  ],
  controller.addItem,
);

router.put(
  "/update",
  [
    auth,
    check("listingId", "Valid product ID required").isMongoId(),
    check("qty", "Quantity must be greater than 0").isInt({ gt: 0 }),
    validate,
  ],
  controller.updateItem,
);

router.delete(
  "/remove",
  [auth, check("listingId", "Valid product ID required").isMongoId(), validate],
  controller.removeItem,
);

module.exports = router;
