import React, { useState } from 'react';
import { BarChart3, TrendingUp, DollarSign, Coffee, PieChart, Clock, Award, Download } from 'lucide-react';
import type { Order, Product, Category } from '../types/pos';

interface AnalyticsViewProps {
  orders: Order[];
  products: Product[];
  categories: Category[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ orders, products }) => {
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month'>('week');

  const formatIDR = (val: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);

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
  const averageOrderValue = orders.length > 0 ? grossRevenue / orders.length : 0;

  const weeklySalesData = [
    { day: 'Senin', sales: 1900000, height: '45%' },
    { day: 'Selasa', sales: 2100000, height: '55%' },
    { day: 'Rabu', sales: 1900000, height: '45%' },
    { day: 'Kamis', sales: 2500000, height: '65%' },
    { day: 'Jumat', sales: 3200000, height: '80%' },
    { day: 'Sabtu', sales: 4100000, height: '100%' },
    { day: 'Minggu', sales: 3800000, height: '90%' },
  ];

  const topSellingProducts = [
    { rank: 1, name: 'Kopi Espresso House Blend 250g', sold: 1, revenue: 85000, marginTag: 'High Margin' },
    { rank: 2, name: 'Iced Caramel Macchiato', sold: 2, revenue: 70000, marginTag: 'High Margin' },
    { rank: 3, name: 'Croissant French Butter', sold: 2, revenue: 56000, marginTag: 'High Margin' },
    { rank: 4, name: 'Cheesecake Blueberry Slice', sold: 1, revenue: 38000, marginTag: 'High Margin' },
  ];

  const peakHours = [
    { time: '07:00 - 10:00', label: 'Morning Coffee Rush', status: 'Trafik Tinggi', color: '#15803d' },
    { time: '11:00 - 14:00', label: 'Lunch & Pastry Peak', status: 'Trafik Sedang', color: '#b45309' },
    { time: '15:00 - 18:00', label: 'Afternoon Hangout', status: 'Trafik Tinggi', color: '#15803d' },
    { time: '19:00 - 22:00', label: 'Evening Chill', status: 'Trafik Sangat Tinggi', color: '#4B3832' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Header Card */}
      <div
        style={{
          background: '#FFFFFF',
          border: '1px solid #E2DFDA',
          borderRadius: '14px',
          padding: '24px 28px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
        }}
      >
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 800, margin: 0, color: '#1A1A1A', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <BarChart3 color="#4B3832" size={24} />
            <span>Laporan Analytics & Performa Bisnis</span>
          </h2>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ background: '#F5F5F5', borderRadius: '10px', padding: '4px', border: '1px solid #E2DFDA', display: 'flex' }}>
            <button
              onClick={() => setTimeRange('today')}
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                border: 'none',
                background: timeRange === 'today' ? '#4B3832' : 'transparent',
                color: timeRange === 'today' ? '#FFFFFF' : '#57524E',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Hari Ini
            </button>
            <button
              onClick={() => setTimeRange('week')}
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                border: 'none',
                background: timeRange === 'week' ? '#4B3832' : 'transparent',
                color: timeRange === 'week' ? '#FFFFFF' : '#57524E',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              7 Hari Terakhir
            </button>
            <button
              onClick={() => setTimeRange('month')}
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                border: 'none',
                background: timeRange === 'month' ? '#4B3832' : 'transparent',
                color: timeRange === 'month' ? '#FFFFFF' : '#57524E',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Bulan Ini
            </button>
          </div>

          <button className="btn btn-secondary" style={{ padding: '8px 14px', fontSize: '13px' }}>
            <Download size={16} />
            <span>Ekspor Laporan</span>
          </button>
        </div>
      </div>

      {/* 4 Financial Key Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
        {/* Gross Revenue */}
        <div style={{ background: '#FFFFFF', border: '1px solid #E2DFDA', borderRadius: '14px', padding: '20px', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <div style={{ padding: '10px', borderRadius: '10px', background: '#F2EDE9', color: '#4B3832' }}>
              <DollarSign size={22} />
            </div>
            <span className="badge badge-emerald" style={{ fontSize: '11px' }}>
              <TrendingUp size={12} /> +18.5%
            </span>
          </div>
          <p style={{ fontSize: '12px', color: '#57524E', margin: '0 0 4px 0', textTransform: 'uppercase', fontWeight: 700 }}>Omzet Kotor (Gross)</p>
          <h3 style={{ fontSize: '22px', fontWeight: 800, margin: 0, color: '#1A1A1A' }}>{formatIDR(grossRevenue)}</h3>
        </div>

        {/* Net Profit */}
        <div style={{ background: '#FFFFFF', border: '1px solid #E2DFDA', borderRadius: '14px', padding: '20px', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <div style={{ padding: '10px', borderRadius: '10px', background: '#dcfce7', color: '#15803d' }}>
              <TrendingUp size={22} />
            </div>
            <span className="badge badge-emerald" style={{ fontSize: '11px' }}>
              Margin {profitMarginPercent}%
            </span>
          </div>
          <p style={{ fontSize: '12px', color: '#57524E', margin: '0 0 4px 0', textTransform: 'uppercase', fontWeight: 700 }}>Profit Bersih (Net)</p>
          <h3 style={{ fontSize: '22px', fontWeight: 800, margin: 0, color: '#15803d' }}>{formatIDR(netProfit)}</h3>
        </div>

        {/* Average Order Value */}
        <div style={{ background: '#FFFFFF', border: '1px solid #E2DFDA', borderRadius: '14px', padding: '20px', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <div style={{ padding: '10px', borderRadius: '10px', background: '#fef3c7', color: '#b45309' }}>
              <Coffee size={22} />
            </div>
            <span className="badge badge-amber" style={{ fontSize: '11px' }}>Per Pelanggan</span>
          </div>
          <p style={{ fontSize: '12px', color: '#57524E', margin: '0 0 4px 0', textTransform: 'uppercase', fontWeight: 700 }}>Rata-Rata Pembelian</p>
          <h3 style={{ fontSize: '22px', fontWeight: 800, margin: 0, color: '#1A1A1A' }}>{formatIDR(averageOrderValue)}</h3>
        </div>

        {/* Completed Orders Count */}
        <div style={{ background: '#FFFFFF', border: '1px solid #E2DFDA', borderRadius: '14px', padding: '20px', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <div style={{ padding: '10px', borderRadius: '10px', background: '#F2EDE9', color: '#4B3832' }}>
              <Award size={22} />
            </div>
            <span className="badge badge-emerald" style={{ fontSize: '11px' }}>100% Sukses</span>
          </div>
          <p style={{ fontSize: '12px', color: '#57524E', margin: '0 0 4px 0', textTransform: 'uppercase', fontWeight: 700 }}>Total Transaksi Selesai</p>
          <h3 style={{ fontSize: '22px', fontWeight: 800, margin: 0, color: '#1A1A1A' }}>{orders.length} Pesanan</h3>
        </div>
      </div>

      {/* Main Grid: Bar Chart & Category Breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px' }}>
        {/* Weekly Sales Trend Bar Chart */}
        <div style={{ background: '#FFFFFF', border: '1px solid #E2DFDA', borderRadius: '14px', padding: '24px', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 2px 0', color: '#1A1A1A', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <TrendingUp color="#4B3832" size={18} />
                <span>Grafik Tren Penjualan Mingguan</span>
              </h3>
              <p style={{ fontSize: '12px', color: '#57524E', margin: 0 }}>Volume omzet dan jumlah transaksi harian</p>
            </div>
            <span className="badge badge-emerald" style={{ fontSize: '11px' }}>Puncak Hari Sabtu</span>
          </div>

          <div style={{ height: '220px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '12px', padding: '20px 10px 10px 10px', background: '#F5F5F5', borderRadius: '12px', border: '1px solid #E2DFDA' }}>
            {weeklySalesData.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', flex: 1, height: '100%', justifyContent: 'flex-end' }}>
                <span style={{ fontSize: '10px', fontWeight: 700, color: '#4B3832' }}>{(item.sales / 1000000).toFixed(1)}M</span>
                <div
                  style={{
                    width: '100%',
                    maxWidth: '32px',
                    height: item.height,
                    background: idx === 5 ? '#4B3832' : 'linear-gradient(180deg, #6B4E44 0%, #4B3832 100%)',
                    borderRadius: '6px 6px 0 0',
                    boxShadow: '0 4px 10px rgba(75, 56, 50, 0.2)',
                  }}
                />
                <span style={{ fontSize: '11px', color: '#57524E', fontWeight: 600 }}>{item.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Category Contribution Progress Bars */}
        <div style={{ background: '#FFFFFF', border: '1px solid #E2DFDA', borderRadius: '14px', padding: '24px', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 2px 0', color: '#1A1A1A', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <PieChart color="#4B3832" size={18} />
              <span>Kontribusi Kategori</span>
            </h3>
            <p style={{ fontSize: '12px', color: '#57524E', margin: 0 }}>Persentase omzet berdasarkan jenis produk</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                <span style={{ color: '#1A1A1A' }}>Minuman & Kopi</span>
                <span style={{ color: '#4B3832', fontWeight: 700 }}>Rp 155.000 (59%)</span>
              </div>
              <div style={{ width: '100%', height: '8px', background: '#F5F5F5', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: '59%', height: '100%', background: '#4B3832', borderRadius: '4px' }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                <span style={{ color: '#1A1A1A' }}>Makanan & Bakery</span>
                <span style={{ color: '#15803d', fontWeight: 700 }}>Rp 56.000 (21%)</span>
              </div>
              <div style={{ width: '100%', height: '8px', background: '#F5F5F5', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: '21%', height: '100%', background: '#15803d', borderRadius: '4px' }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                <span style={{ color: '#1A1A1A' }}>Snack & Dessert</span>
                <span style={{ color: '#b45309', fontWeight: 700 }}>Rp 38.000 (15%)</span>
              </div>
              <div style={{ width: '100%', height: '8px', background: '#F5F5F5', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: '15%', height: '100%', background: '#b45309', borderRadius: '4px' }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Top Selling Products Leaderboard & Peak Hours */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px' }}>
        {/* Top 5 Products Leaderboard */}
        <div style={{ background: '#FFFFFF', border: '1px solid #E2DFDA', borderRadius: '14px', padding: '24px', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 16px 0', color: '#1A1A1A', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Award color="#4B3832" size={18} />
            <span>Produk Terlaris (Top 5 Leaderboard)</span>
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {topSellingProducts.map((p) => (
              <div
                key={p.rank}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  background: '#F5F5F5',
                  border: '1px solid #E2DFDA',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      background: p.rank === 1 ? '#4B3832' : '#E2DFDA',
                      color: p.rank === 1 ? '#FFFFFF' : '#1A1A1A',
                      fontWeight: 800,
                      fontSize: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    #{p.rank}
                  </div>
                  <div>
                    <h4 style={{ fontSize: '13px', fontWeight: 700, margin: '0 0 2px 0', color: '#1A1A1A' }}>{p.name}</h4>
                    <p style={{ fontSize: '11px', color: '#57524E', margin: 0 }}>Terjual {p.sold} porsi</p>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: '#4B3832' }}>{formatIDR(p.revenue)}</div>
                  <span className="badge badge-emerald" style={{ fontSize: '9px' }}>{p.marginTag}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Peak Hours Timeline Analysis */}
        <div style={{ background: '#FFFFFF', border: '1px solid #E2DFDA', borderRadius: '14px', padding: '24px', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 16px 0', color: '#1A1A1A', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock color="#4B3832" size={18} />
            <span>Analisis Jam Ramai (Peak Hours)</span>
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {peakHours.map((item, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  background: '#F5F5F5',
                  border: '1px solid #E2DFDA',
                }}
              >
                <div>
                  <h4 style={{ fontSize: '13px', fontWeight: 700, margin: '0 0 2px 0', color: '#1A1A1A' }}>{item.time}</h4>
                  <p style={{ fontSize: '11px', color: '#57524E', margin: 0 }}>{item.label}</p>
                </div>
                <span className="badge badge-emerald" style={{ background: `${item.color}15`, color: item.color, border: `1px solid ${item.color}30` }}>
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
