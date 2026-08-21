import React, { useState, useMemo } from 'react';
import {
  Users,
  Search,
  Eye,
  X,
  ShoppingBag,
  TrendingUp,
  UserCheck,
  ChevronDown,
  FileText,
  Calendar,
  CreditCard,
  ExternalLink,
} from 'lucide-react';
import type { Order } from '../types/pos';

interface CustomersViewProps {
  orders: Order[];
}

interface CustomerSummary {
  name: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate: string;
  orders: Order[];
  paymentMethods: Record<string, number>;
}

type SortOption = 'terbaru' | 'terlama' | 'pembelian_tertinggi' | 'pembelian_terendah' | 'pesanan_terbanyak';

/* ─── helpers ─── */
function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

function getAvatarColor(name: string): { bg: string; text: string } {
  const palette = [
    { bg: '#F4ECE6', text: '#3D2B1F' },
    { bg: '#DCFCE7', text: '#15803D' },
    { bg: '#E0E7FF', text: '#4338CA' },
    { bg: '#FEF3C7', text: '#B45309' },
    { bg: '#FEE2E2', text: '#991B1B' },
    { bg: '#F3EFEA', text: '#6E6761' },
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return palette[Math.abs(hash) % palette.length];
}

function formatDateShort(iso: string): { date: string; time: string } {
  const d = new Date(iso);
  const date = d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
  const time = d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false });
  return { date, time };
}

function getMostUsedPayment(methods: Record<string, number>): string {
  if (!Object.keys(methods).length) return '-';
  return Object.entries(methods).sort((a, b) => b[1] - a[1])[0][0];
}

const formatIDR = (val: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);

/* ─── Avatar Component ─── */
const CustomerAvatar: React.FC<{ name: string; size?: number }> = ({ name, size = 36 }) => {
  const { bg, text } = getAvatarColor(name);
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: bg,
        color: text,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 800,
        fontSize: size * 0.36,
        flexShrink: 0,
        border: `1.5px solid ${text}22`,
        letterSpacing: '0.02em',
      }}
    >
      {getInitials(name)}
    </div>
  );
};

/* ─── Customer Detail Modal ─── */
const CustomerDetailModal: React.FC<{
  customer: CustomerSummary;
  onClose: () => void;
  formatIDR: (v: number) => string;
}> = ({ customer, onClose, formatIDR }) => {
  const mostPayment = getMostUsedPayment(customer.paymentMethods);
  const { date: lastDate, time: lastTime } = formatDateShort(customer.lastOrderDate);

  return (
    <div
      className="modal-overlay"
      style={{ zIndex: 200 }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="modal-content"
        style={{
          maxWidth: '560px',
          width: '95%',
          padding: '0',
          borderRadius: '20px',
          overflow: 'hidden',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Modal Header accent bar */}
        <div style={{ background: '#3D2B1F', height: '5px', flexShrink: 0 }} />

        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '22px',
            right: '22px',
            width: '32px',
            height: '32px',
            border: '1px solid #E8E4DF',
            borderRadius: '8px',
            background: '#FAF8F5',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#6E6761',
            zIndex: 10,
          }}
          title="Tutup"
        >
          <X size={16} />
        </button>

        {/* Scrollable body */}
        <div style={{ overflowY: 'auto', padding: '28px 28px 24px', display: 'flex', flexDirection: 'column', gap: '22px' }}>

          {/* Customer Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <CustomerAvatar name={customer.name} size={56} />
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#1C1917', margin: 0, lineHeight: 1.2 }}>
                {customer.name}
              </h2>
            </div>
          </div>

          {/* Stats Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
            {[
              { label: 'Total Pesanan', value: `${customer.totalOrders} Pesanan`, icon: <ShoppingBag size={14} color="#3D2B1F" /> },
              { label: 'Total Pembelian', value: formatIDR(customer.totalSpent), icon: <TrendingUp size={14} color="#15803D" />, green: true },
              { label: 'Metode Favorit', value: mostPayment, icon: <CreditCard size={14} color="#4338CA" /> },
            ].map((stat) => (
              <div
                key={stat.label}
                style={{
                  background: '#FAF8F5',
                  border: '1px solid #E8E4DF',
                  borderRadius: '12px',
                  padding: '12px 14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '5px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  {stat.icon}
                  <span style={{ fontSize: '11px', color: '#9C958E', fontWeight: 600 }}>{stat.label}</span>
                </div>
                <div style={{ fontSize: '13px', fontWeight: 800, color: stat.green ? '#15803D' : '#1C1917', wordBreak: 'break-word' }}>
                  {stat.value}
                </div>
              </div>
            ))}
          </div>

          {/* Last visit */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              background: '#FAF8F5',
              border: '1px solid #E8E4DF',
              borderRadius: '12px',
              padding: '12px 16px',
            }}
          >
            <Calendar size={15} color="#6E6761" />
            <span style={{ fontSize: '12.5px', color: '#6E6761', fontWeight: 500 }}>Kunjungan Terakhir:</span>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#1C1917', marginLeft: 'auto' }}>
              {lastDate}&nbsp;&bull;&nbsp;{lastTime}
            </span>
          </div>

          {/* Transaction History */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <FileText size={15} color="#3D2B1F" />
              <span style={{ fontSize: '14px', fontWeight: 700, color: '#1C1917' }}>Riwayat Transaksi</span>
              <span
                className="badge badge-coffee"
                style={{ fontSize: '10.5px', padding: '2px 8px' }}
              >
                {customer.orders.length}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {customer.orders
                .slice()
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .map((order) => {
                  const { date, time } = formatDateShort(order.createdAt);
                  return (
                    <div
                      key={order.id}
                      style={{
                        border: '1px solid #E8E4DF',
                        borderRadius: '10px',
                        padding: '12px 14px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: '10px',
                        flexWrap: 'wrap',
                        background: '#FFFFFF',
                      }}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0 }}>
                        <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#3D2B1F', whiteSpace: 'nowrap' }}>
                          {order.invoiceNumber}
                        </span>
                        <span style={{ fontSize: '11px', color: '#9C958E' }}>
                          {date} &bull; {time}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                        <span
                          className="badge badge-coffee"
                          style={{ fontSize: '10.5px', padding: '2px 8px' }}
                        >
                          {order.paymentMethod}
                        </span>
                        <span style={{ fontSize: '13px', fontWeight: 800, color: '#15803D', whiteSpace: 'nowrap' }}>
                          {formatIDR(order.totalAmount)}
                        </span>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>

        {/* Footer action */}
        <div
          style={{
            padding: '16px 28px',
            borderTop: '1px solid #E8E4DF',
            background: '#FAF8F5',
            flexShrink: 0,
          }}
        >
          <button
            className="btn btn-primary"
            style={{ width: '100%', minHeight: '44px', fontSize: '13px' }}
            onClick={onClose}
          >
            <span>Tutup</span>
          </button>
        </div>
      </div>
    </div>
  );
};

/* ─── Main Component ─── */
export const CustomersView: React.FC<CustomersViewProps> = ({ orders }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('terbaru');
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerSummary | null>(null);

  /* Build customer map from orders */
  const customerMap = useMemo(() => {
    const map = new Map<string, CustomerSummary>();
    orders.forEach((o) => {
      const rawName = o.customerName || 'Pelanggan Umum';
      const existing = map.get(rawName);
      if (existing) {
        existing.totalOrders += 1;
        existing.totalSpent += o.totalAmount;
        existing.orders.push(o);
        existing.paymentMethods[o.paymentMethod] = (existing.paymentMethods[o.paymentMethod] || 0) + 1;
        if (new Date(o.createdAt) > new Date(existing.lastOrderDate)) {
          existing.lastOrderDate = o.createdAt;
        }
      } else {
        map.set(rawName, {
          name: rawName,
          totalOrders: 1,
          totalSpent: o.totalAmount,
          lastOrderDate: o.createdAt,
          orders: [o],
          paymentMethods: { [o.paymentMethod]: 1 },
        });
      }
    });
    return map;
  }, [orders]);

  /* Summary stats */
  const allCustomers = useMemo(() => Array.from(customerMap.values()), [customerMap]);
  const totalCustomers = allCustomers.length;
  const totalOrders = allCustomers.reduce((s, c) => s + c.totalOrders, 0);
  const totalSpent = allCustomers.reduce((s, c) => s + c.totalSpent, 0);
  const activeCustomers = allCustomers.filter((c) => c.totalOrders > 0).length;

  /* Filtered + sorted list */
  const customerList = useMemo(() => {
    let list = allCustomers.filter((c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    switch (sortBy) {
      case 'terbaru':
        list = list.sort((a, b) => new Date(b.lastOrderDate).getTime() - new Date(a.lastOrderDate).getTime());
        break;
      case 'terlama':
        list = list.sort((a, b) => new Date(a.lastOrderDate).getTime() - new Date(b.lastOrderDate).getTime());
        break;
      case 'pembelian_tertinggi':
        list = list.sort((a, b) => b.totalSpent - a.totalSpent);
        break;
      case 'pembelian_terendah':
        list = list.sort((a, b) => a.totalSpent - b.totalSpent);
        break;
      case 'pesanan_terbanyak':
        list = list.sort((a, b) => b.totalOrders - a.totalOrders);
        break;
    }
    return list;
  }, [allCustomers, searchQuery, sortBy]);

  return (
    <>
      {/* Scoped styles */}
      <style>{`
        .customer-row { transition: background 0.15s ease; }
        .customer-row:hover td { background: #FAF8F5; }

        /* Mobile card view */
        .customer-mobile-card {
          display: none;
        }
        .customer-table-wrapper {
          display: block;
        }

        @media (max-width: 768px) {
          .customer-table-wrapper {
            display: none !important;
          }
          .customer-mobile-card {
            display: flex !important;
          }
          .customer-search-filter {
            flex-direction: column !important;
          }
          .customer-search-filter > * {
            width: 100% !important;
            min-width: unset !important;
          }
          .customer-summary-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }

        @media (max-width: 480px) {
          .customer-summary-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

        {/* 1. Header Card */}
        <div
          className="card-panel"
          style={{
            padding: '22px 28px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px',
          }}
        >
          <div>
            <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Users color="#3D2B1F" size={22} />
              <span>Data Pelanggan Toko Coffee</span>
            </h1>
            <p className="page-subtitle" style={{ marginTop: '3px' }}>
              Daftar riwayat kunjungan &amp; total riwayat akumulasi belanja pelanggan.
            </p>
          </div>
        </div>

        {/* 2. Summary Cards */}
        <div
          className="customer-summary-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '16px',
          }}
        >
          {[
            {
              icon: <Users size={18} color="#3D2B1F" />,
              iconBg: '#F4ECE6',
              label: 'Total Pelanggan',
              value: `${totalCustomers} Pelanggan`,
              valueColor: '#1C1917',
            },
            {
              icon: <ShoppingBag size={18} color="#B45309" />,
              iconBg: '#FEF3C7',
              label: 'Total Pesanan',
              value: `${totalOrders} Pesanan`,
              valueColor: '#1C1917',
            },
            {
              icon: <TrendingUp size={18} color="#15803D" />,
              iconBg: '#DCFCE7',
              label: 'Total Pembelian',
              value: formatIDR(totalSpent),
              valueColor: '#15803D',
            },
            {
              icon: <UserCheck size={18} color="#4338CA" />,
              iconBg: '#E0E7FF',
              label: 'Pelanggan Aktif',
              value: `${activeCustomers} Pelanggan`,
              valueColor: '#1C1917',
            },
          ].map((card) => (
            <div
              key={card.label}
              className="kpi-card"
              style={{ padding: '16px 18px', gap: '10px' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  className="kpi-icon-wrapper"
                  style={{ background: card.iconBg, width: '36px', height: '36px', borderRadius: '10px' }}
                >
                  {card.icon}
                </div>
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#9C958E' }}>{card.label}</span>
              </div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: card.valueColor, letterSpacing: '-0.02em' }}>
                {card.value}
              </div>
            </div>
          ))}
        </div>

        {/* 3. Search & Filter */}
        <div
          className="customer-search-filter"
          style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}
        >
          {/* Search */}
          <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
            <Search
              size={16}
              color="#9C958E"
              style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
            />
            <input
              type="text"
              placeholder="Cari nama pelanggan..."
              className="input-control"
              style={{ paddingLeft: '42px', height: '42px', borderRadius: '10px', fontSize: '13px' }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Sort */}
          <div style={{ position: 'relative', width: '200px' }}>
            <select
              className="input-control"
              style={{
                height: '42px',
                borderRadius: '10px',
                fontSize: '13px',
                paddingRight: '38px',
                appearance: 'none',
                WebkitAppearance: 'none',
                MozAppearance: 'none',
                cursor: 'pointer',
                background: '#FFFFFF',
              }}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
            >
              <option value="terbaru">Terbaru</option>
              <option value="terlama">Terlama</option>
              <option value="pembelian_tertinggi">Pembelian Tertinggi</option>
              <option value="pembelian_terendah">Pembelian Terendah</option>
              <option value="pesanan_terbanyak">Pesanan Terbanyak</option>
            </select>
            <ChevronDown
              size={15}
              color="#3D2B1F"
              style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
            />
          </div>
        </div>

        {/* 4. Table – Desktop */}
        <div className="card-panel customer-table-wrapper" style={{ padding: '0', overflow: 'hidden' }}>
          {customerList.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '64px 24px', color: '#9C958E' }}>
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '16px',
                  background: '#F4ECE6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 14px auto',
                }}
              >
                <Users size={26} color="#3D2B1F" style={{ opacity: 0.5 }} />
              </div>
              <p style={{ margin: 0, fontWeight: 700, fontSize: '14.5px', color: '#1C1917' }}>
                Pelanggan tidak ditemukan
              </p>
              <p style={{ margin: '4px 0 0 0', fontSize: '12.5px', color: '#9C958E' }}>
                Coba gunakan nama pelanggan lain.
              </p>
            </div>
          ) : (
            <table
              className="custom-table"
              style={{ width: '100%', tableLayout: 'fixed', borderCollapse: 'separate', borderSpacing: 0 }}
            >
              <thead>
                <tr>
                  <th style={{ width: '6%', padding: '13px 12px 13px 20px' }}>NO</th>
                  <th style={{ width: '28%', padding: '13px 12px' }}>PELANGGAN</th>
                  <th style={{ width: '18%', padding: '13px 12px' }}>TOTAL PESANAN</th>
                  <th style={{ width: '20%', padding: '13px 12px' }}>TOTAL PEMBELIAN</th>
                  <th style={{ width: '18%', padding: '13px 12px' }}>KUNJUNGAN TERAKHIR</th>
                  <th style={{ width: '10%', padding: '13px 20px 13px 12px', textAlign: 'center' }}>AKSI</th>
                </tr>
              </thead>
              <tbody>
                {customerList.map((c, idx) => {
                  const { date, time } = formatDateShort(c.lastOrderDate);
                  return (
                    <tr key={c.name} className="customer-row">
                      {/* No */}
                      <td style={{ padding: '15px 12px 15px 20px', fontWeight: 700, color: '#9C958E', fontSize: '12px' }}>
                        #{idx + 1}
                      </td>

                      {/* Pelanggan */}
                      <td style={{ padding: '15px 12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                          <CustomerAvatar name={c.name} size={34} />
                          <div style={{ minWidth: 0 }}>
                            <div
                              style={{
                                fontWeight: 700,
                                color: '#1C1917',
                                fontSize: '13.5px',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {c.name}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Total Pesanan */}
                      <td style={{ padding: '15px 12px' }}>
                        <span className="badge badge-coffee" style={{ fontSize: '11px', padding: '4px 10px', fontWeight: 700 }}>
                          {c.totalOrders} Pesanan
                        </span>
                      </td>

                      {/* Total Pembelian */}
                      <td style={{ padding: '15px 12px', fontWeight: 800, color: '#15803D', fontSize: '13.5px' }}>
                        {formatIDR(c.totalSpent)}
                      </td>

                      {/* Kunjungan Terakhir */}
                      <td style={{ padding: '15px 12px' }}>
                        <div style={{ fontSize: '12.5px', fontWeight: 600, color: '#1C1917' }}>{date}</div>
                        <div style={{ fontSize: '11px', color: '#9C958E', marginTop: '1px' }}>{time}</div>
                      </td>

                      {/* Aksi */}
                      <td style={{ padding: '15px 20px 15px 12px', textAlign: 'center' }}>
                        <button
                          className="btn btn-secondary"
                          style={{
                            padding: '5px 10px',
                            fontSize: '11.5px',
                            height: '34px',
                            borderRadius: '8px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '5px',
                            whiteSpace: 'nowrap',
                          }}
                          onClick={() => setSelectedCustomer(c)}
                          title="Lihat Detail Pelanggan"
                        >
                          <Eye size={13} style={{ flexShrink: 0 }} />
                          <span>Detail</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* 4b. Mobile Card List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {customerList.length === 0 ? (
            <div
              className="card-panel customer-mobile-card"
              style={{ padding: '48px 24px', textAlign: 'center', flexDirection: 'column', alignItems: 'center', gap: '10px' }}
            >
              <div
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '14px',
                  background: '#F4ECE6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Users size={24} color="#3D2B1F" style={{ opacity: 0.5 }} />
              </div>
              <p style={{ margin: 0, fontWeight: 700, fontSize: '14px', color: '#1C1917' }}>Pelanggan tidak ditemukan</p>
              <p style={{ margin: 0, fontSize: '12.5px', color: '#9C958E' }}>Coba gunakan nama pelanggan lain.</p>
            </div>
          ) : (
            customerList.map((c, idx) => {
              const { date, time } = formatDateShort(c.lastOrderDate);
              return (
                <div
                  key={c.name}
                  className="card-panel customer-mobile-card"
                  style={{
                    padding: '16px',
                    display: 'none', // overridden by media query
                    flexDirection: 'column',
                    gap: '12px',
                  }}
                >
                  {/* Top row */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <CustomerAvatar name={c.name} size={42} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                        <div style={{ fontWeight: 700, fontSize: '14px', color: '#1C1917' }}>{c.name}</div>
                        <span style={{ fontSize: '11px', color: '#9C958E', fontWeight: 500, flexShrink: 0 }}>#{idx + 1}</span>
                      </div>
                    </div>
                  </div>

                  {/* Stats row */}
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: '100px' }}>
                      <div style={{ fontSize: '10.5px', color: '#9C958E', fontWeight: 600, marginBottom: '2px' }}>Total Pesanan</div>
                      <span className="badge badge-coffee" style={{ fontSize: '11px' }}>{c.totalOrders} Pesanan</span>
                    </div>
                    <div style={{ flex: 1, minWidth: '100px' }}>
                      <div style={{ fontSize: '10.5px', color: '#9C958E', fontWeight: 600, marginBottom: '2px' }}>Total Pembelian</div>
                      <div style={{ fontSize: '14px', fontWeight: 800, color: '#15803D' }}>{formatIDR(c.totalSpent)}</div>
                    </div>
                  </div>

                  {/* Bottom row */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px', borderTop: '1px solid #F3EFEA' }}>
                    <div>
                      <div style={{ fontSize: '10.5px', color: '#9C958E', fontWeight: 600 }}>Kunjungan Terakhir</div>
                      <div style={{ fontSize: '12px', fontWeight: 600, color: '#6E6761', marginTop: '1px' }}>
                        {date} &bull; {time}
                      </div>
                    </div>
                    <button
                      className="btn btn-secondary"
                      style={{ padding: '6px 14px', fontSize: '12px', height: '36px', borderRadius: '8px', gap: '5px' }}
                      onClick={() => setSelectedCustomer(c)}
                    >
                      <ExternalLink size={12} />
                      <span>Detail</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 5. Customer Detail Modal */}
      {selectedCustomer && (
        <CustomerDetailModal
          customer={selectedCustomer}
          onClose={() => setSelectedCustomer(null)}
          formatIDR={formatIDR}
        />
      )}
    </>
  );
};
