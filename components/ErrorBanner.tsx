import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef } from "react";
import {
    Animated,
    StyleSheet,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from "react-native";
import Spacer from "./Spacer";

type Props = {
    message?: string;
    onRetry?: () => void;
};

export default function ErrorBanner({
    message = "Oops! Something unexpected happened. Please try again.",
    onRetry,
}: Props) {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        // Fade + slide in when the banner appears
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 320,
            useNativeDriver: true,
        }).start();

        // Subtle looping pulse on the retry button
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.05,
                    duration: 700,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 700,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, [fadeAnim, pulseAnim]);

    const opacity = fadeAnim;
    const translateY = fadeAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [8, 0],
    });

    return (
        <>
            <Animated.View
                style={[styles.container, { opacity, transform: [{ translateY }] }]}
                accessibilityRole="alert"
                accessibilityLiveRegion="polite"
            >

                <TouchableWithoutFeedback
                    onPress={onRetry}
                >
                    <Ionicons name="close-outline" size={22} color="#fff" style={styles.iconCancel} />
                </TouchableWithoutFeedback>
                <View >
                    <>
                        <Text style={styles.title}>An Issue Occurred</Text>
                        <Text style={styles.message}>{message}</Text>
                        <Spacer height={16} />
                        {onRetry && (
                            <Animated.View
                                style={[
                                    styles.retryWrapper,
                                    { transform: [{ scale: pulseAnim }] },
                                ]}
                            >
                                <TouchableOpacity
                                    style={styles.retryButton}
                                    onPress={onRetry}
                                    activeOpacity={0.8}
                                >
                                    <Ionicons name="refresh" size={14} color="#fff" />
                                    <Text style={styles.retryText}>Retry</Text>
                                </TouchableOpacity>
                            </Animated.View>
                        )}
                        <Spacer height={8} />
                    </>
                </View>
            </Animated.View>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: "#ff6b6b", // red tone for error
        borderRadius: 8,
        paddingVertical: 10,
        paddingHorizontal: 10,
        marginVertical: 10,
    },
    icon: {
        position: "absolute",
        top: 10,
        left: 10,
    },
    iconCancel: {
        position: "absolute",
        top: 10,
        right: 10,
    },
    title: {
        fontSize: 14,
        fontWeight: "700",
        color: "#fff",
        marginRight: 20,
    },
    message: {
        fontSize: 14,
        color: "#fef2f2",
        lineHeight: 20,
        marginTop: 4,
        marginRight: 20,
    },
    retryWrapper: {
        // marginTop: 12,
        alignSelf: "center",
    },
    retryButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: "#fff",
        borderRadius: 4,
        paddingVertical: 6,
        paddingHorizontal: 16,
        gap: 6,
    },
    retryText: {
        fontSize: 12,
        color: "#fff",
        fontWeight: "600",
    },
});
