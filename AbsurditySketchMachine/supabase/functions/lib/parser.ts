// Utility function for parsing the response from the Gemini API

export function parseGeminiResponse(text: string): any {
  try {
    // Use a regular expression to extract the JSON object from the text
    const jsonRegex = /```json\n(.*)\n```/s;
    const match = text.match(jsonRegex);

    if (match && match[1]) {
      return JSON.parse(match[1]);
    } else {
      // If the regex doesn't match, try to parse the whole string
      return JSON.parse(text);
    }
  } catch (error) {
    console.error("Failed to parse Gemini response:", error);
    return null;
  }
}

