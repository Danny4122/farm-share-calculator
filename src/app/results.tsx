import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
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

  const handlePrint = () => {
    if (typeof window === "undefined") {
      return;
    }

    const printWindow = window.open("", "_blank");

    if (!printWindow) {
      alert("Unable to open the print window.");
      return;
    }

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

    printWindow.document.write(`
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
    `);

    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          {/* Back button */}
          <Pressable onPress={() => router.back()}>
            {/* <Text style={styles.backButton}>
                            ← Back
                        </Text> */}
          </Pressable>

          {/* Header */}
          <Text style={styles.icon}>🌾</Text>

          {isHistoryView ? (
            <>
              <Text style={styles.title}>
                {calculationName.trim() || "Unnamed Calculation"}
              </Text>

              {/* <Text style={styles.subtitle}>Farm Share Results</Text> */}

              <Text style={styles.subtitle}>
                Individual calculation for each mananomay
              </Text>
            </>
          ) : (
            <>
              <Text style={styles.title}>🌾 Farm Share Results</Text>

              <Text style={styles.subtitle}>
                Individual calculation for each mananomay
              </Text>
            </>
          )}

          {/* Individual Results */}
          {results.map((person, index) => {
            const mananomayShare = person.fixedKahonShare + person.harvestShare;

            const personKey = `${person.name}-${index}`;

            const isExpanded = expandedPerson === personKey;

            return (
              <View key={personKey} style={styles.personCard}>
                {/* Person name */}
                <Text style={styles.personTitle}>{person.name}</Text>

                <Text style={styles.kahonText}>{person.kahon} kahon</Text>

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
                <Pressable
                  style={styles.shareButton}
                  onPress={() =>
                    setExpandedPerson(isExpanded ? null : personKey)
                  }
                >
                  <View style={styles.shareTextContainer}>
                    <Text style={styles.shareLabel}>{person.name}'s Share</Text>

                    <Text style={styles.shareValue}>
                      {formatTaro(mananomayShare)}
                    </Text>
                  </View>

                  <Text style={styles.arrow}>{isExpanded ? "▲" : "▼"}</Text>
                </Pressable>

                {/* Expanded Breakdown */}
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
              </View>
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

  backButton: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 24,
  },

  icon: {
    fontSize: 50,
    textAlign: "center",
    marginBottom: 8,
  },

  title: {
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 15,
    textAlign: "center",
    color: "#666666",
    marginBottom: 12,
  },

  personCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#DDDDDD",
  },

  personTitle: {
    fontSize: 21,
    fontWeight: "700",
    marginBottom: 4,
  },

  kahonText: {
    fontSize: 14,
    color: "#666666",
    marginBottom: 14,
  },

  resultRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },

  resultLabel: {
    fontSize: 15,
    color: "#444444",
    flex: 1,
  },

  resultValue: {
    fontSize: 15,
    fontWeight: "600",
    textAlign: "right",
  },

  shareButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },

  shareTextContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flex: 1,
  },

  shareLabel: {
    fontSize: 15,
    fontWeight: "700",
  },

  shareValue: {
    fontSize: 15,
    fontWeight: "700",
    marginLeft: 10,
  },

  arrow: {
    fontSize: 12,
    marginLeft: 10,
  },

  breakdown: {
    backgroundColor: "#F5F7F2",
    borderRadius: 10,
    padding: 12,
    marginTop: 8,
    marginBottom: 4,
  },

  breakdownRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 7,
  },

  breakdownLabel: {
    fontSize: 14,
    color: "#555555",
  },

  breakdownValue: {
    fontSize: 14,
    fontWeight: "600",
  },

  breakdownTotal: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 9,
    marginTop: 5,
    borderTopWidth: 1,
    borderTopColor: "#CCCCCC",
  },

  breakdownTotalLabel: {
    fontSize: 14,
    fontWeight: "700",
  },

  breakdownTotalValue: {
    fontSize: 14,
    fontWeight: "700",
  },

  tenantRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
    paddingTop: 12,
  },

  tenantLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: "#008000",
  },

  tenantValue: {
    fontSize: 17,
    fontWeight: "700",
    color: "#008000",
  },

  totalCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 18,
    marginTop: 8,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: "#2F6B3F",
  },

  totalTitle: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 12,
  },

  tenantTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
    paddingTop: 14,
  },

  nameInputContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#DDDDDD",
  },

  nameInputLabel: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 6,
  },

  nameInputDescription: {
    fontSize: 14,
    color: "#666666",
    marginBottom: 12,
  },

  nameInput: {
    borderWidth: 1,
    borderColor: "#CCCCCC",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: "#FAFAFA",
  },

  nameInputButtons: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
  },

  cancelNameButton: {
    flex: 1,
    backgroundColor: "#EEEEEE",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
  },

  cancelNameButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#444444",
  },

  confirmSaveButton: {
    flex: 1,
    backgroundColor: "#2F6B3F",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
  },

  confirmSaveButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },

  saveButton: {
    backgroundColor: "#E8F0E5",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 12,
  },

  saveButtonText: {
    color: "#2F6B3F",
    fontSize: 17,
    fontWeight: "bold",
  },

  newButton: {
    backgroundColor: "#2F6B3F",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },

  newButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "bold",
  },

  printButton: {
    width: "100%",
    maxWidth: 600,
    alignSelf: "center",
    borderWidth: 1,
    borderColor: "#2F6B3F",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    marginBottom: 12,
  },

  printButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2F6B3F",
  },
});
