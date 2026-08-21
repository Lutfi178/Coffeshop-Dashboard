import React, { useState } from 'react';
import { Search, Plus, Minus, Trash2, CreditCard, CheckCircle, X, ShoppingCart, Tag, Coffee } from 'lucide-react';
import type { Product, Category, CartItem, Order, PaymentMethod } from '../types/pos';
import { ReceiptDetailModal } from './ReceiptDetailModal';

interface POSViewProps {
  products: Product[];
  categories: Category[];
  cart: CartItem[];
  addToCart: (product: Product) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  processCheckout: (
    customerName: string,
    paymentMethod: PaymentMethod,
    paidAmount: number,
    discountPercent: number,
    taxRatePercent: number
  ) => Order | null;
}

export const POSView: React.FC<POSViewProps> = ({
  products,
  categories,
  cart,
  addToCart,
  updateCartQuantity,
  removeFromCart,
  clearCart,
  processCheckout,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [orderType, setOrderType] = useState<'DINE_IN' | 'TAKEAWAY'>('DINE_IN');
  const taxRatePercent = 11;

  // Checkout modal state
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
  const [paidAmount, setPaidAmount] = useState<string>('');
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  const formatIDR = (val: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);

  // Filter products by category and search term
  const filteredProducts = products.filter((p) => {
    const matchesCategory = selectedCategoryId === 'all' || p.categoryId === selectedCategoryId;
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Calculate cart totals (strictly 0 if cart is empty)
  const subtotal = cart.length > 0 ? cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0) : 0;
  const discountAmount = Math.round((subtotal * discountPercent) / 100);
  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const taxAmount = subtotal > 0 ? Math.round((taxableAmount * taxRatePercent) / 100) : 0;
  const grandTotal = subtotal > 0 ? taxableAmount + taxAmount : 0;

  // Reset cart & cart inputs helper
  const handleClearCart = () => {
    clearCart();
    setCustomerName('');
    setDiscountPercent(0);
  };

  const handleOpenCheckout = () => {
    if (cart.length === 0) return;
    setPaidAmount(grandTotal.toString());
    setPaymentMethod('CASH');
    setErrorMessage(null);
    setIsCheckoutOpen(true);
  };

  const handleSelectPaymentMethod = (method: PaymentMethod) => {
    setPaymentMethod(method);
    if (method !== 'CASH') {
      setPaidAmount(grandTotal.toString());
    }
  };

  const handleQuickPay = (amount: number) => {
    setPaidAmount(amount.toString());
  };

  const handleConfirmPayment = () => {
    try {
      const numPaid = paymentMethod === 'CASH' ? (parseFloat(paidAmount) || 0) : grandTotal;
      const finalCustomerName = customerName.trim()
        ? `${customerName.trim()} (${orderType === 'DINE_IN' ? 'Dine In' : 'Takeaway'})`
        : `Pelanggan Umum (${orderType === 'DINE_IN' ? 'Dine In' : 'Takeaway'})`;

      const order = processCheckout(finalCustomerName, paymentMethod, numPaid, discountPercent, taxRatePercent);
      if (order) {
        setCompletedOrder(order);
        setIsCheckoutOpen(false);
        // Reset state after order completion
        setCustomerName('');
        setDiscountPercent(0);
      }
    } catch (err: any) {
      setErrorMessage(err.message);
    }
  };

  return (
    <>
      <style>{`
        .pos-layout {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 350px;
          gap: 20px;
          align-items: start;
          width: 100%;
          max-width: 100%;
          box-sizing: border-box;
        }

        /* Category Pill Buttons Container — Horizontal Scroll with Visual Scrollbar Hidden */
        .pos-category-container {
          display: flex;
          gap: 8px;
          overflow-x: auto;
          padding-bottom: 4px;
          padding-right: 20px;
          max-width: 100%;
          scrollbar-width: none; /* Firefox */
          -ms-overflow-style: none; /* IE/Edge */
        }
        .pos-category-container::-webkit-scrollbar {
          display: none; /* Chrome, Safari, Opera */
          width: 0;
          height: 0;
        }

        /* Cart Item List — Subtle Thin Vertical Scrollbar */
        .pos-cart-list {
          flex: 1;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 8px;
          padding-right: 4px;
          scrollbar-width: thin;
          scrollbar-color: #E8E4DF transparent;
        }
        .pos-cart-list::-webkit-scrollbar {
          width: 4px;
        }
        .pos-cart-list::-webkit-scrollbar-track {
          background: transparent;
        }
        .pos-cart-list::-webkit-scrollbar-thumb {
          background: #E8E4DF;
          border-radius: 4px;
        }
        .pos-cart-list::-webkit-scrollbar-thumb:hover {
          background: #D9D4CE;
        }

        @keyframes cartItemSlide {
          from {
            opacity: 0;
            transform: translateY(6px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .pos-cart-item {
          animation: cartItemSlide 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .pos-cart-panel {
          padding: 20px;
          display: flex;
          flex-direction: column;
          height: calc(100vh - 110px);
          max-height: 820px;
          position: sticky;
          top: 84px;
        }

        @media (max-width: 1024px) {
          .pos-layout {
            grid-template-columns: 1fr !important;
          }
          .pos-cart-panel {
            position: static !important;
            height: auto !important;
            max-height: none !important;
          }
        }
      `}</style>

      <div className="pos-layout">
        {/* Left Column: Coffee Menu Catalog & Filter Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', minWidth: 0 }}>
          
          {/* Top Control Bar: Search & Order Type */}
          <div className="card-panel" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            {/* Order Type Toggle */}
            <div style={{ background: '#FAF8F5', borderRadius: '10px', padding: '4px', border: '1px solid #E8E4DF', display: 'flex', gap: '4px' }}>
              <button
                type="button"
                onClick={() => setOrderType('DINE_IN')}
                style={{
                  padding: '7px 14px',
                  borderRadius: '8px',
                  border: 'none',
                  background: orderType === 'DINE_IN' ? '#3D2B1F' : 'transparent',
                  color: orderType === 'DINE_IN' ? '#FFFFFF' : '#6E6761',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                🍽️ Dine In
              </button>
              <button
                type="button"
                onClick={() => setOrderType('TAKEAWAY')}
                style={{
                  padding: '7px 14px',
                  borderRadius: '8px',
                  border: 'none',
                  background: orderType === 'TAKEAWAY' ? '#3D2B1F' : 'transparent',
                  color: orderType === 'TAKEAWAY' ? '#FFFFFF' : '#6E6761',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                🛍️ Takeaway
              </button>
            </div>

            {/* Search Box */}
            <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
              <Search size={16} color="#9C958E" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
              <input
                type="text"
                placeholder="Cari nama kopi, pastry, atau SKU..."
                className="input-control"
                style={{ paddingLeft: '40px', height: '40px', fontSize: '13px' }}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Category Pill Buttons — Swipable with Hidden Scrollbar */}
          <div className="pos-category-container">
            <button
              type="button"
              onClick={() => setSelectedCategoryId('all')}
              style={{
                padding: '7px 15px',
                borderRadius: '20px',
                border: '1px solid',
                borderColor: selectedCategoryId === 'all' ? '#3D2B1F' : '#E8E4DF',
                background: selectedCategoryId === 'all' ? '#3D2B1F' : '#FFFFFF',
                color: selectedCategoryId === 'all' ? '#FFFFFF' : '#6E6761',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s ease',
                flexShrink: 0,
              }}
            >
              Semua Menu ({products.length})
            </button>

            {categories.map((cat) => {
              const count = products.filter((p) => p.categoryId === cat.id).length;
              const isSelected = selectedCategoryId === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategoryId(cat.id)}
                  style={{
                    padding: '7px 15px',
                    borderRadius: '20px',
                    border: '1px solid',
                    borderColor: isSelected ? '#3D2B1F' : '#E8E4DF',
                    background: isSelected ? '#3D2B1F' : '#FFFFFF',
                    color: isSelected ? '#FFFFFF' : '#6E6761',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.2s ease',
                    flexShrink: 0,
                  }}
                >
                  {cat.name} ({count})
                </button>
              );
            })}
          </div>

          {/* Menu Items Grid */}
          {filteredProducts.length === 0 ? (
            <div className="card-panel" style={{ padding: '48px 24px', textAlign: 'center', color: '#9C958E' }}>
              <Coffee size={38} style={{ margin: '0 auto 12px auto', color: '#3D2B1F', opacity: 0.4 }} />
              <h3 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 4px 0', color: '#1C1917' }}>
                Belum Ada Menu Kopi / Produk
              </h3>
              <p style={{ fontSize: '12.5px', margin: 0 }}>Menu untuk kategori ini belum tersedia.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: '14px' }}>
              {filteredProducts.map((product) => {
                const cartItem = cart.find((ci) => ci.product.id === product.id);
                const isOutOfStock = product.stock <= 0;

                return (
                  <div
                    key={product.id}
                    onClick={() => !isOutOfStock && addToCart(product)}
                    className="card-panel-interactive"
                    style={{
                      padding: '12px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                      opacity: isOutOfStock ? 0.55 : 1,
                      position: 'relative',
                    }}
                  >
                    {cartItem && (
                      <span
                        style={{
                          position: 'absolute',
                          top: '8px',
                          right: '8px',
                          background: '#3D2B1F',
                          color: '#FFFFFF',
                          fontSize: '11px',
                          fontWeight: 800,
                          width: '22px',
                          height: '22px',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 2px 6px rgba(61, 43, 31, 0.3)',
                          zIndex: 2,
                        }}
                      >
                        {cartItem.quantity}
                      </span>
                    )}

                    <div>
                      {imageErrors[product.id] || !product.image ? (
                        <div
                          style={{
                            width: '100%',
                            height: '108px',
                            borderRadius: '8px',
                            background: '#FAF8F5',
                            border: '1px solid #E8E4DF',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#9C958E',
                            marginBottom: '8px',
                          }}
                        >
                          <Coffee size={22} color="#C89D7C" />
                          <span style={{ fontSize: '10px', fontWeight: 600, marginTop: '3px' }}>Foto tidak tersedia</span>
                        </div>
                      ) : (
                        <img
                          src={product.image}
                          alt={product.name}
                          onError={() => setImageErrors((prev) => ({ ...prev, [product.id]: true }))}
                          style={{
                            width: '100%',
                            height: '108px',
                            objectFit: 'cover',
                            borderRadius: '8px',
                            marginBottom: '8px',
                            background: '#FAF8F5',
                            border: '1px solid #E8E4DF',
                          }}
                        />
                      )}
                      <div style={{ fontSize: '10.5px', color: '#6E6761', fontWeight: 600, marginBottom: '2px' }}>{product.sku}</div>
                      <h4 style={{ fontSize: '13px', fontWeight: 700, margin: '0 0 6px 0', color: '#1C1917', lineHeight: 1.25 }}>
                        {product.name}
                      </h4>
                    </div>

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                        <span style={{ fontSize: '13.5px', fontWeight: 800, color: '#1C1917' }}>{formatIDR(product.price)}</span>
                        <span
                          className={isOutOfStock ? 'badge badge-rose' : 'badge badge-emerald'}
                          style={{ fontSize: '10px', padding: '3px 8px' }}
                        >
                          {isOutOfStock ? 'Habis' : `Stok ${product.stock}`}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Order Cart Station (Layar Kasir) */}
        <div className="card-panel pos-cart-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', borderBottom: '1px solid #E8E4DF', paddingBottom: '10px' }}>
            <h3 style={{ fontSize: '15.5px', fontWeight: 800, margin: 0, color: '#1C1917', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShoppingCart size={17} color="#3D2B1F" />
              <span>Keranjang Pesanan</span>
            </h3>
            {cart.length > 0 && (
              <button
                type="button"
                style={{ background: 'none', border: 'none', color: '#991B1B', fontSize: '11.5px', cursor: 'pointer', fontWeight: 700 }}
                onClick={handleClearCart}
              >
                Kosongkan
              </button>
            )}
          </div>

          {/* Cart Item List */}
          <div className="pos-cart-list">
            {cart.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '36px 12px', color: '#9C958E', margin: 'auto 0' }}>
                <ShoppingCart size={34} style={{ margin: '0 auto 8px auto', opacity: 0.4, color: '#3D2B1F' }} />
                <p style={{ fontSize: '13.5px', margin: 0, fontWeight: 700, color: '#1C1917' }}>Keranjang kasir belum terisi.</p>
                <p style={{ fontSize: '11.5px', margin: '4px 0 0 0', color: '#6E6761' }}>Klik varian menu di sebelah kiri untuk menginput pesanan.</p>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.product.id}
                  className="pos-cart-item"
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '9px 11px',
                    borderRadius: '10px',
                    background: '#FAF8F5',
                    border: '1px solid #E8E4DF',
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0, paddingRight: '8px' }}>
                    <h4 style={{ fontSize: '12.5px', fontWeight: 700, margin: '0 0 2px 0', color: '#1C1917', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.product.name}
                    </h4>
                    <div style={{ fontSize: '11.5px', color: '#3D2B1F', fontWeight: 700 }}>
                      {formatIDR(item.product.price)}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '3px', background: '#FFFFFF', borderRadius: '6px', border: '1px solid #E8E4DF', padding: '2px' }}>
                      <button
                        type="button"
                        style={{ background: 'none', border: 'none', color: '#1C1917', cursor: 'pointer', padding: '2px 5px', display: 'flex', alignItems: 'center' }}
                        onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                        title="Kurangi Quantity"
                      >
                        <Minus size={11} />
                      </button>
                      <span style={{ fontSize: '12px', fontWeight: 800, padding: '0 4px', color: '#1C1917' }}>{item.quantity}</span>
                      <button
                        type="button"
                        style={{
                          background: 'none',
                          border: 'none',
                          color: item.quantity >= item.product.stock ? '#9C958E' : '#1C1917',
                          cursor: item.quantity >= item.product.stock ? 'not-allowed' : 'pointer',
                          padding: '2px 5px',
                          display: 'flex',
                          alignItems: 'center',
                        }}
                        disabled={item.quantity >= item.product.stock}
                        onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                        title={item.quantity >= item.product.stock ? 'Stok Maksimal Tercapai' : 'Tambah Quantity'}
                      >
                        <Plus size={11} />
                      </button>
                    </div>

                    <button
                      type="button"
                      style={{ background: 'none', border: 'none', color: '#991B1B', cursor: 'pointer', padding: '3px' }}
                      onClick={() => removeFromCart(item.product.id)}
                      title="Hapus Item dari Keranjang"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Order Details & Summary */}
          <div style={{ borderTop: '1px solid #E8E4DF', paddingTop: '10px', marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '7px' }}>
            <div>
              <label style={{ fontSize: '10.5px', fontWeight: 700, color: '#6E6761', display: 'block', marginBottom: '3px', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                Nama Pemesan / Pelanggan
              </label>
              <input
                type="text"
                placeholder="Contoh: Mas Budi / Meja 04"
                className="input-control"
                style={{ padding: '6px 10px', fontSize: '12px', height: '36px' }}
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', color: '#6E6761' }}>
              <span>Subtotal</span>
              <span style={{ fontWeight: 600, color: '#1C1917' }}>{formatIDR(subtotal)}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12.5px', color: '#6E6761' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Tag size={12} /> Diskon (%)
              </span>
              <input
                type="number"
                min="0"
                max="100"
                value={discountPercent || ''}
                onChange={(e) => setDiscountPercent(Math.min(100, Math.max(0, Number(e.target.value))))}
                placeholder="0"
                className="input-control"
                style={{ width: '56px', height: '28px', padding: '2px 6px', textAlign: 'right', fontSize: '12px' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', color: '#6E6761' }}>
              <span>PPN (11%)</span>
              <span style={{ fontWeight: 600, color: '#1C1917' }}>{formatIDR(taxAmount)}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15.5px', fontWeight: 800, color: '#1C1917', borderTop: '1px solid #E8E4DF', paddingTop: '7px', marginTop: '3px' }}>
              <span>Total Bayar</span>
              <span style={{ color: '#3D2B1F' }}>{formatIDR(grandTotal)}</span>
            </div>

            <button
              type="button"
              onClick={handleOpenCheckout}
              disabled={cart.length === 0}
              className="btn btn-primary"
              style={{
                width: '100%',
                minHeight: '46px',
                borderRadius: '10px',
                marginTop: '6px',
                fontSize: '13.5px',
              }}
            >
              <CreditCard size={18} />
              <span>Proses Pembayaran</span>
            </button>
          </div>
        </div>
      </div>

      {/* Checkout Modal */}
      {isCheckoutOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '480px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 800, margin: 0, color: '#1C1917' }}>Pembayaran Kasir Coffee Shop</h3>
              <button type="button" style={{ background: 'none', border: 'none', color: '#6E6761', cursor: 'pointer' }} onClick={() => setIsCheckoutOpen(false)}>
                <X size={20} />
              </button>
            </div>

            {errorMessage && (
              <div style={{ padding: '10px 14px', borderRadius: '8px', background: '#FEE2E2', border: '1px solid rgba(153,27,27,0.2)', color: '#991B1B', fontSize: '13px', marginBottom: '14px', fontWeight: 600 }}>
                {errorMessage}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label className="form-label" style={{ marginBottom: '6px', display: 'block' }}>Metode Pembayaran</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  {(['CASH', 'QRIS', 'DEBIT', 'CREDIT'] as PaymentMethod[]).map((method) => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => handleSelectPaymentMethod(method)}
                      style={{
                        padding: '10px',
                        borderRadius: '10px',
                        border: '1px solid',
                        borderColor: paymentMethod === method ? '#3D2B1F' : '#E8E4DF',
                        background: paymentMethod === method ? '#3D2B1F' : '#FAF8F5',
                        color: paymentMethod === method ? '#FFFFFF' : '#1C1917',
                        fontWeight: 700,
                        fontSize: '13px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ background: '#FAF8F5', padding: '12px 14px', borderRadius: '12px', border: '1px solid #E8E4DF', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#6E6761' }}>Total Tagihan</span>
                <span style={{ fontSize: '18px', fontWeight: 800, color: '#3D2B1F' }}>{formatIDR(grandTotal)}</span>
              </div>

              {paymentMethod === 'CASH' ? (
                <>
                  <div>
                    <label className="form-label" style={{ marginBottom: '6px', display: 'block' }}>Jumlah Uang Diterima (Rp)</label>
                    <input
                      type="number"
                      placeholder="0"
                      className="input-control"
                      style={{ fontSize: '16px', fontWeight: 700 }}
                      value={paidAmount}
                      onChange={(e) => setPaidAmount(e.target.value)}
                    />

                    <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
                      <button
                        type="button"
                        onClick={() => handleQuickPay(grandTotal)}
                        className="btn btn-secondary"
                        style={{ flex: 1, padding: '6px', fontSize: '11px', minHeight: '32px' }}
                      >
                        Uang Pas
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuickPay(50000)}
                        className="btn btn-secondary"
                        style={{ flex: 1, padding: '6px', fontSize: '11px', minHeight: '32px' }}
                      >
                        50.000
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuickPay(100000)}
                        className="btn btn-secondary"
                        style={{ flex: 1, padding: '6px', fontSize: '11px', minHeight: '32px' }}
                      >
                        100.000
                      </button>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: 700, color: (parseFloat(paidAmount) || 0) >= grandTotal ? '#15803D' : '#991B1B' }}>
                    <span>Kembalian:</span>
                    <span>{formatIDR(Math.max(0, (parseFloat(paidAmount) || 0) - grandTotal))}</span>
                  </div>
                </>
              ) : (
                <div style={{ padding: '12px 14px', borderRadius: '10px', background: '#DCFCE7', border: '1px solid #86EFAC', color: '#15803D', fontSize: '12.5px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle size={16} />
                  <span>Pembayaran nontunai ({paymentMethod}) diproses otomatis senilai {formatIDR(grandTotal)}.</span>
                </div>
              )}

              <button
                type="button"
                onClick={handleConfirmPayment}
                className="btn btn-primary"
                style={{ width: '100%', minHeight: '48px', marginTop: '8px' }}
              >
                Bayar Sekarang &amp; Cetak Struk
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Order Receipt Modal */}
      {completedOrder && (
        <ReceiptDetailModal
          order={completedOrder}
          onClose={() => setCompletedOrder(null)}
        />
      )}
    </>
  );
};
