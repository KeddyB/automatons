import { StyleSheet, NativeModules, Button, View, TextInput, ScrollView, SafeAreaView, DeviceEventEmitter } from 'react-native';
import { useEffect, useState, useRef } from 'react';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { WorkflowEngine } from '../utils/WorkflowEngine';
import { useThemeColor } from '@/hooks/use-theme-color';

const { AccessibilityModule } = NativeModules;

export default function HomeScreen() {
  const [targetText, setTargetText] = useState<string>('');
  const [commandInputText, setCommandInputText] = useState<string>('');
  const [workflowStatus, setWorkflowStatus] = useState<string>('Idle');
  const [isServiceEnabled, setIsServiceEnabled] = useState<boolean>(false);
  const [hasOverlayPermission, setHasOverlayPermission] = useState<boolean>(false);
  const [isOverlayFocusable, setIsOverlayFocusable] = useState<boolean>(false);

  const workflowEngineRef = useRef<WorkflowEngine | null>(null);

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const sectionBg = useThemeColor({ light: '#f9f9f9', dark: '#222' }, 'background');
  const borderColor = useThemeColor({ light: '#ddd', dark: '#444' }, 'background');

  const checkPermissions = () => {
    if (!AccessibilityModule) return;

    AccessibilityModule.hasOverlayPermission((has: boolean) => {
      setHasOverlayPermission(has);
    });

    AccessibilityModule.isServiceEnabled((enabled: boolean) => {
      setIsServiceEnabled(enabled);
    });
  };

  useEffect(() => {
    if (!AccessibilityModule) {
      setWorkflowStatus("Error: Native Module Missing");
      return;
    }

    checkPermissions();
    const interval = setInterval(checkPermissions, 2000);

    workflowEngineRef.current = new WorkflowEngine((status) => {
      setWorkflowStatus(status);
      AccessibilityModule.updateOverlayStatus(status);
    });

    // Listen for commands from the Overlay
    const commandListener = DeviceEventEmitter.addListener('onCommand', (command: string) => {
      setCommandInputText(command);
      workflowEngineRef.current?.run(command);
    });

    const stopListener = DeviceEventEmitter.addListener('onStopAutomation', () => {
      workflowEngineRef.current?.stop();
    });

    return () => {
      clearInterval(interval);
      commandListener.remove();
      stopListener.remove();
    };
  }, []);

  const handleGetScreenContent = () => {
    AccessibilityModule.getFlattenedScreenContent((content: string) => {
      console.log('Screen Content:', content);
      alert(content ? "Content Captured (Check Console)" : "Failed to capture content");
    });
  };

  const handleClickElement = () => {
    AccessibilityModule.clickElementByText(targetText, (result: boolean) => {
      alert(`Click on '${targetText}' result: ${result}`);
    });
  };

  const handleStartWorkflow = async () => {
    if (!workflowEngineRef.current || !commandInputText) return;
    workflowEngineRef.current.run(commandInputText);
  };

  const handleStopWorkflow = () => {
    workflowEngineRef.current?.stop();
  };

  const toggleOverlayFocus = () => {
    const newState = !isOverlayFocusable;
    setIsOverlayFocusable(newState);
    AccessibilityModule.setOverlayFocusable(newState);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ThemedView style={[styles.header, { backgroundColor }]}>
          <ThemedText type="title">Automatons AI</ThemedText>
          <ThemedText type="subtitle" style={{ color: isServiceEnabled ? '#4CAF50' : '#F44336' }}>
            Service: {isServiceEnabled ? 'ACTIVE' : 'INACTIVE'}
          </ThemedText>
        </ThemedView>

        <ThemedView style={[styles.section, { backgroundColor: sectionBg, borderColor }]}>
          <ThemedText type="subtitle">1. Setup Permissions</ThemedText>
          <View style={styles.buttonRow}>
            <Button
              title="Accessibility"
              onPress={() => AccessibilityModule.openAccessibilitySettings()}
            />
            <Button
              title="Overlay"
              onPress={() => AccessibilityModule.requestOverlayPermission()}
              disabled={hasOverlayPermission}
            />
          </View>
        </ThemedView>

        <ThemedView style={[styles.section, { backgroundColor: sectionBg, borderColor }]}>
          <ThemedText type="subtitle">2. Controls</ThemedText>
          <View style={styles.buttonRow}>
            <Button title="Start Overlay" onPress={() => AccessibilityModule.startOverlay()} />
            <Button title="Stop Overlay" onPress={() => AccessibilityModule.stopOverlay()} />
          </View>
          <View style={{ marginTop: 10 }}>
            <Button 
                title={isOverlayFocusable ? "Disable Overlay Input" : "Enable Overlay Input"} 
                onPress={toggleOverlayFocus} 
                color={isOverlayFocusable ? "#f44336" : "#2196F3"}
            />
            <ThemedText style={{ fontSize: 12, marginTop: 5, fontStyle: 'italic' }}>
                Note: When Overlay Input is enabled, you cannot click through the overlay.
            </ThemedText>
          </View>
        </ThemedView>

        <ThemedView style={[styles.section, { backgroundColor: sectionBg, borderColor }]}>
          <ThemedText type="subtitle">3. AI Command</ThemedText>
          <TextInput
            style={[styles.input, { color: textColor, backgroundColor }]}
            onChangeText={setCommandInputText}
            value={commandInputText}
            placeholder="e.g., click on Settings"
            placeholderTextColor="#888"
          />
          <View style={styles.buttonRow}>
            <Button title="Run AI" onPress={handleStartWorkflow} color="#2196F3" />
            <Button title="Stop" onPress={handleStopWorkflow} color="#f44336" />
          </View>
          <ThemedText style={styles.statusText}>Status: {workflowStatus}</ThemedText>
        </ThemedView>

        <ThemedView style={[styles.section, { backgroundColor: sectionBg, borderColor }]}>
          <ThemedText type="subtitle">4. Manual Debug</ThemedText>
          <TextInput
            style={[styles.input, { color: textColor, backgroundColor }]}
            onChangeText={setTargetText}
            value={targetText}
            placeholder="Text to click"
            placeholderTextColor="#888"
          />
          <Button title="Test Click" onPress={handleClickElement} />
          <View style={{ marginTop: 10 }}>
            <Button title="Capture Screen Info" onPress={handleGetScreenContent} color="#607D8B" />
          </View>
        </ThemedView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    marginBottom: 20,
    alignItems: 'center',
  },
  section: {
    marginBottom: 25,
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    flexWrap: 'wrap',
    gap: 10,
  },
  input: {
    height: 48,
    borderColor: '#888',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  statusText: {
    marginTop: 10,
    fontWeight: 'bold',
  },
});
