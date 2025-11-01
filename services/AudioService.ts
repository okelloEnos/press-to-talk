import {
    AudioModule,
    RecordingPresets,
    setAudioModeAsync,
    useAudioRecorder,
} from "expo-audio";
import { copyAsync, deleteAsync, getInfoAsync, Paths, readDirectoryAsync } from "expo-file-system";

// Service class for non-hook contexts
export class AudioService {
    static async requestPermission(): Promise<boolean> {
        try {
            const status = await AudioModule.requestRecordingPermissionsAsync();
            return status.granted;
        } catch (error) {
            return false;
        }
    }

    static async setupAudioMode(): Promise<void> {
        try {
            await setAudioModeAsync({
                playsInSilentMode: true,
                allowsRecording: true,
            });
        } catch (error) {
            console.error("Audio mode setup failed:", error);
        }
    }

    static async cleanupTemp(): Promise<void> {
        try {
            const cacheDir = Paths.cache;
            if (!cacheDir) return;

            const files = await readDirectoryAsync(cacheDir.uri);
            for (const f of files) {
                if (f.startsWith("rec_")) {
                    await deleteAsync(cacheDir.uri + "/" + f, { idempotent: true });
                }
            }
        } catch (err) {
            console.warn("Cleanup error:", err);
        }
    }

    // Helper to copy recording to cache
    static async saveRecordingToCache(uri: string): Promise<{ uri: string; mimeType: string }> {
        if (!uri) {
            throw new Error("No recording URI provided");
        }

        // Check if it's a content URI (Android)
        const isContentUri = uri.startsWith("content://");

        if (isContentUri) {
            console.log("Using content URI directly");
            return { uri, mimeType: "audio/m4a" };
        }

        // For file URIs, verify and copy
        try {
            const info = await getInfoAsync(uri);

            if (info.exists && info.size && info.size > 0) {
                const dest = `${Paths.cache?.uri}/rec_${Date.now()}.m4a`;

                try {
                    await copyAsync({ from: uri, to: dest });
                    return { uri: dest, mimeType: "audio/m4a" };
                } catch (copyErr) {
                    console.warn("Copy failed, using original:", copyErr);
                    return { uri, mimeType: "audio/m4a" };
                }
            } else {
                console.warn("File exists but is empty");
                return { uri, mimeType: "audio/m4a" };
            }
        } catch (err) {
            console.warn("Could not verify file:", err);
            return { uri, mimeType: "audio/m4a" };
        }
    }
}

// Hook-based recorder for use in components
export function useAudioRecorderService() {
    const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);

    const startRecording = async () => {
        try {
            await recorder.prepareToRecordAsync();
            recorder.record();
        } catch (error) {
            throw error;
        }
    };

    const stopRecording = async (): Promise<{ uri: string; mimeType: string }> => {
        try {
            await recorder.stop();
            const uri = recorder.uri;

            if (!uri) {
                throw new Error("No recording URI available");
            }

            return await AudioService.saveRecordingToCache(uri);
        } catch (error) {
            throw error;
        }
    };

    const cancelRecording = async () => {
        try {
            if (recorder.isRecording) {
                await recorder.stop();
            }
        } catch (error) {
            console.warn("Error canceling recording:", error);
        }
    };

    return {
        recorder,
        startRecording,
        stopRecording,
        cancelRecording,
        isRecording: recorder.isRecording,
        duration: recorder.currentTime,
    };
}