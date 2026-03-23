import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Upload, X, Loader2, CheckCircle2, Plus, Trash2, Video, FileText, Layout, List } from 'lucide-react';
import toast from 'react-hot-toast';

const CreateCourse = () => {
    const { api, user } = useAuth();
    const navigate = useNavigate();
    const { id } = useParams();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState([]);
    const [thumbnailPreview, setThumbnailPreview] = useState(null);
    const [uploadingVideos, setUploadingVideos] = useState({}); // { lessonId: boolean }

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: '',
        price: '',
        originalPrice: '',
        discountPercentage: 0,
        thumbnail: null,
        previewVideo: null,
        chapters: [
            { id: Date.now(), title: '', lessons: [{ id: Date.now() + 1, title: '', video: null }] }
        ]
    });

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                // Fetch Categories
                const { data: catData } = await api.get('/categories');
                console.log("Categories:", catData);
                const fetchedCategories = catData.categories || [];
                setCategories(fetchedCategories);

                // If ID is present, fetch course data for editing
                if (id) {
                    setLoading(true);
                    const { data: courseData } = await api.get(`/courses/${id}`);

                    // Verify ownership (optional but good)
                    if (courseData.instructor?._id !== user?._id && courseData.instructor !== user?._id && user?.role !== 'admin') {
                        toast.error('Unauthorized to edit this course');
                        return navigate('/instructor/courses');
                    }

                    setFormData({
                        title: courseData.title || '',
                        description: courseData.description || '',
                        category: courseData.category?._id || courseData.category || '',
                        price: courseData.price || '',
                        originalPrice: courseData.originalPrice || '',
                        discountPercentage: courseData.discountPercentage || 0,
                        thumbnail: null, // Keep current thumbnail unless changed
                        previewVideo: courseData.previewVideo || null,
                        chapters: courseData.chapters ? courseData.chapters.map(c => ({
                            id: c._id || Date.now() + Math.random(),
                            title: c.title,
                            lessons: c.lessons ? c.lessons.map(l => ({
                                id: l._id || Date.now() + Math.random(),
                                title: l.title,
                                videoUrl: l.videoUrl
                            })) : []
                        })) : []
                    });

                    if (courseData.thumbnail) {
                        setThumbnailPreview(courseData.thumbnail);
                    }
                } else if (fetchedCategories.length > 0) {
                    setFormData(prev => ({ ...prev, category: fetchedCategories[0]._id }));
                }
            } catch (error) {
                toast.error('Failed to load initial data');
            } finally {
                setLoading(false);
            }
        };
        fetchInitialData();
    }, [api, id, user, navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleThumbnailChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({ ...prev, thumbnail: file }));
            setThumbnailPreview(URL.createObjectURL(file));
        }
    };

    const addChapter = () => {
        setFormData(prev => ({
            ...prev,
            chapters: [...prev.chapters, { id: Date.now(), title: '', lessons: [{ id: Date.now() + 1, title: '', video: null }] }]
        }));
    };

    const removeChapter = (chapterId) => {
        setFormData(prev => ({
            ...prev,
            chapters: prev.chapters.filter(c => c.id !== chapterId)
        }));
    };

    const updateChapter = (chapterId, field, value) => {
        setFormData(prev => ({
            ...prev,
            chapters: prev.chapters.map(c => c.id === chapterId ? { ...c, [field]: value } : c)
        }));
    };

    const addLesson = (chapterId) => {
        setFormData(prev => ({
            ...prev,
            chapters: prev.chapters.map(c => c.id === chapterId ? {
                ...c,
                lessons: [...c.lessons, { id: Date.now(), title: '', video: null }]
            } : c)
        }));
    };

    const removeLesson = (chapterId, lessonId) => {
        setFormData(prev => ({
            ...prev,
            chapters: prev.chapters.map(c => c.id === chapterId ? {
                ...c,
                lessons: c.lessons.filter(l => l.id !== lessonId)
            } : c)
        }));
    };

    const updateLesson = (chapterId, lessonId, field, value) => {
        setFormData(prev => ({
            ...prev,
            chapters: prev.chapters.map(c => c.id === chapterId ? {
                ...c,
                lessons: c.lessons.map(l => l.id === lessonId ? { ...l, [field]: value } : l)
            } : c)
        }));
    };

    const handleVideoUpload = async (chapterId, lessonId, file) => {
        if (!file) return;

        try {
            setUploadingVideos(prev => ({ ...prev, [lessonId]: true }));
            const videoData = new FormData();
            videoData.append('video', file);

            const res = await api.post('/upload/video', videoData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (res.data.success) {
                updateLesson(chapterId, lessonId, 'videoUrl', res.data.url);
                toast.success('Video uploaded successfully');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Video upload failed');
        } finally {
            setUploadingVideos(prev => ({ ...prev, [lessonId]: false }));
        }
    };

    const handlePreviewVideoUpload = async (file) => {
        if (!file) return;

        try {
            setUploadingVideos(prev => ({ ...prev, preview: true }));
            const videoData = new FormData();
            videoData.append('video', file);

            const res = await api.post('/upload/video', videoData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (res.data.success) {
                setFormData(prev => ({ ...prev, previewVideo: res.data.url }));
                toast.success('Preview video uploaded successfully');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Preview video upload failed');
        } finally {
            setUploadingVideos(prev => ({ ...prev, preview: false }));
        }
    };

    const handleNext = () => {
        if (step === 1) {
            if (!formData.title) return toast.error('Title is required');
            if (!formData.category) return toast.error('Category is required');
        }
        if (step === 2 && !formData.price) return toast.error('Price is required');
        setStep((prev) => Math.min(prev + 1, 3));
    };

    const handlePrev = () => setStep((prev) => Math.max(prev - 1, 1));

    const handleSubmit = async () => {
        try {
            setLoading(true);
            const data = new FormData();
            data.append('title', formData.title);
            data.append('description', formData.description);
            data.append('category', formData.category);
            data.append('price', formData.price);
            data.append('originalPrice', formData.originalPrice || formData.price);
            data.append('discountPercentage', formData.discountPercentage);
            data.append('instructorName', user?.name || '');

            if (formData.thumbnail) {
                data.append('thumbnail', formData.thumbnail);
            }

            if (formData.previewVideo) {
                data.append('previewVideo', formData.previewVideo);
            }

            // Simple structure for chapters/lessons to be handled by backend
            data.append('structure', JSON.stringify(formData.chapters));

            let res;
            if (id) {
                // Update existing course
                res = await api.put(`/courses/${id}`, data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else {
                // Create new course
                res = await api.post('/courses', data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }

            if (res.data) {
                toast.success(id ? 'Course updated successfully' : 'Course created successfully');
                navigate('/instructor/courses');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || `Failed to ${id ? 'update' : 'create'} course`);
        } finally {
            setLoading(false);
        }
    };

    const steps = [
        { id: 1, label: 'Course Details', icon: Layout },
        { id: 2, label: 'Curriculum & Price', icon: List },
        { id: 3, label: 'Preview & Submit', icon: CheckCircle2 }
    ];

    return (
        <div className="instructor-page-container-compact">
            <div className="instructor-page-header">
                <div>
                    <h1 className="instructor-page-title">{id ? 'Edit Course' : 'Create New Course'}</h1>
                    <p className="instructor-page-subtitle">Design a premium learning experience for your students</p>
                </div>
                <button
                    onClick={() => navigate('/instructor/courses')}
                    className="back-btn-modern"
                >
                    Back
                </button>
            </div>

            {/* Stepper */}
            <div className="modern-form-card shadow-soft" style={{ marginBottom: '2.5rem', padding: '1.5rem' }}>
                <div className="stepper-container">
                    <div className="stepper-line-bg">
                        <div
                            className="stepper-line-active"
                            style={{ width: `${((step - 1) / (steps.length - 1)) * 100}%` }}
                        />
                    </div>

                    {steps.map((s) => {
                        const Icon = s.icon;
                        const isCompleted = step > s.id;
                        const isActive = step === s.id;

                        return (
                            <div
                                key={s.id}
                                className="stepper-item"
                                onClick={() => setStep(s.id)}
                            >
                                <div className={`stepper-icon-container ${isCompleted ? 'completed' : isActive ? 'active-step' : 'inactive'}`}>
                                    {isCompleted ? <CheckCircle2 size={21} /> : <Icon size={19} />}
                                </div>
                                <span className={`stepper-label ${isActive || isCompleted ? 'active' : ''}`}>
                                    {s.label}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="form-section">
                {step === 1 && (
                    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        {/* Basic Details & Thumbnail */}
                        <div className="modern-form-card shadow-soft">
                            <div className="card-header-flex" style={{ marginBottom: '1.5rem' }}>
                                <h2 className="section-title-modern" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <FileText size={20} color="var(--primary)" />
                                    Basic Information
                                </h2>
                            </div>
                            <div className="form-grid">
                                <div className="form-group-modern">
                                    <label className="label-modern">Course Title <span className="required">*</span></label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleChange}
                                        placeholder="Enter a descriptive title..."
                                        className="modern-input-field"
                                        required
                                    />
                                </div>

                                <div className="form-group-modern">
                                    <label className="label-modern">Category <span className="required">*</span></label>
                                    <select
                                        name="category"
                                        className="modern-select-field"
                                        value={formData.category}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="" disabled>Select Category</option>
                                        {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                                    </select>
                                </div>

                                <div className="form-group-modern" style={{ gridColumn: 'span 2' }}>
                                    <label className="label-modern">Description <span className="required">*</span></label>
                                    <textarea
                                        name="description"
                                        className="modern-textarea-field"
                                        value={formData.description}
                                        onChange={handleChange}
                                        placeholder="Describe what students will achieve..."
                                        style={{ minHeight: '160px' }}
                                        required
                                    />
                                </div>

                                {/* Integrated Thumbnail Upload */}
                                <div className="form-group-modern" style={{ gridColumn: 'span 2', marginTop: '1rem' }}>
                                    <label className="label-modern">Course Thumbnail</label>
                                    <div className="thumbnail-upload-box" style={{ marginTop: '0.5rem' }}>
                                        {thumbnailPreview ? (
                                            <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                                                <img src={thumbnailPreview} alt="Preview" className="thumbnail-preview-img" style={{ borderRadius: '12px' }} />
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setThumbnailPreview(null);
                                                        setFormData(prev => ({ ...prev, thumbnail: null }));
                                                    }}
                                                    style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', borderRadius: '50%', padding: '5px' }}
                                                >
                                                    <X size={16} />
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="thumbnail-placeholder">
                                                <Upload size={40} className="placeholder-icon" />
                                                <p style={{ fontSize: '0.9rem' }}>Click to upload thumbnail (16:9 recommended)</p>
                                            </div>
                                        )}
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleThumbnailChange}
                                            className="thumbnail-file-input"
                                        />
                                    </div>
                                    <p className="form-help-text" style={{ marginTop: '0.75rem', fontSize: '0.85rem' }}>
                                        Recommended size: 1280x720px. Max 2MB.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        {/* Curriculum */}
                        <div className="modern-form-card shadow-soft">
                            <div className="quiz-header-actions" style={{ marginBottom: '2rem' }}>
                                <h2 className="section-title-modern" style={{ margin: 0 }}>Course Curriculum</h2>
                                <button onClick={addChapter} className="btn-add-question-quiz">
                                    <Plus size={18} /> Add Chapter
                                </button>
                            </div>

                            <div className="curriculum-list">
                                {formData.chapters.map((chapter, index) => (
                                    <div key={chapter.id} className="chapter-item-modern">
                                        <div className="chapter-header-modern">
                                            <div className="chapter-number-badge">{index + 1}</div>
                                            <input
                                                type="text"
                                                placeholder="Chapter Title"
                                                className="chapter-title-input-modern"
                                                value={chapter.title}
                                                onChange={(e) => updateChapter(chapter.id, 'title', e.target.value)}
                                            />
                                            <button
                                                onClick={() => removeChapter(chapter.id)}
                                                className="lesson-btn-action remove"
                                                title="Remove Chapter"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                        <div className="chapter-lessons-list">
                                            {chapter.lessons.map((lesson, lIndex) => (
                                                <div key={lesson.id} className="lesson-item-modern animate-fade-in">
                                                    <Video size={16} color="var(--primary)" />
                                                    <input
                                                        type="text"
                                                        placeholder="Lesson Title"
                                                        className="lesson-title-input-modern"
                                                        value={lesson.title}
                                                        onChange={(e) => updateLesson(chapter.id, lesson.id, 'title', e.target.value)}
                                                    />
                                                    <div className="lesson-actions-modern">
                                                        <button
                                                            className={`lesson-btn-action ${lesson.videoUrl ? 'success' : ''}`}
                                                            title="Upload Video"
                                                            disabled={uploadingVideos[lesson.id]}
                                                            style={{ position: 'relative' }}
                                                        >
                                                            {uploadingVideos[lesson.id] ? (
                                                                <Loader2 size={16} className="animate-spin" />
                                                            ) : lesson.videoUrl ? (
                                                                <CheckCircle2 size={16} color="#10b981" />
                                                            ) : (
                                                                <Upload size={16} />
                                                            )}
                                                            <input
                                                                type="file"
                                                                accept="video/*"
                                                                onChange={(e) => handleVideoUpload(chapter.id, lesson.id, e.target.files[0])}
                                                                style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }}
                                                                disabled={uploadingVideos[lesson.id]}
                                                            />
                                                        </button>
                                                        <button
                                                            onClick={() => removeLesson(chapter.id, lesson.id)}
                                                            className="lesson-btn-action remove"
                                                            title="Remove Lesson"
                                                            disabled={uploadingVideos[lesson.id]}
                                                        >
                                                            <X size={16} />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                            <button onClick={() => addLesson(chapter.id)} className="btn-add-lesson-slim">
                                                <Plus size={14} /> Add Lesson
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Pricing */}
                        <div className="modern-form-card shadow-soft">
                            <div className="card-header-flex" style={{ marginBottom: '1.5rem' }}>
                                <h2 className="section-title-modern" style={{ margin: 0 }}>Pricing & Offers</h2>
                            </div>
                            <div className="form-grid">
                                <div className="form-group-modern">
                                    <label className="label-modern">Selling Price (₹) <span className="required">*</span></label>
                                    <input
                                        type="number"
                                        name="price"
                                        className="modern-input-field"
                                        value={formData.price}
                                        onChange={handleChange}
                                        placeholder="e.g., 999"
                                        required
                                    />
                                </div>
                                <div className="form-group-modern">
                                    <label className="label-modern">Original Price (₹)</label>
                                    <input
                                        type="number"
                                        name="originalPrice"
                                        className="modern-input-field"
                                        value={formData.originalPrice}
                                        onChange={handleChange}
                                        placeholder="e.g., 1999"
                                    />
                                </div>
                                <div className="form-group-modern">
                                    <label className="label-modern">Discount (%)</label>
                                    <input
                                        type="number"
                                        name="discountPercentage"
                                        className="modern-input-field"
                                        value={formData.discountPercentage}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Preview Video */}
                        <div className="modern-form-card shadow-soft">
                            <div className="card-header-flex" style={{ marginBottom: '1.5rem' }}>
                                <h2 className="section-title-modern" style={{ margin: 0 }}>Course Preview Video</h2>
                            </div>
                            <div className="form-grid">
                                <div className="form-group-modern" style={{ gridColumn: 'span 2' }}>
                                    <label className="label-modern">Upload a short preview video to attract students</label>
                                    <div className="thumbnail-upload-box" style={{ marginTop: '0.5rem', minHeight: '160px', border: formData.previewVideo ? '1px solid var(--border)' : '2px dashed var(--border)' }}>
                                        {uploadingVideos['preview'] ? (
                                            <div className="thumbnail-placeholder" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                                                <Loader2 size={40} className="animate-spin" color="var(--primary)" />
                                                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Uploading video...</p>
                                            </div>
                                        ) : formData.previewVideo ? (
                                            <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: '200px', backgroundColor: '#000', borderRadius: '12px', overflow: 'hidden' }}>
                                                <video
                                                    src={formData.previewVideo}
                                                    controls
                                                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setFormData(prev => ({ ...prev, previewVideo: null }));
                                                    }}
                                                    style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', borderRadius: '50%', padding: '5px', zIndex: 10, cursor: 'pointer' }}
                                                    title="Remove preview video"
                                                >
                                                    <X size={16} />
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="thumbnail-placeholder">
                                                <Video size={40} className="placeholder-icon" />
                                                <p style={{ fontSize: '0.9rem' }}>Click to upload preview video</p>
                                            </div>
                                        )}
                                        <input
                                            type="file"
                                            accept="video/*"
                                            onChange={(e) => handlePreviewVideoUpload(e.target.files[0])}
                                            className="thumbnail-file-input"
                                            disabled={uploadingVideos['preview']}
                                        />
                                    </div>
                                    <p className="form-help-text" style={{ marginTop: '0.75rem', fontSize: '0.85rem' }}>
                                        Max size: 50MB. This video will be shown on the course details page.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="modern-form-card shadow-soft animate-fade-in publish-preview-card">
                        <div className="preview-header" style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                            <CheckCircle2 size={48} color="#10b981" style={{ marginBottom: '1rem' }} />
                            <h2 className="section-title-modern" style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>Ready to Publish?</h2>
                            <p className="instructor-page-subtitle">Review your course details before submitting to admin</p>
                        </div>

                        <div className="step3-preview-container" style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 1.5fr', gap: '2.5rem' }}>
                            <div className="preview-image-wrapper" style={{ borderRadius: '16px', overflow: 'hidden', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}>
                                <img
                                    src={thumbnailPreview || 'https://via.placeholder.com/640x360?text=Course+Thumbnail'}
                                    alt="Course Cover"
                                    className="preview-img"
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                            </div>
                            <div className="preview-details">
                                <h3 className="preview-title" style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '1.5rem' }}>{formData.title}</h3>
                                <div className="preview-stats-row" style={{ display: 'flex', gap: '2rem', marginBottom: '2rem' }}>
                                    <div className="preview-stat-item">
                                        <span className="stat-label" style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-muted)', letterSpacing: '0.05em', marginBottom: '0.4rem' }}>CATEGORY</span>
                                        <span className="stat-value" style={{ fontWeight: '700', color: 'var(--primary)' }}>{categories.find(c => c._id === formData.category)?.name || 'General'}</span>
                                    </div>
                                    <div className="preview-stat-item">
                                        <span className="stat-label" style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-muted)', letterSpacing: '0.05em', marginBottom: '0.4rem' }}>PRICE</span>
                                        <span className="stat-value price" style={{ fontWeight: '800', fontSize: '1.2rem', color: '#10b981' }}>₹{formData.price}</span>
                                    </div>
                                    <div className="preview-stat-item">
                                        <span className="stat-label" style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-muted)', letterSpacing: '0.05em', marginBottom: '0.4rem' }}>CURRICULUM</span>
                                        <span className="stat-value" style={{ fontWeight: '700' }}>{formData.chapters.length} Chapters</span>
                                    </div>
                                </div>
                                <p className="preview-description" style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>{formData.description || 'No description provided.'}</p>
                            </div>
                        </div>

                        <div className="info-alert-box" style={{ marginTop: '2.5rem', background: 'rgba(59, 130, 246, 0.05)', border: '1px solid rgba(59, 130, 246, 0.1)', borderRadius: '12px', padding: '1rem 1.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            <div className="info-icon-wrapper" style={{ color: 'var(--primary)' }}><Layout size={20} /></div>
                            <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                <strong>Note:</strong> Your course will be submitted for approval. Approval usually takes 24-48 hours.
                            </p>
                        </div>
                    </div>
                )}

                {/* Footer Navigation */}
                <div className="form-actions-modern" style={{ marginTop: '2rem' }}>
                    <button
                        className="btn-ghost-modern"
                        onClick={handlePrev}
                        disabled={step === 1 || loading}
                    >
                        Previous
                    </button>
                    <button
                        className="btn-primary-modern"
                        onClick={step === 3 ? handleSubmit : handleNext}
                        disabled={loading}
                        style={{ minWidth: '200px' }}
                    >
                        {loading ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Loader2 className="animate-spin" size={20} />
                                <span>Processing...</span>
                            </div>
                        ) : step === 3 ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                🚀 <span>Publish Course</span>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span>Continue</span>
                            </div>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreateCourse;
