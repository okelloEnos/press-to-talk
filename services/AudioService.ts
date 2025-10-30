import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system/legacy";

// services/AudioService.ts
// import { Audio } from "expo-av";
// import * as FileSystem from "expo-file-system";

export class AudioService {
    recording: Audio.Recording | null = null;
    private isPreparing = false;
    private isStopping = false;

    async requestPermission(): Promise<boolean> {
        const { status } = await Audio.requestPermissionsAsync();
        return status === "granted";
    }

    // Start recording with guards
    async startRecording(): Promise<void> {
        if (this.isPreparing) return; // already preparing
        // If there is an existing recording object, ensure it's cleaned first
        if (this.recording) {
            // attempt to cancel/cleanup existing recording
            try {
                await this.cancelRecording();
            } catch {
                // ignore and continue
            }
        }

        this.isPreparing = true;
        try {
            await Audio.setAudioModeAsync({
                allowsRecordingIOS: true,
                playsInSilentModeIOS: true,
            });

            const recording = new Audio.Recording();
            // prepare and start
            await recording.prepareToRecordAsync(
                Audio.RecordingOptionsPresets.HIGH_QUALITY
            );
            await recording.startAsync();

            // set prepared recording only after both await calls succeed
            this.recording = recording;
        } finally {
            this.isPreparing = false;
        }
    }

    // // Stop and save (atomic)
    // async stopAndSave(): Promise<{ uri: string; mimeType: string }> {
    //     if (!this.recording) throw new Error("No recording in progress");
    //     if (this.isStopping) throw new Error("Already stopping recording");
    //     this.isStopping = true;
    //     try {
    //         await this.recording.stopAndUnloadAsync();
    //         const uri = this.recording.getURI()!;
    //         const dest = FileSystem.cacheDirectory + `rec_${Date.now()}.m4a`;

    //         // copy to cache and reset
    //         await FileSystem.copyAsync({ from: uri, to: dest });
    //         this.recording = null;
    //         return { uri: dest, mimeType: "audio/m4a" };
    //     } finally {
    //         this.isStopping = false;
    //     }
    // }

    async stopAndSave(): Promise<{ uri: string; mimeType: string }> {
        if (!this.recording) throw new Error("No recording in progress");

        if (this.isStopping) throw new Error("Already stopping recording");
        this.isStopping = true;

        try {
            // stop & unload
            await this.recording.stopAndUnloadAsync();

            const uri = this.recording.getURI();
            // unset recording reference asap
            this.recording = null;

            if (!uri) {
                throw new Error("Recording finished but no file URI reported.");
            }

            // Wait/check for the file to become available (tiny retry loop)
            const maxAttempts = 6;
            let info = await FileSystem.getInfoAsync(uri);
            let attempts = 0;
            while ((!info.exists || info.size === 0) && attempts < maxAttempts) {
                // small delay so the OS can flush the file
                await new Promise((r) => setTimeout(r, 200));
                info = await FileSystem.getInfoAsync(uri);
                attempts++;
            }

            if (!info.exists) {
                // If file still doesn't exist, return original URI (some platforms provide content:// URIs)
                // but let caller know by throwing or returning - we choose to throw for clarity:
                throw new Error(`Recorded file not available at ${uri}`);
            }

            // Destination in cache with m4a extension (safe)
            const dest = `${FileSystem.cacheDirectory}rec_${Date.now()}.m4a`;

            try {
                await FileSystem.copyAsync({ from: uri, to: dest });
                return { uri: dest, mimeType: "audio/m4a" };
            } catch (copyErr) {
                // Copy failed — log and fallback to original URI if usable (some platforms allow direct playback)
                console.warn("File copy failed, returning original URI. copyErr:", copyErr);
                return { uri, mimeType: "audio/m4a" };
            }
        } finally {
            this.isStopping = false;
        }
    }

    async cancelRecording(): Promise<void> {
        // try best-effort cleanup
        try {
            if (this.isPreparing) {
                // wait a short bit for prepare to finish or clear it
                // reasonably small loop with timeout to avoid indefinite wait
                const start = Date.now();
                while (this.isPreparing && Date.now() - start < 1000) {
                    // small sleep
                    await new Promise((r) => setTimeout(r, 50));
                }
            }

            if (this.recording) {
                // stop/unload if possible
                try {
                    // avoid re-entrancy
                    if (!this.isStopping) {
                        this.isStopping = true;
                        await this.recording.stopAndUnloadAsync();
                        this.isStopping = false;
                    }
                } catch {
                    // ignore stop errors
                    this.isStopping = false;
                }
                this.recording = null;
            }
        } catch {
            // ignore
            this.recording = null;
            this.isPreparing = false;
            this.isStopping = false;
        }
    }

    async cleanupTemp(): Promise<void> {
        try {
            if (!FileSystem.cacheDirectory) return;
            const files = await FileSystem.readDirectoryAsync(FileSystem.cacheDirectory);
            for (const f of files) {
                if (f.startsWith("rec_")) {
                    await FileSystem.deleteAsync(FileSystem.cacheDirectory + f, { idempotent: true });
                }
            }
        } catch {
            // ignore
        }
    }
}
