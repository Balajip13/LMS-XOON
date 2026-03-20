import React from 'react';
import { Inbox, RefreshCw } from 'lucide-react';

const AdminEmptyState = ({
    icon: Icon = Inbox,
    title = "No data found",
    message = "There are no records to display at the moment.",
    onRefresh
}) => {
    return (
        <div className="admin-empty-state" style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '5rem 2rem',
            background: 'var(--surface)',
            borderRadius: '12px',
            textAlign: 'center'
        }}>
            <Icon size={64} style={{ color: 'var(--text-muted)', opacity: 0.3, marginBottom: '1.5rem' }} />
            <h3 style={{
                fontSize: '1.5rem',
                fontWeight: 700,
                color: 'var(--text)',
                marginBottom: '0.75rem'
            }}>{title}</h3>
            <p style={{
                color: 'var(--text-secondary)',
                marginBottom: '2.5rem',
                maxWidth: '460px',
                fontSize: '1.05rem',
                lineHeight: '1.6'
            }}>{message}</p>
            {onRefresh && (
                <button
                    onClick={onRefresh}
                    className="btn btn-primary"
                    style={{ padding: '0.8rem 2.5rem', fontSize: '1rem' }}
                >
                    <RefreshCw size={18} style={{ marginRight: '0.5rem' }} />
                    Refresh Data
                </button>
            )}
        </div>
    );
};

export default AdminEmptyState;
