
import { GoogleGenAI, Modality } from "@google/genai";
import { AspectRatio, BackgroundStyle } from '../types';

if (!process.env.API_KEY) {
    console.warn("API_KEY environment variable not set. Using a placeholder. Please set your API key for the app to function.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "YOUR_API_KEY_HERE" });

const fileToGenerativePart = (base64: string, mimeType: string) => {
  return {
    inlineData: {
      data: base64,
      mimeType,
    },
  };
};

export const generateAdvertisingImage = async (
  modelImage: { base64: string; mimeType: string },
  productImage: { base64: string; mimeType: string },
  prompt: string,
  background: BackgroundStyle,
  aspectRatio: AspectRatio
): Promise<string> => {
    try {
        const fullPrompt = `Create a professional, ultra-realistic 4K advertising photograph by seamlessly combining the provided model and product images.
        
        Scene description: "${prompt}"
        
        Key requirements:
        - The final image must be photorealistic with natural skin textures and cinematic lighting.
        - Background Style: ${background}.
        - Aspect Ratio: ${aspectRatio}.
        - The model should be holding or interacting with the product naturally.
        - The product must be clearly visible, true to its original form, and not distorted.
        - The final output resolution must be 4K.
        
        Analyze the model and product images, then generate the composite advertising image based on these instructions.`;

        const modelImagePart = fileToGenerativePart(modelImage.base64, modelImage.mimeType);
        const productImagePart = fileToGenerativePart(productImage.base64, productImage.mimeType);
        const textPart = { text: fullPrompt };
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image-preview',
            contents: {
                parts: [modelImagePart, productImagePart, textPart],
            },
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        });

        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
            }
        }

        throw new Error("AI did not return an image. It might have responded with text only. Check the response text if available.");

    } catch (error) {
        console.error("Error generating image with Gemini API:", error);
        if (error instanceof Error && error.message.includes("API key not valid")) {
             throw new Error("The configured API key is invalid. Please check your API key.");
        }
        throw new Error("Failed to generate image. Please try again.");
    }
};
