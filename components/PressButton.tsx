import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef } from "react";
import {
    Animated,
    GestureResponderEvent,
    PanResponder,
    PanResponderGestureState,
    StyleSheet,
    Text,
    View,
} from "react-native";

type Props = {
    onPressIn: () => void;
    onPressOut: () => void;
    onSwipeCancel: () => Promise<void> | void;
    disabled?: boolean;
    label?: string;
    swipeCancelThreshold?: number;
    panX?: Animated.Value;
};

const DEFAULT_THRESHOLD = 120;

export default function PTTButton({
    onPressIn,
    onPressOut,
    onSwipeCancel,
    disabled = false,
    label = "Press to talk",
    swipeCancelThreshold = DEFAULT_THRESHOLD,
    panX: externalPanX,
}: Props) {
    // use external panX if provided, otherwise create internal
    const internalPanX = useRef(new Animated.Value(0)).current;
    const panX = externalPanX ?? internalPanX;

    const hasCancelled = useRef(false);

    useEffect(() => {
        if (disabled) {
            panX.setValue(0);
            hasCancelled.current = false;
        }
        return () => {
            panX.setValue(0);
            hasCancelled.current = false;
        };
    }, [disabled, panX]);

    const threshold = Math.max(48, swipeCancelThreshold);

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => !disabled,
            onMoveShouldSetPanResponder: (_evt, gestureState) => {
                const horizontalDominant = Math.abs(gestureState.dx) > Math.abs(gestureState.dy);
                return !disabled && horizontalDominant && Math.abs(gestureState.dx) > 6;
            },
            onPanResponderGrant: (_evt: GestureResponderEvent) => {
                if (disabled) return;
                hasCancelled.current = false;
                try {
                    onPressIn();
                } catch (e) {
                    console.warn("PTTButton onPressIn error:", e);
                }
            },
            onPanResponderMove: (_evt: GestureResponderEvent, gestureState: PanResponderGestureState) => {
                if (disabled) return;
                // ignore vertical-dominant moves
                if (Math.abs(gestureState.dy) > Math.abs(gestureState.dx) && Math.abs(gestureState.dy) > 6) {
                    return;
                }

                const dx = Math.max(0, gestureState.dx);
                const max = threshold * 1.2;
                panX.setValue(Math.min(dx, max));

                if (!hasCancelled.current && dx >= threshold) {
                    hasCancelled.current = true;
                    // snap to threshold visually
                    Animated.timing(panX, {
                        toValue: threshold,
                        duration: 120,
                        useNativeDriver: true,
                    }).start();

                    // call cancel callback, don't await to avoid blocking
                    Promise.resolve()
                        .then(() => onSwipeCancel())
                        .catch((err) => console.warn("onSwipeCancel error:", err));
                }
            },
            onPanResponderRelease: () => {
                if (disabled) return;

                if (hasCancelled.current) {
                    // already cancelled via swipe: reset visual pan and skip onPressOut
                    hasCancelled.current = false;
                    Animated.timing(panX, { toValue: 0, duration: 140, useNativeDriver: true }).start();
                    return;
                }

                // normal release -> reset pan and call onPressOut
                Animated.timing(panX, { toValue: 0, duration: 140, useNativeDriver: true }).start();
                try {
                    onPressOut();
                } catch (e) {
                    console.warn("PTTButton onPressOut error:", e);
                }
            },
            onPanResponderTerminate: () => {
                // treat termination like release
                if (!hasCancelled.current) {
                    Animated.timing(panX, { toValue: 0, duration: 140, useNativeDriver: true }).start();
                    try {
                        onPressOut();
                    } catch (e) {
                        console.warn("PTTButton onPressOut (terminate) error:", e);
                    }
                } else {
                    hasCancelled.current = false;
                    Animated.timing(panX, { toValue: 0, duration: 140, useNativeDriver: true }).start();
                }
            },
        })
    ).current;

    return (
        <>
            <View style={styles.wrapper}>
                <Animated.View
                    {...panResponder.panHandlers}
                    accessibilityLabel="Press to talk"
                    accessibilityHint="Press to record. Slide right while holding to cancel."
                    accessible={true}
                    style={[styles.touchArea]}
                >
                    <>
                        <View style={styles.circleOuter}>
                            <View style={styles.circleInner}>
                                <Ionicons name="mic" size={28} color="#fff" />
                            </View>
                        </View>


                        <Text style={[styles.label, disabled && styles.labelDisabled]}>{label}</Text>
                    </>
                </Animated.View>
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        width: "100%",
        alignItems: "center",
        justifyContent: "center",
        // paddingHorizontal: 12,
    },

    // the touch container holds the circular mic and the label
    touchArea: {
        alignItems: "center",
        justifyContent: "center",
    },

    // outer circle provides depth / border so the mic "pops out"
    circleOuter: {
        width: 72,
        height: 72,
        borderRadius: 72 / 2,
        backgroundColor: "#fff",
        alignItems: "center",
        justifyContent: "center",
        // soft shadow / glow
        shadowColor: "#0b57ff",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.08,
        shadowRadius: 10,
        elevation: 4,
    },

    // inner circle actual mic color
    circleInner: {
        width: 60,
        height: 60,
        borderRadius: 60 / 2,
        backgroundColor: "#0057FF",
        alignItems: "center",
        justifyContent: "center",
    },

    label: {
        marginTop: 10,
        fontSize: 14,
        fontWeight: "600",
        color: "#0f172a",
        textAlign: "center",
        fontStyle: "italic",
    },

    labelDisabled: {
        opacity: 0.5,
    },

    hintContainer: {
        position: "absolute",
        top: -46,
        alignSelf: "center",
        width: 260,
        alignItems: "center",
    },
    hintText: {
        color: "#333",
        fontWeight: "600",
    },
    // instruction label
    labelWrap: {
        marginTop: 8,
        fontStyle: "italic",
        alignSelf: "flex-end",
    },
    labelText: {
        fontSize: 14,
        color: "#444",
        fontWeight: "500",
        fontStyle: "italic",
    },
});
