const Category = require("../Models/Category");
const asyncHandler = require("../utils/asyncHandler");
const slugify = (s) => s.toLowerCase().replace(/\s+/g, "-");

exports.create = asyncHandler(async (req, res) => {
  const { name, parent } = req.body;
  const doc = await Category.create({
    name,
    slug: slugify(name),
    parent: parent || null,
  });
  res.status(201).json({ message: "Category created", data: doc });
});

exports.list = asyncHandler(async (req, res) => {
  const data = await Category.find().sort("name");
  res.json({ data });
});

exports.update = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, parent } = req.body;
  const doc = await Category.findByIdAndUpdate(
    id,
    {
      name,
      slug: name ? slugify(name) : undefined,
      parent: parent ?? undefined,
    },
    { new: true }
  );
  if (!doc) return res.status(404).json({ message: "Not found" });
  res.json({ message: "Updated", data: doc });
});

exports.remove = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const doc = await Category.findByIdAndDelete(id);
  if (!doc) return res.status(404).json({ message: "Not found" });
  res.json({ message: "Deleted" });
});
