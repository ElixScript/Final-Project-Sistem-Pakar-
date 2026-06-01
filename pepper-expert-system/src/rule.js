// ================================================================
// KNOWLEDGE BASE  —  Karmila et al., TEPIAN 2021 (Tabel 2, 3, 4)
// ================================================================

/**
 * Daftar penyakit tanaman lada beserta bobot kepercayaan pakar.
 * Nama telah diterjemahkan ke Bahasa Indonesia sesuai istilah agrikultur baku.
 */
export const DISEASES = {
  P1:  { name: "Penyakit Busuk Batang",                    weight: 0.7 },
  P2:  { name: "Penyakit Kuning (Yellowing)",              weight: 0.6 },
  P3:  { name: "Penyakit Keriting dan Kerdil",             weight: 0.7 },
  P4:  { name: "Penyakit Jamur Kulit Lada",               weight: 0.6 },
  P5:  { name: "Penyakit Jamur Marasmius",                weight: 0.5 },
  P6:  { name: "Penyakit Pirang (Blonde) Lada",           weight: 0.7 },
  P7:  { name: "Penyakit Bercak Daun Lada",               weight: 0.6 },
  P8:  { name: "Penyakit Karat Merah Daun Lada",          weight: 0.5 },
  P9:  { name: "Penyakit Busuk Buah Lada",                weight: 0.5 },
  P10: { name: "Penyakit Busuk Akar Lada",                weight: 0.7 },
};

/**
 * Daftar gejala penyakit tanaman lada beserta bobot CF pakar CF(H,E).
 * Nama telah diterjemahkan ke Bahasa Indonesia sesuai istilah agrikultur baku.
 */
export const SYMPTOMS = {
  G1:  { name: "Batang berwarna hitam kebiruan dan berlendir",                       weight: 0.6 },
  G2:  { name: "Terdapat lendir pada tanaman lada",                                  weight: 0.4 },
  G3:  { name: "Daun lada berwarna kuning pucat",                                    weight: 0.2 },
  G4:  { name: "Daun berubah menjadi kuning",                                        weight: 0.4 },
  G5:  { name: "Akar lada terputus",                                                 weight: 0.6 },
  G6:  { name: "Terdapat bulu emas pada tanaman lada",                               weight: 0.4 },
  G7:  { name: "Penyakit tidak mematikan tanaman namun menghambat pertumbuhan",      weight: 0.4 },
  G8:  { name: "Daun lada mengkerut (keriting)",                                     weight: 0.4 },
  G9:  { name: "Ukuran buah lada lebih kecil dari normal",                           weight: 0.6 },
  G10: { name: "Bercak memiliki lingkaran dengan titik di tengah",                   weight: 0.4 },
  G11: { name: "Daun menggulung ke atas, keriting, dan berbercak",                   weight: 0.6 },
  G12: { name: "Pertumbuhan tanaman terhambat (kerdil)",                             weight: 0.6 },
  G13: { name: "Daun mengering",                                                     weight: 0.2 },
  G14: { name: "Cabang dan batang lada terdapat benang jamur putih mengkilap",       weight: 0.4 },
  G15: { name: "Terdapat benang putih (miselium) pada tanaman",                     weight: 0.6 },
  G16: { name: "Daun mengering dan mati",                                            weight: 0.1 },
  G17: { name: "Ukuran buah relatif lebih kecil dari ukuran normal",                 weight: 0.6 },
  G18: { name: "Cabang dan ranting diselimuti jamur perak (silver mushroom)",        weight: 0.6 },
  G19: { name: "Terdapat jamur Septosidium pada seluruh bagian tanaman",             weight: 0.6 },
  G20: { name: "Bercak abu-abu pada daun lada",                                     weight: 0.6 },
  G21: { name: "Terdapat bercak di tengah atau tepi daun",                           weight: 0.4 },
  G22: { name: "Bercak cokelat pada daun lada",                                     weight: 0.6 },
  G23: { name: "Bercak hitam pada daun lada",                                       weight: 0.4 },
  G24: { name: "Daun memiliki bercak berwarna merah kehijauan",                      weight: 0.4 },
  G25: { name: "Buah lada terdapat bintik-bintik kecil",                            weight: 0.6 },
  G26: { name: "Terdapat bintik hitam pada buah lada",                              weight: 0.4 },
  G27: { name: "Akar lada membusuk",                                                weight: 0.6 },
  G28: { name: "Terdapat lendir kebiruan pada akar tanaman",                         weight: 0.4 },
  G29: { name: "Akar lada berwarna hitam",                                           weight: 0.2 },
};

/**
 * Basis Aturan (Rule Base) — Tabel 4:  JIKA (gejala)  MAKA  penyakit
 */
export const RULES = {
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

/**
 * Tingkat keyakinan pengguna — Tabel 1
 * CF(E,e) — nilai yang diberikan pengguna terhadap suatu gejala.
 */
export const CERTAINTY_LEVELS = [
  { label: "Sangat Yakin",  value: 1.00 },
  { label: "Yakin",         value: 0.75 },
  { label: "Tidak Yakin",   value: 0.50 },
  { label: "Ragu-Ragu",     value: 0.25 },
];

export const FORWARD_SYMPTOMS = ["G9", "G4", "G10", "G1", "G3"];
export const MAX_QUESTIONS = 12;
export const CF_THRESHOLD = 60;
export const CF_GAP = 15;

// ================================================================
// INFERENCE ENGINE — CERTAINTY FACTOR
// ================================================================

/**
 * Rumus kombinasi CF sekuensial (persamaan 2 pada makalah):
 *   CFcombine = CF1 + CF2 × (1 - CF1)
 *
 * @param {number} cf1 - CF lama (hasil kombinasi sebelumnya)
 * @param {number} cf2 - CF baru yang akan dikombinasikan
 * @returns {number} Nilai CF hasil kombinasi
 */
export function combineCF(cf1, cf2) {
  return cf1 + cf2 * (1 - cf1);
}

/**
 * Menghitung Certainty Factor untuk satu penyakit berdasarkan gejala yang dipilih pengguna.
 *
 * @param {string}  diseaseCode       - Kode penyakit, misalnya "P1"
 * @param {Object}  selectedSymptoms  - { G1: 0.75, G3: 0.5, ... }  (0 = tidak dipilih)
 * @returns {Object} Hasil CF lengkap — termasuk langkah-langkah antara untuk Fasilitas Penjelasan.
 *
 * Bentuk objek yang dikembalikan:
 * {
 *   diseaseCode,   diseaseName,
 *   combinedCF,    percentage,
 *   matchedCodes,                 // ["G1","G3"] — gejala yang cocok dengan aturan penyakit ini
 *   symptomCFs: [{                // rincian per gejala
 *     code, name,
 *     cfHE,  // CF(H,E) — bobot pakar dari basis pengetahuan
 *     cfEe,  // CF(E,e) — keyakinan yang diberikan pengguna
 *     cfHe,  // CF(H,e) = cfHE × cfEe — CF final per gejala
 *   }],
 *   combinationSteps: [{          // log kombinasi sekuensial
 *     step, description, result
 *   }],
 * }
 */
export function calculateCFForDisease(diseaseCode, selectedSymptoms) {
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

  // Kombinasi sekuensial dengan log lengkap (untuk Fasilitas Penjelasan)
  const combinationSteps = [];
  let combined = symptomCFs[0].cfHe;
  combinationSteps.push({
    step: 1,
    description: `CF_${symptomCFs[0].code} = CF(H,E) × CF(E,e) = ${symptomCFs[0].cfHE} × ${symptomCFs[0].cfEe}`,
    result: combined,
  });

  for (let i = 1; i < symptomCFs.length; i++) {
    const prev = combined;
    combined = combineCF(prev, symptomCFs[i].cfHe);
    combinationSteps.push({
      step: i + 1,
      description:
        `CF_combine(CF_lama=${prev.toFixed(4)}, CF_${symptomCFs[i].code}=${symptomCFs[i].cfHe.toFixed(4)}) ` +
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

// Inference Engine — Dempster-Shafer Theory (DST)
function combineDS(m1, m2, OMEGA) {
  const m_new = {};
  let K = 0;
  for (const [set1, prob1] of Object.entries(m1)) {
    const arr1 = set1 === "OMEGA" ? OMEGA : set1.split(",");
    for (const [set2, prob2] of Object.entries(m2)) {
      const arr2 = set2 === "OMEGA" ? OMEGA : set2.split(",");
      let intersect = arr1.filter(x => arr2.includes(x));
      const prob = prob1 * prob2;
      if (intersect.length === 0) K += prob;
      else {
        const key = intersect.length === OMEGA.length ? "OMEGA" : intersect.sort().join(",");
        m_new[key] = (m_new[key] || 0) + prob;
      }
    }
  }
  if (K >= 1) return { "OMEGA": 1.0 };
  const final_m = {};
  for (const [set, prob] of Object.entries(m_new)) final_m[set] = prob / (1 - K);
  return final_m;
}

export function calculateDS(selectedSymptoms) {
  const OMEGA = Object.keys(DISEASES);
  const SYMPTOM_TO_DISEASES = {};
  for (const [p, symptoms] of Object.entries(RULES)) {
    for (const g of symptoms) {
      if (!SYMPTOM_TO_DISEASES[g]) SYMPTOM_TO_DISEASES[g] = [];
      SYMPTOM_TO_DISEASES[g].push(p);
    }
  }

  let currentMass = { "OMEGA": 1.0 };
  const validEntries = Object.entries(selectedSymptoms).filter(([g, cf]) => cf > 0);
  if (validEntries.length === 0) return [];

  for (const [g, cf] of validEntries) {
    const weight = SYMPTOMS[g].weight;
    const m_subset = weight * cf;
    const m_omega = 1 - m_subset;
    const subsetArr = SYMPTOM_TO_DISEASES[g] || [];
    if (subsetArr.length === 0) continue;
    
    currentMass = combineDS(currentMass, { [subsetArr.sort().join(",")]: m_subset, "OMEGA": m_omega }, OMEGA);
  }

  const pignistic = {};
  OMEGA.forEach(p => pignistic[p] = 0);
  for (const [setKey, mass] of Object.entries(currentMass)) {
    const arr = setKey === "OMEGA" ? OMEGA : setKey.split(",");
    const share = mass / arr.length;
    arr.forEach(p => { if(pignistic[p] !== undefined) pignistic[p] += share; });
  }

  return Object.entries(pignistic)
    .map(([pCode, prob]) => ({ diseaseCode: pCode, diseaseName: DISEASES[pCode].name, percentage: parseFloat((prob * 100).toFixed(2)) }))
    .sort((a, b) => b.percentage - a.percentage);
}

export function shouldTerminateEarly(answeredSymptoms) {
  const cfResults = {};
  Object.keys(DISEASES).forEach((p) => { cfResults[p] = calculateCFForDisease(p, answeredSymptoms); });
  const sortedCF = Object.values(cfResults).sort((a, b) => b.percentage - a.percentage);

  if (sortedCF.length === 0 || sortedCF[0].percentage === 0) return false;

  const top = sortedCF[0];
  const gap = sortedCF.length > 1 ? top.percentage - sortedCF[1].percentage : 100;

  if (top.percentage >= CF_THRESHOLD && gap >= CF_GAP) return true;

  const allTopSymptoms = RULES[top.diseaseCode];
  const allAnswered = allTopSymptoms.every((sym) => answeredSymptoms[sym] !== undefined);
  if (allAnswered) return true;

  return false;
}

// DYNAMIC FORWARD-BACKWARD CHAINING ENGINE (Interogasi)
export function getNextQuestion(answeredSymptoms) {
  for (const sym of FORWARD_SYMPTOMS) {
    if (answeredSymptoms[sym] === undefined) {
      return { symptomCode: sym, symptomName: SYMPTOMS[sym].name, reasonHypothesis: null, reasonName: null };
    }
  }

  const cfResults = {};
  Object.keys(DISEASES).forEach((p) => { cfResults[p] = calculateCFForDisease(p, answeredSymptoms); });
  const activeHypotheses = Object.values(cfResults).filter((r) => r.percentage > 0).sort((a, b) => b.percentage - a.percentage);

  for (const hyp of activeHypotheses) {
    for (const sym of RULES[hyp.diseaseCode]) {
      if (answeredSymptoms[sym] === undefined) {
        return { symptomCode: sym, symptomName: SYMPTOMS[sym].name, reasonHypothesis: hyp.diseaseCode, reasonName: hyp.diseaseName };
      }
    }
  }
  for (const sym of Object.keys(SYMPTOMS)) {
    if (answeredSymptoms[sym] === undefined) {
      return { symptomCode: sym, symptomName: SYMPTOMS[sym].name, reasonHypothesis: null, reasonName: null };
    }
  }
  return null;
}