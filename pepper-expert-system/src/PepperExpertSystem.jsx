import { useState } from "react";
import {
  DISEASES,
  SYMPTOMS,
  RULES,
  CERTAINTY_LEVELS,
  calculateCFForDisease,
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
  const [selected, setSelected]         = useState({});
  const [diagnosisData, setDiagnosisData] = useState(null);

  // ── Handler ──────────────────────────────────────────────────
  const handleChange = (gCode, val) => {
    setSelected((prev) => ({ ...prev, [gCode]: parseFloat(val) }));
  };

  const handleDiagnose = () => {
    const hasAny = Object.values(selected).some((v) => v > 0);
    if (!hasAny) {
      alert("Pilih minimal satu gejala terlebih dahulu.");
      return;
    }

    // Jalankan CF untuk setiap penyakit
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

  // ── Render ───────────────────────────────────────────────────
  return (
    <div style={S.root}>

      {/* ── HEADER ── */}
      <div style={S.header}>
        <h1 style={S.h1}>Sistem Pakar: Diagnosis Penyakit Tanaman Lada</h1>
        <p style={S.subtitle}>
          Metode: Certainty Factor (CF)&nbsp;|&nbsp;
          Referensi: Karmila, Maria E., Annafi Franz — TEPIAN 2021
        </p>
      </div>

      {/* ══════════════════════════════════════════════════════════
          LANGKAH 1 — PEMILIHAN GEJALA
          ══════════════════════════════════════════════════════════ */}
      <section style={S.section}>
        <h2 style={S.h2}>Langkah 1 — Pilih Gejala yang Diamati</h2>
        <p style={S.hint}>
          Centang semua gejala yang diamati dan pilih tingkat keyakinan Anda.
          &nbsp;({selectedCount} / {Object.keys(SYMPTOMS).length} gejala dipilih)
        </p>

        <div style={S.tableWrap}>
          <table style={S.table}>
            <thead>
              <tr>
                <th style={{ ...S.th, width: 52 }}>Kode</th>
                <th style={S.th}>Nama Gejala</th>
                <th style={{ ...S.th, width: 68, textAlign: "center" }}>Bobot CF(H,E)</th>
                <th style={{ ...S.th, width: 220 }}>Tingkat Keyakinan CF(E,e)</th>
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
                        <option value={0}>— Tidak Dipilih —</option>
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
            🔍 Diagnosa
          </button>
          <button onClick={handleReset} style={S.btnGray}>
            ↩ Reset
          </button>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          LANGKAH 2 — HASIL DIAGNOSIS (Ranking Penyakit)
          ══════════════════════════════════════════════════════════ */}
      {diagnosisData && (
        <section style={S.section}>
          <h2 style={S.h2}>Langkah 2 — Hasil Diagnosis</h2>
          <p style={S.hint}>Didiagnosis pada: {diagnosisData.timestamp}</p>

          {/* Banner diagnosis utama */}
          <div style={S.banner}>
            <span style={S.bannerLabel}>Diagnosa Utama: </span>
            <span style={S.bannerVal}>
              {diagnosisData.sortedCF[0]?.percentage > 0
                ? `${diagnosisData.sortedCF[0].diseaseName} — ${diagnosisData.sortedCF[0].percentage}%`
                : "Tidak ditemukan penyakit yang cocok"}
            </span>
          </div>

          {/* Tabel Ranking Penyakit */}
          <h3 style={S.h3}>Ranking Nilai Certainty Factor — Semua Penyakit</h3>
          <div style={S.tableWrap}>
            <table style={S.table}>
              <thead>
                <tr>
                  <th style={{ ...S.th, width: 48, textAlign: "center" }}>Rank</th>
                  <th style={{ ...S.th, width: 58 }}>Kode</th>
                  <th style={S.th}>Nama Penyakit</th>
                  <th style={{ ...S.th, width: 90, textAlign: "center" }}>Nilai CF</th>
                  <th style={{ ...S.th, width: 110, textAlign: "center" }}>Persentase (%)</th>
                  <th style={{ ...S.th, width: 170 }}>Gejala Cocok</th>
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
                      <span
                        style={{
                          color: r.percentage > 0 ? "#2e7d32" : "#bbb",
                          fontWeight: r.percentage > 0 ? 700 : 400,
                        }}
                      >
                        {r.percentage}%
                      </span>
                    </td>
                    <td style={{ ...S.td, fontSize: 12, color: "#555" }}>
                      {r.matchedCodes.length > 0
                        ? r.matchedCodes.join(", ")
                        : <span style={{ color: "#ccc" }}>—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════════════════════
          FASILITAS PENJELASAN
          ══════════════════════════════════════════════════════════ */}
      <section style={S.section} id="explanation-facility">
        <div style={S.efTitleRow}>
          <h2 style={{ ...S.h2, margin: 0 }}>Fasilitas Penjelasan (Explanation Facility)</h2>
          <span style={S.efBadge}>HOW &amp; WHY</span>
        </div>
        <p style={{ ...S.hint, marginTop: 8 }}>
          Bagian ini menjelaskan <strong>bagaimana</strong> dan <strong>mengapa</strong> sistem
          mencapai kesimpulan tersebut — termasuk jejak aturan, kontribusi tiap gejala, dan
          langkah demi langkah perhitungan CF.
        </p>

        <ExplanationFacility diagnosisData={diagnosisData} rulesData={RULES} />
      </section>

      {/* ── FOOTER ── */}
      <footer style={S.footer}>
        Karmila, Maria E., &amp; Annafi' Franz (2021).{" "}
        <em>
          Expert System for Diagnosis of Pepper Plant Diseases Using Certainty Factor and Naïve Bayes Methods.
        </em>{" "}
        TEPIAN, 2(4). https://doi.org/10.51967/tepian.v2i4.744
      </footer>
    </div>
  );
}
