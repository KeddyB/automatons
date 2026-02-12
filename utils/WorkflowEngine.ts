// utils/WorkflowEngine.ts
import { NativeModules } from 'react-native';
import { AutomationAction, parseInstruction } from './InstructionParser';

const { AccessibilityModule } = NativeModules;

export class WorkflowEngine {
  private isRunning: boolean;
  private onStatusUpdate: (status: string) => void;
  private previousSteps: AutomationAction[];

  constructor(onStatusUpdate: (status: string) => void) {
    this.isRunning = false;
    this.onStatusUpdate = onStatusUpdate;
    this.previousSteps = [];
  }

  async run(userInstruction: string) {
    if (!AccessibilityModule) {
      this.onStatusUpdate('Error: AccessibilityModule is not defined.');
      return;
    }
    this.isRunning = true;
    this.previousSteps = [];
    this.onStatusUpdate('Automation started.');

    while (this.isRunning) {
      this.onStatusUpdate('Observing screen...');
      const currentUi = await this.getCurrentUi();

      if (!currentUi) {
        this.onStatusUpdate('Failed to capture screen content. Retrying...');
        await new Promise(resolve => setTimeout(resolve, 2000));
        continue;
      }

      this.onStatusUpdate('Thinking...');
      const nextAction = await parseInstruction(
        userInstruction,
        currentUi,
        JSON.stringify(this.previousSteps)
      );

      if (nextAction.action === 'NONE') {
        this.onStatusUpdate(`Finished: ${nextAction.reason}`);
        break;
      }

      this.onStatusUpdate(`Executing: ${nextAction.action} ${nextAction.target?.text || nextAction.target?.id || ''}`);
      const success = await this.executeAction(nextAction);

      if (success) {
        this.previousSteps.push(nextAction);
        if (this.previousSteps.length > 10) this.previousSteps.shift(); // Keep context short
      } else {
        this.onStatusUpdate(`Action failed: ${nextAction.action}. Retrying in 2s...`);
      }

      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    this.isRunning = false;
    this.onStatusUpdate('Automation stopped.');
  }

  stop() {
    this.isRunning = false;
  }

  private async getCurrentUi(): Promise<string | null> {
    return new Promise((resolve) => {
      AccessibilityModule.getFlattenedScreenContent((content: string | null) => {
        resolve(content);
      });
    });
  }

  private async executeAction(action: AutomationAction): Promise<boolean> {
    return new Promise((resolve) => {
      const callback = (result: boolean) => resolve(result);

      switch (action.action) {
        case 'CLICK':
          if (action.target?.id !== undefined) {
            AccessibilityModule.clickElementByIndex(action.target.id, callback);
          } else if (action.target?.text) {
            AccessibilityModule.clickElementByText(action.target.text, callback);
          } else {
            resolve(false);
          }
          break;

        case 'INPUT_TEXT':
          if (action.target?.id !== undefined && action.value) {
            AccessibilityModule.inputTextElementByIndex(action.target.id, action.value, callback);
          } else if (action.target?.text && action.value) {
            AccessibilityModule.inputTextElementByText(action.target.text, action.value, callback);
          } else {
            resolve(false);
          }
          break;

        case 'SCROLL_FORWARD':
          if (action.target?.text) {
            AccessibilityModule.scrollForwardElementByText(action.target.text, callback);
          } else {
            // Default scroll if no target specified? 
            resolve(false);
          }
          break;

        case 'SCROLL_BACKWARD':
          if (action.target?.text) {
            AccessibilityModule.scrollBackwardElementByText(action.target.text, callback);
          } else {
            resolve(false);
          }
          break;

        case 'NAVIGATE_APP':
          this.onStatusUpdate('NAVIGATE_APP not yet implemented natively.');
          resolve(false);
          break;

        default:
          resolve(false);
          break;
      }
    });
  }
}
