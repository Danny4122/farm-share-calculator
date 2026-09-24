import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Asset } from "expo-asset";
import * as Print from "expo-print";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  KeyboardAvoidingView,
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

const AnimatedActionButton = ({
  children,
  onPress,
  style,
}: {
  children: React.ReactNode;
  onPress: () => void;
  style?: any;
}) => {
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 0.96,
        useNativeDriver: true,
        speed: 30,
        bounciness: 4,
      }),
      Animated.timing(opacity, {
        toValue: 0.85,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePressOut = () => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
        speed: 25,
        bounciness: 6,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 120,
        useNativeDriver: true,
      }),
    ]).start();
  };

  return (
    <Animated.View
      style={{
        transform: [{ scale }],
        opacity,
      }}
    >
      <Pressable
        style={style}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
};

export default function ResultsScreen() {
  const params = useLocalSearchParams();

  const isHistoryView = typeof params.historyId === "string";

  const isAlreadySaved = params.saved === "true";

  const [hasBeenSaved, setHasBeenSaved] = useState(isAlreadySaved);

  const calculationId = useRef(Date.now().toString()).current;

  const [expandedPerson, setExpandedPerson] = useState<string | null>(null);

  //Header Card Animation
  const headerFade = useRef(new Animated.Value(0)).current;
  const headerSlide = useRef(new Animated.Value(-20)).current;

  //Worker Card Animation
  const cardFade = useRef(new Animated.Value(0)).current;
  const cardSlide = useRef(new Animated.Value(20)).current;

  //Total Card Animation
  const totalFade = useRef(new Animated.Value(0)).current;
  const totalSlide = useRef(new Animated.Value(25)).current;

  const scrollViewRef = useRef<ScrollView>(null);

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
    const useNative = Platform.OS !== "web";

    // Header animation
    Animated.parallel([
      Animated.timing(headerFade, {
        toValue: 1,
        duration: 600,
        useNativeDriver: useNative,
      }),
      Animated.spring(headerSlide, {
        toValue: 0,
        friction: 8,
        tension: 50,
        useNativeDriver: useNative,
      }),
    ]).start();

    // Worker cards animation
    Animated.parallel([
      Animated.timing(cardFade, {
        toValue: 1,
        duration: 700,
        delay: 180,
        useNativeDriver: useNative,
      }),
      Animated.spring(cardSlide, {
        toValue: 0,
        friction: 8,
        tension: 45,
        delay: 180,
        useNativeDriver: useNative,
      }),
    ]).start();

    // Complete Total animation
    Animated.parallel([
      Animated.timing(totalFade, {
        toValue: 1,
        duration: 600,
        delay: 500,
        useNativeDriver: useNative,
      }),
      Animated.spring(totalSlide, {
        toValue: 0,
        friction: 8,
        tension: 45,
        delay: 500,
        useNativeDriver: useNative,
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

    const escapeHtml = (value: string) =>
      value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

    const safeTitle = escapeHtml(calculationTitle);

    const formattedDate = calculationDate.toLocaleString();

    const workerSections = results
      .map((worker, index) => {
        const harvestSacks = Math.floor(worker.harvestTaro / 4);
        const harvestRemainingTaro = worker.harvestTaro % 4;

        const harvestDisplay =
          harvestRemainingTaro === 0
            ? `${harvestSacks} sack${harvestSacks !== 1 ? "s" : ""}`
            : harvestSacks === 0
              ? `${harvestRemainingTaro} taro`
              : `${harvestSacks} sacks + ${harvestRemainingTaro} taro`;

        const afterHarvester = worker.harvestTaro - worker.harvesterShare;

        const afterFixed = afterHarvester - worker.fixedKahonShare;

        const afterHarvestShare = afterFixed - worker.harvestShare;

        return `
        <section class="worker-card">
          <div class="worker-header">
            <div>
              <div class="worker-number">MANANOMAY ${index + 1}</div>
              <h2>${escapeHtml(worker.name || "Unnamed Worker")}</h2>
            </div>

            <div class="worker-kahon">
              <span>Kahon</span>
              <strong>${worker.kahon}</strong>
            </div>
          </div>

          <div class="worker-inputs">
            <div class="input-item">
              <span class="input-label">Harvest</span>
              <strong>${harvestDisplay}</strong>
              <small>${worker.harvestTaro} taro</small>
            </div>

            <div class="input-item">
              <span class="input-label">Kahon</span>
              <strong>${worker.kahon}</strong>
              <small>2 taro per kahon</small>
            </div>
          </div>

          <div class="calculation-heading">
            Calculation Breakdown
          </div>

          <div class="calculation-table">
            <div class="calc-row">
              <div class="calc-label">
                <strong>Harvester Share</strong>
                <span>${worker.harvestTaro} ÷ 15</span>
              </div>
              <div class="calc-value">
                ${worker.harvesterShare} taro
              </div>
            </div>

            <div class="calc-row muted-row">
              <div class="calc-label">
                <span>Remaining after harvester</span>
              </div>
              <div class="calc-value">
                ${afterHarvester} taro
              </div>
            </div>

            <div class="calc-row">
              <div class="calc-label">
                <strong>Fixed Kahon Share</strong>
                <span>${worker.kahon} × 2</span>
              </div>
              <div class="calc-value">
                ${worker.fixedKahonShare} taro
              </div>
            </div>

            <div class="calc-row muted-row">
              <div class="calc-label">
                <span>Remaining after kahon share</span>
              </div>
              <div class="calc-value">
                ${afterFixed} taro
              </div>
            </div>

            <div class="calc-row">
              <div class="calc-label">
                <strong>Mananomay Harvest Share</strong>
                <span>${afterFixed} ÷ 5</span>
              </div>
              <div class="calc-value">
                ${worker.harvestShare} taro
              </div>
            </div>

            <div class="calc-row muted-row">
              <div class="calc-label">
                <span>Remaining after mananomay share</span>
              </div>
              <div class="calc-value">
                ${afterHarvestShare} taro
              </div>
            </div>

            <div class="calc-row">
              <div class="calc-label">
                <strong>Owner Share</strong>
                <span>${afterHarvestShare} ÷ 4</span>
              </div>
              <div class="calc-value">
                ${worker.ownerShare} taro
              </div>
            </div>

            <div class="calc-row final-row">
              <div class="calc-label">
                <strong>Tenant Share</strong>
                <span>Remaining balance</span>
              </div>
              <div class="calc-value">
                ${worker.tenantShare} taro
              </div>
            </div>
          </div>

          <div class="worker-total">
            <div>
              <span>Total Harvest</span>
              <strong>${harvestDisplay}</strong>
            </div>

            <div class="worker-total-divider"></div>

            <div>
              <span>Tenant Share</span>
              <strong>${formatTaro(worker.tenantShare)}</strong>
            </div>
          </div>
        </section>
      `;
      })
      .join("");

    const iconAsset = Asset.fromModule(require("../../assets/images/icon.png"));

    await iconAsset.downloadAsync();

    const iconUri = iconAsset.localUri || iconAsset.uri;

    const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />

        <title>${safeTitle}</title>

        <style>
          * {
            box-sizing: border-box;
          }

          @page {
            size: A4;
            margin: 16mm 14mm 18mm 14mm;
          }

          html,
          body {
            margin: 0;
            padding: 0;
            background: #ffffff;
          }

          body {
            font-family:
              -apple-system,
              BlinkMacSystemFont,
              "Segoe UI",
              Arial,
              Helvetica,
              sans-serif;

            color: #253029;
            font-size: 12px;
            line-height: 1.5;
          }

          .report {
            max-width: 820px;
            margin: 0 auto;
          }

          /* =========================
             HEADER
          ========================= */

          .report-header {
            padding-bottom: 18px;
            border-bottom: 2px solid #2F6B3F;
            margin-bottom: 18px;
          }

          .brand-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 20px;
          }

          .brand {
            display: flex;
            align-items: center;
            gap: 12px;
          }

          .brand-mark {
            width: 52px;
            height: 52px;
            border-radius: 12px;
            overflow: hidden;
            flex-shrink: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #ffffff;
            border: 1px solid #dfe7df;
          }

          .brand-mark img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }

          .brand-name {
            margin: 0;
            font-size: 17px;
            font-weight: 800;
            color: #244D30;
            letter-spacing: 0.2px;
          }

          .brand-subtitle {
            margin: 2px 0 0;
            color: #748078;
            font-size: 10px;
          }

          .report-label {
            text-align: right;
            color: #6E786F;
            font-size: 9px;
            font-weight: 700;
            letter-spacing: 1.2px;
            text-transform: uppercase;
          }

          .report-title {
            margin: 20px 0 3px;
            font-size: 25px;
            line-height: 1.15;
            color: #1F3025;
            font-weight: 800;
          }

          .report-name {
            margin: 0;
            color: #5E6A61;
            font-size: 13px;
          }

          .meta-row {
            display: flex;
            justify-content: space-between;
            gap: 20px;
            margin-top: 14px;
            color: #667169;
            font-size: 10px;
          }

          .meta-item strong {
            color: #29362D;
          }

          /* =========================
             SUMMARY
          ========================= */

          .summary-box {
            border: 1px solid #DCE5DD;
            border-radius: 10px;
            overflow: hidden;
            margin-bottom: 20px;
          }

          .summary-header {
            background: #F3F7F2;
            padding: 10px 14px;
            border-bottom: 1px solid #DCE5DD;
          }

          .summary-header h2 {
            margin: 0;
            font-size: 13px;
            color: #244D30;
          }

          .summary-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
          }

          .summary-item {
            padding: 12px 14px;
            border-right: 1px solid #E3E8E3;
          }

          .summary-item:last-child {
            border-right: none;
          }

          .summary-label {
            display: block;
            color: #7A837C;
            font-size: 9px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 3px;
          }

          .summary-value {
            display: block;
            color: #26372C;
            font-size: 15px;
            font-weight: 800;
          }

          .summary-subvalue {
            display: block;
            color: #7A837C;
            font-size: 9px;
            margin-top: 1px;
          }

          /* =========================
             FARM UNIT
          ========================= */

          .unit-box {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 15px;

            background: #F8FAF7;
            border: 1px solid #E1E8E1;
            border-left: 4px solid #2F6B3F;

            border-radius: 7px;
            padding: 10px 13px;
            margin-bottom: 24px;
          }

          .unit-label {
            color: #6E786F;
            font-size: 10px;
          }

          .unit-value {
            color: #244D30;
            font-weight: 800;
            font-size: 12px;
          }

          /* =========================
             WORKER CARD
          ========================= */

          .worker-card {
            border: 1px solid #D9E0DA;
            border-radius: 10px;
            margin-bottom: 18px;
            overflow: hidden;
            page-break-inside: avoid;
            break-inside: avoid;
          }

          .worker-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 15px;

            background: #F5F8F4;
            padding: 13px 15px;

            border-bottom: 1px solid #DCE4DD;
          }

          .worker-number {
            color: #6C786F;
            font-size: 8px;
            font-weight: 800;
            letter-spacing: 1px;
            margin-bottom: 2px;
          }

          .worker-header h2 {
            margin: 0;
            color: #244D30;
            font-size: 17px;
            line-height: 1.2;
          }

          .worker-kahon {
            min-width: 65px;
            text-align: center;
            padding: 6px 9px;
            background: #FFFFFF;
            border: 1px solid #D7E0D8;
            border-radius: 7px;
          }

          .worker-kahon span {
            display: block;
            color: #7A837C;
            font-size: 8px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }

          .worker-kahon strong {
            display: block;
            color: #2F6B3F;
            font-size: 15px;
          }

          /* =========================
             INPUTS
          ========================= */

          .worker-inputs {
            display: grid;
            grid-template-columns: 1fr 1fr;
            border-bottom: 1px solid #E4E8E4;
          }

          .input-item {
            padding: 11px 15px;
          }

          .input-item + .input-item {
            border-left: 1px solid #E4E8E4;
          }

          .input-label {
            display: block;
            color: #7A837C;
            font-size: 9px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 2px;
          }

          .input-item strong {
            display: block;
            color: #26372C;
            font-size: 13px;
          }

          .input-item small {
            color: #879088;
            font-size: 9px;
          }

          /* =========================
             CALCULATIONS
          ========================= */

          .calculation-heading {
            padding: 10px 15px 7px;
            color: #58645B;
            font-size: 9px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.8px;
          }

          .calculation-table {
            padding: 0 15px 10px;
          }

          .calc-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 15px;

            padding: 7px 8px;
            border-bottom: 1px solid #EEF1EE;
          }

          .calc-row:last-child {
            border-bottom: none;
          }

          .calc-label {
            min-width: 0;
          }

          .calc-label strong {
            display: block;
            color: #354239;
            font-size: 10px;
          }

          .calc-label span {
            display: block;
            color: #89928B;
            font-size: 9px;
          }

          .calc-value {
            flex-shrink: 0;
            color: #2D3D32;
            font-size: 10px;
            font-weight: 700;
            text-align: right;
          }

          .muted-row {
            background: #FAFBFA;
          }

          .muted-row .calc-label span {
            color: #788279;
            font-size: 9px;
          }

          .muted-row .calc-value {
            color: #6D786F;
            font-weight: 600;
          }

          .final-row {
            margin-top: 5px;
            padding: 9px 10px;
            background: #F0F6F0;
            border: 1px solid #D6E5D7;
            border-radius: 7px;
          }

          .final-row .calc-label strong {
            color: #245331;
            font-size: 11px;
          }

          .final-row .calc-value {
            color: #245331;
            font-size: 12px;
          }

          /* =========================
             WORKER TOTAL
          ========================= */

          .worker-total {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 25px;

            margin: 0 15px 15px;
            padding: 10px 12px;

            background: #FAFBFA;
            border: 1px solid #E1E7E1;
            border-radius: 7px;
          }

          .worker-total > div:not(.worker-total-divider) {
            text-align: center;
          }

          .worker-total span {
            display: block;
            color: #7A837C;
            font-size: 8px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }

          .worker-total strong {
            display: block;
            color: #2F6B3F;
            font-size: 12px;
            margin-top: 2px;
          }

          .worker-total-divider {
            width: 1px;
            height: 25px;
            background: #DCE3DD;
          }

          /* =========================
             COMPLETE SUMMARY
          ========================= */

          .summary-section {
            margin-top: 28px;
            page-break-before: always;
            break-before: page;
            page-break-inside: avoid;
          }

          .section-heading {
            margin: 0 0 4px;
            color: #213229;
            font-size: 20px;
          }

          .section-description {
            margin: 0 0 15px;
            color: #788279;
            font-size: 10px;
          }

          .summary-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }

          .summary-table th {
            background: #2F6B3F;
            color: #FFFFFF;
            padding: 9px 10px;
            font-size: 9px;
            text-transform: uppercase;
            letter-spacing: 0.4px;
            text-align: left;
          }

          .summary-table td {
            padding: 8px 10px;
            border-bottom: 1px solid #E2E7E3;
            color: #39453D;
            font-size: 10px;
          }

          .summary-table td.number {
            text-align: right;
            font-weight: 700;
          }

          .summary-table tr:nth-child(even) td {
            background: #FAFBFA;
          }

          .summary-table .tenant-row td {
            background: #EEF6EF;
            color: #245331;
            font-weight: 800;
            font-size: 11px;
            border-top: 2px solid #C9DDCB;
          }

          .summary-note {
            padding: 10px 12px;
            background: #F8FAF7;
            border: 1px solid #E1E8E1;
            border-radius: 7px;
            color: #68736B;
            font-size: 9px;
            line-height: 1.5;
          }

          .summary-note strong {
            color: #36463B;
          }

          /* =========================
             SIGNATURES
          ========================= */

          .signature-section {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 60px;
            margin-top: 55px;
            page-break-inside: avoid;
            break-inside: avoid;
          }

          .signature {
            text-align: center;
          }

          .signature-line {
            border-top: 1px solid #69736C;
            margin-bottom: 6px;
          }

          .signature-name {
            color: #354239;
            font-size: 10px;
            font-weight: 700;
          }

          .signature-role {
            color: #879088;
            font-size: 9px;
          }

          /* =========================
             FOOTER
          ========================= */

          .footer {
            margin-top: 35px;
            padding-top: 10px;
            border-top: 1px solid #E0E5E1;
            display: flex;
            justify-content: space-between;
            gap: 20px;

            color: #8A928C;
            font-size: 8px;
          }

          /* =========================
             PRINT
          ========================= */

          @media print {
            body {
              background: #FFFFFF;
            }

            .report {
              max-width: none;
            }

            .worker-card {
              page-break-inside: avoid;
              break-inside: avoid;
            }

            .summary-section {
              page-break-before: always;
              break-before: page;
            }

            .signature-section {
              page-break-inside: avoid;
              break-inside: avoid;
            }

            .summary-table {
              page-break-inside: avoid;
              break-inside: avoid;
            }
          }

          /* =========================
             SMALL SCREEN / PREVIEW
          ========================= */

          @media (max-width: 600px) {
            body {
              font-size: 11px;
            }

            .brand-row,
            .meta-row {
              flex-direction: column;
              align-items: flex-start;
            }

            .report-label {
              text-align: left;
            }

            .summary-grid {
              grid-template-columns: 1fr;
            }

            .summary-item {
              border-right: none;
              border-bottom: 1px solid #E3E8E3;
            }

            .summary-item:last-child {
              border-bottom: none;
            }

            .worker-inputs {
              grid-template-columns: 1fr;
            }

            .input-item + .input-item {
              border-left: none;
              border-top: 1px solid #E4E8E4;
            }

            .signature-section {
              grid-template-columns: 1fr;
              gap: 40px;
            }
          }
        </style>
      </head>

      <body>
        <main class="report">

          <!-- HEADER -->
          <header class="report-header">

            <div class="brand-row">

              <div class="brand">
                <div class="brand-mark">
                  <img
                    src="${iconUri}"
                    alt="Loberanes Farm Calculator"
                  />
                </div>

                <div>
                  <p class="brand-name">
                    Loberanes Farm Calculator
                  </p>

                  <p class="brand-subtitle">
                    Farm Harvest Share Record
                  </p>
                </div>
              </div>

              <div class="report-label">
                Official Calculation Report
              </div>

            </div>

            <h1 class="report-title">
              Farm Share Report
            </h1>

            <p class="report-name">
              ${safeTitle}
            </p>

            <div class="meta-row">
              <div class="meta-item">
                <strong>Date:</strong>
                ${formattedDate}
              </div>

              <div class="meta-item">
                <strong>Mananomay:</strong>
                ${results.length}
              </div>

              <div class="meta-item">
                <strong>Total Harvest:</strong>
                ${formatTaro(totalGross)}
              </div>
            </div>

          </header>

          <!-- QUICK SUMMARY -->
          <section class="summary-box">

            <div class="summary-header">
              <h2>Harvest Overview</h2>
            </div>

            <div class="summary-grid">

              <div class="summary-item">
                <span class="summary-label">
                  Total Harvest
                </span>

                <span class="summary-value">
                  ${formatTaro(totalGross)}
                </span>

                <span class="summary-subvalue">
                  ${totalGross} taro
                </span>
              </div>

              <div class="summary-item">
                <span class="summary-label">
                  Total Owner Share
                </span>

                <span class="summary-value">
                  ${formatTaro(totalOwner)}
                </span>

                <span class="summary-subvalue">
                  ${totalOwner} taro
                </span>
              </div>

              <div class="summary-item">
                <span class="summary-label">
                  Total Tenant Share
                </span>

                <span class="summary-value">
                  ${formatTaro(totalTenant)}
                </span>

                <span class="summary-subvalue">
                  ${totalTenant} taro
                </span>
              </div>

            </div>

          </section>

          <!-- FARM UNIT -->
          <div class="unit-box">

            <span class="unit-label">
              Farm Unit
            </span>

            <span class="unit-value">
              4 taro = 1 sack
            </span>

          </div>

          <!-- WORKER DETAILS -->
          ${workerSections}

          <!-- COMPLETE SUMMARY -->
          <section class="summary-section">

            <h2 class="section-heading">
              Complete Calculation Summary
            </h2>

            <p class="section-description">
              Final distribution of the total harvest based on the
              farm calculation rules.
            </p>

            <table class="summary-table">

              <thead>
                <tr>
                  <th>Category</th>
                  <th style="text-align: right;">
                    Amount (Taro)
                  </th>
                  <th style="text-align: right;">
                    Sacks + Taro
                  </th>
                </tr>
              </thead>

              <tbody>

                <tr>
                  <td>Total Harvest</td>
                  <td class="number">
                    ${totalGross}
                  </td>
                  <td class="number">
                    ${formatTaro(totalGross)}
                  </td>
                </tr>

                <tr>
                  <td>Total Harvester Share</td>
                  <td class="number">
                    ${totalHarvester}
                  </td>
                  <td class="number">
                    ${formatTaro(totalHarvester)}
                  </td>
                </tr>

                <tr>
                  <td>Total Kahon Share</td>
                  <td class="number">
                    ${totalKahon}
                  </td>
                  <td class="number">
                    ${formatTaro(totalKahon)}
                  </td>
                </tr>

                <tr>
                  <td>Total Harvest Share</td>
                  <td class="number">
                    ${totalHarvestShare}
                  </td>
                  <td class="number">
                    ${formatTaro(totalHarvestShare)}
                  </td>
                </tr>

                <tr>
                  <td>Total Mananomay Share</td>
                  <td class="number">
                    ${totalMananomayShare}
                  </td>
                  <td class="number">
                    ${formatTaro(totalMananomayShare)}
                  </td>
                </tr>

                <tr>
                  <td>Total Owner Share</td>
                  <td class="number">
                    ${totalOwner}
                  </td>
                  <td class="number">
                    ${formatTaro(totalOwner)}
                  </td>
                </tr>

                <tr class="tenant-row">
                  <td>Total Tenant Share</td>
                  <td class="number">
                    ${totalTenant}
                  </td>
                  <td class="number">
                    ${formatTaro(totalTenant)}
                  </td>
                </tr>

              </tbody>

            </table>

            <div class="summary-note">
              <strong>Note:</strong>
              All shares are calculated in taro according to the
              configured farm sharing rules. Displayed sack values
              use the standard conversion of 4 taro = 1 sack.
            </div>

            <!-- SIGNATURES -->
            <div class="signature-section">

              <div class="signature">
                <div class="signature-line"></div>
                <div class="signature-name">
                  Tenant / Financer
                </div>
                <div class="signature-role">
                  Signature
                </div>
              </div>

              <div class="signature">
                <div class="signature-line"></div>
                <div class="signature-name">
                  Owner
                </div>
                <div class="signature-role">
                  Signature
                </div>
              </div>

            </div>

          </section>

          <!-- FOOTER -->
          <footer class="footer">

            <span>
              Loberanes Farm Calculator
            </span>

            <span>
              Generated ${formattedDate}
            </span>

          </footer>

        </main>
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

      // Give the browser a moment to finish rendering
      // before opening the print dialog.
      setTimeout(() => {
        printWindow.print();
      }, 300);
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
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
            <Pressable
              style={styles.backButton}
              onPress={() => {
                if (isHistoryView) {
                  router.replace("/history");
                } else {
                  router.replace("/");
                }
              }}
            >
              <Text style={styles.backButtonText}>← Back</Text>
            </Pressable>

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
              const mananomayShare =
                person.fixedKahonShare + person.harvestShare;

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

                        <Text style={styles.kahonText}>
                          {person.kahon} kahon
                        </Text>
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
                          <Text style={styles.breakdownLabel}>
                            Harvest Share
                          </Text>

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
                  <View style={styles.tenantResultBox}>
                    <View>
                      <Text style={styles.tenantResultLabel}>Tenant Share</Text>
                      <Text style={styles.tenantResultDescription}>
                        Remaining share
                      </Text>
                    </View>

                    <View style={styles.tenantResultRight}>
                      <Text style={styles.tenantResultValue}>
                        {formatTaro(person.tenantShare)}
                      </Text>

                      <Text style={styles.tenantTaroValue}>
                        {person.tenantShare} taro
                      </Text>
                    </View>
                  </View>
                </Animated.View>
              );
            })}

            {/* Complete Total */}
            <Animated.View
              style={[
                styles.totalCard,
                {
                  opacity: totalFade,
                  transform: [{ translateY: totalSlide }],
                },
              ]}
            >
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
              {/* Total Mananomay Share */}
              <View style={styles.totalShareBox}>
                <Pressable
                  style={styles.totalShareButton}
                  onPress={() =>
                    setIsTotalMananomayExpanded(!isTotalMananomayExpanded)
                  }
                >
                  <View style={styles.totalShareTextContainer}>
                    <View>
                      <Text style={styles.totalShareLabel}>
                        Total Mananomay Share
                      </Text>

                      <Text style={styles.totalShareDescription}>
                        Kahon + harvest shares
                      </Text>
                    </View>

                    <View style={styles.totalShareRight}>
                      <Text style={styles.totalShareValue}>
                        {formatTaro(totalMananomayShare)}
                      </Text>

                      <Text style={styles.totalShareArrow}>
                        {isTotalMananomayExpanded ? "▲" : "▼"}
                      </Text>
                    </View>
                  </View>
                </Pressable>

                {/* Individual Mananomay Shares */}
                {isTotalMananomayExpanded && (
                  <View style={styles.totalShareBreakdown}>
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
              </View>

              {/* Total Owner */}
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Total Owner</Text>

                <Text style={styles.resultValue}>{formatTaro(totalOwner)}</Text>
              </View>

              {/* Total Tenant */}
              <View style={styles.totalTenantBox}>
                <View>
                  <Text style={styles.totalTenantLabel}>
                    Total Tenant Share
                  </Text>

                  <Text style={styles.totalTenantDescription}>
                    Final remaining share
                  </Text>
                </View>

                <View style={styles.totalTenantRight}>
                  <Text style={styles.totalTenantValue}>
                    {formatTaro(totalTenant)}
                  </Text>

                  <Text style={styles.totalTenantTaro}>{totalTenant} taro</Text>
                </View>
              </View>
            </Animated.View>

            {/* Save to History */}
            {!hasBeenSaved && !showNameInput && (
              <AnimatedActionButton
                style={styles.saveButton}
                onPress={() => setShowNameInput(true)}
              >
                <View style={styles.actionButtonContent}>
                  <MaterialCommunityIcons
                    name="content-save-outline"
                    size={21}
                    color="#2F6B3F"
                  />

                  <Text style={styles.saveButtonText}>Save to History</Text>
                </View>
              </AnimatedActionButton>
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
                  onFocus={() => {
                    setFocusedNameInput(true);

                    setTimeout(() => {
                      scrollViewRef.current?.scrollToEnd({
                        animated: true,
                      });
                    }, 300);
                  }}
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

                  <AnimatedActionButton
                    style={styles.confirmSaveButton}
                    onPress={handleSave}
                  >
                    <View style={styles.actionButtonContent}>
                      <MaterialCommunityIcons
                        name="content-save-outline"
                        size={20}
                        color="#FFFFFF"
                      />

                      <Text style={styles.confirmSaveButtonText}>Save</Text>
                    </View>
                  </AnimatedActionButton>
                </View>
              </View>
            )}

            <AnimatedActionButton
              style={styles.printButton}
              onPress={handlePrint}
            >
              <View style={styles.actionButtonContent}>
                <MaterialCommunityIcons
                  name="printer-outline"
                  size={21}
                  color="#2F6B3F"
                />

                <Text style={styles.printButtonText}>Print Calculation</Text>
              </View>
            </AnimatedActionButton>

            {/* New Calculation */}
            {!isHistoryView && (
              <AnimatedActionButton
                style={styles.newButton}
                onPress={() => router.replace("/")}
              >
                <View style={styles.actionButtonContent}>
                  <MaterialCommunityIcons
                    name="plus-circle-outline"
                    size={22}
                    color="#FFFFFF"
                  />

                  <Text style={styles.newButtonText}>New Calculation</Text>
                </View>
              </AnimatedActionButton>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 24,
  },

  content: {
    width: "100%",
    maxWidth: 600,
    alignSelf: "center",
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 24,
  },

  // -------------------------
  // Back Button
  // -------------------------

  backButton: {
    alignSelf: "flex-start",
    marginBottom: 8,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },

  backButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#2F6B3F",
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

  tenantResultBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",

    marginTop: 14,
    paddingTop: 14,
    paddingBottom: 14,
    paddingHorizontal: 14,

    backgroundColor: "#E5F1E8",
    borderWidth: 1,
    borderColor: "#CFE0D2",
    borderRadius: 12,
  },

  tenantResultLabel: {
    fontSize: 16,
    fontWeight: "800",
    color: "#2F6B3F",
  },

  tenantResultDescription: {
    fontSize: 12,
    color: "#66736A",
    marginTop: 3,
  },

  tenantResultRight: {
    alignItems: "flex-end",
    marginLeft: 12,
  },

  tenantResultValue: {
    fontSize: 17,
    fontWeight: "800",
    color: "#2F6B3F",
    textAlign: "right",
  },

  tenantTaroValue: {
    fontSize: 11,
    color: "#66736A",
    marginTop: 2,
  },

  totalTenantBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",

    marginTop: 14,
    paddingTop: 15,
    paddingBottom: 15,
    paddingHorizontal: 14,

    backgroundColor: "#E5F1E8",
    borderWidth: 1,
    borderColor: "#CFE0D2",
    borderRadius: 12,
  },

  totalTenantLabel: {
    fontSize: 17,
    fontWeight: "800",
    color: "#2F6B3F",
  },

  totalTenantDescription: {
    fontSize: 12,
    color: "#66736A",
    marginTop: 3,
  },

  totalTenantRight: {
    alignItems: "flex-end",
    marginLeft: 12,
  },

  totalTenantValue: {
    fontSize: 18,
    fontWeight: "800",
    color: "#2F6B3F",
    textAlign: "right",
  },

  totalTenantTaro: {
    fontSize: 11,
    color: "#66736A",
    marginTop: 2,
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

  totalShareBox: {
    backgroundColor: "#F0F6F1",
    borderWidth: 1,
    borderColor: "#D5E5D8",
    borderRadius: 12,
    marginTop: 4,
    marginBottom: 4,
    overflow: "hidden",
  },

  totalShareButton: {
    paddingVertical: 13,
    paddingHorizontal: 12,
  },

  totalShareTextContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  totalShareLabel: {
    fontSize: 15,
    fontWeight: "800",
    color: "#2F6B3F",
  },

  totalShareDescription: {
    fontSize: 12,
    color: "#66736A",
    marginTop: 2,
  },

  totalShareRight: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 10,
  },

  totalShareValue: {
    fontSize: 15,
    fontWeight: "800",
    color: "#2F6B3F",
  },

  totalShareArrow: {
    fontSize: 12,
    fontWeight: "800",
    color: "#2F6B3F",
    marginLeft: 8,
  },

  totalShareBreakdown: {
    paddingHorizontal: 12,
    paddingBottom: 10,
    paddingTop: 2,
    borderTopWidth: 1,
    borderTopColor: "#D5E5D8",
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

  actionButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    paddingHorizontal: 15,
  },

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
