import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Tag, Search, RefreshCw, X, Layers } from 'lucide-react';
import { toast } from 'react-hot-toast';
import AdminEmptyState from '../../components/AdminEmptyState';
import { useAuth } from '../../context/AuthContext';

const AdminCategories = () => {
    const { api } = useAuth();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [formData, setFormData] = useState({ name: '', description: '' });

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/categories');
            setCategories(data.categories || []);
        } catch (err) {
            console.error('Failed to fetch categories:', err);
            if (!err.response || err.response.status >= 500) {
                toast.error('Server error while loading categories');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingCategory) {
                await api.put(`/categories/${editingCategory._id}`, formData);
                toast.success('Category updated');
            } else {
                await api.post('/categories', formData);
                toast.success('Category created');
            }
            setShowModal(false);
            setEditingCategory(null);
            setFormData({ name: '', description: '' });
            fetchCategories();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Action failed');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this category? This might affect courses using it.')) return;
        try {
            await api.delete(`/categories/${id}`);
            toast.success('Category deleted');
            fetchCategories();
        } catch (err) {
            toast.error('Deletion failed');
        }
    };

    const openEdit = (cat) => {
        setEditingCategory(cat);
        setFormData({ name: cat.name, description: cat.description || '' });
        setShowModal(true);
    };

    const filteredCategories = categories.filter(cat =>
        cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cat.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading && categories.length === 0) return (
        <div className="flex items-center justify-center p-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
    );

    return (
        <div className="admin-page-container">
            <header className="admin-page-header">
                <h1 className="admin-page-title">Categories</h1>
                <div className="header-actions">
                    <button className="btn btn-outline btn-compact" onClick={fetchCategories}>
                        <RefreshCw size={14} /> Refresh
                    </button>
                    <button className="btn btn-primary btn-compact" onClick={() => { setEditingCategory(null); setFormData({ name: '', description: '' }); setShowModal(true); }}>
                        <Plus size={16} /> New Asset
                    </button>
                </div>
            </header>

            <div className="admin-section-card">
                <div className="admin-controls-grid">
                    <div className="search-container">
                        <div className="search-bar-container">
                            <Search size={18} className="search-icon" />
                            <input
                                type="text"
                                placeholder="Filter categories..."
                                className="form-control"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {filteredCategories.length === 0 ? (
                    <AdminEmptyState
                        icon={Tag}
                        title="No classifications"
                        message={searchTerm ? `No labels matching "${searchTerm}"` : "Create categories to help students discover content."}
                        onRefresh={fetchCategories}
                    />
                ) : (
                    <div className="table-container">
                        <table className="admin-table responsive-table-stack">
                            <thead>
                                <tr>
                                    <th>Category</th>
                                    <th>Slug</th>
                                    <th>Description</th>
                                    <th style={{ textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredCategories.map(cat => (
                                    <tr key={cat._id}>
                                        <td data-label="Category">
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#f5f3ff', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                    <Tag size={18} />
                                                </div>
                                                <span style={{ fontWeight: 700, color: 'var(--text)' }}>{cat.name}</span>
                                            </div>
                                        </td>
                                        <td data-label="Slug">
                                            <code style={{ background: '#f1f5f9', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.85rem', color: 'var(--primary)' }}>
                                                /{cat.slug}
                                            </code>
                                        </td>
                                        <td data-label="Description" className="cat-desc-td">
                                            <span style={{ color: 'var(--text-secondary)', wordBreak: 'break-word', whiteSpace: 'normal', lineHeight: '1.5', display: 'block' }}>
                                                {cat.description || <em style={{ color: 'var(--text-muted)' }}>No description</em>}
                                            </span>
                                        </td>
                                        <td data-label="Actions" className="cat-actions-td">
                                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                                <button className="admin-action-btn" onClick={() => openEdit(cat)} title="Edit">
                                                    <Edit size={16} />
                                                </button>
                                                <button className="admin-action-btn danger" onClick={() => handleDelete(cat._id)} title="Delete">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Premium Category Modal */}
            {showModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(15, 23, 42, 0.6)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    backdropFilter: 'blur(4px)'
                }} onClick={() => setShowModal(false)}>
                    <div style={{
                        backgroundColor: 'var(--surface)',
                        borderRadius: '16px',
                        padding: '2.5rem',
                        maxWidth: '500px',
                        width: '95%',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                    }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                            <div>
                                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text)' }}>
                                    {editingCategory ? 'Edit Classification' : 'New Classification'}
                                </h2>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Define a clear category for your curriculum</p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="admin-action-btn" style={{ padding: '0.5rem' }}>
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div style={{ display: 'grid', gap: '1.5rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Category Name</label>
                                    <input
                                        type="text"
                                        required
                                        className="form-control"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="e.g. Web Development"
                                        style={{ padding: '0.8rem 1rem' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Strategic Description</label>
                                    <textarea
                                        className="form-control"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="Describe the objective of this category..."
                                        rows="4"
                                        style={{ resize: 'none', padding: '1rem' }}
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', marginTop: '2.5rem' }}>
                                <button type="submit" className="btn btn-primary" style={{ flex: 2, padding: '1rem' }}>
                                    {editingCategory ? 'Update Asset' : 'Create Asset'}
                                </button>
                                <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setShowModal(false)}>
                                    Discard
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminCategories;
