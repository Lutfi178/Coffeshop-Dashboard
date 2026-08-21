import { describe, expect, test } from "bun:test";
import {
  validateSKU,
  validateProductPrice,
  validateStock,
  validateOrderItems,
} from "../../src/utils/validator";

describe("Validator Utility Unit Tests", () => {
  test("validateSKU should validate valid SKU format", () => {
    expect(validateSKU("PRD-001")).toBe(true);
    expect(validateSKU("POS-A102")).toBe(true);
    expect(validateSKU("INVALIDSKU")).toBe(false);
    expect(validateSKU("1234-5678")).toBe(false);
    expect(validateSKU("")).toBe(false);
  });

  test("validateProductPrice should handle non-negative numbers", () => {
    expect(validateProductPrice(15000).isValid).toBe(true);
    expect(validateProductPrice(0).isValid).toBe(true);
    expect(validateProductPrice(-500).isValid).toBe(false);
    expect(validateProductPrice(NaN).isValid).toBe(false);
  });

  test("validateStock should reject non-integers and negative numbers", () => {
    expect(validateStock(10).isValid).toBe(true);
    expect(validateStock(0).isValid).toBe(true);
    expect(validateStock(-2).isValid).toBe(false);
    expect(validateStock(4.5).isValid).toBe(false);
  });

  test("validateOrderItems should validate array of cart items", () => {
    const validItems = [{ productId: "p1", quantity: 2, price: 10000 }];
    expect(validateOrderItems(validItems).isValid).toBe(true);

    const emptyItems: any[] = [];
    expect(validateOrderItems(emptyItems).isValid).toBe(false);

    const invalidQty = [{ productId: "p1", quantity: 0, price: 10000 }];
    expect(validateOrderItems(invalidQty).isValid).toBe(false);
  });
});
