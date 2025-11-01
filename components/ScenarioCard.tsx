import { formatScenarioLabel } from '@/Utils/ScenarioConversion';
import React from 'react';
import { StyleSheet, Text, TouchableWithoutFeedback, View } from 'react-native';
import { Scenario } from '../services/VoiceApi';

type Props = {
    onPress: () => void;
    selectedScenario: Scenario;
    value: Scenario;
};

const ScenarioCard = ({ onPress, selectedScenario, value }: Props) => {
    const label = formatScenarioLabel(value);
    return (
        <>
            <TouchableWithoutFeedback onPress={onPress} >
                <View style={[
                    styles.card,
                    { backgroundColor: selectedScenario === value ? "#c8e6c9" : "#f0f0f0" }
                ]}>
                    <Text style={{
                        fontWeight: selectedScenario === value ? "bold" : "normal",
                        fontSize: 14
                    }}> {label}
                    </Text>
                </View>
            </TouchableWithoutFeedback>
        </>
    )
}

export default ScenarioCard

const styles = StyleSheet.create({
    card: {
        width: "100%",
        backgroundColor: "#f0f0f0",
        padding: 12,
        borderRadius: 4,
        alignItems: "center",
    },
})