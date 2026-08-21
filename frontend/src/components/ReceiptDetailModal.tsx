import React from 'react';
import { Coffee, Printer } from 'lucide-react';
import type { Order } from '../types/pos';

interface ReceiptDetailModalProps {
  order: Order;
  onClose: () => void;
}

export const ReceiptDetailModal: React.FC<ReceiptDetailModalProps> = ({ order, onClose }) => {
  const formatIDR = (val: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);

  const totalItemsCount = order.items.reduce((sum, i) => sum + i.quantity, 0);

  const handlePrintModalReceipt = () => {
    // 1. Clean up old elements if present
    const oldContainer = document.getElementById('thermal-print');
    if (oldContainer) oldContainer.remove();

    // 2. Create temporary print container attached directly to document.body (outside #root!)
    const printContainer = document.createElement('div');
    printContainer.id = 'thermal-print';

    printContainer.innerHTML = `
      <div style="width: 100%; box-sizing: border-box; color: #000; font-family: Arial, Helvetica, sans-serif; font-size: 10.5px; line-height: 1.4;">
        <div style="text-align: center; margin-bottom: 6px;">
          <div style="font-weight: 800; font-size: 14px; letter-spacing: 0.04em; color: #000;">BREWLY COFFEE</div>
          <div style="font-size: 9.5px; color: #333333; margin-top: 1px;">Specialty Coffee POS & Roastery</div>
        </div>

        <div style="border-top: 1px dashed #000000; margin: 6px 0;"></div>

        <div style="font-size: 10px; color: #000000;">
          <table style="width: 100%; font-size: 10px; border-collapse: collapse; line-height: 1.4; color: #000;">
            <tr><td style="padding: 1px 0;">No. Faktur:</td><td style="text-align: right; font-weight: 700; padding: 1px 0;">${order.invoiceNumber}</td></tr>
            <tr><td style="padding: 1px 0;">Pelanggan:</td><td style="text-align: right; font-weight: 700; padding: 1px 0;">${order.customerName || 'Pelanggan Umum'}</td></tr>
            <tr><td style="padding: 1px 0;">Waktu Transaksi:</td><td style="text-align: right; padding: 1px 0;">${new Date(order.createdAt).toLocaleString('id-ID')}</td></tr>
            <tr><td style="padding: 1px 0;">Metode Pembayaran:</td><td style="text-align: right; font-weight: 700; padding: 1px 0;">${order.paymentMethod}</td></tr>
          </table>
        </div>

        <div style="border-top: 1px dashed #000000; margin: 6px 0;"></div>

        <div>
          ${order.items
            .map(
              (item) => `
            <div style="font-size: 10px; color: #000; margin-bottom: 5px; page-break-inside: avoid; break-inside: avoid;">
              <div style="font-weight: 700; word-break: break-word; overflow-wrap: break-word; line-height: 1.3;">${item.productName}</div>
              <table style="width: 100%; font-size: 9.5px; border-collapse: collapse; margin-top: 1px; color: #000;">
                <tr>
                  <td style="color: #333; padding: 0;">${item.quantity} x ${formatIDR(item.unitPrice)}</td>
                  <td style="text-align: right; font-weight: 700; color: #000; padding: 0; white-space: nowrap;">${formatIDR(item.subtotal)}</td>
                </tr>
              </table>
            </div>
          `
            )
            .join('')}
        </div>

        <div style="border-top: 1px dashed #000000; margin: 6px 0;"></div>

        <div style="font-size: 10px; color: #000000;">
          <table style="width: 100%; font-size: 10px; border-collapse: collapse; line-height: 1.4; color: #000;">
            <tr><td style="padding: 1px 0;">Subtotal (${totalItemsCount} item):</td><td style="text-align: right; padding: 1px 0;">${formatIDR(order.subtotal)}</td></tr>
            ${
              order.discountAmount > 0
                ? `<tr><td style="padding: 1px 0;">Diskon (${order.discountPercent}%):</td><td style="text-align: right; padding: 1px 0;">-${formatIDR(order.discountAmount)}</td></tr>`
                : ''
            }
            <tr><td style="padding: 1px 0;">PPN (11%):</td><td style="text-align: right; padding: 1px 0;">${formatIDR(order.taxAmount)}</td></tr>
            <tr style="font-weight: 800; font-size: 11.5px; border-top: 1px solid #000;">
              <td style="padding-top: 4px;">TOTAL TAGIHAN:</td>
              <td style="text-align: right; padding-top: 4px;">${formatIDR(order.totalAmount)}</td>
            </tr>
            <tr style="font-size: 9.5px;"><td style="padding-top: 2px;">Jumlah Bayar:</td><td style="text-align: right; padding-top: 2px;">${formatIDR(order.paidAmount)}</td></tr>
            <tr style="font-size: 9.5px;"><td style="padding: 1px 0;">Kembali:</td><td style="text-align: right; padding: 1px 0;">${formatIDR(order.changeAmount)}</td></tr>
          </table>
        </div>

        <div style="border-top: 1px dashed #000000; margin: 6px 0;"></div>

        <div style="text-align: center; font-size: 9.5px; color: #333333; margin-top: 6px; page-break-inside: avoid; break-inside: avoid;">
          Terima kasih atas kunjungan Anda di Brewly Coffee!
        </div>
      </div>
    `;

    document.body.appendChild(printContainer);

    // 3. Trigger Print
    window.print();

    // 4. Cleanup after print completes
    const cleanup = () => {
      const container = document.getElementById('thermal-print');
      if (container) container.remove();
      window.removeEventListener('afterprint', cleanup);
    };
    window.addEventListener('afterprint', cleanup);
    setTimeout(cleanup, 2000);
  };

  return (
    <div
      className="modal-overlay thermal-receipt-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="modal-content print-receipt-modal thermal-receipt-paper"
        style={{
          maxWidth: '390px',
          width: '90%',
          padding: '24px 28px 28px 28px',
          borderRadius: '16px',
        }}
      >
        {/* Top Thermal Printer Machine Head Bar */}
        <div className="no-print" style={{ background: '#3D2B1F', height: '6px', borderRadius: '4px 4px 0 0', margin: '-24px -28px 18px -28px' }} />

        {/* Header: Shop Logo & Name */}
        <div style={{ textAlign: 'center', marginBottom: '16px', borderBottom: '1px dashed #C8C2BA', paddingBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '4px' }}>
            <Coffee size={22} color="#3D2B1F" />
            <h3 style={{ fontSize: '18px', fontWeight: 800, margin: 0, color: '#1C1917', letterSpacing: '0.04em' }}>BREWLY COFFEE</h3>
          </div>
          <p style={{ fontSize: '11px', color: '#6E6761', margin: 0, fontWeight: 500 }}>Specialty Coffee POS &amp; Roastery</p>
        </div>

        {/* Receipt Metadata */}
        <div style={{ fontSize: '12px', color: '#6E6761', marginBottom: '14px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>No. Faktur:</span>
            <span style={{ fontWeight: 700, color: '#3D2B1F' }}>{order.invoiceNumber}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Pelanggan:</span>
            <span style={{ color: '#1C1917', fontWeight: 700 }}>{order.customerName || 'Pelanggan Umum'}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Waktu Transaksi:</span>
            <span>{new Date(order.createdAt).toLocaleString('id-ID')}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Metode Pembayaran:</span>
            <span className="badge badge-coffee" style={{ fontSize: '10.5px', padding: '2px 8px' }}>
              {order.paymentMethod}
            </span>
          </div>
        </div>

        {/* Receipt Products List */}
        <div style={{ borderTop: '1px dashed #C8C2BA', borderBottom: '1px dashed #C8C2BA', padding: '12px 0', marginBottom: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {order.items.map((item) => (
            <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px' }}>
              <div style={{ flex: 1, minWidth: 0, paddingRight: '12px' }}>
                <div style={{ fontWeight: 700, color: '#1C1917', lineHeight: 1.3 }}>{item.productName}</div>
                <div style={{ color: '#6E6761', fontSize: '11.5px', marginTop: '2px' }}>
                  {item.quantity} x {formatIDR(item.unitPrice)}
                </div>
              </div>
              <div style={{ fontWeight: 700, color: '#1C1917', textAlign: 'right', whiteSpace: 'nowrap' }}>
                {formatIDR(item.subtotal)}
              </div>
            </div>
          ))}
        </div>

        {/* Receipt Financial Totals */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '12.5px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#6E6761' }}>
            <span>Subtotal:</span>
            <span>{formatIDR(order.subtotal)}</span>
          </div>
          {order.discountAmount > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#991B1B' }}>
              <span>Diskon ({order.discountPercent}%):</span>
              <span>-{formatIDR(order.discountAmount)}</span>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#6E6761' }}>
            <span>PPN (11%):</span>
            <span>{formatIDR(order.taxAmount)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '15.5px', color: '#1C1917', borderTop: '1px solid #E8E4DF', paddingTop: '8px', marginTop: '4px' }}>
            <span>TOTAL TAGIHAN:</span>
            <span>{formatIDR(order.totalAmount)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#6E6761', marginTop: '4px' }}>
            <span>Jumlah Bayar:</span>
            <span>{formatIDR(order.paidAmount)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#6E6761' }}>
            <span>Kembali:</span>
            <span>{formatIDR(order.changeAmount)}</span>
          </div>
        </div>

        {/* Thermal Receipt Footer Note */}
        <div style={{ textAlign: 'center', fontSize: '11px', color: '#9C958E', marginBottom: '20px', borderTop: '1px dashed #C8C2BA', paddingTop: '10px' }}>
          Terima kasih atas kunjungan Anda di Brewly Coffee!
        </div>

        {/* Action Buttons */}
        <div className="no-print" style={{ display: 'flex', gap: '10px' }}>
          <button
            type="button"
            className="btn btn-secondary"
            style={{ flex: 1, minHeight: '44px', fontSize: '13px', fontWeight: 700 }}
            onClick={handlePrintModalReceipt}
          >
            <Printer size={15} />
            <span>Cetak Struk</span>
          </button>
          <button
            type="button"
            className="btn btn-primary"
            style={{ flex: 1, minHeight: '44px', fontSize: '13px', fontWeight: 700 }}
            onClick={onClose}
          >
            <span>Tutup</span>
          </button>
        </div>
      </div>
    </div>
  );
};
