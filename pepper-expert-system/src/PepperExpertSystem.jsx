import { useState } from "react";
import {
  DISEASES,
  SYMPTOMS,
  RULES,
  CERTAINTY_LEVELS,
  FORWARD_SYMPTOMS,
  calculateCFForDisease,
  calculateDS,
  getNextQuestion,
  shouldTerminateEarly,
  MAX_QUESTIONS
} from "./rule.js";
import ExplanationFacility from "./ExplanationFacility.jsx";

// ================================================================
// STYLES — Komponen Utama
// ================================================================
const S = {
  root:        { fontFamily: "Arial, sans-serif", maxWidth: 980, margin: "0 auto", padding: "20px 16px", fontSize: 14, color: "#212121", lineHeight: 1.5 },
  header:      { borderBottom: "2px solid #388e3c", paddingBottom: 12, marginBottom: 20 },
  h1:          { margin: 0, fontSize: 22, fontWeight: 700, color: "#1b5e20" },
  h2:          { margin: "0 0 10px", fontSize: 17, fontWeight: 700, color: "#2e7d32" },
  h3:          { margin: "0 0 10px", fontSize: 15, fontWeight: 600, color: "#333" },
  subtitle:    { margin: "4px 0 0", fontSize: 12, color: "#777" },
  hint:        { margin: "0 0 10px", fontSize: 13, color: "#666" },
  section:     { marginTop: 24, padding: 16, border: "1px solid #ddd", borderRadius: 6, backgroundColor: "#fafafa" },
  tableWrap:   { overflowX: "auto" },
  table:       { width: "100%", borderCollapse: "collapse", fontSize: 13 },
  th:          { border: "1px solid #bbb", padding: "6px 8px", backgroundColor: "#e8f5e9", fontWeight: 700, textAlign: "left", whiteSpace: "nowrap" },
  td:          { border: "1px solid #e0e0e0", padding: "5px 8px", verticalAlign: "middle" },
  rowSel:      { backgroundColor: "#f1f8e9" },
  rowTop:      { backgroundColor: "#c8e6c9" },
  select:      { width: "100%", padding: "3px 4px", fontSize: 13, border: "1px solid #ccc", borderRadius: 3 },
  btnRow:      { display: "flex", gap: 10, marginTop: 14 },
  btnPrimary:  { padding: "8px 22px", backgroundColor: "#2e7d32", color: "white", border: "none", borderRadius: 4, fontSize: 14, cursor: "pointer", fontWeight: 700 },
  btnGray:     { padding: "8px 22px", backgroundColor: "#757575", color: "white", border: "none", borderRadius: 4, fontSize: 14, cursor: "pointer" },
  banner:      { backgroundColor: "#e8f5e9", border: "1px solid #a5d6a7", borderRadius: 4, padding: "10px 14px", marginBottom: 14 },
  bannerLabel: { fontSize: 12, color: "#555", fontWeight: 700, marginRight: 6 },
  bannerVal:   { fontSize: 14, fontWeight: 600, color: "#1b5e20" },
  efTitleRow:  { display: "flex", alignItems: "center", gap: 12, marginBottom: 4, flexWrap: "wrap" },
  efBadge:     { fontSize: 11, backgroundColor: "#e8f5e9", color: "#2e7d32", border: "1px solid #81c784", padding: "2px 10px", borderRadius: 12, fontWeight: 700 },
  footer:      { marginTop: 28, paddingTop: 10, borderTop: "1px solid #eee", fontSize: 11, color: "#aaa", textAlign: "center" },
};

// ================================================================
// KOMPONEN UTAMA: PepperExpertSystem
// Mengelola state pemilihan gejala dan menampilkan hasil diagnosis.
// ================================================================
export default function PepperExpertSystem() {
  const [flowState, setFlowState] = useState("INITIAL");
  const [answeredSymptoms, setAnsweredSymptoms] = useState({});
  const [diagnosisData, setDiagnosisData] = useState(null);
  const [initialAnswers, setInitialAnswers] = useState({
    G9: 0, G4: 0, G10: 0, G1: 0, G3: 0
  });
  const [questionCount, setQuestionCount] = useState(0);

  // ── Handler ──────────────────────────────────────────────────
  const handleStartInvestigation = () => {
    const hasPositive = Object.values(initialAnswers).some(v => v > 0);
    if (!hasPositive) return alert("Harap pilih minimal satu gejala yang dialami.");

    setAnsweredSymptoms(initialAnswers);
    setQuestionCount(5);

    const cfResults = {};
    Object.keys(DISEASES).forEach((p) => { cfResults[p] = calculateCFForDisease(p, initialAnswers); });
    const sortedCF = Object.values(cfResults).sort((a, b) => b.percentage - a.percentage);
    const topCF = sortedCF.length > 0 ? sortedCF[0].percentage : 0;

    if (topCF >= 80) {
      finalizeDiagnosis(initialAnswers);
    } else {
      setFlowState("QUESTIONING");
    }
  };

  const handleAnswerQuestion = (symCode, cfValue) => {
    const newAnswered = { ...answeredSymptoms, [symCode]: cfValue };
    const newCount = questionCount + 1;
    setAnsweredSymptoms(newAnswered);
    setQuestionCount(newCount);

    if (shouldTerminateEarly(newAnswered) || newCount >= MAX_QUESTIONS) {
      finalizeDiagnosis(newAnswered);
      return;
    }

    const nextQ = getNextQuestion(newAnswered);
    if (!nextQ) finalizeDiagnosis(newAnswered);
  };

  const finalizeDiagnosis = (answersToUse = answeredSymptoms) => {
    const cfResults = {};
    Object.keys(DISEASES).forEach((p) => { cfResults[p] = calculateCFForDisease(p, answersToUse); });
    const sortedCF = Object.values(cfResults).sort((a, b) => b.percentage - a.percentage);
    const dsResults = calculateDS(answersToUse);

    setDiagnosisData({ selectedSymptoms: answersToUse, cfResults, sortedCF, dsResults, timestamp: new Date().toLocaleString("id-ID") });
    setFlowState("RESULT");
  };

  const handleReset = () => {
    setFlowState("INITIAL"); setAnsweredSymptoms({}); setDiagnosisData(null);
    setInitialAnswers({ G9: 0, G4: 0, G10: 0, G1: 0, G3: 0 }); setQuestionCount(0);
  };

  // ── Render ───────────────────────────────────────────────────
  let content;
  
  if (flowState === "INITIAL") {
    // LAYAR 1: 5 Gejala Paling Signifikan
    content = (
      <section style={S.section}>
        <h2 style={S.h2}>Langkah 1: Pilih Gejala yang Dialami</h2>
        <p style={S.hint}>Pilih tingkat keyakinan untuk setiap gejala berikut:</p>
        <div style={S.card}>
          {FORWARD_SYMPTOMS.map(code => (
            <div key={code} style={{ marginBottom: 10, padding: 8, border: "1px solid #e0e0e0", borderRadius: 4 }}>
              <label style={{ display: "block", marginBottom: 4, fontWeight: "bold", fontSize: 13 }}>
                [{code}] {SYMPTOMS[code].name}
              </label>
              <select value={initialAnswers[code]} onChange={(e) => setInitialAnswers(prev => ({...prev, [code]: parseFloat(e.target.value)}))} style={S.select}>
                <option value={0}>Tidak Ada</option>
                {CERTAINTY_LEVELS.map(lvl => (
                  <option key={lvl.value} value={lvl.value}>{lvl.label}</option>
                ))}
              </select>
            </div>
          ))}
          <button onClick={handleStartInvestigation} style={{...S.btnPrimary, marginTop: 8}}>🚀 Mulai Analisis</button>
        </div>
      </section>
    );

  } else if (flowState === "QUESTIONING") {
    // LAYAR 2: Pertanyaan Dinamis (Backward Chaining)
    const currentQ = getNextQuestion(answeredSymptoms);
    if (!currentQ) { finalizeDiagnosis(); return null; }
    
    content = (
      <section style={S.section}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h2 style={S.h2}>Sesi Wawancara Sistem</h2>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span style={{ fontSize: 12, color: "#666" }}>{questionCount}/{MAX_QUESTIONS}</span>
            <button onClick={() => finalizeDiagnosis()} style={S.btnOutline}>Lihat Hasil Sekarang</button>
          </div>
        </div>
        <div style={S.card}>
          {currentQ.reasonHypothesis ? (
             <div style={S.badgeInfo}>
               💡 Hipotesis Sistem: Menguji kemungkinan <strong>{currentQ.reasonName}</strong>
             </div>
          ) : (
            <div style={{...S.badgeInfo, backgroundColor:"#fff3e0", color:"#e65100"}}>
               🔍 Mencari petunjuk baru...
            </div>
          )}
          <h3 style={{ fontSize: 20, marginTop: 0 }}>Apakah tanaman mengalami gejala berikut?</h3>
          <p style={{ fontSize: 18, color: "#1b5e20", fontWeight: "bold", padding: "16px", backgroundColor: "#e8f5e9", borderRadius: 8, borderLeft: "4px solid #43a047" }}>
            [{currentQ.symptomCode}] - {currentQ.symptomName}
          </p>
          <div style={S.answerGrid}>
            {CERTAINTY_LEVELS.map(lvl => (
              <button key={lvl.value} onClick={() => handleAnswerQuestion(currentQ.symptomCode, lvl.value)} style={{...S.btnOutline, borderColor: "#1976d2", color: "#1976d2"}}>
                Ya, {lvl.label}
              </button>
            ))}
            <button onClick={() => handleAnswerQuestion(currentQ.symptomCode, 0)} style={S.btnGray}>Tidak / Lewati</button>
          </div>
        </div>
      </section>
    );

  } else if (flowState === "RESULT" && diagnosisData) {
    // LAYAR 3: Hasil Akhir (CF vs DS) beserta Explanation Facility
    const { sortedCF, dsResults } = diagnosisData;
    
    content = (
      <section style={S.section}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={S.h2}>Hasil Diagnosis Akhir</h2>
          <button onClick={handleReset} style={{...S.btnPrimary, width: "auto", padding: "8px 16px"}}>🔄 Ulangi Diagnosis</button>
        </div>

        <div style={{ display: "flex", gap: 20, flexWrap: "wrap", marginBottom: 24, marginTop: 20 }}>
          {/* Tabel CF */}
          <div style={{ flex: "1 1 300px" }}>
            <h3 style={{ color: "#1b5e20", borderBottom: "2px solid #43a047", paddingBottom: 8 }}>Metode Certainty Factor (CF)</h3>
            <div style={S.tableWrap}>
              <table style={S.table}>
                <thead>
                  <tr><th style={S.th}>Rank</th><th style={S.th}>Penyakit</th><th style={{...S.th, textAlign: "right"}}>%</th></tr>
                </thead>
                <tbody>
                  {sortedCF.slice(0, 3).map((r, idx) => (
                    <tr key={r.diseaseCode} style={idx === 0 ? {backgroundColor: "#f1f8e9", fontWeight: "bold"} : {}}>
                      <td style={S.td}>{idx + 1}</td><td style={S.td}>{r.diseaseName}</td><td style={{...S.td, textAlign: "right", color: r.percentage > 0 ? "#2e7d32" : "#aaa"}}>{r.percentage}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Tabel DS */}
          <div style={{ flex: "1 1 300px" }}>
            <h3 style={{ color: "#4a148c", borderBottom: "2px solid #ab47bc", paddingBottom: 8 }}>Metode Dempster-Shafer (D-S)</h3>
            <div style={S.tableWrap}>
              <table style={S.table}>
                <thead>
                  <tr><th style={{...S.th, backgroundColor: "#f3e5f5"}}>Rank</th><th style={{...S.th, backgroundColor: "#f3e5f5"}}>Penyakit</th><th style={{...S.th, backgroundColor: "#f3e5f5", textAlign: "right"}}>%</th></tr>
                </thead>
                <tbody>
                  {dsResults.slice(0, 3).map((r, idx) => (
                    <tr key={r.diseaseCode} style={idx === 0 ? {backgroundColor: "#fbf3fd", fontWeight: "bold"} : {}}>
                      <td style={S.td}>{idx + 1}</td><td style={S.td}>{r.diseaseName}</td><td style={{...S.td, textAlign: "right", color: r.percentage > 0 ? "#6a1b9a" : "#aaa"}}>{r.percentage}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Fasilitas Penjelasan Asli */}
        <div style={{ marginTop: 32, borderTop: "1px dashed #ccc", paddingTop: 20 }}>
          <h2 style={S.h2}>Fasilitas Penjelasan (Trace CF)</h2>
          <ExplanationFacility diagnosisData={diagnosisData} rulesData={RULES} />
        </div>
      </section>
    );
  }

  return (
    <div style={S.root}>
      <div style={S.header}>
        <h1 style={S.h1}>Sistem Pakar Lada: Interaktif</h1>
        <p style={S.subtitle}>
          Forward-Backward Chaining Engine | Dempster-Shafer & Certainty Factor
        </p>
      </div>
      
      {/* Memanggil tampilan layar yang aktif sesuai state */}
      {content}

    </div>
  );
} 