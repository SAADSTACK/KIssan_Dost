import { GoogleGenAI } from "@google/genai";
import { KissanResponse } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

const MODEL_NAME = 'gemini-2.5-flash-preview-09-2025';

const systemInstruction = `
You are Kissan Dost (Farmer's Friend), a high-speed, expert agricultural advisor dedicated to maximizing yield and profitability for South Asian farmers.

**Core Directives:**
1.  **Tone & Persona:** Be respectful, encouraging, confident, and highly authoritative in agricultural science.
2.  **Multilingual:** Respond *only* in the language of the user's current query. 
    - If the user selects or speaks **Punjabi**, you MUST use the **Pakistani dialect (Western Punjabi)**. You may use **Shahmukhi script** or Roman Punjabi common in Pakistan.
    - **STRICTLY AVOID** Indian Punjabi (Gurmukhi) or Hindi-influenced vocabulary.
    - Urdu, Punjabi (Pakistani), and English are guaranteed. Pashto, Sindhi, or Balochi are supported if requested.
    - Never mix languages in a single response.
3.  **Actionable & Structured:** Your primary output MUST be a structured JSON object containing clear, step-by-step advice.
4.  **Grounding (RAG):** When asked about market prices (Mandi-Bhav) or climate strategies, you MUST enable Google Search grounding. Directly cite any external data used (e.g., "The current market price for Kinnow oranges in Multan is reported at X PKR/kg.")
5.  **Multi-Modal Diagnostics:** If the input includes an image, your first priority is to analyze the image (e.g., identify pests, disease, or nutrient deficiency) before providing structured advice on remediation.

**Output Rule:** 
You MUST output valid JSON only. Do not use Markdown code blocks. 
The JSON must strictly follow this schema:
{
  "advice_language": "String (The language used in the response)",
  "summary_heading": "String (A concise, actionable heading)",
  "diagnosis_or_market_finding": "String (Detailed diagnosis or real-time price finding)",
  "actionable_steps": ["String", "String", "String"],
  "long_term_strategy": "String (Recommendation for future resilience)"
}
`;

export const sendMessageToGemini = async (
  prompt: string,
  imageBase64?: string,
  preferredLanguage?: string
): Promise<{ data: KissanResponse; links: { title: string; url: string }[] }> => {
  if (!apiKey) {
    console.error("API Key is missing. Ensure process.env.API_KEY is set.");
    throw new Error("API Key is missing");
  }

  try {
    const parts: any[] = [];

    // If image exists, add it to parts
    if (imageBase64) {
      // Extract proper mime type if available, default to jpeg
      let mimeType = 'image/jpeg';
      let data = imageBase64;
      
      if (imageBase64.includes(';base64,')) {
        const split = imageBase64.split(';base64,');
        mimeType = split[0].replace('data:', '');
        data = split[1];
      } else if (imageBase64.startsWith('data:')) {
         const match = imageBase64.match(/data:([^;]+);base64,(.+)/);
         if (match) {
             mimeType = match[1];
             data = match[2];
         }
      } else {
        // Assume raw base64 without header is passed
        data = imageBase64;
      }

      parts.push({
        inlineData: {
          mimeType: mimeType, 
          data: data,
        },
      });
    }

    // Add text prompt
    let finalPrompt = prompt;
    if (preferredLanguage && preferredLanguage !== 'English') {
      finalPrompt += ` (Please reply in ${preferredLanguage})`;
    }
    parts.push({ text: finalPrompt });

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: {
        parts: parts
      },
      config: {
        systemInstruction: systemInstruction,
        // responseMimeType and responseSchema are NOT compatible with googleSearch tool
        // We enforce JSON structure via system instruction instead
        tools: [{ googleSearch: {} }], 
      },
    });

    let textResponse = response.text || "{}";
    
    // Robust JSON extraction: Find the first '{' and the last '}'
    const startIndex = textResponse.indexOf('{');
    const endIndex = textResponse.lastIndexOf('}');
    
    if (startIndex !== -1 && endIndex !== -1) {
      textResponse = textResponse.substring(startIndex, endIndex + 1);
    } else {
      console.warn("Could not find JSON braces in response, attempting cleanup");
      // Fallback cleanup
      textResponse = textResponse.replace(/^```json\s*/, '').replace(/^```\s*/, '').replace(/```$/, '').trim();
    }

    let parsedResponse: KissanResponse;
    try {
      parsedResponse = JSON.parse(textResponse) as KissanResponse;
    } catch (parseError) {
      console.error("JSON Parse Failed:", textResponse);
      throw new Error("Failed to parse AI response. Please try again.");
    }

    // Safety check for required array
    if (!parsedResponse.actionable_steps || !Array.isArray(parsedResponse.actionable_steps)) {
      parsedResponse.actionable_steps = [];
    }
    if (!parsedResponse.diagnosis_or_market_finding) {
      parsedResponse.diagnosis_or_market_finding = "Information unavailable.";
    }

    // Extract grounding links if available
    const links: { title: string; url: string }[] = [];
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (chunks) {
      chunks.forEach((chunk: any) => {
        if (chunk.web?.uri) {
          links.push({
            title: chunk.web.title || 'Source',
            url: chunk.web.uri
          });
        }
      });
    }

    return { data: parsedResponse, links };

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};