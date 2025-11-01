import { Scenario } from "@/services/VoiceApi";

export function formatScenarioLabel(scenario: Scenario): string {
    switch (scenario) {
        case "success":
            return "Success";
        case "clarify":
            return "Clarification";
        case "networkError":
            return "Network Error";
        case "serverError":
            return "Server Error";
        default:
            return "Unknown";
    }
}
