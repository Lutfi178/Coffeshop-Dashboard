export type Role = 'ADMIN' | 'CASHIER';

export type OrderStatus = 'COMPLETED' | 'PENDING' | 'CANCELLED';

export type PaymentMethod = 'CASH' | 'QRIS' | 'DEBIT' | 'CREDIT';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface ShopSettings {
  shopName: string;
  tagline: string;
  address: string;
  phone: string;
  taxRatePercent: number;
  currency: string;
}

export interface CustomerMember {
  id: string;
  name: string;
  phone: string;
  email?: string;
  discountPercent: number;
  totalVisits: number;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  productCount?: number;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  description?: string;
  price: number;
  costPrice: number;
  stock: number;
  minStock: number;
  categoryId: string;
  categoryName?: string;
  image?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface Order {
  id: string;
  invoiceNumber: string;
  customerName: string;
  paymentMethod: PaymentMethod;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  discountPercent: number;
  discountAmount: number;
  taxRatePercent: number;
  taxAmount: number;
  totalAmount: number;
  paidAmount: number;
  changeAmount: number;
  createdAt: string;
}

export interface DashboardStats {
  totalRevenue: number;
  totalSalesCount: number;
  activeProductsCount: number;
  lowStockAlertCount: number;
  todayRevenue: number;
  todaySalesCount: number;
}
