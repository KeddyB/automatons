// utils/InstructionParser.ts

export interface AutomationAction {
  action: 'CLICK' | 'SCROLL_FORWARD' | 'SCROLL_BACKWARD' | 'INPUT_TEXT' | 'NAVIGATE_APP' | 'NONE';
  target?: {
    text?: string;
    resourceId?: string;
    // Add other target identifiers as needed
  };
  value?: string; // For INPUT_TEXT action
  appName?: string; // For NAVIGATE_APP action
  reason?: string; // For NONE action
}

/**
 * Parses a user instruction and screen content to determine the next automation action.
 * In a real scenario, this would involve sending data to an LLM or a sophisticated rule engine.
 * For now, it's a mock that returns a predefined action based on a simple heuristic.
 *
 * @param userInstruction The instruction provided by the user.
 * @param currentUiJson The JSON representation of the current screen's UI hierarchy.
 * @param previousStepsJson Optional: JSON of previous automation steps for context.
 * @returns A Promise resolving to an AutomationAction object.
 */
export async function parseInstruction(
  userInstruction: string,
  currentUiJson: string,
  previousStepsJson: string = '[]'
): Promise<AutomationAction> {
  console.log('Parsing instruction with:', { userInstruction, currentUiJson, previousStepsJson });

  // This is a placeholder for LLM integration.
  // In a real application, you would construct the prompt using `prompt_template.md`
  // send it to an LLM API, and parse the JSON response.

  // Mock implementation:
  if (userInstruction.toLowerCase().includes("click example button")) {
    return { action: 'CLICK', target: { text: 'Example Button' } };
  }
  if (userInstruction.toLowerCase().includes("scroll down")) {
    // This assumes there's a scrollable element. In a real scenario,
    // the LLM would identify *which* element to scroll based on currentUiJson.
    return { action: 'SCROLL_FORWARD', target: { text: 'Scrollable List' } }; // Placeholder
  }
  if (userInstruction.toLowerCase().includes("type 'hello'")) {
    return { action: 'INPUT_TEXT', target: { text: 'Input Field' }, value: 'hello' }; // Placeholder
  }
  if (userInstruction.toLowerCase().includes("open settings")) {
    return { action: 'NAVIGATE_APP', appName: 'Settings' };
  }

  // Default to no action
  return { action: 'NONE', reason: 'Could not determine a specific action for the instruction.' };
}
