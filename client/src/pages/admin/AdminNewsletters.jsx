import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Trash2, Mail, Calendar } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const AdminNewsletters = () => {
    const { api } = useAuth();
    const [subscribers, setSubscribers] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchSubscribers = async () => {
        try {
            const response = await api.get('/support/newsletter');
            setSubscribers(response.data);
        } catch (error) {
            toast.error('Failed to fetch subscribers');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSubscribers();
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to remove this subscriber?')) return;
        try {
            await api.delete(`/support/newsletter/${id}`);
            toast.success('Subscriber removed successfully');
            setSubscribers(subscribers.filter(sub => sub._id !== id));
        } catch (error) {
            toast.error('Failed to remove subscriber');
        }
    };

    if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading subscribers...</div>;

    return (
        <div style={{ padding: '2rem' }}>
            <h1 style={{ fontSize: '1.8rem', fontWeight: '700', marginBottom: '2rem', color: 'var(--text)' }}>Newsletter Subscribers</h1>

            {subscribers.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)', backgroundColor: 'var(--surface)', borderRadius: '12px' }}>
                    <Mail size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                    <h3>No subscribers yet</h3>
                </div>
            ) : (
                <div style={{ backgroundColor: 'var(--surface)', borderRadius: '12px', border: '1px solid var(--border)', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'var(--background)' }}>
                                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: 'var(--text-secondary)' }}>Email Address</th>
                                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: 'var(--text-secondary)' }}>Subscribed Date</th>
                                <th style={{ padding: '1rem', textAlign: 'right', fontWeight: '600', color: 'var(--text-secondary)' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {subscribers.map((sub) => (
                                <tr key={sub._id} style={{ borderBottom: '1px solid var(--border)' }}>
                                    <td style={{ padding: '1rem', color: 'var(--text)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <Mail size={16} color="var(--primary)" />
                                            {sub.email}
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>
                                        {new Date(sub.createdAt).toLocaleDateString()}
                                    </td>
                                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                                        <button
                                            onClick={() => handleDelete(sub._id)}
                                            style={{
                                                padding: '0.5rem',
                                                color: '#ef4444',
                                                backgroundColor: 'transparent',
                                                border: 'none',
                                                cursor: 'pointer',
                                                transition: 'color 0.2s'
                                            }}
                                            title="Remove Subscriber"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default AdminNewsletters;
