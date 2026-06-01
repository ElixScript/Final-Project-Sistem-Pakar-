import { useState } from "react";
import { SYMPTOMS } from "./rule.js";

// ================================================================
// EXPLANATION FACILITY COMPONENT
// Menjelaskan HOW & WHY sistem mencapai kesimpulan diagnosis.
// ================================================================

// ── Styles lokal untuk komponen ini ────────────────────────────
const EF = {
  wrapper: {
    fontFamily: "'Segoe UI', Arial, sans-serif",
    fontSize: 13,
    color: "#212121",
    lineHeight: 1.6,
  },
  empty: {
    padding: 28,
    textAlign: "center",
    color: "#795548",
    backgroundColor: "#fff8e1",
    border: "2px dashed #ffb74d",
    borderRadius: 8,
    fontSize: 14,
  },

  // ── Tab bar ─────────────────────────────────────────────────
  tabBar: {
    display: "flex",
    gap: 6,
    marginBottom: 16,
    flexWrap: "wrap",
    borderBottom: "2px solid #e0e0e0",
    paddingBottom: 0,
  },
  tab: (active) => ({
    padding: "7px 18px",
    backgroundColor: active ? "#2e7d32" : "#f5f5f5",
    color: active ? "#fff" : "#555",
    border: active ? "2px solid #2e7d32" : "2px solid #e0e0e0",
    borderBottom: "none",
    borderRadius: "6px 6px 0 0",
    cursor: "pointer",
    fontSize: 13,
    fontWeight: active ? 700 : 400,
    marginBottom: -2,
    transition: "all 0.15s ease",
  }),

  // ── Kartu ringkasan ─────────────────────────────────────────
  summaryRow: {
    display: "flex",
    gap: 12,
    marginBottom: 16,
    flexWrap: "wrap",
  },
  card: (color) => ({
    flex: "1 1 160px",
    backgroundColor: color || "#e8f5e9",
    borderRadius: 8,
    padding: "12px 16px",
    border: "1px solid #c8e6c9",
  }),
  cardLabel: {
    fontSize: 11,
    color: "#555",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  cardValue: {
    fontSize: 18,
    fontWeight: 700,
    color: "#1b5e20",
  },
  cardSub: {
    fontSize: 11,
    color: "#777",
    marginTop: 2,
  },

  // ── Tabel umum ─────────────────────────────────────────────
  tableWrap: { overflowX: "auto", marginBottom: 16 },
  table: { width: "100%", borderCollapse: "collapse", fontSize: 13 },
  th: {
    border: "1px solid #bbb",
    padding: "7px 10px",
    backgroundColor: "#e8f5e9",
    fontWeight: 700,
    textAlign: "left",
    whiteSpace: "nowrap",
  },
  td: {
    border: "1px solid #e0e0e0",
    padding: "6px 10px",
    verticalAlign: "middle",
  },
  tdCenter: {
    border: "1px solid #e0e0e0",
    padding: "6px 10px",
    textAlign: "center",
    verticalAlign: "middle",
  },

  // ── Step kombinasi CF ───────────────────────────────────────
  stepBox: (isFirst) => ({
    borderLeft: `4px solid ${isFirst ? "#43a047" : "#1976d2"}`,
    backgroundColor: isFirst ? "#f1f8e9" : "#e3f2fd",
    borderRadius: "0 6px 6px 0",
    padding: "10px 14px",
    marginBottom: 8,
  }),
  stepTitle: {
    fontWeight: 700,
    fontSize: 12,
    color: "#555",
    marginBottom: 4,
  },
  stepFormula: {
    fontFamily: "'Courier New', Courier, monospace",
    fontSize: 12.5,
    color: "#1a237e",
    wordBreak: "break-all",
  },
  stepResult: {
    fontWeight: 700,
    color: "#2e7d32",
    fontSize: 13,
    marginTop: 4,
  },

  // ── Rule trace ──────────────────────────────────────────────
  ruleBlock: (active) => ({
    display: "flex",
    alignItems: "flex-start",
    gap: 10,
    padding: "10px 14px",
    borderRadius: 6,
    marginBottom: 8,
    backgroundColor: active ? "#e8f5e9" : "#fafafa",
    border: `1px solid ${active ? "#a5d6a7" : "#e0e0e0"}`,
    opacity: active ? 1 : 0.6,
  }),
  ruleBadge: (active) => ({
    flexShrink: 0,
    padding: "2px 10px",
    borderRadius: 12,
    fontSize: 11,
    fontWeight: 700,
    backgroundColor: active ? "#2e7d32" : "#bdbdbd",
    color: "#fff",
    marginTop: 2,
  }),
  ruleText: { flex: 1 },
  ruleName: { fontWeight: 700, fontSize: 13, color: "#1b5e20" },
  ruleGejala: { fontSize: 12, color: "#555", marginTop: 2 },
  gejalaChip: (matched) => ({
    display: "inline-block",
    padding: "1px 7px",
    borderRadius: 10,
    margin: "2px 3px 2px 0",
    fontSize: 11,
    fontWeight: matched ? 700 : 400,
    backgroundColor: matched ? "#c8e6c9" : "#f5f5f5",
    color: matched ? "#1b5e20" : "#999",
    border: `1px solid ${matched ? "#81c784" : "#e0e0e0"}`,
  }),

  // ── Progress bar ────────────────────────────────────────────
  barWrap: { backgroundColor: "#e0e0e0", borderRadius: 6, height: 10, overflow: "hidden", flex: 1 },
  bar: (pct, color) => ({
    height: "100%",
    width: `${Math.min(pct, 100)}%`,
    backgroundColor: color || "#43a047",
    borderRadius: 6,
    transition: "width 0.4s ease",
  }),

  sectionTitle: {
    fontSize: 14,
    fontWeight: 700,
    color: "#2e7d32",
    marginBottom: 10,
    paddingBottom: 4,
    borderBottom: "1px solid #e0e0e0",
  },
  infoBox: {
    backgroundColor: "#e3f2fd",
    border: "1px solid #90caf9",
    borderRadius: 6,
    padding: "10px 14px",
    marginBottom: 12,
    fontSize: 12.5,
    color: "#1a237e",
    lineHeight: 1.7,
  },
};

// ── Warna peringkat diagnosis ────────────────────────────────
function rankColor(idx) {
  if (idx === 0) return { bg: "#c8e6c9", border: "#81c784", text: "#1b5e20" };
  if (idx === 1) return { bg: "#fff9c4", border: "#fff176", text: "#f57f17" };
  if (idx === 2) return { bg: "#ffccbc", border: "#ffab91", text: "#bf360c" };
  return { bg: "#f5f5f5", border: "#e0e0e0", text: "#757575" };
}

// ================================================================
// SUB-VIEW 1: Kontribusi Gejala
// ================================================================
function TabGejala({ diagnosisData }) {
  const { selectedSymptoms } = diagnosisData;
  const selectedEntries = Object.entries(selectedSymptoms).filter(([, v]) => v > 0);

  return (
    <div>
      <p style={EF.infoBox}>
        <strong>CF(H,e) = CF(H,E) × CF(E,e)</strong><br />
        Di mana <em>CF(H,E)</em> adalah bobot kepercayaan pakar (dari basis pengetahuan) dan{" "}
        <em>CF(E,e)</em> adalah tingkat keyakinan yang Anda berikan. Perkalian keduanya menghasilkan
        CF individual setiap gejala.
      </p>
      <div style={EF.tableWrap}>
        <table style={EF.table}>
          <thead>
            <tr>
              <th style={{ ...EF.th, width: 52 }}>Kode</th>
              <th style={EF.th}>Nama Gejala</th>
              <th style={{ ...EF.th, width: 80, textAlign: "center" }}>CF(H,E) Pakar</th>
              <th style={{ ...EF.th, width: 90, textAlign: "center" }}>CF(E,e) Pengguna</th>
              <th style={{ ...EF.th, width: 80, textAlign: "center" }}>CF(H,e) Final</th>
            </tr>
          </thead>
          <tbody>
            {selectedEntries.map(([code, cfEe]) => {
              const sym = SYMPTOMS[code];
              const cfHe = (sym.weight * cfEe).toFixed(4);
              return (
                <tr key={code}>
                  <td style={{ ...EF.td, fontWeight: 700, color: "#2e7d32" }}>{code}</td>
                  <td style={EF.td}>{sym.name}</td>
                  <td style={EF.tdCenter}>{sym.weight}</td>
                  <td style={EF.tdCenter}>{cfEe}</td>
                  <td style={{ ...EF.tdCenter, fontWeight: 700, color: "#1976d2" }}>
                    {sym.weight} × {cfEe} = <span style={{ color: "#2e7d32" }}>{cfHe}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ================================================================
// SUB-VIEW 2: Rule Trace
// ================================================================
function TabRuleTrace({ diagnosisData, RULES_DATA }) {
  const { cfResults, selectedSymptoms } = diagnosisData;
  const selectedCodes = Object.entries(selectedSymptoms)
    .filter(([, v]) => v > 0)
    .map(([k]) => k);

  return (
    <div>
      <p style={EF.infoBox}>
        <strong>Jejak Aturan (Rule Trace)</strong> menunjukkan aturan mana yang aktif
        (terpicu) berdasarkan gejala yang Anda pilih. Aturan dinyatakan aktif jika minimal
        satu gejala dalam aturan tersebut cocok dengan gejala yang dipilih.
      </p>
      {Object.entries(cfResults).map(([pCode, result]) => {
        const isActive = result.matchedCodes.length > 0;
        const ruleGejala = RULES_DATA[pCode] || [];
        return (
          <div key={pCode} style={EF.ruleBlock(isActive)}>
            <span style={EF.ruleBadge(isActive)}>{pCode}</span>
            <div style={EF.ruleText}>
              <div style={EF.ruleName}>
                {result.diseaseName}
                {isActive && (
                  <span style={{ marginLeft: 8, fontSize: 11, color: "#43a047" }}>
                    ✓ Aktif — {result.matchedCodes.length} gejala cocok
                  </span>
                )}
              </div>
              <div style={EF.ruleGejala}>
                <span style={{ fontSize: 11, color: "#777" }}>JIKA </span>
                {ruleGejala.map((g) => {
                  const matched = selectedCodes.includes(g);
                  return (
                    <span key={g} style={EF.gejalaChip(matched)}>
                      {g}{matched ? " ✓" : ""}
                    </span>
                  );
                })}
                <span style={{ fontSize: 11, color: "#777" }}> MAKA {pCode}</span>
              </div>
            </div>
            {isActive && (
              <div style={{ flexShrink: 0, textAlign: "right" }}>
                <span style={{ fontWeight: 700, color: "#2e7d32", fontSize: 14 }}>
                  {result.percentage}%
                </span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ================================================================
// SUB-VIEW 3: Langkah Perhitungan CF (per penyakit)
// ================================================================
function TabHitungan({ diagnosisData }) {
  const { cfResults } = diagnosisData;
  const activeResults = Object.values(cfResults).filter((r) => r.matchedCodes.length > 0);
  const [activeDisease, setActiveDisease] = useState(
    activeResults.length > 0 ? activeResults[0].diseaseCode : null
  );

  if (activeResults.length === 0) {
    return (
      <div style={{ ...EF.empty, padding: 20 }}>
        Tidak ada penyakit yang terpicu. Pilih minimal satu gejala.
      </div>
    );
  }

  const selected = cfResults[activeDisease] || activeResults[0];

  return (
    <div>
      <p style={EF.infoBox}>
        <strong>Kombinasi CF Sekuensial:</strong>{" "}
        CF_combine = CF_lama + CF_baru × (1 − CF_lama)<br />
        Proses ini diulang untuk setiap gejala yang cocok secara berurutan hingga
        menghasilkan nilai CF akhir penyakit.
      </p>

      {/* Pilih penyakit */}
      <div style={{ ...EF.tabBar, borderBottom: "none", marginBottom: 12 }}>
        {activeResults.map((r) => (
          <button
            key={r.diseaseCode}
            onClick={() => setActiveDisease(r.diseaseCode)}
            style={EF.tab(activeDisease === r.diseaseCode)}
          >
            {r.diseaseCode} — {r.percentage}%
          </button>
        ))}
      </div>

      {/* Langkah-langkah */}
      <div style={EF.sectionTitle}>
        Detail Perhitungan: {selected.diseaseName}
      </div>

      {/* Tabel CF per gejala */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#555", marginBottom: 6 }}>
          Langkah 1 — Hitung CF(H,e) per gejala yang cocok:
        </div>
        <div style={EF.tableWrap}>
          <table style={EF.table}>
            <thead>
              <tr>
                <th style={{ ...EF.th, width: 50 }}>Kode</th>
                <th style={EF.th}>Nama Gejala</th>
                <th style={{ ...EF.th, width: 80, textAlign: "center" }}>CF(H,E)</th>
                <th style={{ ...EF.th, width: 80, textAlign: "center" }}>CF(E,e)</th>
                <th style={{ ...EF.th, width: 80, textAlign: "center" }}>CF(H,e)</th>
              </tr>
            </thead>
            <tbody>
              {selected.symptomCFs.map((s) => (
                <tr key={s.code}>
                  <td style={{ ...EF.td, fontWeight: 700, color: "#2e7d32" }}>{s.code}</td>
                  <td style={EF.td}>{s.name}</td>
                  <td style={EF.tdCenter}>{s.cfHE}</td>
                  <td style={EF.tdCenter}>{s.cfEe}</td>
                  <td style={{ ...EF.tdCenter, fontWeight: 700, color: "#1976d2" }}>
                    {s.cfHe.toFixed(4)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Log kombinasi sekuensial */}
      {selected.combinationSteps.length > 1 && (
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#555", marginBottom: 8 }}>
            Langkah 2 — Kombinasi CF Sekuensial:
          </div>
          {selected.combinationSteps.map((s, idx) => (
            <div key={s.step} style={EF.stepBox(idx === 0)}>
              <div style={EF.stepTitle}>Langkah {s.step}</div>
              <div style={EF.stepFormula}>{s.description}</div>
              <div style={EF.stepResult}>= {s.result.toFixed(4)}</div>
            </div>
          ))}
        </div>
      )}

      {/* Hasil akhir */}
      <div style={{
        backgroundColor: "#e8f5e9",
        border: "2px solid #43a047",
        borderRadius: 8,
        padding: "12px 18px",
        marginTop: 12,
        display: "flex",
        alignItems: "center",
        gap: 16,
        flexWrap: "wrap",
      }}>
        <div>
          <div style={{ fontSize: 11, color: "#555", fontWeight: 700 }}>NILAI CF AKHIR</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: "#1b5e20" }}>
            {selected.combinedCF}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 11, color: "#555", fontWeight: 700 }}>PERSENTASE</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: "#2e7d32" }}>
            {selected.percentage}%
          </div>
        </div>
        <div style={{ flex: 1, minWidth: 120 }}>
          <div style={{ fontSize: 11, color: "#555", fontWeight: 700, marginBottom: 4 }}>
            VISUALISASI KEYAKINAN
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={EF.barWrap}>
              <div style={EF.bar(selected.percentage, "#43a047")} />
            </div>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#2e7d32", whiteSpace: "nowrap" }}>
              {selected.percentage}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ================================================================
// SUB-VIEW 4: Perbandingan Top 3 Penyakit
// ================================================================
function TabPerbandingan({ diagnosisData }) {
  const { sortedCF } = diagnosisData;
  const top3 = sortedCF.filter((r) => r.percentage > 0).slice(0, 3);

  if (top3.length === 0) {
    return (
      <div style={{ ...EF.empty, padding: 20 }}>
        Tidak ada diagnosis yang cocok untuk dibandingkan.
      </div>
    );
  }

  return (
    <div>
      <p style={EF.infoBox}>
        <strong>Kenapa sistem memilih diagnosis ini?</strong><br />
        Tabel berikut membandingkan tiga penyakit dengan nilai CF tertinggi, menampilkan
        gejala yang menjadi bukti pendukung masing-masing diagnosis.
      </p>

      <div style={EF.summaryRow}>
        {top3.map((r, idx) => {
          const c = rankColor(idx);
          return (
            <div
              key={r.diseaseCode}
              style={{
                flex: "1 1 200px",
                backgroundColor: c.bg,
                border: `2px solid ${c.border}`,
                borderRadius: 8,
                padding: "14px 16px",
              }}
            >
              <div style={{ fontSize: 11, fontWeight: 700, color: c.text, marginBottom: 4 }}>
                {idx === 0 ? "🥇 DIAGNOSA UTAMA" : idx === 1 ? "🥈 ALTERNATIF 1" : "🥉 ALTERNATIF 2"}
              </div>
              <div style={{ fontWeight: 700, fontSize: 14, color: c.text }}>{r.diseaseName}</div>
              <div style={{ fontSize: 11, color: "#777", marginTop: 2 }}>{r.diseaseCode}</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: c.text, margin: "6px 0 4px" }}>
                {r.percentage}%
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={EF.barWrap}>
                  <div style={EF.bar(r.percentage, c.text)} />
                </div>
              </div>
              <div style={{ fontSize: 11, color: "#555", marginTop: 6 }}>
                {r.matchedCodes.length} gejala cocok: {r.matchedCodes.join(", ")}
              </div>
            </div>
          );
        })}
      </div>

      {/* Tabel perbandingan gejala */}
      <div style={EF.sectionTitle}>Perbandingan Bukti Gejala</div>
      <div style={EF.tableWrap}>
        <table style={EF.table}>
          <thead>
            <tr>
              <th style={{ ...EF.th, width: 58 }}>Kode</th>
              <th style={EF.th}>Nama Penyakit</th>
              <th style={{ ...EF.th, width: 90, textAlign: "center" }}>Nilai CF</th>
              <th style={{ ...EF.th, width: 110, textAlign: "center" }}>Persentase</th>
              <th style={{ ...EF.th, width: 80, textAlign: "center" }}>Gejala Cocok</th>
              <th style={EF.th}>Gejala yang Mendukung</th>
            </tr>
          </thead>
          <tbody>
            {top3.map((r, idx) => {
              const c = rankColor(idx);
              return (
                <tr key={r.diseaseCode} style={{ backgroundColor: c.bg }}>
                  <td style={{ ...EF.td, fontWeight: 700, color: c.text }}>{r.diseaseCode}</td>
                  <td style={{ ...EF.td, fontWeight: 700, color: c.text }}>{r.diseaseName}</td>
                  <td style={EF.tdCenter}>{r.combinedCF}</td>
                  <td style={{ ...EF.tdCenter, fontWeight: 700, color: c.text }}>
                    {r.percentage}%
                  </td>
                  <td style={{ ...EF.tdCenter, fontWeight: 700 }}>{r.matchedCodes.length}</td>
                  <td style={{ ...EF.td, fontSize: 12 }}>
                    {r.symptomCFs.map((s) => (
                      <div key={s.code} style={{ marginBottom: 2 }}>
                        <span style={{ fontWeight: 700, color: "#2e7d32" }}>{s.code}</span>
                        {" — "}
                        <span style={{ color: "#555" }}>{s.name}</span>
                        <span style={{ color: "#777", marginLeft: 4 }}>
                          (CF = {s.cfHe.toFixed(4)})
                        </span>
                      </div>
                    ))}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ================================================================
// KOMPONEN UTAMA: ExplanationFacility
// ================================================================
const TABS = [
  { id: "gejala",       label: "📋 Kontribusi Gejala" },
  { id: "rule",         label: "🔗 Jejak Aturan" },
  { id: "hitungan",     label: "🧮 Langkah Perhitungan" },
  { id: "perbandingan", label: "📊 Perbandingan Diagnosis" },
];

// RULES_DATA diterima dari props agar komponen ini mandiri
export default function ExplanationFacility({ diagnosisData, rulesData }) {
  const [activeTab, setActiveTab] = useState("gejala");

  if (!diagnosisData) {
    return (
      <div style={EF.empty}>
        🔍 Jalankan diagnosis terlebih dahulu untuk melihat penjelasan.<br />
        <span style={{ fontSize: 12, color: "#a1887f", marginTop: 4, display: "block" }}>
          Pilih gejala yang diamati, lalu tekan tombol <strong>Diagnosa</strong>.
        </span>
      </div>
    );
  }

  const hasAnyResult = diagnosisData.sortedCF.some((r) => r.percentage > 0);

  return (
    <div style={EF.wrapper}>
      {/* Ringkasan cepat */}
      <div style={EF.summaryRow}>
        <div style={EF.card("#e8f5e9")}>
          <div style={EF.cardLabel}>Gejala Dipilih</div>
          <div style={EF.cardValue}>
            {Object.values(diagnosisData.selectedSymptoms).filter((v) => v > 0).length}
          </div>
          <div style={EF.cardSub}>dari {Object.keys(SYMPTOMS).length} gejala tersedia</div>
        </div>
        <div style={EF.card("#e3f2fd")}>
          <div style={EF.cardLabel}>Aturan Aktif</div>
          <div style={{ ...EF.cardValue, color: "#1565c0" }}>
            {Object.values(diagnosisData.cfResults).filter((r) => r.matchedCodes.length > 0).length}
          </div>
          <div style={EF.cardSub}>dari 10 aturan penyakit</div>
        </div>
        <div style={EF.card("#fce4ec")}>
          <div style={EF.cardLabel}>Diagnosa Utama</div>
          <div style={{ ...EF.cardValue, color: "#880e4f", fontSize: 13 }}>
            {hasAnyResult
              ? diagnosisData.sortedCF[0].diseaseName
              : "Tidak ditemukan"}
          </div>
          <div style={EF.cardSub}>
            {hasAnyResult ? `CF = ${diagnosisData.sortedCF[0].percentage}%` : "—"}
          </div>
        </div>
        <div style={EF.card("#fff8e1")}>
          <div style={EF.cardLabel}>Waktu Diagnosis</div>
          <div style={{ ...EF.cardValue, fontSize: 12, color: "#f57f17" }}>
            {diagnosisData.timestamp}
          </div>
          <div style={EF.cardSub}>Metode: Certainty Factor</div>
        </div>
      </div>

      {/* Tab navigasi */}
      <div style={EF.tabBar}>
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            style={EF.tab(activeTab === t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Konten tab */}
      {activeTab === "gejala"       && <TabGejala diagnosisData={diagnosisData} />}
      {activeTab === "rule"         && <TabRuleTrace diagnosisData={diagnosisData} RULES_DATA={rulesData} />}
      {activeTab === "hitungan"     && <TabHitungan diagnosisData={diagnosisData} />}
      {activeTab === "perbandingan" && <TabPerbandingan diagnosisData={diagnosisData} />}
    </div>
  );
}
