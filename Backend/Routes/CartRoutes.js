const express = require("express");
const router = express.Router();
const { check } = require("express-validator");
const validate = require("../middlewares/validate");
const { auth, protect } = require("../Middlewares/auth");
const upload = require("../Utils/Upload");
const controller = require("../controllers/CartController");

router.get("/", auth, controller.getCart);

router.post(
  "/add",
  [
    auth,
    check("listingId").isMongoId(),
    check("qty").isInt({ gt: 0 }),
    validate,
  ],
  controller.addItem
);

router.put(
  "/update",
  [
    auth,
    check("listingId").isMongoId(),
    check("qty").isInt({ gt: 0 }),
    validate,
  ],
  controller.updateItem
);

router.delete(
  "/remove",
  [auth, check("listingId").isMongoId(), validate],
  controller.removeItem
);

module.exports = router;
