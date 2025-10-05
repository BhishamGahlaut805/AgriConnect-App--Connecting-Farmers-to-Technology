const express = require("express");
const router = express.Router();
const requireAuth = require("../Middlewares/requireAuth");
const ctrl = require("../controllers/ReviewController");
const { auth, protect } = require("../Middlewares/auth");
router.get("/", ctrl.listReviews);
router.post("/", auth, ctrl.createReview);

module.exports = router;
