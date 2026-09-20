import { router } from 'expo-router';
import { useRef, useState } from 'react';
import {
    Alert,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { calculateIndividualShares } from '../utils/farmCalculator';

type Mananomay = {
    id: number;
    name: string;
    kahon: string;
    sacks: string;
    taro: string;
};

export default function IndividualScreen() {
    const scrollViewRef = useRef<ScrollView>(null);
    const inputRefs = useRef<Record<string, any>>({});

    const [mananomayList, setMananomayList] = useState<Mananomay[]>([
        {
            id: 1,
            name: '',
            kahon: '',
            sacks: '',
            taro: '',
        },
    ]);

    const focusInput = (id: number, field: string) => {
        setTimeout(() => {
            inputRefs.current[`${id}-${field}`]?.focus();
        }, 50);
    };

    const addMananomay = () => {
        const newId = Date.now();

        setMananomayList((currentList) => [
            ...currentList,
            {
                id: newId,
                name: '',
                kahon: '',
                sacks: '',
                taro: '',
            },
        ]);

        setTimeout(() => {
            inputRefs.current[`${newId}-name`]?.focus();
        }, 150);
    };

    const removeMananomay = (id: number) => {
        const person = mananomayList.find(
            (person) => person.id === id
        );

        const name = person?.name || 'this mananomay';

        // Browser confirmation
        if (Platform.OS === 'web') {
            const confirmed = window.confirm(
                `Are you sure you want to remove ${name}?`
            );

            if (confirmed) {
                setMananomayList((currentList) =>
                    currentList.filter(
                        (person) => person.id !== id
                    )
                );
            }

            return;
        }

        // Mobile confirmation
        Alert.alert(
            'Remove Mananomay?',
            `Are you sure you want to remove ${name}?`,
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Remove',
                    style: 'destructive',
                    onPress: () => {
                        setMananomayList((currentList) =>
                            currentList.filter(
                                (person) => person.id !== id
                            )
                        );
                    },
                },
            ]
        );
    };

    const updateMananomay = (
        id: number,
        field: keyof Mananomay,
        value: string
    ) => {
        setMananomayList((currentList) =>
            currentList.map((person) =>
                person.id === id
                    ? { ...person, [field]: value }
                    : person
            )
        );
    };

    const showMessage = (title: string, message: string) => {
        if (Platform.OS === 'web') {
            window.alert(`${title}\n\n${message}`);
        } else {
            Alert.alert(title, message);
        }
    };

    const validateInputs = (): boolean => {
        for (let i = 0; i < mananomayList.length; i++) {
            const person = mananomayList[i];

            if (!person.name.trim()) {
                showMessage(
                    'Missing Name',
                    `Please enter a name for Mananomay ${i + 1}.`
                );
                return false;
            }

            const kahon = Number(person.kahon);
            const sacks = Number(person.sacks || 0);
            const taro = Number(person.taro || 0);

            if (
                person.kahon.trim() === '' ||
                !Number.isInteger(kahon) ||
                kahon <= 0
            ) {
                showMessage(
                    'Invalid Kahon',
                    `${person.name || `Mananomay ${i + 1}`} must have a valid number of kahon.`
                );
                return false;
            }

            if (
                !Number.isInteger(sacks) ||
                sacks < 0
            ) {
                showMessage(
                    'Invalid Sacks',
                    `${person.name || `Mananomay ${i + 1}`} must have a valid number of sacks.`
                );
                return false;
            }

            if (
                taro < 0 ||
                taro > 3.5 ||
                !Number.isFinite(taro * 2) ||
                !Number.isInteger(taro * 2)
            ) {
                showMessage(
                    'Invalid Taro',
                    `${person.name || `Mananomay ${i + 1}`} taro must be between 0 and 3.5.`
                );
                return false;
            }

            if (sacks === 0 && taro === 0) {
                showMessage(
                    'Missing Harvest',
                    `${person.name || `Mananomay ${i + 1}`} must have a harvest greater than 0.`
                );
                return false;
            }
        }

        // showMessage(
        //     'Validation Successful',
        //     'All information looks good!'
        // );

        return true;
    };

    const handleCalculate = () => {
        const isValid = validateInputs();

        if (!isValid) {
            return;
        }

        const people = mananomayList.map((person) => ({
            name: person.name.trim(),
            kahon: Number(person.kahon),
            harvestTaro:
                Number(person.sacks) * 4 + Number(person.taro),
        }));

        const results = calculateIndividualShares(people);

        router.push({
            pathname: '/results',
            params: {
                results: JSON.stringify(results),
            },
        });
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                ref={scrollViewRef}
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
            >
                <View style={styles.content}>

                    {/* Back button
                    <Pressable onPress={() => router.replace('/')}>
                        <Text style={styles.backButton}>← Back</Text>
                    </Pressable> */}

                    {/* Header */}
                    <Text style={styles.icon}>👥</Text>

                    <Text style={styles.title}>
                        Individual Calculation
                    </Text>

                    <Text style={styles.subtitle}>
                        Calculate each mananomay separately
                    </Text>

                    {/* Mananomay list */}
                    <Text style={styles.sectionTitle}>
                        Mananomay
                    </Text>

                    {mananomayList.map((person, index) => (
                        <View key={person.id} style={styles.personCard}>

                            <View style={styles.personHeader}>
                                <Text style={styles.personTitle}>
                                    Mananomay {index + 1}
                                </Text>

                                {mananomayList.length > 1 && (
                                    <Pressable
                                        style={styles.removeButton}
                                        onPress={() => removeMananomay(person.id)}
                                        hitSlop={10}
                                    >
                                        <Text style={styles.removeButtonText}>
                                            Remove
                                        </Text>
                                    </Pressable>
                                )}
                            </View>

                            {/* Name */}
                            <Text style={styles.label}>
                                Name
                            </Text>

                            <TextInput
                                style={styles.input}
                                placeholder="e.g. Rico"
                                placeholderTextColor="#888888"
                                value={person.name}
                                onChangeText={(value) =>
                                    updateMananomay(person.id, 'name', value)
                                }
                                ref={(ref) => {
                                    inputRefs.current[`${person.id}-name`] = ref;
                                }}
                                returnKeyType="next"
                                onSubmitEditing={() => focusInput(person.id, 'kahon')}
                            />

                            {/* Kahon */}
                            <Text style={styles.label}>
                                Number of Kahon
                            </Text>

                            <TextInput
                                style={styles.input}
                                placeholder="e.g. 3"
                                placeholderTextColor="#888888"
                                keyboardType="numeric"
                                value={person.kahon}
                                onChangeText={(value) =>
                                    updateMananomay(person.id, 'kahon', value)
                                }
                                ref={(ref) => {
                                    inputRefs.current[`${person.id}-kahon`] = ref;
                                }}
                                returnKeyType="next"
                                onSubmitEditing={() => focusInput(person.id, 'sacks')}
                            />

                            {/* Harvest */}
                            <Text style={styles.label}>
                                Harvest
                            </Text>

                            <View style={styles.harvestRow}>

                                <TextInput
                                    style={styles.harvestInput}
                                    placeholder="e.g. 30"
                                    placeholderTextColor="#888888"
                                    keyboardType="numeric"
                                    value={person.sacks}
                                    onChangeText={(value) =>
                                        updateMananomay(person.id, 'sacks', value)
                                    }
                                    ref={(ref) => {
                                        inputRefs.current[`${person.id}-sacks`] = ref;
                                    }}
                                    returnKeyType="next"
                                    onSubmitEditing={() => focusInput(person.id, 'taro')}
                                />

                                <Text style={styles.unit}>
                                    sacks
                                </Text>

                                <Text style={styles.plus}>
                                    +
                                </Text>

                                <TextInput
                                    style={styles.taroInput}
                                    placeholder="e.g. 1"
                                    placeholderTextColor="#888888"
                                    keyboardType="numeric"
                                    value={person.taro}
                                    onChangeText={(value) =>
                                        updateMananomay(person.id, 'taro', value)
                                    }
                                    ref={(ref) => {
                                        inputRefs.current[`${person.id}-taro`] = ref;
                                    }}
                                    returnKeyType="done"
                                    onSubmitEditing={() => {
                                        addMananomay();
                                    }}
                                />

                                <Text style={styles.unit}>
                                    taro
                                </Text>

                            </View>

                        </View>
                    ))}

                    {/* Add person button */}
                    <Pressable
                        style={styles.addButton}
                        onPress={addMananomay}
                    >
                        <Text style={styles.addButtonText}>
                            + Add Mananomay
                        </Text>
                    </Pressable>

                    {/* Calculate */}
                    <Pressable
                        style={styles.calculateButton}
                        onPress={handleCalculate}
                    >
                        <Text style={styles.calculateText}>
                            Calculate
                        </Text>
                    </Pressable>

                </View>
            </ScrollView>
        </SafeAreaView >
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F7F2',
    },

    scrollContent: {
        flexGrow: 1,
    },

    content: {
        width: '100%',
        maxWidth: 600,
        alignSelf: 'center',
        paddingHorizontal: 24,
        paddingTop: 16,
        paddingBottom: 40,
    },

    backButton: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 24,
    },

    icon: {
        fontSize: 50,
        textAlign: 'center',
        marginBottom: 8,
    },

    title: {
        fontSize: 26,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 8,
    },

    subtitle: {
        fontSize: 15,
        textAlign: 'center',
        color: '#666666',
        marginBottom: 32,
    },

    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 16,
    },

    personCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 18,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#DDDDDD',
    },

    personHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },

    personTitle: {
        fontSize: 18,
        fontWeight: '700',
    },

    removeButton: {
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#FFFFFF',
    },

    removeButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#FF0000',
    },
    label: {
        fontSize: 15,
        fontWeight: '600',
        marginTop: 14,
        marginBottom: 8,
    },

    input: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#CCCCCC',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
    },

    harvestRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },

    harvestInput: {
        flex: 1,
        minWidth: 70,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#CCCCCC',
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 14,
        fontSize: 16,
    },

    taroInput: {
        width: 80,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#CCCCCC',
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 14,
        fontSize: 16,
    },

    unit: {
        fontSize: 15,
        fontWeight: '600',
    },

    plus: {
        fontSize: 18,
        fontWeight: '700',
    },

    addButton: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#2F6B3F',
        borderRadius: 12,
        paddingVertical: 15,
        alignItems: 'center',
        marginBottom: 16,
    },

    addButtonText: {
        color: '#2F6B3F',
        fontSize: 16,
        fontWeight: '700',
    },

    calculateButton: {
        backgroundColor: '#2F6B3F',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
    },

    calculateText: {
        color: '#FFFFFF',
        fontSize: 17,
        fontWeight: 'bold',
    },
});