# ☕ Brewly Coffee — Sistem Manajemen Kedai Kopi

Sistem **Point of Sale (POS)** dan **Analisis Penjualan** full-stack modern yang dirancang khusus untuk kedai kopi dan bisnis F&B retail. Dibangun menggunakan **Bun + Elysia.js** untuk backend, **React 19 + TypeScript + Vite** untuk frontend, serta **Prisma ORM** dengan **PostgreSQL** untuk manajemen database.

---

## 🌟 Fitur Utama & Pemisahan Fungsi

### 1. 🏠 Dashboard Admin (Rangkuman Eksekutif)
- **Overview Eksekutif**: Tampilan bersih yang menjawab *"Bagaimana kondisi kedai saya saat ini?"*.
- **4 KPI Utama**: Total Pendapatan, Profit Bersih (Net) + Margin %, Total Transaksi Sukses, dan Stok Menipis / Habis.
- **Panel Real-Time**: Transaksi Terakhir (dengan tombol `Lihat Semua →`) dan Peringatan Stok Inventaris.
- **Pemisahan Ketat**: Tampilan ringkas tanpa grafik berat atau tabel faktur ganda.

### 2. 📊 Laporan Penjualan & Keuangan (Analisis Bisnis & Keuangan)
- **Analisis Keuangan**: Menjawab *"Bagaimana performa penjualan dan keuangan kedai saya?"*.
- **4 KPI Keuangan**: Total Penjualan, Total HPP (Harga Pokok Penjualan), Profit Margin %, dan Rata-Rata Transaksi (AOV).
- **Filter Periode**: `Hari Ini`, `7 Hari Terakhir`, `Bulan Ini`.
- **Visual Dinamis**: Grafik Tren Omzet Penjualan Harian, Rincian Metode Pembayaran (Cash, QRIS, Debit, Credit), Produk Terlaris (Top 5 Leaderboard), dan Analisis Jam Ramai (Peak Hours).
- **Kontrol Ekspor**: `Cetak / Ekspor Laporan PDF`.

### 3. 📜 Riwayat Transaksi (Pusat Data Faktur Penjualan)
- Daftar log transaksi lengkap dengan Nomor Faktur, Tanggal & Waktu, Nama Kasir, Nama Pelanggan, Total Tagihan, Metode Pembayaran, dan Badge Status.
- Pencarian Langsung, Filter Metode Pembayaran (Cash, QRIS, Debit, Credit), dan Filter Status (Completed, Pending, Cancelled).
- Modal Detail Struk & Cetak Nota Transaksi.

### 4. 🛒 Kasir & Pemesanan (Layar Khusus POS)
- Grid katalog produk interaktif dengan filter kategori.
- Drawer Keranjang dengan pengubah jumlah item, subtotal, potongan diskon (%), kalkulasi pajak PPN 11%, dan grand total.
- Modal Pembayaran dengan kalkulasi otomatis uang kembalian dan cetak struk.

### 5. 📦 Katalog Produk & Kategori (CRUD Lengkap)
- Tambah, Baca, Edit, dan Hapus produk dengan SKU, HPP, harga jual, stok, dan batas minimum stok.
- Manajemen kategori untuk Espresso, Non-Kopi, Teh, Bakery, Camilan, dll.

---

## 🛠️ Stack Teknologi

| Layer | Teknologi |
| :--- | :--- |
| **Frontend** | React 19, TypeScript, Vite, Lucide React, Custom Vanilla CSS |
| **Backend API** | Bun v1.0+, Elysia.js v1.2+, CORS, Autentikasi JWT |
| **Database & ORM** | PostgreSQL, Prisma ORM 6 |
| **Testing** | Bun Test (`bun test` untuk Unit & Integration Testing) |
| **Linting** | Oxlint (`npm run lint` untuk analisis kualitas kode) |

---

## 📂 Arsitektur Proyek

```text
proyek-pos/
├── frontend/                 # Aplikasi React 19 + TypeScript Vite
│   ├── src/
│   │   ├── components/       # DashboardOverview, SalesReportView, OrderHistoryView, ProductManager, CategoryManager, CustomersView, SettingsView, POSView, Sidebar
│   │   ├── services/         # posStore.ts (Manajemen State & API client)
│   │   ├── types/            # pos.ts (Definisi tipe TypeScript)
│   │   ├── App.tsx           # Shell aplikasi utama & navigasi
│   │   └── index.css         # Design system Brewly Coffee (Espresso Brown, Warm Beige, Cream)
│   └── package.json
│
├── backend/                  # Backend & Testing Bun + Elysia.js
│   ├── src/
│   │   ├── index.ts          # Elysia.js server & REST API routes
│   │   ├── lib/
│   │   │   └── prisma.ts     # Instans Singleton Prisma Client
│   │   └── utils/            # Logika bisnis calculator.ts & validator.ts
│   ├── tests/
│   │   ├── unit/             # Unit tests (calculator & validator)
│   │   └── integration/      # Integration tests (Elysia API -> Prisma -> DB)
│   ├── prisma/
│   │   ├── schema.prisma     # Skema data PostgreSQL
│   │   └── seed.ts           # Skrip seeding data awal user, kategori & produk
│   ├── .env                  # Variabel lingkungan (PORT, DATABASE_URL, JWT_SECRET)
│   └── package.json
│
└── README.md                 # Dokumentasi setup sistem & API
```

---

## 📦 Panduan Setup & Instalasi

### Prasyarat
- [Node.js](https://nodejs.org/) (v18+) atau [Bun](https://bun.sh/) (v1.0+)
- [PostgreSQL](https://www.postgresql.org/) (Berjalan lokal atau melalui Cloud PostgreSQL)

---

### 1. Konfigurasi Database PostgreSQL & Migrasi

1. Konfigurasi file `backend/.env`:
   ```env
   PORT=3001
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/brewly_pos?schema=public"
   JWT_SECRET="brewly_coffee_secret_jwt_key_2026"
   ```

2. Jalankan migrasi Prisma dan skrip seeding pada direktori `backend/`:
   ```bash
   cd backend
   
   # Push model skema Prisma ke PostgreSQL
   npx prisma migrate dev --name init
   
   # Generate Prisma Client
   npx prisma generate
   
   # Isi data awal (seeding database)
   npx bun prisma/seed.ts
   ```

---

### 2. Setup & Jalankan Backend API (Bun + Elysia.js)

```bash
# Masuk ke direktori backend
cd backend

# Install dependensi
npx bun install

# Jalankan server pengembangan Elysia.js
npx bun run dev
```
Server berjalan pada `http://localhost:3001`.

---

### 3. Setup & Jalankan Frontend (React 19 + TypeScript)

```bash
# Masuk ke direktori frontend
cd frontend

# Install dependensi
npm install

# Jalankan server pengembangan Vite
npm run dev
```
Buka browser pada `http://localhost:5173`.

---

## 🧪 Menjalankan Unit & Integration Test

Semua pengujian dijalankan menggunakan **Bun Test**:

```bash
cd backend

# Jalankan SEMUA Unit dan Integration Test
npx bun test

# Jalankan HANYA Unit Test
npx bun test tests/unit/calculator.test.ts tests/unit/validator.test.ts

# Jalankan HANYA Integration Test
npx bun test tests/integration/api.test.ts
```

### Ringkasan Pengujian
- `calculator.test.ts`: Perhitungan subtotal, kalkulasi PPN 11%, pembatasan diskon (max 100%), grand total, kalkulasi kembalian tunai, penanganan error pembayaran kurang, dan klasifikasi stok.
- `validator.test.ts`: Validasi harga produk, batas integer stok, pencocokan pola SKU, dan penolakan payload keranjang kosong.
- `api.test.ts`: Health check `GET /`, autentikasi & otorisasi JWT `POST /api/auth/login`, statistik dashboard `GET /api/dashboard/stats`, katalog produk `GET /api/products`, alur transaksi `POST /api/orders`, serta penanganan validasi `400 Bad Request`.

---

## 🔍 Menjalankan Lint Test (Oxlint)

Kualitas kode dan konsistensi standar diperiksa di seluruh Frontend dan Backend menggunakan **Oxlint**:

```bash
# 1. Jalankan Linting untuk Frontend DAN Backend dari Root Monorepo
npm run lint

# 2. Jalankan Linting khusus Frontend (React + TypeScript)
cd frontend
npm run lint

# 3. Jalankan Linting khusus Backend (Bun + Elysia + TypeScript)
cd backend
bun run lint
```

---

## 📡 Dokumentasi Endpoint REST API Lengkap

### 🔑 Autentikasi & Otorisasi

#### `POST /api/auth/login`
Mengautentikasi pengguna Admin atau Kasir dan mengembalikan token JWT bertanda tangan.

- **Body Request**:
  ```json
  {
    "email": "admin@brewlycoffee.com",
    "password": "admin123password"
  }
  ```
- **Respon (200 OK)**:
  ```json
  {
    "status": "success",
    "message": "Login berhasil",
    "data": {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "user": {
        "id": "user-admin",
        "name": "Admin Manager",
        "email": "admin@brewlycoffee.com",
        "role": "ADMIN"
      }
    }
  }
  ```

---

### 📊 Dashboard & Analitik

#### `GET /api/dashboard/stats`
Mengembalikan ringkasan metrik eksekutif untuk Dashboard Admin.

- **Respon (200 OK)**:
  ```json
  {
    "status": "success",
    "data": {
      "totalRevenue": 18450000,
      "totalSalesCount": 142,
      "activeProductsCount": 28,
      "lowStockAlertCount": 4,
      "todayRevenue": 2450000,
      "todaySalesCount": 19
    }
  }
  ```

---

### 📦 CRUD Produk

#### `GET /api/products`
Mengambil daftar seluruh produk kedai kopi beserta informasi kategori.

- **Respon (200 OK)**:
  ```json
  {
    "status": "success",
    "data": [
      {
        "id": "prod-1",
        "sku": "PRD-001",
        "name": "Kopi Espresso Premium 250g",
        "description": "Biji kopi arabika pilihan roasted medium dark",
        "price": 85000,
        "costPrice": 50000,
        "stock": 24,
        "minStock": 5,
        "categoryId": "cat-1",
        "categoryName": "Minuman & Kopi"
      }
    ]
  }
  ```

#### `POST /api/products`
Menambahkan item produk baru.

- **Body Request**:
  ```json
  {
    "sku": "PRD-005",
    "name": "Iced Americano",
    "description": "Double shot espresso dengan air dingin dan es",
    "price": 28000,
    "costPrice": 10000,
    "stock": 50,
    "minStock": 10,
    "categoryId": "cat-1"
  }
  ```

---

### 💳 Transaksi POS & Checkout

#### `POST /api/orders`
Memproses transaksi checkout POS, memvalidasi item keranjang, menghitung PPN 11%, diskon, total tagihan, dan uang kembalian.

- **Body Request**:
  ```json
  {
    "customerName": "Budi Santoso",
    "paymentMethod": "CASH",
    "paidAmount": 100000,
    "discountPercent": 10,
    "taxRatePercent": 11,
    "items": [
      { "productId": "prod-1", "quantity": 1, "price": 85000 }
    ]
  }
  ```
- **Respon (200 OK)**:
  ```json
  {
    "status": "success",
    "message": "Transaksi berhasil diproses",
    "data": {
      "id": "ord-17871239",
      "invoiceNumber": "INV-583920",
      "customerName": "Budi Santoso",
      "paymentMethod": "CASH",
      "subtotal": 85000,
      "discountAmount": 8500,
      "taxAmount": 8415,
      "totalAmount": 84915,
      "paidAmount": 100000,
      "changeAmount": 15085,
      "createdAt": "2026-08-20T09:30:00.000Z"
    }
  }
  ```
