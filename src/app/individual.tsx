import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
    Alert,
    Animated,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { calculateIndividualShares } from "../utils/farmCalculator";

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
  //Animation values
  const headerFade = useRef(new Animated.Value(0)).current;
  const headerSlide = useRef(new Animated.Value(-20)).current;
  const cardFade = useRef(new Animated.Value(0)).current;
  const cardSlide = useRef(new Animated.Value(20)).current;
  const buttonFade = useRef(new Animated.Value(0)).current;
  const buttonSlide = useRef(new Animated.Value(20)).current;
  const addButtonScale = useRef(new Animated.Value(1)).current;
  const calculateButtonScale = useRef(new Animated.Value(1)).current;

  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  const [mananomayList, setMananomayList] = useState<Mananomay[]>([
    {
      id: 1,
      name: "",
      kahon: "",
      sacks: "",
      taro: "",
    },
  ]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(headerFade, {
        toValue: 1,
        duration: 600,
        useNativeDriver: Platform.OS !== "web",
      }),
      Animated.spring(headerSlide, {
        toValue: 0,
        friction: 8,
        tension: 50,
        useNativeDriver: Platform.OS !== "web",
      }),
    ]).start();
  }, []);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(headerFade, {
        toValue: 1,
        duration: 600,
        useNativeDriver: Platform.OS !== "web",
      }),
      Animated.spring(headerSlide, {
        toValue: 0,
        friction: 8,
        tension: 50,
        useNativeDriver: Platform.OS !== "web",
      }),
    ]).start();
  }, []);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(cardFade, {
        toValue: 1,
        duration: 700,
        delay: 200,
        useNativeDriver: Platform.OS !== "web",
      }),
      Animated.spring(cardSlide, {
        toValue: 0,
        friction: 8,
        tension: 45,
        delay: 200,
        useNativeDriver: Platform.OS !== "web",
      }),
    ]).start();
  }, []);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(buttonFade, {
        toValue: 1,
        duration: 700,
        delay: 350,
        useNativeDriver: Platform.OS !== "web",
      }),
      Animated.spring(buttonSlide, {
        toValue: 0,
        friction: 8,
        tension: 45,
        delay: 350,
        useNativeDriver: Platform.OS !== "web",
      }),
    ]).start();
  }, []);

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
        name: "",
        kahon: "",
        sacks: "",
        taro: "",
      },
    ]);

    setTimeout(() => {
      inputRefs.current[`${newId}-name`]?.focus();
    }, 150);
  };

  const removeMananomay = (id: number) => {
    const person = mananomayList.find((person) => person.id === id);

    const name = person?.name || "this mananomay";

    // Browser confirmation
    if (Platform.OS === "web") {
      const confirmed = window.confirm(
        `Are you sure you want to remove ${name}?`,
      );

      if (confirmed) {
        setMananomayList((currentList) =>
          currentList.filter((person) => person.id !== id),
        );
      }

      return;
    }

    // Mobile confirmation
    Alert.alert(
      "Remove Mananomay?",
      `Are you sure you want to remove ${name}?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => {
            setMananomayList((currentList) =>
              currentList.filter((person) => person.id !== id),
            );
          },
        },
      ],
    );
  };

  const updateMananomay = (
    id: number,
    field: keyof Mananomay,
    value: string,
  ) => {
    setMananomayList((currentList) =>
      currentList.map((person) =>
        person.id === id ? { ...person, [field]: value } : person,
      ),
    );
  };

  const showMessage = (title: string, message: string) => {
    if (Platform.OS === "web") {
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
          "Missing Name",
          `Please enter a name for Mananomay ${i + 1}.`,
        );
        return false;
      }

      const kahon = Number(person.kahon);
      const sacks = Number(person.sacks || 0);
      const taro = Number(person.taro || 0);

      if (
        person.kahon.trim() === "" ||
        !Number.isInteger(kahon) ||
        kahon <= 0
      ) {
        showMessage(
          "Invalid Kahon",
          `${person.name || `Mananomay ${i + 1}`} must have a valid number of kahon.`,
        );
        return false;
      }

      if (!Number.isInteger(sacks) || sacks < 0) {
        showMessage(
          "Invalid Sacks",
          `${person.name || `Mananomay ${i + 1}`} must have a valid number of sacks.`,
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
          "Invalid Taro",
          `${person.name || `Mananomay ${i + 1}`} taro must be between 0 and 3.5.`,
        );
        return false;
      }

      if (sacks === 0 && taro === 0) {
        showMessage(
          "Missing Harvest",
          `${person.name || `Mananomay ${i + 1}`} must have a harvest greater than 0.`,
        );
        return false;
      }

      const harvestTaro = sacks * 4 + taro;
      const requiredKahonShare = kahon * 2;
      const requiredMinimumHarvest = requiredKahonShare + 1;

      if (harvestTaro < requiredMinimumHarvest) {
        showMessage(
          "Invalid Harvest",
          `${person.name || `Mananomay ${i + 1}`} has ${kahon} kahon, which requires at least ${requiredMinimumHarvest} taro of harvest. Please enter a larger harvest.`,
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

  const animateButtonPress = (
    scaleValue: Animated.Value,
    action: () => void,
  ) => {
    Animated.sequence([
      Animated.timing(scaleValue, {
        toValue: 0.96,
        duration: 80,
        useNativeDriver: Platform.OS !== "web",
      }),
      Animated.timing(scaleValue, {
        toValue: 1,
        duration: 100,
        useNativeDriver: Platform.OS !== "web",
      }),
    ]).start(() => {
      action();
    });
  };

  const handleCalculate = () => {
    const isValid = validateInputs();

    if (!isValid) {
      return;
    }

    const people = mananomayList.map((person) => ({
      name: person.name.trim(),
      kahon: Number(person.kahon),
      harvestTaro: Number(person.sacks) * 4 + Number(person.taro),
    }));

    const results = calculateIndividualShares(people);

    router.push({
      pathname: "/results",
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
          <Animated.View
            style={[
              styles.header,
              {
                opacity: headerFade,
                transform: [{ translateY: headerSlide }],
              },
            ]}
          >
            <View style={styles.headerIcon}>
              <MaterialCommunityIcons name="sprout" size={38} color="#2F6B3F" />
            </View>

            <Text style={styles.title}>Farm Share Calculator</Text>

            <Text style={styles.subtitle}>Calculate the farm shares</Text>

            <View style={styles.unitBadge}>
              <Text style={styles.unitBadgeText}>1 sack = 4 taro</Text>
            </View>
          </Animated.View>

          {/* Mananomay list
                    <Text style={styles.sectionTitle}>
                        Mananomay
                    </Text> */}

          {mananomayList.map((person, index) => (
            <Animated.View
              key={person.id}
              style={[
                styles.personCard,
                {
                  opacity: cardFade,
                  transform: [{ translateY: cardSlide }],
                },
              ]}
            >
              <View style={styles.personHeader}>
                <Text style={styles.personTitle}>Mananomay {index + 1}</Text>

                {mananomayList.length > 1 && (
                  <Pressable
                    style={styles.removeButton}
                    onPress={() => removeMananomay(person.id)}
                    hitSlop={10}
                  >
                    <Text style={styles.removeButtonText}>Remove</Text>
                  </Pressable>
                )}
              </View>

              {/* Name */}
              <View style={styles.labelRow}>
                <MaterialCommunityIcons
                  name="account-outline"
                  size={18}
                  color="#2F6B3F"
                />
                <Text style={styles.label}>Name</Text>
              </View>
              <TextInput
                style={[
                  styles.input,
                  focusedInput === `${person.id}-name` && styles.inputFocused,
                ]}
                placeholder="e.g. John"
                placeholderTextColor="#888888"
                value={person.name}
                onChangeText={(value) =>
                  updateMananomay(person.id, "name", value)
                }
                onFocus={() => setFocusedInput(`${person.id}-name`)}
                onBlur={() => setFocusedInput(null)}
                ref={(ref) => {
                  inputRefs.current[`${person.id}-name`] = ref;
                }}
                returnKeyType="next"
                onSubmitEditing={() => focusInput(person.id, "kahon")}
              />

              {/* Kahon */}
              <View style={styles.labelRow}>
                <MaterialCommunityIcons
                  name="view-grid-outline"
                  size={18}
                  color="#2F6B3F"
                />
                <Text style={styles.label}>Number of Kahon</Text>
              </View>
              <TextInput
                style={[
                  styles.input,
                  focusedInput === `${person.id}-kahon` && styles.inputFocused,
                ]}
                placeholder="e.g. 3"
                placeholderTextColor="#888888"
                keyboardType="numeric"
                value={person.kahon}
                onChangeText={(value) =>
                  updateMananomay(person.id, "kahon", value)
                }
                ref={(ref) => {
                  inputRefs.current[`${person.id}-kahon`] = ref;
                }}
                returnKeyType="next"
                onSubmitEditing={() => focusInput(person.id, "sacks")}
              />

              {/* Harvest */}
              <View style={styles.labelRow}>
                <MaterialCommunityIcons
                  name="sprout-outline"
                  size={18}
                  color="#2F6B3F"
                />
                <Text style={styles.label}>Harvest</Text>
              </View>
              <View style={styles.harvestRow}>
                <TextInput
                  style={[
                    styles.harvestInput,
                    focusedInput === `${person.id}-sacks` &&
                      styles.inputFocused,
                  ]}
                  placeholder="e.g. 30"
                  placeholderTextColor="#888888"
                  keyboardType="numeric"
                  value={person.sacks}
                  onChangeText={(value) =>
                    updateMananomay(person.id, "sacks", value)
                  }
                  onFocus={() => setFocusedInput(`${person.id}-sacks`)}
                  onBlur={() => setFocusedInput(null)}
                  ref={(ref) => {
                    inputRefs.current[`${person.id}-sacks`] = ref;
                  }}
                  returnKeyType="next"
                  onSubmitEditing={() => focusInput(person.id, "taro")}
                />

                <Text style={styles.unit}>sacks</Text>

                <Text style={styles.plus}>+</Text>

                <TextInput
                  style={[
                    styles.taroInput,
                    focusedInput === `${person.id}-taro` && styles.inputFocused,
                  ]}
                  placeholder="e.g. 1"
                  placeholderTextColor="#888888"
                  keyboardType="numeric"
                  value={person.taro}
                  onChangeText={(value) =>
                    updateMananomay(person.id, "taro", value)
                  }
                  onFocus={() => setFocusedInput(`${person.id}-taro`)}
                  onBlur={() => setFocusedInput(null)}
                  ref={(ref) => {
                    inputRefs.current[`${person.id}-taro`] = ref;
                  }}
                  returnKeyType="done"
                  onSubmitEditing={() => {
                    addMananomay();
                  }}
                />

                <Text style={styles.unit}>taro</Text>
              </View>
            </Animated.View>
          ))}

          {/* Add person button */}
          <Animated.View
            style={{
              opacity: buttonFade,
              transform: [{ translateY: buttonSlide }],
            }}
          >
            <Animated.View
              style={{
                transform: [{ scale: addButtonScale }],
              }}
            >
              <Pressable
                style={styles.addButton}
                onPress={() =>
                  animateButtonPress(addButtonScale, () => addMananomay())
                }
              >
                <Text style={styles.addButtonText}>+ Add Mananomay</Text>
              </Pressable>
            </Animated.View>
          </Animated.View>

          {/* Calculate */}
          <Animated.View
            style={{
              opacity: buttonFade,
              transform: [{ translateY: buttonSlide }],
            }}
          >
            <Animated.View
              style={{
                transform: [{ scale: calculateButtonScale }],
              }}
            >
              <Pressable
                style={styles.calculateButton}
                onPress={() =>
                  animateButtonPress(calculateButtonScale, () =>
                    handleCalculate(),
                  )
                }
              >
                <Text style={styles.calculateText}>Calculate</Text>
              </Pressable>
            </Animated.View>
          </Animated.View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7F2",
  },

  scrollContent: {
    flexGrow: 1,
  },

  content: {
    width: "100%",
    maxWidth: 600,
    alignSelf: "center",
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 40,
  },

  backButton: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 24,
  },

  //   icon: {
  //     fontSize: 50,
  //     textAlign: "center",
  //     marginBottom: 8,
  //   },

  //   title: {
  //     fontSize: 26,
  //     fontWeight: "bold",
  //     textAlign: "center",
  //     marginBottom: 8,
  //   },

  //   subtitle: {
  //     fontSize: 15,
  //     textAlign: "center",
  //     color: "#666666",
  //     marginBottom: 32,
  //   },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 16,
  },

  personCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 20,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#DCE4DD",

    // Subtle shadow
    shadowColor: "#1F3525",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },

  personHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },

  personTitle: {
    fontSize: 19,
    fontWeight: "800",
    color: "#1F3525",
  },

  removeButton: {
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: "#FFF5F5",
    borderWidth: 1,
    borderColor: "#F0D4D4",
  },

  removeButtonText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#B54A4A",
  },

  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    marginTop: 14,
    marginBottom: 8,
  },

  label: {
    fontSize: 15,
    fontWeight: "600",
    color: "#34463A",
  },

  input: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#CCCCCC",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
  },
  inputFocused: {
    borderColor: "#2F6B3F",
    borderWidth: 2,
  },

  harvestRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 2,
  },

  harvestInput: {
    flex: 1,
    minWidth: 70,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#CCCCCC",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 16,
    color: "#1F3525",
  },

  taroInput: {
    width: 80,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#CCCCCC",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 14,
    fontSize: 16,
    color: "#1F3525",
    textAlign: "center",
  },

  unit: {
    fontSize: 14,
    fontWeight: "700",
    color: "#66736A",
  },

  plus: {
    fontSize: 18,
    fontWeight: "800",
    color: "#2F6B3F",
    marginHorizontal: 1,
  },

  addButton: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#2F6B3F",
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: "center",
    marginBottom: 16,

    shadowColor: "#2F6B3F",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 2,
  },

  addButtonText: {
    color: "#2F6B3F",
    fontSize: 16,
    fontWeight: "800",
  },

  calculateButton: {
    backgroundColor: "#2F6B3F",
    borderRadius: 14,
    paddingVertical: 17,
    alignItems: "center",

    shadowColor: "#2F6B3F",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.22,
    shadowRadius: 7,
    elevation: 4,
  },

  calculateText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "800",
    letterSpacing: 0.2,
  },

  //Animation styles
  header: {
    alignItems: "center",
    marginBottom: 30,
  },

  headerIcon: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: "#E5F1E8",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },

  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1F3525",
    textAlign: "center",
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
    color: "#66736A",
    maxWidth: 360,
    marginBottom: 14,
  },

  unitBadge: {
    backgroundColor: "#F0F6F1",
    borderWidth: 1,
    borderColor: "#D5E5D8",
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
  },

  unitBadgeText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#2F6B3F",
  },
});
