import { useState, useEffect } from 'react';
import { Mail, Calendar, MessageSquare, AlertCircle, RefreshCw, User, Send, CheckCircle, Clock, Search, Filter } from 'lucide-react';
import { toast } from 'react-hot-toast';
import AdminEmptyState from '../../components/AdminEmptyState';
import { useAuth } from '../../context/AuthContext';

const AdminMessages = () => {
    const { api } = useAuth();
    const [tickets, setTickets] = useState([]);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [reply, setReply] = useState('');
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('open'); // 'open', 'in-progress', 'resolved'

    useEffect(() => {
        fetchTickets();
    }, [filter]);

    const fetchTickets = async () => {
        setLoading(true);
        try {
            const { data } = await api.get(`/tickets?status=${filter}`);
            setTickets(data);
        } catch (err) {
            if (!err.response || err.response.status >= 500) {
                toast.error('Failed to load tickets');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSendReply = async () => {
        if (!reply.trim()) return;
        try {
            await api.post(`/tickets/${selectedTicket._id}/response`,
                { message: reply }
            );
            toast.success('Reply sent successfully');
            setReply('');
            // Refresh results
            fetchTickets();
            setSelectedTicket(null);
        } catch (err) {
            toast.error('Failed to send reply');
        }
    };

    const handleUpdateStatus = async (id, status) => {
        try {
            await api.put(`/tickets/${id}/status`, { status });
            toast.success(`Ticket marked as ${status}`);
            fetchTickets();
            if (selectedTicket?._id === id) setSelectedTicket(null);
        } catch (err) {
            toast.error('Failed to update status');
        }
    };

    if (loading && tickets.length === 0) return (
        <div className="flex items-center justify-center p-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
    );

    return (
        <div className="admin-page-container">
            <header className="admin-page-header">
                <h1 className="admin-page-title">Support</h1>
                <div className="header-actions">
                    <button className="btn btn-outline btn-compact" onClick={fetchTickets}>
                        <RefreshCw size={14} /> Refresh
                    </button>
                </div>
            </header>

            <div className="admin-tabs">
                <button className={`tab-btn ${filter === 'open' ? 'active' : ''}`} onClick={() => setFilter('open')}>Open</button>
                <button className={`tab-btn ${filter === 'in-progress' ? 'active' : ''}`} onClick={() => setFilter('in-progress')}>In Progress</button>
                <button className={`tab-btn ${filter === 'resolved' ? 'active' : ''}`} onClick={() => setFilter('resolved')}>Resolved</button>
            </div>

            <div className="messages-layout">
                {/* Ticket List */}
                <div className="admin-section-card" style={{ overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column' }}>
                    {tickets.length === 0 ? (
                        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                            <AlertCircle size={40} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                            <p>No {filter} tickets</p>
                        </div>
                    ) : (
                        <div className="ticket-list">
                            {tickets.map(ticket => (
                                <div
                                    key={ticket._id}
                                    className={`ticket-item ${selectedTicket?._id === ticket._id ? 'selected' : ''}`}
                                    onClick={() => setSelectedTicket(ticket)}
                                    style={{
                                        padding: '1.25rem',
                                        borderBottom: '1px solid var(--border)',
                                        cursor: 'pointer',
                                        borderRadius: '10px',
                                        marginBottom: '0.75rem',
                                        backgroundColor: selectedTicket?._id === ticket._id ? '#f1f5f9' : 'transparent',
                                        border: selectedTicket?._id === ticket._id ? '1px solid var(--primary)' : '1px solid transparent',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                                        <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text)' }}>{ticket.user?.name || 'Guest'}</span>
                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                            {new Date(ticket.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <p style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>{ticket.subject}</p>
                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {ticket.message}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Ticket Detail */}
                <div className="admin-section-card" style={{ display: 'flex', flexDirection: 'column', padding: '2rem' }}>
                    {selectedTicket ? (
                        <>
                            <div className="ticket-detail-header" style={{ paddingBottom: '1.5rem', borderBottom: '1px solid var(--border)', marginBottom: '1.5rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                            <span className={`status-badge ${selectedTicket.status}`}>{selectedTicket.status}</span>
                                            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>ID: #{selectedTicket._id.slice(-6).toUpperCase()}</span>
                                        </div>
                                        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.25rem' }}>{selectedTicket.subject}</h2>
                                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                            From: <span style={{ fontWeight: 600, color: 'var(--text)' }}>{selectedTicket.user?.name}</span>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                        {selectedTicket.status !== 'resolved' && (
                                            <button onClick={() => handleUpdateStatus(selectedTicket._id, 'resolved')} className="btn btn-outline btn-compact" style={{ color: 'var(--success)', borderColor: 'var(--success)' }}>
                                                <CheckCircle size={14} /> Resolve
                                            </button>
                                        )}
                                        {selectedTicket.status === 'open' && (
                                            <button onClick={() => handleUpdateStatus(selectedTicket._id, 'in-progress')} className="btn btn-outline btn-compact" style={{ color: 'var(--primary)', borderColor: 'var(--primary)' }}>
                                                <Clock size={14} /> Start
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="ticket-messages" style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', background: '#f8fafc', borderRadius: '12px', marginBottom: '1.5rem' }}>
                                <div className="msg-bubble user" style={{ marginBottom: '1.5rem', display: 'flex', flexDirection: 'column' }}>
                                    <div style={{ background: 'white', padding: '1rem 1.5rem', borderRadius: '12px 12px 12px 0', border: '1px solid var(--border)', maxWidth: '85%', boxShadow: 'var(--shadow-sm)' }}>
                                        <p style={{ margin: 0, fontSize: '1rem', color: 'var(--text)' }}>{selectedTicket.message}</p>
                                    </div>
                                    <small style={{ marginTop: '0.4rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{new Date(selectedTicket.createdAt).toLocaleString()}</small>
                                </div>

                                {selectedTicket.responses?.map((res, i) => (
                                    <div key={i} className={`msg-bubble ${res.userRole === 'admin' ? 'admin' : 'user'}`} style={{ marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: res.userRole === 'admin' ? 'flex-end' : 'flex-start' }}>
                                        <div style={{
                                            background: res.userRole === 'admin' ? 'var(--primary)' : 'white',
                                            color: res.userRole === 'admin' ? 'white' : 'var(--text)',
                                            padding: '1rem 1.5rem',
                                            borderRadius: res.userRole === 'admin' ? '12px 12px 0 12px' : '12px 12px 12px 0',
                                            border: res.userRole === 'admin' ? 'none' : '1px solid var(--border)',
                                            maxWidth: '85%',
                                            boxShadow: 'var(--shadow-sm)'
                                        }}>
                                            <p style={{ margin: 0, fontSize: '1rem' }}>{res.message}</p>
                                        </div>
                                        <small style={{ marginTop: '0.4rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                            {new Date(res.createdAt).toLocaleString()} - {res.userRole === 'admin' ? 'You' : res.userRole}
                                        </small>
                                    </div>
                                ))}
                            </div>

                            {selectedTicket.status !== 'resolved' && (
                                <div className="reply-box">
                                    <textarea
                                        className="form-control"
                                        placeholder="Type your official response..."
                                        value={reply}
                                        onChange={(e) => setReply(e.target.value)}
                                    />
                                    <button onClick={handleSendReply} className="btn btn-primary" style={{ flexShrink: 0 }}>
                                        <Send size={18} />
                                    </button>
                                </div>
                            )}
                        </>
                    ) : (
                        <AdminEmptyState
                            icon={MessageSquare}
                            title="Select a ticket"
                            message="Choose a support request from the left list to view the full conversation and respond."
                        />
                    )}
                </div>
            </div>
        </div >
    );
};

export default AdminMessages;
