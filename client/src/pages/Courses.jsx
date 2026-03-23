import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Courses = () => {
    const { api } = useAuth();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const { data } = await api.get('/courses');

                // ✅ FIXED LINE
                setCourses(data?.courses || data || []);

            } catch (err) {
                console.error('Error fetching courses:', err.response?.data || err.message);
                setCourses([]);
            } finally {
                setLoading(false);
            }
        };

        fetchCourses();
    }, [api]);

    return (
        <div className="container" style={{ padding: '4rem 1.5rem' }}>
            <div style={{ marginBottom: '3rem', textAlign: 'center' }}>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>Explore Our Courses</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Master new skills with our professional-led curriculum</p>
            </div>

            {loading ? (
                <div className="course-grid">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="course-card" style={{ minHeight: '380px', opacity: 0.5, backgroundColor: 'var(--surface-hover)' }}></div>
                    ))}
                </div>
            ) : courses.length > 0 ? (
                <div className="course-grid">
                    {courses.map(course => (
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
                                    <span className="course-card-btn">View Course →</span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            ) : (
                <div style={{ textAlign: 'center', padding: '4rem' }}>
                    <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)' }}>No courses available at the moment.</p>
                </div>
            )}
        </div>
    );
};

export default Courses;