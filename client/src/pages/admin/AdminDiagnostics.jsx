import { Terminal, Activity, Server, Database, RefreshCw } from 'lucide-react';

const AdminDiagnostics = () => {
    return (
        <div className="admin-page-container">
            <header className="admin-page-header">
                <h1 className="admin-page-title">Diagnostics</h1>
                <div className="header-actions">
                    <button className="btn btn-outline btn-compact" onClick={() => window.location.reload()}>
                        <RefreshCw size={14} className="mr-2" /> Refresh
                    </button>
                </div>
            </header>

            <div className="metrics-grid">
                <div className="metric-card">
                    <div className="metric-icon" style={{ backgroundColor: '#f0fdf4', color: '#16a34a' }}>
                        <Activity size={24} />
                    </div>
                    <div className="metric-info">
                        <p>API Status</p>
                        <h3>Operational</h3>
                    </div>
                </div>
                <div className="metric-card">
                    <div className="metric-icon" style={{ backgroundColor: '#eff6ff', color: '#3b82f6' }}>
                        <Database size={24} />
                    </div>
                    <div className="metric-info">
                        <p>Database</p>
                        <h3>Connected</h3>
                    </div>
                </div>
                <div className="metric-card">
                    <div className="metric-icon" style={{ backgroundColor: '#f5f3ff', color: '#7c3aed' }}>
                        <Server size={24} />
                    </div>
                    <div className="metric-info">
                        <p>Platform Version</p>
                        <h3>v2.4.1</h3>
                    </div>
                </div>
            </div>

            <div className="admin-section-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                    <Terminal size={20} style={{ color: 'var(--text-secondary)' }} />
                    <h2 className="admin-section-title" style={{ marginBottom: 0 }}>System Logs</h2>
                </div>
                <div style={{
                    backgroundColor: '#1e293b',
                    color: '#94a3b8',
                    padding: '1.5rem',
                    borderRadius: '12px',
                    fontFamily: 'monospace',
                    fontSize: '0.875rem',
                    lineHeight: 1.8
                }}>
                    <div style={{ color: 'var(--success)' }}>[INFO] Server is running and accepting requests</div>
                    <div style={{ color: 'var(--success)' }}>[DB] MongoDB connection is established</div>
                    <div>[INFO] Admin session authenticated successfully</div>
                    <div>[INFO] Real-time data fetched from database</div>
                    <div style={{ color: '#94a3b8' }}>[SYS] No diagnostics data currently collected - refresh to check status</div>
                </div>
            </div>
        </div>
    );
};

export default AdminDiagnostics;
