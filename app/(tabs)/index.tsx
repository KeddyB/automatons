import { Image } from 'expo-image';
import { StyleSheet, NativeModules, Button, View, DeviceEventEmitter, Text, TextInput } from 'react-native';
import { useEffect, useState, useRef } from 'react';

import { HelloWave } from '@/components/hello-wave';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAppStore } from '../../store/appStore'; // Import the Zustand store
import { parseInstruction, AutomationAction } from '../../utils/InstructionParser';
import { WorkflowEngine } from '../../utils/WorkflowEngine';

const { AccessibilityModule } = NativeModules;

export default function HomeScreen() {
  const { lastEvent, screenContent, setLastEvent, setScreenContent } = useAppStore(); // Use Zustand store
  const [targetText, setTargetText] = useState<string>('');
  const [commandInputText, setCommandInputText] = useState<string>('');
  const [workflowStatus, setWorkflowStatus] = useState<string>('Idle');

  const workflowEngineRef = useRef<WorkflowEngine | null>(null);

  useEffect(() => {
    if (!AccessibilityModule) {
      console.error("AccessibilityModule is not defined. Make sure the native module is correctly linked and the app is built with native code.");
      setWorkflowStatus("Error: Native Module Missing");
      return;
    }

    AccessibilityModule.hasOverlayPermission((hasPermission: boolean) => {
      if (!hasPermission) {
        AccessibilityModule.requestOverlayPermission();
      }
    });

    /* Commenting out high-frequency events to prevent lag
    const accessibilityEventListener = DeviceEventEmitter.addListener('onAccessibilityEvent', (event) => {
      setLastEvent(event);
    });

    const screenContentListener = DeviceEventEmitter.addListener('onScreenContentChanged', (content) => {
      setScreenContent(content);
    });
    */

    workflowEngineRef.current = new WorkflowEngine((status) => {
      setWorkflowStatus(status);
      AccessibilityModule.updateOverlayStatus(status);
    });

    return () => {
      /*
      accessibilityEventListener.remove();
      screenContentListener.remove();
      */
    };
  }, []);

  const handleGetScreenContent = () => {
    AccessibilityModule.getScreenContent((content: string) => {
      setScreenContent(content);
    });
  };

  const handleClickElement = () => {
    AccessibilityModule.clickElementByText(targetText, (result: boolean) => {
      console.log(`Click action on '${targetText}' result: ${result}`);
    });
  };

  const handleScrollForwardElement = () => {
    AccessibilityModule.scrollForwardElementByText(targetText, (result: boolean) => {
      console.log(`Scroll forward action on '${targetText}' result: ${result}`);
    });
  };

  const handleScrollBackwardElement = () => {
    AccessibilityModule.scrollBackwardElementByText(targetText, (result: boolean) => {
      console.log(`Scroll backward action on '${targetText}' result: ${result}`);
    });
  };

  const handleStartWorkflow = async () => {
    if (!workflowEngineRef.current || !commandInputText) return;
    workflowEngineRef.current.run(commandInputText);
  };

  const handleStopWorkflow = () => {
    workflowEngineRef.current?.stop();
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.reactLogo}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Automatons</ThemedText>
        <HelloWave />
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Step 1: Enable Accessibility Service</ThemedText>
        <Button
          title="Open Accessibility Settings"
          onPress={() => AccessibilityModule.openAccessibilitySettings()}
        />
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Step 2: Manage Overlay</ThemedText>
        <View style={styles.buttonContainer}>
          <Button
            title="Start Overlay"
            onPress={() => AccessibilityModule.startOverlay()}
          />
          <Button
            title="Stop Overlay"
            onPress={() => AccessibilityModule.stopOverlay()}
          />
        </View>
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Step 3: Screen Content</ThemedText>
        <Button
          title="Get Screen Content"
          onPress={handleGetScreenContent}
        />
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Step 4: Automation Actions</ThemedText>
        <TextInput
          style={styles.input}
          onChangeText={setTargetText}
          value={targetText}
          placeholder="Enter target text for action"
        />
        <View style={styles.buttonContainer}>
          <Button title="Click Element" onPress={handleClickElement} />
          <Button title="Scroll Forward" onPress={handleScrollForwardElement} />
          <Button title="Scroll Backward" onPress={handleScrollBackwardElement} />
        </View>
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Step 5: AI Workflow</ThemedText>
        <TextInput
          style={styles.input}
          onChangeText={setCommandInputText}
          value={commandInputText}
          placeholder="Enter AI command (e.g., click example button)"
        />
        <View style={styles.buttonContainer}>
          <Button title="Start AI Workflow" onPress={handleStartWorkflow} />
          <Button title="Stop AI Workflow" onPress={handleStopWorkflow} />
        </View>
        <ThemedText>Workflow Status: {workflowStatus}</ThemedText>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
    color: '#000', // Ensure text is visible on dark backgrounds
  },
});

