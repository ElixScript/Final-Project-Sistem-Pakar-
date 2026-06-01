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
