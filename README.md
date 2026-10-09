# 🥗 FridgeFirst — Fridge First Recipe Planner

**FridgeFirst** adalah aplikasi full-stack modern yang membantu pengguna merencanakan masakan harian dengan prinsip **"Habiskan yang ada di kulkas terlebih dahulu"**. Dengan mengutamakan bahan yang hampir kedaluwarsa, FridgeFirst mencegah pemborosan makanan (*food waste*), menghemat biaya belanja, dan menghilangkan kebingungan memilih menu makanan sehari-hari.

---

## 🚀 Fitur Utama

1. **Landing Page Interaktif (`/`)**
   - Hero modern dengan headline: *"Masak dari yang sudah ada di kulkas."*
   - Subheadline ramah pengguna, CTA *"Mulai Masak Sekarang"* dan *"Lihat Demo Interaktif"*.
   - Showcase fitur: Fridge Inventory, Recipe Matching, Waste Score Priority, dan Smart Shopping List.
   - Section *"How it Works"* (3 langkah mudah), testimoni dummy, dan FAQ informatif.

2. **Dashboard Dapur (`/dashboard`)**
   - 4 Metrik Ringkasan: Total bahan di kulkas, resep yang bisa dimasak 100% hari ini, bahan segera kedaluwarsa, dan estimasi *food waste* yang berhasil dicegah (dalam kg).
   - Card **"Cook Now"**: 3 resep terbaik dengan prioritas Waste Score tertinggi.
   - Widget Bahan Mendekati Expired: Bahan dengan sisa masa simpan $\le 2$ hari.
   - Grafik Distribusi Kategori Bahan interaktif menggunakan **Recharts**.
   - Quick action bar: Tambah bahan, Bulk quick-add, dan jelajahi resep.

3. **Inventaris Kulkas (`/fridge`)**
   - Manajemen bahan lengkap: Nama, kategori, jumlah, satuan, tanggal kedaluwarsa, lokasi penyimpanan (*Chiller / Kulkas, Freezer, Rak / Pantry*), dan catatan.
   - 8 Kategori: Sayur, protein, karbohidrat, bumbu, dairy, buah, frozen, lainnya.
   - Tampilan card grid modern dengan badge status real-time:
     - 🟢 **Fresh** (> 5 hari)
     - 🟡 **Use Soon** (3–5 hari)
     - 🔴 **Expiring** (1–2 hari atau hari ini, dengan animasi detak)
     - ⚪ **Expired** (lewat tanggal kedaluwarsa)
   - Filter & pencarian cepat berdasarkan nama, kategori, lokasi, dan status kedaluwarsa.
   - Fitur **Bulk Add**: Mengetik beberapa nama bahan sekaligus (contoh: `telur, bawang merah, cabai rawit, nasi`) dengan auto-kategori dan auto shelf-life!
   - Fitur Edit dan Hapus bahan.

4. **Rekomendasi Resep Cerdas (`/recipes`)**
   - Daftar rekomendasi resep berdasarkan ketersediaan bahan kulkas user.
   - Setiap resep menampilkan:
     - Foto makanan berkualitas tinggi
     - Waktu masak (total menit) & tingkat kesulitan
     - Jumlah porsi
     - **Fridge Match (%)**: Persentase bahan resep yang sudah dimiliki user
     - **Waste Score (0–100)**: Seberapa efektif resep ini menyelamatkan bahan kritis
     - Daftar bahan yang masih kurang
   - Filter lengkap: Waktu masak ($\le 15$m, $\le 25$m, $\le 45$m), kategori, tingkat kesulitan, khusus vegetarian, dan hanya yang 100% bahan tersedia.
   - Pengurutan (*Sorting*):
     - 🔥 Waste Score tertinggi (prioritas bahan hampir expired)
     - ✨ Paling banyak bahan cocok (%)
     - 🛒 Paling sedikit bahan kurang
     - ⚡ Tercepat (waktu masak)

5. **Detail Resep & Cooking Mode (`/recipes/$recipeId`)**
   - Hero besar dengan foto resep, judul, durasi, porsi, difficulty, dan tags.
   - Progress bar **"Fridge Match"**: Contoh *"Kamu punya 8 dari 10 bahan (80%)"*.
   - Status visual tiap bahan:
     - 🟢 *Kamu Punya* (lengkap dengan lokasi penyimpanannya)
     - 🔴 *Hampir Expired* (peringatan masak segera)
     - ⚪ *Perlu Beli* (belum tersedia di kulkas)
   - Tombol **"Start Cooking Mode"**: Tampilan layar penuh (*fullscreen*) langkah per langkah dengan font besar, navigasi Sebelumnya/Berikutnya, progress bar memasak, dan animasi selebrasi *confetti* saat selesai memasak!
   - Tombol **"Tambah Bahan Kurang ke Shopping List"**: Otomatis memasukkan seluruh bahan yang belum dimiliki ke daftar belanja.

6. **Daftar Belanja Terintegrasi (`/shopping`)**
   - Menampilkan bahan yang kurang dari resep yang ingin dimasak, serta input manual belanjaan.
   - Checkbox interaktif untuk mencentang bahan yang sudah dibeli di pasar/supermarket.
   - **Fitur Transfer Otomatis ke Kulkas**: Begitu bahan dicentang sudah dibeli, banner interaktif menawarkan tombol *"Pindahkan ke Kulkas Sekarang"*, yang akan otomatis menambahkan bahan tersebut ke inventaris kulkas dengan masa simpan default.

7. **Profil & Preferensi (`/profile`)**
   - Pengaturan nama pengguna, porsi standar (default 2 orang), dan satuan (Metrik / Imperial).
   - Preferensi pola makan: *Halal, Vegetarian, Cepat Masak, Low Budget, Tinggi Serat*.
   - Filter alergi: *Kacang, Seafood/Udang, Dairy/Laktosa, Telur, Gluten*.

---

## 🛠️ Tech Stack

- **Framework**: [TanStack Start](https://tanstack.com/start) dengan **React 19**
- **Routing**: [TanStack Router](https://tanstack.com/router) (file-based routing di `src/routes`)
- **State & Data Fetching**: [TanStack Query v5](https://tanstack.com/query) & Route Loaders
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) dengan custom typography & design system
- **Komponen UI**: Polished modern design system (berdasarkan panduan shadcn/ui) dengan tema default light dan dark mode
- **Database & ORM**: PostgreSQL dengan [Drizzle ORM](https://orm.drizzle.team/)
  - *Dual Engine*: Mendukung server PostgreSQL native/cloud (Neon, Supabase, local PostgreSQL) via `DATABASE_URL`, serta embedded PostgreSQL zero-setup via **PGlite** (`@electric-sql/pglite`) untuk dev environment instan tanpa perlu install daemon eksternal.
- **Validasi Data**: [Zod v3](https://zod.dev/)
- **Ikon**: [Lucide React](https://lucide.dev/)
- **Grafik / Chart**: [Recharts v2](https://recharts.org/)
- **Selebrasi**: [Canvas Confetti](https://github.com/catdad/canvas-confetti)

---

## 📦 Struktur Folder

```text
Fridge First/
├── .data/                  # Persistent database directory (untuk mode embedded PGlite)
├── public/                 # Static assets
├── src/
│   ├── components/         # Reusable UI components (Header, Footer, ThemeToggle, dll)
│   ├── db/                 # Database configuration, schema, seed data, dan auto-init
│   │   ├── index.ts        # Inisialisasi koneksi Drizzle ORM (PostgreSQL & PGlite fallback)
│   │   ├── init.ts         # Script DDL tabel dan auto-seed database
│   │   ├── schema.ts       # Definisi schema database Drizzle (users, ingredients, recipes, dll)
│   │   └── seed-data.ts    # 67 Master bahan umum & 22 resep masakan realistis
│   ├── integrations/       # TanStack Query & devtools integration
│   ├── lib/
│   │   ├── recommendations.ts # Business logic: Fridge Match % & Waste Score algorithm
│   │   ├── utils.ts        # Tailwind cn helper
│   │   └── validations.ts  # Schema validasi Zod untuk seluruh entity
│   ├── routes/             # File-based routing TanStack Router
│   │   ├── __root.tsx      # Root layout, HTML shell, SEO meta tags
│   │   ├── index.tsx       # Landing page (/)
│   │   ├── dashboard.tsx   # Dashboard dapur (/dashboard)
│   │   ├── fridge.tsx      # Inventaris kulkas (/fridge)
│   │   ├── shopping.tsx    # Daftar belanja (/shopping)
│   │   ├── profile.tsx     # Profil & preferensi diet (/profile)
│   │   └── recipes/
│   │       ├── index.tsx   # Daftar rekomendasi resep (/recipes)
│   │       └── $recipeId.tsx # Detail resep & Cooking Mode (/recipes/$recipeId)
│   ├── server/
│   │   └── api.ts          # TanStack Start Server Functions (createServerFn)
│   ├── routeTree.gen.ts    # Auto-generated TanStack Router tree
│   ├── router.tsx          # Router configuration
│   └── styles.css          # Design system & Tailwind styling tokens
├── .env.example            # Contoh konfigurasi environment
├── drizzle.config.ts       # Konfigurasi Drizzle Kit
├── package.json            # Dependencies & npm scripts
├── tsconfig.json           # TypeScript strict configuration
└── vite.config.ts          # Konfigurasi Vite & TanStack Start plugins
```

---

## 🧮 Logika Rekomendasi & Waste Score

1. **Fridge Match (%)**:
   $$\text{Fridge Match} = \left( \frac{\text{Jumlah Bahan Resep yang Dimiliki User}}{\text{Total Bahan Resep}} \right) \times 100\%$$
   Kecocokan dievaluasi baik berdasarkan `ingredientId` maupun *normalized fuzzy text matching* pada nama bahan.

2. **Waste Score (0–100)**:
   Waste Score mengukur seberapa mendesak dan efektif resep ini dalam menyelamatkan bahan makanan yang mendekati kedaluwarsa:
   - Bahan berstatus **Expiring** ($\le 2$ hari): Bobot tertinggi (+45 poin + bonus penyelamatan)
   - Bahan berstatus **Use Soon** (3–5 hari): Bobot tinggi (+30 poin)
   - Bahan berstatus **Fresh** (> 5 hari): Bobot dasar (+15 poin)
   - Resep yang berhasil menggunakan bahan berkategori *Expiring* akan mendapatkan badge khusus *"Selamatkan bahan kritis"*.

---

## 💻 Cara Menjalankan Project

### 1. Prasyarat
- **Node.js** v20 atau lebih baru (direkomendasikan v22+)
- **npm** atau **pnpm**

### 2. Konfigurasi Environment (Opsional)
Salin `.env.example` menjadi `.env` jika ingin menyambungkan ke PostgreSQL eksternal:
```bash
cp .env.example .env
```
Isi konfigurasi `DATABASE_URL` (misalnya Supabase, Neon, atau PostgreSQL lokal):
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/fridgefirst"
PORT=3000
```
> **Catatan:** Jika `DATABASE_URL` tidak diisi atau dibiarkan kosong, FridgeFirst secara otomatis berjalan menggunakan embedded **PGlite** (PostgreSQL WebAssembly engine) yang menyimpan data secara persisten di folder `./.data/pglite`. Anda dapat langsung menjalankan aplikasi tanpa perlu konfigurasi PostgreSQL manual!

### 3. Menjalankan Development Server
```bash
npm install
npm run dev
```
Buka browser di:
```
http://localhost:3000
```

### 4. Menjalankan Type Check & Build
Untuk memvalidasi TypeScript secara menyeluruh:
```bash
npx tsc --noEmit
```
Untuk membuat bundle produksi:
```bash
npm run build
```

---

## 🍲 Data Bawaan (Seed Data)
Saat pertama kali dijalankan, sistem otomatis menginisialisasi:
- **67 Master Bahan**: Berbagai sayuran (*wortel, bayam, kangkung, kol, brokoli, tauge*), protein (*telur ayam, dada ayam, daging cincang, tahu, tempe, udang, sosis, bakso*), karbohidrat (*nasi, mie telur, pasta spaghetti, roti tawar*), bumbu (*bawang merah, bawang putih, cabai rawit, saus tiram, kecap manis*), dan lainnya beserta masa simpan default.
- **22 Resep Nusantara & Internasional**: Nasi Goreng Kulkas, Mie Goreng Jawa, Telur Dadar Padang, Ayam Geprek Sambal Bawang, Sup Sayur Bakso Sosis, Capcay Kuah Kental, Tumis Kangkung Belacan, Sayur Bening Bayam Jagung, Spaghetti Aglio e Olio, Japanese Chahan, French Toast, Creamy Mac & Cheese, Nasi Gila, dll.
- **Demo User Inventory**: Kulkas awal terisi 12 bahan (beberapa sengaja mendekati masa expired) agar fitur rekomendasi dan Waste Score langsung terlihat bekerja dengan optimal.
