import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
    Alert,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";

import {
    getRetentionPeriod,
    RetentionPeriod,
    setRetentionPeriod,
} from "../../utils/storage";

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

  const handleChange = async (period: RetentionPeriod) => {
    try {
      await setRetentionPeriod(period);
      setRetentionPeriodState(period);
    } catch (error) {
      console.error("Failed to change retention period:", error);
    }
  };

  const handleClearHistory = () => {
    if (Platform.OS === "web") {
      const confirmed = window.confirm(
        "Are you sure you want to permanently delete all calculation history?",
      );

      if (confirmed) {
        // We will connect this to AsyncStorage next.
        console.log("Clear history confirmed");
      }

      return;
    }

    Alert.alert(
      "Clear History?",
      "Are you sure you want to permanently delete all calculation history?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete All",
          style: "destructive",
          onPress: () => {
            // We will connect this to AsyncStorage next.
            console.log("Clear history confirmed");
          },
        },
      ],
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerIcon}>
            <MaterialCommunityIcons
              name="cog-outline"
              size={28}
              color="#2F6B3F"
            />
          </View>

          <View style={styles.headerText}>
            <Text style={styles.title}>Settings</Text>
            <Text style={styles.subtitle}>Customize your farm calculator</Text>
          </View>
        </View>

        {/* HISTORY */}
        <Text style={styles.sectionLabel}>HISTORY</Text>

        <View style={styles.card}>
          <View style={styles.settingHeader}>
            <View style={styles.settingIcon}>
              <Ionicons name="time-outline" size={21} color="#2F6B3F" />
            </View>

            <View style={styles.settingTextContainer}>
              <Text style={styles.settingTitle}>Not Saved History</Text>

              <Text style={styles.settingDescription}>
                Choose how long calculations marked as "Not Saved" should remain
                in History.
              </Text>
            </View>
          </View>

          <View style={styles.options}>
            <Pressable style={styles.option} onPress={() => handleChange(1)}>
              <View style={styles.radio}>
                {retentionPeriod === 1 && <View style={styles.radioSelected} />}
              </View>

              <Text style={styles.optionText}>1 day</Text>
            </Pressable>

            <Pressable style={styles.option} onPress={() => handleChange(7)}>
              <View style={styles.radio}>
                {retentionPeriod === 7 && <View style={styles.radioSelected} />}
              </View>

              <Text style={styles.optionText}>7 days</Text>
            </Pressable>

            <Pressable style={styles.option} onPress={() => handleChange(30)}>
              <View style={styles.radio}>
                {retentionPeriod === 30 && (
                  <View style={styles.radioSelected} />
                )}
              </View>

              <Text style={styles.optionText}>30 days</Text>
            </Pressable>

            <Pressable style={styles.option} onPress={() => handleChange(60)}>
              <View style={styles.radio}>
                {retentionPeriod === 60 && (
                  <View style={styles.radioSelected} />
                )}
              </View>

              <Text style={styles.optionText}>60 days</Text>
            </Pressable>

            <Pressable
              style={[styles.option, styles.lastOption]}
              onPress={() => handleChange(null)}
            >
              <View style={styles.radio}>
                {retentionPeriod === null && (
                  <View style={styles.radioSelected} />
                )}
              </View>

              <Text style={styles.optionText}>Never</Text>
            </Pressable>
          </View>
        </View>

        {/* CALCULATION */}
        <Text style={styles.sectionLabel}>CALCULATION</Text>

        <View style={styles.card}>
          <View style={styles.infoRow}>
            <View style={styles.settingIcon}>
              <MaterialCommunityIcons name="sack" size={21} color="#2F6B3F" />
            </View>

            <View style={styles.settingTextContainer}>
              <Text style={styles.settingTitle}>Farm Unit</Text>
              <Text style={styles.settingDescription}>4 taro = 1 sack</Text>
            </View>

            <Text style={styles.valueText}>4 : 1</Text>
          </View>

          <View style={styles.divider} />

          <Pressable
            style={styles.infoRow}
            onPress={() => router.push("/calculation-rules")}
          >
            <View style={styles.settingIcon}>
              <MaterialCommunityIcons
                name="calculator-variant-outline"
                size={21}
                color="#2F6B3F"
              />
            </View>

            <View style={styles.settingTextContainer}>
              <Text style={styles.settingTitle}>Calculation Rules</Text>

              <Text style={styles.settingDescription}>
                View how farm shares are calculated and rounded.
              </Text>
            </View>

            <Ionicons name="chevron-forward" size={20} color="#9AA39B" />
          </Pressable>
        </View>

        {/* DATA */}
        <Text style={styles.sectionLabel}>DATA</Text>

        <View style={styles.card}>
          <Pressable style={styles.infoRow} onPress={handleClearHistory}>
            <View style={styles.settingIconDanger}>
              <Ionicons name="trash-outline" size={21} color="#B42318" />
            </View>

            <View style={styles.settingTextContainer}>
              <Text style={styles.dangerTitle}>Clear History</Text>

              <Text style={styles.settingDescription}>
                Permanently delete all saved and temporary calculations.
              </Text>
            </View>

            <Ionicons name="chevron-forward" size={20} color="#9AA39B" />
          </Pressable>
        </View>

        {/* ABOUT */}
        <Text style={styles.sectionLabel}>ABOUT</Text>

        <View style={styles.card}>
          <View style={styles.infoRow}>
            <View style={styles.settingIcon}>
              <Ionicons
                name="information-circle-outline"
                size={21}
                color="#2F6B3F"
              />
            </View>

            <View style={styles.settingTextContainer}>
              <Text style={styles.settingTitle}>Farm Share Calculator</Text>

              <Text style={styles.settingDescription}>
                An offline calculator for managing farm share calculations.
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.versionRow}>
            <Text style={styles.versionLabel}>Version</Text>
            <Text style={styles.versionText}>1.0.0</Text>
          </View>
        </View>

        <Text style={styles.footerText}>Farm Share Calculator</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9F7",
  },

  scrollContent: {
    width: "100%",
    maxWidth: 600,
    alignSelf: "center",
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
    marginTop: 30,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 28,
  },

  headerIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: "#E8F0E5",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },

  headerText: {
    flex: 1,
  },

  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#2F6B3F",
    marginBottom: 3,
  },

  subtitle: {
    fontSize: 14,
    color: "#777777",
  },

  sectionLabel: {
    fontSize: 12,
    fontWeight: "800",
    color: "#7A847C",
    letterSpacing: 1,
    marginBottom: 9,
    marginLeft: 3,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E2E6E0",
    marginBottom: 24,
    overflow: "hidden",
  },

  settingHeader: {
    flexDirection: "row",
    padding: 16,
    paddingBottom: 14,
  },

  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#E8F0E5",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  settingIconDanger: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#FDECEC",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  settingTextContainer: {
    flex: 1,
  },

  settingTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333333",
    marginBottom: 4,
  },

  dangerTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#B42318",
    marginBottom: 4,
  },

  settingDescription: {
    fontSize: 13,
    lineHeight: 19,
    color: "#777777",
  },

  options: {
    borderTopWidth: 1,
    borderTopColor: "#EEEEEE",
  },

  option: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },

  lastOption: {
    borderBottomWidth: 0,
  },

  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "#2F6B3F",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  radioSelected: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#2F6B3F",
  },

  optionText: {
    fontSize: 15,
    color: "#333333",
    fontWeight: "500",
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },

  valueText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#2F6B3F",
  },

  divider: {
    height: 1,
    backgroundColor: "#EEEEEE",
    marginLeft: 68,
  },

  versionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 15,
  },

  versionLabel: {
    fontSize: 14,
    color: "#777777",
  },

  versionText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#555555",
  },

  footerText: {
    textAlign: "center",
    fontSize: 12,
    color: "#A0A7A1",
    marginTop: 4,
  },
});
