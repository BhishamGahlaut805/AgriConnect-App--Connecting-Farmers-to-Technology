const Auction = require("../Models/Auction");
const AuctionModel = Auction;

exports.listAuctions = async (req, res) => {
  const now = new Date();
  const list = await Auction.find({ status: "OPEN" }).populate("crop");
  res.json(list);
};

exports.getAuction = async (req, res) => {
  const a = await Auction.findById(req.params.id)
    .populate("crop")
    .populate("bids.buyer", "name");
  if (!a) return res.status(404).json({ message: "Not found" });
  res.json(a);
};

exports.placeBid = async (req, res) => {
  const { amount } = req.body;
  const auction = await Auction.findById(req.params.id);
  if (!auction) return res.status(404).json({ message: "Not found" });
  if (auction.status !== "OPEN")
    return res.status(400).json({ message: "Auction not open" });
  const highest = auction.bids.length
    ? Math.max(...auction.bids.map((b) => b.amount))
    : auction.startPrice;
  if (amount < highest + auction.minIncrement)
    return res.status(400).json({ message: "Bid too low" });

  auction.bids.push({ buyer: req.user._id, amount, placedAt: new Date() });
  await auction.save();

  // Optionally emit socket event here; sockets also manage live flow.
  res.json({ message: "Bid placed" });
};
