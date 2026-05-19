import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.warn("GEMINI_API_KEY is not defined in environment variables.");
}

export const genAI = new GoogleGenerativeAI(apiKey || '');

export const emergencySafetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    // Emergency medical advice might trigger "dangerous content" filters, so we set a higher threshold
    threshold: HarmBlockThreshold.BLOCK_NONE, 
  },
];

export const geminiPro = genAI.getGenerativeModel({
  model: 'gemini-1.5-pro',
  safetySettings: emergencySafetySettings,
});

export const geminiFlash = genAI.getGenerativeModel({
  model: 'gemini-1.5-flash',
  safetySettings: emergencySafetySettings,
});
