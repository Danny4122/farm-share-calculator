import { useEffect, useState } from 'react';
import {
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';

import {
    getRetentionPeriod,
    RetentionPeriod,
    setRetentionPeriod,
} from '../../utils/storage';

export default function SettingsScreen() {
    const [retentionPeriod, setRetentionPeriodState] =
        useState<RetentionPeriod>(7);

    useEffect(() => {
        const loadSettings = async () => {
            const savedPeriod = await getRetentionPeriod();
            setRetentionPeriodState(savedPeriod);
        };

        loadSettings();
    }, []);

    const handleChange = async (
        period: RetentionPeriod
    ) => {
        try {
            await setRetentionPeriod(period);
            setRetentionPeriodState(period);
        } catch (error) {
            console.error(
                'Failed to change retention period:',
                error
            );
        }
    };

    return (
        <View style={styles.container}>
            {/* <Text style={styles.title}>
                Settings
            </Text> */}

            <Text style={styles.sectionTitle}>
                Not Saved History
            </Text>

            <Text style={styles.description}>
                Choose how long calculations marked as
                "Not Saved" should remain in History.
            </Text>

            <View style={styles.options}>

                <Pressable
                    style={styles.option}
                    onPress={() => handleChange(1)}
                >
                    <View style={styles.radio}>
                        {retentionPeriod === 1 && (
                            <View style={styles.radioSelected} />
                        )}
                    </View>

                    <Text style={styles.optionText}>
                        1 day
                    </Text>
                </Pressable>

                <Pressable
                    style={styles.option}
                    onPress={() => handleChange(7)}
                >
                    <View style={styles.radio}>
                        {retentionPeriod === 7 && (
                            <View style={styles.radioSelected} />
                        )}
                    </View>

                    <Text style={styles.optionText}>
                        7 days
                    </Text>
                </Pressable>

                <Pressable
                    style={styles.option}
                    onPress={() => handleChange(30)}
                >
                    <View style={styles.radio}>
                        {retentionPeriod === 30 && (
                            <View style={styles.radioSelected} />
                        )}
                    </View>

                    <Text style={styles.optionText}>
                        30 days
                    </Text>
                </Pressable>

                <Pressable
                    style={styles.option}
                    onPress={() => handleChange(60)}
                >
                    <View style={styles.radio}>
                        {retentionPeriod === 60 && (
                            <View style={styles.radioSelected} />
                        )}
                    </View>

                    <Text style={styles.optionText}>
                        60 days
                    </Text>
                </Pressable>

                <Pressable
                    style={styles.option}
                    onPress={() => handleChange(null)}
                >
                    <View style={styles.radio}>
                        {retentionPeriod === null && (
                            <View style={styles.radioSelected} />
                        )}
                    </View>

                    <Text style={styles.optionText}>
                        Never
                    </Text>
                </Pressable>

            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
        maxWidth: 600,
        alignSelf: 'center',
        padding: 20,
        backgroundColor: '#F8F9F7',
    },

    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#2F6B3F',
        marginBottom: 30,
    },

    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#333',
        marginBottom: 8,
    },

    description: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
        marginBottom: 20,
    },

    options: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E2E6E0',
        overflow: 'hidden',
    },

    option: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#EEEEEE',
    },

    radio: {
        width: 22,
        height: 22,
        borderRadius: 11,
        borderWidth: 2,
        borderColor: '#2F6B3F',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },

    radioSelected: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#2F6B3F',
    },

    optionText: {
        fontSize: 16,
        color: '#333',
    },
});