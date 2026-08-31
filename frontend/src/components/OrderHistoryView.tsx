import React, { useState, useMemo } from 'react';
import { FileText, Search, Eye } from 'lucide-react';
import type { Order } from '../types/pos';
import { ReceiptDetailModal } from './ReceiptDetailModal';

interface OrderHistoryViewProps {
  orders: Order[];
}

export const OrderHistoryView: React.FC<OrderHistoryViewProps> = ({ orders }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [paymentFilter, setPaymentFilter] = useState<string>('ALL');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const formatIDR = (val: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);

  // Filter and sort orders (newest first / descending by createdAt)
  const filteredOrders = useMemo(() => {
    return orders
      .filter((o) => {
        const matchesSearch =
          o.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
          o.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          o.paymentMethod.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesPayment = paymentFilter === 'ALL' || o.paymentMethod === paymentFilter;

        return matchesSearch && matchesPayment;
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [orders, searchQuery, paymentFilter]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%', maxWidth: '100%' }}>
      {/* CSS for Table Row Hover */}
      <style>{`
        .order-history-row {
          transition: background 0.15s ease;
        }
        .order-history-row:hover td {
          background: #FAF8F5;
        }
      `}</style>

      {/* 1. Top Hero Card */}
      <div className="card-panel" style={{ padding: '22px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FileText color="#3D2B1F" size={22} />
            <span>Riwayat Transaksi Penjualan</span>
          </h1>
          <p className="page-subtitle" style={{ marginTop: '3px' }}>
            Daftar lengkap faktur nota transaksi kedai kopi dan audit pembayaran.
          </p>
        </div>

        <span className="badge badge-coffee" style={{ fontSize: '12px', padding: '6px 14px', fontWeight: 700 }}>
          Total {filteredOrders.length} Faktur
        </span>
      </div>

      {/* 2. Unified Search & Filter Control Bar */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
        {/* Search Input */}
        <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
          <Search size={16} color="#9C958E" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          <input
            type="text"
            placeholder="Cari No. Faktur atau Nama Pelanggan..."
            className="input-control"
            style={{ paddingLeft: '40px', height: '42px', borderRadius: '10px', fontSize: '13px' }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Payment Method Select Dropdown */}
        <div style={{ position: 'relative', width: '170px' }}>
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
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
          >
            <option value="ALL">Semua Metode</option>
            <option value="CASH">CASH</option>
            <option value="QRIS">QRIS</option>
            <option value="DEBIT">DEBIT</option>
            <option value="CREDIT">CREDIT</option>
          </select>
        </div>
      </div>

      {/* 3. Transaction Table Card — Fits 100% within container viewport */}
      <div className="card-panel" style={{ width: '100%', maxWidth: '100%', padding: '0', overflow: 'hidden' }}>
        {filteredOrders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '56px 24px', color: '#9C958E' }}>
            <FileText size={38} style={{ margin: '0 auto 10px auto', opacity: 0.35, color: '#3D2B1F' }} />
            <p style={{ margin: 0, fontWeight: 700, fontSize: '14.5px', color: '#1C1917' }}>Tidak ada transaksi yang cocok dengan filter.</p>
            <p style={{ margin: '4px 0 0 0', fontSize: '12.5px' }}>Coba ubah kata kunci pencarian atau reset filter metode pembayaran.</p>
          </div>
        ) : (
          <table className="custom-table" style={{ width: '100%', tableLayout: 'fixed', borderCollapse: 'separate', borderSpacing: 0 }}>
            <thead>
              <tr>
                <th style={{ width: '14%', padding: '13px 8px 13px 16px' }}>NO. FAKTUR</th>
                <th style={{ width: '15%', padding: '13px 8px' }}>TANGGAL &amp; WAKTU</th>
                <th style={{ width: '20%', padding: '13px 8px' }}>PELANGGAN</th>
                <th style={{ width: '10%', padding: '13px 6px' }}>METODE BAYAR</th>
                <th style={{ width: '8%', padding: '13px 6px' }}>JUMLAH ITEM</th>
                <th style={{ width: '11%', padding: '13px 6px' }}>TOTAL TAGIHAN</th>
                <th style={{ width: '9%', padding: '13px 10px 13px 6px' }}>STATUS</th>
                <th style={{ width: '13%', padding: '13px 16px 13px 10px', textAlign: 'center' }}>AKSI</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => {
                const totalItemsCount = order.items.reduce((sum, i) => sum + i.quantity, 0);
                const displayCustomerName = order.customerName || 'Pelanggan Umum';

                return (
                  <tr
                    key={order.id}
                    className="order-history-row"
                    style={{ verticalAlign: 'middle' }}
                  >
                    {/* Invoice Number */}
                    <td style={{ padding: '14px 8px 14px 16px', fontWeight: 700, color: '#3D2B1F', fontSize: '12.5px', whiteSpace: 'nowrap' }}>
                      {order.invoiceNumber}
                    </td>

                    {/* Date & Time */}
                    <td style={{ padding: '14px 8px', fontSize: '12px', color: '#6E6761', whiteSpace: 'nowrap' }}>
                      {new Date(order.createdAt).toLocaleString('id-ID', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>

                    {/* Customer Name */}
                    <td
                      style={{
                        padding: '14px 8px',
                        fontWeight: 700,
                        color: '#1C1917',
                        fontSize: '12.5px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                      title={displayCustomerName}
                    >
                      {displayCustomerName}
                    </td>

                    {/* Payment Method Badge */}
                    <td style={{ padding: '14px 6px', whiteSpace: 'nowrap' }}>
                      <span className="badge badge-coffee" style={{ fontWeight: 700, fontSize: '10.5px', padding: '3px 8px' }}>
                        {order.paymentMethod}
                      </span>
                    </td>

                    {/* Item Count */}
                    <td style={{ padding: '14px 6px', fontSize: '12px', color: '#6E6761', fontWeight: 600, whiteSpace: 'nowrap' }}>
                      {totalItemsCount} Item
                    </td>

                    {/* Total Amount */}
                    <td style={{ padding: '14px 6px', fontWeight: 800, color: '#1C1917', fontSize: '13px', whiteSpace: 'nowrap' }}>
                      {formatIDR(order.totalAmount)}
                    </td>

                    {/* Status Badge */}
                    <td style={{ padding: '14px 10px 14px 6px', whiteSpace: 'nowrap' }}>
                      <span
                        className={
                          order.status === 'COMPLETED'
                            ? 'badge badge-emerald'
                            : order.status === 'PENDING'
                            ? 'badge badge-amber'
                            : 'badge badge-rose'
                        }
                        style={{ whiteSpace: 'nowrap', fontSize: '10.5px', padding: '3px 8px' }}
                      >
                        {order.status}
                      </span>
                    </td>

                    {/* Action Button: Detail Struk */}
                    <td style={{ padding: '14px 16px 14px 10px', textAlign: 'center' }}>
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
                        onClick={() => setSelectedOrder(order)}
                        title="Lihat Detail Struk"
                      >
                        <Eye size={13} style={{ flexShrink: 0 }} />
                        <span>Detail Struk</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* 4. Unified Shared Thermal Receipt Modal */}
      {selectedOrder && (
        <ReceiptDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </div>
  );
};
