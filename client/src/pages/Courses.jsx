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
                const { data } = await api.get('/courses'); // ✅ CORRECT
                setCourses(data?.courses || []);
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
        <div style={{ padding: '2rem' }}>
            <h1>Courses</h1>

            {loading ? (
                <p>Loading...</p>
            ) : courses.length > 0 ? (
                courses.map(course => (
                    <Link key={course._id} to={`/course/${course._id}`}>
                        <h3>{course.title}</h3>
                    </Link>
                ))
            ) : (
                <p>No courses found</p>
            )}
        </div>
    );
};

export default Courses;