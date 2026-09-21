import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
    FlatList,
    StyleSheet,
    Text,
    View
} from 'react-native';

import {
    deleteCalculation,
    getHistory,
    SavedCalculation,
    updateCalculation,
} from '../../utils/storage';

export default function HistoryScreen() {
    const [history, setHistory] = useState<SavedCalculation[]>([]);

    const loadHistory = async () => {
        const savedHistory = await getHistory();
        setHistory(savedHistory.reverse());
    };

    useFocusEffect(
        useCallback(() => {
            loadHistory();
        }, [])
    );

    const handleDelete = async (id: string) => {
        try {
            await deleteCalculation(id);
            await loadHistory();
        } catch (error) {
            console.error('Failed to delete calculation:', error);
        }
    };

    const handleSave = async (calculation: SavedCalculation) => {
        try {
            await updateCalculation({
                ...calculation,
                saved: true,
            });

            await loadHistory();
        } catch (error) {
            console.error('Failed to save calculation:', error);
        }
    };

    return (
        <View style={styles.container}>
            {/* <Text style={styles.title}>History</Text> */}

            {history.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyTitle}>
                        No saved calculations
                    </Text>

                    <Text style={styles.emptyText}>
                        Calculations you save will appear here.
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={history}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.list}
                    renderItem={({ item }) => (
                        <View style={styles.card}>
                            <View style={styles.cardHeader}>
                                <Text style={styles.date}>
                                    {new Date(item.createdAt).toLocaleString()}
                                </Text>

                                <Text
                                    style={
                                        item.saved
                                            ? styles.savedLabel
                                            : styles.temporaryLabel
                                    }
                                >
                                    {item.saved ? 'Saved' : 'Not Saved'}
                                </Text>
                            </View>

                            <Text style={styles.workerCount}>
                                {item.workers.length}{' '}
                                {item.workers.length === 1
                                    ? 'worker'
                                    : 'workers'}
                            </Text>

                            <Text style={styles.workerNames}>
                                {item.workers
                                    .map((worker) => worker.name)
                                    .join(', ')}
                            </Text>

                            <View style={styles.actions}>
                                <Text
                                    style={styles.viewButton}
                                    onPress={() =>
                                        router.push({
                                            pathname: '/results',
                                            params: {
                                                results: JSON.stringify(item.workers),
                                                historyId: item.id,
                                                saved: item.saved ? 'true' : 'false',
                                            },
                                        })
                                    }
                                >
                                    View
                                </Text>

                                {!item.saved && (
                                    <Text
                                        style={styles.saveHistoryButton}
                                        onPress={() => handleSave(item)}
                                    >
                                        Save
                                    </Text>
                                )}

                                <Text
                                    style={styles.deleteButton}
                                    onPress={() => handleDelete(item.id)}
                                >
                                    Delete
                                </Text>
                            </View>
                        </View>
                    )}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#F8F9F7',
    },

    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#2F6B3F',
        marginBottom: 20,
    },

    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },

    emptyTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },

    emptyText: {
        fontSize: 15,
        color: '#777',
        textAlign: 'center',
    },

    list: {
        paddingBottom: 20,
    },

    card: {
        width: '100%',
        maxWidth: 600,
        alignSelf: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#E2E6E0',
    },

    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },

    date: {
        fontSize: 13,
        color: '#777',
    },

    savedLabel: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#2F6B3F',
        backgroundColor: '#E8F0E5',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },

    temporaryLabel: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#8A5A00',
        backgroundColor: '#FFF3CD',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },

    workerCount: {
        fontSize: 17,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },

    workerNames: {
        fontSize: 14,
        color: '#666',
        marginBottom: 14,
    },

    actions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        gap: 20,
    },

    viewButton: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#2F6B3F',
    },

    saveHistoryButton: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#0000FF',
    },

    deleteButton: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#B42318',
    },
});