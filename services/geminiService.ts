import { GoogleGenAI } from "@google/genai";

const AI_MODEL = 'gemini-2.5-flash-image';

export const generateVerticalImage = async (
  imageBase64: string,
  mimeType: string,
  prompt: string
): Promise<string> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing. Please check your environment configuration.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    const response = await ai.models.generateContent({
      model: AI_MODEL,
      contents: {
        parts: [
          {
            inlineData: {
              data: imageBase64,
              mimeType: mimeType,
            },
          },
          {
            text: prompt || "Transform this image to 9:16 portrait aspect ratio, maintaining the subject and style.",
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: "9:16",
        },
      },
    });

    // Check response for image data
    const candidates = response.candidates;
    if (!candidates || candidates.length === 0) {
      throw new Error("No candidates returned from Gemini.");
    }

    const parts = candidates[0].content.parts;
    let imageUri = null;

    for (const part of parts) {
      if (part.inlineData) {
        const base64Data = part.inlineData.data;
        // The API usually returns image/jpeg or image/png
        // We assume png/jpeg based on standard behavior, but checking mimetype from response would be ideal if available.
        // The inlineData typically contains raw base64.
        imageUri = `data:image/png;base64,${base64Data}`;
        break;
      }
    }

    if (!imageUri) {
      throw new Error("No image generated in the response.");
    }

    return imageUri;

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw new Error(error.message || "Failed to generate image.");
  }
};
