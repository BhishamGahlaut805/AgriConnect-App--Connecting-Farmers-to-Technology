const express = require("express");
const router = express.Router();
const { auth, protect } = require("../Middlewares/auth");
const ctrl = require("../controllers/CropController");
const upload = require("../Utils/Upload");

router.get("/", ctrl.listCrops);
router.get("/:id", ctrl.getCrop);
router.post("/", auth, upload.array("images", 6), ctrl.createCrop);
router.patch("/:id", auth, ctrl.updateCrop);
router.post("/:id/auction", auth, ctrl.createAuctionForCrop);

module.exports = router;
