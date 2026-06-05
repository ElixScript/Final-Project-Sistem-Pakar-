import { useState, useEffect } from "react";
import {
  DISEASES, SYMPTOMS, RULES, CERTAINTY_LEVELS,
  FORWARD_SYMPTOMS, calculateCFForDisease, calculateDS,
  getNextQuestion, shouldTerminateEarly, MAX_QUESTIONS
} from "./rule.js";
import ExplanationFacility from "./ExplanationFacility.jsx";

// ── Icon components ─────────────────────────────────────────────
const LeafIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z"/>
    <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
  </svg>
);

const CheckCircleIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
    <polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
);

const ChevronIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6"/>
  </svg>
);

const RefreshIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10"/>
    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
  </svg>
);

const FlaskIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 3h6l3 7.5L12 21 6 10.5z"/>
    <path d="M6 10.5h12"/>
  </svg>
);

// ── Progress Step Indicator ─────────────────────────────────────
function StepIndicator({ current }) {
  const steps = [
    { id: "INITIAL",     label: "Gejala Awal",     num: 1 },
    { id: "QUESTIONING", label: "Investigasi",     num: 2 },
    { id: "RESULT",      label: "Hasil Diagnosis", num: 3 },
  ];
  const currentIdx = steps.findIndex(s => s.id === current);

  return (
    <div style={{
      position: "relative",
      width: "100%",
      maxWidth: 720,
      margin: "0 auto 36px",
      padding: "0 20px",
    }}>
      <div style={{
        position: "absolute",
        top: 18,
        left: "18%",
        right: "18%",
        height: 2,
        background: "var(--border)",
        zIndex: 0,
      }} />

      <div style={{
        position: "absolute",
        top: 18,
        left: "18%",
        width: currentIdx === 0 ? "0%" : currentIdx === 1 ? "32%" : "64%",
        height: 2,
        background: "var(--forest-400)",
        zIndex: 1,
        transition: "width 0.3s ease",
      }} />

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        alignItems: "start",
        position: "relative",
        zIndex: 2,
      }}>
        {steps.map((step, idx) => {
          const done = idx < currentIdx;
          const active = idx === currentIdx;

          return (
            <div key={step.id} style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              gap: 6,
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 14, fontWeight: 600, flexShrink: 0,
                background: done ? "var(--forest-500)" : active ? "var(--forest-700)" : "white",
                color: done || active ? "white" : "var(--text-muted)",
                border: done || active ? "none" : "2px solid var(--border)",
                boxShadow: active ? "0 0 0 4px rgba(46,132,56,0.15)" : "none",
                transition: "all 0.3s ease",
              }}>
                {done ? <CheckCircleIcon size={16} /> : step.num}
              </div>

              <span style={{
                fontSize: 11,
                fontWeight: active ? 600 : 400,
                color: active ? "var(--forest-700)" : done ? "var(--forest-500)" : "var(--text-faint)",
                whiteSpace: "nowrap",
              }}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Confidence Badge ────────────────────────────────────────────
function ConfidenceBadge({ pct }) {
  let color, label;
  if (pct >= 70) { color = "var(--forest-600)"; label = "Tinggi"; }
  else if (pct >= 40) { color = "var(--amber-500)"; label = "Sedang"; }
  else { color = "var(--rose-500)"; label = "Rendah"; }
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      fontSize: 11, fontWeight: 600, padding: "2px 10px",
      borderRadius: "var(--radius-full)", color,
      background: pct >= 70 ? "var(--forest-50)" : pct >= 40 ? "var(--amber-100)" : "var(--rose-100)",
      border: `1px solid ${pct >= 70 ? "var(--forest-200)" : pct >= 40 ? "#fde68a" : "#fecdd3"}`,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: color, display: "inline-block" }} />
      {label} ({pct}%)
    </span>
  );
}

// ── Progress Bar ────────────────────────────────────────────────
function ProgressBar({ pct, color = "var(--forest-500)", height = 8 }) {
  return (
    <div style={{
      width: "100%", height, borderRadius: "var(--radius-full)",
      background: "var(--surface-2)", overflow: "hidden",
    }}>
      <div className="bar-animated" style={{
        height: "100%", width: `${Math.min(pct, 100)}%`,
        background: color, borderRadius: "var(--radius-full)",
      }} />
    </div>
  );
}

function getCertaintyStyle(value) {
  if (value === 1) {
    return {
      border: "var(--forest-500)",
      bg: "var(--forest-50)",
      text: "var(--forest-700)",
      activeBg: "var(--forest-700)",
      shadow: "rgba(46,132,56,0.25)",
    };
  }

  if (value === 0.75) {
    return {
      border: "#60a5fa",
      bg: "#eff6ff",
      text: "#1d4ed8",
      activeBg: "#2563eb",
      shadow: "rgba(37,99,235,0.25)",
    };
  }

  if (value === 0.5) {
    return {
      border: "var(--rose-500)",
      bg: "var(--rose-100)",
      text: "var(--rose-500)",
      activeBg: "var(--rose-500)",
      shadow: "rgba(225,29,72,0.25)",
    };
  }

  if (value === 0.25) {
    return {
      border: "var(--amber-500)",
      bg: "var(--amber-100)",
      text: "#92400e",
      activeBg: "var(--amber-500)",
      shadow: "rgba(217,119,6,0.25)",
    };
  }

  return {
    border: "var(--border)",
    bg: "white",
    text: "var(--text-secondary)",
    activeBg: "var(--slate-700)",
    shadow: "rgba(51,65,85,0.18)",
  };
}

// ── Certainty Select ────────────────────────────────────────────
function CertaintySelect({ value, onChange }) {
  const options = [
    { value: 0, label: "Tidak Ada", icon: "○" },
    ...CERTAINTY_LEVELS.map(l => ({ ...l, icon: l.value >= 0.75 ? "●" : l.value >= 0.5 ? "◕" : "◑" })),
  ];
  return (
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
      {options.map(opt => {
        const active = value === opt.value;
        const styleColor = getCertaintyStyle(opt.value);

        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            style={{
              padding: "6px 14px", fontSize: 12, fontWeight: active ? 600 : 400,
              borderRadius: "var(--radius-full)", cursor: "pointer", transition: "all 0.15s ease",
              border: `1.5px solid ${active ? styleColor.activeBg : styleColor.border}`,
              background: active ? styleColor.activeBg : styleColor.bg,
              color: active ? "white" : styleColor.text,
              boxShadow: active ? `0 2px 8px ${styleColor.shadow}` : "none",
            }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

// ── Screen 1: Initial Symptoms ─────────────────────────────────
function ScreenInitial({ initialAnswers, setInitialAnswers, onStart }) {
  return (
    <div className="animate-fade">
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 400, color: "var(--text-primary)", marginBottom: 8 }}>
          Identifikasi Gejala Awal
        </h2>
        <p style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.6 }}>
          Pilih tingkat keyakinan untuk setiap gejala yang Anda amati pada tanaman lada.
          Anda dapat memilih gejala yang diamati atau langsung memulai analisis.
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 28 }}>
        {FORWARD_SYMPTOMS.map((code, idx) => {
          const sym = SYMPTOMS[code];
          const val = initialAnswers[code];
          const isSelected = val > 0;
          return (
            <div
              key={code}
              className="animate-slide"
              style={{
                animationDelay: `${idx * 0.05}s`,
                padding: "16px 20px",
                borderRadius: "var(--radius-lg)",
                border: `1.5px solid ${isSelected ? "var(--forest-400)" : "var(--border)"}`,
                background: isSelected ? "var(--forest-50)" : "white",
                transition: "all 0.2s ease",
                boxShadow: isSelected ? "0 2px 12px rgba(46,132,56,0.12)" : "var(--shadow-sm)",
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 12 }}>
                <span style={{
                  flexShrink: 0, width: 28, height: 28, borderRadius: "var(--radius-sm)",
                  background: "var(--forest-100)", color: "var(--forest-700)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 11, fontWeight: 700, fontFamily: "var(--font-mono)",
                }}>{code}</span>
                <p style={{ fontSize: 13.5, fontWeight: 500, color: "var(--text-primary)", lineHeight: 1.5, flex: 1 }}>
                  {sym.name}
                </p>
              </div>
              <CertaintySelect
                value={val}
                onChange={(v) => setInitialAnswers(prev => ({ ...prev, [code]: v }))}
              />
            </div>
          );
        })}
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button
          onClick={onStart}
          style={{
            padding: "12px 32px", fontSize: 14, fontWeight: 600,
            borderRadius: "var(--radius-full)", border: "none", cursor: "pointer",
            background: "var(--forest-700)",
            color: "white",
            boxShadow: "0 4px 16px rgba(21,61,26,0.3)",
            transition: "all 0.2s ease",
            display: "flex", alignItems: "center", gap: 8,
          }}
        >
          Mulai Analisis <ChevronIcon />
        </button>
      </div>
    </div>
  );
}

// ── Screen 2: Dynamic Questioning ─────────────────────────────
function ScreenQuestioning({ answeredSymptoms, questionCount, maxQuestions, onAnswer, onFinalize }) {
  const currentQ = getNextQuestion(answeredSymptoms);
  if (!currentQ) { onFinalize(); return null; }

  const progress = Math.round((questionCount / maxQuestions) * 100);

  // Quick peek at top hypothesis
  const cfResults = {};
  Object.keys(DISEASES).forEach(p => { cfResults[p] = calculateCFForDisease(p, answeredSymptoms); });
  const topResult = Object.values(cfResults).sort((a, b) => b.percentage - a.percentage)[0];

  return (
    <div className="animate-fade">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 400, color: "var(--text-primary)", marginBottom: 4 }}>
            Sesi Investigasi
          </h2>
          <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
            Pertanyaan {questionCount} dari maks. {maxQuestions}
          </p>
        </div>
        <button
          onClick={() => onFinalize()}
          style={{
            padding: "8px 18px", fontSize: 12, fontWeight: 500,
            borderRadius: "var(--radius-full)", border: "1.5px solid var(--border)",
            background: "white", color: "var(--text-secondary)", cursor: "pointer",
          }}
        >
          Lihat Hasil Sekarang
        </button>
      </div>

      {/* Progress */}
      <div style={{ marginBottom: 24 }}>
        <ProgressBar pct={progress} />
      </div>

      {/* Hypothesis hint */}
      {currentQ.reasonHypothesis && topResult && topResult.percentage > 0 && (
        <div style={{
          padding: "10px 16px", borderRadius: "var(--radius-md)", marginBottom: 16,
          background: "var(--forest-50)", border: "1px solid var(--forest-200)",
          display: "flex", alignItems: "center", gap: 8,
        }}>
          <span style={{ fontSize: 14 }}>💡</span>
          <p style={{ fontSize: 12.5, color: "var(--forest-700)" }}>
            Sistem menguji hipotesis: <strong>{currentQ.reasonName}</strong>
            {topResult.percentage > 0 && <span style={{ marginLeft: 6 }}><ConfidenceBadge pct={topResult.percentage} /></span>}
          </p>
        </div>
      )}

      {/* Main question card */}
      <div style={{
        padding: "28px 28px 24px", borderRadius: "var(--radius-xl)",
        background: "white", border: "1.5px solid var(--border)",
        boxShadow: "var(--shadow-lg)", marginBottom: 20,
      }}>
        <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
          <span style={{
            flexShrink: 0, padding: "4px 12px", borderRadius: "var(--radius-full)",
            background: "var(--forest-100)", color: "var(--forest-700)",
            fontSize: 12, fontWeight: 700, fontFamily: "var(--font-mono)",
            display: "inline-flex", alignItems: "center",
          }}>{currentQ.symptomCode}</span>
        </div>

        <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>
          Apakah tanaman mengalami gejala berikut?
        </p>
        <p style={{ fontSize: 18, fontWeight: 500, color: "var(--text-primary)", lineHeight: 1.55, marginBottom: 28 }}>
          {currentQ.symptomName}
        </p>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {CERTAINTY_LEVELS.map(lvl => {
            const tone = getCertaintyStyle(lvl.value);

            return (
              <button
                key={lvl.value}
                onClick={() => onAnswer(currentQ.symptomCode, lvl.value)}
                style={{
                  padding: "10px 20px", fontSize: 13, fontWeight: 500,
                  borderRadius: "var(--radius-full)", border: `1.5px solid ${tone.border}`,
                  background: tone.bg, color: tone.text,
                  cursor: "pointer", transition: "all 0.15s ease",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = tone.activeBg;
                  e.currentTarget.style.color = "white";
                  e.currentTarget.style.borderColor = tone.activeBg;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = tone.bg;
                  e.currentTarget.style.color = tone.text;
                  e.currentTarget.style.borderColor = tone.border;
                }}
              >
                Ya — {lvl.label}
              </button>
            );
          })}
          <button
            onClick={() => onAnswer(currentQ.symptomCode, 0)}
            style={{
              padding: "10px 20px", fontSize: 13, fontWeight: 500,
              borderRadius: "var(--radius-full)", border: "1.5px solid var(--border)",
              background: "var(--surface-2)", color: "var(--text-muted)",
              cursor: "pointer", transition: "all 0.15s ease",
            }}
          >
            Tidak / Lewati
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Screen 3: Results ──────────────────────────────────────────
function ScreenResult({ diagnosisData, onReset }) {
  const [activeSection, setActiveSection] = useState("overview");
  const { sortedCF, dsResults, selectedSymptoms } = diagnosisData;
  const topDisease = sortedCF[0];
  const answeredCount = Object.values(selectedSymptoms).filter(v => v > 0).length;

  const methodLabels = [
    { id: "overview",    label: "Ringkasan" },
    { id: "explanation", label: "Penjelasan" },
  ];

  return (
    <div className="animate-fade">
      {/* Hero result */}
      <div style={{
        padding: "32px 32px 28px", borderRadius: "var(--radius-xl)",
        background: "linear-gradient(135deg, var(--forest-900) 0%, var(--forest-700) 100%)",
        color: "white", marginBottom: 24, position: "relative", overflow: "hidden",
      }}>
        {/* Decorative circles */}
        <div style={{ position: "absolute", top: -40, right: -40, width: 180, height: 180, borderRadius: "50%", background: "rgba(255,255,255,0.04)" }} />
        <div style={{ position: "absolute", bottom: -20, right: 60, width: 100, height: 100, borderRadius: "50%", background: "rgba(255,255,255,0.04)" }} />

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", opacity: 0.6, marginBottom: 8 }}>
              Diagnosa Utama
            </p>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 400, marginBottom: 12, lineHeight: 1.2 }}>
              {topDisease.diseaseName}
            </h2>
            <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
              <span style={{ fontSize: 32, fontWeight: 800, fontFamily: "var(--font-mono)", color: "var(--forest-300)" }}>
                {topDisease.percentage}%
              </span>
              <div>
                <p style={{ fontSize: 11, opacity: 0.6, marginBottom: 2 }}>Certainty Factor</p>
                <div style={{ width: 160 }}>
                  <ProgressBar pct={topDisease.percentage} color="var(--forest-300)" height={6} />
                </div>
              </div>
            </div>
          </div>
          <button
            onClick={onReset}
            style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "10px 20px", fontSize: 13, fontWeight: 500,
              borderRadius: "var(--radius-full)", border: "1.5px solid rgba(255,255,255,0.25)",
              background: "rgba(255,255,255,0.1)", color: "white", cursor: "pointer",
              backdropFilter: "blur(4px)",
            }}
          >
            <RefreshIcon /> Ulangi Diagnosis
          </button>
        </div>

        {/* Stats row */}
        <div style={{ display: "flex", gap: 24, marginTop: 24, paddingTop: 20, borderTop: "1px solid rgba(255,255,255,0.12)" }}>
          {[
            { label: "Gejala Diamati", val: answeredCount },
            { label: "Aturan Cocok", val: topDisease.matchedCodes.length },
            { label: "Kode Penyakit", val: topDisease.diseaseCode },
            { label: "Waktu", val: diagnosisData.timestamp.split(",")[1]?.trim() || diagnosisData.timestamp },
          ].map(stat => (
            <div key={stat.label}>
              <p style={{ fontSize: 10, opacity: 0.55, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 2 }}>{stat.label}</p>
              <p style={{ fontSize: 15, fontWeight: 600 }}>{stat.val}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Section nav */}
      <div style={{ display: "flex", gap: 4, marginBottom: 20, borderBottom: "1.5px solid var(--border)", paddingBottom: 0 }}>
        {methodLabels.map(m => (
          <button key={m.id} onClick={() => setActiveSection(m.id)} style={{
            padding: "9px 20px", fontSize: 13, fontWeight: activeSection === m.id ? 600 : 400,
            border: "none", background: "none", cursor: "pointer", borderRadius: "var(--radius-md) var(--radius-md) 0 0",
            color: activeSection === m.id ? "var(--forest-700)" : "var(--text-muted)",
            borderBottom: activeSection === m.id ? "2px solid var(--forest-600)" : "2px solid transparent",
            marginBottom: -1.5, transition: "all 0.15s ease",
          }}>
            {m.label}
          </button>
        ))}
      </div>

      {activeSection === "overview" && (
        <div className="animate-fade">
          {/* Comparison: CF vs DS side by side */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
            {[
              { title: "Certainty Factor (CF)", data: sortedCF.slice(0, 5), accentColor: "var(--forest-600)", bgColor: "var(--forest-50)" },
              { title: "Dempster-Shafer (D-S)", data: dsResults.slice(0, 5), accentColor: "#7c3aed", bgColor: "#f5f3ff" },
            ].map(panel => (
              <div key={panel.title} style={{
                padding: "20px", borderRadius: "var(--radius-lg)",
                border: "1.5px solid var(--border)", background: "white", boxShadow: "var(--shadow-sm)",
              }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: panel.accentColor, marginBottom: 16, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  {panel.title}
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {panel.data.filter(r => r.percentage > 0).slice(0, 4).map((r, idx) => (
                    <div key={r.diseaseCode}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                        <span style={{ fontSize: 12, fontWeight: idx === 0 ? 600 : 400, color: idx === 0 ? "var(--text-primary)" : "var(--text-secondary)", maxWidth: "75%" }}>
                          {idx === 0 && <span style={{ marginRight: 4 }}>🥇</span>}
                          {idx === 1 && <span style={{ marginRight: 4 }}>🥈</span>}
                          {idx === 2 && <span style={{ marginRight: 4 }}>🥉</span>}
                          {r.diseaseName}
                        </span>
                        <span style={{ fontSize: 12, fontWeight: 700, fontFamily: "var(--font-mono)", color: panel.accentColor }}>
                          {r.percentage}%
                        </span>
                      </div>
                      <ProgressBar pct={r.percentage} color={panel.accentColor} height={5} />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Matched symptoms */}
          {topDisease.matchedCodes.length > 0 && (
            <div style={{
              padding: "20px", borderRadius: "var(--radius-lg)",
              border: "1.5px solid var(--forest-200)", background: "var(--forest-50)",
            }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: "var(--forest-700)", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Gejala Pendukung Diagnosa Utama
              </p>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {topDisease.matchedCodes.map(code => (
                  <div key={code} style={{
                    display: "flex", alignItems: "center", gap: 6,
                    padding: "6px 12px", borderRadius: "var(--radius-full)",
                    background: "white", border: "1px solid var(--forest-200)",
                    boxShadow: "var(--shadow-sm)",
                  }}>
                    <span style={{ fontSize: 11, fontWeight: 700, fontFamily: "var(--font-mono)", color: "var(--forest-600)" }}>{code}</span>
                    <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>{SYMPTOMS[code]?.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeSection === "explanation" && (
        <div className="animate-fade">
          <ExplanationFacility diagnosisData={diagnosisData} rulesData={RULES} />
        </div>
      )}
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────
export default function PepperExpertSystem() {
  const [flowState, setFlowState] = useState("INITIAL");
  const [answeredSymptoms, setAnsweredSymptoms] = useState({});
  const [diagnosisData, setDiagnosisData] = useState(null);
  const [initialAnswers, setInitialAnswers] = useState({ G9: 0, G4: 0, G10: 0, G1: 0, G3: 0 });
  const [questionCount, setQuestionCount] = useState(0);
  const [allInitialZero, setAllInitialZero] = useState(false);

  const handleStartInvestigation = () => {
    setAllInitialZero(Object.values(initialAnswers).every(v => v === 0));
    setAnsweredSymptoms(initialAnswers);
    setQuestionCount(5);
    const cfResults = {};
    Object.keys(DISEASES).forEach(p => { cfResults[p] = calculateCFForDisease(p, initialAnswers); });
    const sortedCF = Object.values(cfResults).sort((a, b) => b.percentage - a.percentage);
    if (sortedCF[0]?.percentage >= 80) {
      finalizeDiagnosis(initialAnswers);
    } else {
      setFlowState("QUESTIONING");
    }
  };

  const handleAnswerQuestion = (symCode, cfValue) => {
    const newAnswered = { ...answeredSymptoms, [symCode]: cfValue };
    const newCount = questionCount + 1;
    const effectiveMax = allInitialZero ? Object.keys(SYMPTOMS).length : MAX_QUESTIONS;
    setAnsweredSymptoms(newAnswered);
    setQuestionCount(newCount);
    if (shouldTerminateEarly(newAnswered) || newCount >= effectiveMax) {
      finalizeDiagnosis(newAnswered); return;
    }
    const nextQ = getNextQuestion(newAnswered);
    if (!nextQ) finalizeDiagnosis(newAnswered);
  };

  const finalizeDiagnosis = (answersToUse = answeredSymptoms) => {
    const cfResults = {};
    Object.keys(DISEASES).forEach(p => { cfResults[p] = calculateCFForDisease(p, answersToUse); });
    const sortedCF = Object.values(cfResults).sort((a, b) => b.percentage - a.percentage);
    const dsResults = calculateDS(answersToUse);
    setDiagnosisData({ selectedSymptoms: answersToUse, cfResults, sortedCF, dsResults, timestamp: new Date().toLocaleString("id-ID") });
    setFlowState("RESULT");
  };

  const handleReset = () => {
    setFlowState("INITIAL"); setAnsweredSymptoms({}); setDiagnosisData(null);
    setInitialAnswers({ G9: 0, G4: 0, G10: 0, G1: 0, G3: 0 }); setQuestionCount(0); setAllInitialZero(false);
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(160deg, #edf5ee 0%, #f5f7f5 40%, #f8faf5 100%)",
      fontFamily: "var(--font-body)",
    }}>
      {/* Header */}
      <header style={{
        borderBottom: "1px solid var(--border)",
        background: "rgba(255,255,255,0.85)",
        backdropFilter: "blur(12px)",
        position: "sticky", top: 0, zIndex: 100,
      }}>
        <div style={{ maxWidth: 860, margin: "0 auto", padding: "0 24px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 34, height: 34, borderRadius: "var(--radius-sm)",
              background: "var(--forest-700)", display: "flex", alignItems: "center", justifyContent: "center",
              color: "white",
            }}>
              <LeafIcon />
            </div>
            <div>
              <p style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", lineHeight: 1.1 }}>
                SiPakar Lada
              </p>
              <p style={{ fontSize: 10, color: "var(--text-faint)", fontFamily: "var(--font-mono)" }}>
                Expert System v1.0
              </p>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: "var(--radius-full)", background: "var(--forest-50)", color: "var(--forest-700)", border: "1px solid var(--forest-200)", fontWeight: 500 }}>
              CF + D-S
            </span>
            <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: "var(--radius-full)", background: "var(--forest-50)", color: "var(--forest-700)", border: "1px solid var(--forest-200)", fontWeight: 500 }}>
              Forward-Backward Chaining
            </span>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main style={{ maxWidth: 860, margin: "0 auto", padding: "36px 24px 60px" }}>
        {/* Title */}
        <div style={{ marginBottom: 36, textAlign: "center" }}>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 38, fontWeight: 400, color: "var(--text-primary)", lineHeight: 1.1, marginBottom: 10 }}>
            Sistem Pakar Penyakit<br />
            <em style={{ color: "var(--forest-600)" }}>Tanaman Lada</em>
          </h1>
          <p style={{ fontSize: 14, color: "var(--text-muted)", maxWidth: 500, margin: "0 auto", lineHeight: 1.65 }}>
            Diagnosis berbasis kecerdasan buatan menggunakan metode{" "}
            <strong>Certainty Factor</strong> dan <strong>Dempster-Shafer</strong>{" "}
            untuk mendeteksi penyakit pada tanaman lada.
          </p>
        </div>

        {/* Step indicator */}
        <StepIndicator current={flowState} />

        {/* Screen container */}
        <div style={{
          padding: "32px", borderRadius: "var(--radius-xl)",
          background: "white", boxShadow: "var(--shadow-xl)",
          border: "1.5px solid var(--border)",
        }}>
          {flowState === "INITIAL" && (
            <ScreenInitial
              initialAnswers={initialAnswers}
              setInitialAnswers={setInitialAnswers}
              onStart={handleStartInvestigation}
            />
          )}
          {flowState === "QUESTIONING" && (
            <ScreenQuestioning
              answeredSymptoms={answeredSymptoms}
              questionCount={questionCount}
              maxQuestions={allInitialZero ? Object.keys(SYMPTOMS).length : MAX_QUESTIONS}
              onAnswer={handleAnswerQuestion}
              onFinalize={finalizeDiagnosis}
            />
          )}
          {flowState === "RESULT" && diagnosisData && (
            <ScreenResult diagnosisData={diagnosisData} onReset={handleReset} />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer style={{
        borderTop: "1px solid var(--border)",
        padding: "16px 24px", textAlign: "center",
      }}>
        <p style={{ fontSize: 11, color: "var(--text-faint)" }}>
          Sistem Pakar Penyakit Tanaman Lada · Certainty Factor & Dempster-Shafer · Karmila et al., TEPIAN 2021
        </p>
      </footer>
    </div>
  );
}
