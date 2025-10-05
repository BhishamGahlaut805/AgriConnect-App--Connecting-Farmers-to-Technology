const Auction = require("../Models/Auction");
module.exports = function (io) {
  io.of("/auction").on("connection", (socket) => {
    console.log("auction socket connected", socket.id);

    socket.on("join", (auctionId) => {
      socket.join(auctionId);
    });

    socket.on("bid", async (data) => {
      // data: { auctionId, buyerId, amount }
      const auction = await Auction.findById(data.auctionId);
      if (!auction) return socket.emit("error", "Auction not found");
      if (auction.status !== "OPEN")
        return socket.emit("error", "Auction not open");
      const highest = auction.bids.length
        ? Math.max(...auction.bids.map((b) => b.amount))
        : auction.startPrice;
      if (data.amount < highest + auction.minIncrement)
        return socket.emit("error", "Bid too low");

      auction.bids.push({
        buyer: data.buyerId,
        amount: data.amount,
        placedAt: new Date(),
      });
      await auction.save();

      io.of("/auction")
        .to(data.auctionId)
        .emit("newBid", { buyer: data.buyerId, amount: data.amount });
    });
  });
};
