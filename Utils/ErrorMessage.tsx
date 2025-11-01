
export type ErrorCode = "NETWORK" | "SERVER" | string;

export function stubErrorMessage(errorCode?: ErrorCode): string {
    switch (errorCode) {
        case "NETWORK":
            return "We’re having trouble connecting right now. Please check your internet connection and try again.";

        case "SERVER":
            return "Something went wrong on our end. Please try again shortly.";

        case "ERR_AUDIO_PERMISSIONS":
            return "Microphone permissions are required to use this feature. Please enable them in your device settings.";

        default:
            return "Oops! Something unexpected happened. Please try again.";
    }
}

