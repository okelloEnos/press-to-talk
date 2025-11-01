# Press-to-Talk
# 1) Prerequisites & run on Android emulator

**Prereqs**

* Node.js 18+
* npm
* Expo CLI
* Android Studio
* Emulator

```bash
npm install -g expo-cli
```

* Android Studio + Android SDK + AVD (Android Virtual Device)

  * Create an AVD (e.g., Pixel 4, API 33) via AVD Manager
  * Ensure `adb` is on your PATH (Android Studio normally adds it)

**Install & run**

```bash
# clone + install
git clone https://github.com/okelloEnos/press-to-talk.git
cd press-to-talk
npm install

# start Expo dev server
npx expo start
```

**Open on Android emulator**

* Start your AVD from Android Studio and wait for it to boot.
* In the terminal where Expo is running press `a` → this will open the Expo app in the emulator.
* OR (managed/bare / dev-client flows) run:

```bash
npx expo run:android
```

**Permissions**

* The app will request microphone permission on first record. If permission is denied, go to emulator → Settings → Apps → *Press-to-Talk* → Permissions and enable microphone.

---

# 2) Architecture

**Important files / folders (your repo)**

```
app/
  index.tsx
assets/
  audio/
    audiofile1.mp3
    audiofile2.mp3
components/
  ClarificationBanner.tsx
  ErrorBanner.tsx
  PressButton.tsx
  ScenarioCard.tsx
services/
  AudioService.ts
  VoiceApi.ts         
Utils/
  ErrorMessage.tsx
  ScenarioConversion.tsx
```

## `AudioService` & `VoiceApi` interaction

1. User presses record (`PressButton`) → `useAudioRecorderService().startRecording()`
2. User stops → `useAudioRecorderService().stopRecording()` → returns `{ uri, mimeType }` (the audio is saved to cache using `AudioService.saveRecordingToCache`)
3. UI sets `uiState = "processing"` and calls `voiceApi.processVoice({ audioUri: uri, ... })`
4. `StubVoiceApi.processVoice()` simulates backend and returns either:

   * `{ kind: "ok", transcript, audioFile }` → UI plays audio via `playResponseAudio` and app goes to `idle`
   * `{ kind: "clarification", prompt }` → UI shows `ClarificationBanner` and `uiState = "clarification"`
   * Throws an error object with `{ kind: "error", code: "NETWORK" | "SERVER", message }` → UI maps this with `stubErrorMessage()` and `uiState = "error"`
5. After successful processing, the app calls `AudioService.cleanupTemp()` to remove temporary recordings from cache.


# 3) App states (list + transitions)

```ts
"idle" | "listening" | "processing" | "error" | "clarification"
```

**Simple diagram state flow**

```
Idle
 └─(press)→ Listening
      └─(stop)→ Processing
           ├─(ok: returns audio)→ Playing → Idle
           ├─(ok: clarification)→ Clarification → Idle
           └─(error: network)→ ErrorNetwork → Idle
           └─(error: server)→ ErrorServer → Idle
```

---

# 4) How to toggle scenarios

Edit the voiceApi construction in `app/index.tsx`:

```ts
// src/app/index.tsx (top)
const voiceApi = new StubVoiceApi({ scenario: 'success', delayMs: 1500 });
```

Change `scenario` to one of: `"success" | "clarify" | "networkError" | "serverError"`. Restart app to apply.

---

# 5) Audio file lifecycle

## Where files are written

* The code uses Expo file-system `Paths.cache`

* Example destination the service uses when copying:

  ```
  ${Paths.cache?.uri}/rec_<timestamp>.m4a
  ```
* Bundled response audio assets live under:

  ```
  assets/audio/audiofile1.mp3
  assets/audio/audiofile2.mp3
  ```

  `playResponseAudio` uses `Asset.fromModule(require('../assets/audio/audiofile1.mp3'))` to load/play.

## Save-recording flow

1. `stopRecording()` returns a recording `uri` (sometimes `content://` on Android).
2. If `content://` (Android) → use the content URI directly.
3. For file URIs → wait `FileSystem.getInfoAsync(uri)` until the file exists (with exponential backoff).
4. Copy it to cache: `rec_<timestamp>.m4a` and return `{ uri: dest, mimeType: 'audio/m4a' }`.

## Playback flow

* Loads module using `require('../assets/audio/...')`, wraps in `Asset.fromModule(module)`
* Ensures the asset is downloaded via `asset.downloadAsync()` if needed
* Creates sound via `Audio.Sound.createAsync(source)` and `sound.playAsync()`
* Unloads the sound on finish (`sound.unloadAsync()` in `setOnPlaybackStatusUpdate`)

## Cleanup

* `AudioService.cleanupTemp()` reads cache directory (`Paths.cache.uri` or `FileSystem.cacheDirectory`) and deletes any files matching `rec_...` prefix.
* Where the app calls it:

  * After successful processing in `index.tsx` (you already call `AudioService.cleanupTemp().catch(console.warn)` after `playResponseAudio`)
