// Backend/Routes/Translate.js
const express = require("express");
const axios = require("axios");
const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { q, target } = req.body;

    if (!q || !target) {
      return res
        .status(400)
        .json({ message: "Missing text or target language" });
    }

    // Split into 500 character chunks
    const chunks = q.match(/.{1,500}/g);
    const translatedChunks = [];

    for (const chunk of chunks) {
      const response = await axios.post(
        "https://libretranslate.com/translate",
        {
          q: chunk,
          source: "en",
          target: target,
          format: "text",
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      translatedChunks.push(response.data.translatedText);
    }

    const translatedText = translatedChunks.join(" ");
    res.json({ translatedText });
  } catch (error) {
    console.error("Translation error:", error.message);
    res
      .status(500)
      .json({ message: "Translation failed", error: error.message });
  }
});

module.exports = router;
