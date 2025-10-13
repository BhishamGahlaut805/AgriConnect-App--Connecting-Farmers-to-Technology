const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config({quiet: true}); // Load environment variables

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      retryWrites: true,
      w: "majority",
    });
    console.log(`MongoDB Connected`);
  } catch (err) {
    console.error(`MongoDB Connection Error: ${err.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
