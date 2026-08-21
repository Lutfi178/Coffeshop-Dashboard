import React, { useState } from 'react';
import { Settings, Store, ShieldCheck, UserCheck, CheckCircle2, Save } from 'lucide-react';
import type { User } from '../types/pos';

interface SettingsViewProps {
  currentUser?: User | null;
}

export const SettingsView: React.FC<SettingsViewProps> = () => {
  const [shopName, setShopName] = useState('Brewly Coffee');
  const [tagline, setTagline] = useState('Freshly Brewed Every Day');
  const [address, setAddress] = useState('Jl. Coffee Promenade No. 88, Jakarta');
  const [phone, setPhone] = useState('0812-3456-7890');
  const [taxPercent, setTaxPercent] = useState(11);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    const timer = setTimeout(() => setSavedSuccess(false), 3000);
    return () => clearTimeout(timer);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '960px', width: '100%' }}>
      {/* Toast Notification Keyframes */}
      <style>{`
        @keyframes toastSlideIn {
          from {
            opacity: 0;
            transform: translateY(-16px) scale(0.96);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .settings-toast {
          animation: toastSlideIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .address-field {
          grid-column: span 2;
        }
        @media (max-width: 640px) {
          .settings-grid {
            grid-template-columns: 1fr !important;
          }
          .address-field {
            grid-column: span 1 !important;
          }
          .settings-role-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

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
            <Settings color="#3D2B1F" size={22} />
            <span>Pengaturan Profil Toko &amp; Sistem</span>
          </h1>
          <p className="page-subtitle" style={{ marginTop: '3px' }}>
            Atur identitas kedai kopi, tarif PPN, dan kredensial akses peran user.
          </p>
        </div>
      </div>

      {/* Toast Alert Banner */}
      {savedSuccess && (
        <div
          className="settings-toast"
          style={{
            padding: '14px 20px',
            borderRadius: '12px',
            background: '#DCFCE7',
            border: '1px solid #86EFAC',
            color: '#15803D',
            fontWeight: 700,
            fontSize: '13.5px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            boxShadow: '0 4px 14px rgba(21, 128, 61, 0.12)',
          }}
        >
          <CheckCircle2 size={18} color="#15803D" />
          <span>Pengaturan berhasil disimpan</span>
        </div>
      )}

      {/* Settings Form */}
      <form onSubmit={handleSaveSettings} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* 2. Store Profile Section */}
        <div className="card-panel" style={{ padding: '24px 28px' }}>
          <h3 className="section-title" style={{ marginBottom: '20px' }}>
            <Store color="#3D2B1F" size={20} />
            <span>Profil Kedai Kopi</span>
          </h3>

          <div
            className="settings-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '20px',
            }}
          >
            {/* Row 1: Nama Kedai Kopi */}
            <div>
              <label className="form-label" style={{ marginBottom: '6px', display: 'block' }}>
                Nama Kedai Kopi *
              </label>
              <input
                type="text"
                required
                className="input-control"
                style={{ fontWeight: 700, color: '#3D2B1F' }}
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
              />
            </div>

            {/* Row 1: Tagline Toko */}
            <div>
              <label className="form-label" style={{ marginBottom: '6px', display: 'block' }}>
                Tagline Toko
              </label>
              <input
                type="text"
                className="input-control"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
              />
            </div>

            {/* Row 2: Alamat Kedai (Full-width 2-column span for natural balance) */}
            <div className="address-field">
              <label className="form-label" style={{ marginBottom: '6px', display: 'block' }}>
                Alamat Kedai
              </label>
              <input
                type="text"
                className="input-control"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>

            {/* Row 3: No. WhatsApp / Telepon */}
            <div>
              <label className="form-label" style={{ marginBottom: '6px', display: 'block' }}>
                No. WhatsApp / Telepon
              </label>
              <input
                type="text"
                className="input-control"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            {/* Row 3: Tarif Pajak PPN (%) */}
            <div>
              <label className="form-label" style={{ marginBottom: '6px', display: 'block' }}>
                Tarif Pajak PPN (%)
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="number"
                  min="0"
                  max="100"
                  className="input-control"
                  style={{ fontWeight: 700, paddingRight: '40px' }}
                  value={taxPercent}
                  onChange={(e) => setTaxPercent(Number(e.target.value))}
                />
                <span
                  style={{
                    position: 'absolute',
                    right: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    fontSize: '13.5px',
                    fontWeight: 700,
                    color: '#6E6761',
                    pointerEvents: 'none',
                    userSelect: 'none',
                  }}
                >
                  %
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. User Role Access Section */}
        <div className="card-panel" style={{ padding: '24px 28px' }}>
          <h3 className="section-title" style={{ marginBottom: '20px' }}>
            <ShieldCheck color="#3D2B1F" size={20} />
            <span>Hak Akses Peran / User Role</span>
          </h3>

          <div
            className="settings-role-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '16px',
            }}
          >
            {/* Admin Role Card */}
            <div
              style={{
                padding: '20px',
                borderRadius: '14px',
                background: '#FAF8F5',
                border: '1px solid #E8E4DF',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '12px',
                minHeight: '120px',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14.5px', fontWeight: 700, color: '#3D2B1F', marginBottom: '4px' }}>
                  <ShieldCheck size={18} color="#3D2B1F" />
                  <span>Admin Manager</span>
                </div>
                <div style={{ fontSize: '12.5px', color: '#6E6761' }}>admin@brewlycoffee.com</div>
              </div>
              <div>
                <span className="badge badge-coffee" style={{ fontSize: '11px', padding: '4px 10px', fontWeight: 700 }}>
                  Akses Penuh POS &amp; Laporan
                </span>
              </div>
            </div>

            {/* Cashier Role Card */}
            <div
              style={{
                padding: '20px',
                borderRadius: '14px',
                background: '#FAF8F5',
                border: '1px solid #E8E4DF',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '12px',
                minHeight: '120px',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14.5px', fontWeight: 700, color: '#15803D', marginBottom: '4px' }}>
                  <UserCheck size={18} color="#15803D" />
                  <span>Kasir On-Duty</span>
                </div>
                <div style={{ fontSize: '12.5px', color: '#6E6761' }}>kasir@brewlycoffee.com</div>
              </div>
              <div>
                <span className="badge badge-emerald" style={{ fontSize: '11px', padding: '4px 10px', fontWeight: 700 }}>
                  Akses Transaksi Kasir
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 4. Save Button */}
        <div>
          <button
            type="submit"
            className="btn btn-primary"
            style={{
              padding: '12px 26px',
              minHeight: '44px',
              fontSize: '13.5px',
              borderRadius: '10px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <Save size={18} />
            <span>Simpan Perubahan Pengaturan</span>
          </button>
        </div>
      </form>
    </div>
  );
};
