import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Trash2, Mail, Phone, Calendar } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const AdminContacts = () => {
    const { api } = useAuth();
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchMessages = async () => {
        try {
            const response = await api.get('/support/contact');
            setMessages(response.data);
        } catch (error) {
            toast.error('Failed to fetch messages');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMessages();
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this message?')) return;
        try {
            await api.delete(`/support/contact/${id}`);
            toast.success('Message deleted successfully');
            setMessages(messages.filter(msg => msg._id !== id));
        } catch (error) {
            toast.error('Failed to delete message');
        }
    };

    if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading messages...</div>;

    return (
        <div style={{ padding: '2rem' }}>
            <h1 style={{ fontSize: '1.8rem', fontWeight: '700', marginBottom: '2rem', color: 'var(--text)' }}>Contact Messages</h1>

            {messages.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)', backgroundColor: 'var(--surface)', borderRadius: '12px' }}>
                    <Mail size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                    <h3>No messages yet</h3>
                </div>
            ) : (
                <div style={{ display: 'grid', gap: '1.5rem' }}>
                    {messages.map((msg) => (
                        <div key={msg._id} className="card" style={{ padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border)', backgroundColor: 'var(--surface)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                <div>
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: 'var(--text)' }}>{msg.name}</h3>
                                    <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Mail size={14} /> {msg.email}</span>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Phone size={14} /> {msg.mobile}</span>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Calendar size={14} /> {new Date(msg.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleDelete(msg._id)}
                                    style={{
                                        padding: '0.5rem',
                                        color: '#ef4444',
                                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                        border: 'none',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                    title="Delete Message"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                            <div style={{ padding: '1rem', backgroundColor: 'var(--background)', borderRadius: '8px', color: 'var(--text)', lineHeight: '1.5' }}>
                                {msg.message}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AdminContacts;
