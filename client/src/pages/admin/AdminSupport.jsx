import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Mail, Send, Download, Trash2, Phone, Calendar } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useAuth } from '../../context/AuthContext';

const AdminSupport = () => {
    const { api } = useAuth();
    const [activeTab, setActiveTab] = useState('contact');
    const [messages, setMessages] = useState([]);
    const [subscribers, setSubscribers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        setLoading(true);
        try {
            if (activeTab === 'contact') {
                const { data } = await api.get('/support/contact');
                setMessages(data);
            } else {
                const { data } = await api.get('/support/newsletter');
                setSubscribers(data);
            }
        } catch (error) {
            console.error('AdminSupport Fetch Error:', error);
            if (error.code === 'ERR_NETWORK') {
                toast.error('Network Error: Check console/server');
            }
            const message = error.response?.data?.message || 'Failed to fetch data';
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this item?')) return;
        try {
            const endpoint = activeTab === 'contact' ? 'contact' : 'newsletter';
            await api.delete(`/support/${endpoint}/${id}`);
            toast.success('Deleted successfully');
            fetchData();
        } catch (error) {
            toast.error('Failed to delete');
        }
    };

    const exportCSV = () => {
        const data = activeTab === 'contact' ? messages : subscribers;
        if (!data.length) return toast.error('No data to export');

        const headers = activeTab === 'contact'
            ? ['Name', 'Email', 'Mobile', 'Message', 'Date']
            : ['Email', 'Subscribed Date'];

        const rows = data.map(item => activeTab === 'contact'
            ? [item.name, item.email, item.mobile, `"${item.message.replace(/"/g, '""')}"`, new Date(item.createdAt).toLocaleDateString()]
            : [item.email, new Date(item.createdAt).toLocaleDateString()]
        );

        const csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(",") + "\n"
            + rows.map(e => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `${activeTab}_export_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const exportPDF = () => {
        const data = activeTab === 'contact' ? messages : subscribers;
        if (!data.length) return toast.error('No data to export');

        try {
            const doc = new jsPDF();
            doc.text(`${activeTab === 'contact' ? 'Contact Messages' : 'Newsletter Subscribers'} Report`, 14, 20);
            doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 30);

            const tableColumn = activeTab === 'contact'
                ? ["Name", "Email", "Mobile", "Date", "Message"]
                : ["Email", "Date"];

            const tableRows = data.map(item => activeTab === 'contact'
                ? [item.name, item.email, item.mobile, new Date(item.createdAt).toLocaleDateString(), item.message]
                : [item.email, new Date(item.createdAt).toLocaleDateString()]
            );

            autoTable(doc, {
                startY: 40,
                head: [tableColumn],
                body: tableRows,
                theme: 'grid',
                styles: { fontSize: 8 },
                columnStyles: activeTab === 'contact' ? { 4: { cellWidth: 60 } } : {}
            });

            doc.save(`${activeTab}_export_${new Date().toISOString().split('T')[0]}.pdf`);
        } catch (error) {
            console.error('Export PDF Error:', error);
            toast.error('Export Failed: ' + (error.message || error));
        }
    };

    return (
        <div className="admin-page-container">
            <style>{`
                .support-header {
                    margin-bottom: 2rem;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    flex-wrap: wrap;
                    gap: 1rem;
                }
                .support-header-titles {
                    margin-bottom: 0;
                }
                .support-export-buttons {
                    display: flex;
                    flex-direction: row;
                    gap: 0.75rem;
                    align-items: center;
                    flex-wrap: wrap;
                }
                @media (max-width: 576px) {
                    .support-header {
                        flex-direction: column;
                        align-items: flex-start;
                    }
                }
                .support-export-buttons .btn {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                    padding: 0.55rem 1.5rem;
                    font-size: 0.875rem;
                    min-width: 100px;
                }
                .support-tabs {
                    display: flex;
                    gap: 2rem; /* Equal spacing between tabs */
                    border-bottom: 2px solid var(--border);
                    margin-bottom: 2rem;
                    overflow-x: auto;
                    -webkit-overflow-scrolling: touch;
                    scrollbar-width: none;
                }
                .support-tabs::-webkit-scrollbar { display: none; }
                .support-tab-btn {
                    padding: 0.85rem 0.5rem;
                    background: none;
                    border: none;
                    border-bottom: 3px solid transparent;
                    margin-bottom: -2px;
                    display: inline-flex; /* Fixes icon/text alignment */
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                    font-size: 0.95rem;
                    font-weight: 500;
                    color: var(--text-secondary);
                    cursor: pointer;
                    white-space: nowrap;
                    transition: color 0.2s, border-color 0.2s;
                }
                .support-tab-btn.active {
                    color: var(--primary);
                    border-bottom-color: var(--primary);
                    font-weight: 700;
                }
                .support-tab-btn:hover:not(.active) {
                    color: var(--text);
                }
                
                /* Contact Card Styling */
                .contact-card {
                    background: var(--surface);
                    border: 1px solid var(--border);
                    border-radius: 12px;
                    padding: 1.5rem;
                    display: flex;
                    flex-direction: column;
                    gap: 1.25rem;
                }
                .contact-card-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    flex-wrap: wrap;
                    gap: 1rem;
                }
                .contact-card-name {
                    font-size: 1.15rem;
                    font-weight: 700;
                    color: var(--text);
                    margin: 0;
                }
                .contact-card-date {
                    font-size: 0.85rem;
                    color: var(--text-secondary);
                    font-weight: 500;
                }
                .contact-card-contact-info {
                    display: flex;
                    align-items: center;
                    gap: 1.5rem;
                    flex-wrap: wrap;
                    color: var(--text-secondary);
                    font-size: 0.95rem;
                }
                .contact-card-contact-info span {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.4rem;
                }
                .contact-card-message {
                    padding: 1.25rem;
                    background: var(--background);
                    border-radius: 8px;
                    border: 1px solid var(--border);
                    color: var(--text);
                    line-height: 1.6;
                    font-size: 0.95rem;
                    word-break: break-word;
                }
                .contact-card-actions {
                    display: flex;
                    justify-content: flex-end;
                }
                
                /* Newsletter Table Styling */
                .newsletter-table-wrap {
                    background: var(--surface);
                    border-radius: 12px;
                    border: 1px solid var(--border);
                    overflow-x: auto;
                }
                .newsletter-table {
                    width: 100%;
                    border-collapse: collapse;
                    min-width: 360px;
                }
                .newsletter-table thead tr {
                    background: var(--background);
                    border-bottom: 1px solid var(--border);
                }
                .newsletter-table th {
                    padding: 1rem 1.25rem;
                    text-align: left;
                    font-weight: 600;
                    font-size: 0.85rem;
                    color: var(--text-secondary);
                    text-transform: uppercase;
                    letter-spacing: 0.04em;
                }
                .newsletter-table td {
                    padding: 1rem 1.25rem;
                    border-bottom: 1px solid var(--border);
                    vertical-align: middle;
                }
                .newsletter-table tbody tr:last-child td { border-bottom: none; }
                .newsletter-table tbody tr:hover { background: var(--surface-hover); }
            `}</style>

            {/* ── Header ── */}
            <div className="support-header">
                <div className="support-header-titles">
                    <h1 className="admin-page-title">Support Center</h1>
                </div>
                <div className="support-export-buttons">
                    <button onClick={exportCSV} className="btn btn-outline">
                        <Download size={15} /> CSV
                    </button>
                    <button onClick={exportPDF} className="btn btn-primary">
                        <Download size={15} /> PDF
                    </button>
                </div>
            </div>

            {/* ── Tabs ── */}
            <div className="support-tabs">
                <button
                    className={`support-tab-btn ${activeTab === 'contact' ? 'active' : ''}`}
                    onClick={() => setActiveTab('contact')}
                >
                    <Mail size={17} /> Contact Messages
                </button>
                <button
                    className={`support-tab-btn ${activeTab === 'newsletter' ? 'active' : ''}`}
                    onClick={() => setActiveTab('newsletter')}
                >
                    <Send size={17} /> Newsletter Subscribers
                </button>
            </div>

            {/* ── Content ── */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
                    Loading...
                </div>
            ) : (
                <>
                    {activeTab === 'contact' ? (
                        <div style={{ display: 'grid', gap: '1.25rem' }}>
                            {messages.length === 0 ? (
                                <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '3rem' }}>
                                    No messages found.
                                </p>
                            ) : messages.map((msg) => (
                                <div key={msg._id} className="contact-card">
                                    <div className="contact-card-header">
                                        <h3 className="contact-card-name">{msg.name}</h3>
                                        <span className="contact-card-date">{new Date(msg.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <div className="contact-card-contact-info">
                                        <span><Mail size={15} /> {msg.email}</span>
                                        <span><Phone size={15} /> {msg.mobile}</span>
                                    </div>
                                    <div className="contact-card-message">
                                        {msg.message}
                                    </div>
                                    <div className="contact-card-actions">
                                        <button
                                            onClick={() => handleDelete(msg._id)}
                                            style={{
                                                padding: '0.5rem 1rem',
                                                color: '#ef4444',
                                                background: 'rgba(239, 68, 68, 0.1)',
                                                border: 'none',
                                                borderRadius: '8px',
                                                cursor: 'pointer',
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '0.4rem',
                                                fontSize: '0.85rem',
                                                fontWeight: 600,
                                                transition: 'background 0.2s'
                                            }}
                                            onMouseOver={(e) => e.target.style.background = 'rgba(239, 68, 68, 0.2)'}
                                            onMouseOut={(e) => e.target.style.background = 'rgba(239, 68, 68, 0.1)'}
                                            title="Delete Message"
                                        >
                                            <Trash2 size={15} /> Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="newsletter-table-wrap">
                            <table className="newsletter-table">
                                <thead>
                                    <tr>
                                        <th>Email Address</th>
                                        <th>Subscriber Date</th>
                                        <th style={{ textAlign: 'right' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {subscribers.length === 0 ? (
                                        <tr>
                                            <td colSpan="3" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                                                No subscribers yet.
                                            </td>
                                        </tr>
                                    ) : subscribers.map((sub) => (
                                        <tr key={sub._id}>
                                            <td style={{ color: 'var(--text)', fontWeight: 500 }}>{sub.email}</td>
                                            <td style={{ color: 'var(--text-secondary)' }}>
                                                {new Date(sub.createdAt).toLocaleDateString()}
                                            </td>
                                            <td style={{ textAlign: 'right' }}>
                                                <button
                                                    onClick={() => handleDelete(sub._id)}
                                                    style={{
                                                        padding: '0.5rem',
                                                        background: 'rgba(239,68,68,0.1)',
                                                        border: 'none',
                                                        borderRadius: '8px',
                                                        color: '#ef4444',
                                                        cursor: 'pointer',
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        transition: 'background 0.2s'
                                                    }}
                                                    onMouseOver={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'}
                                                    onMouseOut={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
                                                    title="Remove Subscriber"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default AdminSupport;

