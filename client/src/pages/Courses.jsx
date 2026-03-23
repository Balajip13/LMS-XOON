import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Search } from 'lucide-react';

const Courses = () => {
    const { api } = useAuth();
    const [courses, setCourses] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [courseRes, catRes] = await Promise.all([
                    api.get('/courses'),
                    api.get('/categories')
                ]);

                setCourses(courseRes.data?.courses || courseRes.data || []);
                setCategories(catRes.data?.categories || []);

            } catch (err) {
                console.error('Error fetching data:', err.response?.data || err.message);
                setCourses([]);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [api]);

    // Combined filter logic
    const filteredCourses = (courses || []).filter(course => {
        const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase());
        const categoryName = course.category?.name || course.category;
        const matchesCategory = selectedCategory === 'All' || categoryName === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="container" style={{ padding: '4rem 1.5rem' }}>
            <div style={{ marginBottom: '3rem', textAlign: 'center' }}>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>Explore Our Courses</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Master new skills with our professional-led curriculum</p>
            </div>

            {/* Search Bar Refined */}
            <div className="search-wrapper">
                <div className="search-icon">
                    <Search size={20} />
                </div>
                <input 
                    type="text"
                    placeholder="Search courses by title..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Category Filters Refined */}
            <div className="category-scroll">
                <button 
                    onClick={() => setSelectedCategory('All')}
                    className={selectedCategory === 'All' ? 'active' : ''}
                >
                    All
                </button>
                {categories.map(cat => (
                    <button
                        key={cat._id}
                        onClick={() => setSelectedCategory(cat.name)}
                        className={selectedCategory === cat.name ? 'active' : ''}
                    >
                        {cat.name}
                    </button>
                ))}
            </div>

            {/* Course Grid */}
            {loading ? (
                <div className="course-grid">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="course-card" style={{ minHeight: '380px', opacity: 0.5, backgroundColor: 'var(--surface-hover)' }}></div>
                    ))}
                </div>
            ) : filteredCourses.length > 0 ? (
                <div className="course-grid">
                    {filteredCourses.map(course => (
                        <Link key={course._id} to={`/course/${course._id}`} className="course-card">
                            <div className="course-card-image-wrapper">
                                <img 
                                    src={course.thumbnailUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=2070&auto=format&fit=crop'} 
                                    alt={course.title} 
                                    className="course-card-image"
                                />
                            </div>
                            <div className="course-card-content">
                                <span className="course-card-category">{course.category?.name || 'Education'}</span>
                                <h3 className="course-card-title">{course.title}</h3>
                                <p className="course-card-description">
                                    {course.description || 'Premium course by industry leading instructors...'}
                                </p>
                                <div className="course-card-footer">
                                    <span className="course-card-price">₹{course.price || 'Free'}</span>
                                    <span className="course-card-btn">View Course</span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            ) : (
                <div style={{ textAlign: 'center', padding: '4rem' }}>
                    <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)' }}>No courses found matching your criteria.</p>
                </div>
            )}
        </div>
    );
};

export default Courses;