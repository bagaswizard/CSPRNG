# Secure Digital Document Signing (SDDS)

Platform berbasis web yang aman untuk menandatangani dan memverifikasi dokumen digital, dengan mengintegrasikan Pembangkit Bilangan Acak Kriptografis Kuat (CSPRNG) sebagai fondasi untuk pembangkitan kunci RSA dan nonces/salts.

## 📋 Fitur Utama

1.  **CSPRNG Engine & Entropy Collector**: Mengumpulkan entropi dari pergerakan mouse pengguna untuk memperkuat inisialisasi *random number generator* sebelum kunci dibuat.
2.  **Key Management (RSA)**: Membangkitkan pasangan kunci RSA-2048 bit menggunakan standar Web Crypto API yang aman.
3.  **Digital Signing**: Menandatangani hash dokumen (SHA-256) yang dikombinasikan dengan *salt* unik untuk mencegah serangan *replay*.
4.  **Verification**: Verifikasi validitas dokumen menggunakan Public Key dan metadata QR Code (Hash + Salt + Signature).

---

## 🚀 Cara Menjalankan (Local Development)

Kode yang disediakan menggunakan React dengan TypeScript. Berikut adalah cara menyiapkannya di komputer lokal Anda.

### 1. Prasyarat

Pastikan Anda telah menginstal:
*   [Node.js](https://nodejs.org/) (Versi 16+)
*   npm (Node Package Manager)

### 2. Inisialisasi Proyek

Kami menyarankan menggunakan **Vite** karena cepat dan ringan. Buka terminal dan jalankan:

```bash
npm create vite@latest sdds-app -- --template react-ts
cd sdds-app
```

### 3. Instalasi Dependensi

Instal *library* yang digunakan dalam aplikasi ini:

```bash
npm install react react-dom recharts qrcode.react
npm install -D tailwindcss postcss autoprefixer
```

### 4. Konfigurasi Tailwind CSS

Inisialisasi konfigurasi Tailwind:

```bash
npx tailwindcss init -p
```

Buka file `tailwind.config.js` dan sesuaikan bagian `content` dan `theme` agar cocok dengan desain aplikasi:

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        brand: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        }
      }
    },
  },
  plugins: [],
}
```

Tambahkan *directives* Tailwind ke file CSS utama Anda (biasanya `src/index.css`):

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### 5. Menyalin Kode

Salin semua file komponen yang telah disediakan ke dalam folder `src/` proyek Anda dengan struktur sebagai berikut:

```
src/
├── components/
│   ├── DocumentSigner.tsx
│   ├── DocumentVerifier.tsx
│   ├── EntropyCollector.tsx
│   └── KeyGenerator.tsx
├── services/
│   ├── csprngService.ts
│   └── rsaService.ts
├── App.tsx
├── index.tsx (atau main.tsx)
└── types.ts
```

### 6. Menjalankan Server

Jalankan aplikasi:

```bash
npm run dev
```

Buka browser dan akses URL yang muncul (biasanya `http://localhost:5173`).

---

## 📖 Panduan Penggunaan

### Langkah 1: Pengumpulan Entropi (Entropy)
Saat aplikasi dibuka, sistem membutuhkan inisialisasi CSPRNG.
*   **Aksi**: Gerakkan mouse Anda secara acak di dalam kotak area yang disediakan.
*   **Tujuan**: Mengumpulkan data acak dari interaksi fisik untuk memastikan kunci yang dibuat tidak dapat ditebak.
*   Setelah indikator mencapai 100%, sistem siap.

### Langkah 2: Pembuatan Kunci (Key Management)
*   Klik tombol **"Generate New Key Pair"**.
*   Sistem akan membuat Private Key (disimpan di memori browser) dan Public Key (ditampilkan di layar).
*   **Catatan**: Private Key tidak pernah dikirim ke server dalam demo ini; keamanan sepenuhnya di sisi klien (*Client-Side*).

### Langkah 3: Menandatangani Dokumen (Sign)
1.  Pilih **Key ID** yang baru saja dibuat.
2.  Klik area upload dan pilih file (PDF, Gambar, atau Teks).
3.  Klik **"Cryptographically Sign Document"**.
4.  Aplikasi akan menghasilkan **QR Code** dan data teks yang berisi Hash Dokumen, Salt, dan Tanda Tangan Digital.

### Langkah 4: Verifikasi (Verification)
Untuk mensimulasikan penerima dokumen yang memverifikasi keaslian:
1.  Upload **file asli** yang sama persis dengan yang ditandatangani.
2.  Salin **Public Key** dari Langkah 2 dan tempel ke kolom "Signer's Public Key".
3.  Salin data string dari hasil Langkah 3 (format: `HASH|SALT|SIG`) ke kolom "Signature Data".
4.  Klik **"Verify Authenticity"**.

*   Jika file dimodifikasi sedikit saja, verifikasi akan **GAGAL**.
*   Jika menggunakan Public Key yang salah, verifikasi akan **GAGAL**.

---

## 🛠️ Teknologi

*   **Frontend**: React, TypeScript
*   **Styling**: Tailwind CSS
*   **Cryptography**: Web Crypto API (Standar browser native untuk operasi RSA & Hashing)
*   **Utilities**: 
    *   `recharts` (Visualisasi data entropi)
    *   `qrcode.react` (Generasi QR Code)
