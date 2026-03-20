import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Loader2, TrendingUp, BarChart3, Activity, Star, Users, IndianRupee } from 'lucide-react';
import toast from 'react-hot-toast';

const InstructorReports = () => {
    const { api } = useAuth();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        try {
            setLoading(true);
            const res = await api.get('/instructor/reports');
            if (res.data.success) {
                setData(res.data.data);
            }
        } catch (error) {
            toast.error('Failed to load reports data');
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

    const { revenueTrend, studentGrowth, coursePerformance } = data;
    const maxStudents = Math.max(...studentGrowth.map(d => d.count), 1);
    const maxRevenue = Math.max(...revenueTrend.map(d => d.revenue), 1);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '0.4rem' }}>Analytics & Reports</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Detailed insights into your course performance and student growth.</p>
                </div>
            </div>

            <div className="admin-grid-2">
                {/* Student Growth Chart */}
                <div className="card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                        <Users size={20} color="var(--primary)" />
                        <h3 style={{ fontSize: '1.1rem', fontWeight: '600' }}>Student Growth (Last 6 Months)</h3>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '10%', height: '200px', padding: '1rem 0', borderBottom: '1px solid var(--border)' }}>
                        {studentGrowth.map((m, i) => (
                            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                                <div style={{
                                    width: '100%',
                                    maxWidth: '40px',
                                    height: `${(m.count / maxStudents) * 100}%`,
                                    minHeight: m.count > 0 ? '10px' : '2px',
                                    backgroundColor: 'var(--primary)',
                                    borderRadius: '4px 4px 0 0',
                                    opacity: 0.9,
                                    position: 'relative'
                                }}>
                                    {m.count > 0 && <span style={{ position: 'absolute', top: '-20px', left: '50%', transform: 'translateX(-50%)', fontSize: '0.75rem', fontWeight: '600' }}>{m.count}</span>}
                                </div>
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>{m.month}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Revenue Trend Chart */}
                <div className="card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                        <TrendingUp size={20} color="var(--success)" />
                        <h3 style={{ fontSize: '1.1rem', fontWeight: '600' }}>Daily Revenue (Last 30 Days)</h3>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '2px', height: '200px', padding: '1rem 0', borderBottom: '1px solid var(--border)' }}>
                        {revenueTrend.length === 0 ? (
                            <p style={{ width: '100%', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>No revenue data for this period.</p>
                        ) : revenueTrend.map((d, i) => (
                            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                                <div
                                    title={`${d.date}: ₹${d.revenue}`}
                                    style={{
                                        width: '100%',
                                        height: `${(d.revenue / maxRevenue) * 100}%`,
                                        minHeight: d.revenue > 0 ? '1px' : '0px',
                                        backgroundColor: 'var(--success)',
                                        borderRadius: '1px 1px 0 0',
                                        opacity: 0.7
                                    }}
                                />
                            </div>
                        ))}
                    </div>
                    {revenueTrend.length > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                            <span>{revenueTrend[0].date}</span>
                            <span>{revenueTrend[revenueTrend.length - 1].date}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Course Comparison Table */}
            <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
                <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <BarChart3 size={20} color="var(--primary)" />
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '600' }}>Course Performance Summary</h3>
                </div>
                <div className="table-container">
                    <table className="admin-table responsive-table-stack">
                        <thead style={{ backgroundColor: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }}>
                            <tr>
                                <th style={{ padding: '1rem 1.5rem', fontWeight: '600', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>COURSE</th>
                                <th style={{ padding: '1rem 1.5rem', fontWeight: '600', color: 'var(--text-secondary)', textAlign: 'center', fontSize: '0.85rem' }}>STUDENTS</th>
                                <th style={{ padding: '1rem 1.5rem', fontWeight: '600', color: 'var(--text-secondary)', textAlign: 'center', fontSize: '0.85rem' }}>REVENUE</th>
                                <th style={{ padding: '1rem 1.5rem', fontWeight: '600', color: 'var(--text-secondary)', textAlign: 'center', fontSize: '0.85rem' }}>RATING</th>
                            </tr>
                        </thead>
                        <tbody>
                            {coursePerformance.map((course, index) => (
                                <tr key={index}>
                                    <td data-label="Course" style={{ fontWeight: '600' }}>{course.title}</td>
                                    <td data-label="Students" style={{ textAlign: 'center' }}>
                                        <span style={{ color: 'var(--primary)', padding: '0.25rem 0.5rem', backgroundColor: 'rgba(59, 130, 246, 0.05)', borderRadius: '4px', fontWeight: '600' }}>
                                            {course.students}
                                        </span>
                                    </td>
                                    <td data-label="Revenue" style={{ textAlign: 'center', fontWeight: '600', color: 'var(--success)' }}>₹{course.revenue.toLocaleString()}</td>
                                    <td data-label="Rating" style={{ textAlign: 'center' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}>
                                            <Star size={14} fill="#fbbf24" color="#fbbf24" />
                                            <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{course.rating.toFixed(1)}</span>
                                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>({course.reviews})</span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default InstructorReports;
