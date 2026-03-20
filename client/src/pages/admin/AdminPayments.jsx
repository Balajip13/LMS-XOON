import { useState, useEffect } from 'react';
import { IndianRupee, CreditCard, RefreshCcw, Download, Filter, Search, CheckCircle, XCircle, AlertCircle, Inbox, FileText } from 'lucide-react';
import { toast } from 'react-hot-toast';
import AdminEmptyState from '../../components/AdminEmptyState';
import { useAuth } from '../../context/AuthContext';

const AdminPayments = () => {
    const { api } = useAuth();
    const [payments, setPayments] = useState([]);
    const [payouts, setPayouts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState('transactions');
    const [searchTerm, setSearchTerm] = useState('');

    const handleRefresh = async () => {
        setRefreshing(true);
        try {
            if (activeTab === 'transactions') await fetchPayments();
            else await fetchPayouts();
            toast.success("Financials synced successfully");
        } catch (err) {
            toast.error("Failed to sync financials");
        } finally {
            setRefreshing(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'transactions') fetchPayments();
        else fetchPayouts();
    }, [activeTab]);

    const fetchPayments = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/payments/admin/all');
            setPayments(data || []);
        } catch (err) {
            console.error('Failed to fetch transactions:', err);
            if (!err.response || err.response.status >= 500) {
                toast.error('Server error while loading transactions');
            }
            setPayments([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchPayouts = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/payouts');
            setPayouts(data || []);
        } catch (err) {
            console.error('Failed to fetch payouts:', err);
            if (!err.response || err.response.status >= 500) {
                toast.error('Server error while loading payouts');
            }
            setPayouts([]);
        } finally {
            setLoading(false);
        }
    };

    const handleRefund = async (paymentId) => {
        if (!window.confirm('Are you sure you want to process a refund?')) return;
        try {
            await api.post(`/payments/refund/${paymentId}`, {});
            toast.success('Refund processed successfully');
            fetchPayments();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Refund failed');
        }
    };

    const handleApprovePayout = async (payoutId) => {
        try {
            await api.put(`/payouts/${payoutId}/status`, { status: 'paid' });
            toast.success('Payout marked as paid');
            fetchPayouts();
        } catch (err) {
            toast.error('Failed to update payout');
        }
    };

    const handleExport = async (format) => {
        try {
            toast.loading(`Preparing ${format.toUpperCase()} export...`, { id: 'export-toast' });
            const response = await api.get(`/admin/payments/export?format=${format}`, {
                responseType: 'blob'
            });

            const fileName = `payments_report_${new Date().getTime()}.${format}`;
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

    const filteredPayments = payments.filter(p =>
        p.user?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.course?.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.transactionId?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return (
        <div className="flex items-center justify-center p-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
    );

    return (
        <div className="admin-page-container">
            <header className="admin-page-header">
                <h1 className="admin-page-title">Financials</h1>
                <div className="header-actions">
                    <button
                        className="btn btn-outline btn-compact"
                        onClick={handleRefresh}
                        disabled={refreshing || loading}
                    >
                        <RefreshCcw size={14} className={refreshing ? 'animate-spin' : ''} />
                        {refreshing ? 'Refreshing...' : 'Refresh'}
                    </button>
                </div>
            </header>

            <div className="admin-tabs">
                <button className={`tab-btn ${activeTab === 'transactions' ? 'active' : ''}`} onClick={() => setActiveTab('transactions')}>
                    <CreditCard size={18} /> Transactions
                </button>
                <button className={`tab-btn ${activeTab === 'payouts' ? 'active' : ''}`} onClick={() => setActiveTab('payouts')}>
                    <IndianRupee size={18} /> Payouts
                </button>
            </div>

            <div className="admin-section-card">
                {activeTab === 'transactions' ? (
                    <>
                        <div className="admin-controls-grid">
                            <div className="search-container">
                                <div className="search-bar-container">
                                    <Search size={18} className="search-icon" />
                                    <input
                                        type="text"
                                        placeholder="Search student, course, or ID..."
                                        className="form-control"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="export-actions">
                                <button
                                    className="btn btn-outline btn-compact"
                                    onClick={() => handleExport('csv')}
                                    disabled={loading || payments.length === 0}
                                >
                                    <Download size={14} /> CSV
                                </button>
                                <button
                                    className="btn btn-outline btn-compact"
                                    onClick={() => handleExport('pdf')}
                                    disabled={loading || payments.length === 0}
                                >
                                    <FileText size={14} /> PDF
                                </button>
                            </div>
                        </div>

                        {filteredPayments.length === 0 ? (
                            <AdminEmptyState
                                icon={IndianRupee}
                                title="No payment transactions available yet"
                                message={searchTerm ? `No results for "${searchTerm}"` : "Payment records will appear here once students purchase courses."}
                                onRefresh={fetchPayments}
                            />
                        ) : (
                            <div className="table-container">
                                <table className="admin-table responsive-table-stack">
                                    <thead>
                                        <tr>
                                            <th>Student Name</th>
                                            <th>Course Title</th>
                                            <th>Amount</th>
                                            <th>Payment Method</th>
                                            <th>Transaction ID</th>
                                            <th>Date</th>
                                            <th>Status</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredPayments.map(p => (
                                            <tr key={p._id}>
                                                <td data-label="Student Name" style={{ fontWeight: 600, color: 'var(--text)' }}>
                                                    {p.user?.name || '—'}
                                                </td>
                                                <td data-label="Course Title" style={{ color: 'var(--text-secondary)' }}>
                                                    {p.course?.title || '—'}
                                                </td>
                                                <td data-label="Amount" style={{ fontWeight: 700 }}>
                                                    ₹{(p.amount || 0).toLocaleString('en-IN')}
                                                </td>
                                                <td data-label="Payment Method" style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                                    {p.paymentMethod || '—'}
                                                </td>
                                                <td data-label="Transaction ID" style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontFamily: 'monospace', maxWidth: '130px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    {p.transactionId || '—'}
                                                </td>
                                                <td data-label="Date" style={{ color: 'var(--text-muted)' }}>
                                                    {p.createdAt ? new Date(p.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                                                </td>
                                                <td data-label="Status">
                                                    <span className={`status-badge ${p.status}`}>{p.status}</span>
                                                </td>
                                                <td data-label="Actions">
                                                    {p.status === 'completed' && (
                                                        <button onClick={() => handleRefund(p._id)} className="admin-action-btn danger" title="Refund">
                                                            <RefreshCcw size={16} /> Refund
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </>
                ) : (
                    payouts.length === 0 ? (
                        <AdminEmptyState
                            icon={IndianRupee}
                            title="No payouts pending"
                            message="Instructor payout requests will be listed here."
                            onRefresh={fetchPayouts}
                        />
                    ) : (
                        <div className="table-container">
                            <table className="admin-table responsive-table-stack">
                                <thead>
                                    <tr>
                                        <th>Instructor</th>
                                        <th>Earnings</th>
                                        <th>Commission</th>
                                        <th>Net Payout</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {payouts.map(po => (
                                        <tr key={po._id}>
                                            <td data-label="Instructor">{po.instructor?.name}</td>
                                            <td data-label="Earnings">₹{po.earnings}</td>
                                            <td data-label="Commission" style={{ color: 'red' }}>-₹{po.commission}</td>
                                            <td data-label="Net Payout" style={{ fontWeight: 700 }}>₹{po.amount}</td>
                                            <td data-label="Status">
                                                <span className={`status-badge ${po.status}`}>{po.status}</span>
                                            </td>
                                            <td data-label="Actions">
                                                {po.status === 'pending' && (
                                                    <button onClick={() => handleApprovePayout(po._id)} className="admin-btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
                                                        Mark as Paid
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )
                )}
            </div>
        </div>
    );
};

export default AdminPayments;
