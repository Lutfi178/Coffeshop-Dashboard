import React from 'react';
import { DollarSign, ShoppingBag, Package, AlertTriangle, TrendingUp, ArrowUpRight, Plus, Layers } from 'lucide-react';
import type { DashboardStats, Product, Order } from '../types/pos';

interface DashboardOverviewProps {
  stats: DashboardStats;
  products: Product[];
  orders: Order[];
  setActiveTab: (tab: string) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  stats,
  products,
  orders,
  setActiveTab,
}) => {
  const formatIDR = (val: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);

  const formatDateTime = (dateStr: string) => {
    const d = new Date(dateStr);
    const datePart = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    const timePart = d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace('.', ':');
    return `${datePart}, ${timePart}`;
  };

  const lowStockProducts = products.filter((p) => p.stock <= p.minStock);
  const recentOrders = orders.slice(0, 5);

  const grossRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const totalCost = orders.reduce((sum, o) => {
    return (
      sum +
      o.items.reduce((itemSum, item) => {
        const product = products.find((p) => p.id === item.productId);
        const costPrice = product ? product.costPrice : 0;
        return itemSum + costPrice * item.quantity;
      }, 0)
    );
  }, 0);

  const netProfit = Math.max(0, grossRevenue - totalCost);
  const profitMarginPercent = grossRevenue > 0 ? ((netProfit / grossRevenue) * 100).toFixed(1) : '0';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%', maxWidth: '1400px', margin: '0 auto' }}>
      {/* 1. Welcome / Quick Action Secondary Banner */}
      <div className="card-panel" style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 800, margin: 0, color: '#1C1917', letterSpacing: '-0.01em' }}>
            Selamat Datang di <span style={{ color: '#3D2B1F' }}>Brewly Coffee</span>
          </h2>
          <p style={{ fontSize: '13px', color: '#6E6761', margin: '3px 0 0 0', fontWeight: 500 }}>
            Ringkasan performa penjualan, profit, dan inventaris toko kopi Anda hari ini.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-primary" style={{ minHeight: '38px', padding: '8px 16px', fontSize: '13px' }} onClick={() => setActiveTab('products')}>
            <Plus size={15} />
            <span>Tambah Produk Baru</span>
          </button>
          <button className="btn btn-secondary" style={{ minHeight: '38px', padding: '8px 16px', fontSize: '13px' }} onClick={() => setActiveTab('categories')}>
            <Plus size={15} />
            <span>Kelola Kategori</span>
          </button>
        </div>
      </div>

      {/* 2. 4 Uniform KPI Cards (Strict 4-Column Grid on Desktop) */}
      <div className="kpi-grid">
        {/* KPI 1: Total Pendapatan */}
        <div className="kpi-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div className="kpi-icon-wrapper" style={{ width: '40px', height: '40px', background: '#F4ECE6', color: '#3D2B1F' }}>
              <DollarSign size={18} />
            </div>
            <span className="badge badge-emerald">
              <TrendingUp size={11} /> +14.2%
            </span>
          </div>
          <div>
            <div className="kpi-lbl" style={{ fontSize: '12.5px', marginBottom: '2px' }}>Total Pendapatan</div>
            <div className="kpi-val" style={{ fontSize: '26px' }}>{formatIDR(stats.totalRevenue)}</div>
            <div style={{ fontSize: '12px', color: '#6E6761', marginTop: '4px', fontWeight: 500 }}>
              +14.2% dibanding kemarin
            </div>
          </div>
        </div>

        {/* KPI 2: Profit Bersih */}
        <div className="kpi-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div className="kpi-icon-wrapper" style={{ width: '40px', height: '40px', background: '#DCFCE7', color: '#15803D' }}>
              <TrendingUp size={18} />
            </div>
            <span className="badge badge-emerald">
              Margin {profitMarginPercent}%
            </span>
          </div>
          <div>
            <div className="kpi-lbl" style={{ fontSize: '12.5px', marginBottom: '2px' }}>Profit Bersih</div>
            <div className="kpi-val" style={{ fontSize: '26px', color: '#15803D' }}>{formatIDR(netProfit)}</div>
            <div style={{ fontSize: '12px', color: '#6E6761', marginTop: '4px', fontWeight: 500 }}>
              Margin keuntungan {profitMarginPercent}%
            </div>
          </div>
        </div>

        {/* KPI 3: Total Transaksi Sukses */}
        <div className="kpi-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div className="kpi-icon-wrapper" style={{ width: '40px', height: '40px', background: '#FEF3C7', color: '#B45309' }}>
              <ShoppingBag size={18} />
            </div>
            <span className="badge badge-coffee">{stats.todaySalesCount} Hari ini</span>
          </div>
          <div>
            <div className="kpi-lbl" style={{ fontSize: '12.5px', marginBottom: '2px' }}>Total Transaksi Sukses</div>
            <div className="kpi-val" style={{ fontSize: '26px' }}>{stats.totalSalesCount} Pesanan</div>
            <div style={{ fontSize: '12px', color: '#6E6761', marginTop: '4px', fontWeight: 500 }}>
              {stats.todaySalesCount} transaksi hari ini
            </div>
          </div>
        </div>

        {/* KPI 4: Stok Menipis / Habis */}
        <div className="kpi-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div className="kpi-icon-wrapper" style={{ width: '40px', height: '40px', background: stats.lowStockAlertCount > 0 ? '#FEE2E2' : '#DCFCE7', color: stats.lowStockAlertCount > 0 ? '#991B1B' : '#15803D' }}>
              {stats.lowStockAlertCount > 0 ? <AlertTriangle size={18} /> : <Package size={18} />}
            </div>
            <span className={stats.lowStockAlertCount > 0 ? 'badge badge-rose' : 'badge badge-emerald'}>
              {stats.lowStockAlertCount > 0 ? 'Perlu Restock' : 'Stok Aman'}
            </span>
          </div>
          <div>
            <div className="kpi-lbl" style={{ fontSize: '12.5px', marginBottom: '2px' }}>Stok Menipis / Habis</div>
            <div className="kpi-val" style={{ fontSize: '26px', color: stats.lowStockAlertCount > 0 ? '#991B1B' : '#1C1917' }}>
              {stats.lowStockAlertCount} Produk
            </div>
            <div style={{ fontSize: '12px', color: stats.lowStockAlertCount > 0 ? '#991B1B' : '#6E6761', marginTop: '4px', fontWeight: 500 }}>
              {stats.lowStockAlertCount > 0 ? 'Membutuhkan restock segera' : 'Semua item inventaris aman'}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Lower Content Layout: Transaksi Terakhir (55%) & Peringatan Stok (45%) */}
      <div className="dashboard-bottom-grid">
        {/* Left Column: Transaksi Terakhir Panel (55% width) */}
        <div className="card-panel" style={{ padding: '20px 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 className="section-title" style={{ fontSize: '18px' }}>
                <span>Transaksi Terakhir</span>
              </h3>
              <p style={{ fontSize: '12.5px', color: '#6E6761', margin: '2px 0 0 0' }}>Aktivitas penjualan terbaru</p>
            </div>

            <button
              style={{ background: 'none', border: 'none', color: '#3D2B1F', fontSize: '12.5px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
              onClick={() => setActiveTab('orders')}
            >
              <span>Lihat Semua</span>
              <ArrowUpRight size={14} />
            </button>
          </div>

          <div style={{ overflowX: 'hidden' }}>
            {recentOrders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px 0', color: '#9C958E' }}>
                <p style={{ margin: 0, fontSize: '13px' }}>Belum ada transaksi hari ini.</p>
              </div>
            ) : (
              <table className="custom-table" style={{ width: '100%', tableLayout: 'fixed' }}>
                <thead>
                  <tr>
                    <th style={{ width: '24%', padding: '12px 10px' }}>Invoice</th>
                    <th style={{ width: '31%', padding: '12px 10px' }}>Waktu / Tanggal</th>
                    <th style={{ width: '22%', padding: '12px 10px' }}>Total</th>
                    <th style={{ width: '23%', padding: '12px 10px', textAlign: 'right' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((ord) => (
                    <tr key={ord.id} style={{ height: '56px' }}>
                      <td style={{ padding: '12px 10px', fontWeight: 700, color: '#3D2B1F', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {ord.invoiceNumber}
                      </td>
                      <td style={{ padding: '12px 10px', fontSize: '12px', color: '#6E6761', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {formatDateTime(ord.createdAt)}
                      </td>
                      <td style={{ padding: '12px 10px', fontWeight: 700, color: '#1C1917', whiteSpace: 'nowrap' }}>
                        {formatIDR(ord.totalAmount)}
                      </td>
                      <td style={{ padding: '12px 10px', textAlign: 'right' }}>
                        <span className="badge badge-emerald" style={{ whiteSpace: 'nowrap', display: 'inline-flex', padding: '4px 10px', fontSize: '11px', fontWeight: 800 }}>
                          {ord.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Right Column: Peringatan Stok Panel (45% width) */}
        <div className="card-panel" style={{ padding: '20px 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 className="section-title" style={{ fontSize: '18px', color: lowStockProducts.length > 0 ? '#991B1B' : '#1C1917' }}>
                <AlertTriangle size={18} />
                <span>Peringatan Stok Inventaris</span>
              </h3>
              <p style={{ fontSize: '12.5px', color: '#6E6761', margin: '2px 0 0 0' }}>Produk yang membutuhkan restock</p>
            </div>

            <button
              className="btn btn-secondary"
              style={{ padding: '6px 12px', minHeight: '34px', fontSize: '12px' }}
              onClick={() => setActiveTab('products')}
            >
              <Layers size={13} />
              <span>Kelola Stok</span>
            </button>
          </div>

          {lowStockProducts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 0', color: '#15803D', fontWeight: 700 }}>
              <p style={{ margin: 0, fontSize: '13.5px' }}>Semua stok produk dalam kondisi aman.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {lowStockProducts.map((p) => (
                <div
                  key={p.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    background: p.stock <= 0 ? '#FFF5F5' : '#FFFBEB',
                    border: p.stock <= 0 ? '1px solid #FECDD3' : '1px solid #FDE68A',
                  }}
                >
                  <div>
                    <h4 style={{ fontSize: '13.5px', fontWeight: 700, margin: '0 0 2px 0', color: p.stock <= 0 ? '#991B1B' : '#B45309' }}>
                      {p.name}
                    </h4>
                    <p style={{ fontSize: '11.5px', color: p.stock <= 0 ? '#991B1B' : '#92400E', margin: 0, opacity: 0.85 }}>
                      SKU: {p.sku}
                    </p>
                  </div>

                  <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '12.5px', fontWeight: 800, color: p.stock <= 0 ? '#991B1B' : '#B45309' }}>
                      Sisa {p.stock}
                    </span>
                    <span className={p.stock <= 0 ? 'badge badge-rose' : 'badge badge-amber'}>
                      {p.stock <= 0 ? 'Out of Stock' : 'Low Stock'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
