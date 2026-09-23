import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import {
    SafeAreaView,
    useSafeAreaInsets,
} from "react-native-safe-area-context";

export default function CalculationRulesScreen() {
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      {/* Fixed Header */}
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={styles.backButton}
          hitSlop={8}
        >
          <Ionicons name="arrow-back" size={24} color="#333333" />
        </Pressable>

        <Text style={styles.headerTitle}>Calculation Rules</Text>

        {/* Keeps the title centered */}
        <View style={styles.headerSpacer} />
      </View>

      {/* Scrollable Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingBottom: 40 + insets.bottom,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Farm Unit */}
        <View style={styles.introCard}>
          <View style={styles.iconCircle}>
            <MaterialCommunityIcons name="sack" size={28} color="#2F6B3F" />
          </View>

          <Text style={styles.introTitle}>Farm Share Calculation</Text>

          <Text style={styles.introText}>
            These are the rules used by the Farm Share Calculator to divide the
            harvest.
          </Text>
        </View>

        {/* Basic Unit */}
        <Text style={styles.sectionLabel}>BASIC UNIT</Text>

        <View style={styles.card}>
          <View style={styles.ruleRow}>
            <View style={styles.ruleIcon}>
              <MaterialCommunityIcons
                name="scale-balance"
                size={21}
                color="#2F6B3F"
              />
            </View>

            <View style={styles.ruleContent}>
              <Text style={styles.ruleTitle}>Taro to Sack</Text>
              <Text style={styles.ruleDescription}>4 taro = 1 sack</Text>
            </View>
          </View>
        </View>

        {/* Share Rules */}
        <Text style={styles.sectionLabel}>SHARE RULES</Text>

        <View style={styles.card}>
          <Rule
            number="1"
            title="Harvester Share"
            description="The harvester receives 1 taro for every 15 gross taro."
          />

          <View style={styles.divider} />

          <Rule
            number="2"
            title="Fixed Kahon Share"
            description="Each mananomay receives 2 taro for every kahon."
          />

          <View style={styles.divider} />

          <Rule
            number="3"
            title="Mananomay Harvest Share"
            description="After the harvester and fixed kahon shares are deducted, the mananomay receives 1 taro for every 5 taro remaining."
          />

          <View style={styles.divider} />

          <Rule
            number="4"
            title="Owner Share"
            description="After the previous shares are deducted, the owner receives 1 taro for every 4 taro remaining."
          />

          <View style={styles.divider} />

          <Rule
            number="5"
            title="Tenant Share"
            description="The tenant receives the remaining taro after all other shares have been deducted."
          />
        </View>

        {/* Rounding */}
        <Text style={styles.sectionLabel}>ROUNDING</Text>

        <View style={styles.card}>
          <View style={styles.roundingRow}>
            <View style={styles.roundingBadge}>
              <Text style={styles.roundingBadgeText}>.00–.34</Text>
            </View>

            <Text style={styles.roundingText}>
              Round down to the whole taro
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.roundingRow}>
            <View style={styles.roundingBadge}>
              <Text style={styles.roundingBadgeText}>.35–.69</Text>
            </View>

            <Text style={styles.roundingText}>
              Round to the nearest half taro
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.roundingRow}>
            <View style={styles.roundingBadge}>
              <Text style={styles.roundingBadgeText}>.70–.99</Text>
            </View>

            <Text style={styles.roundingText}>
              Round up to the next whole taro
            </Text>
          </View>
        </View>

        {/* Example */}
        <Text style={styles.sectionLabel}>EXAMPLE</Text>

        <View style={styles.exampleCard}>
          <Text style={styles.exampleTitle}>47 gross taro • 1 kahon</Text>

          <Text style={styles.exampleText}>
            Harvester: 47 ÷ 15 = 3.13 → 3 taro
          </Text>

          <Text style={styles.exampleText}>Fixed kahon: 1 × 2 = 2 taro</Text>

          <Text style={styles.exampleText}>
            Remaining: 47 − 3 − 2 = 42 taro
          </Text>

          <Text style={styles.exampleText}>
            Mananomay: 42 ÷ 5 = 8.4 → 8.5 taro
          </Text>

          <Text style={styles.exampleText}>
            Remaining: 42 − 8.5 = 33.5 taro
          </Text>

          <Text style={styles.exampleText}>
            Owner: 33.5 ÷ 4 = 8.375 → 8.5 taro
          </Text>

          <View style={styles.exampleResult}>
            <Text style={styles.exampleResultLabel}>Tenant remainder</Text>

            <Text style={styles.exampleResultValue}>25 taro</Text>
          </View>
        </View>

        <Text style={styles.footerText}>
          These rules are applied automatically when calculating individual farm
          shares.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function Rule({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <View style={styles.ruleRow}>
      <View style={styles.numberCircle}>
        <Text style={styles.numberText}>{number}</Text>
      </View>

      <View style={styles.ruleContent}>
        <Text style={styles.ruleTitle}>{title}</Text>
        <Text style={styles.ruleDescription}>{description}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9F7",
    marginTop: 30,
  },

  /* Fixed header */
  header: {
    height: 64,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E6E0",
  },

  backButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },

  headerSpacer: {
    width: 44,
  },

  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: "800",
    color: "#333333",
    textAlign: "left",
  },

  /* Scroll area */
  scrollView: {
    flex: 1,
  },

  scrollContent: {
    width: "100%",
    maxWidth: 600,
    alignSelf: "center",
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 60,
  },

  introCard: {
    backgroundColor: "#E8F0E5",
    borderRadius: 14,
    padding: 20,
    alignItems: "center",
    marginBottom: 26,
  },

  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },

  introTitle: {
    fontSize: 19,
    fontWeight: "800",
    color: "#2F6B3F",
    marginBottom: 6,
  },

  introText: {
    fontSize: 14,
    lineHeight: 20,
    color: "#59635B",
    textAlign: "center",
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

  ruleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 16,
  },

  ruleIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#E8F0E5",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  numberCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#E8F0E5",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  numberText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#2F6B3F",
  },

  ruleContent: {
    flex: 1,
  },

  ruleTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333333",
    marginBottom: 4,
  },

  ruleDescription: {
    fontSize: 13,
    lineHeight: 19,
    color: "#777777",
  },

  divider: {
    height: 1,
    backgroundColor: "#EEEEEE",
    marginLeft: 60,
  },

  roundingRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },

  roundingBadge: {
    minWidth: 78,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 7,
    backgroundColor: "#E8F0E5",
    alignItems: "center",
    marginRight: 12,
  },

  roundingBadgeText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#2F6B3F",
  },

  roundingText: {
    flex: 1,
    fontSize: 14,
    color: "#555555",
    lineHeight: 19,
  },

  exampleCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E2E6E0",
    padding: 18,
    marginBottom: 24,
  },

  exampleTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#333333",
    marginBottom: 14,
  },

  exampleText: {
    fontSize: 13,
    color: "#666666",
    lineHeight: 21,
    marginBottom: 4,
  },

  exampleResult: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#EEEEEE",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  exampleResultLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#555555",
  },

  exampleResultValue: {
    fontSize: 18,
    fontWeight: "800",
    color: "#2F6B3F",
  },

  footerText: {
    fontSize: 12,
    lineHeight: 18,
    color: "#A0A7A1",
    textAlign: "center",
    marginTop: 2,
  },
});
