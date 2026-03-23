import { useState, useEffect } from 'react';
import {
    Trash2,
    RefreshCw,
    UserCheck,
    Ban,
    Download,
    FileText,
    Search,
    User as UserIcon,
    AlertCircle,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import AdminEmptyState from '../../components/AdminEmptyState';
import { useAuth } from '../../context/AuthContext';
import './AdminUsers.css';

const AdminUsers = () => {
    const { api } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [refreshing, setRefreshing] = useState(false);
    const [deleteModal, setDeleteModal] = useState({ show: false, userId: null, name: '' });
    const [isActioning, setIsActioning] = useState(false);
    const [pagination, setPagination] = useState({
        page: 1,
        pages: 1,
        count: 0,
        pageSize: 10
    });

    const handleRefresh = async () => {
        setRefreshing(true);
        try {
            await fetchUsers();
            toast.success("Data refreshed successfully");
        } catch (err) {
            toast.error("Failed to refresh data");
        } finally {
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchUsers(1);
    }, [searchTerm]);

    const fetchUsers = async (page = 1) => {
        setLoading(true);
        try {
            const { data } = await api.get(`/admin/users?pageNumber=${page}&keyword=${searchTerm}`);
            setUsers(data.users || []);
            setPagination({
                page: data.page,
                pages: data.pages,
                count: data.count,
                pageSize: data.pageSize
            });
        } catch (err) {
            console.error('Failed to fetch users:', err);
            toast.error('Failed to load user records');
            setUsers([]);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleBlock = async (user) => {
        setIsActioning(true);
        try {
            const { data } = await api.put(`/admin/users/${user._id}/status`,
                { isBlocked: !user.isBlocked }
            );
            setUsers(users.map(u => u._id === user._id ? data.user : u));
            toast.success(`User ${data.user.isBlocked ? 'blocked' : 'unblocked'}`);
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to update status");
        } finally {
            setIsActioning(false);
        }
    };

    const handleDeleteUser = async () => {
        const { userId } = deleteModal;
        if (!userId) return;

        setIsActioning(true);
        try {
            await api.delete(`/admin/users/${userId}`);
            setUsers(users.filter(user => user._id !== userId));
            toast.success("User successfully deleted");
            setDeleteModal({ show: false, userId: null, name: '' });
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to delete user');
        } finally {
            setIsActioning(false);
        }
    };

    const handleExport = async (format) => {
        try {
            toast.loading(`Preparing ${format.toUpperCase()} export...`, { id: 'export-toast' });
            const response = await api.get(`/admin/users/export?format=${format}`, {
                responseType: 'blob'
            });

            const fileName = `users_report_${new Date().getTime()}.${format}`;
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);

            toast.success(`${format.toUpperCase()} Exported successfully`, { id: 'export-toast' });
        } catch (err) {
            console.error('Export failed:', err);
            toast.error('Failed to export data', { id: 'export-toast' });
        }
    };

    const filteredUsers = users;

    if (loading && users.length === 0) return (
        <div className="flex items-center justify-center p-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
    );

    return (
        <div className="admin-page-container">
            <header className="admin-page-header">
                <div>
                    <h1 className="admin-page-title">User Management</h1>
                    <p className="admin-page-subtitle">Manage system access, roles, and account status</p>
                </div>
                <div className="header-actions">
                    <button
                        className="btn btn-outline btn-compact"
                        onClick={handleRefresh}
                        disabled={refreshing || loading}
                    >
                        <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
                        <span className="btn-text">{refreshing ? 'Refreshing...' : 'Refresh'}</span>
                    </button>
                    <div className="export-group">
                        <button className="btn btn-outline btn-compact" onClick={() => handleExport('csv')} disabled={loading || users.length === 0}>
                            <Download size={14} /> CSV
                        </button>
                        <button className="btn btn-outline btn-compact" onClick={() => handleExport('pdf')} disabled={loading || users.length === 0}>
                            <FileText size={14} /> PDF
                        </button>
                    </div>
                </div>
            </header>

            <div className="admin-controls-panel">
                <div className="search-bar-container" style={{ maxWidth: '400px' }}>
                    <Search size={18} className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search users..."
                        className="form-control"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ paddingLeft: '2.75rem' }}
                    />
                </div>
            </div>

            <div className="admin-section-card">
                {filteredUsers.length === 0 ? (
                    <AdminEmptyState
                        icon={UserIcon}
                        title="No users found"
                        message={searchTerm ? `No results match "${searchTerm}"` : "The user directory is currently empty."}
                        onRefresh={fetchUsers}
                    />
                ) : (
                    <div className="table-container">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Identity</th>
                                    <th>Email</th>
                                    <th>Role</th>
                                    <th>Status</th>
                                    <th style={{ textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.map((user) => (
                                    <tr key={user._id}>
                                        <td>
                                            <div className="user-identity-cell">
                                                <div className={`user-avatar-initials ${user.role}`} style={{ overflow: 'hidden', padding: 0 }}>
                                                    {user.profilePic ? (
                                                        <img
                                                            src={user.profilePic}
                                                            alt={user.name}
                                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                            onError={(e) => {
                                                                e.target.src = '/default-avatar.png';
                                                            }}
                                                        />
                                                    ) : (
                                                        <img src="/default-avatar.png" alt="Default Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                    )}
                                                </div>
                                                <div className="user-text-info">
                                                    <div className="font-bold">{user.name}</div>
                                                    <div className="text-xs text-muted-foreground">ID: {user._id.slice(-6)}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="text-secondary">{user.email}</td>
                                        <td>
                                            <span className={`role-badge ${user.role}`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`status-pill ${user.isBlocked ? 'blocked' : 'active'}`}>
                                                {user.isBlocked ? 'Blocked' : 'Active'}
                                            </span>
                                        </td>
                                        <td style={{ textAlign: 'right' }}>
                                            <div className="action-button-group">
                                                <button
                                                    onClick={() => handleToggleBlock(user)}
                                                    className={`admin-icon-btn ${user.isBlocked ? 'success' : 'warning'}`}
                                                    title={user.isBlocked ? "Unblock User" : "Block User"}
                                                    disabled={isActioning}
                                                >
                                                    {user.isBlocked ? <UserCheck size={16} /> : <Ban size={16} />}
                                                </button>
                                                <button
                                                    onClick={() => setDeleteModal({ show: true, userId: user._id, name: user.name })}
                                                    className="admin-icon-btn danger"
                                                    title="Delete User"
                                                    disabled={isActioning || user.role === 'admin'}
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Pagination UI */}
                        {pagination.pages > 1 && (
                            <div className="pagination-wrapper">
                                <div className="pagination-summary">
                                    {((pagination.page - 1) * pagination.pageSize) + 1}–{Math.min(pagination.page * pagination.pageSize, pagination.count)} <span className="separator">/</span> {pagination.count}
                                </div>
                                <div className="pagination-actions">
                                    <button
                                        className="pagination-btn"
                                        onClick={() => fetchUsers(pagination.page - 1)}
                                        disabled={pagination.page === 1 || loading}
                                        title="Previous Page"
                                    >
                                        <ChevronLeft size={18} />
                                    </button>

                                    <div className="pagination-numbers">
                                        {[...Array(pagination.pages).keys()].map(x => (
                                            <button
                                                key={x + 1}
                                                className={`pagination-number-btn ${pagination.page === x + 1 ? 'active' : ''}`}
                                                onClick={() => fetchUsers(x + 1)}
                                                disabled={loading}
                                            >
                                                {x + 1}
                                            </button>
                                        ))}
                                    </div>

                                    <button
                                        className="pagination-btn"
                                        onClick={() => fetchUsers(pagination.page + 1)}
                                        disabled={pagination.page === pagination.pages || loading}
                                        title="Next Page"
                                    >
                                        <ChevronRight size={18} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            {deleteModal.show && (
                <div className="admin-modal-overlay">
                    <div className="admin-modal">
                        <div className="modal-header">
                            <h3 className="font-bold">Permanently Delete User?</h3>
                            <button
                                className="close-btn"
                                onClick={() => setDeleteModal({ show: false, userId: null, name: '' })}
                            >
                                <AlertCircle size={20} />
                            </button>
                        </div>
                        <div className="modal-body text-center">
                            <div className="modal-icon warning">
                                <AlertCircle size={40} />
                            </div>
                            <p className="mb-4">Are you sure you want to delete <strong>{deleteModal.name}</strong>?</p>
                            <p className="text-secondary text-sm">This action is irreversible and will remove all their enrollments and records.</p>
                        </div>
                        <div className="modal-footer">
                            <button
                                className="btn btn-outline"
                                onClick={() => setDeleteModal({ show: false, userId: null, name: '' })}
                            >
                                Cancel
                            </button>
                            <button
                                className="btn btn-primary destructive"
                                onClick={handleDeleteUser}
                                disabled={isActioning}
                                style={{ backgroundColor: 'var(--error)', borderColor: 'var(--error)' }}
                            >
                                {isActioning ? 'Deleting...' : 'Proceed with Deletion'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminUsers;
