import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

type Props = {
    text: string;
};

export default function TranscriptCard({ text }: Props) {
    return (
        <View style={styles.card}>
            <Ionicons name="chatbubble-ellipses-outline" size={18} color="#4a90e2"
                style={{ alignSelf: "flex-end" }} />

            <Text style={styles.bodyText}>{text}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: "#f9fafb",
        borderRadius: 10,
        paddingVertical: 10,
        paddingHorizontal: 14,
        marginVertical: 6,
        borderWidth: 1,
        borderColor: "#e2e8f0",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    // header: {
    //     // flexDirection: "row",
    //     alignItems: "flex-end",
    //     marginBottom: 6,
    // },
    // headerText: {
    //     fontSize: 13,
    //     fontWeight: "600",
    //     color: "#4a90e2",
    //     marginLeft: 6,
    // },
    bodyText: {
        fontSize: 15,
        color: "#222",
        lineHeight: 21,
    },
    timestamp: {
        fontSize: 11,
        color: "#999",
        marginTop: 6,
        alignSelf: "flex-end",
    },
});
