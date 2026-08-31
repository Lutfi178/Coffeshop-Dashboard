# ☕ Brewly Coffee — Coffee Shop Management System

A modern, full-stack **Point of Sale (POS)** and **Sales Analytics System** designed for coffee shops and retail F&B businesses. Built with **Bun + Elysia.js** for the backend, **React 19 + TypeScript + Vite** for the frontend, and **Prisma ORM** with **PostgreSQL** for database management.

---

## 🌟 Key Features & Functional Separation

### 1. 🏠 Dashboard Admin (Executive Snapshot)
- **Executive Overview**: Clean overview answering *"Bagaimana kondisi kedai saya saat ini?"*.
- **4 Key KPIs**: Total Pendapatan, Profit Bersih (Net) + Margin %, Total Transaksi Sukses, dan Stok Menipis / Habis.
- **Real-Time Panels**: Transaksi Terakhir (dengan tombol `Lihat Semua →`) dan Peringatan Stok Inventaris.
- **Strict Separation**: Non-cluttered overview without charts or duplicate invoice tables.

### 2. 📊 Laporan Penjualan & Keuangan (Business & Financial Analytics)
- **Financial Analytics**: Answers *"Bagaimana performa penjualan dan keuangan kedai saya?"*.
- **4 Financial KPIs**: Total Penjualan, Total HPP (Cost of Goods Sold), Profit Margin %, dan Rata-Rata Transaksi (AOV).
- **Period Filter**: `Hari Ini`, `7 Hari Terakhir`, `Bulan Ini`.
- **Dynamic Visuals**: Grafik Tren Omzet Penjualan Harian, Breakdown Metode Pembayaran (Cash, QRIS, Debit, Credit), Produk Terlaris (Top 5 Leaderboard), dan Analisis Jam Ramai (Peak Hours).
- **Export Control**: `Export PDF / Print Report`.

### 3. 📜 Riwayat Transaksi (Single Source of Truth for Invoices)
- Complete transaction log list with Invoice Number, Timestamp, Cashier Name, Customer Name, Total Amount, Payment Method, and Status badges.
- Live Search, Payment Method Filter (Cash, QRIS, Debit, Credit), and Status Filter (Completed, Pending, Cancelled).
- Detail modal & printable invoice receipt.

### 4. 🛒 Kasir & Pemesanan (Dedicated POS Screen)
- Interactive product catalog grid with category filters.
- Cart drawer with quantity modifiers, subtotal, discount deduction (%), tax calculation (PPN 11%), and grand total.
- Payment modal with exact change calculation and receipt printing.

### 5. 📦 Katalog Produk & Kategori (Full CRUD)
- Create, Read, Update, and Delete products with SKU, HPP, selling price, stock, and minimum stock alerts.
- Category management for Espresso, Non-Kopi, Tea, Bakery, Snacks, etc.

---

## 🛠️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React 19, TypeScript, Vite, Lucide React, Custom Vanilla CSS |
| **Backend API** | Bun v1.0+, Elysia.js v1.2+, CORS, JWT Authentication |
| **Database & ORM** | PostgreSQL, Prisma ORM 6 |
| **Testing** | Bun Test (`bun test` for Unit & Integration Testing) |

---

## 📂 Project Architecture

```text
proyek-pos/
├── frontend/                 # React 19 + TypeScript Vite App
│   ├── src/
│   │   ├── components/       # DashboardOverview, SalesReportView, OrderHistoryView, ProductManager, CategoryManager, CustomersView, SettingsView, POSView, Sidebar
│   │   ├── services/         # posStore.ts (State management & API service client)
│   │   ├── types/            # pos.ts (TypeScript interface definitions)
│   │   ├── App.tsx           # Main application shell & routing
│   │   └── index.css         # Brewly Coffee design system (Espresso Brown, Warm Beige, Cream)
│   └── package.json
│
├── backend/                  # Bun + Elysia.js Backend & Testing
│   ├── src/
│   │   ├── index.ts          # Elysia.js server & REST API routes
│   │   ├── lib/
│   │   │   └── prisma.ts     # Singleton Prisma Client instance
│   │   └── utils/            # calculator.ts & validator.ts business logic
│   ├── tests/
│   │   ├── unit/             # Unit tests (calculator & validator)
│   │   └── integration/      # Integration tests (Elysia API -> Prisma -> DB)
│   ├── prisma/
│   │   ├── schema.prisma     # PostgreSQL data schema
│   │   └── seed.ts           # Seeding script for users, categories & products
│   ├── .env                  # Environment variables (PORT, DATABASE_URL, JWT_SECRET)
│   └── package.json
│
└── README.md                 # System setup & API documentation
```

---

## 📦 Setup & Installation Instructions

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+) or [Bun](https://bun.sh/) (v1.0+)
- [PostgreSQL](https://www.postgresql.org/) (Running locally or via cloud URL)

---

### 1. PostgreSQL Database Configuration & Migration

1. Configure `backend/.env`:
   ```env
   PORT=3001
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/brewly_pos?schema=public"
   JWT_SECRET="brewly_coffee_secret_jwt_key_2026"
   ```

2. Run Prisma migration and seed script in `backend/`:
   ```bash
   cd backend
   
   # Push Prisma schema models to PostgreSQL
   npx prisma migrate dev --name init
   
   # Generate Prisma Client
   npx prisma generate
   
   # Seed initial database records
   npx bun prisma/seed.ts
   ```

---

### 2. Backend API Setup & Run (Bun + Elysia.js)

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npx bun install

# Start Elysia.js development server
npx bun run dev
```
Server runs at `http://localhost:3001`.

---

### 3. Frontend Setup & Run (React 19 + TypeScript)

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Build & start Vite development server
npm run dev
```
Open browser at `http://localhost:5173`.

---

## 🧪 Running Unit & Integration Tests

All tests are executed using **Bun Test**:

```bash
cd backend

# Run ALL Unit and Integration Tests
npx bun test

# Run ONLY Unit Tests
npx bun test tests/unit/calculator.test.ts tests/unit/validator.test.ts

# Run ONLY Integration Tests
npx bun test tests/integration/api.test.ts
```

### Test Suite Summary
- `calculator.test.ts`: Subtotal calculation, PPN 11% tax calculation, discount capping (100%), grand total aggregation, cash change calculation, insufficient payment error, stock status classification.
- `validator.test.ts`: Product price validation, stock integer bounds, SKU pattern matching, empty cart payload rejection.
- `api.test.ts`: `GET /` server health, `POST /api/auth/login` JWT auth & authorization, `GET /api/dashboard/stats`, `GET /api/products`, `POST /api/orders` checkout flow, and `400 Bad Request` validation failure handling.

---

## 🔍 Running Lint Tests (Oxlint)

Code quality and style consistency are enforced across both Frontend and Backend using **Oxlint** (ultra-fast Rust-based TypeScript & React linter):

```bash
# 1. Run Linting for BOTH Frontend & Backend from Root Monorepo
npm run lint

# 2. Run Linting specifically in Frontend (React + TypeScript)
cd frontend
npm run lint

# 3. Run Linting specifically in Backend (Bun + Elysia + TypeScript)
cd backend
bun run lint
```

---

## 📡 Complete REST API Endpoint Documentation

### 🔑 Authentication & Authorization

#### `POST /api/auth/login`
Authenticates Admin or Cashier user and returns a signed JWT token.

- **Request Body**:
  ```json
  {
    "email": "admin@brewlycoffee.com",
    "password": "admin123password"
  }
  ```
- **Response (200 OK)**:
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

### 📊 Dashboard & Analytics

#### `GET /api/dashboard/stats`
Returns executive snapshot metrics for the Admin Dashboard.

- **Response (200 OK)**:
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

### 📦 Products CRUD

#### `GET /api/products`
Retrieves list of all coffee shop products with category info.

- **Response (200 OK)**:
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
Creates a new product item.

- **Request Body**:
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

### 💳 POS Orders & Checkout

#### `POST /api/orders`
Processes POS transaction checkout, validates cart items, calculates PPN 11% tax, discount, total amount, and cash change.

- **Request Body**:
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
- **Response (200 OK)**:
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

---

## 📄 License
MIT License &copy; 2026 Brewly Coffee Management System
