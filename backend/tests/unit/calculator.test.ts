import { describe, expect, test } from "bun:test";
import {
  calculateSubtotal,
  calculateTax,
  calculateDiscount,
  calculateOrderTotal,
  calculateChange,
  getStockStatus,
} from "../../src/utils/calculator";

describe("Calculator Utility Unit Tests", () => {
  test("calculateSubtotal should return sum of price * quantity", () => {
    const items = [
      { price: 15000, quantity: 2 }, // 30000
      { price: 25000, quantity: 1 }, // 25000
    ];
    expect(calculateSubtotal(items)).toBe(55000);
  });

  test("calculateTax should correctly compute tax amount", () => {
    expect(calculateTax(100000, 11)).toBe(11000);
    expect(calculateTax(50000, 0)).toBe(0);
    expect(calculateTax(-5000, 11)).toBe(0);
  });

  test("calculateDiscount should correctly compute discount amount", () => {
    expect(calculateDiscount(100000, 10)).toBe(10000);
    expect(calculateDiscount(100000, 150)).toBe(100000); // capped at 100%
  });

  test("calculateOrderTotal should combine subtotal, discount, and tax", () => {
    const input = {
      items: [{ price: 100000, quantity: 1 }],
      discountPercent: 10, // subtotal after discount = 90,000
      taxRatePercent: 10,  // 10% tax on 90,000 = 9,000
    };
    const result = calculateOrderTotal(input);
    expect(result.subtotal).toBe(100000);
    expect(result.discountAmount).toBe(10000);
    expect(result.taxAmount).toBe(9000);
    expect(result.total).toBe(99000);
  });

  test("calculateChange should calculate correct change", () => {
    expect(calculateChange(100000, 75000)).toBe(25000);
    expect(calculateChange(50000, 50000)).toBe(0);
  });

  test("calculateChange should throw error if paid amount is insufficient", () => {
    expect(() => calculateChange(40000, 50000)).toThrow("Pembayaran kurang dari total belanja");
  });

  test("getStockStatus should return appropriate stock status", () => {
    expect(getStockStatus(0, 5)).toBe("OUT_OF_STOCK");
    expect(getStockStatus(3, 5)).toBe("LOW_STOCK");
    expect(getStockStatus(15, 5)).toBe("IN_STOCK");
  });
});
