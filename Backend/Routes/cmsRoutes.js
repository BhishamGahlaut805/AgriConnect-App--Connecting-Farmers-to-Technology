const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/CMSController");
const requireAuth = require("../Middlewares/requireAuth");
const requireRole = require("../middlewares/requireRole");
const { auth, protect } = require("../Middlewares/auth");

router.get("/", ctrl.list);
router.get("/:id", ctrl.get);
router.post("/", auth, requireRole("Admin"), ctrl.create);
router.patch("/:id", auth, requireRole("Admin"), ctrl.update);

module.exports = router;
