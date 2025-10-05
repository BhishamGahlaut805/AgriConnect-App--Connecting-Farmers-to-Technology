const url = import.meta.env.VITE_BACKEND_URL;

export const translateText = async (text, targetLang) => {
  if (!text || !targetLang) {
    console.warn("Translation request missing text or targetLang");
    return text;
  }
//   console.log("Translating text:", text, "to", targetLang);
  try {
    const response = await fetch(`${url}/api/translate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ q: text, target: targetLang }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Translation failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    // console.log("Translation response:", data);
    if (data.translatedText) {
      return data.translatedText;
    } else {
      console.warn(
        "Translation response missing 'translatedText'. Returning original."
      );
      return text;
    }
  } catch (error) {
    console.error("Frontend Translation Error:", error.message);
    return text; // Fallback to original content
  }
};
