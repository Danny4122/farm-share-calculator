import * as Print from "expo-print";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
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
import { formatTaro } from "../utils/farmCalculator";
import {
  getHistory,
  saveCalculation,
  updateCalculation,
} from "../utils/storage";

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

  const isHistoryView = typeof params.historyId === "string";

  const isAlreadySaved = params.saved === "true";

  const [hasBeenSaved, setHasBeenSaved] = useState(isAlreadySaved);

  const calculationId = useRef(Date.now().toString()).current;

  const [expandedPerson, setExpandedPerson] = useState<string | null>(null);

  const headerFade = useRef(new Animated.Value(0)).current;
  const headerSlide = useRef(new Animated.Value(-20)).current;
  const cardFade = useRef(new Animated.Value(0)).current;
  const cardSlide = useRef(new Animated.Value(20)).current;

  const [focusedNameInput, setFocusedNameInput] = useState(false);

  const [isTotalMananomayExpanded, setIsTotalMananomayExpanded] =
    useState(false);

  const [calculationName, setCalculationName] = useState(
    typeof params.calculationName === "string" ? params.calculationName : "",
  );

  const [showNameInput, setShowNameInput] = useState(false);

  let results: MananomayResult[] = [];

  try {
    if (typeof params.results === "string") {
      results = JSON.parse(params.results);
    }
  } catch (error) {
    console.log("Error reading results:", error);
  }

  // Animate the Results screen when it opens
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

    Animated.parallel([
      Animated.timing(cardFade, {
        toValue: 1,
        duration: 700,
        delay: 180,
        useNativeDriver: Platform.OS !== "web",
      }),
      Animated.spring(cardSlide, {
        toValue: 0,
        friction: 8,
        tension: 45,
        delay: 180,
        useNativeDriver: Platform.OS !== "web",
      }),
    ]).start();
  }, []);

  // Save a temporary calculation to History
  useEffect(() => {
    if (isHistoryView) {
      return;
    }

    const saveTemporaryCalculation = async () => {
      try {
        await saveCalculation({
          id: calculationId,
          name: "",
          createdAt: new Date().toISOString(),
          saved: false,
          workers: results,
        });
        console.log("Temporary calculation saved.");
      } catch (error) {
        console.error("Failed to save temporary calculation:", error);
      }
    };

    saveTemporaryCalculation();
  }, [isHistoryView]);

  const totalGross = results.reduce(
    (total, person) => total + person.harvestTaro,
    0,
  );

  const totalHarvester = results.reduce(
    (total, person) => total + person.harvesterShare,
    0,
  );

  const totalKahon = results.reduce(
    (total, person) => total + person.fixedKahonShare,
    0,
  );

  const totalHarvestShare = results.reduce(
    (total, person) => total + person.harvestShare,
    0,
  );

  const totalOwner = results.reduce(
    (total, person) => total + person.ownerShare,
    0,
  );

  const totalTenant = results.reduce(
    (total, person) => total + person.tenantShare,
    0,
  );

  const totalMananomayShare = totalKahon + totalHarvestShare;

  const handleSave = async () => {
    const trimmedName = calculationName.trim();

    if (!trimmedName) {
      alert("Please enter a name for this calculation.");
      return;
    }

    try {
      const idToUpdate =
        typeof params.historyId === "string" ? params.historyId : calculationId;

      const existingHistory = await getHistory();

      const existingCalculation = existingHistory.find(
        (calculation) => calculation.id === idToUpdate,
      );

      await updateCalculation({
        id: idToUpdate,
        name: trimmedName,
        createdAt: existingCalculation?.createdAt ?? new Date().toISOString(),
        saved: true,
        workers: results,
      });

      setShowNameInput(false);
      setHasBeenSaved(true);

      alert("Calculation saved to History!");
    } catch (error) {
      console.error("Failed to save calculation:", error);
      alert("Failed to save calculation.");
    }
  };

  const calculationDate =
    typeof params.createdAt === "string"
      ? new Date(params.createdAt)
      : new Date();

  const handlePrint = async () => {
    const calculationTitle =
      calculationName.trim() || "Farm Harvest Calculation";

    const workerSections = results
      .map((worker) => {
        const harvestSacks = Math.floor(worker.harvestTaro / 4);
        const harvestRemainingTaro = worker.harvestTaro % 4;

        const harvestDisplay =
          harvestRemainingTaro === 0
            ? `${harvestSacks} sack${harvestSacks !== 1 ? "s" : ""}`
            : `${harvestSacks} sacks + ${harvestRemainingTaro} taro`;

        const afterHarvester = worker.harvestTaro - worker.harvesterShare;

        const afterFixed = afterHarvester - worker.fixedKahonShare;

        const afterHarvestShare = afterFixed - worker.harvestShare;

        return `
                <section class="worker">
                    <h2>${worker.name}</h2>

                    <h3>Input</h3>

                    <p>
                        <strong>Kahon:</strong>
                        ${worker.kahon}
                    </p>

                    <p>
                        <strong>Harvest:</strong>
                        ${harvestDisplay}
                        (${worker.harvestTaro} taro)
                    </p>

                    <h3>Calculation Details</h3>

                    <p>
                        <strong>Harvester Share:</strong><br>
                        ${worker.harvestTaro} ÷ 15
                        = ${worker.harvestTaro / 15}
                        → ${worker.harvesterShare} taro
                    </p>

                    <p>
                        <strong>After Harvester:</strong><br>
                        ${worker.harvestTaro}
                        − ${worker.harvesterShare}
                        = ${afterHarvester} taro
                    </p>

                    <p>
                        <strong>Kahon Share:</strong><br>
                        ${worker.kahon} × 2
                        = ${worker.fixedKahonShare} taro
                    </p>

                    <p>
                        <strong>After Kahon Share:</strong><br>
                        ${afterHarvester}
                        − ${worker.fixedKahonShare}
                        = ${afterFixed} taro
                    </p>

                    <p>
                        <strong>Harvest Share:</strong><br>
                        ${afterFixed} ÷ 5
                        = ${afterFixed / 5}
                        → ${worker.harvestShare} taro
                    </p>

                    <p>
                        <strong>After Mananomay Share:</strong><br>
                        ${afterFixed}
                        − ${worker.harvestShare}
                        = ${afterHarvestShare} taro
                    </p>

                    <p>
                        <strong>Owner Share:</strong><br>
                        ${afterHarvestShare} ÷ 4
                        = ${afterHarvestShare / 4}
                        → ${worker.ownerShare} taro
                    </p>

                    <p>
                        <strong>Tenant Share:</strong><br>
                        ${afterHarvestShare}
                        − ${worker.ownerShare}
                        = ${worker.tenantShare} taro
                    </p>
                </section>
            `;
      })
      .join("");

    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>${calculationTitle}</title>
                <style>
                    * {
                        box-sizing: border-box;
                    }

                    body {
                        font-family: Arial, Helvetica, sans-serif;
                        max-width: 850px;
                        margin: 0 auto;
                        padding: 40px;
                        color: #222;
                        font-size: 14px;
                        line-height: 1.5;
                    }

                    .header {
                        text-align: center;
                        border-bottom: 2px solid #2F6B3F;
                        padding-bottom: 20px;
                        margin-bottom: 24px;
                    }

                    .header h1 {
                        margin: 0 0 6px;
                        font-size: 26px;
                    }

                    .header .subtitle {
                        color: #666;
                        font-size: 14px;
                    }

                    .info-grid {
                        display: grid;
                        grid-template-columns: 1fr 1fr;
                        gap: 12px;
                        margin-bottom: 24px;
                    }

                    .info-box {
                        background: #F5F7F2;
                        border: 1px solid #DDE4D9;
                        border-radius: 8px;
                        padding: 12px;
                    }

                    .info-label {
                        font-size: 12px;
                        color: #666;
                        margin-bottom: 3px;
                    }

                    .info-value {
                        font-weight: 700;
                        font-size: 15px;
                    }

                    .rules {
                        background: #F5F7F2;
                        border-left: 4px solid #2F6B3F;
                        padding: 14px 16px;
                        margin-bottom: 28px;
                    }

                    .rules h2 {
                        margin: 0 0 8px;
                        font-size: 16px;
                    }

                    .rules p {
                        margin: 4px 0;
                    }

                    .section-title {
                        font-size: 20px;
                        margin: 28px 0 12px;
                        padding-bottom: 6px;
                        border-bottom: 1px solid #CCC;
                    }

                    .input-table,
                    .summary-table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-bottom: 28px;
                    }

                    .input-table th,
                    .input-table td,
                    .summary-table th,
                    .summary-table td {
                        border: 1px solid #D5D5D5;
                        padding: 8px;
                        text-align: left;
                    }

                    .input-table th,
                    .summary-table th {
                        background: #F1F3EF;
                        font-weight: 700;
                    }

                    .input-table td.number,
                    .summary-table td.number {
                        text-align: right;
                    }

                    .worker {
                        border: 1px solid #D8D8D8;
                        border-radius: 10px;
                        padding: 18px;
                        margin-bottom: 20px;
                        page-break-inside: avoid;
                    }

                    .worker-header {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        border-bottom: 1px solid #DDD;
                        padding-bottom: 10px;
                        margin-bottom: 14px;
                    }

                    .worker-header h3 {
                        margin: 0;
                        font-size: 18px;
                    }

                    .worker-header .kahon {
                        font-size: 13px;
                        color: #666;
                    }

                    .calculation-step {
                        margin: 10px 0;
                        padding: 8px 10px;
                        background: #FAFAFA;
                        border-radius: 5px;
                    }

                    .calculation-step strong {
                        display: block;
                        margin-bottom: 2px;
                    }

                    .result-highlight {
                        background: #F5F7F2;
                        border-left: 3px solid #2F6B3F;
                        padding: 10px 12px;
                        margin-top: 12px;
                    }

                    .summary-section {
                        margin-top: 30px;
                        page-break-before: always;
                        break-before: page;
                        page-break-inside: avoid;
                        break-inside: avoid;
                    }

                    .summary-table .total-row {
                        font-weight: 700;
                        background: #F5F7F2;
                    }

                    .summary-subtitle {
                        font-size: 16px;
                        margin-top: 20px;
                        margin-bottom: 10px;
                    }

                    .tenant-row {
                        font-weight: 700;
                        font-size: 16px;
                        background: #F5F7F2;
                    }

                    .signature-section {
                        display: grid;
                        grid-template-columns: 1fr 1fr;
                        gap: 50px;
                        margin-top: 60px;
                        page-break-inside: avoid;
                    }

                    .signature-line {
                        border-top: 1px solid #333;
                        padding-top: 6px;
                        text-align: center;
                        color: #555;
                    }

                    .footer {
                        margin-top: 40px;
                        padding-top: 12px;
                        border-top: 1px solid #DDD;
                        text-align: center;
                        color: #777;
                        font-size: 11px;
                    }

                    @media print {
                        body {
                            padding: 20px;
                        }

                        .worker {
                            break-inside: avoid;
                        }

                        .summary-section,
                        .signature-section {
                            break-inside: avoid;
                        }
                    }

                    @media (max-width: 600px) {
                        body {
                            padding: 20px;
                        }

                        .info-grid,
                        .signature-section {
                            grid-template-columns: 1fr;
                        }
                    }
                </style>
        </head>

        <body>
            <h1>${calculationTitle}</h1>

            <div class="date">
                ${calculationDate.toLocaleString()}
            </div>

            <div class="unit">
                <strong>Farm Unit:</strong>
                4 taro = 1 sack
            </div>

            ${workerSections}

            <section class="summary-section">
                <h2>Complete Calculation Summary</h2>

                <h3 class="summary-subtitle">Summary in Taro</h3>

                <table class="summary-table">
                    <thead>
                        <tr>
                            <th>Category</th>
                            <th>Amount (Taro)</th>
                        </tr>
                    </thead>

                    <tbody>
                        <tr>
                            <td>Total Harvest</td>
                            <td class="number">${totalGross}</td>
                        </tr>

                        <tr>
                            <td>Total Harvester Share</td>
                            <td class="number">${totalHarvester}</td>
                        </tr>

                        <tr>
                            <td>Total Kahon Share</td>
                            <td class="number">${totalKahon}</td>
                        </tr>

                        <tr>
                            <td>Total Harvest Share</td>
                            <td class="number">${totalHarvestShare}</td>
                        </tr>

                        <tr>
                            <td>Total Mananomay Share</td>
                            <td class="number">${totalMananomayShare}</td>
                        </tr>

                        <tr>
                            <td>Total Owner Share</td>
                            <td class="number">${totalOwner}</td>
                        </tr>

                        <tr class="tenant-row">
                            <td>Total Tenant Share</td>
                            <td class="number">${totalTenant}</td>
                        </tr>
                    </tbody>
                </table>

                <h3 class="summary-subtitle">Summary in Sacks + Taro</h3>

                <table class="summary-table">
                    <thead>
                        <tr>
                            <th>Category</th>
                            <th>Amount</th>
                        </tr>
                    </thead>

                    <tbody>
                        <tr>
                            <td>Total Harvest</td>
                            <td class="number">${formatTaro(totalGross)}</td>
                        </tr>

                        <tr>
                            <td>Total Harvester Share</td>
                            <td class="number">${formatTaro(totalHarvester)}</td>
                        </tr>

                        <tr>
                            <td>Total Kahon Share</td>
                            <td class="number">${formatTaro(totalKahon)}</td>
                        </tr>

                        <tr>
                            <td>Total Harvest Share</td>
                            <td class="number">${formatTaro(totalHarvestShare)}</td>
                        </tr>

                        <tr>
                            <td>Total Mananomay Share</td>
                            <td class="number">${formatTaro(totalMananomayShare)}</td>
                        </tr>

                        <tr>
                            <td>Total Owner Share</td>
                            <td class="number">${formatTaro(totalOwner)}</td>
                        </tr>

                        <tr class="tenant-row">
                            <td>Total Tenant Share</td>
                            <td class="number">${formatTaro(totalTenant)}</td>
                        </tr>
                    </tbody>
                </table>
            </section>
        </body>
        </html>
    `;

    if (Platform.OS === "web") {
      const printWindow = window.open("", "_blank");

      if (!printWindow) {
        alert("Unable to open the print window.");
        return;
      }

      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    } else {
      try {
        await Print.printAsync({
          html,
        });
      } catch (error) {
        console.error("Failed to print:", error);
        alert("Unable to open the print dialog.");
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
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
              <Text style={styles.headerIconText}>🌾</Text>
            </View>

            {isHistoryView ? (
              <Text style={styles.title}>
                {calculationName.trim() || "Unnamed Calculation"}
              </Text>
            ) : (
              <Text style={styles.title}>Farm Share Results</Text>
            )}

            <Text style={styles.subtitle}>
              Individual calculation for each mananomay
            </Text>

            <View style={styles.unitBadge}>
              <Text style={styles.unitBadgeText}>1 sack = 4 taro</Text>
            </View>
          </Animated.View>

          {/* Individual Results */}
          {results.map((person, index) => {
            const mananomayShare = person.fixedKahonShare + person.harvestShare;

            const personKey = `${person.name}-${index}`;

            const isExpanded = expandedPerson === personKey;

            return (
              <Animated.View
                key={personKey}
                style={[
                  styles.personCard,
                  {
                    opacity: cardFade,
                    transform: [{ translateY: cardSlide }],
                  },
                ]}
              >
                {/* Person name */}
                <View style={styles.personHeader}>
                  <View style={styles.personNameRow}>
                    <View style={styles.personIcon}>
                      <Text style={styles.personIconText}>👤</Text>
                    </View>

                    <View>
                      <Text style={styles.personTitle}>{person.name}</Text>

                      <Text style={styles.kahonText}>{person.kahon} kahon</Text>
                    </View>
                  </View>
                </View>
                {/* Gross Harvest */}
                <View style={styles.resultRow}>
                  <Text style={styles.resultLabel}>Gross Harvest</Text>

                  <Text style={styles.resultValue}>
                    {formatTaro(person.harvestTaro)}
                  </Text>
                </View>
                {/* Harvester */}
                <View style={styles.resultRow}>
                  <Text style={styles.resultLabel}>Harvester</Text>

                  <Text style={styles.resultValue}>
                    {formatTaro(person.harvesterShare)}
                  </Text>
                </View>
                {/* Expandable Mananomay Share */}
                <View style={styles.shareBox}>
                  <Pressable
                    style={styles.shareButton}
                    onPress={() =>
                      setExpandedPerson(isExpanded ? null : personKey)
                    }
                  >
                    <View style={styles.shareTextContainer}>
                      <View>
                        <Text style={styles.shareLabel}>
                          {person.name}'s Share
                        </Text>

                        <Text style={styles.shareDescription}>
                          Kahon + harvest share
                        </Text>
                      </View>

                      <View style={styles.shareRight}>
                        <Text style={styles.shareValue}>
                          {formatTaro(mananomayShare)}
                        </Text>

                        <Text style={styles.arrow}>
                          {isExpanded ? "▲" : "▼"}
                        </Text>
                      </View>
                    </View>
                  </Pressable>

                  {isExpanded && (
                    <View style={styles.breakdown}>
                      <View style={styles.breakdownRow}>
                        <Text style={styles.breakdownLabel}>Kahon Share</Text>

                        <Text style={styles.breakdownValue}>
                          {formatTaro(person.fixedKahonShare)}
                        </Text>
                      </View>

                      <View style={styles.breakdownRow}>
                        <Text style={styles.breakdownLabel}>Harvest Share</Text>

                        <Text style={styles.breakdownValue}>
                          {formatTaro(person.harvestShare)}
                        </Text>
                      </View>

                      <View style={styles.breakdownTotal}>
                        <Text style={styles.breakdownTotalLabel}>Total</Text>

                        <Text style={styles.breakdownTotalValue}>
                          {formatTaro(mananomayShare)}
                        </Text>
                      </View>
                    </View>
                  )}
                </View>
                {/* Owner */}
                <View style={styles.resultRow}>
                  <Text style={styles.resultLabel}>Owner Share</Text>

                  <Text style={styles.resultValue}>
                    {formatTaro(person.ownerShare)}
                  </Text>
                </View>
                {/* Tenant */}
                <View style={styles.tenantRow}>
                  <Text style={styles.tenantLabel}>Tenant Share</Text>

                  <Text style={styles.tenantValue}>
                    {formatTaro(person.tenantShare)}
                  </Text>
                </View>
              </Animated.View>
            );
          })}
          {/* Complete Total */}
          <View style={styles.totalCard}>
            <Text style={styles.totalTitle}>Complete Total</Text>

            {/* Total Gross Harvest */}
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Total Gross Harvest</Text>

              <Text style={styles.resultValue}>{formatTaro(totalGross)}</Text>
            </View>

            {/* Total Harvester */}
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Total Harvester</Text>

              <Text style={styles.resultValue}>
                {formatTaro(totalHarvester)}
              </Text>
            </View>

            {/* Total Mananomay Share */}
            <Pressable
              style={styles.shareButton}
              onPress={() =>
                setIsTotalMananomayExpanded(!isTotalMananomayExpanded)
              }
            >
              <View style={styles.shareTextContainer}>
                <Text style={styles.shareLabel}>Total Mananomay Share</Text>

                <Text style={styles.shareValue}>
                  {formatTaro(totalMananomayShare)}
                </Text>
              </View>

              <Text style={styles.arrow}>
                {isTotalMananomayExpanded ? "▲" : "▼"}
              </Text>
            </Pressable>

            {/* Individual Mananomay Shares */}
            {isTotalMananomayExpanded && (
              <View style={styles.breakdown}>
                {results.map((person, index) => {
                  const mananomayShare =
                    person.fixedKahonShare + person.harvestShare;

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
              <Text style={styles.resultLabel}>Total Owner</Text>

              <Text style={styles.resultValue}>{formatTaro(totalOwner)}</Text>
            </View>

            {/* Total Tenant */}
            <View style={styles.tenantTotalRow}>
              <Text style={styles.tenantLabel}>Total Tenant</Text>

              <Text style={styles.tenantValue}>{formatTaro(totalTenant)}</Text>
            </View>
          </View>

          {/* Save to History */}
          {!hasBeenSaved && !showNameInput && (
            <Pressable
              style={styles.saveButton}
              onPress={() => setShowNameInput(true)}
            >
              <Text style={styles.saveButtonText}>💾 Save to History</Text>
            </Pressable>
          )}

          {!hasBeenSaved && showNameInput && (
            <View style={styles.nameInputContainer}>
              <Text style={styles.nameInputLabel}>Calculation Name</Text>

              <Text style={styles.nameInputDescription}>
                Give this calculation a name so you can easily find it later.
              </Text>

              <TextInput
                style={[
                  styles.nameInput,
                  focusedNameInput && styles.nameInputFocused,
                ]}
                placeholder="e.g. September Harvest"
                value={calculationName}
                onChangeText={setCalculationName}
                onFocus={() => setFocusedNameInput(true)}
                onBlur={() => setFocusedNameInput(false)}
                autoFocus
              />

              <View style={styles.nameInputButtons}>
                <Pressable
                  style={styles.cancelNameButton}
                  onPress={() => {
                    setCalculationName("");
                    setShowNameInput(false);
                  }}
                >
                  <Text style={styles.cancelNameButtonText}>Cancel</Text>
                </Pressable>

                <Pressable
                  style={styles.confirmSaveButton}
                  onPress={handleSave}
                >
                  <Text style={styles.confirmSaveButtonText}>💾 Save</Text>
                </Pressable>
              </View>
            </View>
          )}

          <Pressable style={styles.printButton} onPress={handlePrint}>
            <Text style={styles.printButtonText}>🖨️ Print Calculation</Text>
          </Pressable>

          {/* New Calculation */}
          {!isHistoryView && (
            <Pressable
              style={styles.newButton}
              onPress={() => router.replace("/")}
            >
              <Text style={styles.newButtonText}>New Calculation</Text>
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

  // -------------------------
  // Header
  // -------------------------

  header: {
    alignItems: "center",
    marginBottom: 28,
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

  headerIconText: {
    fontSize: 38,
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

  // -------------------------
  // Person card
  // -------------------------

  personCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 20,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#DCE4DD",

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
    marginBottom: 12,
  },

  personNameRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  personIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "#E5F1E8",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  personIconText: {
    fontSize: 20,
  },

  personTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1F3525",
    marginBottom: 3,
  },

  kahonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#66736A",
  },

  // -------------------------
  // Result rows
  // -------------------------

  resultRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: "#EEF1ED",
  },

  resultLabel: {
    fontSize: 15,
    color: "#34463A",
    flex: 1,
  },

  resultValue: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1F3525",
    textAlign: "right",
  },

  // -------------------------
  // Mananomay share
  // -------------------------

  shareBox: {
    backgroundColor: "#F0F6F1",
    borderWidth: 1,
    borderColor: "#D5E5D8",
    borderRadius: 12,
    marginTop: 4,
    marginBottom: 2,
    overflow: "hidden",
  },

  shareButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 13,
    paddingHorizontal: 12,
  },

  shareTextContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flex: 1,
  },

  shareRight: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 10,
  },

  shareLabel: {
    fontSize: 15,
    fontWeight: "800",
    color: "#2F6B3F",
  },

  shareDescription: {
    fontSize: 12,
    color: "#66736A",
    marginTop: 2,
  },

  shareValue: {
    fontSize: 15,
    fontWeight: "800",
    color: "#2F6B3F",
  },

  arrow: {
    fontSize: 12,
    fontWeight: "800",
    color: "#2F6B3F",
    marginLeft: 8,
  },

  // -------------------------
  // Breakdown
  // -------------------------

  breakdown: {
    paddingHorizontal: 12,
    paddingBottom: 10,
    paddingTop: 2,
    borderTopWidth: 1,
    borderTopColor: "#D5E5D8",
  },

  breakdownRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },

  breakdownLabel: {
    fontSize: 14,
    color: "#55645A",
  },

  breakdownValue: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1F3525",
  },

  breakdownTotal: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 10,
    marginTop: 5,
    borderTopWidth: 1,
    borderTopColor: "#D5DDD6",
  },

  breakdownTotalLabel: {
    fontSize: 14,
    fontWeight: "800",
    color: "#1F3525",
  },

  breakdownTotalValue: {
    fontSize: 14,
    fontWeight: "800",
    color: "#2F6B3F",
  },

  // -------------------------
  // Tenant
  // -------------------------

  tenantRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
    paddingTop: 13,
    borderTopWidth: 1,
    borderTopColor: "#DCE4DD",
  },

  tenantLabel: {
    fontSize: 16,
    fontWeight: "800",
    color: "#2F6B3F",
  },

  tenantValue: {
    fontSize: 17,
    fontWeight: "800",
    color: "#2F6B3F",
  },

  // -------------------------
  // Complete total
  // -------------------------

  totalCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 20,
    marginTop: 4,
    marginBottom: 18,
    borderWidth: 1.5,
    borderColor: "#2F6B3F",

    shadowColor: "#2F6B3F",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },

  totalTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#1F3525",
    marginBottom: 12,
  },

  tenantTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: "#DCE4DD",
  },

  // -------------------------
  // Save input
  // -------------------------

  nameInputContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 20,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#DCE4DD",

    shadowColor: "#1F3525",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.07,
    shadowRadius: 7,
    elevation: 2,
  },

  nameInputLabel: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1F3525",
    marginBottom: 6,
  },

  nameInputDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: "#66736A",
    marginBottom: 13,
  },

  nameInput: {
    borderWidth: 1,
    borderColor: "#CCCCCC",
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 13,
    fontSize: 16,
    backgroundColor: "#FFFFFF",
    color: "#1F3525",
  },

  nameInputFocused: {
    borderColor: "#2F6B3F",
    borderWidth: 2,
  },

  nameInputButtons: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
  },

  cancelNameButton: {
    flex: 1,
    backgroundColor: "#F3F4F2",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#DCE0DC",
  },

  cancelNameButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#59645D",
  },

  confirmSaveButton: {
    flex: 1,
    backgroundColor: "#2F6B3F",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },

  confirmSaveButtonText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#FFFFFF",
  },

  // -------------------------
  // Action buttons
  // -------------------------

  saveButton: {
    backgroundColor: "#E5F1E8",
    borderWidth: 1,
    borderColor: "#CFE0D2",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 12,
  },

  saveButtonText: {
    color: "#2F6B3F",
    fontSize: 16,
    fontWeight: "800",
  },

  printButton: {
    width: "100%",
    borderWidth: 1.5,
    borderColor: "#2F6B3F",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: "center",
    marginBottom: 12,
  },

  printButtonText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#2F6B3F",
  },

  newButton: {
    backgroundColor: "#2F6B3F",
    borderRadius: 14,
    paddingVertical: 17,
    alignItems: "center",

    shadowColor: "#2F6B3F",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 7,
    elevation: 4,
  },

  newButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "800",
  },
});
