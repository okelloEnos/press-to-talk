// import { Audio } from "expo-av";
// import * as FileSystem from "expo-file-system/legacy";

// export class AudioService {
//     recording: Audio.Recording | null = null;
//     private isPreparing = false;
//     private isStopping = false;

//     async requestPermission(): Promise<boolean> {
//         const { status } = await Audio.requestPermissionsAsync();
//         return status === "granted";
//     }

//     // Start recording with guards
//     async startRecording(): Promise<void> {
//         if (this.isPreparing) return; // already preparing
//         // If there is an existing recording object, ensure it's cleaned first
//         if (this.recording) {
//             // attempt to cancel/cleanup existing recording
//             try {
//                 await this.cancelRecording();
//             } catch {
//                 // ignore and continue
//             }
//         }

//         this.isPreparing = true;
//         try {
//             await Audio.setAudioModeAsync({
//                 allowsRecordingIOS: true,
//                 playsInSilentModeIOS: true,
//             });

//             const recording = new Audio.Recording();
//             // prepare and start
//             await recording.prepareToRecordAsync(
//                 Audio.RecordingOptionsPresets.HIGH_QUALITY
//             );
//             await recording.startAsync();

//             // set prepared recording only after both await calls succeed
//             this.recording = recording;
//         } finally {
//             this.isPreparing = false;
//         }
//     }

//     // // // Stop and save (atomic)
//     // // async stopAndSave(): Promise<{ uri: string; mimeType: string }> {
//     // //     if (!this.recording) throw new Error("No recording in progress");
//     // //     if (this.isStopping) throw new Error("Already stopping recording");
//     // //     this.isStopping = true;
//     // //     try {
//     // //         await this.recording.stopAndUnloadAsync();
//     // //         const uri = this.recording.getURI()!;
//     // //         const dest = FileSystem.cacheDirectory + `rec_${Date.now()}.m4a`;

//     // //         // copy to cache and reset
//     // //         await FileSystem.copyAsync({ from: uri, to: dest });
//     // //         this.recording = null;
//     // //         return { uri: dest, mimeType: "audio/m4a" };
//     // //     } finally {
//     // //         this.isStopping = false;
//     // //     }
//     // // }

//     // async stopAndSave(): Promise<{ uri: string; mimeType: string }> {
//     //     if (!this.recording) throw new Error("No recording in progress");

//     //     if (this.isStopping) throw new Error("Already stopping recording");
//     //     this.isStopping = true;

//     //     try {
//     //         // stop & unload
//     //         await this.recording.stopAndUnloadAsync();

//     //         const uri = this.recording.getURI();
//     //         // unset recording reference asap
//     //         this.recording = null;

//     //         if (!uri) {
//     //             throw new Error("Recording finished but no file URI reported.");
//     //         }

//     //         // Wait/check for the file to become available (tiny retry loop)
//     //         const maxAttempts = 6;
//     //         let info = await FileSystem.getInfoAsync(uri);
//     //         let attempts = 0;
//     //         while ((!info.exists || info.size === 0) && attempts < maxAttempts) {
//     //             // small delay so the OS can flush the file
//     //             await new Promise((r) => setTimeout(r, 200));
//     //             info = await FileSystem.getInfoAsync(uri);
//     //             attempts++;
//     //         }

//     //         if (!info.exists) {
//     //             // If file still doesn't exist, return original URI (some platforms provide content:// URIs)
//     //             // but let caller know by throwing or returning - we choose to throw for clarity:
//     //             throw new Error(`Recorded file not available at ${uri}`);
//     //         }

//     //         // Destination in cache with m4a extension (safe)
//     //         const dest = `${FileSystem.cacheDirectory}rec_${Date.now()}.m4a`;

//     //         try {
//     //             await FileSystem.copyAsync({ from: uri, to: dest });
//     //             return { uri: dest, mimeType: "audio/m4a" };
//     //         } catch (copyErr) {
//     //             // Copy failed — log and fallback to original URI if usable (some platforms allow direct playback)
//     //             console.warn("File copy failed, returning original URI. copyErr:", copyErr);
//     //             return { uri, mimeType: "audio/m4a" };
//     //         }
//     //     } finally {
//     //         this.isStopping = false;
//     //     }
//     // }

//     ///Good Improved stopAndSave with content:// URI handling

//     // async stopAndSave(): Promise<{ uri: string; mimeType: string }> {
//     //     if (!this.recording) throw new Error("No recording in progress");

//     //     if (this.isStopping) throw new Error("Already stopping recording");
//     //     this.isStopping = true;

//     //     try {
//     //         // stop & unload
//     //         await this.recording.stopAndUnloadAsync();

//     //         const uri = this.recording.getURI();
//     //         // unset recording reference asap
//     //         this.recording = null;

//     //         if (!uri) {
//     //             throw new Error("Recording finished but no file URI reported.");
//     //         }

//     //         // Android may use content:// URIs - try to use directly first
//     //         const isContentUri = uri.startsWith("content://");

//     //         if (isContentUri) {
//     //             // Content URIs can be used directly, no copy needed
//     //             console.log("Using content URI directly:", uri);
//     //             return { uri, mimeType: "audio/m4a" };
//     //         }

//     //         // For file:// URIs, wait for file availability
//     //         const maxAttempts = 10;
//     //         let attempts = 0;
//     //         let info = await FileSystem.getInfoAsync(uri);

//     //         while ((!info.exists || info.size === 0) && attempts < maxAttempts) {
//     //             await new Promise((r) => setTimeout(r, 300));
//     //             info = await FileSystem.getInfoAsync(uri);
//     //             attempts++;
//     //         }

//     //         if (!info.exists || info.size === 0) {
//     //             // File still not available - try using original URI anyway
//     //             console.warn(`File not found after ${attempts} attempts, using original URI:`, uri);
//     //             return { uri, mimeType: "audio/m4a" };
//     //         }

//     //         // Destination in cache with m4a extension
//     //         const dest = `${FileSystem.cacheDirectory}rec_${Date.now()}.m4a`;

//     //         try {
//     //             await FileSystem.copyAsync({ from: uri, to: dest });
//     //             return { uri: dest, mimeType: "audio/m4a" };
//     //         } catch (copyErr) {
//     //             // Copy failed — return original URI as fallback
//     //             console.warn("File copy failed, returning original URI. Error:", copyErr);
//     //             return { uri, mimeType: "audio/m4a" };
//     //         }
//     //     } finally {
//     //         this.isStopping = false;
//     //     }
//     // }


//     async stopAndSave(): Promise<{ uri: string; mimeType: string }> {
//         if (!this.recording) throw new Error("No recording in progress");

//         if (this.isStopping) throw new Error("Already stopping recording");
//         this.isStopping = true;

//         try {
//             // Get URI BEFORE stopping (important!)
//             const uri = this.recording.getURI();

//             if (!uri) {
//                 throw new Error("Recording has no URI before stopping.");
//             }

//             // Now stop & unload
//             await this.recording.stopAndUnloadAsync();

//             // Clear reference immediately after stop
//             const recordingRef = this.recording;
//             this.recording = null;

//             // Get the recording status to check if data was actually recorded
//             const status = await recordingRef.getStatusAsync();
//             console.log("Recording status:", status);

//             // Android may use content:// URIs - try to use directly first
//             const isContentUri = uri.startsWith("content://");

//             if (isContentUri) {
//                 console.log("Using content URI directly:", uri);
//                 return { uri, mimeType: "audio/m4a" };
//             }

//             // For file:// URIs, wait for file availability with exponential backoff
//             const maxAttempts = 15;
//             let attempts = 0;
//             let lastError = null;

//             while (attempts < maxAttempts) {
//                 try {
//                     const info = await FileSystem.getInfoAsync(uri);

//                     if (info.exists && info.size && info.size > 0) {
//                         // File exists with content! Try to copy it
//                         const dest = `${FileSystem.cacheDirectory}rec_${Date.now()}.m4a`;

//                         try {
//                             await FileSystem.copyAsync({ from: uri, to: dest });
//                             console.log("Successfully copied recording to:", dest);
//                             return { uri: dest, mimeType: "audio/m4a" };
//                         } catch (copyErr) {
//                             console.warn("Copy failed, using original URI. Error:", copyErr);
//                             return { uri, mimeType: "audio/m4a" };
//                         }
//                     }
//                 } catch (err) {
//                     lastError = err;
//                 }

//                 // Exponential backoff: 100ms, 200ms, 400ms, 800ms, then 500ms
//                 const delay = attempts < 4 ? 100 * Math.pow(2, attempts) : 500;
//                 await new Promise((r) => setTimeout(r, delay));
//                 attempts++;
//             }

//             // File never became available
//             console.warn(`File not found after ${attempts} attempts.`);
//             console.warn("Last error:", lastError);
//             console.warn("Recording status:", status);

//             // As a last resort, return the URI anyway - it might work
//             return { uri, mimeType: "audio/m4a" };

//         } finally {
//             this.isStopping = false;
//         }
//     }

//     async cancelRecording(): Promise<void> {
//         // try best-effort cleanup
//         try {
//             if (this.isPreparing) {
//                 // wait a short bit for prepare to finish or clear it
//                 // reasonably small loop with timeout to avoid indefinite wait
//                 const start = Date.now();
//                 while (this.isPreparing && Date.now() - start < 1000) {
//                     // small sleep
//                     await new Promise((r) => setTimeout(r, 50));
//                 }
//             }

//             if (this.recording) {
//                 // stop/unload if possible
//                 try {
//                     // avoid re-entrancy
//                     if (!this.isStopping) {
//                         this.isStopping = true;
//                         await this.recording.stopAndUnloadAsync();
//                         this.isStopping = false;
//                     }
//                 } catch {
//                     // ignore stop errors
//                     this.isStopping = false;
//                 }
//                 this.recording = null;
//             }
//         } catch {
//             // ignore
//             this.recording = null;
//             this.isPreparing = false;
//             this.isStopping = false;
//         }
//     }

//     async cleanupTemp(): Promise<void> {
//         try {
//             if (!FileSystem.cacheDirectory) return;
//             const files = await FileSystem.readDirectoryAsync(FileSystem.cacheDirectory);
//             for (const f of files) {
//                 if (f.startsWith("rec_")) {
//                     await FileSystem.deleteAsync(FileSystem.cacheDirectory + f, { idempotent: true });
//                 }
//             }
//         } catch {
//             // ignore
//         }
//     }
// }



/// second Improved AudioService with robust stopAndSave

// import {
//     AudioRecorder,
//     RecordingOptions,
//     RecordingPresets,
// } from "expo-audio";
// import * as FileSystem from "expo-file-system";

// export class AudioService {
//     recording: AudioRecorder | null = null;
//     private isPreparing = false;
//     private isStopping = false;

//     async requestPermission(): Promise<boolean> {
//         try {
//             const response = await AudioRecorder.requestPermissionsAsync();
//             return response.granted;
//         } catch (error) {
//             console.error("Permission request failed:", error);
//             return false;
//         }
//     }

//     // Start recording with guards
//     async startRecording(): Promise<void> {
//         if (this.isPreparing) return;

//         // Clean up any existing recording
//         if (this.recording) {
//             try {
//                 await this.cancelRecording();
//             } catch {
//                 // ignore and continue
//             }
//         }

//         this.isPreparing = true;
//         try {
//             // Create new recording instance
//             const recording = new AudioRecorder();

//             // Prepare with high quality preset
//             await recording.prepareAsync(RecordingPresets.HIGH_QUALITY);

//             // Start recording
//             await recording.startAsync();

//             // Set recording only after successful start
//             this.recording = recording;
//         } finally {
//             this.isPreparing = false;
//         }
//     }

//     async stopAndSave(): Promise<{ uri: string; mimeType: string }> {
//         if (!this.recording) throw new Error("No recording in progress");

//         if (this.isStopping) throw new Error("Already stopping recording");
//         this.isStopping = true;

//         try {
//             // Stop the recording - this returns the URI directly
//             const uri = await this.recording.stopAsync();

//             // Clear reference
//             this.recording = null;

//             if (!uri) {
//                 throw new Error("Recording stopped but no URI returned");
//             }

//             console.log("Recording stopped, URI:", uri);

//             // Check if it's a content URI (Android)
//             const isContentUri = uri.startsWith("content://");

//             if (isContentUri) {
//                 console.log("Using content URI directly");
//                 return { uri, mimeType: "audio/m4a" };
//             }

//             // For file URIs, verify the file exists
//             try {
//                 const info = await FileSystem.getInfoAsync(uri);

//                 if (info.exists && info.size && info.size > 0) {
//                     // File exists! Copy to cache with timestamp
//                     const dest = `${FileSystem.cacheDirectory}rec_${Date.now()}.m4a`;

//                     try {
//                         await FileSystem.copyAsync({ from: uri, to: dest });
//                         console.log("Recording copied to:", dest);
//                         return { uri: dest, mimeType: "audio/m4a" };
//                     } catch (copyErr) {
//                         console.warn("Copy failed, using original:", copyErr);
//                         return { uri, mimeType: "audio/m4a" };
//                     }
//                 } else {
//                     console.warn("File exists but is empty, using URI anyway");
//                     return { uri, mimeType: "audio/m4a" };
//                 }
//             } catch (err) {
//                 console.warn("Could not verify file, using URI anyway:", err);
//                 return { uri, mimeType: "audio/m4a" };
//             }
//         } finally {
//             this.isStopping = false;
//         }
//     }

//     async cancelRecording(): Promise<void> {
//         try {
//             // Wait for any ongoing preparation
//             if (this.isPreparing) {
//                 const start = Date.now();
//                 while (this.isPreparing && Date.now() - start < 1000) {
//                     await new Promise((r) => setTimeout(r, 50));
//                 }
//             }

//             if (this.recording) {
//                 try {
//                     if (!this.isStopping) {
//                         this.isStopping = true;
//                         await this.recording.stopAsync();
//                         this.isStopping = false;
//                     }
//                 } catch (err) {
//                     console.warn("Error stopping recording:", err);
//                     this.isStopping = false;
//                 }
//                 this.recording = null;
//             }
//         } catch (err) {
//             console.warn("Error in cancelRecording:", err);
//             this.recording = null;
//             this.isPreparing = false;
//             this.isStopping = false;
//         }
//     }

//     async cleanupTemp(): Promise<void> {
//         try {
//             if (!FileSystem.cacheDirectory) return;
//             const files = await FileSystem.readDirectoryAsync(
//                 FileSystem.cacheDirectory
//             );
//             for (const f of files) {
//                 if (f.startsWith("rec_")) {
//                     await FileSystem.deleteAsync(
//                         FileSystem.cacheDirectory + f,
//                         { idempotent: true }
//                     );
//                 }
//             }
//         } catch (err) {
//             console.warn("Cleanup error:", err);
//         }
//     }
// }


/// third Improved AudioService with robust stopAndSave and new cacheDirectory import

// import {
//     AudioRecorder,
//     RecordingOptions,
//     RecordingPresets,
// } from "expo-audio";
// import * as FileSystem from "expo-file-system";
// import { cacheDirectory } from "expo-file-system/next";

// export class AudioService {
//     recording: AudioRecorder | null = null;
//     private isPreparing = false;
//     private isStopping = false;

//     async requestPermission(): Promise<boolean> {
//         try {
//             const response = await AudioRecorder.requestPermissionsAsync();
//             return response.granted;
//         } catch (error) {
//             console.error("Permission request failed:", error);
//             return false;
//         }
//     }

//     // Start recording with guards
//     async startRecording(): Promise<void> {
//         if (this.isPreparing) return;

//         // Clean up any existing recording
//         if (this.recording) {
//             try {
//                 await this.cancelRecording();
//             } catch {
//                 // ignore and continue
//             }
//         }

//         this.isPreparing = true;
//         try {
//             // Create new recording instance
//             const recording = new AudioRecorder();

//             // Prepare with high quality preset
//             await recording.prepareAsync(RecordingPresets.HIGH_QUALITY);

//             // Start recording
//             await recording.startAsync();

//             // Set recording only after successful start
//             this.recording = recording;
//         } finally {
//             this.isPreparing = false;
//         }
//     }

//     async stopAndSave(): Promise<{ uri: string; mimeType: string }> {
//         if (!this.recording) throw new Error("No recording in progress");

//         if (this.isStopping) throw new Error("Already stopping recording");
//         this.isStopping = true;

//         try {
//             // Stop the recording - this returns the URI directly
//             const uri = await this.recording.stopAsync();

//             // Clear reference
//             this.recording = null;

//             if (!uri) {
//                 throw new Error("Recording stopped but no URI returned");
//             }

//             console.log("Recording stopped, URI:", uri);

//             // Check if it's a content URI (Android)
//             const isContentUri = uri.startsWith("content://");

//             if (isContentUri) {
//                 console.log("Using content URI directly");
//                 return { uri, mimeType: "audio/m4a" };
//             }

//             // For file URIs, verify the file exists
//             try {
//                 const info = await FileSystem.getInfoAsync(uri);

//                 if (info.exists && info.size && info.size > 0) {
//                     // File exists! Copy to cache with timestamp
//                     const dest = `${cacheDirectory}rec_${Date.now()}.m4a`;

//                     try {
//                         await FileSystem.copyAsync({ from: uri, to: dest });
//                         console.log("Recording copied to:", dest);
//                         return { uri: dest, mimeType: "audio/m4a" };
//                     } catch (copyErr) {
//                         console.warn("Copy failed, using original:", copyErr);
//                         return { uri, mimeType: "audio/m4a" };
//                     }
//                 } else {
//                     console.warn("File exists but is empty, using URI anyway");
//                     return { uri, mimeType: "audio/m4a" };
//                 }
//             } catch (err) {
//                 console.warn("Could not verify file, using URI anyway:", err);
//                 return { uri, mimeType: "audio/m4a" };
//             }
//         } finally {
//             this.isStopping = false;
//         }
//     }

//     async cancelRecording(): Promise<void> {
//         try {
//             // Wait for any ongoing preparation
//             if (this.isPreparing) {
//                 const start = Date.now();
//                 while (this.isPreparing && Date.now() - start < 1000) {
//                     await new Promise((r) => setTimeout(r, 50));
//                 }
//             }

//             if (this.recording) {
//                 try {
//                     if (!this.isStopping) {
//                         this.isStopping = true;
//                         await this.recording.stopAsync();
//                         this.isStopping = false;
//                     }
//                 } catch (err) {
//                     console.warn("Error stopping recording:", err);
//                     this.isStopping = false;
//                 }
//                 this.recording = null;
//             }
//         } catch (err) {
//             console.warn("Error in cancelRecording:", err);
//             this.recording = null;
//             this.isPreparing = false;
//             this.isStopping = false;
//         }
//     }

//     async cleanupTemp(): Promise<void> {
//         try {
//             if (!cacheDirectory) return;
//             const files = await FileSystem.readDirectoryAsync(cacheDirectory);
//             for (const f of files) {
//                 if (f.startsWith("rec_")) {
//                     await FileSystem.deleteAsync(cacheDirectory + f, {
//                         idempotent: true,
//                     });
//                 }
//             }
//         } catch (err) {
//             console.warn("Cleanup error:", err);
//         }
//     }
// }

/// fourth Improved AudioService with robust stopAndSave and new cacheDirectory import
// import {
//     AudioRecorder,
//     RecordingOptions,
//     RecordingPresets,
// } from "expo-audio";
// import * as FileSystem from "expo-file-system";
// import { Paths } from "expo-file-system";

// export class AudioService {
//     recording: AudioRecorder | null = null;
//     private isPreparing = false;
//     private isStopping = false;

//     async requestPermission(): Promise<boolean> {
//         try {
//             const response = await AudioRecorder.requestPermissionsAsync();
//             return response.granted;
//         } catch (error) {
//             console.error("Permission request failed:", error);
//             return false;
//         }
//     }

//     // Start recording with guards
//     async startRecording(): Promise<void> {
//         if (this.isPreparing) return;

//         // Clean up any existing recording
//         if (this.recording) {
//             try {
//                 await this.cancelRecording();
//             } catch {
//                 // ignore and continue
//             }
//         }

//         this.isPreparing = true;
//         try {
//             // Create new recording instance
//             const recording = new AudioRecorder();

//             // Prepare with high quality preset
//             await recording.prepareAsync(RecordingPresets.HIGH_QUALITY);

//             // Start recording
//             await recording.startAsync();

//             // Set recording only after successful start
//             this.recording = recording;
//         } finally {
//             this.isPreparing = false;
//         }
//     }

//     async stopAndSave(): Promise<{ uri: string; mimeType: string }> {
//         if (!this.recording) throw new Error("No recording in progress");

//         if (this.isStopping) throw new Error("Already stopping recording");
//         this.isStopping = true;

//         try {
//             // Stop the recording - this returns the URI directly
//             const uri = await this.recording.stopAsync();

//             // Clear reference
//             this.recording = null;

//             if (!uri) {
//                 throw new Error("Recording stopped but no URI returned");
//             }

//             console.log("Recording stopped, URI:", uri);

//             // Check if it's a content URI (Android)
//             const isContentUri = uri.startsWith("content://");

//             if (isContentUri) {
//                 console.log("Using content URI directly");
//                 return { uri, mimeType: "audio/m4a" };
//             }

//             // For file URIs, verify the file exists
//             try {
//                 const info = await FileSystem.getInfoAsync(uri);

//                 if (info.exists && info.size && info.size > 0) {
//                     // File exists! Copy to cache with timestamp
//                     const dest = `${Paths.cache}rec_${Date.now()}.m4a`;

//                     try {
//                         await FileSystem.copyAsync({ from: uri, to: dest });
//                         console.log("Recording copied to:", dest);
//                         return { uri: dest, mimeType: "audio/m4a" };
//                     } catch (copyErr) {
//                         console.warn("Copy failed, using original:", copyErr);
//                         return { uri, mimeType: "audio/m4a" };
//                     }
//                 } else {
//                     console.warn("File exists but is empty, using URI anyway");
//                     return { uri, mimeType: "audio/m4a" };
//                 }
//             } catch (err) {
//                 console.warn("Could not verify file, using URI anyway:", err);
//                 return { uri, mimeType: "audio/m4a" };
//             }
//         } finally {
//             this.isStopping = false;
//         }
//     }

//     async cancelRecording(): Promise<void> {
//         try {
//             // Wait for any ongoing preparation
//             if (this.isPreparing) {
//                 const start = Date.now();
//                 while (this.isPreparing && Date.now() - start < 1000) {
//                     await new Promise((r) => setTimeout(r, 50));
//                 }
//             }

//             if (this.recording) {
//                 try {
//                     if (!this.isStopping) {
//                         this.isStopping = true;
//                         await this.recording.stopAsync();
//                         this.isStopping = false;
//                     }
//                 } catch (err) {
//                     console.warn("Error stopping recording:", err);
//                     this.isStopping = false;
//                 }
//                 this.recording = null;
//             }
//         } catch (err) {
//             console.warn("Error in cancelRecording:", err);
//             this.recording = null;
//             this.isPreparing = false;
//             this.isStopping = false;
//         }
//     }

//     async cleanupTemp(): Promise<void> {
//         try {
//             const cacheDir = Paths.cache;
//             if (!cacheDir) return;

//             const files = await FileSystem.readDirectoryAsync(cacheDir);
//             for (const f of files) {
//                 if (f.startsWith("rec_")) {
//                     await FileSystem.deleteAsync(cacheDir + f, {
//                         idempotent: true,
//                     });
//                 }
//             }
//         } catch (err) {
//             console.warn("Cleanup error:", err);
//         }
//     }
// }

/// fifth Improved AudioService with robust stopAndSave and new cacheDirectory import and hook support
// import {
//     useAudioRecorder,
//     AudioModule,
//     RecordingPresets,
//     setAudioModeAsync,
// } from "expo-audio";
// import { Paths, getInfoAsync, copyAsync, readDirectoryAsync, deleteAsync } from "expo-file-system";

// // Service class for non-hook contexts
// export class AudioService {
//     static async requestPermission(): Promise<boolean> {
//         try {
//             const status = await AudioModule.requestRecordingPermissionsAsync();
//             return status.granted;
//         } catch (error) {
//             console.error("Permission request failed:", error);
//             return false;
//         }
//     }

//     static async setupAudioMode(): Promise<void> {
//         try {
//             await setAudioModeAsync({
//                 playsInSilentMode: true,
//                 allowsRecording: true,
//             });
//         } catch (error) {
//             console.error("Audio mode setup failed:", error);
//         }
//     }

//     static async cleanupTemp(): Promise<void> {
//         try {
//             const cacheDir = Paths.cache;
//             if (!cacheDir) return;

//             const files = await readDirectoryAsync(cacheDir);
//             for (const f of files) {
//                 if (f.startsWith("rec_")) {
//                     await deleteAsync(cacheDir + f, { idempotent: true });
//                 }
//             }
//         } catch (err) {
//             console.warn("Cleanup error:", err);
//         }
//     }

//     // Helper to copy recording to cache
//     static async saveRecordingToCache(uri: string): Promise<{ uri: string; mimeType: string }> {
//         if (!uri) {
//             throw new Error("No recording URI provided");
//         }

//         console.log("Recording stopped, URI:", uri);

//         // Check if it's a content URI (Android)
//         const isContentUri = uri.startsWith("content://");

//         if (isContentUri) {
//             console.log("Using content URI directly");
//             return { uri, mimeType: "audio/m4a" };
//         }

//         // For file URIs, verify and copy
//         try {
//             const info = await getInfoAsync(uri);

//             if (info.exists && info.size && info.size > 0) {
//                 const dest = `${Paths.cache}/rec_${Date.now()}.m4a`;

//                 try {
//                     await copyAsync({ from: uri, to: dest });
//                     console.log("Recording copied to:", dest);
//                     return { uri: dest, mimeType: "audio/m4a" };
//                 } catch (copyErr) {
//                     console.warn("Copy failed, using original:", copyErr);
//                     return { uri, mimeType: "audio/m4a" };
//                 }
//             } else {
//                 console.warn("File exists but is empty");
//                 return { uri, mimeType: "audio/m4a" };
//             }
//         } catch (err) {
//             console.warn("Could not verify file:", err);
//             return { uri, mimeType: "audio/m4a" };
//         }
//     }
// }

// // Hook-based recorder for use in components
// export function useAudioRecorderService() {
//     const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);

//     const startRecording = async () => {
//         try {
//             await recorder.prepareToRecordAsync();
//             recorder.record();
//         } catch (error) {
//             console.error("Failed to start recording:", error);
//             throw error;
//         }
//     };

//     const stopRecording = async (): Promise<{ uri: string; mimeType: string }> => {
//         try {
//             await recorder.stop();
//             const uri = recorder.uri;

//             if (!uri) {
//                 throw new Error("No recording URI available");
//             }

//             return await AudioService.saveRecordingToCache(uri);
//         } catch (error) {
//             console.error("Failed to stop recording:", error);
//             throw error;
//         }
//     };

//     const cancelRecording = async () => {
//         try {
//             if (recorder.isRecording) {
//                 await recorder.stop();
//             }
//         } catch (error) {
//             console.warn("Error canceling recording:", error);
//         }
//     };

//     return {
//         recorder,
//         startRecording,
//         stopRecording,
//         cancelRecording,
//         isRecording: recorder.isRecording,
//         duration: recorder.durationMillis,
//     };
// }

/// sixth Improved AudioService with robust stopAndSave and new cacheDirectory import and hook support

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
            console.error("Permission request failed:", error);
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

        console.log("Recording stopped, URI:", uri);

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
                    console.log("Recording copied to:", dest);
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
            // force
            // console.error("Failed to start recording:", error);
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
            // force
            // console.error("Failed to stop recording:", error);
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