const ChatThread = require("../Models/ChatThread");

exports.listThreads = async (req, res) => {
  const threads = await ChatThread.find({ participants: req.user._id })
    .sort({ updatedAt: -1 })
    .limit(50);
  res.json(threads);
};

exports.createThread = async (req, res) => {
  const otherId = req.params.userId;
  let thread = await ChatThread.findOne({
    participants: { $all: [req.user._id, otherId] },
  });
  if (!thread)
    thread = await ChatThread.create({
      participants: [req.user._id, otherId],
      messages: [],
    });
  res.json(thread);
};

exports.getThread = async (req, res) => {
  const thread = await ChatThread.findById(req.params.id);
  if (!thread) return res.status(404).json({ message: "Not found" });
  if (!thread.participants.includes(req.user._id))
    return res.status(403).json({ message: "Forbidden" });
  res.json(thread);
};
