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
                // ✅ FIXED API ROUTE
                const { data } = await api.get('/api/courses');
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

            <div className="card" style={{ marginBottom: '3rem' }}>
                <input
                    type="text"
                    placeholder="Search for courses..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {loading ? (
                <div className="text-center">Loading courses...</div>
            ) : (
                <div>
                    {filteredCourses.map(course => (
                        <Link key={course._id} to={`/course/${course._id}`}>
                            <h3>{course.title}</h3>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Courses;