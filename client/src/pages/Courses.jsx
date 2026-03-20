import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, Search } from 'lucide-react';
import { getPricingData } from '../utils/pricing';
import { useAuth } from '../context/AuthContext';

const Courses = () => {
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
                // API returns { courses, page, pages }
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

    return (
        <div className="container" style={{ padding: '2rem 1rem' }}>
            <h1 className="text-center mb-4">Explore Courses</h1>

            {/* Search and Filter */}
            <div className="card" style={{ marginBottom: '3rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ position: 'relative' }}>
                    <Search style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                    <input
                        type="text"
                        placeholder="Search for courses..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ paddingLeft: '3rem' }}
                    />
                </div>

                <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={selectedCategory === cat ? 'btn btn-primary' : 'btn btn-outline'}
                            style={{ whiteSpace: 'nowrap', borderRadius: '2rem', padding: '0.5rem 1.25rem' }}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="text-center">Loading courses...</div>
            ) : (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                    gap: '2rem'
                }}>
                    {filteredCourses.length > 0 ? filteredCourses.map((course) => (
                        <Link to={`/course/${course._id}`} key={course._id} className="card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', textDecoration: 'none', transition: 'transform 0.2s', border: '1px solid var(--border)', height: '100%' }}>
                            <div style={{ width: '100%', aspectRatio: '16/9', overflow: 'hidden', backgroundColor: '#f0f0f0' }}>
                                <img
                                    src={course.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'}
                                    alt={course.title}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'; }}
                                />
                            </div>
                            <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                                <div className="flex justify-between mb-2">
                                    <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--primary)', fontWeight: 'bold' }}>{(course.category?.name || course.category) || 'General'}</span>
                                    <div className="flex items-center gap-1" style={{ color: '#fbbf24', fontSize: '0.9rem' }}>
                                        <Star size={14} fill="#fbbf24" />
                                        <span>{course.rating || '0.0'}</span>
                                    </div>
                                </div>
                                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', lineHeight: '1.4', height: '2.8em', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                                    {course.title}
                                </h3>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 'auto', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                    {course.description || 'No description available for this course.'}
                                </p>
                                <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>By {course.instructor?.name || 'Unknown Instructor'}</p>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                                            {(() => {
                                                const pricing = getPricingData(course);
                                                return (
                                                    <>
                                                        {pricing.hasDiscount && (
                                                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                                                                {pricing.displayOriginalPrice}
                                                            </div>
                                                        )}
                                                        <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{pricing.displayPrice}</div>
                                                    </>
                                                );
                                            })()}
                                        </div>
                                        <span className="btn btn-sm btn-outline" style={{ fontSize: '0.85rem', padding: '0.4rem 1rem' }}>Preview</span>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    )) : (
                        <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                            No courses found matching your criteria.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Courses;
