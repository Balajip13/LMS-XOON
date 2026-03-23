import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, Search, Filter, BookOpen, ArrowRight } from 'lucide-react';
import { getPricingData } from '../../utils/pricing';
import { useAuth } from '../../context/AuthContext';

const StudentCourseList = () => {
    const { api } = useAuth();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');

    const categories = ['All', 'Web Dev', 'Programming', 'Data Science', 'Marketing', 'DevOps', 'Cloud Computing', 'UI/UX'];

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const { data } = await api.get('/courses');
                setCourses(data.courses || []);
            } catch (err) {
                console.error('Failed to fetch courses:', err);
                setCourses([]);
            } finally {
                setLoading(false);
            }
        };

        fetchCourses();
    }, [api]);

    const filteredCourses = (courses || []).filter(course => {
        const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase());
        const courseCategoryName = course.category?.name || course.category;
        const matchesCategory = selectedCategory === 'All' || courseCategoryName === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}>
                <div className="loading-spinner">Loading courses...</div>
            </div>
        );
    }

    return (
        <div className="animate-in fade-in duration-500">
            {/* Search and Filter Header */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '2.5rem',
                gap: '1.5rem',
                flexWrap: 'wrap'
            }}>
                <div style={{ position: 'relative', flex: 1, minWidth: '300px' }}>
                    <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                    <input
                        type="text"
                        placeholder="Search for new courses to learn..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '0.75rem 1rem 0.75rem 2.75rem',
                            borderRadius: '12px',
                            border: '1px solid var(--border)',
                            backgroundColor: 'var(--surface)',
                            outline: 'none',
                            fontSize: '0.9rem'
                        }}
                    />
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', marginRight: '0.5rem' }}>
                        <Filter size={16} />
                        <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>Filter:</span>
                    </div>
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            style={{
                                whiteSpace: 'nowrap',
                                borderRadius: '100px',
                                padding: '0.4rem 1rem',
                                fontSize: '0.85rem',
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                border: '1px solid',
                                borderColor: selectedCategory === cat ? 'var(--primary)' : 'var(--border)',
                                backgroundColor: selectedCategory === cat ? 'var(--primary)' : 'var(--surface)',
                                color: selectedCategory === cat ? 'white' : 'var(--text-secondary)'
                            }}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Course Grid */}
            {filteredCourses.length > 0 ? (
                <div className="course-grid">
                    {filteredCourses.map((course) => {
                        const pricing = getPricingData(course);
                        return (
                            <Link to={`/student/course/${course._id}/preview`} key={course._id} className="course-card">
                                <div className="course-card-image-wrapper">
                                    <img
                                        src={course.thumbnailUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'}
                                        alt={course.title}
                                        className="course-card-image"
                                    />
                                    <div style={{ position: 'absolute', top: '0.75rem', left: '0.75rem' }}>
                                        <span style={{
                                            backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                            color: 'var(--primary)',
                                            padding: '0.35rem 0.75rem',
                                            borderRadius: '100px',
                                            fontSize: '0.7rem',
                                            fontWeight: '700',
                                            backdropFilter: 'blur(4px)',
                                            boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
                                        }}>
                                            {(course.category?.name || course.category) || 'General'}
                                        </span>
                                    </div>
                                </div>

                                <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flex: 1, gap: '1rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#fbbf24' }}>
                                            <Star size={14} fill="#fbbf24" />
                                            <span style={{ fontSize: '0.85rem', fontWeight: '700' }}>{course.rating || '0.0'}</span>
                                        </div>
                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                            {course.studentsEnrolled || 0} students
                                        </span>
                                    </div>

                                    <h3 style={{
                                        fontSize: '1.1rem',
                                        fontWeight: '700',
                                        lineHeight: '1.4',
                                        margin: 0,
                                        height: '2.8em',
                                        overflow: 'hidden',
                                        display: '-webkit-box',
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: 'vertical'
                                    }}>
                                        {course.title}
                                    </h3>

                                    <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem' }}>
                                            {pricing.hasDiscount && (
                                                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                                                    {pricing.displayOriginalPrice}
                                                </span>
                                            )}
                                            <span style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text)' }}>
                                                {pricing.displayPrice}
                                            </span>
                                        </div>
                                        <div style={{ color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: '700', fontSize: '0.85rem' }}>
                                            View Details <ArrowRight size={14} />
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            ) : (
                <div style={{ textAlign: 'center', padding: '5rem 2rem', backgroundColor: 'var(--surface)', borderRadius: '16px', border: '1px solid var(--border)' }}>
                    <div style={{ width: '60px', height: '60px', backgroundColor: 'var(--surface-hover)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                        <Search size={24} color="var(--text-muted)" />
                    </div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '0.5rem' }}>No results found</h3>
                    <p style={{ color: 'var(--text-secondary)' }}>Try adjusting your search or filters to find what you're looking for.</p>
                </div>
            )}

            <style>{`
                .course-explorer-card:hover {
                    transform: translateY(-5px);
                    box-shadow: var(--shadow-md) !important;
                    border-color: var(--primary) !important;
                }
            `}</style>
        </div>
    );
};

export default StudentCourseList;
