import { ProcessVoiceInput, ProcessVoiceResult } from '../types';

export interface VoiceApi {
    processVoice(input: ProcessVoiceInput): Promise<ProcessVoiceResult>;
}


export type Scenario = "success" | "clarify" | "networkError" | "serverError";

export class StubVoiceApi implements VoiceApi {
    private opts?: { delayMs?: number; scenario?: Scenario };
    private clarified = false;

    constructor(opts?: { delayMs?: number; scenario?: Scenario }) {
        this.opts = opts;
    }

    setScenario(s: Scenario) {
        this.opts = { ...(this.opts ?? {}), scenario: s };
        if (s !== "clarify") this.clarified = false;
    }

    async processVoice(_: ProcessVoiceInput): Promise<ProcessVoiceResult> {
        const delay = this.opts?.delayMs ?? 1000;
        await new Promise((r) => setTimeout(r, delay));
        const scenario = this.opts?.scenario ?? "success";

        switch (scenario) {
            case "clarify":
                if (!this.clarified) {
                    this.clarified = true;
                    return { kind: "clarification", prompt: "What time should I set it for?" };
                }
                return { kind: "ok", transcript: "Reminder set for 6:00 PM", audioFile: 2 };

            case "networkError":
                throw { kind: "error", code: "NETWORK", message: "Network error. Please try again." };
            case "serverError":
                throw { kind: "error", code: "SERVER", message: "Server error. Please try again." };
            default:
                return { kind: "ok", transcript: "Added 'milk' to your shopping list.", audioFile: 1 };
        }
    }
}
