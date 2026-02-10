// utils/WorkflowEngine.ts
import { NativeModules } from 'react-native';
import { AutomationAction } from './InstructionParser';

const { AccessibilityModule } = NativeModules;

export class WorkflowEngine {
  private workflow: AutomationAction[];
  private currentStepIndex: number;
  private isRunning: boolean;
  private onStatusUpdate: (status: string) => void;

  constructor(onStatusUpdate: (status: string) => void) {
    this.workflow = [];
    this.currentStepIndex = 0;
    this.isRunning = false;
    this.onStatusUpdate = onStatusUpdate;
  }

  setWorkflow(workflow: AutomationAction[]) {
    this.workflow = workflow;
    this.currentStepIndex = 0;
  }

  async start() {
    this.isRunning = true;
    this.onStatusUpdate('Workflow started.');
    while (this.isRunning && this.currentStepIndex < this.workflow.length) {
      const action = this.workflow[this.currentStepIndex];
      this.onStatusUpdate(`Executing step ${this.currentStepIndex + 1}: ${action.action}`);
      const success = await this.executeAction(action);
      if (success) {
        this.currentStepIndex++;
      } else {
        this.onStatusUpdate(`Action failed: ${action.action}. Stopping workflow.`);
        this.stop();
        return;
      }
      await new Promise(resolve => setTimeout(resolve, 2000)); // Small delay between actions
    }
    if (this.isRunning) {
      this.onStatusUpdate('Workflow finished successfully.');
    }
    this.stop();
  }

  stop() {
    this.isRunning = false;
    this.onStatusUpdate('Workflow stopped.');
  }

  private async executeAction(action: AutomationAction): Promise<boolean> {
    return new Promise((resolve) => {
      switch (action.action) {
        case 'CLICK':
          if (action.target?.text) {
            AccessibilityModule.clickElementByText(action.target.text, (result: boolean) => {
              resolve(result);
            });
          } else {
            resolve(false);
          }
          break;
        case 'SCROLL_FORWARD':
          if (action.target?.text) {
            AccessibilityModule.scrollForwardElementByText(action.target.text, (result: boolean) => {
              resolve(result);
            });
          } else {
            resolve(false);
          }
          break;
        case 'SCROLL_BACKWARD':
          if (action.target?.text) {
            AccessibilityModule.scrollBackwardElementByText(action.target.text, (result: boolean) => {
              resolve(result);
            });
          } else {
            resolve(false);
          }
          break;
        case 'INPUT_TEXT':
          // Need to implement native method for this
          this.onStatusUpdate('INPUT_TEXT action not yet implemented.');
          resolve(false);
          break;
        case 'NAVIGATE_APP':
          // Need to implement native method for this
          this.onStatusUpdate('NAVIGATE_APP action not yet implemented.');
          resolve(false);
          break;
        case 'NONE':
          this.onStatusUpdate(`No action: ${action.reason}`);
          resolve(true);
          break;
        default:
          this.onStatusUpdate(`Unknown action: ${action.action}`);
          resolve(false);
          break;
      }
    });
  }
}
