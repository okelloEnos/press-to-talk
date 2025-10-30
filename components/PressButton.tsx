import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

const PressButton = () => {

    const handlePressIn = () => {
        console.log("Button pressed");
    };

    return (
        <View style={styles.container}>
            <Pressable
                onPressIn={handlePressIn}
            >
                <Ionicons name="mic" size={48} color="#FFFFFF" />
            </Pressable>
        </View>
    )
}

export default PressButton

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 20,
    },
})