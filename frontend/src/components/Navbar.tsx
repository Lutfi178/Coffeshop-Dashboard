import React from 'react';
import { LayoutDashboard, ShoppingCart, Package, Layers, FileText, Store, BarChart3 } from 'lucide-react';

interface NavbarProps {
  activeTab: 'dashboard' | 'analytics' | 'pos' | 'products' | 'categories' | 'orders';
  setActiveTab: (tab: 'dashboard' | 'analytics' | 'pos' | 'products' | 'categories' | 'orders') => void;
  cartCount: number;
}

interface NavItem {
  id: 'dashboard' | 'analytics' | 'pos' | 'products' | 'categories' | 'orders';
  label: string;
  icon: React.ComponentType<{ size?: number }>;
  badge?: number;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, cartCount }) => {
  const navItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'analytics', label: 'Analytics & Laporan', icon: BarChart3 },
    { id: 'pos', label: 'Kasir / POS', icon: ShoppingCart, badge: cartCount > 0 ? cartCount : undefined },
    { id: 'products', label: 'Kelola Produk', icon: Package },
    { id: 'categories', label: 'Kategori', icon: Layers },
    { id: 'orders', label: 'Riwayat Transaksi', icon: FileText },
  ];

  return (
    <header className="glass-panel" style={{ borderRadius: 0, borderTop: 0, borderLeft: 0, borderRight: 0, position: 'sticky', top: 0, zIndex: 50, padding: '12px 24px' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        {/* Brand Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={() => setActiveTab('dashboard')}>
          <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px rgba(99, 102, 241, 0.4)' }}>
            <Store size={24} color="#ffffff" />
          </div>
          <div>
            <h1 style={{ fontSize: '18px', fontWeight: '800', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              BREWLY <span className="gradient-text">COFFEE</span>
            </h1>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0 }}>Smart Sales & Inventory Dashboard</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(0,0,0,0.3)', padding: '6px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 16px',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  background: isActive ? 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' : 'transparent',
                  color: isActive ? '#ffffff' : 'var(--text-muted)',
                  fontWeight: isActive ? 600 : 500,
                  fontSize: '13px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  position: 'relative',
                }}
              >
                <Icon size={16} />
                <span>{item.label}</span>
                {item.badge !== undefined && (
                  <span
                    style={{
                      background: '#f43f5e',
                      color: 'white',
                      fontSize: '10px',
                      fontWeight: 700,
                      padding: '2px 6px',
                      borderRadius: '999px',
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Status Indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="badge badge-emerald" style={{ padding: '6px 12px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', display: 'inline-block', animation: 'pulse 2s infinite' }}></span>
            <span>Kasir Online</span>
          </div>
        </div>
      </div>
    </header>
  );
};
