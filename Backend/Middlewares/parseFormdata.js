// middlewares/formParser.js
const multer = require("multer");

const parseForm = multer().none(); // Accept form fields, but no files

module.exports = parseForm;
