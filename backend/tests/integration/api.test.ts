import { describe, expect, test, beforeAll, afterAll } from "bun:test";
import { app } from "../../src/index";
import { prisma } from "../../src/lib/prisma";

describe("Elysia API & PostgreSQL Database Integration Tests", () => {
  let testCategoryId = "";
  let testProductId = "";

  beforeAll(async () => {
    // 1. Connect Prisma ORM to PostgreSQL
    await prisma.$connect();

    // 2. Clean stale test data if present
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.product.deleteMany({ where: { sku: { startsWith: "TEST-" } } });
    await prisma.category.deleteMany({ where: { name: "Kategori Test Integration" } });
    await prisma.user.deleteMany({ where: { email: { in: ["admin.test@brewlycoffee.com", "kasir.test@brewlycoffee.com"] } } });

    // 3. Seed test users directly into PostgreSQL via Prisma ORM
    await prisma.user.create({
      data: {
        id: "user-admin-test",
        name: "Admin Integration Test",
        email: "admin.test@brewlycoffee.com",
        password: "admin123password",
        role: "ADMIN",
      },
    });

    await prisma.user.create({
      data: {
        id: "user-kasir-test",
        name: "Kasir Integration Test",
        email: "kasir.test@brewlycoffee.com",
        password: "kasir123password",
        role: "CASHIER",
      },
    });

    // 4. Seed test category and product in PostgreSQL
    const category = await prisma.category.create({
      data: {
        name: "Kategori Test Integration",
        description: "Kategori khusus pengujian integrasi",
        icon: "Coffee",
      },
    });
    testCategoryId = category.id;

    const product = await prisma.product.create({
      data: {
        sku: "TEST-SKU-001",
        name: "Kopi Espresso Test Integrasi",
        description: "Produk test integrasi PostgreSQL",
        price: 85000,
        costPrice: 50000,
        stock: 50,
        minStock: 5,
        categoryId: testCategoryId,
      },
    });
    testProductId = product.id;
  });

  afterAll(async () => {
    // Teardown: Clean up created test records in foreign-key order
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.product.deleteMany({ where: { sku: { startsWith: "TEST-" } } });
    await prisma.category.deleteMany({ where: { name: "Kategori Test Integration" } });
    await prisma.user.deleteMany({ where: { email: { in: ["admin.test@brewlycoffee.com", "kasir.test@brewlycoffee.com"] } } });

    await prisma.$disconnect();
  });

  test("GET / should return server status and message", async () => {
    const response = await app.handle(new Request("http://localhost/"));
    expect(response.status).toBe(200);

    const json: any = await response.json();
    expect(json.status).toBe("success");
    expect(json.message).toContain("Brewly Coffee POS & Sales Dashboard API is running");
  });

  test("POST /api/auth/login should authenticate PostgreSQL user and return JWT token", async () => {
    const payload = {
      email: "admin.test@brewlycoffee.com",
      password: "admin123password",
    };

    const response = await app.handle(
      new Request("http://localhost/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
    );

    expect(response.status).toBe(200);
    const json: any = await response.json();
    expect(json.status).toBe("success");
    expect(json.data.user.role).toBe("ADMIN");
    expect(json.data.user.email).toBe("admin.test@brewlycoffee.com");
    expect(typeof json.data.token).toBe("string");
  });

  test("POST /api/auth/login should reject invalid password with 401 status", async () => {
    const payload = {
      email: "admin.test@brewlycoffee.com",
      password: "wrongpassword",
    };

    const response = await app.handle(
      new Request("http://localhost/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
    );

    expect(response.status).toBe(401);
    const json: any = await response.json();
    expect(json.status).toBe("error");
    expect(json.message).toContain("tidak valid");
  });

  test("GET /api/products should read products from PostgreSQL via Prisma", async () => {
    const response = await app.handle(new Request("http://localhost/api/products"));
    expect(response.status).toBe(200);

    const json: any = await response.json();
    expect(json.status).toBe("success");
    expect(Array.isArray(json.data)).toBe(true);

    const foundTestProduct = json.data.find((p: any) => p.sku === "TEST-SKU-001");
    expect(foundTestProduct).not.toBeUndefined();
    expect(foundTestProduct.name).toBe("Kopi Espresso Test Integrasi");
    expect(foundTestProduct.price).toBe(85000);
  });

  test("POST /api/orders should process checkout and persist order directly in PostgreSQL", async () => {
    const payload = {
      customerName: "Pelanggan Test Integration",
      paymentMethod: "CASH",
      paidAmount: 100000,
      discountPercent: 10,
      taxRatePercent: 11,
      items: [
        { productId: testProductId, quantity: 1, price: 85000 },
      ],
    };

    const response = await app.handle(
      new Request("http://localhost/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
    );

    expect(response.status).toBe(200);
    const json: any = await response.json();
    expect(json.status).toBe("success");
    expect(json.data.invoiceNumber).toContain("INV-");

    const createdOrderId = json.data.id;

    // DIRECT POSTGRESQL KROSCEK VIA PRISMA ORM
    const persistedOrder = await prisma.order.findUnique({
      where: { id: createdOrderId },
      include: { items: true },
    });

    expect(persistedOrder).not.toBeNull();
    expect(persistedOrder?.customerName).toBe("Pelanggan Test Integration");
    expect(persistedOrder?.paidAmount).toBe(100000);
    expect(persistedOrder?.totalAmount).toBe(json.data.totalAmount);
    expect(persistedOrder?.items.length).toBe(1);
    expect(persistedOrder?.items[0].productId).toBe(testProductId);
  });

  test("POST /api/orders should reject order with insufficient paid amount", async () => {
    const payload = {
      customerName: "Budi Santoso",
      paymentMethod: "CASH",
      paidAmount: 5000, // Insufficient amount
      items: [
        { productId: testProductId, quantity: 1, price: 85000 },
      ],
    };

    const response = await app.handle(
      new Request("http://localhost/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
    );

    expect(response.status).toBe(400);
    const json: any = await response.json();
    expect(json.status).toBe("error");
    expect(json.message).toContain("Pembayaran kurang");
  });

  test("POST /api/products should reject invalid negative price with 400 status", async () => {
    const payload = {
      sku: "TEST-SKU-INVALID",
      name: "Produk Harga Minus",
      price: -10000,
      stock: 10,
      categoryId: testCategoryId,
    };

    const response = await app.handle(
      new Request("http://localhost/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
    );

    expect(response.status).toBe(400);
    const json: any = await response.json();
    expect(json.status).toBe("error");
    expect(json.message).toContain("tidak boleh negatif");
  });

  test("GET /api/dashboard/stats should aggregate live metrics from PostgreSQL", async () => {
    const response = await app.handle(new Request("http://localhost/api/dashboard/stats"));
    expect(response.status).toBe(200);

    const json: any = await response.json();
    expect(json.status).toBe("success");
    expect(typeof json.data.totalRevenue).toBe("number");
    expect(typeof json.data.totalSalesCount).toBe("number");
    expect(json.data.activeProductsCount).toBeGreaterThan(0);
  });
});
