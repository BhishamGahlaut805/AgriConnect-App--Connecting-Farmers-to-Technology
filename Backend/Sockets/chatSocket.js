module.exports = function (io) {
  io.of("/chat").on("connection", (socket) => {
    console.log("chat socket connected", socket.id);

    socket.on("join", (threadId) => {
      socket.join(threadId);
    });

    socket.on("message", async (data) => {
      // data: { threadId, from, to, text, attachments }
      // Save to DB, then emit
      const ChatThread = require("../Models/ChatThread");
      const thread = await ChatThread.findById(data.threadId);
      if (!thread) return;
      thread.messages.push({
        from: data.from,
        to: data.to,
        text: data.text,
        attachments: data.attachments || [],
      });
      await thread.save();
      io.of("/chat").to(data.threadId).emit("message", data);
    });
  });
};
