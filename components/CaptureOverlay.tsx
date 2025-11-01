import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import { AccessibilityInfo, Animated, StyleSheet, Text, View } from "react-native";
import Spacer from "./Spacer";

type Props = {
    startTs: number;
    panX?: Animated.Value; // optional, from PTTButton for synced motion
    cancelThreshold?: number; // for hint opacity interpolation
};

function formatDuration(totalSec: number) {
    const sec = Math.floor(totalSec % 60);
    const totalMin = Math.floor(totalSec / 60);
    const min = totalMin % 60;
    const hrs = Math.floor(totalMin / 60);

    const two = (n: number) => (n < 10 ? `0${n}` : `${n}`);

    if (hrs > 0) {
        return `${hrs}:${two(min)}:${two(sec)}`; // H:MM:SS
    }
    return `${min}:${two(sec)}`; // M:SS
}

export default function CaptureOverlay({
    startTs,
    panX,
    cancelThreshold = 120,
}: Props) {
    const [secs, setSecs] = useState(0);
    const mountAnim = useRef(new Animated.Value(0)).current; // for fade/slide in
    const pulseAnim = useRef(new Animated.Value(0)).current; // loop for pulse (0..1)

    useEffect(() => {
        const id = setInterval(() => {
            setSecs(Math.floor((Date.now() - startTs) / 1000));
        }, 250);
        return () => clearInterval(id);
    }, [startTs]);

    useEffect(() => {
        // entrance animation
        Animated.timing(mountAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
        }).start();

        // pulsing loop for mic + ring
        const loop = Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
                Animated.timing(pulseAnim, { toValue: 0, duration: 700, useNativeDriver: true }),
            ])
        );
        loop.start();

        // announce to screen readers that listening started
        AccessibilityInfo.announceForAccessibility(
            `Listening started. ${formatDuration(Math.floor((Date.now() - startTs) / 1000))} elapsed`
        );

        return () => {
            loop.stop();
        };
    }, [mountAnim, pulseAnim, startTs]);

    // mount transform: slide down a little and fade in
    const opacity = mountAnim;
    const translateY = mountAnim.interpolate({ inputRange: [0, 1], outputRange: [-8, 0] });

    // if panX provided, translateX follows it (clamped / scaled down for subtle motion)
    const translateX = panX
        ? (panX.interpolate({ inputRange: [0, cancelThreshold], outputRange: [0, 24], extrapolate: "clamp" }) as any)
        : 0;

    // hint opacity changes as user swipes: neutral -> less visible near cancel
    const hintOpacity = panX
        ? (panX.interpolate({
            inputRange: [0, cancelThreshold * 0.6, cancelThreshold],
            outputRange: [1, 0.7, 0.35],
            extrapolate: "clamp",
        }) as any)
        : 1;

    // pulse ring scale & opacity
    const ringScale = pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.35] });
    const ringOpacity = pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [0.2, 0.6] });

    // mic icon subtle scale for pulse
    const micScale = pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.08] });

    return (
        <Animated.View
            style={[
                styles.overlay,
                { opacity, transform: [{ translateY }, { translateX }] },
            ]}
            accessibilityLiveRegion="polite"
        //   accessibilityRole="status"
        >
            <View style={styles.rowRecord}>
                <Text style={styles.live}>Listening</Text>
                <Text style={styles.live}>{formatDuration(secs)}</Text>
            </View>
            <Spacer height={8} />

            <View style={styles.micWrapper}>
                <Animated.View style={[styles.ring, { transform: [{ scale: ringScale }], opacity: ringOpacity }]} />
                <Animated.View style={{ transform: [{ scale: micScale }] }}>
                    <Ionicons name="mic" size={20} color="#fff" />
                </Animated.View>
            </View>

            <Spacer height={24} />

            <View style={styles.textCol}>
                <Animated.Text style={[styles.sub, { opacity: hintOpacity, fontStyle: "italic" }]}>
                    Slide right while holding to cancel the recording
                </Animated.Text>
            </View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    overlay: {
        position: "absolute",
        top: 70,
        left: 20,
        right: 20,
        padding: 14,
        backgroundColor: "rgba(0,0,0,0.72)",
        borderRadius: 10,
        zIndex: 20,
        elevation: 10,
    },
    row: {
        // flexDirection: "row",
        // alignItems: "center",
    },
    rowRecord: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    micWrapper: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: "center",
        alignSelf: "center",
        justifyContent: "center",
        marginRight: 12,
        // keep a fixed background for contrast
        backgroundColor: "transparent",
    },
    ring: {
        position: "absolute",
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: "#ff6b6b",
    },
    textCol: {
        flex: 1,
    },
    live: {
        color: "#fff",
        fontWeight: "700",
        marginBottom: 4,
        fontSize: 15,
    },
    sub: {
        color: "#ffd6d6",
        fontWeight: "600",
    },
});
