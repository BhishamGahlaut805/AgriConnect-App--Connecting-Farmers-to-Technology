const express = require("express");
const router = express.Router();
const requireAuth = require("../Middlewares/requireAuth");
const ctrl = require("../controllers/ChatController");
const { auth, protect } = require("../Middlewares/auth");

router.get("/threads", auth, ctrl.listThreads);
router.post("/threads/:userId", auth, ctrl.createThread);
router.get("/threads/:id", auth, ctrl.getThread);

module.exports = router;
