# Pepper Expert System

Expert System for Pepper Plant Disease Diagnosis using **Certainty Factor (CF)** and **Naïve Bayes** methods.

## Prerequisites

Pastikan sudah menginstall:

* Node.js (v18 atau lebih baru)
* npm

Cek instalasi:

```bash
node -v
npm -v
```

## Installation

Clone repository:

```bash
git clone <repository-url>
```

Masuk ke folder project:

```bash
cd pepper-expert-system
```

Install dependencies:

```bash
npm install
```

## Running the Application

Jalankan development server:

```bash
npm run dev
```

Jika berhasil, terminal akan menampilkan alamat seperti:

```text
Local: http://localhost:5173/
```

Buka alamat tersebut di browser.

## Project Structure

```text
pepper-expert-system
│
├── public/
├── src/
│   ├── assets/
│   ├── App.jsx
│   ├── PepperExpertSystem.jsx
│   ├── App.css
│   ├── index.css
│   └── main.jsx
│
├── package.json
├── vite.config.js
└── README.md
```

## Main Components

### App.jsx

Entry component yang me-render sistem pakar.

### PepperExpertSystem.jsx

Komponen utama yang berisi:

* Knowledge Base
* Rule Base
* Certainty Factor Inference Engine
* Naïve Bayes Inference Engine
* Diagnosis Results
* Explanation Facility

## Features

* Disease diagnosis based on selected symptoms
* Certainty Factor calculation
* Naïve Bayes probability calculation
* Comparison between CF and Naïve Bayes results
* Explanation Facility for diagnosis reasoning
* Interactive symptom selection

## Reset Application

Untuk menghapus hasil diagnosis dan memulai kembali:

1. Klik tombol **Reset**
2. Atau refresh browser

## Troubleshooting

### npm command not found

Pastikan Node.js sudah terinstall dan sudah masuk ke PATH.

### Failed to resolve import

Pastikan file berikut berada di folder `src`:

```text
src/
├── App.jsx
└── PepperExpertSystem.jsx
```

### Port already in use

Jalankan:

```bash
npm run dev -- --port 3000
```

atau hentikan aplikasi lain yang menggunakan port yang sama.

## Authors

Final Project – Expert System for Pepper Plant Disease Diagnosis

Methods:

* Certainty Factor (CF)
* Naïve Bayes

Reference:
Karmila, Maria E., & Annafi' Franz (2021).
Expert System for Diagnosis of Pepper Plant Diseases Using Certainty Factor and Naïve Bayes Methods.
TEPIAN, 2(4).
