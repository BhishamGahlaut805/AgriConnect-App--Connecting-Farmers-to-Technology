const CMS = require("../Models/CMS");

exports.list = async (req, res) => {
  const docs = await CMS.find({ active: true });
  res.json(docs);
};

exports.get = async (req, res) => {
  const d = await CMS.findById(req.params.id);
  if (!d) return res.status(404).json({ message: "Not found" });
  res.json(d);
};

exports.create = async (req, res) => {
  const d = await CMS.create(req.body);
  res.status(201).json(d);
};

exports.update = async (req, res) => {
  const d = await CMS.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(d);
};
