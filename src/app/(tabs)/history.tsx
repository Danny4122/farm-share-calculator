import { StyleSheet, Text, View } from 'react-native';

export default function HistoryScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>History</Text>

            <Text style={styles.subtitle}>
                Saved calculations will appear here.
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },

    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 8,
    },

    subtitle: {
        fontSize: 16,
        color: '#666666',
        textAlign: 'center',
    },
});