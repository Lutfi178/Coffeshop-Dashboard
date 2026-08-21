export function validateSKU(sku: string): boolean {
  if (!sku || typeof sku !== 'string') return false;
  // SKU format e.g. PRD-001 or POS-A102 (2-4 uppercase letters, hyphen, 3-6 alphanumeric characters)
  const skuRegex = /^[A-Z]{2,4}-[A-Z0-9]{3,6}$/i;
  return skuRegex.test(sku.trim());
}

export function validateProductPrice(price: number): { isValid: boolean; message?: string } {
  if (typeof price !== 'number' || isNaN(price)) {
    return { isValid: false, message: 'Harga harus berupa angka' };
  }
  if (price < 0) {
    return { isValid: false, message: 'Harga tidak boleh negatif' };
  }
  return { isValid: true };
}

export function validateStock(stock: number): { isValid: boolean; message?: string } {
  if (typeof stock !== 'number' || isNaN(stock) || !Number.isInteger(stock)) {
    return { isValid: false, message: 'Stok harus berupa bilangan bulat' };
  }
  if (stock < 0) {
    return { isValid: false, message: 'Stok tidak boleh negatif' };
  }
  return { isValid: true };
}

export function validateOrderItems(items: Array<{ productId: string; quantity: number; price: number }>): { isValid: boolean; message?: string } {
  if (!Array.isArray(items) || items.length === 0) {
    return { isValid: false, message: 'Keranjang belanja tidak boleh kosong' };
  }
  for (const item of items) {
    if (!item.productId || typeof item.productId !== 'string') {
      return { isValid: false, message: 'ID produk tidak valid' };
    }
    if (typeof item.quantity !== 'number' || item.quantity <= 0) {
      return { isValid: false, message: 'Jumlah produk harus lebih dari 0' };
    }
    if (typeof item.price !== 'number' || item.price < 0) {
      return { isValid: false, message: 'Harga produk tidak valid' };
    }
  }
  return { isValid: true };
}
