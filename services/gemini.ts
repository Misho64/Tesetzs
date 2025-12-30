
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { GenerationSettings } from "../types";

const API_KEY = process.env.API_KEY || "";

export const generateProductScene = async (
  base64Image: string,
  settings: GenerationSettings
): Promise<string | null> => {
  if (!API_KEY) {
    throw new Error("API Key is missing. Please check your environment.");
  }

  const ai = new GoogleGenAI({ apiKey: API_KEY });
  
  const { 
    angle, 
    lighting, 
    mockup, 
    manipulation, 
    productRetouch, 
    peopleRetouch, 
    transparentBackground,
    aspectRatio,
    prompt 
  } = settings;

  // Build the enhanced prompt
  let finalPrompt = `Professional commercial product photography. 
  Camera Angle: ${angle}. 
  Lighting: ${lighting}. 
  Aspect Ratio: ${aspectRatio}.`;

  if (mockup !== 'None') finalPrompt += `\nEnvironment: Place the product in a ${mockup} setting.`;
  if (manipulation !== 'None') finalPrompt += `\nSpecial Effects: Apply ${manipulation} effects to the scene.`;
  if (productRetouch !== 'None') finalPrompt += `\nProduct Refinement: Apply ${productRetouch} to the main product for a premium look.`;
  if (peopleRetouch !== 'None') finalPrompt += `\nPeople Enhancement: If any people are present, apply ${peopleRetouch}.`;
  
  if (transparentBackground) {
    finalPrompt += `\nBackground: Place the product on a perfectly clean, solid white background for easy cutout (mimic transparent PNG style).`;
  } else if (prompt) {
    finalPrompt += `\nCustom Instructions: ${prompt}`;
  }

  finalPrompt += `\nMaintain the original product's key identifiers and shape perfectly. High-end retouching, 8k resolution, photorealistic.`;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Image.split(',')[1],
              mimeType: 'image/png',
            },
          },
          {
            text: finalPrompt,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio === '1:1' ? '1:1' : aspectRatio === '16:9' ? '16:9' : '9:16'
        }
      }
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }

    return null;
  } catch (error) {
    console.error("Gemini Generation Error:", error);
    throw error;
  }
};
