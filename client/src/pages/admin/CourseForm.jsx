import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Save, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const CourseForm = () => {
    const { id } = useParams();
    const { api } = useAuth();
    const navigate = useNavigate();
    const isEditMode = !!id;
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
        originalPrice: '',
        discountPercentage: 0,
        category: '',
        thumbnail: '', // URL for now
        instructor: '',
        isPublished: false
    });

    useEffect(() => {
        if (isEditMode) {
            // Fetch course details
            const fetchCourse = async () => {
                try {
                    const { data } = await api.get(`/courses/${id}`);
                    setFormData({
                        title: data.title,
                        description: data.description,
                        price: data.price,
                        originalPrice: data.originalPrice,
                        discountPercentage: data.discountPercentage,
                        category: data.category?._id || data.category, // Handle if category is object or string
                        thumbnail: data.thumbnail,
                        instructor: data.instructorName || data.instructor?.name || '', // Handle if instructor is object or string
                        isPublished: data.isPublished
                    });
                } catch (error) {
                    console.error('Failed to load course details:', error);
                    toast.error('Failed to load course details');
                }
            };
            fetchCourse();
        }
    }, [id, isEditMode, api]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (isEditMode) {
                await api.put(`/courses/${id}`, formData);
                toast.success('Course updated successfully');
            } else {
                await api.post('/courses', formData);
                toast.success('Course created successfully');
            }
            navigate('/admin/courses');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to save course');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                <button onClick={() => navigate('/admin/courses')} className="btn-outline" style={{ padding: '0.5rem' }}>
                    <ArrowLeft size={20} />
                </button>
                <h1>{isEditMode ? 'Edit Course' : 'Create New Course'}</h1>
            </div>

            <div className="card">
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Course Title</label>
                        <input
                            type="text"
                            required
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Sale Price (₹)</label>
                            <input
                                type="number"
                                required
                                value={formData.price}
                                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Original Price (₹)</label>
                            <input
                                type="number"
                                value={formData.originalPrice}
                                onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                                placeholder="Struck price"
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Discount (%)</label>
                            <input
                                type="number"
                                value={formData.discountPercentage}
                                onChange={(e) => setFormData({ ...formData, discountPercentage: e.target.value })}
                            />
                        </div>
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Category</label>
                        <select
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', backgroundColor: 'var(--background)', color: 'var(--text)' }}
                        >
                            <option value="">Select Category</option>
                            <option value="Web Dev">Web Development</option>
                            <option value="Programming">Programming</option>
                            <option value="Data Science">Data Science</option>
                            <option value="Marketing">Marketing</option>
                        </select>
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Thumbnail URL</label>
                        <input
                            type="text"
                            value={formData.thumbnail}
                            onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                            placeholder="https://..."
                        />
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                            Paste an image URL here. (Firebase upload not configured)
                        </p>
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Description</label>
                        <textarea
                            rows="5"
                            required
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                borderRadius: 'var(--radius)',
                                border: '1px solid var(--border)',
                                backgroundColor: 'var(--background)',
                                color: 'var(--text)',
                                fontFamily: 'inherit'
                            }}
                        ></textarea>
                    </div>

                    <div style={{ marginBottom: '2rem' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                            <input
                                type="checkbox"
                                checked={formData.isPublished}
                                onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                                style={{ width: '20px', height: '20px' }}
                            />
                            <span>Publish Course immediately?</span>
                        </label>
                    </div>

                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        <Save size={20} style={{ marginRight: '0.5rem' }} />
                        {loading ? 'Saving...' : 'Save Course'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CourseForm;
