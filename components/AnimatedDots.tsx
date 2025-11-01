import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";

type Props = {
    dotCount?: number;
    size?: number;
    color?: string;
    speed?: number;
};

export default function AnimatedDots({
    dotCount = 3,
    size = 5,
    color = "#33333353",
    speed = 900,
}: Props) {
    const anim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const loop = Animated.loop(
            Animated.timing(anim, {
                toValue: 1,
                duration: speed,
                useNativeDriver: true,
            })
        );
        loop.start();
        return () => loop.stop();
    }, [anim, speed]);

    // render dots with staggered scale/opacity using the same value
    const dots = new Array(dotCount).fill(0).map((_, i) => {
        const inputRange = [0, 0.25, 0.5, 0.75, 1];
        // create a phase shift for each dot
        const phase = i / dotCount;
        const shifted = anim.interpolate({
            inputRange,
            outputRange: [phase, 0.25 + phase, 0.5 + phase, 0.75 + phase, 1 + phase],
            extrapolate: "clamp",
        });

        // derive scale & opacity from shifted progress
        const scale = shifted.interpolate({
            inputRange: [0, 0.25, 0.5, 0.75, 1],
            outputRange: [0.85, 1.25, 0.85, 0.9, 0.85],
            extrapolate: "clamp",
        });

        const opacity = shifted.interpolate({
            inputRange: [0, 0.25, 0.5, 0.75, 1],
            outputRange: [0.45, 1, 0.45, 0.6, 0.45],
            extrapolate: "clamp",
        });

        return (
            <Animated.View
                key={`dot-${i}`}
                style={[
                    styles.dot,
                    {
                        width: size,
                        height: size,
                        borderRadius: size / 2,
                        backgroundColor: color,
                        transform: [{ scale }],
                        opacity,
                        marginLeft: i === 0 ? 0 : size * 0.8,
                    },
                ]}
            />
        );
    });

    return <View style={styles.row}>{dots}</View>;
}

const styles = StyleSheet.create({
    row: { flexDirection: "row", alignItems: "center", justifyContent: "center" },
    dot: {},
});
