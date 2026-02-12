import { GoogleGenerativeAI } from "@google/generative-ai";
import { PROMPT_TEMPLATE } from "../ai/prompt_template";

export interface AutomationAction {
  action: 'CLICK' | 'SCROLL_FORWARD' | 'SCROLL_BACKWARD' | 'INPUT_TEXT' | 'NAVIGATE_APP' | 'NONE';
  target?: {
    text?: string;
    resourceId?: string;
    id?: number;
  };
  value?: string; // For INPUT_TEXT action
  appName?: string; // For NAVIGATE_APP action
  reason?: string; // For NONE action
}

// In a real Expo app, set this in your .env file as EXPO_PUBLIC_GEMINI_API_KEY
const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(API_KEY);

export async function parseInstruction(
  userInstruction: string,
  currentUiJson: string,
  previousStepsJson: string = '[]'
): Promise<AutomationAction> {
  console.log('Parsing instruction with Gemini...');

  if (!API_KEY) {
    console.error("EXPO_PUBLIC_GEMINI_API_KEY is not set.");
    return { action: 'NONE', reason: 'API Key missing. Please set EXPO_PUBLIC_GEMINI_API_KEY in your .env file.' };
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = PROMPT_TEMPLATE
      .replace('{{CURRENT_UI_JSON}}', currentUiJson)
      .replace('{{USER_INSTRUCTION}}', userInstruction)
      .replace('{{PREVIOUS_STEPS_JSON}}', previousStepsJson);

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Clean the response (sometimes LLMs wrap JSON in code blocks)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return parsed as AutomationAction;
    }

    return { action: 'NONE', reason: 'Failed to parse JSON from AI response.' };
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    return { action: 'NONE', reason: `AI Error: ${error instanceof Error ? error.message : String(error)}` };
  }
}
