import { useState } from "react";
import { SYMPTOMS } from "./rule.js";

// ── Minimal style tokens ─────────────────────────────────────────
const c = {
  surface: "white",
  surface2: "#f0f4f1",
  border: "#dde8de",
  forest700: "#1e5224",
  forest600: "#256b2d",
  forest500: "#2e8438",
  forest400: "#4aa856",
  forest200: "#a3d9aa",
  forest100: "#d4efd7",
  forest50:  "#edf7ee",
  text: "#0f2912",
  textSecondary: "#3d6642",
  textMuted: "#6b8c70",
  textFaint: "#9db8a1",
  monoFont: "'JetBrains Mono', 'Courier New', monospace",
  bodyFont: "'DM Sans', system-ui, sans-serif",
};

function rankStyle(idx) {
  if (idx === 0) return { bg: c.forest50, border: c.forest200, text: c.forest700, accent: c.forest500 };
  if (idx === 1) return { bg: "#fffbeb", border: "#fde68a", text: "#92400e", accent: "#d97706" };
  if (idx === 2) return { bg: "#fff1f2", border: "#fecdd3", text: "#9f1239", accent: "#e11d48" };
  return { bg: "#fafafa", border: "#e5e7eb", text: "#6b7280", accent: "#9ca3af" };
}

function ProgressBar({ pct, color = c.forest500, height = 6 }) {
  return (
    <div style={{ background: "#e5e7eb", borderRadius: 99, height, overflow: "hidden", flex: 1 }}>
      <div className="bar-animated" style={{ height: "100%", width: `${Math.min(pct,100)}%`, background: color, borderRadius: 99 }} />
    </div>
  );
}

// ── Tab: Gejala ─────────────────────────────────────────────────
function TabGejala({ diagnosisData }) {
  const { selectedSymptoms } = diagnosisData;
  const entries = Object.entries(selectedSymptoms).filter(([, v]) => v > 0);

  return (
    <div>
      <div style={{ padding: "12px 14px", borderRadius: 8, background: "#eff6ff", border: "1px solid #bfdbfe", marginBottom: 16, fontSize: 12.5, color: "#1e40af", lineHeight: 1.7 }}>
        <strong>CF(H,e) = CF(H,E) × CF(E,e)</strong> — CF(H,E) adalah bobot pakar dari basis pengetahuan, CF(E,e) adalah keyakinan pengguna.
      </div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
          <thead>
            <tr style={{ background: c.forest50 }}>
              {["Kode", "Nama Gejala", "CF(H,E) Pakar", "CF(E,e) Pengguna", "CF(H,e) Final"].map(h => (
                <th key={h} style={{ border: "1px solid var(--border, #dde8de)", padding: "8px 10px", fontWeight: 700, textAlign: h.includes("CF") ? "center" : "left", whiteSpace: "nowrap", color: c.forest700, fontSize: 11 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {entries.map(([code, cfEe]) => {
              const sym = SYMPTOMS[code];
              const cfHe = (sym.weight * cfEe).toFixed(4);
              return (
                <tr key={code} style={{ borderBottom: "1px solid #f0f4f1" }}>
                  <td style={{ padding: "8px 10px", fontWeight: 700, color: c.forest600, fontFamily: c.monoFont, fontSize: 11 }}>{code}</td>
                  <td style={{ padding: "8px 10px", color: c.text, fontSize: 12.5 }}>{sym.name}</td>
                  <td style={{ padding: "8px 10px", textAlign: "center", fontFamily: c.monoFont, fontSize: 12 }}>{sym.weight}</td>
                  <td style={{ padding: "8px 10px", textAlign: "center", fontFamily: c.monoFont, fontSize: 12 }}>{cfEe}</td>
                  <td style={{ padding: "8px 10px", textAlign: "center" }}>
                    <span style={{ fontFamily: c.monoFont, fontSize: 12, color: "#1d4ed8" }}>{sym.weight} × {cfEe}</span>
                    <span style={{ fontWeight: 700, color: c.forest600, marginLeft: 4, fontFamily: c.monoFont }}>= {cfHe}</span>
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

// ── Tab: Rule Trace ─────────────────────────────────────────────
function TabRuleTrace({ diagnosisData, RULES_DATA }) {
  const { selectedSymptoms, cfResults } = diagnosisData;
  const activeFirst = Object.entries(cfResults || {}).sort((a, b) => b[1].percentage - a[1].percentage);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {activeFirst.map(([pCode, result]) => {
        const ruleSymptoms = RULES_DATA[pCode] || [];
        const isActive = result.percentage > 0;
        return (
          <div key={pCode} style={{
            padding: "12px 16px", borderRadius: 10,
            background: isActive ? c.forest50 : "#fafafa",
            border: `1.5px solid ${isActive ? c.forest200 : "#e5e7eb"}`,
            opacity: isActive ? 1 : 0.55,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <span style={{
                padding: "2px 8px", borderRadius: 99, fontSize: 10, fontWeight: 700,
                background: isActive ? c.forest500 : "#d1d5db", color: "white",
                fontFamily: c.monoFont,
              }}>
                {pCode}
              </span>
              <span style={{ fontWeight: 600, fontSize: 13, color: isActive ? c.forest700 : "#6b7280" }}>
                {result.diseaseName}
              </span>
              {isActive && (
                <span style={{ marginLeft: "auto", fontWeight: 700, fontSize: 13, color: c.forest600, fontFamily: c.monoFont }}>
                  {result.percentage}%
                </span>
              )}
            </div>
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
              {ruleSymptoms.map(sym => {
                const matched = selectedSymptoms[sym] > 0;
                return (
                  <span key={sym} style={{
                    display: "inline-flex", alignItems: "center", gap: 4,
                    padding: "2px 8px", borderRadius: 99, fontSize: 11,
                    fontWeight: matched ? 600 : 400,
                    background: matched ? c.forest100 : "#f3f4f6",
                    color: matched ? c.forest700 : "#9ca3af",
                    border: `1px solid ${matched ? c.forest200 : "#e5e7eb"}`,
                    fontFamily: c.monoFont,
                  }}>
                    {matched && "✓ "}{sym}
                  </span>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Tab: Perhitungan ────────────────────────────────────────────
function TabHitungan({ diagnosisData }) {
  const { sortedCF } = diagnosisData;
  const [selectedIdx, setSelectedIdx] = useState(0);
  const hasResult = sortedCF.some(r => r.percentage > 0);
  if (!hasResult) return <div style={{ textAlign: "center", padding: 32, color: c.textMuted }}>Tidak ada hasil perhitungan.</div>;

  const validResults = sortedCF.filter(r => r.percentage > 0);
  const selected = validResults[selectedIdx] || validResults[0];

  return (
    <div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
        {validResults.slice(0, 4).map((r, idx) => (
          <button
            key={r.diseaseCode}
            onClick={() => setSelectedIdx(idx)}
            style={{
              padding: "6px 14px", fontSize: 12, fontWeight: selectedIdx === idx ? 600 : 400,
              borderRadius: 99, border: `1.5px solid ${selectedIdx === idx ? c.forest500 : "#e5e7eb"}`,
              background: selectedIdx === idx ? c.forest700 : "white",
              color: selectedIdx === idx ? "white" : c.textSecondary,
              cursor: "pointer",
            }}
          >
            {r.diseaseCode} — {r.percentage}%
          </button>
        ))}
      </div>

      {selected.combinationSteps.map((step, idx) => (
        <div key={idx} style={{
          borderLeft: `4px solid ${idx === 0 ? c.forest500 : "#60a5fa"}`,
          background: idx === 0 ? c.forest50 : "#eff6ff",
          borderRadius: "0 8px 8px 0",
          padding: "10px 14px",
          marginBottom: 8,
        }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", marginBottom: 4 }}>LANGKAH {step.step}</p>
          <p style={{ fontFamily: c.monoFont, fontSize: 12, color: "#1e3a5f", wordBreak: "break-all" }}>{step.description}</p>
          <p style={{ fontWeight: 700, color: idx === 0 ? c.forest600 : "#1d4ed8", fontSize: 13, marginTop: 4 }}>
            = {parseFloat(step.result.toFixed(4))}
          </p>
        </div>
      ))}

      <div style={{
        marginTop: 16, padding: "16px 20px", borderRadius: 12,
        background: "linear-gradient(135deg, var(--forest-50,#edf7ee), white)",
        border: `2px solid ${c.forest300}`,
        display: "flex", gap: 20, flexWrap: "wrap",
      }}>
        {[
          { label: "CF Akhir", val: selected.combinedCF, mono: true },
          { label: "Persentase", val: `${selected.percentage}%`, mono: true },
        ].map(item => (
          <div key={item.label}>
            <p style={{ fontSize: 10, color: c.textMuted, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 2 }}>{item.label}</p>
            <p style={{ fontSize: 24, fontWeight: 800, color: c.forest700, fontFamily: c.monoFont }}>{item.val}</p>
          </div>
        ))}
        <div style={{ flex: 1, minWidth: 140, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
          <p style={{ fontSize: 10, color: c.textMuted, fontWeight: 700, textTransform: "uppercase", marginBottom: 6 }}>Visualisasi</p>
          <ProgressBar pct={selected.percentage} color={c.forest500} height={10} />
        </div>
      </div>
    </div>
  );
}

// ── Tab: Perbandingan ───────────────────────────────────────────
function TabPerbandingan({ diagnosisData }) {
  const top3 = diagnosisData.sortedCF.filter(r => r.percentage > 0).slice(0, 3);
  if (top3.length === 0) return <div style={{ textAlign: "center", padding: 32, color: "#9ca3af" }}>Tidak ada hasil yang dapat dibandingkan.</div>;

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12, marginBottom: 20 }}>
        {top3.map((r, idx) => {
          const s = rankStyle(idx);
          return (
            <div key={r.diseaseCode} style={{ padding: "16px", borderRadius: 12, background: s.bg, border: `2px solid ${s.border}` }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: s.text, marginBottom: 6 }}>
                {idx === 0 ? "🥇 Diagnosa Utama" : idx === 1 ? "🥈 Alternatif 1" : "🥉 Alternatif 2"}
              </p>
              <p style={{ fontWeight: 700, fontSize: 13, color: s.text, marginBottom: 2 }}>{r.diseaseName}</p>
              <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 22, fontWeight: 800, color: s.accent, margin: "8px 0" }}>
                {r.percentage}%
              </p>
              <ProgressBar pct={r.percentage} color={s.accent} height={5} />
              <p style={{ fontSize: 11, color: "#6b7280", marginTop: 8 }}>{r.matchedCodes.length} gejala cocok</p>
            </div>
          );
        })}
      </div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
          <thead>
            <tr style={{ background: "#f9fafb" }}>
              {["Kode", "Penyakit", "CF", "%", "Gejala Cocok"].map(h => (
                <th key={h} style={{ padding: "8px 10px", border: "1px solid #e5e7eb", fontWeight: 700, textAlign: "left", fontSize: 11, color: "#374151" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {top3.map((r, idx) => {
              const s = rankStyle(idx);
              return (
                <tr key={r.diseaseCode} style={{ background: s.bg }}>
                  <td style={{ padding: "8px 10px", fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, color: s.text, fontSize: 11 }}>{r.diseaseCode}</td>
                  <td style={{ padding: "8px 10px", fontWeight: 600, color: s.text }}>{r.diseaseName}</td>
                  <td style={{ padding: "8px 10px", fontFamily: "'JetBrains Mono',monospace" }}>{r.combinedCF}</td>
                  <td style={{ padding: "8px 10px", fontWeight: 700, color: s.accent, fontFamily: "'JetBrains Mono',monospace" }}>{r.percentage}%</td>
                  <td style={{ padding: "8px 10px" }}>{r.matchedCodes.join(", ")}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Main Explanation Component ──────────────────────────────────
const TABS = [
  { id: "gejala",       label: "Kontribusi Gejala" },
  { id: "rule",         label: "Jejak Aturan" },
  { id: "hitungan",     label: "Langkah Perhitungan" },
  { id: "perbandingan", label: "Perbandingan" },
];

export default function ExplanationFacility({ diagnosisData, rulesData }) {
  const [activeTab, setActiveTab] = useState("gejala");

  if (!diagnosisData) return (
    <div style={{ padding: 28, textAlign: "center", color: "#92400e", background: "#fffbeb", border: "2px dashed #fde68a", borderRadius: 10 }}>
      Jalankan diagnosis terlebih dahulu.
    </div>
  );

  const hasAnyResult = diagnosisData.sortedCF.some(r => r.percentage > 0);
  const answeredCount = Object.values(diagnosisData.selectedSymptoms).filter(v => v > 0).length;
  const activeRules = Object.values(diagnosisData.cfResults || {}).filter(r => r.matchedCodes.length > 0).length;

  return (
    <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      {/* Summary cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 10, marginBottom: 20 }}>
        {[
          { label: "Gejala Dipilih", val: answeredCount, sub: `dari ${Object.keys(SYMPTOMS).length} tersedia`, color: "#ecfdf5", text: "#065f46" },
          { label: "Aturan Aktif", val: activeRules, sub: "dari 10 aturan penyakit", color: "#eff6ff", text: "#1e40af" },
          { label: "Diagnosa Utama", val: hasAnyResult ? diagnosisData.sortedCF[0].percentage + "%" : "—", sub: hasAnyResult ? diagnosisData.sortedCF[0].diseaseName : "Tidak ditemukan", color: "#fdf4ff", text: "#7e22ce" },
          { label: "Waktu", val: diagnosisData.timestamp.split(",")[1]?.trim() || "—", sub: diagnosisData.timestamp.split(",")[0] || "", color: "#fffbeb", text: "#92400e" },
        ].map(card => (
          <div key={card.label} style={{ padding: "12px 14px", borderRadius: 10, background: card.color }}>
            <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: card.text, opacity: 0.7, marginBottom: 4 }}>{card.label}</p>
            <p style={{ fontSize: 18, fontWeight: 800, color: card.text, lineHeight: 1.1, marginBottom: 3 }}>{card.val}</p>
            <p style={{ fontSize: 11, color: card.text, opacity: 0.6 }}>{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Tab navigation */}
      <div style={{ display: "flex", gap: 4, borderBottom: "2px solid #e5e7eb", marginBottom: 20 }}>
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            style={{
              padding: "8px 16px", fontSize: 12, fontWeight: activeTab === t.id ? 600 : 400,
              border: "none", background: "none", cursor: "pointer",
              color: activeTab === t.id ? "#1e5224" : "#6b7280",
              borderBottom: activeTab === t.id ? "2px solid #1e5224" : "2px solid transparent",
              marginBottom: -2, transition: "all 0.15s",
            }}
          >{t.label}</button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "gejala"       && <TabGejala diagnosisData={diagnosisData} />}
      {activeTab === "rule"         && <TabRuleTrace diagnosisData={diagnosisData} RULES_DATA={rulesData} />}
      {activeTab === "hitungan"     && <TabHitungan diagnosisData={diagnosisData} />}
      {activeTab === "perbandingan" && <TabPerbandingan diagnosisData={diagnosisData} />}
    </div>
  );
}