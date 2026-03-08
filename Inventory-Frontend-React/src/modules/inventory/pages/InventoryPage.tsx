import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Package,
    Plus,
    Search,
    Filter,
    Edit2,
    Trash2,
    History,
    TrendingUp,
    AlertCircle,
    X,
    Loader2,
    Layers,
    Tag,
    PackagePlus,
    Truck
} from 'lucide-react';
import { inventoryApi, supplierApi } from '../../../services/api';

interface Category {
    id: string;
    name: string;
    description?: string;
}

interface Supplier {
    id: string;
    name: string;
    contact_email: string;
    phone: string;
    products: string[];
}

interface Product {
    id: string;
    name: string;
    description?: string;
    price: number;
    discount: number;
    sku: string;
    category_id: string;
    stock?: {
        quantity: number;
    };
}

const InventoryPage: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');

    // Modal States
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [isStockModalOpen, setIsStockModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);
    const [stockUpdateItem, setStockUpdateItem] = useState<Product | null>(null);
    const [stockChangeAmount, setStockChangeAmount] = useState<number | string>('');
    const [formLoading, setFormLoading] = useState(false);
    const [formError, setFormError] = useState('');

    // Delete Confirmation State
    const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'product' | 'category', id: string, name: string } | null>(null);

    const [productData, setProductData] = useState({
        name: '',
        description: '',
        price: 0,
        discount: 0,
        sku: '',
        category_id: ''
    });

    const [selectedSupplierId, setSelectedSupplierId] = useState('');

    const [categoryData, setCategoryData] = useState({
        name: '',
        description: ''
    });

    const fetchData = async () => {
        try {
            setLoading(true);
            const [prodRes, catRes, suppRes] = await Promise.all([
                inventoryApi.get('/api/v1/products'),
                inventoryApi.get('/api/v1/categories'),
                supplierApi.get('/api/v1/suppliers')
            ]);
            setProducts(prodRes.data);
            setCategories(catRes.data);
            setSuppliers(suppRes.data);
        } catch (error) {
            console.error('Failed to fetch inventory data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSaveProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormLoading(true);
        setFormError('');
        try {
            let productId: string;

            if (isEditMode && editingItem) {
                await inventoryApi.put(`/api/v1/products/${editingItem.id}`, productData);
                productId = editingItem.id;

                // Handle supplier change: if the supplier changed, link to the new one
                const prevSupplierId = getSupplierForProduct(editingItem.id)?.id || '';
                if (selectedSupplierId && selectedSupplierId !== prevSupplierId) {
                    await supplierApi.post(
                        `/api/v1/suppliers/${selectedSupplierId}/products`,
                        { product_id: productId }
                    );
                }
            } else {
                const res = await inventoryApi.post('/api/v1/products', productData);
                productId = res.data.id;

                // Link to selected supplier after creation
                if (selectedSupplierId && productId) {
                    await supplierApi.post(
                        `/api/v1/suppliers/${selectedSupplierId}/products`,
                        { product_id: productId }
                    );
                }
            }

            setIsProductModalOpen(false);
            resetProductForm();
            fetchData();
        } catch (err: any) {
            setFormError(err.response?.data?.detail || 'Failed to save product.');
        } finally {
            setFormLoading(false);
        }
    };

    const handleSaveCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormLoading(true);
        setFormError('');
        try {
            await inventoryApi.post('/api/v1/categories', categoryData);
            setIsCategoryModalOpen(false);
            resetCategoryForm();
            fetchData();
        } catch (err: any) {
            setFormError(err.response?.data?.detail || 'Failed to save category.');
        } finally {
            setFormLoading(false);
        }
    };

    const handleDeleteCategory = (categoryId: string, categoryName: string) => {
        setDeleteConfirm({ type: 'category', id: categoryId, name: categoryName });
    };

    const handleDeleteProduct = (productId: string, productName: string) => {
        setDeleteConfirm({ type: 'product', id: productId, name: productName });
    };

    const confirmDelete = async () => {
        if (!deleteConfirm) return;

        try {
            if (deleteConfirm.type === 'category') {
                await inventoryApi.delete(`/api/v1/categories/${deleteConfirm.id}`);
            } else if (deleteConfirm.type === 'product') {
                await inventoryApi.delete(`/api/v1/products/${deleteConfirm.id}`);
            }
            setDeleteConfirm(null);
            fetchData();
        } catch (error: any) {
            console.error(`Failed to delete ${deleteConfirm.type}:`, error);
            alert(error.response?.data?.detail || `Failed to delete ${deleteConfirm.type}.`);
        }
    };

    const resetProductForm = () => {
        setProductData({ name: '', description: '', price: 0, discount: 0, sku: '', category_id: '' });
        setSelectedSupplierId('');
        setIsEditMode(false);
        setEditingItem(null);
    };

    const resetCategoryForm = () => {
        setCategoryData({ name: '', description: '' });
    };

    const openStockModal = (product: Product) => {
        setStockUpdateItem(product);
        setStockChangeAmount('');
        setIsStockModalOpen(true);
        setFormError('');
    };

    const handleSaveStock = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!stockUpdateItem || stockChangeAmount === '') return;

        setFormLoading(true);
        setFormError('');
        try {
            await inventoryApi.post(`/api/v1/products/${stockUpdateItem.id}/stock`, {
                quantity_change: Number(stockChangeAmount)
            });
            setIsStockModalOpen(false);
            fetchData();
        } catch (err: any) {
            setFormError(err.response?.data?.detail || 'Failed to update stock.');
        } finally {
            setFormLoading(false);
        }
    };

    const openEditProductModal = (product: Product) => {
        setEditingItem(product);
        setIsEditMode(true);
        setProductData({
            name: product.name,
            description: product.description || '',
            price: product.price,
            discount: product.discount || 0,
            sku: product.sku,
            category_id: product.category_id
        });
        // Pre-select the supplier that already supplies this product
        const currentSupplier = getSupplierForProduct(product.id);
        setSelectedSupplierId(currentSupplier?.id || '');
        setFormError('');
        setIsProductModalOpen(true);
    };

    const filteredProducts = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.sku.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || p.category_id === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const getCategoryName = (id: string) => categories.find(c => c.id === id)?.name || 'Unknown';

    // Returns the first supplier that has this product in their products list
    const getSupplierForProduct = (productId: string): Supplier | undefined =>
        suppliers.find(s => s.products.includes(productId));

    return (
        <div className="inventory-page">
            <div className="page-header">
                <div className="title-section">
                    <div className="icon-wrapper">
                        <Package size={24} />
                    </div>
                    <div>
                        <h1>Inventory Management</h1>
                        <p>Track and manage your products and stock levels</p>
                    </div>
                </div>
                <div className="header-actions">
                    <button className="secondary-btn" onClick={() => setIsCategoryModalOpen(true)}>
                        <Layers size={18} />
                        <span>Categories</span>
                    </button>
                    <button className="primary-btn" onClick={() => { resetProductForm(); setIsProductModalOpen(true); }}>
                        <Plus size={18} />
                        <span>Add Product</span>
                    </button>
                </div>
            </div>

            <div className="inventory-stats stats-grid">
                <div className="stat-card glass-card">
                    <div className="stat-icon blue">
                        <Package size={20} />
                    </div>
                    <div className="stat-info">
                        <span className="label">Total Products</span>
                        <span className="value">{products.length}</span>
                    </div>
                </div>
                <div className="stat-card glass-card">
                    <div className="stat-icon orange">
                        <AlertCircle size={20} />
                    </div>
                    <div className="stat-info">
                        <span className="label">Low Stock Items</span>
                        <span className="value">12</span>
                    </div>
                </div>
                <div className="stat-card glass-card">
                    <div className="stat-icon green">
                        <TrendingUp size={20} />
                    </div>
                    <div className="stat-info">
                        <span className="label">Total Value</span>
                        <span className="value">${products.reduce((acc, p) => acc + (p.price * (p.stock?.quantity || 0)), 0).toLocaleString()}</span>
                    </div>
                </div>
            </div>

            <div className="content-controls glass-card">
                <div className="search-group">
                    <Search size={18} />
                    <input
                        type="text"
                        placeholder="Search SKU or product name..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="filter-group">
                    <Filter size={18} />
                    <select
                        value={selectedCategory}
                        onChange={e => setSelectedCategory(e.target.value)}
                    >
                        <option value="all">All Categories</option>
                        {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="table-container glass-card">
                {loading ? (
                    <div className="loading-state">
                        <Loader2 className="animate-spin" size={32} />
                        <p>Fetching inventory...</p>
                    </div>
                ) : (
                    <table className="inventory-table">
                        <thead>
                            <tr>
                                <th>Product Details</th>
                                <th>SKU</th>
                                <th>Category</th>
                                <th>Supplier</th>
                                <th>Price</th>
                                <th>Stock Level</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProducts.map((product, idx) => (
                                <motion.tr
                                    key={product.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                >
                                    <td>
                                        <div className="product-info">
                                            <div className="product-img">
                                                <Package size={16} />
                                            </div>
                                            <div className="details">
                                                <span className="name">{product.name}</span>
                                                <span className="desc">{product.description || 'No description'}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td><code className="sku-tag">{product.sku}</code></td>
                                    <td>
                                        <span className="category-badge">
                                            <Tag size={12} />
                                            {getCategoryName(product.category_id)}
                                        </span>
                                    </td>
                                    <td>
                                        {(() => {
                                            const sup = getSupplierForProduct(product.id);
                                            return sup ? (
                                                <span className="supplier-badge">
                                                    <Truck size={12} />
                                                    {sup.name}
                                                </span>
                                            ) : (
                                                <span className="no-supplier">—</span>
                                            );
                                        })()}
                                    </td>
                                    <td>
                                        <div className="price-cell">
                                            {product.discount > 0 ? (
                                                <>
                                                    <span className="original-price">${product.price.toFixed(2)}</span>
                                                    <span className="price-text discounted">
                                                        ${(product.price - (product.price * product.discount / 100)).toFixed(2)}
                                                    </span>
                                                    <span className="discount-tag">-{product.discount}%</span>
                                                </>
                                            ) : (
                                                <span className="price-text">${product.price.toFixed(2)}</span>
                                            )}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="stock-level">
                                            <div className="stock-bar">
                                                <div
                                                    className="progress"
                                                    style={{ width: `${Math.min((product.stock?.quantity || 0) / 100 * 100, 100)}%`, backgroundColor: (product.stock?.quantity || 0) < 10 ? 'var(--danger)' : 'var(--success)' }}
                                                ></div>
                                            </div>
                                            <span className="stock-count">{product.stock?.quantity || 0} units</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="action-btns">
                                            <button className="stock-btn" title="Update Stock" onClick={() => openStockModal(product)}><PackagePlus size={16} /></button>
                                            <button className="edit-btn" onClick={() => openEditProductModal(product)}><Edit2 size={16} /></button>
                                            <button className="delete-btn" onClick={() => handleDeleteProduct(product.id, product.name)}><Trash2 size={16} /></button>
                                            <button className="history-btn" title="Coming Soon"><History size={16} /></button>
                                        </div>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Product Modal */}
            <AnimatePresence>
                {isProductModalOpen && (
                    <div className="modal-overlay" onClick={() => setIsProductModalOpen(false)}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="modal-content glass-card"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="modal-header">
                                <h3>{isEditMode ? 'Edit Product' : 'Add New Product'}</h3>
                                <button className="close-btn" onClick={() => setIsProductModalOpen(false)}><X size={20} /></button>
                            </div>
                            <form onSubmit={handleSaveProduct} className="inventory-form">
                                {formError && <div className="form-error">{formError}</div>}
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Product Name</label>
                                        <input
                                            type="text"
                                            required
                                            value={productData.name}
                                            onChange={e => setProductData({ ...productData, name: e.target.value })}
                                            placeholder="e.g. Wireless Mouse"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>SKU</label>
                                        <input
                                            type="text"
                                            required
                                            value={productData.sku}
                                            onChange={e => setProductData({ ...productData, sku: e.target.value })}
                                            placeholder="e.g. WM-001"
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Description</label>
                                    <textarea
                                        value={productData.description}
                                        onChange={e => setProductData({ ...productData, description: e.target.value })}
                                        placeholder="Short product description..."
                                    />
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Price ($)</label>
                                        <input
                                            type="number"
                                            required
                                            step="0.01"
                                            value={productData.price}
                                            onChange={e => setProductData({ ...productData, price: parseFloat(e.target.value) })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Discount (%)</label>
                                        <input
                                            type="number"
                                            min="0"
                                            max="100"
                                            step="1"
                                            value={productData.discount}
                                            onChange={e => setProductData({ ...productData, discount: parseFloat(e.target.value) || 0 })}
                                        />
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Category</label>
                                        <select
                                            required
                                            value={productData.category_id}
                                            onChange={e => setProductData({ ...productData, category_id: e.target.value })}
                                        >
                                            <option value="">Select a category</option>
                                            {categories.map(cat => (
                                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <Truck size={14} />
                                            Supplier <span style={{ color: 'var(--text-dim)', fontWeight: 400 }}>(optional)</span>
                                        </span>
                                    </label>
                                    <select
                                        value={selectedSupplierId}
                                        onChange={e => setSelectedSupplierId(e.target.value)}
                                    >
                                        <option value="">No supplier</option>
                                        {suppliers.map(sup => (
                                            <option key={sup.id} value={sup.id}>{sup.name}</option>
                                        ))}
                                    </select>
                                    {selectedSupplierId && (
                                        <small style={{ color: 'var(--text-dim)', marginTop: '4px', display: 'block' }}>
                                            This product will be linked to the selected supplier after saving.
                                        </small>
                                    )}
                                </div>
                                <div className="form-actions">
                                    <button type="button" className="cancel-btn" onClick={() => setIsProductModalOpen(false)}>Cancel</button>
                                    <button type="submit" className="submit-btn" disabled={formLoading}>
                                        {formLoading ? <Loader2 className="animate-spin" size={18} /> : (isEditMode ? 'Update Product' : 'Create Product')}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Category Modal */}
            <AnimatePresence>
                {isCategoryModalOpen && (
                    <div className="modal-overlay" onClick={() => setIsCategoryModalOpen(false)}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="modal-content glass-card small"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="modal-header">
                                <h3>System Categories</h3>
                                <button className="close-btn" onClick={() => setIsCategoryModalOpen(false)}><X size={20} /></button>
                            </div>

                            <div className="category-list">
                                {categories.map(cat => (
                                    <div key={cat.id} className="cat-item">
                                        <span>{cat.name}</span>
                                        <button className="delete-cat" type="button" onClick={() => handleDeleteCategory(cat.id, cat.name)}><Trash2 size={14} /></button>
                                    </div>
                                ))}
                            </div>

                            <div className="divider"></div>

                            <form onSubmit={handleSaveCategory} className="cat-form">
                                <h4>Add New Category</h4>
                                <div className="form-group">
                                    <input
                                        type="text"
                                        required
                                        placeholder="Category name"
                                        value={categoryData.name}
                                        onChange={e => setCategoryData({ ...categoryData, name: e.target.value })}
                                    />
                                </div>
                                <div className="form-actions">
                                    <button type="submit" className="submit-btn" disabled={formLoading}>
                                        {formLoading ? <Loader2 className="animate-spin" size={16} /> : 'Add'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Stock Update Modal */}
            <AnimatePresence>
                {isStockModalOpen && stockUpdateItem && (
                    <div className="modal-overlay" onClick={() => setIsStockModalOpen(false)}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="modal-content glass-card small"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="modal-header">
                                <h3>Update Stock</h3>
                                <button className="close-btn" onClick={() => setIsStockModalOpen(false)}><X size={20} /></button>
                            </div>

                            {formError && (
                                <div className="error-message" style={{ color: 'var(--danger)', marginBottom: '15px', padding: '10px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px' }}>
                                    {formError}
                                </div>
                            )}

                            <form onSubmit={handleSaveStock} className="inventory-form">
                                <div className="form-group">
                                    <label>Product</label>
                                    <div style={{ padding: '12px 16px', background: 'var(--bg-main)', borderRadius: '10px', border: '1px solid var(--border)' }}>
                                        {stockUpdateItem.name}
                                        <span style={{ color: 'var(--text-dim)', marginLeft: '8px' }}>({stockUpdateItem.sku})</span>
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Current Stock</label>
                                    <div style={{ padding: '12px 16px', background: 'var(--bg-main)', borderRadius: '10px', border: '1px solid var(--border)' }}>
                                        {stockUpdateItem.stock?.quantity || 0} units
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Quantity Change (+ or -)</label>
                                    <input
                                        type="number"
                                        required
                                        placeholder="e.g. 50 or -10"
                                        value={stockChangeAmount}
                                        onChange={e => setStockChangeAmount(e.target.value)}
                                    />
                                    <small style={{ color: 'var(--text-dim)', marginTop: '4px' }}>
                                        New stock total will be: {(stockUpdateItem.stock?.quantity || 0) + (Number(stockChangeAmount) || 0)}
                                    </small>
                                </div>
                                <div className="form-actions">
                                    <button type="button" className="cancel-btn" onClick={() => setIsStockModalOpen(false)}>Cancel</button>
                                    <button type="submit" className="submit-btn" disabled={formLoading}>
                                        {formLoading ? <Loader2 className="animate-spin" size={18} /> : 'Update Stock'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {deleteConfirm && (
                    <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="modal-content glass-card small"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="modal-header">
                                <h3 style={{ color: 'var(--danger)' }}>Confirm Deletion</h3>
                                <button className="close-btn" onClick={() => setDeleteConfirm(null)}><X size={20} /></button>
                            </div>

                            <div className="delete-confirmation-content" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <AlertCircle size={48} color="var(--danger)" style={{ marginBottom: '16px' }} />
                                <p style={{ fontSize: '16px', marginBottom: '8px', textAlign: 'center' }}>
                                    Are you sure you want to delete this {deleteConfirm.type}?
                                </p>
                                <p style={{ fontWeight: 'bold', fontSize: '18px', textAlign: 'center', marginBottom: '24px' }}>
                                    "{deleteConfirm.name}"
                                </p>
                                <p style={{ fontSize: '14px', color: 'var(--text-dim)', textAlign: 'center', marginBottom: '24px' }}>
                                    {deleteConfirm.type === 'category'
                                        ? "Warning: Deleting this category will also delete all products associated with it. This action cannot be undone."
                                        : "This action cannot be undone."}
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
        .inventory-page {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

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
        .page-header p { color: var(--text-dim); font-size: 14px; }

        .header-actions {
          display: flex;
          gap: 12px;
        }

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
        }

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
        }

        .stat-icon.blue { background: rgba(99, 102, 241, 0.1); color: var(--primary); }
        .stat-icon.orange { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }
        .stat-icon.green { background: rgba(16, 185, 129, 0.1); color: var(--success); }

        .stat-info .label { font-size: 13px; color: var(--text-dim); display: block; }
        .stat-info .value { font-size: 20px; font-weight: 700; }

        .content-controls {
          padding: 16px;
          display: flex;
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
        }

        .search-group input {
          background: none;
          border: none;
          width: 100%;
          color: var(--text-main);
          font-size: 14px;
        }

        .filter-group {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .filter-group select {
          padding: 8px 16px;
          border-radius: 8px;
          background: var(--bg-surface-elevated);
          border: 1px solid var(--border);
          color: var(--text-main);
        }

        .table-container { overflow-x: auto; }
        .inventory-table { width: 100%; border-collapse: collapse; }
        .inventory-table th {
          padding: 16px 24px;
          border-bottom: 1px solid var(--border);
          color: var(--text-dim);
          font-size: 13px;
          font-weight: 600;
          text-align: left;
          text-transform: uppercase;
        }

        .inventory-table td {
          padding: 16px 24px;
          border-bottom: 1px solid var(--border);
          font-size: 14px;
        }

        .product-info { display: flex; align-items: center; gap: 12px; }
        .product-img { width: 36px; height: 36px; border-radius: 8px; background: var(--bg-surface-elevated); display: flex; align-items: center; justify-content: center; color: var(--text-dim); }
        .details .name { font-weight: 600; display: block; color: var(--text-main); }
        .details .desc { font-size: 12px; color: var(--text-dim); }

        .sku-tag { font-family: monospace; padding: 2px 6px; background: var(--bg-surface-elevated); border-radius: 4px; color: var(--primary); }
        
        .category-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 10px;
          background: var(--bg-surface-elevated);
          border-radius: 6px;
          font-size: 12px;
          font-weight: 500;
        }

        .supplier-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 10px;
          background: rgba(20, 184, 166, 0.1);
          color: #14b8a6;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 500;
          white-space: nowrap;
        }

        .no-supplier {
          color: var(--text-dim);
          font-size: 14px;
        }

        .price-text { font-weight: 700; color: var(--text-main); }
        .price-text.discounted { color: var(--success); }

        .price-cell {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .original-price {
          font-size: 11px;
          text-decoration: line-through;
          color: var(--text-dim);
        }

        .discount-tag {
          font-size: 10px;
          font-weight: 700;
          color: var(--success);
          background: rgba(16, 185, 129, 0.1);
          padding: 1px 4px;
          border-radius: 4px;
          width: fit-content;
        }

        .stock-level { display: flex; flex-direction: column; gap: 6px; min-width: 120px; }
        .stock-bar { height: 6px; background: var(--border); border-radius: 3px; overflow: hidden; }
        .progress { height: 100%; transition: width 0.3s ease; }
        .stock-count { font-size: 12px; font-weight: 600; color: var(--text-dim); }

        .action-btns { display: flex; gap: 12px; color: var(--text-dim); }
        .action-btns button:hover { color: var(--text-main); }

        /* Modal Styles */
        .modal-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(15, 23, 42, 0.4);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }

        .modal-content {
          width: 100%;
          max-width: 600px;
          padding: 32px;
          position: relative;
        }

        .modal-content.small { max-width: 400px; }

        .modal-header { display: flex; justify-content: space-between; margin-bottom: 24px; }
        .modal-header h3 { font-size: 20px; font-weight: 700; }

        .inventory-form { display: flex; flex-direction: column; gap: 20px; }
        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .form-group { display: flex; flex-direction: column; gap: 8px; }
        .form-group label { font-size: 14px; font-weight: 600; color: var(--text-muted); }
        .form-group input, .form-group select, .form-group textarea {
          padding: 12px 16px;
          border-radius: 10px;
          background: var(--bg-surface-elevated);
          border: 1px solid var(--border);
          color: var(--text-main);
          font-size: 14px;
        }
        .form-group textarea { height: 80px; resize: none; }

        .form-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 10px; }
        .cancel-btn { padding: 10px 20px; color: var(--text-muted); font-weight: 600; }
        .submit-btn { background: var(--primary); color: white; padding: 10px 24px; border-radius: 10px; font-weight: 700; }

        .category-list { display: flex; flex-direction: column; gap: 8px; max-height: 200px; overflow-y: auto; margin-bottom: 20px; }
        .cat-item { display: flex; justify-content: space-between; align-items: center; padding: 10px 16px; background: var(--bg-surface-elevated); border-radius: 8px; }
        .delete-cat { color: var(--text-dim); transition: color 0.2s; cursor: pointer; position: relative; z-index: 10; padding: 4px; pointer-events: auto; }
        .delete-cat:hover { color: var(--danger); }

        .divider { height: 1px; background: var(--border); margin: 20px 0; }
        .cat-form h4 { font-size: 15px; margin-bottom: 12px; }

        .loading-state { padding: 60px; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 16px; color: var(--text-dim); }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-spin { animation: spin 1s linear infinite; }
      `}</style>
        </div>
    );
};

export default InventoryPage;
