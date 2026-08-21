import React, { useState, useRef } from 'react';
import { Plus, Search, Edit2, Trash2, Package, X, Check, Image as ImageIcon, Tag, DollarSign, ChevronDown, Upload, RefreshCw } from 'lucide-react';
import type { Product, Category } from '../types/pos';

interface ProductManagerProps {
  products: Product[];
  categories: Category[];
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
  addCategory?: (name: string, description?: string, icon?: string) => void;
}

export const ProductManager: React.FC<ProductManagerProps> = ({
  products,
  categories,
  addProduct,
  updateProduct,
  deleteProduct,
  addCategory,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form fields state
  const [sku, setSku] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<number | ''>('');
  const [costPrice, setCostPrice] = useState<number | ''>('');
  const [stock, setStock] = useState<number | ''>('');
  const [minStock, setMinStock] = useState<number | ''>(5);
  const [categoryId, setCategoryId] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [image, setImage] = useState('');
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState('');
  const [imageErrorMap, setImageErrorMap] = useState<Record<string, boolean>>({});

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const formatIDR = (val: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);

  const openAddModal = () => {
    setEditingProduct(null);
    setSku(`PRD-${Math.floor(100 + Math.random() * 900)}`);
    setName('');
    setDescription('');
    setPrice('');
    setCostPrice('');
    setStock('');
    setMinStock(5);
    setCategoryId(categories[0]?.id || 'new_cat');
    setNewCategoryName('');
    setImage('');
    setFileName('');
    setFileSize('');
    setIsModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setSku(product.sku);
    setName(product.name);
    setDescription(product.description || '');
    setPrice(product.price);
    setCostPrice(product.costPrice);
    setStock(product.stock);
    setMinStock(product.minStock);
    setCategoryId(product.categoryId);
    setNewCategoryName('');
    setImage(product.image || '');
    setFileName(product.image ? product.image.split('/').pop() || 'Foto Produk' : '');
    setFileSize('Standard Asset');
    setIsModalOpen(true);
  };

  const handleImageError = (productId: string) => {
    setImageErrorMap((prev) => ({ ...prev, [productId]: true }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const sizeInKB = Math.round(file.size / 1024);
    setFileSize(sizeInKB > 1024 ? `${(sizeInKB / 1024).toFixed(1)} MB` : `${sizeInKB} KB`);

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setImage(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImage('');
    setFileName('');
    setFileSize('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !sku.trim() || price === '' || stock === '') return;

    let finalCategoryId = categoryId;

    if ((!categoryId || categoryId === 'new_cat') && addCategory) {
      const catTitle = newCategoryName.trim() || 'Minuman & Kopi';
      addCategory(catTitle, 'Kategori utama Brewly Coffee', 'Coffee');
      finalCategoryId = `cat-${Date.now()}`;
    }

    if (editingProduct) {
      updateProduct({
        ...editingProduct,
        sku,
        name,
        description,
        price: Number(price),
        costPrice: Number(costPrice) || 0,
        stock: Number(stock),
        minStock: Number(minStock) || 5,
        categoryId: finalCategoryId,
        image,
      });
    } else {
      addProduct({
        sku,
        name,
        description,
        price: Number(price),
        costPrice: Number(costPrice) || 0,
        stock: Number(stock),
        minStock: Number(minStock) || 5,
        categoryId: finalCategoryId,
        image,
      });
    }

    setIsModalOpen(false);
  };

  const filteredProducts = products.filter((p) => {
    const matchesCategory = selectedCategoryId === 'all' || p.categoryId === selectedCategoryId;
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* 1. Top Header Card */}
      <div className="card-panel" style={{ padding: '24px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Package color="#3D2B1F" size={24} />
            <span>Katalog Produk & Inventaris</span>
          </h1>
          <p className="page-subtitle">Kelola varian menu, kategori, harga, dan persediaan produk Brewly Coffee.</p>
        </div>

        <button className="btn btn-primary" onClick={openAddModal}>
          <Plus size={16} />
          <span>Tambah Produk Baru</span>
        </button>
      </div>

      {/* 2. Filter & Search Toolbar */}
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '260px' }}>
          <Search size={18} color="#9C958E" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          <input
            type="text"
            placeholder="Cari berdasarkan nama produk atau SKU..."
            className="input-control"
            style={{ paddingLeft: '42px', height: '42px', borderRadius: '10px', fontSize: '13px' }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div style={{ position: 'relative', width: '220px' }}>
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
            value={selectedCategoryId}
            onChange={(e) => setSelectedCategoryId(e.target.value)}
          >
            <option value="all">Semua Kategori</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <ChevronDown size={16} color="#3D2B1F" style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
        </div>
      </div>

      {/* 3. Products Table Card */}
      <div className="card-panel" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '18px 24px', borderBottom: '1px solid #E8E4DF', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 800, margin: 0, color: '#1C1917' }}>Kelola Produk</h2>
            <p style={{ fontSize: '12.5px', color: '#6E6761', margin: '2px 0 0 0' }}>
              Daftar lengkap varian menu, harga, kategori, dan persediaan produk Brewly Coffee.
            </p>
          </div>
          <span className="badge badge-coffee" style={{ fontSize: '11.5px', padding: '4px 10px' }}>
            Total {filteredProducts.length} Produk
          </span>
        </div>

        <table className="custom-table" style={{ width: '100%', tableLayout: 'fixed', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ width: '33%', padding: '14px 20px' }}>Detail Produk</th>
              <th style={{ width: '9%', padding: '14px 16px' }}>SKU</th>
              <th style={{ width: '16%', padding: '14px 16px' }}>Kategori</th>
              <th style={{ width: '10%', padding: '14px 16px' }}>Harga Jual</th>
              <th style={{ width: '10%', padding: '14px 16px' }}>Harga Modal</th>
              <th style={{ width: '12%', padding: '14px 16px' }}>Status Stok</th>
              <th style={{ width: '10%', padding: '14px 20px', textAlign: 'right' }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '48px 24px', color: '#9C958E' }}>
                  <Package size={36} style={{ margin: '0 auto 12px auto', opacity: 0.4 }} />
                  <p style={{ fontSize: '14px', fontWeight: 700, margin: '0 0 4px 0', color: '#1C1917' }}>Belum ada produk terdaftar</p>
                  <p style={{ fontSize: '12.5px', margin: 0 }}>Klik tombol "+ Tambah Produk Baru" untuk memasukkan varian produk Anda.</p>
                </td>
              </tr>
            ) : (
              filteredProducts.map((p) => {
                const hasImageError = imageErrorMap[p.id] || !p.image;

                return (
                  <tr key={p.id}>
                    <td style={{ padding: '18px 20px', verticalAlign: 'middle' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div
                          style={{
                            width: '64px',
                            height: '64px',
                            aspectRatio: '1 / 1',
                            borderRadius: '12px',
                            overflow: 'hidden',
                            flexShrink: 0,
                            background: '#FAF8F5',
                            border: '1px solid #E8E4DF',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          {hasImageError ? (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#9C958E', textAlign: 'center', padding: '4px' }}>
                              <ImageIcon size={18} color="#C89D7C" />
                              <span style={{ fontSize: '8.5px', fontWeight: 600, marginTop: '2px', lineHeight: 1.1, color: '#6E6761' }}>
                                Foto tidak tersedia
                              </span>
                            </div>
                          ) : (
                            <img
                              src={p.image}
                              alt={p.name}
                              onError={() => handleImageError(p.id)}
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                objectPosition: 'center',
                                display: 'block',
                              }}
                            />
                          )}
                        </div>

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div
                            style={{
                              fontWeight: 700,
                              color: '#1C1917',
                              fontSize: '14px',
                              lineHeight: 1.35,
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                            }}
                          >
                            {p.name}
                          </div>
                          <div
                            style={{
                              fontSize: '12px',
                              color: '#6E6761',
                              marginTop: '3px',
                              lineHeight: 1.35,
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                            }}
                          >
                            {p.description || 'Tanpa deskripsi'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '18px 16px', fontWeight: 700, color: '#3D2B1F', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>{p.sku}</td>
                    <td style={{ padding: '18px 16px', verticalAlign: 'middle' }}>
                      <span className="badge badge-coffee" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%', display: 'inline-block' }}>{p.categoryName || 'Umum'}</span>
                    </td>
                    <td style={{ padding: '18px 16px', fontWeight: 800, color: '#1C1917', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>{formatIDR(p.price)}</td>
                    <td style={{ padding: '18px 16px', color: '#6E6761', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>{formatIDR(p.costPrice)}</td>
                    <td style={{ padding: '18px 16px', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                      <span className={p.stock <= 0 ? 'badge badge-rose' : p.stock <= p.minStock ? 'badge badge-amber' : 'badge badge-emerald'}>
                        {p.stock <= 0 ? 'Habis (0)' : p.stock <= p.minStock ? `Menipis (${p.stock})` : `Tersedia (${p.stock})`}
                      </span>
                    </td>
                    {/* Refactored 42px x 42px Action Buttons */}
                    <td style={{ padding: '18px 20px', textAlign: 'right', verticalAlign: 'middle' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', alignItems: 'center' }}>
                        <button
                          type="button"
                          onClick={() => openEditModal(p)}
                          title="Edit Produk"
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
                            boxShadow: '0 1px 4px rgba(0,0,0,0.02)',
                          }}
                        >
                          <Edit2 size={20} />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteProduct(p.id)}
                          title="Hapus Produk"
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
                          }}
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* 4. Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '640px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', borderBottom: '1px solid #E8E4DF', paddingBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#1C1917', margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Package color="#3D2B1F" size={22} />
                  <span>{editingProduct ? 'Edit Data Produk' : 'Tambah Produk Baru'}</span>
                </h3>
                <p style={{ fontSize: '13px', color: '#6E6761', margin: 0 }}>Lengkapi rincian informasi di bawah untuk katalog Brewly Coffee.</p>
              </div>
              <button
                type="button"
                style={{ background: '#FAF8F5', border: '1px solid #E8E4DF', color: '#6E6761', width: '32px', height: '32px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                onClick={() => setIsModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* SECTION 1: Informasi Utama */}
              <div style={{ background: '#FAF8F5', padding: '16px', borderRadius: '12px', border: '1px solid #E8E4DF' }}>
                <h4 style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#3D2B1F', fontWeight: 700, margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Tag size={14} /> 1. Informasi Utama Produk
                </h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <label className="form-label" style={{ marginBottom: '6px', display: 'block' }}>Nama Produk *</label>
                    <input
                      type="text"
                      className="input-control"
                      required
                      placeholder="Contoh: Es Kopi Susu Gula Aren Signature"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label className="form-label" style={{ marginBottom: '6px', display: 'block' }}>Kode SKU *</label>
                      <input
                        type="text"
                        className="input-control"
                        required
                        placeholder="PRD-001"
                        value={sku}
                        onChange={(e) => setSku(e.target.value)}
                        style={{ fontWeight: 700, color: '#3D2B1F' }}
                      />
                      <span style={{ fontSize: '11px', color: '#6E6761', marginTop: '4px', display: 'block' }}>
                        SKU dibuat otomatis oleh sistem
                      </span>
                    </div>

                    <div>
                      <label className="form-label" style={{ marginBottom: '6px', display: 'block' }}>Kategori Produk *</label>
                      {categories.length > 0 ? (
                        <select
                          className="input-control"
                          value={categoryId}
                          onChange={(e) => setCategoryId(e.target.value)}
                        >
                          {categories.map((c) => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                          <option value="new_cat">+ Buat Kategori Baru...</option>
                        </select>
                      ) : (
                        <input
                          type="text"
                          className="input-control"
                          placeholder="Nama Kategori (misal: Minuman & Kopi)"
                          value={newCategoryName}
                          onChange={(e) => setNewCategoryName(e.target.value)}
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 2: Harga & Stok Inventaris */}
              <div style={{ background: '#FAF8F5', padding: '16px', borderRadius: '12px', border: '1px solid #E8E4DF' }}>
                <h4 style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#15803D', fontWeight: 700, margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <DollarSign size={14} /> 2. Harga & Stok Inventaris
                </h4>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                  <div>
                    <label className="form-label" style={{ marginBottom: '6px', display: 'block' }}>Harga Jual (Rp) *</label>
                    <input
                      type="number"
                      min="0"
                      className="input-control"
                      required
                      placeholder="Rp 35.000"
                      value={price}
                      onChange={(e) => setPrice(e.target.value ? Number(e.target.value) : '')}
                      style={{ fontWeight: 700 }}
                    />
                  </div>

                  <div>
                    <label className="form-label" style={{ marginBottom: '6px', display: 'block' }}>Harga Modal / COGS (Rp)</label>
                    <input
                      type="number"
                      min="0"
                      className="input-control"
                      placeholder="Rp 18.000"
                      value={costPrice}
                      onChange={(e) => setCostPrice(e.target.value ? Number(e.target.value) : '')}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label className="form-label" style={{ marginBottom: '6px', display: 'block' }}>Stok Awal *</label>
                    <input
                      type="number"
                      min="0"
                      className="input-control"
                      required
                      placeholder="50"
                      value={stock}
                      onChange={(e) => setStock(e.target.value ? Number(e.target.value) : '')}
                    />
                  </div>

                  <div>
                    <label className="form-label" style={{ marginBottom: '6px', display: 'block' }}>Batas Stok Menipis</label>
                    <input
                      type="number"
                      min="0"
                      className="input-control"
                      placeholder="10"
                      value={minStock}
                      onChange={(e) => setMinStock(e.target.value ? Number(e.target.value) : '')}
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 3: Deskripsi & Foto Produk */}
              <div style={{ background: '#FAF8F5', padding: '16px', borderRadius: '12px', border: '1px solid #E8E4DF' }}>
                <h4 style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#4338CA', fontWeight: 700, margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ImageIcon size={14} /> 3. Deskripsi & Foto Produk
                </h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <label className="form-label" style={{ marginBottom: '6px', display: 'block' }}>Deskripsi Singkat</label>
                    <input
                      type="text"
                      className="input-control"
                      placeholder="Contoh: Espresso arabika dipadukan dengan susu segar dan gula aren asli"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="form-label" style={{ marginBottom: '6px', display: 'block' }}>
                      Foto Produk
                    </label>

                    {image ? (
                      /* Preview Selected or Existing Photo */
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', background: '#FFFFFF', padding: '12px 16px', borderRadius: '12px', border: '1px solid #E8E4DF' }}>
                        <div style={{ width: '64px', height: '64px', aspectRatio: '1 / 1', borderRadius: '10px', overflow: 'hidden', flexShrink: 0, border: '1px solid #E8E4DF', background: '#FAF8F5' }}>
                          <img
                            src={image}
                            alt="Preview"
                            style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', display: 'block' }}
                          />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '13px', fontWeight: 700, color: '#1C1917', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {fileName || (image.startsWith('/products/') ? image.replace('/products/', '') : 'Foto Produk')}
                          </div>
                          {fileSize && (
                            <div style={{ fontSize: '11.5px', color: '#6E6761', marginTop: '1px' }}>
                              Ukuran: {fileSize}
                            </div>
                          )}
                          <div style={{ fontSize: '11.5px', color: '#15803D', fontWeight: 600, marginTop: '2px' }}>
                            ✓ Foto produk aktif
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            type="button"
                            className="btn btn-secondary"
                            style={{ padding: '6px 12px', fontSize: '12px' }}
                            onClick={() => fileInputRef.current?.click()}
                          >
                            <RefreshCw size={13} />
                            <span>Ganti Foto</span>
                          </button>
                          <button
                            type="button"
                            className="btn btn-danger"
                            style={{ padding: '6px 12px', fontSize: '12px' }}
                            onClick={handleRemoveImage}
                          >
                            <Trash2 size={13} />
                            <span>Hapus</span>
                          </button>
                        </div>
                        <input
                          type="file"
                          ref={fileInputRef}
                          accept="image/jpeg,image/png,image/webp"
                          style={{ display: 'none' }}
                          onChange={handleFileChange}
                        />
                      </div>
                    ) : (
                      /* Dropzone / Picker UI */
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        style={{
                          border: '2px dashed #C89D7C',
                          borderRadius: '12px',
                          padding: '24px 16px',
                          textAlign: 'center',
                          background: '#FFFFFF',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                        }}
                      >
                        <Upload size={32} color="#3D2B1F" style={{ margin: '0 auto 8px auto', display: 'block' }} />
                        <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#1C1917' }}>Pilih Foto Produk</div>
                        <div style={{ fontSize: '11.5px', color: '#6E6761', marginTop: '2px' }}>JPG, PNG • Max 2 MB</div>
                        <input
                          type="file"
                          ref={fileInputRef}
                          accept="image/jpeg,image/png,image/webp"
                          style={{ display: 'none' }}
                          onChange={handleFileChange}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Form Actions: Batal & Simpan Produk Baru */}
              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
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
                  <span>{editingProduct ? 'Simpan Perubahan Produk' : 'Simpan Produk Baru'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
