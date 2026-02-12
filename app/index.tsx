import { Image } from 'expo-image';
import { StyleSheet, NativeModules, Button, View, Text, TextInput, ScrollView, SafeAreaView } from 'react-native';
import { useEffect, useState, useRef } from 'react';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { WorkflowEngine } from '../utils/WorkflowEngine';

const { AccessibilityModule } = NativeModules;

export default function HomeScreen() {
  const [targetText, setTargetText] = useState<string>('');
  const [commandInputText, setCommandInputText] = useState<string>('');
  const [workflowStatus, setWorkflowStatus] = useState<string>('Idle');
  const [isServiceEnabled, setIsServiceEnabled] = useState<boolean>(false);
  const [hasOverlayPermission, setHasOverlayPermission] = useState<boolean>(false);

  const workflowEngineRef = useRef<WorkflowEngine | null>(null);

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

    return () => clearInterval(interval);
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

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ThemedView style={styles.header}>
          <ThemedText type="title">Automatons AI</ThemedText>
          <ThemedText type="subtitle" style={{ color: isServiceEnabled ? 'green' : 'red' }}>
            Service: {isServiceEnabled ? 'ACTIVE' : 'INACTIVE'}
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText type="subtitle">1. Setup Permissions</ThemedText>
          <View style={styles.buttonRow}>
            <Button
              title="Accessibility Settings"
              onPress={() => AccessibilityModule.openAccessibilitySettings()}
            />
            <Button
              title="Overlay Permission"
              onPress={() => AccessibilityModule.requestOverlayPermission()}
              disabled={hasOverlayPermission}
            />
          </View>
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText type="subtitle">2. Controls</ThemedText>
          <View style={styles.buttonRow}>
            <Button title="Start Overlay" onPress={() => AccessibilityModule.startOverlay()} />
            <Button title="Stop Overlay" onPress={() => AccessibilityModule.stopOverlay()} />
          </View>
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText type="subtitle">3. AI Command</ThemedText>
          <TextInput
            style={styles.input}
            onChangeText={setCommandInputText}
            value={commandInputText}
            placeholder="e.g., click on Settings"
            placeholderTextColor="#999"
          />
          <View style={styles.buttonRow}>
            <Button title="Run AI" onPress={handleStartWorkflow} color="#2196F3" />
            <Button title="Stop" onPress={handleStopWorkflow} color="#f44336" />
          </View>
          <ThemedText style={styles.statusText}>Status: {workflowStatus}</ThemedText>
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText type="subtitle">4. Manual Debug</ThemedText>
          <TextInput
            style={styles.input}
            onChangeText={setTargetText}
            value={targetText}
            placeholder="Text to click"
            placeholderTextColor="#999"
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
    backgroundColor: '#fff',
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
    borderRadius: 10,
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#eee',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    flexWrap: 'wrap',
    gap: 10,
  },
  input: {
    height: 45,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 10,
    backgroundColor: '#fff',
    color: '#000',
  },
  statusText: {
    marginTop: 10,
    fontWeight: 'bold',
  },
});
