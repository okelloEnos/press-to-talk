export type ProcessVoiceInput = {
    audioUri: string;
    mimeType: string;
    clientTs: string;
    context?: Record<string, unknown>;
};

export type ProcessVoiceResult =
    | { kind: "ok"; transcript: string; audioFile: number }
    | { kind: "clarification"; prompt: string };

export type ProcessVoiceError = {
    kind: "error";
    code: "NETWORK" | "SERVER";
    message: string;
};