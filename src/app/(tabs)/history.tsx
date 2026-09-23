import { router, useFocusEffect } from "expo-router";
import { useCallback, useRef, useState } from "react";
import {
  Alert,
  Animated,
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import {
  cleanupOldHistory,
  deleteCalculation,
  getHistory,
  SavedCalculation,
  updateCalculation,
} from "../../utils/storage";

export default function HistoryScreen() {
  //Animated values for each item in the history list
  const animatedValues = useRef<Record<string, Animated.Value>>({});
  const deletingValues = useRef<Record<string, Animated.Value>>({});

  const getAnimatedValue = (id: string) => {
    if (!animatedValues.current[id]) {
      animatedValues.current[id] = new Animated.Value(1);
    }

    return animatedValues.current[id];
  };

  const getDeletingValue = (id: string) => {
    if (!deletingValues.current[id]) {
      deletingValues.current[id] = new Animated.Value(1);
    }

    return deletingValues.current[id];
  };

  const [history, setHistory] = useState<SavedCalculation[]>([]);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [editingNameId, setEditingNameId] = useState<string | null>(null);
  const [nameDraft, setNameDraft] = useState("");

  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const loadHistory = async () => {
    await cleanupOldHistory();

    const savedHistory = await getHistory();
    const reversedHistory = savedHistory.reverse();

    setHistory(reversedHistory);

    reversedHistory.forEach((item, index) => {
      const animatedValue = getAnimatedValue(item.id);

      animatedValue.setValue(0);

      setTimeout(() => {
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 350,
          useNativeDriver: true,
        }).start();
      }, index * 70);
    });
  };

  const enterSelectionMode = (id?: string) => {
    setIsSelectionMode(true);

    if (id) {
      setSelectedIds([id]);
    } else {
      setSelectedIds([]);
    }
  };

  const toggleSelection = (id: string) => {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((selectedId) => selectedId !== id)
        : [...current, id],
    );
  };

  const selectAll = () => {
    const allIds = history.map((item) => item.id);

    if (selectedIds.length === history.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(allIds);
    }
  };

  const cancelSelection = () => {
    setIsSelectionMode(false);
    setSelectedIds([]);
  };

  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, []),
  );

  const animateAndDelete = (id: string) => {
    return new Promise<void>((resolve, reject) => {
      try {
        const deletingValue = getDeletingValue(id);

        Animated.timing(deletingValue, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(async ({ finished }) => {
          if (!finished) {
            resolve();
            return;
          }

          try {
            await deleteCalculation(id);

            setHistory((currentHistory) =>
              currentHistory.filter((item) => item.id !== id),
            );

            resolve();
          } catch (error) {
            reject(error);
          }
        });
      } catch (error) {
        reject(error);
      }
    });
  };

  const handleDelete = (id: string) => {
    if (Platform.OS === "web") {
      const confirmed = window.confirm(
        "Are you sure you want to permanently delete this calculation?",
      );

      if (!confirmed) {
        return;
      }

      animateAndDelete(id).catch((error) => {
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
              await animateAndDelete(id);
            } catch (error) {
              console.error("Failed to delete calculation:", error);
            }
          },
        },
      ],
    );
  };

  const handleDeleteSelected = () => {
    if (selectedIds.length === 0) {
      return;
    }

    const idsToDelete = [...selectedIds];
    const deleteCount = idsToDelete.length;

    const confirmDelete = async () => {
      try {
        for (const id of idsToDelete) {
          await animateAndDelete(id);
        }

        setSelectedIds([]);
        setIsSelectionMode(false);
      } catch (error) {
        console.error("Failed to delete selected calculations:", error);
      }
    };

    if (Platform.OS === "web") {
      const confirmed = window.confirm(
        `Are you sure you want to permanently delete ${deleteCount} selected calculation${
          deleteCount !== 1 ? "s" : ""
        }?`,
      );

      if (confirmed) {
        confirmDelete();
      }

      return;
    }

    Alert.alert(
      `Delete ${deleteCount} Calculation${deleteCount !== 1 ? "s" : ""}?`,
      "Are you sure you want to permanently delete the selected calculations?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: confirmDelete,
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
      {history.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>No saved calculations</Text>

          <Text style={styles.emptyText}>
            Calculations you save will appear here.
          </Text>
        </View>
      ) : (
        <>
          <View style={styles.selectionHeader}>
            {!isSelectionMode ? (
              <Pressable
                style={styles.selectButton}
                onPress={() => enterSelectionMode()}
              >
                <Text style={styles.selectButtonText}>Select</Text>
              </Pressable>
            ) : (
              <View style={styles.selectionActions}>
                <Text style={styles.selectedCountText}>
                  {selectedIds.length} Selected
                </Text>

                <Pressable style={styles.selectAllButton} onPress={selectAll}>
                  <Text style={styles.selectAllButtonText}>
                    {selectedIds.length === history.length
                      ? "Deselect All"
                      : "Select All"}
                  </Text>
                </Pressable>

                <Pressable
                  style={styles.cancelSelectionButton}
                  onPress={cancelSelection}
                >
                  <Text style={styles.cancelSelectionButtonText}>Cancel</Text>
                </Pressable>
              </View>
            )}
          </View>

          {/* {openMenuId !== null && (
            <Pressable
              style={styles.menuOverlay}
              onPress={() => setOpenMenuId(null)}
            />
          )} */}

          <FlatList
            data={history}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => (
              <View style={styles.cardRow}>
                {/* Checkbox outside the card */}
                {isSelectionMode && (
                  <Pressable
                    style={styles.outsideCheckbox}
                    onPress={() => toggleSelection(item.id)}
                  >
                    <View
                      style={[
                        styles.selectionIndicator,
                        selectedIds.includes(item.id) &&
                          styles.selectionIndicatorSelected,
                      ]}
                    >
                      {selectedIds.includes(item.id) && (
                        <Ionicons name="checkmark" size={18} color="#FFFFFF" />
                      )}
                    </View>
                  </Pressable>
                )}

                {/* Actual calculation card */}
                <Animated.View
                  style={[
                    styles.card,
                    selectedIds.includes(item.id) && styles.selectedCard,
                    {
                      opacity: Animated.multiply(
                        getAnimatedValue(item.id),
                        getDeletingValue(item.id),
                      ),
                      transform: [
                        {
                          translateY: getAnimatedValue(item.id).interpolate({
                            inputRange: [0, 1],
                            outputRange: [20, 0],
                          }),
                        },
                        {
                          scale: getDeletingValue(item.id).interpolate({
                            inputRange: [0, 1],
                            outputRange: [1, 0.95],
                          }),
                        },
                      ],
                    },
                  ]}
                >
                  <Pressable
                    onLongPress={() => {
                      setOpenMenuId(null);
                      enterSelectionMode(item.id);
                    }}
                    delayLongPress={500}
                    onPress={() => {
                      setOpenMenuId(null);

                      if (isSelectionMode) {
                        toggleSelection(item.id);
                      }
                    }}
                    style={styles.cardPressable}
                  >
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

                            <Pressable
                              style={styles.confirmNameButton}
                              onPress={() => handleSaveName(item)}
                            >
                              <Ionicons
                                name="checkmark"
                                size={23}
                                color="#2F6B3F"
                              />
                            </Pressable>

                            <Pressable
                              style={styles.cancelNameButton}
                              onPress={() => {
                                setEditingNameId(null);
                                setNameDraft("");
                              }}
                            >
                              <Ionicons
                                name="close"
                                size={23}
                                color="#777777"
                              />
                            </Pressable>
                          </View>
                        ) : (
                          <Text style={styles.calculationName}>
                            {item.name || "Unnamed Calculation"}
                          </Text>
                        )}

                        <Text style={styles.date}>
                          {new Date(item.createdAt).toLocaleString()}
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

                        <Pressable
                          style={styles.menuButton}
                          onPress={() =>
                            setOpenMenuId(
                              openMenuId === item.id ? null : item.id,
                            )
                          }
                        >
                          <Ionicons
                            name="ellipsis-vertical"
                            size={24}
                            color="#555555"
                          />
                        </Pressable>
                      </View>
                    </View>

                    {/* Worker Summary */}
                    <Text style={styles.workerCount}>
                      {item.workers.length} Mananomay
                    </Text>

                    <Text style={styles.workerNames}>
                      {item.workers.map((worker) => worker.name).join(", ")}
                    </Text>

                    {/* View Button */}
                    <View style={styles.viewContainer}>
                      <Pressable
                        style={styles.viewButton}
                        onPress={() =>
                          router.push({
                            pathname: "/results",
                            params: {
                              results: JSON.stringify(item.workers),
                              historyId: item.id,
                              saved: item.saved ? "true" : "false",
                              calculationName: item.name || "",
                              createdAt: item.createdAt,
                            },
                          })
                        }
                      >
                        <Text style={styles.viewButtonText}>View Results</Text>
                      </Pressable>
                    </View>

                    {/* Three-dot Menu */}
                    {openMenuId === item.id && (
                      <View style={styles.menu}>
                        <Pressable
                          style={styles.menuItem}
                          onPress={() => {
                            setEditingNameId(item.id);
                            setNameDraft(item.name || "");
                            setOpenMenuId(null);
                          }}
                        >
                          <Ionicons
                            name="pencil-outline"
                            size={19}
                            color="#333333"
                          />
                          <Text style={styles.menuItemText}>Rename</Text>
                        </Pressable>

                        {!item.saved && (
                          <Pressable
                            style={styles.menuItem}
                            onPress={() => {
                              setEditingNameId(item.id);
                              setNameDraft(item.name || "");
                              setOpenMenuId(null);
                            }}
                          >
                            <Ionicons
                              name="save-outline"
                              size={19}
                              color="#333333"
                            />
                            <Text style={styles.menuItemText}>Save</Text>
                          </Pressable>
                        )}

                        <Pressable
                          style={styles.deleteMenuItem}
                          onPress={() => {
                            setOpenMenuId(null);
                            handleDelete(item.id);
                          }}
                        >
                          <Ionicons
                            name="trash-outline"
                            size={19}
                            color="#B42318"
                          />
                          <Text style={styles.deleteMenuText}>Delete</Text>
                        </Pressable>
                      </View>
                    )}
                  </Pressable>
                </Animated.View>
              </View>
            )}
          />
          {isSelectionMode && selectedIds.length > 0 && (
            <Pressable
              style={styles.deleteSelectedButton}
              onPress={handleDeleteSelected}
            >
              <View style={styles.deleteSelectedContent}>
                <Ionicons name="trash-outline" size={20} color="#FFFFFF" />

                <Text style={styles.deleteSelectedText}>
                  Delete Selected ({selectedIds.length})
                </Text>
              </View>
            </Pressable>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    marginTop: 30,
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

  cardRow: {
    width: "100%",
    maxWidth: 600,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },

  outsideCheckbox: {
    width: 32,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },

  card: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 0,
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
    zIndex: 1100,
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
    paddingVertical: 8,
  },

  viewButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#2F6B3F",
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
    paddingHorizontal: 6,
    paddingVertical: 4,
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
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 10,
  },

  menuItemText: {
    fontSize: 15,
    color: "#333333",
  },

  deleteMenuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 10,
  },

  deleteMenuText: {
    fontSize: 15,
    color: "#B42318",
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
    paddingHorizontal: 8,
    paddingVertical: 4,
  },

  cancelNameButton: {
    paddingHorizontal: 6,
    paddingVertical: 4,
  },

  selectionHeader: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginBottom: 12,
  },

  selectionActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  selectButton: {
    backgroundColor: "#2F6B3F",
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 8,
  },

  selectButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },

  cancelSelectionButton: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 8,
    backgroundColor: "#FDECEC",
  },

  cancelSelectionButtonText: {
    color: "#B42318",
    fontSize: 14,
    fontWeight: "700",
  },

  selectAllButton: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 8,
    backgroundColor: "#E8F0E5",
  },

  selectAllButtonText: {
    color: "#2F6B3F",
    fontSize: 14,
    fontWeight: "700",
  },

  selectedCountText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#555555",
  },

  cardPressable: {
    width: "100%",
  },

  selectedCard: {
    borderWidth: 2,
    borderColor: "#2F6B3F",
    backgroundColor: "#F3F8F1",
  },

  selectionIndicator: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#AAB2A7",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },

  selectionIndicatorSelected: {
    backgroundColor: "#2F6B3F",
    borderColor: "#2F6B3F",
  },

  deleteSelectedButton: {
    backgroundColor: "#B42318",
    paddingVertical: 13,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 8,
    marginBottom: 8,
  },

  deleteSelectedText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },

  deleteSelectedContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  // menuOverlay: {
  //   position: "absolute",
  //   top: 0,
  //   left: 0,
  //   right: 0,
  //   bottom: 0,
  //   zIndex: 50,
  // },
});
