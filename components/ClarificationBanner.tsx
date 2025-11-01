import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import Spacer from "./Spacer";

type Props = {
    prompt: string;
};

export default function ClarificationBanner({ prompt }: Props) {
    const anim = useRef(new Animated.Value(0)).current; // 0 = hidden, 1 = visible

    useEffect(() => {
        // fade + slight slide up
        Animated.timing(anim, {
            toValue: 1,
            duration: 320,
            useNativeDriver: true,
        }).start();
    }, [anim]);

    const opacity = anim;
    const translateY = anim.interpolate({
        inputRange: [0, 1],
        outputRange: [8, 0],
    });

    return (
        <>
            <Animated.View
                style={[
                    styles.container,
                    { opacity, transform: [{ translateY }] },
                ]}
                accessibilityRole="alert"
                accessibilityLiveRegion="polite"
            >
                <Ionicons
                    name="help-circle-outline"
                    size={20}
                    color="#b45309"
                    style={styles.icon}
                />
                <View style={{ flex: 1 }}>
                    <>
                        <Text style={styles.title}>Clarification needed</Text>
                        <Spacer height={4} />
                        <Text style={styles.message}>{prompt}</Text>
                        <Spacer height={8} />
                        <Text style={styles.hint}>Press and hold the button to respond</Text>
                    </>
                </View>
            </Animated.View>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "flex-start",
        backgroundColor: "#fef3c7", // soft amber
        borderLeftWidth: 2.5,
        borderLeftColor: "#b45309",
        borderRadius: 6,
        paddingVertical: 10,
        paddingHorizontal: 10,
        marginVertical: 10,
    },
    icon: {
        marginRight: 8,
        // marginTop: 2,
    },
    title: {
        fontSize: 13,
        fontWeight: "700",
        color: "#92400e",
        marginBottom: 2,
    },
    message: {
        fontSize: 14,
        color: "#1f2937",
        lineHeight: 20,
        marginBottom: 4,
    },
    hint: {
        fontSize: 12,
        color: "#6b7280",
        textAlign: "right",
        fontStyle: "italic",
    },
});
