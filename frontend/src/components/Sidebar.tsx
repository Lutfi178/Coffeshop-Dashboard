import React from 'react';
import { LayoutDashboard, ShoppingCart, Package, Layers, FileText, UserCheck, ShieldCheck, LogOut, BarChart3, Users, Settings, Coffee } from 'lucide-react';
import type { User } from '../types/pos';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: any) => void;
  cartCount: number;
  currentUser: User | null;
  onLogout: () => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ size?: number; color?: string }>;
  badge?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, cartCount, currentUser, onLogout }) => {
  const adminNavItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'reports', label: 'Laporan Penjualan', icon: BarChart3 },
    { id: 'products', label: 'Katalog Produk', icon: Package },
    { id: 'categories', label: 'Kategori Produk', icon: Layers },
    { id: 'orders', label: 'Riwayat Transaksi', icon: FileText },
    { id: 'customers', label: 'Data Pelanggan', icon: Users },
    { id: 'settings', label: 'Pengaturan', icon: Settings },
  ];

  const cashierNavItems: NavItem[] = [
    { id: 'pos', label: 'Kasir & Pemesanan', icon: ShoppingCart, badge: cartCount > 0 ? cartCount : undefined },
    { id: 'orders', label: 'Riwayat Transaksi', icon: FileText },
  ];

  const navItems = currentUser?.role === 'CASHIER' ? cashierNavItems : adminNavItems;

  return (
    <aside
      style={{
        width: '248px',
        backgroundColor: '#FFFFFF',
        borderRight: '1px solid #E8E4DF',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '20px 14px',
        position: 'fixed',
        top: 0,
        bottom: 0,
        left: 0,
        zIndex: 100,
        boxShadow: '1px 0 10px rgba(28, 25, 23, 0.03)',
      }}
    >
      <div>
        {/* Brand Header */}
        <div
          onClick={() => setActiveTab(currentUser?.role === 'CASHIER' ? 'pos' : 'dashboard')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '8px 10px 20px 10px',
            borderBottom: '1px solid #F3EFEA',
            marginBottom: '16px',
            cursor: 'pointer',
          }}
          title="Ke Halaman Utama"
        >
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              backgroundColor: '#3D2B1F',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(61, 43, 31, 0.2)',
            }}
          >
            <Coffee size={22} color="#FFFFFF" />
          </div>
          <div>
            <h1 style={{ fontSize: '17px', fontWeight: 800, color: '#1C1917', margin: 0, letterSpacing: '-0.02em', lineHeight: 1.2 }}>
              Brewly <span style={{ color: '#C89D7C' }}>Coffee</span>
            </h1>
            <span style={{ fontSize: '10.5px', fontWeight: 600, color: '#9C958E', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              POS & Management
            </span>
          </div>
        </div>

        {/* Navigation List */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
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
                  justifyContent: 'space-between',
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: 'none',
                  backgroundColor: isActive ? '#3D2B1F' : 'transparent',
                  color: isActive ? '#FFFFFF' : '#6E6761',
                  fontWeight: isActive ? 700 : 600,
                  fontSize: '13.5px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  boxShadow: isActive ? '0 4px 14px rgba(61, 43, 31, 0.18)' : 'none',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Icon size={18} color={isActive ? '#FFFFFF' : '#6E6761'} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span
                    style={{
                      background: '#991B1B',
                      color: '#FFFFFF',
                      fontSize: '10px',
                      fontWeight: 800,
                      padding: '2px 7px',
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
      </div>

      {/* User Profile Card & Logout */}
      <div
        style={{
          background: '#FAF8F5',
          border: '1px solid #E8E4DF',
          borderRadius: '14px',
          padding: '12px 14px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              background: currentUser?.role === 'ADMIN' ? '#3D2B1F' : '#15803D',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            {currentUser?.role === 'ADMIN' ? <ShieldCheck size={18} /> : <UserCheck size={18} />}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h4 style={{ fontSize: '13px', fontWeight: 700, margin: 0, color: '#1C1917', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {currentUser?.name || 'Kasir Aktif'}
            </h4>
            <span
              style={{
                fontSize: '9.5px',
                fontWeight: 700,
                color: currentUser?.role === 'ADMIN' ? '#3D2B1F' : '#15803D',
                background: currentUser?.role === 'ADMIN' ? '#F4ECE6' : '#DCFCE7',
                padding: '2px 6px',
                borderRadius: '4px',
                display: 'inline-block',
                marginTop: '1px',
              }}
            >
              {currentUser?.role === 'ADMIN' ? 'ADMIN MANAGER' : 'KASIR ON-DUTY'}
            </span>
          </div>
        </div>

        <button
          onClick={onLogout}
          style={{
            width: '100%',
            padding: '8px 12px',
            borderRadius: '8px',
            border: '1px solid rgba(153, 27, 27, 0.2)',
            background: '#FEE2E2',
            color: '#991B1B',
            fontWeight: 700,
            fontSize: '12px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            transition: 'all 0.15s ease',
          }}
        >
          <LogOut size={14} />
          <span>Keluar / Logout</span>
        </button>
      </div>
    </aside>
  );
};
