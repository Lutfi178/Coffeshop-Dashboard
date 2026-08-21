import { LoginView } from './components/LoginView';
import { Sidebar } from './components/Sidebar';
import { DashboardOverview } from './components/DashboardOverview';
import { SalesReportView } from './components/SalesReportView';
import { CustomersView } from './components/CustomersView';
import { SettingsView } from './components/SettingsView';
import { POSView } from './components/POSView';
import { ProductManager } from './components/ProductManager';
import { CategoryManager } from './components/CategoryManager';
import { OrderHistoryView } from './components/OrderHistoryView';
import { usePOSStore } from './services/posStore';
import { Calendar } from 'lucide-react';

export function App() {
  const {
    currentUser,
    login,
    logout,
    products,
    categories,
    orders,
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
  } = usePOSStore();

  if (!currentUser) {
    return <LoginView onLogin={login} />;
  }

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#FAF8F5' }}>
      {/* Fixed Left Navigation Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        cartCount={totalCartCount}
        currentUser={currentUser}
        onLogout={logout}
      />

      {/* Main Layout Area */}
      <div style={{ flex: 1, marginLeft: '248px', display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Top Fixed Header Navbar */}
        <header
          style={{
            minHeight: '68px',
            backgroundColor: '#FFFFFF',
            borderBottom: '1px solid #E8E4DF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 32px',
            position: 'sticky',
            top: 0,
            zIndex: 40,
            boxShadow: '0 2px 8px rgba(28,25,23,0.02)',
          }}
        >
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 800, margin: 0, color: '#1C1917', letterSpacing: '-0.02em' }}>
              {activeTab === 'dashboard' && 'Dashboard'}
              {activeTab === 'reports' && 'Laporan Penjualan & Keuangan'}
              {activeTab === 'pos' && 'Kasir & Pemesanan (POS)'}
              {activeTab === 'products' && 'Katalog Produk & Inventaris'}
              {activeTab === 'categories' && 'Kelola Kategori Produk'}
              {activeTab === 'orders' && 'Riwayat & Detail Transaksi'}
              {activeTab === 'customers' && 'Data Pelanggan Toko'}
              {activeTab === 'settings' && 'Pengaturan Profil Toko'}
            </h1>
            {activeTab === 'dashboard' && (
              <p style={{ fontSize: '13px', color: '#6E6761', margin: '1px 0 0 0', fontWeight: 500 }}>
                Pantau kesehatan finansial dan pergerakan stok kedai kopi Anda.
              </p>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '12.5px',
                color: '#3D2B1F',
                background: '#FAF8F5',
                padding: '6px 14px',
                borderRadius: '20px',
                border: '1px solid #E8E4DF',
                fontWeight: 700,
              }}
            >
              <Calendar size={14} color="#C89D7C" />
              <span>
                {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
            </span>
          </div>
        </header>

        {/* Dynamic Main Body Content */}
        <main style={{ flex: 1, padding: '32px', maxWidth: '1600px', width: '100%', margin: '0 auto' }}>
          {activeTab === 'dashboard' && (
            <DashboardOverview
              stats={stats}
              products={products}
              orders={orders}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'reports' && (
            <SalesReportView orders={orders} products={products} />
          )}

          {activeTab === 'pos' && (
            <POSView
              products={products}
              categories={categories}
              cart={cart}
              addToCart={addToCart}
              updateCartQuantity={updateCartQuantity}
              removeFromCart={removeFromCart}
              clearCart={clearCart}
              processCheckout={processCheckout}
            />
          )}

          {activeTab === 'products' && (
            <ProductManager
              products={products}
              categories={categories}
              addProduct={addProduct}
              updateProduct={updateProduct}
              deleteProduct={deleteProduct}
              addCategory={addCategory}
            />
          )}

          {activeTab === 'categories' && (
            <CategoryManager
              categories={categories}
              products={products}
              addCategory={addCategory}
              updateCategory={updateCategory}
              deleteCategory={deleteCategory}
            />
          )}

          {activeTab === 'orders' && (
            <OrderHistoryView orders={orders} />
          )}

          {activeTab === 'customers' && (
            <CustomersView orders={orders} />
          )}

          {activeTab === 'settings' && (
            <SettingsView currentUser={currentUser} />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
