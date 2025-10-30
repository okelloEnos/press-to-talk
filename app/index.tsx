import { AudioService } from "@/services/AudioService";
import { StubVoiceApi } from "@/services/VoiceApi";
import { Audio } from "expo-av";
import { Alert, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import PTTButton from "../components/PTTButton";
import { ProcessVoiceInput } from "../types";

// Initialize services
const audioService = new AudioService();
const voiceApi = new StubVoiceApi({ scenario: 'success', delayMs: 1500 });

export default function Index() {


  const startRecording = async () => {
    const ok = await audioService.requestPermission();
    if (!ok) {
      Alert.alert("Permission required", "Enable microphone access to record.");
      return;
    }


    await audioService.startRecording();
  };

  const stopRecording = async () => {

    try {
      const { uri, mimeType } = await audioService.stopAndSave();
      const input: ProcessVoiceInput = { audioUri: uri, mimeType, clientTs: new Date().toISOString() };
      const res = await voiceApi.processVoice(input);
    } catch (err: any) {
      Alert.alert("Error", err.message || "An error occurred while processing your request.");
    }
  };

  const playResponseAudio = async (fileIndex: number) => {
    const file =
      fileIndex === 1
        ? require("../assets/audio/audiofile1.mp3")
        : require("../assets/audio/audiofile2.mp3");

    const { sound } = await Audio.Sound.createAsync(file);
    await sound.playAsync();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Press to Talk</Text>
      </View>
      <View style={styles.footer}>
        <PTTButton onPressIn={startRecording} onPressOut={stopRecording} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 16 },
  header: { marginBottom: 10 },
  title: { fontSize: 20, fontWeight: "700" },
  footer: { alignItems: "center", paddingVertical: 20 },
});