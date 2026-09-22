import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
    Alert,
    FlatList,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

import {
    cleanupOldHistory,
    deleteCalculation,
    getHistory,
    SavedCalculation,
    updateCalculation,
} from "../../utils/storage";

export default function HistoryScreen() {
    const [history, setHistory] = useState<SavedCalculation[]>([]);
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);
    const [editingNameId, setEditingNameId] = useState<string | null>(null);
    const [nameDraft, setNameDraft] = useState("");

    const loadHistory = async () => {
        await cleanupOldHistory();

        const savedHistory = await getHistory();
        setHistory(savedHistory.reverse());
    };

    useFocusEffect(
        useCallback(() => {
            loadHistory();
        }, []),
    );

    const handleDelete = (id: string) => {
        if (Platform.OS === "web") {
            const confirmed = window.confirm(
                "Are you sure you want to permanently delete this calculation?",
            );

            if (!confirmed) {
                return;
            }

            deleteCalculation(id)
                .then(() => loadHistory())
                .catch((error) => {
                    console.error("Failed to delete calculation:", error);
                });

            return;
        }

        Alert.alert(
            "Delete Calculation?",
            "Are you sure you want to permanently delete this calculation?",
            [
                {
                    text: "Cancel",
                    style: "cancel",
                },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await deleteCalculation(id);
                            await loadHistory();
                        } catch (error) {
                            console.error(
                                "Failed to delete calculation:",
                                error,
                            );
                        }
                    },
                },
            ],
        );
    };

    const handleSaveName = async (calculation: SavedCalculation) => {
        const trimmedName = nameDraft.trim();

        if (!trimmedName) {
            if (Platform.OS === "web") {
                window.alert("Please enter a name for this calculation.");
            } else {
                Alert.alert(
                    "Name Required",
                    "Please enter a name for this calculation.",
                );
            }

            return;
        }

        try {
            await updateCalculation({
                ...calculation,
                name: trimmedName,
                saved: true,
            });

            setEditingNameId(null);
            setNameDraft("");
            setOpenMenuId(null);

            await loadHistory();
        } catch (error) {
            console.error("Failed to save calculation:", error);
        }
    };

    return (
        <View style={styles.container}>
            {/* <Text style={styles.title}>History</Text> */}

            {history.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyTitle}>No saved calculations</Text>

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
                            {/* Card Header */}
                            <View style={styles.cardHeader}>
                                <View style={styles.titleContainer}>
                                    {editingNameId === item.id ? (
                                        <View style={styles.nameEditRow}>
                                            <TextInput
                                                style={styles.nameEditInput}
                                                value={nameDraft}
                                                onChangeText={setNameDraft}
                                                placeholder="Calculation name"
                                                autoFocus
                                            />

                                            <Text
                                                style={styles.confirmNameButton}
                                                onPress={() =>
                                                    handleSaveName(item)
                                                }
                                            >
                                                ✓
                                            </Text>

                                            <Text
                                                style={styles.cancelNameButton}
                                                onPress={() => {
                                                    setEditingNameId(null);
                                                    setNameDraft("");
                                                }}
                                            >
                                                ✕
                                            </Text>
                                        </View>
                                    ) : (
                                        <Text style={styles.calculationName}>
                                            {item.name || "Unnamed Calculation"}
                                        </Text>
                                    )}

                                    <Text style={styles.date}>
                                        {new Date(
                                            item.createdAt,
                                        ).toLocaleString()}
                                    </Text>
                                </View>

                                <View style={styles.headerActions}>
                                    <Text
                                        style={
                                            item.saved
                                                ? styles.savedLabel
                                                : styles.temporaryLabel
                                        }
                                    >
                                        {item.saved ? "Saved" : "Not Saved"}
                                    </Text>

                                    <Text
                                        style={styles.menuButton}
                                        onPress={() =>
                                            setOpenMenuId(
                                                openMenuId === item.id
                                                    ? null
                                                    : item.id,
                                            )
                                        }
                                    >
                                        ⋮
                                    </Text>
                                </View>
                            </View>

                            {/* Worker Summary */}
                            <Text style={styles.workerCount}>
                                {item.workers.length} Mananomay
                            </Text>

                            <Text style={styles.workerNames}>
                                {item.workers
                                    .map((worker) => worker.name)
                                    .join(", ")}
                            </Text>

                            {/* View Button */}
                            <View style={styles.viewContainer}>
                                <Text
                                    style={styles.viewButton}
                                    onPress={() =>
                                        router.push({
                                            pathname: "/results",
                                            params: {
                                                results: JSON.stringify(
                                                    item.workers,
                                                ),
                                                historyId: item.id,
                                                saved: item.saved
                                                    ? "true"
                                                    : "false",
                                                calculationName:
                                                    item.name || "",
                                                createdAt: item.createdAt,
                                            },
                                        })
                                    }
                                >
                                    View Results
                                </Text>
                            </View>

                            {/* Three-dot Menu */}
                            {openMenuId === item.id && (
                                <View style={styles.menu}>
                                    <Text
                                        style={styles.menuItem}
                                        onPress={() => {
                                            setEditingNameId(item.id);
                                            setNameDraft(item.name || "");
                                            setOpenMenuId(null);
                                        }}
                                    >
                                        ✏️ Rename
                                    </Text>

                                    {!item.saved && (
                                        <Text
                                            style={styles.menuItem}
                                            onPress={() => {
                                                setEditingNameId(item.id);
                                                setNameDraft(item.name || "");
                                                setOpenMenuId(null);
                                            }}
                                        >
                                            💾 Save
                                        </Text>
                                    )}

                                    <Text
                                        style={styles.deleteMenuItem}
                                        onPress={() => {
                                            setOpenMenuId(null);
                                            handleDelete(item.id);
                                        }}
                                    >
                                        🗑️ Delete
                                    </Text>
                                </View>
                            )}

                            {/* {editingNameId === item.id && (
                                <View style={styles.nameEditor}>
                                    <Text style={styles.nameEditorLabel}>
                                        Calculation Name
                                    </Text>

                                    <TextInput
                                        style={styles.nameInput}
                                        placeholder="e.g. September Harvest"
                                        value={nameDraft}
                                        onChangeText={setNameDraft}
                                        autoFocus
                                    />

                                    <View style={styles.nameEditorButtons}>
                                        <Text
                                            style={styles.cancelNameButton}
                                            onPress={() => {
                                                setEditingNameId(null);
                                                setNameDraft('');
                                            }}
                                        >
                                            Cancel
                                        </Text>

                                        <Text
                                            style={styles.confirmNameButton}
                                            onPress={() => handleSaveName(item)}
                                        >
                                            💾 Save
                                        </Text>
                                    </View>
                                </View>
                            )} */}
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
        backgroundColor: "#F8F9F7",
    },

    title: {
        fontSize: 28,
        fontWeight: "bold",
        color: "#2F6B3F",
        marginBottom: 20,
    },

    emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },

    emptyTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#333",
        marginBottom: 8,
    },

    emptyText: {
        fontSize: 15,
        color: "#777",
        textAlign: "center",
    },

    list: {
        paddingBottom: 20,
    },

    card: {
        width: "100%",
        maxWidth: 600,
        alignSelf: "center",
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: "#E2E6E0",
        position: "relative",
    },

    cardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 12,
    },

    headerActions: {
        alignItems: "flex-end",
        gap: 4,
    },

    date: {
        fontSize: 13,
        color: "#777",
    },

    savedLabel: {
        fontSize: 12,
        fontWeight: "bold",
        color: "#2F6B3F",
        backgroundColor: "#E8F0E5",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        alignSelf: "flex-start",
    },

    temporaryLabel: {
        fontSize: 12,
        fontWeight: "bold",
        color: "#8A5A00",
        backgroundColor: "#FFF3CD",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        alignSelf: "flex-start",
    },

    workerCount: {
        fontSize: 15,
        fontWeight: "600",
        color: "#444444",
        marginTop: 12,
        marginBottom: 4,
    },

    workerNames: {
        fontSize: 14,
        color: "#666",
        marginBottom: 14,
    },

    viewButton: {
        fontSize: 15,
        fontWeight: "700",
        color: "#2F6B3F",
        paddingVertical: 8,
    },

    titleContainer: {
        flex: 1,
        paddingRight: 10,
    },

    calculationName: {
        fontSize: 19,
        fontWeight: "700",
        color: "#333333",
        marginBottom: 4,
    },

    menuButton: {
        fontSize: 26,
        fontWeight: "700",
        color: "#555555",
        paddingHorizontal: 6,
        paddingVertical: 0,
    },

    viewContainer: {
        alignItems: "flex-end",
        marginTop: 8,
    },

    menu: {
        position: "absolute",
        top: 48,
        right: 10,
        backgroundColor: "#FFFFFF",
        borderWidth: 1,
        borderColor: "#E2E6E0",
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 6,
        minWidth: 150,
        zIndex: 1000,

        // Web
        ...(Platform.OS === "web"
            ? {
                  boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.15)",
              }
            : {
                  elevation: 6,
              }),
    },

    menuItem: {
        fontSize: 15,
        color: "#333333",
        paddingVertical: 10,
    },

    deleteMenuItem: {
        fontSize: 15,
        color: "#B42318",
        paddingVertical: 10,
    },

    nameEditRow: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
    },

    nameEditInput: {
        flex: 1,
        borderWidth: 1,
        borderColor: "#D5DAD2",
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 7,
        fontSize: 18,
        fontWeight: "700",
        color: "#333333",
        backgroundColor: "#FFFFFF",
        // opacity: 0.5,
    },

    confirmNameButton: {
        fontSize: 22,
        fontWeight: "700",
        color: "#2F6B3F",
        paddingHorizontal: 8,
        paddingVertical: 4,
    },

    cancelNameButton: {
        fontSize: 21,
        fontWeight: "700",
        color: "#777777",
        paddingHorizontal: 6,
        paddingVertical: 4,
    },
});