import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Truck,
    Plus,
    Search,
    Edit2,
    Trash2,
    X,
    Loader2,
    Mail,
    Phone,
    MapPin,
    AlertCircle,
    Package,
    Link2,
    Users,
    Building2,
} from 'lucide-react';
import { supplierApi, inventoryApi } from '../../../services/api';

interface Supplier {
    id: string;
    name: string;
    contact_email: string;
    phone: string;
    address?: string;
    products: string[];
}

interface Product {
    id: string;
    name: string;
    sku: string;
}

const SupplierPage: React.FC = () => {
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Modal states
    const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
    const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
    const [linkingSupplier, setLinkingSupplier] = useState<Supplier | null>(null);
    const [selectedProductId, setSelectedProductId] = useState('');
    const [formLoading, setFormLoading] = useState(false);
    const [formError, setFormError] = useState('');
    const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string } | null>(null);

    const [supplierData, setSupplierData] = useState({
        name: '',
        contact_email: '',
        phone: '',
        address: '',
    });

    // ── Data Fetching ────────────────────────────────────────────────────────
    const fetchData = async () => {
        try {
            setLoading(true);
            const [suppRes, prodRes] = await Promise.all([
                supplierApi.get('/api/v1/suppliers'),
                inventoryApi.get('/api/v1/products'),
            ]);
            setSuppliers(suppRes.data);
            setProducts(prodRes.data);
        } catch (error) {
            console.error('Failed to fetch supplier data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // ── CRUD Handlers ────────────────────────────────────────────────────────
    const handleSaveSupplier = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormLoading(true);
        setFormError('');
        try {
            if (isEditMode && editingSupplier) {
                await supplierApi.put(`/api/v1/suppliers/${editingSupplier.id}`, supplierData);
            } else {
                await supplierApi.post('/api/v1/suppliers', supplierData);
            }
            setIsSupplierModalOpen(false);
            resetForm();
            fetchData();
        } catch (err: any) {
            setFormError(err.response?.data?.detail || 'Failed to save supplier.');
        } finally {
            setFormLoading(false);
        }
    };

    const handleDeleteSupplier = (id: string, name: string) => {
        setDeleteConfirm({ id, name });
    };

    const confirmDelete = async () => {
        if (!deleteConfirm) return;
        try {
            await supplierApi.delete(`/api/v1/suppliers/${deleteConfirm.id}`);
            setDeleteConfirm(null);
            fetchData();
        } catch (error: any) {
            alert(error.response?.data?.detail || 'Failed to delete supplier.');
        }
    };

    const handleLinkProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!linkingSupplier || !selectedProductId) return;
        setFormLoading(true);
        setFormError('');
        try {
            await supplierApi.post(`/api/v1/suppliers/${linkingSupplier.id}/products`, {
                product_id: selectedProductId,
            });
            setIsLinkModalOpen(false);
            setSelectedProductId('');
            fetchData();
        } catch (err: any) {
            setFormError(err.response?.data?.detail || 'Failed to link product.');
        } finally {
            setFormLoading(false);
        }
    };

    const openEditModal = (supplier: Supplier) => {
        setEditingSupplier(supplier);
        setIsEditMode(true);
        setSupplierData({
            name: supplier.name,
            contact_email: supplier.contact_email,
            phone: supplier.phone,
            address: supplier.address || '',
        });
        setFormError('');
        setIsSupplierModalOpen(true);
    };

    const openLinkModal = (supplier: Supplier) => {
        setLinkingSupplier(supplier);
        setSelectedProductId('');
        setFormError('');
        setIsLinkModalOpen(true);
    };

    const resetForm = () => {
        setSupplierData({ name: '', contact_email: '', phone: '', address: '' });
        setIsEditMode(false);
        setEditingSupplier(null);
        setFormError('');
    };

    // ── Derived data ─────────────────────────────────────────────────────────
    const getProductName = (id: string) =>
        products.find((p) => p.id === id)?.name || id.slice(0, 8) + '…';

    const filteredSuppliers = suppliers.filter(
        (s) =>
            s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.contact_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.phone.includes(searchTerm)
    );

    const totalLinkedProducts = suppliers.reduce((acc, s) => acc + s.products.length, 0);
    const uniqueProducts = new Set(suppliers.flatMap((s) => s.products)).size;

    // ── Render ───────────────────────────────────────────────────────────────
    return (
        <div className="supplier-page">

            {/* Header */}
            <div className="page-header">
                <div className="title-section">
                    <div className="icon-wrapper">
                        <Truck size={24} />
                    </div>
                    <div>
                        <h1>Supplier Management</h1>
                        <p>Manage your suppliers and their linked products</p>
                    </div>
                </div>
                <div className="header-actions">
                    <button
                        className="primary-btn"
                        onClick={() => { resetForm(); setIsSupplierModalOpen(true); }}
                    >
                        <Plus size={18} />
                        <span>Add Supplier</span>
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="stats-grid">
                <div className="stat-card glass-card">
                    <div className="stat-icon purple"><Users size={20} /></div>
                    <div className="stat-info">
                        <span className="label">Total Suppliers</span>
                        <span className="value">{suppliers.length}</span>
                    </div>
                </div>
                <div className="stat-card glass-card">
                    <div className="stat-icon teal"><Package size={20} /></div>
                    <div className="stat-info">
                        <span className="label">Linked Products</span>
                        <span className="value">{totalLinkedProducts}</span>
                    </div>
                </div>
                <div className="stat-card glass-card">
                    <div className="stat-icon orange"><Building2 size={20} /></div>
                    <div className="stat-info">
                        <span className="label">Unique Products</span>
                        <span className="value">{uniqueProducts}</span>
                    </div>
                </div>
            </div>

            {/* Search */}
            <div className="content-controls glass-card">
                <div className="search-group">
                    <Search size={18} />
                    <input
                        type="text"
                        placeholder="Search by name, email or phone..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <span className="results-label">{filteredSuppliers.length} supplier{filteredSuppliers.length !== 1 ? 's' : ''}</span>
            </div>

            {/* Table */}
            <div className="table-container glass-card">
                {loading ? (
                    <div className="loading-state">
                        <Loader2 className="animate-spin" size={32} />
                        <p>Fetching suppliers...</p>
                    </div>
                ) : filteredSuppliers.length === 0 ? (
                    <div className="empty-state">
                        <Truck size={48} opacity={0.2} />
                        <p>No suppliers found</p>
                        <span>Add your first supplier to get started.</span>
                    </div>
                ) : (
                    <table className="supplier-table">
                        <thead>
                            <tr>
                                <th>Supplier</th>
                                <th>Contact</th>
                                <th>Phone</th>
                                <th>Address</th>
                                <th>Linked Products</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredSuppliers.map((supplier, idx) => (
                                <motion.tr
                                    key={supplier.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.04 }}
                                >
                                    {/* Supplier Name */}
                                    <td>
                                        <div className="supplier-info">
                                            <div className="supplier-avatar">
                                                {supplier.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="details">
                                                <span className="name">{supplier.name}</span>
                                                <span className="sub-id">ID: {supplier.id.slice(0, 8)}…</span>
                                            </div>
                                        </div>
                                    </td>

                                    {/* Email */}
                                    <td>
                                        <div className="contact-cell">
                                            <Mail size={14} />
                                            <span>{supplier.contact_email}</span>
                                        </div>
                                    </td>

                                    {/* Phone */}
                                    <td>
                                        <div className="contact-cell">
                                            <Phone size={14} />
                                            <span>{supplier.phone}</span>
                                        </div>
                                    </td>

                                    {/* Address */}
                                    <td>
                                        <div className="contact-cell">
                                            <MapPin size={14} />
                                            <span>{supplier.address || <em style={{ color: 'var(--text-dim)' }}>N/A</em>}</span>
                                        </div>
                                    </td>

                                    {/* Products */}
                                    <td>
                                        <div className="products-cell">
                                            {supplier.products.length === 0 ? (
                                                <span className="no-products">None</span>
                                            ) : (
                                                <div className="product-tags">
                                                    {supplier.products.slice(0, 2).map((pid) => (
                                                        <span key={pid} className="product-badge">
                                                            {getProductName(pid)}
                                                        </span>
                                                    ))}
                                                    {supplier.products.length > 2 && (
                                                        <span className="more-badge">+{supplier.products.length - 2}</span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </td>

                                    {/* Actions */}
                                    <td>
                                        <div className="action-btns">
                                            <button className="link-btn" title="Link Product" onClick={() => openLinkModal(supplier)}>
                                                <Link2 size={16} />
                                            </button>
                                            <button className="edit-btn" title="Edit" onClick={() => openEditModal(supplier)}>
                                                <Edit2 size={16} />
                                            </button>
                                            <button className="delete-btn" title="Delete" onClick={() => handleDeleteSupplier(supplier.id, supplier.name)}>
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* ── Add / Edit Supplier Modal ──────────────────────────────────── */}
            <AnimatePresence>
                {isSupplierModalOpen && (
                    <div className="modal-overlay" onClick={() => setIsSupplierModalOpen(false)}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="modal-content glass-card"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="modal-header">
                                <h3>{isEditMode ? 'Edit Supplier' : 'Add New Supplier'}</h3>
                                <button className="close-btn" onClick={() => setIsSupplierModalOpen(false)}>
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleSaveSupplier} className="supplier-form">
                                {formError && <div className="form-error">{formError}</div>}

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Supplier Name</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="e.g. Acme Corp"
                                            value={supplierData.name}
                                            onChange={(e) => setSupplierData({ ...supplierData, name: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Contact Email</label>
                                        <input
                                            type="email"
                                            required
                                            placeholder="e.g. contact@acme.com"
                                            value={supplierData.contact_email}
                                            onChange={(e) => setSupplierData({ ...supplierData, contact_email: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Phone</label>
                                        <input
                                            type="tel"
                                            required
                                            placeholder="e.g. +1 555-000-0000"
                                            value={supplierData.phone}
                                            onChange={(e) => setSupplierData({ ...supplierData, phone: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Address (optional)</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. 123 Main St, NY"
                                            value={supplierData.address}
                                            onChange={(e) => setSupplierData({ ...supplierData, address: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="form-actions">
                                    <button type="button" className="cancel-btn" onClick={() => setIsSupplierModalOpen(false)}>Cancel</button>
                                    <button type="submit" className="submit-btn" disabled={formLoading}>
                                        {formLoading
                                            ? <Loader2 className="animate-spin" size={18} />
                                            : isEditMode ? 'Update Supplier' : 'Create Supplier'
                                        }
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* ── Link Product Modal ─────────────────────────────────────────── */}
            <AnimatePresence>
                {isLinkModalOpen && linkingSupplier && (
                    <div className="modal-overlay" onClick={() => setIsLinkModalOpen(false)}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="modal-content glass-card small"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="modal-header">
                                <h3>Link Product</h3>
                                <button className="close-btn" onClick={() => setIsLinkModalOpen(false)}>
                                    <X size={20} />
                                </button>
                            </div>

                            <p className="modal-sub">
                                Linking a product to <strong>{linkingSupplier.name}</strong>
                            </p>

                            {formError && <div className="form-error">{formError}</div>}

                            <form onSubmit={handleLinkProduct} className="supplier-form">
                                <div className="form-group">
                                    <label>Select Product</label>
                                    <select
                                        required
                                        value={selectedProductId}
                                        onChange={(e) => setSelectedProductId(e.target.value)}
                                    >
                                        <option value="">Choose a product…</option>
                                        {products
                                            .filter((p) => !linkingSupplier.products.includes(p.id))
                                            .map((p) => (
                                                <option key={p.id} value={p.id}>
                                                    {p.name} ({p.sku})
                                                </option>
                                            ))}
                                    </select>
                                </div>

                                <div className="form-actions">
                                    <button type="button" className="cancel-btn" onClick={() => setIsLinkModalOpen(false)}>Cancel</button>
                                    <button type="submit" className="submit-btn" disabled={formLoading || !selectedProductId}>
                                        {formLoading ? <Loader2 className="animate-spin" size={18} /> : 'Link Product'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* ── Delete Confirmation Modal ──────────────────────────────────── */}
            <AnimatePresence>
                {deleteConfirm && (
                    <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="modal-content glass-card small"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="modal-header">
                                <h3 style={{ color: 'var(--danger)' }}>Confirm Deletion</h3>
                                <button className="close-btn" onClick={() => setDeleteConfirm(null)}>
                                    <X size={20} />
                                </button>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                                <AlertCircle size={48} color="var(--danger)" style={{ marginBottom: '16px' }} />
                                <p style={{ fontSize: '16px', marginBottom: '8px' }}>
                                    Are you sure you want to delete this supplier?
                                </p>
                                <p style={{ fontWeight: 'bold', fontSize: '18px', marginBottom: '12px' }}>
                                    "{deleteConfirm.name}"
                                </p>
                                <p style={{ fontSize: '13px', color: 'var(--text-dim)', marginBottom: '24px' }}>
                                    This will permanently remove the supplier and all product links. This action cannot be undone.
                                </p>
                                <div className="form-actions" style={{ justifyContent: 'center', width: '100%', gap: '16px' }}>
                                    <button className="secondary-btn" onClick={() => setDeleteConfirm(null)}>Cancel</button>
                                    <button
                                        className="primary-btn"
                                        style={{ background: 'var(--danger)', boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)' }}
                                        onClick={confirmDelete}
                                    >
                                        Delete Forever
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <style>{`
        /* ── Page Layout ──────────────────────────────── */
        .supplier-page {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        /* ── Header ───────────────────────────────────── */
        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .title-section {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .icon-wrapper {
          width: 48px;
          height: 48px;
          background: var(--primary-glow);
          color: var(--primary);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .page-header h1 { font-size: 24px; font-weight: 700; }
        .page-header p  { color: var(--text-dim); font-size: 14px; }
        .header-actions { display: flex; gap: 12px; }

        /* ── Buttons ──────────────────────────────────── */
        .primary-btn {
          background: var(--primary);
          color: white;
          padding: 10px 24px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 10px;
          font-weight: 700;
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
          transition: opacity 0.2s;
        }
        .primary-btn:hover { opacity: 0.9; }
        .secondary-btn {
          background: var(--bg-surface-elevated);
          color: var(--text-main);
          border: 1px solid var(--border);
          padding: 10px 20px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 10px;
          font-weight: 600;
        }

        /* ── Stats ────────────────────────────────────── */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }
        .stat-card {
          padding: 24px;
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .stat-icon {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .stat-icon.purple { background: rgba(139, 92, 246, 0.12); color: #8b5cf6; }
        .stat-icon.teal   { background: rgba(20, 184, 166, 0.12);  color: #14b8a6; }
        .stat-icon.orange { background: rgba(245, 158, 11, 0.12);  color: #f59e0b; }
        .stat-info .label { font-size: 13px; color: var(--text-dim); display: block; }
        .stat-info .value { font-size: 20px; font-weight: 700; }

        /* ── Controls ─────────────────────────────────── */
        .content-controls {
          padding: 14px 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
        }
        .search-group {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 12px;
          background: var(--bg-surface-elevated);
          padding: 8px 16px;
          border-radius: 10px;
          border: 1px solid var(--border);
          color: var(--text-dim);
        }
        .search-group input {
          background: none;
          border: none;
          width: 100%;
          color: var(--text-main);
          font-size: 14px;
        }
        .results-label {
          font-size: 13px;
          color: var(--text-dim);
          white-space: nowrap;
        }

        /* ── Table ────────────────────────────────────── */
        .table-container { overflow-x: auto; }
        .supplier-table {
          width: 100%;
          border-collapse: collapse;
        }
        .supplier-table th {
          padding: 14px 20px;
          border-bottom: 1px solid var(--border);
          color: var(--text-dim);
          font-size: 12px;
          font-weight: 600;
          text-align: left;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .supplier-table td {
          padding: 16px 20px;
          border-bottom: 1px solid var(--border);
          font-size: 14px;
        }

        /* Supplier cell */
        .supplier-info { display: flex; align-items: center; gap: 12px; }
        .supplier-avatar {
          width: 38px;
          height: 38px;
          border-radius: 10px;
          background: linear-gradient(135deg, var(--primary), #818cf8);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 16px;
          color: white;
          flex-shrink: 0;
        }
        .details .name   { font-weight: 600; display: block; color: var(--text-main); }
        .details .sub-id { font-size: 11px; color: var(--text-dim); font-family: monospace; }

        /* Contact cell */
        .contact-cell {
          display: flex;
          align-items: center;
          gap: 8px;
          color: var(--text-dim);
          font-size: 13px;
        }
        .contact-cell span { color: var(--text-main); }

        /* Product badges */
        .products-cell { display: flex; flex-direction: column; gap: 4px; }
        .product-tags  { display: flex; flex-wrap: wrap; gap: 6px; }
        .product-badge {
          padding: 3px 10px;
          border-radius: 20px;
          background: rgba(99, 102, 241, 0.1);
          color: var(--primary);
          font-size: 12px;
          font-weight: 500;
          white-space: nowrap;
        }
        .more-badge {
          padding: 3px 10px;
          border-radius: 20px;
          background: var(--bg-surface-elevated);
          color: var(--text-dim);
          font-size: 12px;
          font-weight: 500;
        }
        .no-products { color: var(--text-dim); font-size: 13px; }

        /* Action buttons */
        .action-btns { display: flex; gap: 10px; }
        .action-btns button {
          width: 34px;
          height: 34px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
          color: var(--text-dim);
          background: var(--bg-surface-elevated);
          border: 1px solid var(--border);
        }
        .action-btns .link-btn:hover   { color: #14b8a6; border-color: #14b8a6; background: rgba(20, 184, 166, 0.1); }
        .action-btns .edit-btn:hover   { color: var(--primary); border-color: var(--primary); background: var(--primary-glow); }
        .action-btns .delete-btn:hover { color: var(--danger);  border-color: var(--danger);  background: rgba(239, 68, 68, 0.1); }

        /* ── Loading / Empty ──────────────────────────── */
        .loading-state, .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 64px 32px;
          gap: 12px;
          color: var(--text-dim);
        }
        .empty-state span { font-size: 14px; }

        /* ── Modal ────────────────────────────────────── */
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.45);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }
        .modal-content {
          width: 100%;
          max-width: 580px;
          padding: 32px;
          position: relative;
        }
        .modal-content.small { max-width: 420px; }
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }
        .modal-header h3 { font-size: 18px; font-weight: 700; }
        .modal-sub { font-size: 14px; color: var(--text-dim); margin-bottom: 20px; }
        .close-btn {
          color: var(--text-dim);
          width: 32px; height: 32px;
          border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          background: var(--bg-surface-elevated);
          border: 1px solid var(--border);
        }
        .close-btn:hover { color: var(--text-main); }

        /* ── Form ─────────────────────────────────────── */
        .supplier-form { display: flex; flex-direction: column; gap: 20px; }
        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .form-group { display: flex; flex-direction: column; gap: 8px; }
        .form-group label { font-size: 13px; font-weight: 600; color: var(--text-dim); }
        .form-group input,
        .form-group select {
          padding: 12px 16px;
          background: var(--bg-surface-elevated);
          border: 1px solid var(--border);
          border-radius: 10px;
          color: var(--text-main);
          font-size: 14px;
          transition: border-color 0.2s;
        }
        .form-group input:focus,
        .form-group select:focus { border-color: var(--primary); outline: none; }
        .form-group select { cursor: pointer; }
        .form-error {
          padding: 12px 16px;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: 10px;
          color: var(--danger);
          font-size: 14px;
        }
        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
        }
        .cancel-btn {
          padding: 10px 20px;
          border-radius: 10px;
          border: 1px solid var(--border);
          background: var(--bg-surface-elevated);
          color: var(--text-main);
          font-size: 14px;
          font-weight: 600;
        }
        .submit-btn {
          padding: 10px 24px;
          border-radius: 10px;
          background: var(--primary);
          color: white;
          font-size: 14px;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 8px;
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
          transition: opacity 0.2s;
        }
        .submit-btn:hover   { opacity: 0.9; }
        .submit-btn:disabled{ opacity: 0.6; cursor: not-allowed; }
      `}</style>
        </div>
    );
};

export default SupplierPage;
