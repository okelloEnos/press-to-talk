import { AudioService, useAudioRecorderService } from "@/services/AudioService";
import { Scenario, StubVoiceApi } from "@/services/VoiceApi";
import { Ionicons } from "@expo/vector-icons";
import { Asset } from "expo-asset";
import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system";
import React, { useEffect, useRef, useState } from "react";
import { Alert, Animated, FlatList, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
// import { AnimatedDots } from "../components/AnimatedDots";
import AnimatedDots from "@/components/AnimatedDots";
// import ProcessingView from "@/components/ProcessingView";
import { stubErrorMessage } from "../Utils/ErrorMessage";
import CaptureOverlay from "../components/CaptureOverlay";
import ClarificationBanner from "../components/ClarificationBanner";
import ErrorBanner from "../components/ErrorBanner";
import PressButton from "../components/PressButton";
import ScenarioCard from "../components/ScenarioCard";
import Spacer from "../components/Spacer";
import TranscriptCard from "../components/TranscriptCard";
import { ProcessVoiceInput } from "../types";
// import { AudioService, useAudioRecorderService } from './AudioService';


// Initialize services
const audioService = new AudioService();
const voiceApi = new StubVoiceApi({ scenario: 'success', delayMs: 1500 });
const scenarios: Scenario[] = ["success", "clarify", "networkError", "serverError"];

// export default function Index() {

//   const [uiState, setUiState] = useState<"idle" | "listening" | "processing" | "error" | "clarification">("idle");
//   const [transcripts, setTranscripts] = useState<string[]>([]);
//   const [prompt, setPrompt] = useState<string | null>(null);
//   const [error, setError] = useState<string | null>(null);
//   const [scenario, setScenario] = useState<Scenario>("success");
//   const [listeningStart, setListeningStart] = useState<number>(0);
//   const [cancelled, setCancelled] = useState(false);
//   const [isBusy, setIsBusy] = useState(false);

//   // for cancel swipe animation (shared between button and overlay if needed)
//   const panXRef = useRef(new Animated.Value(0)).current;

//   useEffect(() => {
//     voiceApi.setScenario(scenario);
//     audioService.cleanupTemp();
//   }, [scenario]);

//   const startListening = async () => {
//     // guard: don’t allow overlapping recordings
//     if (isBusy) return;
//     setIsBusy(true);
//     setCancelled(false);

//     try {
//       // request mic permission
//       const ok = await audioService.requestPermission();
//       if (!ok) {
//         Alert.alert(
//           "Microphone Permission Required",
//           "Please enable microphone access in settings."
//         );
//         return;
//       }

//       // start recording
//       await audioService.startRecording();
//       setListeningStart(Date.now());
//       setUiState("listening");
//     } catch (err) {
//       // console.error("Error starting recording:", err);
//       Alert.alert("Recording Error", "Unable to start recording.");
//       setUiState("idle");
//     } finally {
//       setIsBusy(false);
//     }
//   };

//   const stopListening = async () => {
//     // guard: ignore if busy or cancelled
//     if (isBusy) return;
//     if (cancelled) {
//       setCancelled(false);
//       return;
//     }

//     setIsBusy(true);
//     setUiState("processing");

//     try {
//       const { uri, mimeType } = await audioService.stopAndSave();
//       const input: ProcessVoiceInput = {
//         audioUri: uri,
//         mimeType,
//         clientTs: new Date().toISOString(),
//       };

//       const res = await voiceApi.processVoice(input);

//       if (res.kind === "clarification") {
//         setPrompt(res.prompt);
//         setUiState("clarification");
//       } else {
//         setTranscripts((prev) => [res.transcript, ...prev]);
//         await playResponseAudio(res.audioFile);
//         setPrompt(null);
//         setUiState("idle");
//       }
//     } catch (err: any) {
//       const errorCode = err["code"];
//       console.log("Jackline ahero", errorCode);
//       if (errorCode === undefined) {
//         console.error("Processing  error okello:", err);

//         // setError(err.message || "Something went wrong. Please try again.");
//         setError("Something went wrong. Please try again. Custom error.");
//         setUiState("error");
//       }
//       else {
//         const customizedMessage = stubErrorMessage(errorCode);
//         // console.error("Processing error enos:", err);
//         setError(customizedMessage);
//         setUiState("error");
//       }
//     } finally {
//       setIsBusy(false);
//     }
//   };

//   const handleSwipeCancel = async () => {
//     // user swiped right while holding
//     setCancelled(true);
//     try {
//       await audioService.cancelRecording();
//     } catch (err) {
//       console.warn("Cancel recording error:", err);
//     } finally {
//       setUiState("idle");
//       // small haptic or animation feedback could go here
//     }
//   };

//   const playResponseAudio = async (fileIndex: number) => {
//     try {
//       const file =
//         fileIndex === 1
//           ? require("../assets/audio/audiofile1.mp3")
//           : require("../assets/audio/audiofile2.mp3");
//       const { sound } = await Audio.Sound.createAsync(file);
//       await sound.playAsync();
//     } catch (err) {
//       console.warn("Audio playback failed:", err);
//     }
//   };

//   const retryError = () => {
//     setError(null);
//     setUiState("idle");
//   };


//   return (
//     <SafeAreaView style={styles.container}>
//       <View style={styles.header}>

//         <Text style={styles.title}>Press & Talk Demo</Text>
//         <Spacer height={16} />

//         <View style={styles.scenarioOverview}>
//           <Spacer height={6} />
//           <Text style={styles.demoScenarioText}>Testing Scenario :</Text>
//           <Spacer height={8} />
//           <View style={styles.grid}>
//             {scenarios.map((scenarioInstance) => (
//               <View key={scenarioInstance} style={styles.gridItem}>
//                 <ScenarioCard
//                   value={scenarioInstance}
//                   selectedScenario={scenario}
//                   onPress={() => setScenario(scenarioInstance)}
//                 />
//               </View>
//             ))}
//           </View>
//         </View>

//         <Spacer height={24} />
//       </View>

//       {uiState === "clarification" && prompt && (
//         <ClarificationBanner prompt={prompt || "Assistant requires clarification"} />
//       )}


//       {uiState === "error" && (
//         <ErrorBanner
//           message={error || "Oops! Something unexpected happened. Please try again."}
//           onRetry={retryError}
//         />
//       )}

//       <>
//         {(transcripts.length > 0 || uiState === "processing") && <View style={styles.subTitleContainer}>
//           <Text style={styles.subTitle}>Recent transcripts</Text>
//           <Spacer height={4} />
//         </View>}

//         {uiState === "processing" && <Text style={styles.processingText}>
//           Thinking  <AnimatedDots />
//         </Text>}

//         <FlatList
//           data={transcripts}
//           keyExtractor={(_, i) => i.toString()}
//           renderItem={({ item }) => <TranscriptCard text={item} />}
//           contentContainerStyle={
//             transcripts.length === 0 ? styles.emptyContainer : undefined
//           }
//           ListEmptyComponent={
//             <View style={styles.emptyInner}>
//               <Ionicons name="mic-outline" size={48} color="#888" style={styles.icon} />
//               <Text style={styles.emptyTitle}>No transcripts available</Text>
//               <Text style={styles.emptyHint}>
//                 Press the button below to start recording your first voice input.
//               </Text>
//             </View>
//           }
//         />
//       </>

//       <PressButton
//         panX={panXRef}
//         onPressIn={startListening}
//         onPressOut={stopListening}
//         onSwipeCancel={handleSwipeCancel}
//         disabled={uiState === "processing" || isBusy}
//         label={
//           uiState === "listening" ? "Listening..." : "Press to Talk"
//         }
//       />

//       {/* LISTENING OVERLAY */}
//       {uiState === "listening" && (
//         <CaptureOverlay
//           startTs={listeningStart}
//           panX={panXRef}
//           cancelThreshold={120}
//         />
//       )}


//     </SafeAreaView>
//   );
// }


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

  // useEffect(() => {
  //   voiceApi.setScenario(scenario);
  //   audioService.cleanupTemp();
  // }, [scenario]);

  const { startRecording, stopRecording, cancelRecording, isRecording } = useAudioRecorderService();

  useEffect(() => {
    voiceApi.setScenario(scenario);
    // Setup on mount
    (async () => {
      const granted = await AudioService.requestPermission();
      if (granted) {
        await AudioService.setupAudioMode();
      }
    })();
  }, [scenario]);

  const startListening = async () => {
    // guard: don’t allow overlapping recordings
    if (isBusy) return;
    setIsBusy(true);
    setCancelled(false);

    try {
      // request mic permission
      // const ok = await audioService.requestPermission();
      // if (!ok) {
      //   Alert.alert(
      //     "Microphone Permission Required",
      //     "Please enable microphone access in settings."
      //   );
      //   return;
      // }

      // start recording
      // await audioService.startRecording();
      await startRecording();
      setListeningStart(Date.now());
      setUiState("listening");
    } catch (err) {
      // console.error("Error starting recording:", err);
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
      // const { uri, mimeType } = await audioService.stopAndSave();
      const { uri } = await stopRecording();
      console.log('Recording saved:', uri);
      const input: ProcessVoiceInput = {
        audioUri: uri,
        // mimeType,
        mimeType: 'audio/wav',
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
      const errorCode = err["code"];
      console.log("Jackline ahero", errorCode);
      if (errorCode === undefined) {
        // console.error("Processing  error okello:", err);

        // setError(err.message || "Something went wrong. Please try again.");
        setError("Something unexpected went wrong. Please try again.");
        setUiState("error");
      }
      else {
        const customizedMessage = stubErrorMessage(errorCode);
        // console.error("Processing error enos:", err);
        setError(customizedMessage);
        setUiState("error");
      }
    } finally {
      setIsBusy(false);
    }
  };

  const handleSwipeCancel = async () => {
    // user swiped right while holding
    setCancelled(true);
    try {
      // await audioService.cancelRecording();
      await cancelRecording();
    } catch (err) {
      console.warn("Cancel recording error:", err);
    } finally {
      setUiState("idle");
      // small haptic or animation feedback could go here
    }
  };

  const playResponseAudio = async (fileIndex: number) => {
    console.log(`[Audio] Starting playback for file index ${fileIndex}`);
    try {
      // 1. Load the module
      const module =
        fileIndex === 1
          ? require("../assets/audio/audiofile1.mp3")
          : require("../assets/audio/audiofile2.mp3");
      console.log(`[Audio] Module loaded:`, module);

      // 2. Create and download asset if needed
      const asset = Asset.fromModule(module);
      console.log(`[Audio] Asset state:`, {
        name: asset.name,
        type: asset.type,
        uri: asset.uri,
        localUri: asset.localUri,
        downloaded: asset.downloaded,
      });

      // Always try to ensure the file exists, even if asset claims to be downloaded
      let fileExists = false;
      if (asset.localUri) {
        try {
          const info = await FileSystem.getInfoAsync(asset.localUri);
          fileExists = info.exists;
          console.log('[Audio] Asset file exists:', fileExists);
        } catch (err) {
          console.warn('[Audio] Error checking file:', err);
        }
      }

      // Download/re-download if needed
      if (!fileExists) {
        console.log('[Audio] Asset needs downloading...');
        try {
          // Force fresh download by clearing the downloaded flag
          asset.downloaded = false;
          asset.localUri = null;
          await asset.downloadAsync();
          console.log('[Audio] Asset downloaded successfully');

          // Double check the file exists
          const info = await FileSystem.getInfoAsync(asset.localUri!);
          fileExists = info.exists;
          console.log('[Audio] Download verified, file exists:', fileExists);

          if (!fileExists) {
            throw new Error('Downloaded asset file not found');
          }
        } catch (dErr) {
          console.warn("[Audio] Asset download failed:", dErr);
          console.log('[Audio] Will try direct module require instead');
        }
      }

      // 3. Get final URI to use
      const uri = asset.localUri || asset.uri || module;
      console.log(`[Audio] Final URI to use:`, uri);

      // 4. For string URIs, verify file exists
      if (typeof uri === "string") {
        try {
          const info = await FileSystem.getInfoAsync(uri);
          console.log(`[Audio] File info for ${uri}:`, info);

          if (!info.exists) {
            console.log('[Audio] File not found, falling back to module require');
            const { sound } = await Audio.Sound.createAsync(module);
            await sound.setVolumeAsync(1.0); // Ensure volume is up
            const status = await sound.getStatusAsync();
            console.log('[Audio] Sound created from module, status:', status);
            await sound.playAsync();
            return;
          }
        } catch (fsErr) {
          console.warn("[Audio] Failed to check file:", fsErr);
        }
      }

      // 5. Create and play the sound
      const source = typeof uri === "string" ? { uri } : uri;
      console.log('[Audio] Creating sound with source:', source);

      const { sound } = await Audio.Sound.createAsync(source, { shouldPlay: false });
      await sound.setVolumeAsync(1.0); // Ensure volume is up
      const status = await sound.getStatusAsync();
      console.log('[Audio] Sound created, initial status:', status);

      await sound.playAsync();
      console.log('[Audio] Playback started');

      // Clean up sound when done
      sound.setOnPlaybackStatusUpdate(async (status: any) => {
        if (status.didJustFinish) {
          console.log('[Audio] Playback finished, unloading sound');
          await sound.unloadAsync();
        }
      });
    } catch (err) {
      // force
      // console.error("[Audio] Playback failed with error:", err);

      // Try to get more error context
      if (err instanceof Error) {
        // force
        // console.error("[Audio] Error details:", {
        //   name: err.name,
        //   message: err.message,
        //   stack: err.stack,
        // });
      }

      // Alert user of failure
      Alert.alert(
        "Playback Failed",
        "Unable to play the response audio. Please try again."
      );
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

      {uiState === "clarification" && prompt && (
        <ClarificationBanner prompt={prompt || "Assistant requires clarification"} />
      )}


      {uiState === "error" && (
        <ErrorBanner
          message={error || "Oops! Something unexpected happened. Please try again."}
          onRetry={retryError}
        />
      )}

      <>
        {(transcripts.length > 0 || uiState === "processing") && <View style={styles.subTitleContainer}>
          <Text style={styles.subTitle}>Recent transcripts</Text>
          <Spacer height={4} />
        </View>}

        {uiState === "processing" && <Text style={styles.processingText}>
          Thinking  <AnimatedDots />
        </Text>}

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
      </>

      <PressButton
        panX={panXRef}
        onPressIn={startListening}
        onPressOut={stopListening}
        onSwipeCancel={handleSwipeCancel}
        disabled={uiState === "processing" || isBusy}
        label={
          uiState === "listening" ? "Listening..." : "Press to Talk"
        }
      />

      {/* LISTENING OVERLAY */}
      {uiState === "listening" && (
        <CaptureOverlay
          startTs={listeningStart}
          panX={panXRef}
          cancelThreshold={120}
        />
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
    // paddingVertical: 20,
  },
  // bannerClar: {
  //   backgroundColor: "#fff3bf",
  //   padding: 12,
  //   borderRadius: 8,
  //   marginVertical: 10,
  // },
  bannerClar: {
    backgroundColor: "#e0f2fe",
    borderLeftWidth: 4,
    borderLeftColor: "#2563eb",
    borderRadius: 8,
    padding: 12,
    marginVertical: 10,
    marginHorizontal: 4,
  },
  bannerContent: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  bannerTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#2563eb",
    marginBottom: 2,
  },
  bannerText: {
    fontSize: 14,
    color: "#1e293b",
    lineHeight: 20,
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
  processingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  processingText: {
    fontSize: 14,
    color: "#33333353",
    fontWeight: "500",
    fontStyle: "italic",
    alignSelf: "flex-start",
    marginVertical: 12,
  },
});