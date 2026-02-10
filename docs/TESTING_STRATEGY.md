# Testing Strategy for Automatons App

A robust testing strategy is crucial for an application like Automatons, which interacts deeply with the Android system and other applications. This document outlines the planned testing approaches.

## 🧪 Unit Testing

**Objective:** Verify the correctness of individual functions, methods, or classes in isolation.

### Native Android (Kotlin)
- **Accessibility Service Logic:**
    - Test individual helper functions within `MyAccessibilityService` (e.g., node searching predicates).
    - Mock `AccessibilityEvent` objects and test `onAccessibilityEvent`'s parsing and event emission logic.
- **ScreenParser:**
    - Create mock `AccessibilityNodeInfo` objects and entire mock UI trees.
    - Test the `parse` method to ensure it correctly converts the `AccessibilityNodeInfo` hierarchy into the expected JSON structure.
    - Verify that different types of nodes (buttons, text fields, scrollable views) are correctly identified and their properties extracted.
- **ActionExecutor:**
    - Mock `AccessibilityNodeInfo` objects with specific properties (e.g., `isClickable = true`).
    - Test `click`, `scrollForward`, `scrollBackward` methods to ensure they correctly call `performAction` and return the expected boolean result.
    - Verify edge cases like attempting to click a non-clickable node.

### React Native (TypeScript/JavaScript)
- **Zustand Store:**
    - Test the `useAppStore` to ensure state updates (e.g., `setLastEvent`, `setScreenContent`) work as expected.
    - Verify that selectors correctly retrieve state.
- **InstructionParser:**
    - Test `parseInstruction` with various user commands and mock `currentUiJson` to ensure it returns the expected `AutomationAction` (based on its current mock logic).
- **WorkflowEngine:**
    - Test `setWorkflow`, `start`, and `stop` methods.
    - Mock `executeAction` to simulate successful or failed native actions and verify workflow progression, branching (if implemented), and retry logic.
    - Ensure `onStatusUpdate` callback is triggered with correct messages.

## 🤖 Mock Accessibility Tree Tests

**Objective:** Simulate complex UI scenarios without needing a physical device or emulator, allowing for rapid testing of screen understanding and element identification.

- **Approach:**
    1. Create JSON files representing diverse `AccessibilityNodeInfo` trees (e.g., a login screen, a settings menu, a web page).
    2. Develop a utility that can "inflate" these JSON structures back into `AccessibilityNodeInfo` mock objects (or equivalent data structures that `ScreenParser` can consume).
    3. Use these mock trees as input to `ScreenParser.parse()` and the `findElementByText`/`findElementByResourceId` methods in `MyAccessibilityService` (or a mock thereof).
    4. Assert that the output JSON is correct and that the correct nodes are found for specific queries.

## 📱 UI Instrumentation Tests (AndroidX Test / Espresso)

**Objective:** Test the interaction between the React Native UI, native modules, and the Android system (including Accessibility Service and Overlay).

- **Setup:**
    - Use Espresso for UI testing on Android.
    - Configure the test environment to grant necessary permissions (Accessibility, System Alert Window) for the test runner.
- **Scenarios:**
    - **Accessibility Service Activation:** Test launching the app, clicking the "Open Accessibility Settings" button, and verifying the system settings screen is displayed.
    - **Overlay Functionality:**
        - Test starting and stopping the overlay from React Native.
        - Verify the overlay appears and disappears correctly.
        - Test dragging the overlay and ensuring its position updates.
        - Test interaction with overlay buttons (Start/Stop automation) and `TextInput` (command input).
    - **Native Module Communication:**
        - Trigger `clickElementByText` and `scrollForwardElementByText` from RN and verify that the corresponding native actions are attempted/performed (this might require careful mocking of the `AccessibilityService` context within the instrumentation test).
        - Assert that `onAccessibilityEvent` and `onScreenContentChanged` events are correctly emitted to React Native.
- **Challenges:** Testing actual accessibility interactions (e.g., performing a click on a real button in another app) is extremely difficult and often requires root access or specialized testing frameworks. Focus on verifying the communication and the app's own UI responses.

## 🧑‍💻 Real Device Testing Scenarios

**Objective:** Essential for verifying the complete end-to-end functionality, performance, and user experience under realistic conditions.

- **Manual Testing:**
    - Enable Accessibility Service and Overlay manually.
    - Test the app's functionality across various target applications.
    - Evaluate responsiveness, battery consumption, and stability during prolonged use.
    - Verify cross-device compatibility (different manufacturers, Android versions, screen sizes).
- **Automated Real Device Testing:** Explore platforms like Firebase Test Lab or custom setups with Appium/Maestro for repeatable UI tests on a range of physical devices. This is where the challenges of testing accessibility services in a real-world context can be most thoroughly addressed.

---
