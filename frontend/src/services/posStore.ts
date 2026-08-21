import { useState, useEffect } from 'react';
import type { Product, Category, Order, CartItem, DashboardStats, PaymentMethod, User, CustomerMember } from '../types/pos';
import { INITIAL_PRODUCTS, INITIAL_CATEGORIES, INITIAL_ORDERS, INITIAL_MEMBERS } from './mockData';

const PRODUCTS_KEY = 'brewly_pos_products_v10';
const CATEGORIES_KEY = 'brewly_pos_categories_v9';
const ORDERS_KEY = 'brewly_pos_orders_v10';
const USER_KEY = 'brewly_pos_user_v2';
const MEMBERS_KEY = 'brewly_pos_members_v2';

export function getStoredMembers(): CustomerMember[] {
  try {
    const data = localStorage.getItem(MEMBERS_KEY);
    return data ? JSON.parse(data) : INITIAL_MEMBERS;
  } catch {
    return INITIAL_MEMBERS;
  }
}

export function saveMembers(members: CustomerMember[]): void {
  localStorage.setItem(MEMBERS_KEY, JSON.stringify(members));
}

const SKU_IMAGE_MAP: Record<string, string> = {
  'PRD-001': '/products/es-kopi-susu-gula-aren.jpg',
  'PRD-002': '/products/kopi-tubruk-arabika-gayo.jpg',
  'PRD-003': '/products/iced-caramel-macchiato.jpg',
  'PRD-004': '/products/spanish-latte-creamy.jpg',
  'PRD-005': '/products/americano-iced.jpg',
  'PRD-006': '/products/avocado-coffee-float.jpg',
  'PRD-007': '/products/matcha-latte-creamy.jpg',
  'PRD-008': '/products/iced-chocolate-hazelnut.jpg',
  'PRD-009': '/products/artisan-earl-grey.jpg',
  'PRD-010': '/products/roti-bakar-kaya.jpg',
  'PRD-011': '/products/croissant-butter.jpg',
  'PRD-012': '/products/sandwich-smoked-beef.jpg',
  'PRD-013': '/products/brewly-supreme-platter.jpg',
  'PRD-014': '/products/crispy-croffle.jpg',
  'PRD-015': '/products/pisang-goreng-cokelat.jpg',
  'PRD-016': '/products/fudgy-brownie.jpg',
};

export function getStoredProducts(): Product[] {
  try {
    // Force clear all previous keys
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('brewly_pos_products_') && key !== 'brewly_pos_products_v10') {
        localStorage.removeItem(key);
      }
    });

    const data = localStorage.getItem(PRODUCTS_KEY);
    if (!data) {
      localStorage.setItem(PRODUCTS_KEY, JSON.stringify(INITIAL_PRODUCTS));
      return INITIAL_PRODUCTS;
    }

    const parsed: Product[] = JSON.parse(data);
    if (!parsed || parsed.length === 0) {
      localStorage.setItem(PRODUCTS_KEY, JSON.stringify(INITIAL_PRODUCTS));
      return INITIAL_PRODUCTS;
    }

    // Auto-migrate any external or missing images using SKU mapping
    const migrated = parsed.map((p) => {
      if (!p.image || p.image.startsWith('http') || p.image.includes('unsplash.com')) {
        return {
          ...p,
          image: SKU_IMAGE_MAP[p.sku] || INITIAL_PRODUCTS.find((initP) => initP.sku === p.sku)?.image || p.image || '',
        };
      }
      return p;
    });

    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(migrated));
    return migrated;
  } catch {
    return INITIAL_PRODUCTS;
  }
}

export function getStoredCategories(): Category[] {
  try {
    const data = localStorage.getItem(CATEGORIES_KEY);
    const parsed: Category[] = data ? JSON.parse(data) : [];
    const cleaned = parsed.filter((c) => !c.name.toLowerCase().includes('merchandise') && c.id !== 'cat-5');
    return cleaned && cleaned.length > 0 ? cleaned : INITIAL_CATEGORIES;
  } catch {
    return INITIAL_CATEGORIES;
  }
}

export function getStoredOrders(): Order[] {
  try {
    // Force clear all previous order keys to ensure fresh data on version bump
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('brewly_pos_orders_') && key !== 'brewly_pos_orders_v10') {
        localStorage.removeItem(key);
      }
    });

    const data = localStorage.getItem(ORDERS_KEY);
    const parsed = data ? JSON.parse(data) : [];
    return parsed && parsed.length > 0 ? parsed : INITIAL_ORDERS;
  } catch {
    return INITIAL_ORDERS;
  }
}

export function getStoredUser(): User | null {
  try {
    const data = localStorage.getItem(USER_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export function saveProducts(products: Product[]): void {
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
}

export function saveCategories(categories: Category[]): void {
  localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
}

export function saveOrders(orders: Order[]): void {
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
}

export function saveUser(user: User | null): void {
  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(USER_KEY);
  }
}

export function usePOSStore() {
  const [currentUser, setCurrentUser] = useState<User | null>(getStoredUser);
  const [products, setProducts] = useState<Product[]>(getStoredProducts);
  const [categories, setCategories] = useState<Category[]>(getStoredCategories);
  const [orders, setOrders] = useState<Order[]>(getStoredOrders);
  const [members, setMembers] = useState<CustomerMember[]>(getStoredMembers);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  useEffect(() => { saveProducts(products); }, [products]);
  useEffect(() => { saveCategories(categories); }, [categories]);
  useEffect(() => { saveOrders(orders); }, [orders]);
  useEffect(() => { saveUser(currentUser); }, [currentUser]);
  useEffect(() => { saveMembers(members); }, [members]);

  const addMember = (newMem: Omit<CustomerMember, 'id' | 'totalVisits' | 'createdAt'>) => {
    const member: CustomerMember = {
      ...newMem,
      id: `mem-${Date.now()}`,
      totalVisits: 1,
      createdAt: new Date().toISOString(),
    };
    setMembers((prev) => [member, ...prev]);
    return member;
  };

  const login = (user: User) => {
    setCurrentUser(user);
    // If cashier login, land directly on Kasir & Pemesanan tab
    if (user.role === 'CASHIER') {
      setActiveTab('pos');
    } else {
      setActiveTab('dashboard');
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setCart([]);
  };

  // Cart operations
  const addToCart = (product: Product) => {
    if (product.stock <= 0) return;
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) return prev;
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    setCart((prev) => {
      if (quantity <= 0) {
        return prev.filter((item) => item.product.id !== productId);
      }
      const targetProduct = products.find((p) => p.id === productId);
      if (targetProduct && quantity > targetProduct.stock) {
        quantity = targetProduct.stock;
      }
      return prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      );
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
  };

  // Product CRUD
  const addProduct = (newProduct: Omit<Product, 'id'>) => {
    const category = categories.find((c) => c.id === newProduct.categoryId);
    const product: Product = {
      ...newProduct,
      id: `prod-${Date.now()}`,
      categoryName: category?.name || 'Umum',
    };
    setProducts((prev) => [product, ...prev]);
  };

  const updateProduct = (updated: Product) => {
    const category = categories.find((c) => c.id === updated.categoryId);
    const fullUpdated = {
      ...updated,
      categoryName: category?.name || 'Umum',
    };
    setProducts((prev) => prev.map((p) => (p.id === updated.id ? fullUpdated : p)));
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    removeFromCart(id);
  };

  // Category CRUD
  const addCategory = (name: string, description?: string, icon = 'Coffee') => {
    const category: Category = {
      id: `cat-${Date.now()}`,
      name,
      description,
      icon,
      productCount: 0,
    };
    setCategories((prev) => [...prev, category]);
  };

  const updateCategory = (updatedCategory: Category) => {
    setCategories((prev) => prev.map((c) => (c.id === updatedCategory.id ? updatedCategory : c)));
    setProducts((prev) =>
      prev.map((p) => (p.categoryId === updatedCategory.id ? { ...p, categoryName: updatedCategory.name } : p))
    );
  };

  const deleteCategory = (id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
  };

  // Checkout process
  const processCheckout = (
    customerName: string,
    paymentMethod: PaymentMethod,
    paidAmount: number,
    discountPercent: number,
    taxRatePercent: number
  ): Order | null => {
    if (cart.length === 0) return null;

    const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    const discountAmount = Math.round((subtotal * discountPercent) / 100);
    const taxableAmount = Math.max(0, subtotal - discountAmount);
    const taxAmount = Math.round((taxableAmount * taxRatePercent) / 100);
    const grandTotal = taxableAmount + taxAmount;

    if (paidAmount < grandTotal && paymentMethod === 'CASH') {
      throw new Error(`Uang diterima (${paidAmount}) kurang dari total tagihan (${grandTotal})`);
    }

    const orderId = `ord-${Date.now()}`;
    const invoiceNumber = `INV-${new Date().toISOString().slice(2, 10).replace(/-/g, '')}-${Math.floor(10 + Math.random() * 90)}`;

    const order: Order = {
      id: orderId,
      invoiceNumber,
      customerName: customerName.trim() || 'Pelanggan Umum',
      paymentMethod,
      status: 'COMPLETED',
      items: cart.map((item, idx) => ({
        id: `item-${Date.now()}-${idx}`,
        productId: item.product.id,
        productName: item.product.name,
        quantity: item.quantity,
        unitPrice: item.product.price,
        subtotal: item.product.price * item.quantity,
      })),
      subtotal,
      discountPercent,
      discountAmount,
      taxRatePercent,
      taxAmount,
      totalAmount: grandTotal,
      paidAmount,
      changeAmount: Math.max(0, paidAmount - grandTotal),
      createdAt: new Date().toISOString(),
    };

    // Deduct stock for ordered products
    setProducts((prevProducts) =>
      prevProducts.map((p) => {
        const cartItem = cart.find((ci) => ci.product.id === p.id);
        if (cartItem) {
          const newStock = Math.max(0, p.stock - cartItem.quantity);
          return { ...p, stock: newStock };
        }
        return p;
      })
    );

    // Save order & clear cart
    setOrders((prev) => [order, ...prev]);
    clearCart();
    return order;
  };

  // Calculate dashboard stats
  const stats: DashboardStats = {
    totalRevenue: orders.reduce((sum, o) => sum + o.totalAmount, 0),
    totalSalesCount: orders.length,
    activeProductsCount: products.length,
    lowStockAlertCount: products.filter((p) => p.stock <= p.minStock).length,
    todayRevenue: orders
      .filter((o) => new Date(o.createdAt).toDateString() === new Date().toDateString())
      .reduce((sum, o) => sum + o.totalAmount, 0),
    todaySalesCount: orders.filter((o) => new Date(o.createdAt).toDateString() === new Date().toDateString()).length,
  };

  return {
    currentUser,
    login,
    logout,
    products,
    categories,
    orders,
    members,
    addMember,
    cart,
    stats,
    activeTab,
    setActiveTab,
    addToCart,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    addProduct,
    updateProduct,
    deleteProduct,
    addCategory,
    updateCategory,
    deleteCategory,
    processCheckout,
  };
}
