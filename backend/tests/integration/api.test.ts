import { describe, expect, test } from "bun:test";
import { app } from "../../src/index";

describe("Elysia API & Authentication Integration Tests", () => {
  test("GET / should return success status and server message", async () => {
    const response = await app.handle(new Request("http://localhost/"));
    expect(response.status).toBe(200);

    const json: any = await response.json();
    expect(json.status).toBe("success");
    expect(json.message).toContain("Brewly Coffee POS & Sales Dashboard API is running");
  });

  test("POST /api/auth/login should authenticate Admin user and return JWT token", async () => {
    const payload = {
      email: "admin@brewlycoffee.com",
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
    expect(typeof json.data.token).toBe("string");
  });

  test("POST /api/auth/login should reject invalid credentials with 401 status", async () => {
    const payload = {
      email: "admin@brewlycoffee.com",
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

  test("GET /api/dashboard/stats should return analytics data", async () => {
    const response = await app.handle(new Request("http://localhost/api/dashboard/stats"));
    expect(response.status).toBe(200);

    const json: any = await response.json();
    expect(json.status).toBe("success");
    expect(json.data.totalRevenue).toBeGreaterThan(0);
    expect(json.data.totalSalesCount).toBeGreaterThan(0);
  });

  test("GET /api/products should return list of products", async () => {
    const response = await app.handle(new Request("http://localhost/api/products"));
    expect(response.status).toBe(200);

    const json: any = await response.json();
    expect(json.status).toBe("success");
    expect(Array.isArray(json.data)).toBe(true);
    expect(json.data.length).toBeGreaterThan(0);
  });

  test("POST /api/orders should process valid order checkout", async () => {
    const payload = {
      customerName: "Budi Santoso",
      paymentMethod: "CASH",
      paidAmount: 100000,
      discountPercent: 10,
      taxRatePercent: 11,
      items: [
        { productId: "prod-1", quantity: 1, price: 85000 },
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
    expect(json.data.paidAmount).toBe(100000);
    expect(json.data.changeAmount).toBeGreaterThanOrEqual(0);
  });

  test("POST /api/orders should reject order with insufficient paid amount", async () => {
    const payload = {
      customerName: "Budi Santoso",
      paymentMethod: "CASH",
      paidAmount: 10000, // Insufficient for 85k product
      items: [
        { productId: "prod-1", quantity: 1, price: 85000 },
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
});
