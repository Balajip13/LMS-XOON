import { CreditCard, History, Download, Receipt } from 'lucide-react';

const Payments = ({ payments = [] }) => (
    <div className="animate-in fade-in duration-500" style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem', paddingBottom: '2rem' }}>
        <div>
            <h1 style={{ fontSize: '1.875rem', fontWeight: '700', color: 'var(--text)', marginBottom: '0.5rem' }}>Payments</h1>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>Manage your billing history and download invoices.</p>
        </div>

        <div style={{ backgroundColor: 'var(--surface)', borderRadius: '16px', border: '1px solid var(--border)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'var(--surface-hover)' }}>
                            <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Invoice</th>
                            <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Date</th>
                            <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Amount</th>
                            <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</th>
                            <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {payments.length > 0 ? payments.map((payment, idx) => (
                            <tr key={idx} style={{ borderBottom: idx === payments.length - 1 ? 'none' : '1px solid var(--border)', transition: 'background 0.2s' }} className="payment-row">
                                <td style={{ padding: '1.25rem 1.5rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'var(--surface-hover)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <Receipt size={16} />
                                        </div>
                                        <span style={{ fontWeight: '600', fontSize: '0.9rem' }}>{payment.course?.title || 'Course Purchase'}</span>
                                    </div>
                                </td>
                                <td style={{ padding: '1.25rem 1.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{new Date(payment.createdAt).toLocaleDateString()}</td>
                                <td style={{ padding: '1.25rem 1.5rem', fontWeight: '700', fontSize: '0.9rem' }}>₹{payment.amount}</td>
                                <td style={{ padding: '1.25rem 1.5rem' }}>
                                    <span style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '0.25rem 0.6rem', borderRadius: '100px', fontSize: '0.7rem', fontWeight: '700' }}>Success</span>
                                </td>
                                <td style={{ padding: '1.25rem 1.5rem' }}>
                                    <button style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: '600', cursor: 'pointer', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                        <Download size={14} /> PDF
                                    </button>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="5" style={{ padding: '5rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                                    <History size={48} style={{ opacity: 0.1, marginBottom: '1.5rem', margin: '0 auto' }} />
                                    <p style={{ margin: 0, fontWeight: '600', fontSize: '0.95rem' }}>No payment records found.</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>

        <style>{`
            .payment-row:hover {
                background-color: var(--surface-hover);
            }
        `}</style>
    </div>
);

export default Payments;
