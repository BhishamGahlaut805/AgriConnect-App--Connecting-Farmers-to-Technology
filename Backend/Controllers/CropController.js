const Crop = require("../Models/Crop");
const Auction = require("../Models/Auction");

exports.listCrops = async (req, res) => {
  const { cropType, state, page = 1, limit = 20 } = req.query;
  const filter = { status: "LISTED" };
  if (cropType) filter.cropType = cropType;
  if (state) filter["location.state"] = state;
  const docs = await Crop.find(filter)
    .skip((page - 1) * limit)
    .limit(parseInt(limit));
  res.json({ data: docs });
};

exports.getCrop = async (req, res) => {
  const doc = await Crop.findById(req.params.id).populate(
    "farmer",
    "name phone"
  );
  if (!doc) return res.status(404).json({ message: "Not found" });
  res.json(doc);
};

exports.createCrop = async (req, res) => {
  const body = req.body;
  body.images = (req.files || []).map((f) => "/" + f.path.replace(/\\/g, "/"));
  body.farmer = req.user._id;
  const crop = await Crop.create(body);
  res.status(201).json(crop);
};

exports.updateCrop = async (req, res) => {
  const crop = await Crop.findById(req.params.id);
  if (!crop) return res.status(404).json({ message: "Not found" });
  if (String(crop.farmer) !== String(req.user._id) && req.user.role !== "Admin")
    return res.status(403).json({ message: "Forbidden" });
  if (req.files && req.files.length)
    crop.images = crop.images.concat(
      req.files.map((f) => "/" + f.path.replace(/\\/g, "/"))
    );
  Object.assign(crop, req.body);
  await crop.save();
  res.json(crop);
};

exports.createAuctionForCrop = async (req, res) => {
  const crop = await Crop.findById(req.params.id);
  if (!crop) return res.status(404).json({ message: "Crop not found" });
  if (String(crop.farmer) !== String(req.user._id) && req.user.role !== "Admin")
    return res.status(403).json({ message: "Forbidden" });
  if (crop.status !== "LISTED")
    return res.status(400).json({ message: "Crop not available for auction" });

  const {
    startPrice,
    minIncrement = 1,
    startAt = new Date(),
    endAt,
  } = req.body;
  const auction = await Auction.create({
    crop: crop._id,
    startPrice,
    minIncrement,
    startAt,
    endAt,
    status: "SCHEDULED",
  });

  crop.status = "UNDER_AUCTION";
  await crop.save();
  res.status(201).json(auction);
};
