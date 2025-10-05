const Review = require("../Models/Review");

exports.listReviews = async (req, res) => {
  const { refType, refId } = req.query;
  const filter = {};
  if (refType) filter.refType = refType;
  if (refId) filter.refId = refId;
  const docs = await Review.find(filter).sort({ createdAt: -1 }).limit(100);
  res.json(docs);
};

exports.createReview = async (req, res) => {
  const { refType, refId, rating, comment } = req.body;
  const r = await Review.create({
    refType,
    refId,
    rating,
    comment,
    author: req.user._id,
  });
  res.status(201).json(r);
};
