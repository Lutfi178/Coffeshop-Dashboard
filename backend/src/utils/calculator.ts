export interface OrderCalculationInput {
  items: Array<{ price: number; quantity: number }>;
  taxRatePercent?: number;
  discountPercent?: number;
}

export interface OrderCalculationResult {
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  total: number;
}

export function calculateSubtotal(items: Array<{ price: number; quantity: number }>): number {
  return items.reduce((acc, item) => acc + item.price * item.quantity, 0);
}

export function calculateTax(subtotal: number, taxRatePercent: number = 11): number {
  if (subtotal < 0 || taxRatePercent < 0) return 0;
  return Number(((subtotal * taxRatePercent) / 100).toFixed(2));
}

export function calculateDiscount(subtotal: number, discountPercent: number = 0): number {
  if (subtotal < 0 || discountPercent < 0) return 0;
  const clampedDiscount = Math.min(discountPercent, 100);
  return Number(((subtotal * clampedDiscount) / 100).toFixed(2));
}

export function calculateOrderTotal(input: OrderCalculationInput): OrderCalculationResult {
  const subtotal = calculateSubtotal(input.items);
  const discountAmount = calculateDiscount(subtotal, input.discountPercent ?? 0);
  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const taxAmount = calculateTax(taxableAmount, input.taxRatePercent ?? 0);
  const total = Number((taxableAmount + taxAmount).toFixed(2));

  return {
    subtotal: Number(subtotal.toFixed(2)),
    taxAmount,
    discountAmount,
    total,
  };
}

export function calculateChange(paidAmount: number, totalAmount: number): number {
  if (paidAmount < totalAmount) {
    throw new Error('Pembayaran kurang dari total belanja');
  }
  return Number((paidAmount - totalAmount).toFixed(2));
}

export function getStockStatus(stock: number, minStock: number = 5): 'OUT_OF_STOCK' | 'LOW_STOCK' | 'IN_STOCK' {
  if (stock <= 0) return 'OUT_OF_STOCK';
  if (stock <= minStock) return 'LOW_STOCK';
  return 'IN_STOCK';
}
