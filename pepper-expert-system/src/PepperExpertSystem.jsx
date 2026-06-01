import { useState } from "react";

// ================================================================
// KNOWLEDGE BASE  —  Karmila et al., TEPIAN 2021 (Tabel 2, 3, 4)
// ================================================================

const DISEASES = {
  P1:  { name: "Stem Rot Disease",             weight: 0.7 },
  P2:  { name: "Jaundice",                      weight: 0.6 },
  P3:  { name: "Curly and Dwarf Disease",       weight: 0.7 },
  P4:  { name: "Pepper Peel Fungus Disease",    weight: 0.6 },
  P5:  { name: "Marasmius Fungal Disease",      weight: 0.5 },
  P6:  { name: "Pepper Blonde Disease",         weight: 0.7 },
  P7:  { name: "Pepper Leaf Spot Disease",      weight: 0.6 },
  P8:  { name: "Pepper Leaf Red Rust Disease",  weight: 0.5 },
  P9:  { name: "Black Pepper Fruit Disease",    weight: 0.5 },
  P10: { name: "Pepper Root Rot Disease",       weight: 0.7 },
};

const SYMPTOMS = {
  G1:  { name: "Slimy rod blackish-blue color",                               weight: 0.6 },
  G2:  { name: "There is mucus on the pepper",                                weight: 0.4 },
  G3:  { name: "Pepper leaves are pale yellow",                               weight: 0.2 },
  G4:  { name: "Leaves turn yellow",                                          weight: 0.4 },
  G5:  { name: "Pepper root broken",                                          weight: 0.6 },
  G6:  { name: "There are golden feathers on the pepper",                     weight: 0.4 },
  G7:  { name: "The disease does not kill plants but inhibits the growth",    weight: 0.4 },
  G8:  { name: "Curly pepper leaf",                                           weight: 0.4 },
  G9:  { name: "Peppers are smaller in size",                                 weight: 0.6 },
  G10: { name: "The spot has circles with a center",                          weight: 0.4 },
  G11: { name: "Leaves curled upward, curly and mottled",                     weight: 0.6 },
  G12: { name: "Plant growth stunted",                                        weight: 0.6 },
  G13: { name: "Leaves dry",                                                  weight: 0.2 },
  G14: { name: "Pepper branches and stems have white shiny mushroom threads", weight: 0.4 },
  G15: { name: "There is a white thread",                                     weight: 0.6 },
  G16: { name: "Leaves dry and dead",                                         weight: 0.1 },
  G17: { name: "Fruit size is relatively smaller than normal",                weight: 0.6 },
  G18: { name: "Branches and twigs covered in silvery mushroom",              weight: 0.6 },
  G19: { name: "There is Septosidium fungus in all parts of the plant",       weight: 0.6 },
  G20: { name: "Pepper leaf gray spot",                                       weight: 0.6 },
  G21: { name: "Presence of spots in the middle or on the edges of leaves",   weight: 0.4 },
  G22: { name: "Brown spot pepper leaves",                                    weight: 0.6 },
  G23: { name: "Black spot pepper leaves",                                    weight: 0.4 },
  G24: { name: "Leaves have reddish-green spots",                             weight: 0.4 },
  G25: { name: "Pepper fruit has small spots",                                weight: 0.6 },
  G26: { name: "There are black spots on the pepper fruit",                   weight: 0.4 },
  G27: { name: "Pepper root rot",                                             weight: 0.6 },
  G28: { name: "There is bluish mucus on the roots",                          weight: 0.4 },
  G29: { name: "Black pepper root",                                           weight: 0.2 },
};

// Rule Base — Table 4:  IF (symptoms)  THEN  disease
const RULES = {
  P1:  ["G1", "G2", "G3"],
  P2:  ["G4", "G5", "G6"],
  P3:  ["G3", "G7", "G8", "G9", "G10", "G11", "G12"],
  P4:  ["G13", "G14"],
  P5:  ["G15", "G16"],
  P6:  ["G17", "G18", "G19"],
  P7:  ["G4", "G10", "G20", "G21", "G22", "G23"],
  P8:  ["G24"],
  P9:  ["G9", "G25", "G26"],
  P10: ["G27", "G28", "G29"],
};

// User certainty levels — Table 1
const CERTAINTY_LEVELS = [
  { label: "Very Confident", value: 1.00 },
  { label: "Convinced",      value: 0.75 },
  { label: "Not Sure",       value: 0.50 },
  { label: "Doubtful",       value: 0.25 },
];

// ================================================================
// INFERENCE ENGINE — CERTAINTY FACTOR
// ================================================================

/**
 * Sequential CF combination formula (paper eq. 2):
 *   CFcombine = CF1 + CF2 * (1 - CF1)
 */
function combineCF(cf1, cf2) {
  return cf1 + cf2 * (1 - cf1);
}

/**
 * Calculate Certainty Factor for one disease given user-selected symptoms.
 *
 * @param {string}  diseaseCode       e.g. "P1"
 * @param {Object}  selectedSymptoms  { G1: 0.75, G3: 0.5, ... }  (0 = not selected)
 * @returns {Object} Full CF result — including intermediate steps for the Explanation Facility.
 *
 * Shape of returned object:
 * {
 *   diseaseCode,   diseaseName,
 *   combinedCF,    percentage,
 *   matchedCodes,                 // ["G1","G3"] — symptoms that matched this disease's rule
 *   symptomCFs: [{                // per-symptom breakdown
 *     code, name,
 *     cfHE,  // CF(H,E)  — expert weight from knowledge base
 *     cfEe,  // CF(E,e)  — user-supplied certainty
 *     cfHe,  // CF(H,e)  = cfHE * cfEe  — final CF per symptom
 *   }],
 *   combinationSteps: [{          // sequential combination log
 *     step, description, result
 *   }],
 * }
 */
function calculateCFForDisease(diseaseCode, selectedSymptoms) {
  const ruleSymptoms = RULES[diseaseCode];

  const matchedCodes = ruleSymptoms.filter(
    (g) => selectedSymptoms[g] !== undefined && selectedSymptoms[g] > 0
  );

  if (matchedCodes.length === 0) {
    return {
      diseaseCode,
      diseaseName: DISEASES[diseaseCode].name,
      combinedCF: 0,
      percentage: 0,
      matchedCodes: [],
      symptomCFs: [],
      combinationSteps: [],
    };
  }

  // CF(H,e) = CF(H,E) × CF(E,e)
  const symptomCFs = matchedCodes.map((g) => {
    const cfHE = SYMPTOMS[g].weight;
    const cfEe = selectedSymptoms[g];
    return { code: g, name: SYMPTOMS[g].name, cfHE, cfEe, cfHe: cfHE * cfEe };
  });

  // Sequential combination with a full log (for Explanation Facility team)
  const combinationSteps = [];
  let combined = symptomCFs[0].cfHe;
  combinationSteps.push({
    step: 1,
    description: `CF_${symptomCFs[0].code} = CF(H,E)×CF(E,e) = ${symptomCFs[0].cfHE}×${symptomCFs[0].cfEe}`,
    result: combined,
  });

  for (let i = 1; i < symptomCFs.length; i++) {
    const prev = combined;
    combined = combineCF(prev, symptomCFs[i].cfHe);
    combinationSteps.push({
      step: i + 1,
      description:
        `CFcombine(CF_old=${prev.toFixed(4)}, CF_${symptomCFs[i].code}=${symptomCFs[i].cfHe.toFixed(4)}) ` +
        `= ${prev.toFixed(4)} + ${symptomCFs[i].cfHe.toFixed(4)} × (1 - ${prev.toFixed(4)})`,
      result: combined,
    });
  }

  return {
    diseaseCode,
    diseaseName: DISEASES[diseaseCode].name,
    combinedCF: parseFloat(combined.toFixed(4)),
    percentage: parseFloat((combined * 100).toFixed(2)),
    matchedCodes,
    symptomCFs,
    combinationSteps,
  };
}


// ================================================================
// EXPLANATION FACILITY COMPONENT
// ================================================================
//
// ┌─────────────────────────────────────────────────────────────┐
// │  UNTUK TIM EXPLANATION FACILITY — baca ini dulu!            │
// ├─────────────────────────────────────────────────────────────┤
// │  Props yang tersedia:                                        │
// │                                                             │
// │  diagnosisData: {                                           │
// │    selectedSymptoms: { "G1": 0.75, "G3": 0.5, ... },       │
// │                                                             │
// │    cfResults: {                                             │
// │      "P1": {                                                │
// │        diseaseCode, diseaseName,                            │
// │        combinedCF,    // nilai CF akhir (0–1)               │
// │        percentage,    // CF × 100                           │
// │        matchedCodes,  // ["G1","G2"] — gejala yang cocok   │
// │        symptomCFs: [{                                       │
// │          code, name,                                        │
// │          cfHE,  // bobot pakar CF(H,E)                      │
// │          cfEe,  // keyakinan user CF(E,e)                   │
// │          cfHe,  // hasil: cfHE × cfEe                       │
// │        }],                                                  │
// │        combinationSteps: [{                                 │
// │          step,                                              │
// │          description,  // "CFcombine(CF_old=... , ...)"     │
// │          result,       // nilai CF setelah kombinasi ini    │
// │        }],                                                  │
// │      },                                                     │
// │      "P2": { ... }, ...                                     │
// │    },                                                       │
// │                                                             │
// │    sortedCF: [...],  // cfResults[] sorted by percentage ↓  │
// │    timestamp: "...",                                         │
// │  }                                                          │
// │                                                             │
// │  SARAN KONTEN:                                              │
// │  1. Rule trace — rule mana yang aktif                       │
// │  2. CF step-by-step — pakai combinationSteps[]              │
// │  3. Kontribusi gejala — pakai symptomCFs[]                  │
// │  4. "Kenapa penyakit ini?" — bandingkan top 3               │
// └─────────────────────────────────────────────────────────────┘

function ExplanationFacility({ diagnosisData }) {
  // ───────────── IMPLEMENTATION STARTS HERE ─────────────────────

  if (!diagnosisData) {
    return (
      <div style={S.efEmpty}>
        Jalankan diagnosis terlebih dahulu untuk melihat penjelasan.
      </div>
    );
  }

  // DEV REFERENCE: hapus blok ini setelah implementasi selesai
  return (
    <div style={S.efDevBox}>
      <p style={{ fontWeight: 700, color: "#e65100", marginTop: 0, marginBottom: 8 }}>
        [DEV REF] Data yang tersedia untuk tim Explanation Facility:
      </p>
      <pre style={S.devPre}>
        {JSON.stringify(
          {
            selectedSymptoms: diagnosisData.selectedSymptoms,
            topCF: diagnosisData.sortedCF[0]
              ? {
                  disease: diagnosisData.sortedCF[0].diseaseName,
                  percentage: `${diagnosisData.sortedCF[0].percentage}%`,
                  matchedCodes: diagnosisData.sortedCF[0].matchedCodes,
                  symptomCFs: diagnosisData.sortedCF[0].symptomCFs,
                  combinationSteps: diagnosisData.sortedCF[0].combinationSteps,
                }
              : null,
          },
          null,
          2
        )}
      </pre>
      <p style={{ color: "#795548", fontSize: 12, marginBottom: 0 }}>
        Ganti seluruh konten ExplanationFacility() ini dengan implementasi kalian.
      </p>
    </div>
  );

  // ───────────── IMPLEMENTATION ENDS HERE ───────────────────────
}

// ================================================================
// MAIN COMPONENT
// ================================================================
export default function PepperExpertSystem() {
  const [selected, setSelected] = useState({});
  const [diagnosisData, setDiagnosisData] = useState(null);
  const handleChange = (gCode, val) => {
    setSelected((prev) => ({ ...prev, [gCode]: parseFloat(val) }));
  };

  const handleDiagnose = () => {
    const hasAny = Object.values(selected).some((v) => v > 0);
    if (!hasAny) {
      alert("Pilih minimal satu gejala terlebih dahulu.");
      return;
    }

    // Run CF for every disease
    const cfResults = {};
    Object.keys(DISEASES).forEach((p) => {
      cfResults[p] = calculateCFForDisease(p, selected);
    });

    const sortedCF = Object.values(cfResults).sort((a, b) => b.percentage - a.percentage);

    setDiagnosisData({
      selectedSymptoms: { ...selected },
      cfResults,
      sortedCF,
      timestamp: new Date().toLocaleString("id-ID"),
    });
  };

  const handleReset = () => {
    setSelected({});
    setDiagnosisData(null);
  };

  const selectedCount = Object.values(selected).filter((v) => v > 0).length;

  return (
    <div style={S.root}>

      {/* ── HEADER ── */}
      <div style={S.header}>
        <h1 style={S.h1}>Expert System: Pepper Plant Disease Diagnosis</h1>
        <p style={S.subtitle}>
          Method: Certainty Factor (CF) &nbsp;|&nbsp;
          Based on: Karmila, Maria E., Annafi Franz — TEPIAN 2021
        </p>
      </div>

      {/* ══════════════════════════════════════════════════════════
          SYMPTOM SELECTION
          ══════════════════════════════════════════════════════════ */}
      <section style={S.section}>
        <h2 style={S.h2}>Step 1 — Select Symptoms</h2>
        <p style={S.hint}>
          Check all symptoms observed and select your certainty level.
          &nbsp;({selectedCount} / {Object.keys(SYMPTOMS).length} selected)
        </p>

        <div style={S.tableWrap}>
          <table style={S.table}>
            <thead>
              <tr>
                <th style={{ ...S.th, width: 52 }}>Code</th>
                <th style={S.th}>Symptom Name</th>
                <th style={{ ...S.th, width: 68, textAlign: "center" }}>Weight</th>
                <th style={{ ...S.th, width: 200 }}>Certainty Level (CF E,e)</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(SYMPTOMS).map(([code, sym]) => {
                const isSel = selected[code] > 0;
                return (
                  <tr key={code} style={isSel ? S.rowSel : {}}>
                    <td style={{ ...S.td, fontWeight: 700, color: "#2e7d32" }}>{code}</td>
                    <td style={S.td}>{sym.name}</td>
                    <td style={{ ...S.td, textAlign: "center", color: "#666" }}>{sym.weight}</td>
                    <td style={S.td}>
                      <select
                        value={selected[code] || 0}
                        onChange={(e) => handleChange(code, e.target.value)}
                        style={S.select}
                      >
                        <option value={0}>— Not Selected —</option>
                        {CERTAINTY_LEVELS.map((lvl) => (
                          <option key={lvl.value} value={lvl.value}>
                            {lvl.label} ({lvl.value})
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div style={S.btnRow}>
          <button onClick={handleDiagnose} style={S.btnPrimary}>
            Diagnose
          </button>
          <button onClick={handleReset} style={S.btnGray}>
            Reset
          </button>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          DIAGNOSIS RESULTS
          ══════════════════════════════════════════════════════════ */}
      {diagnosisData && (
        <section style={S.section}>
          <h2 style={S.h2}>Step 2 — Diagnosis Results</h2>
          <p style={S.hint}>Diagnosed at: {diagnosisData.timestamp}</p>

          {/* Summary banner */}
          <div style={S.banner}>
            <span style={S.bannerLabel}>Top Diagnosis: </span>
            <span style={S.bannerVal}>
              {diagnosisData.sortedCF[0]?.percentage > 0
                ? `${diagnosisData.sortedCF[0].diseaseName} — ${diagnosisData.sortedCF[0].percentage}%`
                : "No matching disease found"}
            </span>
          </div>

          {/* CF Results Table */}
          <h3 style={S.h3}>Certainty Factor Results — all diseases</h3>
          <div style={S.tableWrap}>
            <table style={S.table}>
              <thead>
                <tr>
                  <th style={{ ...S.th, width: 48, textAlign: "center" }}>Rank</th>
                  <th style={{ ...S.th, width: 58 }}>Code</th>
                  <th style={S.th}>Disease Name</th>
                  <th style={{ ...S.th, width: 90, textAlign: "center" }}>CF Value</th>
                  <th style={{ ...S.th, width: 110, textAlign: "center" }}>Percentage</th>
                  <th style={{ ...S.th, width: 170 }}>Matched Symptoms</th>
                </tr>
              </thead>
              <tbody>
                {diagnosisData.sortedCF.map((r, idx) => (
                  <tr key={r.diseaseCode} style={idx === 0 && r.percentage > 0 ? S.rowTop : {}}>
                    <td style={{ ...S.td, textAlign: "center" }}>{idx + 1}</td>
                    <td style={{ ...S.td, fontWeight: 700 }}>{r.diseaseCode}</td>
                    <td style={{ ...S.td, fontWeight: idx === 0 && r.percentage > 0 ? 700 : 400 }}>
                      {r.diseaseName}
                    </td>
                    <td style={{ ...S.td, textAlign: "center" }}>{r.combinedCF}</td>
                    <td style={{ ...S.td, textAlign: "center" }}>
                      <span style={{ color: r.percentage > 0 ? "#2e7d32" : "#bbb", fontWeight: r.percentage > 0 ? 700 : 400 }}>
                        {r.percentage}%
                      </span>
                    </td>
                    <td style={{ ...S.td, fontSize: 12, color: "#555" }}>
                      {r.matchedCodes.length > 0 ? r.matchedCodes.join(", ") : <span style={{ color: "#ccc" }}>—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════════════════════
          EXPLANATION FACILITY SECTION
          ── This entire section is reserved for the EF team ──
          ══════════════════════════════════════════════════════════ */}
      <section style={S.section} id="explanation-facility">
        <div style={S.efTitleRow}>
          <h2 style={{ ...S.h2, margin: 0 }}>Explanation Facility</h2>
          <span style={S.efBadge}>Tim Explanation Facility</span>
        </div>
        <p style={{ ...S.hint, marginTop: 8 }}>
          Bagian ini menjelaskan HOW &amp; WHY sistem mencapai kesimpulan tersebut — 
          termasuk step-by-step perhitungan CF, trace rule, dan kontribusi tiap gejala terhadap diagnosis.
        </p>

        {/*
         * ╔══════════════════════════════════════════════════════════╗
         * ║  ZONA KERJA TIM EXPLANATION FACILITY                    ║
         * ║  Ubah komponen ExplanationFacility() di atas.           ║
         * ║  Semua data sudah tersedia di prop `diagnosisData`.      ║
         * ╚══════════════════════════════════════════════════════════╝
         */}
        <ExplanationFacility diagnosisData={diagnosisData} />
      </section>

      {/* ── FOOTER ── */}
      <footer style={S.footer}>
        Karmila, Maria E., &amp; Annafi' Franz (2021).{" "}
        <em>Expert System for Diagnosis of Pepper Plant Diseases Using Certainty Factor and Naïve Bayes Methods.</em>{" "}
        TEPIAN, 2(4). https://doi.org/10.51967/tepian.v2i4.744
      </footer>
    </div>
  );
}

// ================================================================
// STYLES  —  Functional & clean (UI akan diimprove oleh tim UI)
// ================================================================
const S = {
  root:     { fontFamily: "Arial, sans-serif", maxWidth: 980, margin: "0 auto", padding: "20px 16px", fontSize: 14, color: "#212121", lineHeight: 1.5 },
  header:   { borderBottom: "2px solid #388e3c", paddingBottom: 12, marginBottom: 20 },
  h1:       { margin: 0, fontSize: 22, fontWeight: 700, color: "#1b5e20" },
  h2:       { margin: "0 0 10px", fontSize: 17, fontWeight: 700, color: "#2e7d32" },
  h3:       { margin: "0 0 10px", fontSize: 15, fontWeight: 600, color: "#333" },
  subtitle: { margin: "4px 0 0", fontSize: 12, color: "#777" },
  hint:     { margin: "0 0 10px", fontSize: 13, color: "#666" },
  section:  { marginTop: 24, padding: 16, border: "1px solid #ddd", borderRadius: 6, backgroundColor: "#fafafa" },
  tableWrap:{ overflowX: "auto" },
  table:    { width: "100%", borderCollapse: "collapse", fontSize: 13 },
  th:       { border: "1px solid #bbb", padding: "6px 8px", backgroundColor: "#e8f5e9", fontWeight: 700, textAlign: "left", whiteSpace: "nowrap" },
  td:       { border: "1px solid #e0e0e0", padding: "5px 8px", verticalAlign: "middle" },
  rowSel:   { backgroundColor: "#f1f8e9" },
  rowTop:   { backgroundColor: "#c8e6c9" },
  select:   { width: "100%", padding: "3px 4px", fontSize: 13, border: "1px solid #ccc", borderRadius: 3 },
  btnRow:   { display: "flex", gap: 10, marginTop: 14 },
  btnPrimary:  { padding: "8px 22px", backgroundColor: "#2e7d32", color: "white", border: "none", borderRadius: 4, fontSize: 14, cursor: "pointer", fontWeight: 700 },
  btnGray:     { padding: "8px 22px", backgroundColor: "#757575", color: "white", border: "none", borderRadius: 4, fontSize: 14, cursor: "pointer" },
  banner:   { backgroundColor: "#e8f5e9", border: "1px solid #a5d6a7", borderRadius: 4, padding: "10px 14px", marginBottom: 14 },
  bannerLabel: { fontSize: 12, color: "#555", fontWeight: 700, marginRight: 6 },
  bannerVal:   { fontSize: 14, fontWeight: 600, color: "#1b5e20" },
  tabBar:   { display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" },
  tab:      { padding: "6px 16px", backgroundColor: "#e0e0e0", color: "#333", border: "none", borderRadius: 4, cursor: "pointer", fontSize: 13 },
  tabActive:{ padding: "6px 16px", backgroundColor: "#2e7d32", color: "white", border: "none", borderRadius: 4, cursor: "pointer", fontSize: 13, fontWeight: 700 },
  // Explanation Facility section
  efTitleRow: { display: "flex", alignItems: "center", gap: 12, marginBottom: 4, flexWrap: "wrap" },
  efBadge:    { fontSize: 11, backgroundColor: "#fff3e0", color: "#e65100", border: "1px solid #ffcc80", padding: "2px 10px", borderRadius: 12, fontWeight: 700 },
  efEmpty:    { padding: 20, textAlign: "center", color: "#795548", backgroundColor: "#fff8e1", border: "2px dashed #ffb74d", borderRadius: 6 },
  efDevBox:   { border: "2px dashed #ffb74d", borderRadius: 6, padding: 16, backgroundColor: "#fff8e1", marginTop: 8 },
  devPre:     { backgroundColor: "#f5f5f5", border: "1px solid #ddd", borderRadius: 4, padding: 10, fontSize: 11, overflow: "auto", maxHeight: 240, margin: "8px 0" },
  footer:     { marginTop: 28, paddingTop: 10, borderTop: "1px solid #eee", fontSize: 11, color: "#aaa", textAlign: "center" },
};
