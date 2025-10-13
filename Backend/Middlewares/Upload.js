const multer = require("multer");
const path = require("path");

// Set storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // make sure this folder exists
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

// Filter for allowed file types (optional)
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) cb(null, true);
  else cb(new Error("Only image files allowed"), false);
};

// Export upload middleware
const upload = multer({ storage, fileFilter });

module.exports = { upload: upload.array("images", 5) };
