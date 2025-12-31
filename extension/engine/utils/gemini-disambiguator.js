class GeminiDisambiguator {
  apiKey;
  constructor(apiKey) {
    this.apiKey = apiKey;
  }
  /** Disambiguate which element user wants when multiple found */
  async selectElement(userIntent, elements) {
    const elementSummaries = elements.map((el, idx) => ({
      index: idx,
      tag: el.tag,
      text: el.textContent?.slice(0, 50),
      ariaLabel: el.ariaLabel,
      position: el.position.pos,
      indexPath: el.indexPath
    }));
    const prompt = `User said: "${userIntent}"
Available elements:
${JSON.stringify(elementSummaries, null, 2)}

Which element matches the user's intent? Return ONLY the indexPath as JSON array.
Example: [0, 2, 5]`;
    try {
      const response = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": this.apiKey
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [{ text: prompt }]
              }
            ],
            generationConfig: {
              temperature: 0.1,
              maxOutputTokens: 50
            }
          })
        }
      );
      const data = await response.json();
      const text = data.candidates[0].content.parts[0].text.trim();
      const match = text.match(/\[[\d,\s]+\]/);
      if (!match) throw new Error("Invalid response format");
      return JSON.parse(match[0]);
    } catch (error) {
      console.error("[Gemini] Disambiguation failed:", error);
      return elements[0].indexPath;
    }
  }
}
export {
  GeminiDisambiguator
};
