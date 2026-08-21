import React, { useState } from 'react';
import { TrendingUp, DollarSign, Printer, CreditCard, ShoppingBag, Clock, Award, ChevronUp, PackageCheck, Percent, Calendar, Sparkles } from 'lucide-react';
import type { Order, Product } from '../types/pos';

interface SalesReportViewProps {
  orders: Order[];
  products: Product[];
}

export const SalesReportView: React.FC<SalesReportViewProps> = ({ orders, products }) => {
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month'>('week');
  const [activeBarIndex, setActiveBarIndex] = useState<number | null>(6);

  const formatIDR = (val: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);

  // Filter orders based on selected timeRange
  const now = new Date();
  const filteredOrders = orders.filter((o) => {
    const ordDate = new Date(o.createdAt);
    if (timeRange === 'today') {
      return ordDate.toDateString() === now.toDateString();
    } else if (timeRange === 'week') {
      const sevenDaysAgo = new Date(now);
      sevenDaysAgo.setDate(now.getDate() - 6);
      sevenDaysAgo.setHours(0, 0, 0, 0);
      return ordDate >= sevenDaysAgo;
    } else if (timeRange === 'month') {
      return ordDate.getMonth() === now.getMonth() && ordDate.getFullYear() === now.getFullYear();
    }
    return true;
  });

  // 1. Total Penjualan
  const totalPenjualan = filteredOrders.reduce((sum, o) => sum + o.totalAmount, 0);

  // 2. Total HPP (Cost of Goods Sold)
  const totalHPP = filteredOrders.reduce((sum, o) => {
    return (
      sum +
      o.items.reduce((itemSum, item) => {
        const p = products.find((prod) => prod.id === item.productId);
        return itemSum + (p ? p.costPrice : 0) * item.quantity;
      }, 0)
    );
  }, 0);

  // 3. Profit Margin %
  const netProfit = Math.max(0, totalPenjualan - totalHPP);
  const profitMarginPercent = totalPenjualan > 0 ? ((netProfit / totalPenjualan) * 100).toFixed(1) : '0';

  // 4. Rata-rata Transaksi (AOV)
  const totalTransactionsCount = filteredOrders.length;
  const avgOrderValue = totalTransactionsCount > 0 ? totalPenjualan / totalTransactionsCount : 0;

  // Payment Breakdown
  const cashOrders = filteredOrders.filter((o) => o.paymentMethod === 'CASH');
  const qrisOrders = filteredOrders.filter((o) => o.paymentMethod === 'QRIS');
  const debitOrders = filteredOrders.filter((o) => o.paymentMethod === 'DEBIT');
  const creditOrders = filteredOrders.filter((o) => o.paymentMethod === 'CREDIT');

  const cashTotal = cashOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const qrisTotal = qrisOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const debitTotal = debitOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const creditTotal = creditOrders.reduce((sum, o) => sum + o.totalAmount, 0);

  // Weekly Sales Trend Data (Last 7 Days)
  const daysOfWeek = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const dynamicWeeklySales = Array.from({ length: 7 }).map((_, idx) => {
    const d = new Date(now);
    d.setDate(now.getDate() - (6 - idx));
    const dayName = daysOfWeek[d.getDay()];
    const dateStr = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });

    const dayOrders = filteredOrders.filter((o) => {
      const ordDate = new Date(o.createdAt);
      return ordDate.toDateString() === d.toDateString();
    });

    const sales = dayOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    return { day: dayName, date: dateStr, sales, ordersCount: dayOrders.length };
  });

  const maxWeeklySales = Math.max(...dynamicWeeklySales.map((w) => w.sales), 1);

  // Top 5 Selling Products Leaderboard
  const productSalesMap = new Map<string, { name: string; sold: number; revenue: number }>();
  filteredOrders.forEach((o) => {
    o.items.forEach((item) => {
      const existing = productSalesMap.get(item.productId) || { name: item.productName, sold: 0, revenue: 0 };
      existing.sold += item.quantity;
      existing.revenue += item.subtotal;
      productSalesMap.set(item.productId, existing);
    });
  });

  const topSellingProducts = Array.from(productSalesMap.values())
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5)
    .map((item, idx) => ({
      rank: idx + 1,
      name: item.name,
      sold: item.sold,
      revenue: item.revenue,
    }));

  // Peak Hours Analysis
  const peakSlotCounts = {
    morning: 0,   // 07:00 - 10:00
    lunch: 0,     // 11:00 - 14:00
    afternoon: 0, // 15:00 - 18:00
    evening: 0,   // 19:00 - 22:00
  };

  filteredOrders.forEach((o) => {
    const hour = new Date(o.createdAt).getHours();
    if (hour >= 7 && hour <= 10) peakSlotCounts.morning += 1;
    else if (hour >= 11 && hour <= 14) peakSlotCounts.lunch += 1;
    else if (hour >= 15 && hour <= 18) peakSlotCounts.afternoon += 1;
    else if (hour >= 19 && hour <= 22) peakSlotCounts.evening += 1;
  });

  const totalPeakOrders = filteredOrders.length || 1;
  const maxPeakCount = Math.max(peakSlotCounts.morning, peakSlotCounts.lunch, peakSlotCounts.afternoon, peakSlotCounts.evening);

  const peakHours = [
    { time: '07:00 – 10:00', label: 'Morning Coffee Rush', count: peakSlotCounts.morning, percent: Math.round((peakSlotCounts.morning / totalPeakOrders) * 100), isPeak: peakSlotCounts.morning > 0 && peakSlotCounts.morning === maxPeakCount },
    { time: '11:00 – 14:00', label: 'Lunch & Pastry Peak', count: peakSlotCounts.lunch, percent: Math.round((peakSlotCounts.lunch / totalPeakOrders) * 100), isPeak: peakSlotCounts.lunch > 0 && peakSlotCounts.lunch === maxPeakCount },
    { time: '15:00 – 18:00', label: 'Afternoon Hangout', count: peakSlotCounts.afternoon, percent: Math.round((peakSlotCounts.afternoon / totalPeakOrders) * 100), isPeak: peakSlotCounts.afternoon > 0 && peakSlotCounts.afternoon === maxPeakCount },
    { time: '19:00 – 22:00', label: 'Evening Chill', count: peakSlotCounts.evening, percent: Math.round((peakSlotCounts.evening / totalPeakOrders) * 100), isPeak: peakSlotCounts.evening > 0 && peakSlotCounts.evening === maxPeakCount },
  ];

  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%', maxWidth: '1400px', margin: '0 auto' }}>
      {/* 1. Page Sub-Header Banner */}
      <div className="card-panel" style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 800, margin: 0, color: '#1C1917', letterSpacing: '-0.01em' }}>
            Analisis Performa Penjualan
          </h2>
          <p style={{ fontSize: '13px', color: '#6E6761', margin: '3px 0 0 0', fontWeight: 500 }}>
            Analisis performa penjualan dan kesehatan keuangan Brewly Coffee.
          </p>
        </div>

        {/* Active Filter Period Indicator */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', borderRadius: '20px', background: '#FAF8F5', border: '1px solid #E8E4DF', color: '#3D2B1F', fontSize: '12.5px', fontWeight: 700 }}>
          <Calendar size={14} color="#C89D7C" />
          <span>
            Periode: {timeRange === 'today' ? 'Hari Ini' : timeRange === 'week' ? '7 Hari Terakhir' : 'Bulan Ini'}
          </span>
        </div>
      </div>

      {/* 2. Compact Filter & Action Control Bar */}
      <div className="card-panel" style={{ padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        {/* Segmented Control Filter */}
        <div style={{ background: '#FAF8F5', borderRadius: '10px', padding: '3px', border: '1px solid #E8E4DF', display: 'flex', gap: '4px' }}>
          <button
            onClick={() => setTimeRange('today')}
            style={{
              padding: '6px 14px',
              borderRadius: '8px',
              border: 'none',
              background: timeRange === 'today' ? '#3D2B1F' : 'transparent',
              color: timeRange === 'today' ? '#FFFFFF' : '#6E6761',
              fontSize: '12.5px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
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
              background: timeRange === 'week' ? '#3D2B1F' : 'transparent',
              color: timeRange === 'week' ? '#FFFFFF' : '#6E6761',
              fontSize: '12.5px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
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
              background: timeRange === 'month' ? '#3D2B1F' : 'transparent',
              color: timeRange === 'month' ? '#FFFFFF' : '#6E6761',
              fontSize: '12.5px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            Bulan Ini
          </button>
        </div>

        {/* Compact Export PDF Button */}
        <button className="btn btn-secondary" onClick={handlePrintReport} style={{ minHeight: '36px', padding: '6px 14px', fontSize: '12.5px' }}>
          <Printer size={14} />
          <span>Export Report</span>
        </button>
      </div>

      {/* 3. 4 Financial KPI Cards Grid */}
      <div className="kpi-grid">
        {/* KPI 1: Total Penjualan */}
        <div className="kpi-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div className="kpi-icon-wrapper" style={{ width: '40px', height: '40px', background: '#F4ECE6', color: '#3D2B1F' }}>
              <DollarSign size={18} />
            </div>
            <span className="badge badge-emerald">
              <ChevronUp size={11} /> Real-time
            </span>
          </div>
          <div>
            <div className="kpi-lbl" style={{ fontSize: '12.5px', marginBottom: '2px' }}>Total Penjualan</div>
            <div className="kpi-val" style={{ fontSize: '26px' }}>{formatIDR(totalPenjualan)}</div>
            <div style={{ fontSize: '12px', color: '#6E6761', marginTop: '4px', fontWeight: 500 }}>
              Omzet kotor ({totalTransactionsCount} Transaksi)
            </div>
          </div>
        </div>

        {/* KPI 2: Total HPP */}
        <div className="kpi-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div className="kpi-icon-wrapper" style={{ width: '40px', height: '40px', background: '#FEE2E2', color: '#991B1B' }}>
              <PackageCheck size={18} />
            </div>
            <span className="badge badge-amber">Harga Pokok</span>
          </div>
          <div>
            <div className="kpi-lbl" style={{ fontSize: '12.5px', marginBottom: '2px' }}>Total HPP (COGS)</div>
            <div className="kpi-val" style={{ fontSize: '26px', color: '#991B1B' }}>{formatIDR(totalHPP)}</div>
            <div style={{ fontSize: '12px', color: '#6E6761', marginTop: '4px', fontWeight: 500 }}>
              Modal Pokok Penjualan
            </div>
          </div>
        </div>

        {/* KPI 3: Profit Margin */}
        <div className="kpi-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div className="kpi-icon-wrapper" style={{ width: '40px', height: '40px', background: '#DCFCE7', color: '#15803D' }}>
              <Percent size={18} />
            </div>
            <span className="badge badge-emerald">Margin %</span>
          </div>
          <div>
            <div className="kpi-lbl" style={{ fontSize: '12.5px', marginBottom: '2px' }}>Profit Margin</div>
            <div className="kpi-val" style={{ fontSize: '26px', color: '#15803D' }}>{profitMarginPercent}%</div>
            <div style={{ fontSize: '12px', color: '#6E6761', marginTop: '4px', fontWeight: 500 }}>
              Profit Net: {formatIDR(netProfit)}
            </div>
          </div>
        </div>

        {/* KPI 4: Rata-rata Transaksi */}
        <div className="kpi-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div className="kpi-icon-wrapper" style={{ width: '40px', height: '40px', background: '#FEF3C7', color: '#B45309' }}>
              <ShoppingBag size={18} />
            </div>
            <span className="badge badge-coffee">AOV</span>
          </div>
          <div>
            <div className="kpi-lbl" style={{ fontSize: '12.5px', marginBottom: '2px' }}>Rata-rata Transaksi</div>
            <div className="kpi-val" style={{ fontSize: '26px' }}>{formatIDR(avgOrderValue)}</div>
            <div style={{ fontSize: '12px', color: '#6E6761', marginTop: '4px', fontWeight: 500 }}>
              Average Order Value (AOV)
            </div>
          </div>
        </div>
      </div>

      {/* 4. Sales Trend Chart Card */}
      <div className="card-panel" style={{ padding: '24px 28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 className="section-title" style={{ fontSize: '18px' }}>
              <TrendingUp color="#3D2B1F" size={20} />
              <span>Grafik Tren Omzet Penjualan Harian</span>
            </h3>
            <p style={{ fontSize: '12.5px', color: '#6E6761', margin: '2px 0 0 0' }}>
              Dikalkulasi berdasarkan volume omzet harian pada periode terpilih.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', fontWeight: 700, color: '#3D2B1F' }}>
            <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#3D2B1F', display: 'inline-block' }} />
            <span>Volume Penjualan (Rp)</span>
          </div>
        </div>

        <div style={{ width: '100%', overflowX: 'auto', paddingBottom: '4px' }}>
          <div
            style={{
              minWidth: '600px',
              height: '340px',
              background: '#FAF8F5',
              borderRadius: '16px',
              border: '1px solid #E8E4DF',
              padding: '28px 24px 18px 24px',
              display: 'flex',
              alignItems: 'flex-end',
              gap: '16px',
              position: 'relative',
            }}
          >
            {/* Y-Axis Gridlines */}
            <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, pointerEvents: 'none', padding: '28px 24px 38px 24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              {[formatIDR(maxWeeklySales), formatIDR(Math.round(maxWeeklySales * 0.75)), formatIDR(Math.round(maxWeeklySales * 0.5)), formatIDR(Math.round(maxWeeklySales * 0.25)), 'Rp 0'].map((label, idx) => (
                <div key={idx} style={{ borderBottom: '1px dashed #E8E4DF', width: '100%', position: 'relative' }}>
                  <span style={{ position: 'absolute', right: '12px', top: '-10px', fontSize: '11px', fontWeight: 600, color: '#9C958E' }}>{label}</span>
                </div>
              ))}
            </div>

            {/* Dynamic Bar Columns */}
            <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '16px', height: '100%', zIndex: 1, paddingRight: '60px' }}>
              {dynamicWeeklySales.map((item, idx) => {
                const heightPercent = item.sales > 0 ? Math.max(14, Math.min(100, Math.round((item.sales / maxWeeklySales) * 100))) + '%' : '6%';
                const isActive = activeBarIndex === idx;

                return (
                  <div
                    key={idx}
                    onClick={() => setActiveBarIndex(idx)}
                    onMouseEnter={() => setActiveBarIndex(idx)}
                    style={{
                      flex: 1,
                      minWidth: '55px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      height: '100%',
                      justifyContent: 'flex-end',
                      cursor: 'pointer',
                      position: 'relative',
                    }}
                  >
                    <div
                      style={{
                        background: isActive ? '#3D2B1F' : '#FFFFFF',
                        color: isActive ? '#FFFFFF' : item.sales > 0 ? '#3D2B1F' : '#9C958E',
                        border: isActive ? '1px solid #3D2B1F' : '1px solid #E8E4DF',
                        padding: isActive ? '4px 10px' : '3px 8px',
                        borderRadius: '8px',
                        fontSize: isActive ? '11.5px' : '11px',
                        fontWeight: 800,
                        boxShadow: isActive ? '0 4px 14px rgba(61, 43, 31, 0.25)' : '0 1px 4px rgba(0,0,0,0.03)',
                        marginBottom: '8px',
                        whiteSpace: 'nowrap',
                        transition: 'all 0.2s ease',
                        transform: isActive ? 'translateY(-2px)' : 'translateY(0)',
                        zIndex: isActive ? 10 : 2,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '1px',
                      }}
                    >
                      <span>{formatIDR(item.sales)}</span>
                      {isActive && item.ordersCount > 0 && (
                        <span style={{ fontSize: '9.5px', fontWeight: 600, opacity: 0.9 }}>
                          {item.ordersCount} Transaksi
                        </span>
                      )}
                    </div>

                    <div
                      style={{
                        width: '100%',
                        maxWidth: '44px',
                        height: heightPercent,
                        background: isActive
                          ? 'linear-gradient(180deg, #C89D7C 0%, #3D2B1F 100%)'
                          : item.sales > 0
                          ? 'linear-gradient(180deg, #9C785F 0%, #3D2B1F 100%)'
                          : '#E8E4DF',
                        borderRadius: '8px 8px 0 0',
                        boxShadow: isActive ? '0 4px 14px rgba(61, 43, 31, 0.3)' : 'none',
                        transition: 'all 0.2s ease',
                      }}
                    />

                    <div style={{ textAlign: 'center', marginTop: '10px' }}>
                      <div style={{ fontSize: '12.5px', fontWeight: isActive ? 800 : 700, color: isActive ? '#3D2B1F' : '#1C1917' }}>{item.day}</div>
                      <div style={{ fontSize: '11px', color: isActive ? '#3D2B1F' : '#6E6761', fontWeight: 500 }}>{item.date}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 5. 2-Column Analytics: Breakdown Payment Methods (50%) & Top 5 Products Leaderboard (50%) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        {/* Left: Payment Method Breakdown Card */}
        <div className="card-panel" style={{ padding: '24px' }}>
          <div style={{ marginBottom: '18px' }}>
            <h3 className="section-title" style={{ fontSize: '18px' }}>
              <CreditCard color="#3D2B1F" size={20} />
              <span>Breakdown Metode Pembayaran</span>
            </h3>
            <p style={{ fontSize: '12.5px', color: '#6E6761', margin: '2px 0 0 0' }}>Distribusikan opsi transaksi yang digunakan pelanggan.</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {/* Cash */}
            {(() => {
              const pct = totalPenjualan > 0 ? Math.round((cashTotal / totalPenjualan) * 100) : 0;
              return (
                <div style={{ padding: '12px 16px', borderRadius: '12px', background: '#FAF8F5', border: '1px solid #E8E4DF', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '13px', color: '#1C1917', fontWeight: 700 }}>💵 Tunai / Cash</div>
                      <div style={{ fontSize: '11.5px', color: '#6E6761' }}>{cashOrders.length} transaksi</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '15px', fontWeight: 800, color: '#3D2B1F' }}>{formatIDR(cashTotal)}</div>
                      <span className="badge badge-coffee" style={{ fontSize: '10.5px', padding: '2px 8px' }}>{pct}%</span>
                    </div>
                  </div>
                  <div style={{ width: '100%', height: '5px', background: '#E8E4DF', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: '#3D2B1F', borderRadius: '4px', transition: 'width 0.4s ease' }} />
                  </div>
                </div>
              );
            })()}

            {/* QRIS */}
            {(() => {
              const pct = totalPenjualan > 0 ? Math.round((qrisTotal / totalPenjualan) * 100) : 0;
              return (
                <div style={{ padding: '12px 16px', borderRadius: '12px', background: '#FAF8F5', border: '1px solid #E8E4DF', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '13px', color: '#1C1917', fontWeight: 700 }}>📱 QRIS</div>
                      <div style={{ fontSize: '11.5px', color: '#6E6761' }}>{qrisOrders.length} transaksi</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '15px', fontWeight: 800, color: '#15803D' }}>{formatIDR(qrisTotal)}</div>
                      <span className="badge badge-emerald" style={{ fontSize: '10.5px', padding: '2px 8px' }}>{pct}%</span>
                    </div>
                  </div>
                  <div style={{ width: '100%', height: '5px', background: '#E8E4DF', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: '#15803D', borderRadius: '4px', transition: 'width 0.4s ease' }} />
                  </div>
                </div>
              );
            })()}

            {/* Debit */}
            {(() => {
              const pct = totalPenjualan > 0 ? Math.round((debitTotal / totalPenjualan) * 100) : 0;
              return (
                <div style={{ padding: '12px 16px', borderRadius: '12px', background: '#FAF8F5', border: '1px solid #E8E4DF', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '13px', color: '#1C1917', fontWeight: 700 }}>💳 Kartu Debit</div>
                      <div style={{ fontSize: '11.5px', color: '#6E6761' }}>{debitOrders.length} transaksi</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '15px', fontWeight: 800, color: '#B45309' }}>{formatIDR(debitTotal)}</div>
                      <span className="badge badge-amber" style={{ fontSize: '10.5px', padding: '2px 8px' }}>{pct}%</span>
                    </div>
                  </div>
                  <div style={{ width: '100%', height: '5px', background: '#E8E4DF', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: '#B45309', borderRadius: '4px', transition: 'width 0.4s ease' }} />
                  </div>
                </div>
              );
            })()}

            {/* Credit */}
            {creditTotal > 0 && (() => {
              const pct = totalPenjualan > 0 ? Math.round((creditTotal / totalPenjualan) * 100) : 0;
              return (
                <div style={{ padding: '12px 16px', borderRadius: '12px', background: '#FAF8F5', border: '1px solid #E8E4DF', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '13px', color: '#1C1917', fontWeight: 700 }}>💳 Kartu Kredit</div>
                      <div style={{ fontSize: '11.5px', color: '#6E6761' }}>{creditOrders.length} transaksi</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '15px', fontWeight: 800, color: '#3D2B1F' }}>{formatIDR(creditTotal)}</div>
                      <span className="badge badge-coffee" style={{ fontSize: '10.5px', padding: '2px 8px' }}>{pct}%</span>
                    </div>
                  </div>
                  <div style={{ width: '100%', height: '5px', background: '#E8E4DF', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: '#3D2B1F', borderRadius: '4px', transition: 'width 0.4s ease' }} />
                  </div>
                </div>
              );
            })()}
          </div>
        </div>

        {/* Right: Top 5 Products Leaderboard Card */}
        <div className="card-panel" style={{ padding: '24px' }}>
          <div style={{ marginBottom: '18px' }}>
            <h3 className="section-title" style={{ fontSize: '18px' }}>
              <Award color="#3D2B1F" size={20} />
              <span>Top 5 Produk Terlaris</span>
            </h3>
            <p style={{ fontSize: '12.5px', color: '#6E6761', margin: '2px 0 0 0' }}>Leaderboard produk kopi dan menu terfavorit pelanggan.</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {topSellingProducts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#9C958E' }}>
                <p style={{ margin: 0, fontWeight: 600, fontSize: '13.5px' }}>Belum ada data penjualan produk pada periode ini.</p>
              </div>
            ) : (
              topSellingProducts.map((p) => {
                const isTop1 = p.rank === 1;
                return (
                  <div
                    key={p.rank}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: isTop1 ? '12px 16px' : '10px 14px',
                      borderRadius: '12px',
                      background: isTop1 ? 'linear-gradient(135deg, #FAF8F5 0%, #F4ECE6 100%)' : '#FAF8F5',
                      border: isTop1 ? '1px solid #C89D7C' : '1px solid #E8E4DF',
                      boxShadow: isTop1 ? '0 2px 8px rgba(61, 43, 31, 0.06)' : 'none',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div
                        style={{
                          width: '30px',
                          height: '30px',
                          borderRadius: '50%',
                          background: isTop1 ? '#3D2B1F' : '#E8E4DF',
                          color: isTop1 ? '#FFFFFF' : '#1C1917',
                          fontWeight: 800,
                          fontSize: '12.5px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        #{p.rank}
                      </div>
                      <div>
                        <h4 style={{ fontSize: isTop1 ? '13.5px' : '13px', fontWeight: 700, margin: '0 0 2px 0', color: '#1C1917', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span>{p.name}</span>
                          {isTop1 && <Sparkles size={12} color="#C89D7C" />}
                        </h4>
                        <p style={{ fontSize: '11px', color: '#6E6761', margin: 0 }}>Terjual {p.sold} porsi</p>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: isTop1 ? '14.5px' : '13.5px', fontWeight: 800, color: '#3D2B1F' }}>{formatIDR(p.revenue)}</div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* 6. Peak Hours Time Analytics Card (Strict 4-Column Grid on Desktop & Single Line Time Ranges) */}
      <div className="card-panel" style={{ padding: '24px 28px' }}>
        <div style={{ marginBottom: '18px' }}>
          <h3 className="section-title" style={{ fontSize: '18px' }}>
            <Clock color="#3D2B1F" size={20} />
            <span>Analisis Jam Ramai (Peak Hours)</span>
          </h3>
          <p style={{ fontSize: '12.5px', color: '#6E6761', margin: '2px 0 0 0' }}>
            Distribusi kepadatan pesanan pelanggan berdasarkan slot jam operasional kedai.
          </p>
        </div>

        {/* 4 Columns in 1 Row on Desktop using .kpi-grid */}
        <div className="kpi-grid">
          {peakHours.map((item, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '12px',
                padding: '16px 18px',
                borderRadius: '14px',
                background: item.isPeak ? 'linear-gradient(135deg, #FAF8F5 0%, #F4ECE6 100%)' : '#FAF8F5',
                border: item.isPeak ? '1px solid #C89D7C' : '1px solid #E8E4DF',
                boxShadow: item.isPeak ? '0 4px 14px rgba(61, 43, 31, 0.08)' : 'none',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <h4 style={{ fontSize: '13.5px', fontWeight: 800, margin: '0 0 2px 0', color: '#1C1917', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {item.time}
                  </h4>
                  <p style={{ fontSize: '11.5px', color: '#6E6761', margin: 0, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {item.label}
                  </p>
                </div>
                {item.isPeak && (
                  <span className="badge badge-coffee" style={{ fontSize: '9.5px', padding: '2px 7px', fontWeight: 800, whiteSpace: 'nowrap', flexShrink: 0 }}>
                    PEAK PERIOD
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderTop: '1px solid #E8E4DF', paddingTop: '10px' }}>
                <div>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: item.isPeak ? '#3D2B1F' : '#1C1917' }}>{item.count} Pesanan</div>
                  <div style={{ fontSize: '11.5px', color: '#6E6761' }}>{item.percent}% dari total order</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
