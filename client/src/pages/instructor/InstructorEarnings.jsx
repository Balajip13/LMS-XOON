import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Loader2, IndianRupee, TrendingUp, Calendar, CreditCard, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';

const InstructorEarnings = () => {
    const { api } = useAuth();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);

    useEffect(() => {
        fetchEarnings();
    }, []);

    const fetchEarnings = async () => {
        try {
            const res = await api.get('/instructor/earnings');
            if (res.data.success) {
                setData(res.data.data);
            }
        } catch (error) {
            toast.error('Failed to load earnings data');
        } finally {
            setLoading(false);
        }
    };

    if (loading || !data) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <Loader2 className="animate-spin" size={40} color="var(--primary)" />
            </div>
        );
    }

    const { totalRevenue, paymentHistory, chartData } = data;

    // A simple CSS bar chart approach since we don't have Recharts installed natively
    const maxMonthly = Math.max(...chartData.monthly.map(d => d.revenue), 1); // avoid /0

    return (
        <div className="instructor-page-container">
            <div className="instructor-page-header">
                <div>
                    <h1 className="instructor-page-title">Earnings & Payouts</h1>
                    <p className="instructor-page-subtitle">Track your revenue, view detailed reports, and manage payouts.</p>
                </div>
            </div>

            {/* Top Cards */}
            <div className="revenue-stats-grid">
                <div className="card revenue-stat-card animate-in">
                    <div className="stat-card-content">
                        <p className="stat-card-label">Lifetime Revenue</p>
                        <h2 className="stat-card-value">₹{totalRevenue.toLocaleString()}</h2>
                    </div>
                    <div className="stat-card-icon-box success-light">
                        <IndianRupee size={24} />
                    </div>
                </div>

                <div className="card revenue-stat-card animate-in" style={{ animationDelay: '0.1s' }}>
                    <div className="stat-card-content">
                        <p className="stat-card-label">This Month's Revenue</p>
                        <h2 className="stat-card-value">
                            ₹{chartData.monthly[chartData.monthly.length - 1]?.revenue.toLocaleString() || 0}
                        </h2>
                    </div>
                    <div className="stat-card-icon-box primary-light">
                        <TrendingUp size={24} />
                    </div>
                </div>
            </div>

            <div className="earnings-content-layout">
                {/* Visual Chart (CSS Custom) */}
                <div className="card chart-card animate-in" style={{ animationDelay: '0.2s' }}>
                    <div className="card-header-flex instructor-card-header">
                        <h3 className="card-header-title">Revenue Trends (Last 6 Months)</h3>
                    </div>
                    <div className="chart-container-wrapper">
                        <div className="chart-canvas-mock">
                            <div className="chart-y-axis">
                                <span>₹{maxMonthly > 1000 ? (maxMonthly / 1000).toFixed(0) + 'k' : maxMonthly}</span>
                                <span>₹{(maxMonthly / 2) > 1000 ? (maxMonthly / 2000).toFixed(0) + 'k' : (maxMonthly / 2).toFixed(0)}</span>
                                <span>0</span>
                            </div>
                            <div className="chart-bars-area">
                                {chartData.monthly.map((m, i) => (
                                    <div key={i} className="chart-column-group">
                                        <div className="chart-bar-container">
                                            <div
                                                className="chart-bar-fill"
                                                style={{ height: `${(m.revenue / maxMonthly) * 100}%` }}
                                            >
                                                <div className="chart-bar-tooltip">
                                                    ₹{m.revenue.toLocaleString()}
                                                </div>
                                            </div>
                                        </div>
                                        <span className="chart-column-label">{m.month}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* detailed History table */}
                <div className="card instructor-section-card animate-in" style={{ animationDelay: '0.3s', padding: '0', overflow: 'hidden' }}>
                    <div className="card-header-flex instructor-card-header">
                        <h3 className="card-header-title">Recent Transactions</h3>
                    </div>
                    {paymentHistory.length === 0 ? (
                        <div className="empty-state-container">
                            <div className="empty-state-content">
                                <div className="empty-state-icon-wrapper">
                                    <CreditCard size={48} />
                                </div>
                                <h3 className="empty-state-title">No transactions found</h3>
                                <p className="empty-state-text">You haven't received any payments yet.</p>
                            </div>
                        </div>
                    ) : (
                        <div className="table-responsive-wrapper" style={{ overflowX: 'auto' }}>
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Transaction ID</th>
                                        <th>Date</th>
                                        <th>Student</th>
                                        <th>Course</th>
                                        <th style={{ textAlign: 'right' }}>Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paymentHistory.map((payment) => (
                                        <tr key={payment.id}>
                                            <td>
                                                <code className="transaction-id-badge" style={{ whiteSpace: 'nowrap' }}>
                                                    #{payment.transactionId || payment.id.substring(0, 8)}
                                                </code>
                                            </td>
                                            <td>
                                                <div className="date-display" style={{ whiteSpace: 'nowrap' }}>
                                                    <Calendar size={14} />
                                                    {new Date(payment.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </div>
                                            </td>
                                            <td className="font-semibold">{payment.student}</td>
                                            <td>
                                                <span className="course-pill" style={{ display: 'inline-block', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    {payment.course}
                                                </span>
                                            </td>
                                            <td className="transaction-amount-cell">
                                                + ₹{payment.amount.toLocaleString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

};

export default InstructorEarnings;
