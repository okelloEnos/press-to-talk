import ScenarioCard from "@/components/ScenarioCard";
import Spacer from "@/components/Spacer";
import { AudioService } from "@/services/AudioService";
import { Scenario, StubVoiceApi } from "@/services/VoiceApi";
import Ionicons from '@expo/vector-icons/Ionicons';
import { Audio } from "expo-av";
import React, { useEffect, useRef, useState } from "react";
import { Alert, Animated, FlatList, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CaptureOverlay from "../components/CaptureOverlay";
import PTTButton from "../components/PTTButton";
import TranscriptCard from "../components/TranscriptCard";
import { ProcessVoiceInput } from "../types";

// Initialize services
const audioService = new AudioService();
const voiceApi = new StubVoiceApi({ scenario: 'success', delayMs: 1500 });
const scenarios: Scenario[] = ["success", "clarify", "networkError", "serverError"];

type TranscriptItem = { id: string; text: string; ts: string };

export default function Index() {

  const [uiState, setUiState] = useState<"idle" | "listening" | "processing" | "error" | "clarification">("idle");
  const [transcripts, setTranscripts] = useState<string[]>([]);
  const [prompt, setPrompt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [scenario, setScenario] = useState<Scenario>("success");
  const [listeningStart, setListeningStart] = useState<number>(0);
  const [cancelled, setCancelled] = useState(false);
  const [isBusy, setIsBusy] = useState(false);

  // for cancel swipe animation (shared between button and overlay if needed)
  const panXRef = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    voiceApi.setScenario(scenario);
    audioService.cleanupTemp();
  }, [scenario]);

  const startRecording = async () => {
    const ok = await audioService.requestPermission();
    if (!ok) {
      Alert.alert("Permission required", "Enable microphone access to record.");
      return;
    }
    setUiState("listening");
    setListeningStart(Date.now());
    await audioService.startRecording();
  };

  const stopRecording = async () => {
    if (cancelled) {
      setCancelled(false);
      return;
    }
    setUiState("processing");
    try {
      const { uri, mimeType } = await audioService.stopAndSave();
      const input: ProcessVoiceInput = { audioUri: uri, mimeType, clientTs: new Date().toISOString() };
      const res = await voiceApi.processVoice(input);

      if (res.kind === "clarification") {
        setPrompt(res.prompt);
        setUiState("clarification");
      } else {
        setTranscripts((prev) => [res.transcript, ...prev]);
        await playResponseAudio(res.audioFile);
        setPrompt(null);
        setUiState("idle");
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong");
      setUiState("error");
    }
  };

  const cancelRecording = async () => {
    await audioService.cancelRecording();
    setCancelled(true);
    setUiState("idle");
  };

  // const playResponseAudio = async (fileIndex: number) => {
  //   const file =
  //     fileIndex === 1
  //       ? require("../assets/audio/audiofile1.mp3")
  //       : require("../assets/audio/audiofile2.mp3");

  //   const { sound } = await Audio.Sound.createAsync(file);
  //   await sound.playAsync();
  // };

  const startListening = async () => {
    // guard: don’t allow overlapping recordings
    if (isBusy) return;
    setIsBusy(true);
    setCancelled(false);

    try {
      // request mic permission
      const ok = await audioService.requestPermission();
      if (!ok) {
        Alert.alert(
          "Microphone Permission Required",
          "Please enable microphone access in settings."
        );
        return;
      }

      // start recording
      await audioService.startRecording();
      setListeningStart(Date.now());
      setUiState("listening");
    } catch (err) {
      console.error("Error starting recording:", err);
      Alert.alert("Recording Error", "Unable to start recording.");
      setUiState("idle");
    } finally {
      setIsBusy(false);
    }
  };

  const stopListening = async () => {
    // guard: ignore if busy or cancelled
    if (isBusy) return;
    if (cancelled) {
      setCancelled(false);
      return;
    }

    setIsBusy(true);
    setUiState("processing");

    try {
      const { uri, mimeType } = await audioService.stopAndSave();
      const input: ProcessVoiceInput = {
        audioUri: uri,
        mimeType,
        clientTs: new Date().toISOString(),
      };

      const res = await voiceApi.processVoice(input);

      if (res.kind === "clarification") {
        setPrompt(res.prompt);
        setUiState("clarification");
      } else {
        setTranscripts((prev) => [res.transcript, ...prev]);
        await playResponseAudio(res.audioFile);
        setPrompt(null);
        setUiState("idle");
      }
    } catch (err: any) {
      console.error("Processing error:", err);
      setError(err.message || "Something went wrong. Please try again.");
      setUiState("error");
    } finally {
      setIsBusy(false);
    }
  };

  const handleSwipeCancel = async () => {
    // user swiped right while holding
    setCancelled(true);
    try {
      await audioService.cancelRecording();
    } catch (err) {
      console.warn("Cancel recording error:", err);
    } finally {
      setUiState("idle");
      // small haptic or animation feedback could go here
    }
  };

  const playResponseAudio = async (fileIndex: number) => {
    try {
      const file =
        fileIndex === 1
          ? require("../assets/audio/audiofile1.mp3")
          : require("../assets/audio/audiofile2.mp3");
      const { sound } = await Audio.Sound.createAsync(file);
      await sound.playAsync();
    } catch (err) {
      console.warn("Audio playback failed:", err);
    }
  };

  const retryError = () => {
    setError(null);
    setUiState("idle");
  };


  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>

        <Text style={styles.title}>Press & Talk Demo</Text>

        <Spacer height={16} />

        <View style={styles.scenarioOverview}>
          <Spacer height={6} />
          <Text style={styles.demoScenarioText}>Testing Scenario :</Text>
          <Spacer height={8} />
          <View style={styles.grid}>
            {scenarios.map((scenarioInstance) => (
              <View key={scenarioInstance} style={styles.gridItem}>
                <ScenarioCard
                  value={scenarioInstance}
                  selectedScenario={scenario}
                  onPress={() => setScenario(scenarioInstance)}
                />
              </View>
            ))}
          </View>
        </View>

        <Spacer height={24} />
      </View>

      {/* CLARIFICATION PROMPT */}
      {uiState === "clarification" && prompt && (
        <View style={styles.bannerClar}>
          <Text>{prompt}</Text>
        </View>
      )}

      {/* ERROR BANNER */}
      {uiState === "error" && (
        <View style={styles.bannerError}>
          <Text style={{ color: "#fff" }}>{error}</Text>
          <Text
            style={styles.retry}
            onPress={retryError}
          >
            Tap to retry
          </Text>
        </View>
      )}

      {transcripts.length > 0 && <View style={styles.subTitleContainer}>
        <Text style={styles.subTitle}>Recent transcripts</Text>
        <Spacer height={4} />
      </View>}
      <FlatList
        data={transcripts}
        keyExtractor={(_, i) => i.toString()}
        renderItem={({ item }) => <TranscriptCard text={item} />}
        contentContainerStyle={
          transcripts.length === 0 ? styles.emptyContainer : undefined
        }
        ListEmptyComponent={
          <View style={styles.emptyInner}>
            <Ionicons name="mic-outline" size={48} color="#888" style={styles.icon} />
            <Text style={styles.emptyTitle}>No transcripts available</Text>
            <Text style={styles.emptyHint}>
              Press the button below to start recording your first voice input.
            </Text>
          </View>
        }
      />


      {/* FOOTER */}
      <View style={styles.footer}>
        <PTTButton
          onPressIn={startListening}
          onPressOut={stopListening}
          onSwipeCancel={handleSwipeCancel}
          disabled={uiState === "processing" || isBusy}
          label={
            uiState === "listening" ? "Recording..." : "Hold to Talk"
          }
        />
      </View>

      {/* LISTENING OVERLAY */}
      {uiState === "listening" && (
        <CaptureOverlay startTs={listeningStart} slideAnim={panXRef} />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
  },
  header: {
    marginBottom: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    alignSelf: "center",
  },
  scenarioRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  card: {
    flex: 1,
    backgroundColor: "#f0f0f0",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  gridItem: {
    width: "49%",          // two items per row
    marginBottom: 8,      // vertical spacing between rows
  },
  scenarioOverview: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 10,
  },
  demoScenarioText: {
    fontWeight: "500",
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyInner: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  icon: {
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
    textAlign: "center",
  },
  emptyHint: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    lineHeight: 20,
  },
  subTitleContainer: {
    width: "100%",
  },
  subTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
  },

  footer: {
    alignItems: "center",
    paddingVertical: 20,
  },
  bannerClar: {
    backgroundColor: "#fff3bf",
    padding: 12,
    borderRadius: 8,
    marginVertical: 10,
  },
  bannerError: {
    backgroundColor: "#ff6b6b",
    padding: 12,
    borderRadius: 8,
    marginVertical: 10,
    alignItems: "center",
  },
  retry: {
    color: "#fff",
    textDecorationLine: "underline",
    marginTop: 6,
  },
});