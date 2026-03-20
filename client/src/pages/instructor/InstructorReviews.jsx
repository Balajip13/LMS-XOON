import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Loader2, Star, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';

const InstructorReviews = () => {
    const { api } = useAuth();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);

    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        try {
            const res = await api.get('/instructor/reviews');
            if (res.data.success) {
                setData(res.data.data);
            }
        } catch (error) {
            toast.error('Failed to load reviews data');
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

    const { totalReviews, avgRating, ratingDistribution, reviews } = data;

    const renderStars = (rating) => {
        return Array(5).fill(0).map((_, i) => (
            <Star key={i} size={16} fill={i < rating ? "#fbbf24" : "transparent"} color={i < rating ? "#fbbf24" : "var(--border)"} />
        ));
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '0.4rem' }}>Student Reviews</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>See what students are saying about your courses.</p>
                </div>
            </div>

            {/* Overview Card */}
            <div className="card reviews-overview-grid" style={{ padding: '2rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minWidth: '150px' }}>
                    <h2 style={{ fontSize: '3.5rem', fontWeight: '800', color: 'var(--text-primary)', lineHeight: '1' }}>{avgRating}</h2>
                    <div style={{ display: 'flex', gap: '0.2rem', margin: '0.5rem 0' }}>
                        {renderStars(Math.round(avgRating))}
                    </div>
                    <p style={{ color: 'var(--text-secondary)', fontWeight: '500' }}>Course Rating</p>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Based on {totalReviews} reviews</p>
                </div>

                <div style={{ flex: 1, minWidth: '250px', display: 'flex', flexDirection: 'column', gap: '0.5rem', justifyContent: 'center' }}>
                    {[5, 4, 3, 2, 1].map(stars => {
                        const count = ratingDistribution[stars] || 0;
                        const percentage = totalReviews === 0 ? 0 : (count / totalReviews) * 100;
                        return (
                            <div key={stars} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', width: '50px' }}>
                                    <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{stars}</span>
                                    <Star size={14} fill="#fbbf24" color="#fbbf24" />
                                </div>
                                <div style={{ flex: 1, height: '8px', backgroundColor: 'var(--bg-secondary)', borderRadius: '4px', overflow: 'hidden' }}>
                                    <div style={{ width: `${percentage}%`, height: '100%', backgroundColor: '#fbbf24', borderRadius: '4px' }}></div>
                                </div>
                                <span style={{ width: '40px', fontSize: '0.85rem', color: 'var(--text-secondary)', textAlign: 'right' }}>{percentage.toFixed(0)}%</span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Reviews List */}
            <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
                <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)' }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: '600' }}>All Reviews</h3>
                </div>
                {reviews.length === 0 ? (
                    <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                        <MessageSquare size={40} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                        <h3>No reviews yet</h3>
                        <p>When students leave reviews, they will appear here.</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        {reviews.map((review, index) => (
                            <div key={review.id} style={{
                                padding: '1.5rem',
                                borderBottom: index < reviews.length - 1 ? '1px solid var(--border)' : 'none',
                                display: 'flex',
                                gap: '1rem',
                                alignItems: 'flex-start'
                            }}>
                                <div style={{
                                    width: '48px', height: '48px', borderRadius: '50%', flexShrink: 0,
                                    backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '600',
                                    overflow: 'hidden', border: '1px solid var(--border)'
                                }}>
                                    {review.avatar ? (
                                        <img
                                            src={review.avatar}
                                            alt={review.student}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                                e.target.parentElement.innerText = review.student.charAt(0).toUpperCase();
                                            }}
                                        />
                                    ) : (
                                        review.student.charAt(0).toUpperCase()
                                    )}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.25rem' }}>
                                        <h4 style={{ fontSize: '1.05rem', fontWeight: '600', color: 'var(--text-primary)' }}>{review.student}</h4>
                                        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                            {new Date(review.date).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.2rem', marginBottom: '0.75rem' }}>
                                        {renderStars(review.rating)}
                                    </div>
                                    <p style={{ color: 'var(--text-primary)', lineHeight: '1.5', fontSize: '0.95rem', marginBottom: '0.75rem' }}>
                                        {review.comment}
                                    </p>
                                    <span style={{
                                        backgroundColor: 'var(--background)', padding: '0.3rem 0.6rem',
                                        borderRadius: '4px', fontSize: '0.8rem', color: 'var(--primary)',
                                        border: '1px solid var(--border)'
                                    }}>
                                        Course: {review.course}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default InstructorReviews;
