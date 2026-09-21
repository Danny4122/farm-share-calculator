import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { formatTaro } from '../utils/farmCalculator';
import {
    getHistory,
    saveCalculation, updateCalculation,
} from '../utils/storage';

type MananomayResult = {
    name: string;
    kahon: number;
    harvestTaro: number;
    harvesterShare: number;
    fixedKahonShare: number;
    harvestShare: number;
    ownerShare: number;
    tenantShare: number;
};

export default function ResultsScreen() {
    const params = useLocalSearchParams();

    const isHistoryView = typeof params.historyId === 'string';

    const isAlreadySaved = params.saved === 'true';

    const [hasBeenSaved, setHasBeenSaved] = useState(
        isAlreadySaved
    );

    const calculationId = useRef(Date.now().toString()).current;

    const [expandedPerson, setExpandedPerson] = useState<string | null>(null);

    const [isTotalMananomayExpanded, setIsTotalMananomayExpanded] =
        useState(false);

    const [calculationName, setCalculationName] = useState('');
    const [showNameInput, setShowNameInput] = useState(false);

    let results: MananomayResult[] = [];

    try {
        if (typeof params.results === 'string') {
            results = JSON.parse(params.results);
        }
    } catch (error) {
        console.log('Error reading results:', error);
    }

    const totalGross = results.reduce(
        (total, person) => total + person.harvestTaro,
        0
    );

    const totalHarvester = results.reduce(
        (total, person) => total + person.harvesterShare,
        0
    );

    const totalKahon = results.reduce(
        (total, person) => total + person.fixedKahonShare,
        0
    );

    const totalHarvestShare = results.reduce(
        (total, person) => total + person.harvestShare,
        0
    );

    const totalOwner = results.reduce(
        (total, person) => total + person.ownerShare,
        0
    );

    const totalTenant = results.reduce(
        (total, person) => total + person.tenantShare,
        0
    );

    const totalMananomayShare =
        totalKahon + totalHarvestShare;

    useEffect(() => {
        if (isHistoryView) {
            return;
        }

        const saveTemporaryCalculation = async () => {
            try {
                await saveCalculation({
                    id: calculationId,
                    name: '',
                    createdAt: new Date().toISOString(),
                    saved: false,
                    workers: results,
                });
                console.log('Temporary calculation saved.');
            } catch (error) {
                console.error(
                    'Failed to save temporary calculation:',
                    error
                );
            }
        };

        saveTemporaryCalculation();
    }, [isHistoryView]);

    const handleSave = async () => {
        const trimmedName = calculationName.trim();

        if (!trimmedName) {
            alert('Please enter a name for this calculation.');
            return;
        }

        try {
            const idToUpdate =
                typeof params.historyId === 'string'
                    ? params.historyId
                    : calculationId;

            const existingHistory = await getHistory();

            const existingCalculation = existingHistory.find(
                (calculation) => calculation.id === idToUpdate
            );

            await updateCalculation({
                id: idToUpdate,
                name: trimmedName,
                createdAt:
                    existingCalculation?.createdAt ??
                    new Date().toISOString(),
                saved: true,
                workers: results,
            });

            setShowNameInput(false);
            setHasBeenSaved(true);

            alert('Calculation saved to History!');
        } catch (error) {
            console.error('Failed to save calculation:', error);
            alert('Failed to save calculation.');
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
            >
                <View style={styles.content}>

                    {/* Back button */}
                    <Pressable onPress={() => router.back()}>
                        {/* <Text style={styles.backButton}>
                            ← Back
                        </Text> */}
                    </Pressable>

                    {/* Header */}
                    <Text style={styles.icon}>🌾</Text>

                    <Text style={styles.title}>
                        Farm Share Results
                    </Text>

                    <Text style={styles.subtitle}>
                        Individual calculation for each mananomay
                    </Text>

                    {/* Individual Results */}
                    {results.map((person, index) => {
                        const mananomayShare =
                            person.fixedKahonShare +
                            person.harvestShare;

                        const personKey = `${person.name}-${index}`;

                        const isExpanded =
                            expandedPerson === personKey;

                        return (
                            <View
                                key={personKey}
                                style={styles.personCard}
                            >
                                {/* Person name */}
                                <Text style={styles.personTitle}>
                                    {person.name}
                                </Text>

                                <Text style={styles.kahonText}>
                                    {person.kahon} kahon
                                </Text>

                                {/* Gross Harvest */}
                                <View style={styles.resultRow}>
                                    <Text style={styles.resultLabel}>
                                        Gross Harvest
                                    </Text>

                                    <Text style={styles.resultValue}>
                                        {formatTaro(person.harvestTaro)}
                                    </Text>
                                </View>

                                {/* Harvester */}
                                <View style={styles.resultRow}>
                                    <Text style={styles.resultLabel}>
                                        Harvester
                                    </Text>

                                    <Text style={styles.resultValue}>
                                        {formatTaro(person.harvesterShare)}
                                    </Text>
                                </View>

                                {/* Expandable Mananomay Share */}
                                <Pressable
                                    style={styles.shareButton}
                                    onPress={() =>
                                        setExpandedPerson(
                                            isExpanded
                                                ? null
                                                : personKey
                                        )
                                    }
                                >
                                    <View style={styles.shareTextContainer}>
                                        <Text style={styles.shareLabel}>
                                            {person.name}'s Share
                                        </Text>

                                        <Text style={styles.shareValue}>
                                            {formatTaro(mananomayShare)}
                                        </Text>
                                    </View>

                                    <Text style={styles.arrow}>
                                        {isExpanded ? '▲' : '▼'}
                                    </Text>
                                </Pressable>

                                {/* Expanded Breakdown */}
                                {isExpanded && (
                                    <View style={styles.breakdown}>
                                        <View style={styles.breakdownRow}>
                                            <Text style={styles.breakdownLabel}>
                                                Kahon Share
                                            </Text>

                                            <Text style={styles.breakdownValue}>
                                                {formatTaro(
                                                    person.fixedKahonShare
                                                )}
                                            </Text>
                                        </View>

                                        <View style={styles.breakdownRow}>
                                            <Text style={styles.breakdownLabel}>
                                                Harvest Share
                                            </Text>

                                            <Text style={styles.breakdownValue}>
                                                {formatTaro(
                                                    person.harvestShare
                                                )}
                                            </Text>
                                        </View>

                                        <View style={styles.breakdownTotal}>
                                            <Text style={styles.breakdownTotalLabel}>
                                                Total
                                            </Text>

                                            <Text style={styles.breakdownTotalValue}>
                                                {formatTaro(
                                                    mananomayShare
                                                )}
                                            </Text>
                                        </View>
                                    </View>
                                )}

                                {/* Owner */}
                                <View style={styles.resultRow}>
                                    <Text style={styles.resultLabel}>
                                        Owner Share
                                    </Text>

                                    <Text style={styles.resultValue}>
                                        {formatTaro(person.ownerShare)}
                                    </Text>
                                </View>

                                {/* Tenant */}
                                <View style={styles.tenantRow}>
                                    <Text style={styles.tenantLabel}>
                                        Tenant Share
                                    </Text>

                                    <Text style={styles.tenantValue}>
                                        {formatTaro(person.tenantShare)}
                                    </Text>
                                </View>
                            </View>
                        );
                    })}
                    {/* Complete Total */}
                    <View style={styles.totalCard}>
                        <Text style={styles.totalTitle}>
                            Complete Total
                        </Text>

                        {/* Total Gross Harvest */}
                        <View style={styles.resultRow}>
                            <Text style={styles.resultLabel}>
                                Total Gross Harvest
                            </Text>

                            <Text style={styles.resultValue}>
                                {formatTaro(totalGross)}
                            </Text>
                        </View>

                        {/* Total Harvester */}
                        <View style={styles.resultRow}>
                            <Text style={styles.resultLabel}>
                                Total Harvester
                            </Text>

                            <Text style={styles.resultValue}>
                                {formatTaro(totalHarvester)}
                            </Text>
                        </View>

                        {/* Total Mananomay Share */}
                        <Pressable
                            style={styles.shareButton}
                            onPress={() =>
                                setIsTotalMananomayExpanded(
                                    !isTotalMananomayExpanded
                                )
                            }
                        >
                            <View style={styles.shareTextContainer}>
                                <Text style={styles.shareLabel}>
                                    Total Mananomay Share
                                </Text>

                                <Text style={styles.shareValue}>
                                    {formatTaro(totalMananomayShare)}
                                </Text>
                            </View>

                            <Text style={styles.arrow}>
                                {isTotalMananomayExpanded ? '▲' : '▼'}
                            </Text>
                        </Pressable>

                        {/* Individual Mananomay Shares */}
                        {isTotalMananomayExpanded && (
                            <View style={styles.breakdown}>
                                {results.map((person, index) => {
                                    const mananomayShare =
                                        person.fixedKahonShare +
                                        person.harvestShare;

                                    return (
                                        <View
                                            key={`total-${person.name}-${index}`}
                                            style={styles.breakdownRow}
                                        >
                                            <Text style={styles.breakdownLabel}>
                                                {person.name}'s Share
                                            </Text>

                                            <Text style={styles.breakdownValue}>
                                                {formatTaro(mananomayShare)}
                                            </Text>
                                        </View>
                                    );
                                })}
                            </View>
                        )}

                        {/* Total Owner */}
                        <View style={styles.resultRow}>
                            <Text style={styles.resultLabel}>
                                Total Owner
                            </Text>

                            <Text style={styles.resultValue}>
                                {formatTaro(totalOwner)}
                            </Text>
                        </View>

                        {/* Total Tenant */}
                        <View style={styles.tenantTotalRow}>
                            <Text style={styles.tenantLabel}>
                                Total Tenant
                            </Text>

                            <Text style={styles.tenantValue}>
                                {formatTaro(totalTenant)}
                            </Text>
                        </View>
                    </View>

                    {/* Save to History */}
                    {!hasBeenSaved && !showNameInput && (
                        <Pressable
                            style={styles.saveButton}
                            onPress={() => setShowNameInput(true)}
                        >
                            <Text style={styles.saveButtonText}>
                                💾 Save to History
                            </Text>
                        </Pressable>
                    )}

                    {!hasBeenSaved && showNameInput && (
                        <View style={styles.nameInputContainer}>
                            <Text style={styles.nameInputLabel}>
                                Calculation Name
                            </Text>

                            <Text style={styles.nameInputDescription}>
                                Give this calculation a name so you can easily find it later.
                            </Text>

                            <TextInput
                                style={styles.nameInput}
                                placeholder="e.g. September Harvest"
                                value={calculationName}
                                onChangeText={setCalculationName}
                                autoFocus
                            />

                            <View style={styles.nameInputButtons}>
                                <Pressable
                                    style={styles.cancelNameButton}
                                    onPress={() => {
                                        setCalculationName('');
                                        setShowNameInput(false);
                                    }}
                                >
                                    <Text style={styles.cancelNameButtonText}>
                                        Cancel
                                    </Text>
                                </Pressable>

                                <Pressable
                                    style={styles.confirmSaveButton}
                                    onPress={handleSave}
                                >
                                    <Text style={styles.confirmSaveButtonText}>
                                        💾 Save
                                    </Text>
                                </Pressable>
                            </View>
                        </View>
                    )}

                    {/* New Calculation */}
                    {!isHistoryView && (
                        <Pressable
                            style={styles.newButton}
                            onPress={() => router.replace('/')}
                        >
                            <Text style={styles.newButtonText}>
                                New Calculation
                            </Text>
                        </Pressable>
                    )}

                </View>
            </ScrollView>
        </SafeAreaView>
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
        marginBottom: 28,
    },

    personCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 18,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#DDDDDD',
    },

    personTitle: {
        fontSize: 21,
        fontWeight: '700',
        marginBottom: 4,
    },

    kahonText: {
        fontSize: 14,
        color: '#666666',
        marginBottom: 14,
    },

    resultRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 9,
        borderBottomWidth: 1,
        borderBottomColor: '#EEEEEE',
    },

    resultLabel: {
        fontSize: 15,
        color: '#444444',
        flex: 1,
    },

    resultValue: {
        fontSize: 15,
        fontWeight: '600',
        textAlign: 'right',
    },

    shareButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#EEEEEE',
    },

    shareTextContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        flex: 1,
    },

    shareLabel: {
        fontSize: 15,
        fontWeight: '700',
    },

    shareValue: {
        fontSize: 15,
        fontWeight: '700',
        marginLeft: 10,
    },

    arrow: {
        fontSize: 12,
        marginLeft: 10,
    },

    breakdown: {
        backgroundColor: '#F5F7F2',
        borderRadius: 10,
        padding: 12,
        marginTop: 8,
        marginBottom: 4,
    },

    breakdownRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 7,
    },

    breakdownLabel: {
        fontSize: 14,
        color: '#555555',
    },

    breakdownValue: {
        fontSize: 14,
        fontWeight: '600',
    },

    breakdownTotal: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingTop: 9,
        marginTop: 5,
        borderTopWidth: 1,
        borderTopColor: '#CCCCCC',
    },

    breakdownTotalLabel: {
        fontSize: 14,
        fontWeight: '700',
    },

    breakdownTotalValue: {
        fontSize: 14,
        fontWeight: '700',
    },

    tenantRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 8,
        paddingTop: 12,
    },

    tenantLabel: {
        fontSize: 16,
        fontWeight: '700',
        color: '#008000',
    },

    tenantValue: {
        fontSize: 17,
        fontWeight: '700',
        color: '#008000',

    },

    totalCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 18,
        marginTop: 8,
        marginBottom: 16,
        borderWidth: 2,
        borderColor: '#2F6B3F',
    },

    totalTitle: {
        fontSize: 22,
        fontWeight: '700',
        marginBottom: 12,
    },

    tenantTotalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 8,
        paddingTop: 14,
    },

    saveButton: {
        backgroundColor: '#E8F0E5',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        marginBottom: 12,
    },

    saveButtonText: {
        color: '#2F6B3F',
        fontSize: 17,
        fontWeight: 'bold',
    },

    newButton: {
        backgroundColor: '#2F6B3F',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
    },

    newButtonText: {
        color: '#FFFFFF',
        fontSize: 17,
        fontWeight: 'bold',
    },
    nameInputContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 18,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#DDDDDD',
    },

    nameInputLabel: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 6,
    },

    nameInputDescription: {
        fontSize: 14,
        color: '#666666',
        marginBottom: 12,
    },

    nameInput: {
        borderWidth: 1,
        borderColor: '#CCCCCC',
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontSize: 16,
        backgroundColor: '#FAFAFA',
    },

    nameInputButtons: {
        flexDirection: 'row',
        gap: 10,
        marginTop: 14,
    },

    cancelNameButton: {
        flex: 1,
        backgroundColor: '#EEEEEE',
        borderRadius: 10,
        paddingVertical: 14,
        alignItems: 'center',
    },

    cancelNameButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#444444',
    },

    confirmSaveButton: {
        flex: 1,
        backgroundColor: '#2F6B3F',
        borderRadius: 10,
        paddingVertical: 14,
        alignItems: 'center',
    },

    confirmSaveButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFFFFF',
    },
});