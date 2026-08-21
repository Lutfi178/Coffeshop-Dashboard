import React, { useState } from 'react';
import { Layers, Plus, Trash2, Edit2, Coffee, Utensils, IceCream, CupSoda, X, Check, AlertTriangle, ChevronDown } from 'lucide-react';
import type { Category, Product } from '../types/pos';

interface CategoryManagerProps {
  categories: Category[];
  products: Product[];
  addCategory: (name: string, description?: string, icon?: string) => void;
  updateCategory: (category: Category) => void;
  deleteCategory: (id: string) => void;
}

export const CategoryManager: React.FC<CategoryManagerProps> = ({
  categories,
  products,
  addCategory,
  updateCategory,
  deleteCategory,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Form fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('Coffee');
  const [errorMsg, setErrorMsg] = useState('');

  // Delete safety state
  const [deleteBlockedCat, setDeleteBlockedCat] = useState<{ name: string; count: number } | null>(null);

  const getIconComponent = (iconName?: string) => {
    switch (iconName) {
      case 'Coffee':
        return <Coffee size={20} color="#3D2B1F" />;
      case 'Utensils':
        return <Utensils size={20} color="#15803D" />;
      case 'CupSoda':
        return <CupSoda size={20} color="#0284C7" />;
      case 'IceCream':
        return <IceCream size={20} color="#B45309" />;
      default:
        return <Coffee size={20} color="#3D2B1F" />;
    }
  };

  const openAddModal = () => {
    setEditingCategory(null);
    setName('');
    setDescription('');
    setIcon('Coffee');
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const openEditModal = (category: Category) => {
    setEditingCategory(category);
    setName(category.name);
    setDescription(category.description || '');
    setIcon(category.icon || 'Coffee');
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleDeleteClick = (cat: Category) => {
    const assignedProductsCount = products.filter((p) => p.categoryId === cat.id).length;
    if (assignedProductsCount > 0) {
      setDeleteBlockedCat({ name: cat.name, count: assignedProductsCount });
      return;
    }
    deleteCategory(cat.id);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const trimmedName = name.trim();
    if (!trimmedName) return;

    // Check duplicate category name (case-insensitive)
    const isDuplicate = categories.some(
      (c) => c.name.toLowerCase() === trimmedName.toLowerCase() && c.id !== editingCategory?.id
    );

    if (isDuplicate) {
      setErrorMsg('Kategori sudah tersedia.');
      return;
    }

    if (editingCategory) {
      updateCategory({
        ...editingCategory,
        name: trimmedName,
        description: description.trim(),
        icon,
      });
    } else {
      addCategory(trimmedName, description.trim(), icon);
    }

    setIsModalOpen(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* 1. Top Header Card */}
      <div className="card-panel" style={{ padding: '24px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Layers color="#3D2B1F" size={24} />
            <span>Kelola Kategori Produk</span>
          </h1>
          <p className="page-subtitle">Organisasikan pengelompokan menu kopi, makanan, non-kopi, dan dessert Brewly Coffee.</p>
        </div>

        <button className="btn btn-primary" onClick={openAddModal}>
          <Plus size={16} />
          <span>Tambah Kategori Baru</span>
        </button>
      </div>

      {/* 2. Delete Safety Warning Banner */}
      {deleteBlockedCat && (
        <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: '12px', padding: '16px 20px', display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
          <AlertTriangle size={22} color="#DC2626" style={{ marginTop: '2px', flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <h4 style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: 800, color: '#991B1B' }}>
              Kategori tidak dapat dihapus karena masih memiliki produk.
            </h4>
            <p style={{ margin: 0, fontSize: '13px', color: '#7F1D1D' }}>
              Kategori <strong>"{deleteBlockedCat.name}"</strong> masih memiliki <strong>{deleteBlockedCat.count} produk</strong> terdaftar. Silakan pindahkan produk ke kategori lain terlebih dahulu.
            </p>
          </div>
          <button
            onClick={() => setDeleteBlockedCat(null)}
            style={{ background: '#FFFFFF', border: '1px solid #FECDD3', borderRadius: '8px', padding: '4px 10px', fontSize: '12px', fontWeight: 700, color: '#991B1B', cursor: 'pointer' }}
          >
            Tutup
          </button>
        </div>
      )}

      {/* 3. Category Cards Grid */}
      {categories.length === 0 ? (
        <div className="card-panel" style={{ padding: '48px 24px', textAlign: 'center', color: '#9C958E' }}>
          <Layers size={36} style={{ margin: '0 auto 12px auto', opacity: 0.4 }} />
          <p style={{ fontSize: '14px', fontWeight: 700, margin: '0 0 4px 0', color: '#1C1917' }}>Belum ada kategori terdaftar</p>
          <p style={{ fontSize: '12.5px', margin: 0 }}>Klik "+ Tambah Kategori Baru" untuk mulai mengelompokkan menu Anda.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '20px' }}>
          {categories.map((cat) => {
            const count = products.filter((p) => p.categoryId === cat.id).length;

            return (
              <div key={cat.id} className="card-panel-interactive" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '18px' }}>
                {/* Card Header: Icon Top-Left, Edit/Delete Top-Right */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#FAF8F5', border: '1px solid #E8E4DF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {getIconComponent(cat.icon)}
                  </div>

                  {/* Consistent 42x42px Action Buttons */}
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <button
                      type="button"
                      className="btn-icon"
                      onClick={() => openEditModal(cat)}
                      title="Edit Kategori"
                      style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '11px',
                        background: '#FFFFFF',
                        border: '1px solid #E8E4DF',
                        color: '#3D2B1F',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        flexShrink: 0,
                      }}
                    >
                      <Edit2 size={20} />
                    </button>
                    <button
                      type="button"
                      className="btn-icon"
                      onClick={() => handleDeleteClick(cat)}
                      title="Hapus Kategori"
                      style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '11px',
                        background: '#FFF5F5',
                        border: '1px solid #FECDD3',
                        color: '#991B1B',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        flexShrink: 0,
                      }}
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>

                {/* Card Content: Title & Description */}
                <div>
                  <h3 style={{ fontSize: '16.5px', fontWeight: 800, margin: '0 0 4px 0', color: '#1C1917' }}>{cat.name}</h3>
                  <p style={{ fontSize: '12.5px', color: '#6E6761', margin: 0, lineHeight: 1.35 }}>{cat.description || 'Tidak ada deskripsi'}</p>
                </div>

                {/* Card Footer: Product Count */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #E8E4DF', paddingTop: '14px' }}>
                  <span style={{ fontSize: '12px', color: '#6E6761', fontWeight: 600 }}>Total Varian Menu</span>
                  <span className="badge badge-coffee" style={{ fontWeight: 700, fontSize: '11.5px', padding: '4px 10px' }}>{count} Produk</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 4. Add / Edit Category Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '480px', padding: '24px 28px 28px 28px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #E8E4DF', paddingBottom: '14px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 800, margin: 0, color: '#1C1917' }}>
                {editingCategory ? 'Edit Kategori Produk' : 'Tambah Kategori Baru'}
              </h3>
              <button style={{ background: '#FAF8F5', border: '1px solid #E8E4DF', borderRadius: '8px', color: '#6E6761', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setIsModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            {errorMsg && (
              <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', color: '#991B1B', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, marginBottom: '16px' }}>
                ⚠️ {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label className="form-label" style={{ marginBottom: '6px', display: 'block' }}>Nama Kategori *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Minuman & Kopi"
                  className="input-control"
                  style={{ height: '42px', borderRadius: '10px', fontSize: '13px' }}
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setErrorMsg('');
                  }}
                />
              </div>

              <div>
                <label className="form-label" style={{ marginBottom: '6px', display: 'block' }}>Deskripsi Singkat</label>
                <input
                  type="text"
                  placeholder="Keterangan pengelompokan..."
                  className="input-control"
                  style={{ height: '42px', borderRadius: '10px', fontSize: '13px' }}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div>
                <label className="form-label" style={{ marginBottom: '6px', display: 'block' }}>Ikon Visual</label>
                <div style={{ position: 'relative' }}>
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
                    value={icon}
                    onChange={(e) => setIcon(e.target.value)}
                  >
                    <option value="Coffee">☕ Coffee (Minuman & Kopi)</option>
                    <option value="Utensils">🥐 Utensils (Makanan Utama & Toast)</option>
                    <option value="CupSoda">🥤 Cup / Soda (Non-Kopi & Teh)</option>
                    <option value="IceCream">🍰 Ice Cream (Snack & Dessert)</option>
                  </select>
                  <ChevronDown size={16} color="#3D2B1F" style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '8px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsModalOpen(false)}
                  style={{ flex: 1, minHeight: '44px', fontSize: '13.5px', fontWeight: 700 }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ flex: 2, minHeight: '44px', fontSize: '13.5px', fontWeight: 700 }}
                >
                  <Check size={18} />
                  <span>{editingCategory ? 'Simpan Perubahan' : 'Simpan Kategori'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
