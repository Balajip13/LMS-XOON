import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Star, Users, BookOpen, Award, CheckCircle, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { AccentureLogo, TCSLogo, WiproLogo, InfosysLogo, ZohoLogo } from '../components/CompanyLogos';
import { getPricingData } from '../utils/pricing';

const Home = () => {
    const { user, loading, api } = useAuth();
    const [courses, setCourses] = useState([]);
    const [showLearnMoreModal, setShowLearnMoreModal] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        if (!loading && user) {
            if (user.role === 'admin') {
                navigate('/admin/dashboard');
            } else if (user.role === 'instructor') {
                navigate('/instructor/dashboard');
            } else {
                navigate('/student/dashboard');
            }
        }
    }, [user, loading, navigate]);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const { data } = await api.get('/courses');
                // API returns { courses, page, pages }
                setCourses(data.courses ? data.courses.slice(0, 3) : []);
            } catch (error) {
                console.error('Failed to fetch courses:', error);
                setCourses([]);
            }
        };
        fetchCourses();
    }, [api]);

    // Only return null/loading if auth is still initializing
    if (loading) {
        return (
            <div className="flex items-center justify-center p-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    // Success Stories Data
    const successStories = [
        {
            id: 1,
            name: 'Rohan Mehta',
            role: 'Software Engineer',
            image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=150&h=150',
            text: 'Xoon LMS helped me switch from support to full-stack development. The structured learning path was exactly what I needed.'
        },
        {
            id: 2,
            name: 'Priya Sharma',
            role: 'Data Analyst',
            image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150&h=150',
            text: 'The courses are practical and to the point. I landed my dream job at a top fintech company after completing the Data Science track.'
        },
        {
            id: 3,
            name: 'Amit Patel',
            role: 'Product Manager',
            image: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=150&h=150',
            text: 'Understanding technical concepts is crucial for my role. Xoon simplified complex topics beautifully.'
        },
    ];

    return (
        <div className="landing-page">
            {/* Hero Section */}
            <style>{`
                .hero-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 4rem;
                    align-items: center;
                }
                .hero-image-wrap {
                    position: relative;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 108%;
                    margin-left: auto;
                    margin-right: -8%;
                }
                .hero-blob {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -48%);
                    width: 85%;
                    aspect-ratio: 1 / 1;
                    background-color: #0f172a;
                    border-radius: 20px;
                    z-index: 0;
                    pointer-events: none;
                }
                .hero-img {
                    position: relative;
                    z-index: 1;
                    width: 100%;
                    height: auto;
                    display: block;
                    object-fit: contain;
                }
                @media (max-width: 768px) {
                    .hero-grid {
                        grid-template-columns: 1fr;
                        gap: 2.5rem;
                    }
                    .hero-image-wrap {
                        order: 2;
                        justify-content: center;
                        max-width: 480px;
                        margin: 0 auto;
                        width: 100%;
                    }
                    .hero-content {
                        order: 1;
                        margin-top: 0 !important;
                    }
                }
            `}</style>
            <section style={{
                padding: '6rem 0',
                backgroundColor: 'var(--surface)',
                borderBottom: '1px solid var(--border)',
                color: 'var(--text-primary)',
                minHeight: '80vh',
                display: 'flex',
                alignItems: 'center'
            }}>
                <div className="container hero-grid">
                    <div className="hero-content animate-fade-in" style={{ textAlign: 'left', marginTop: '-4.5rem' }}>
                        <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3.25rem)', marginBottom: '1.25rem', letterSpacing: '-0.05em', lineHeight: '1.2' }}>
                            Welcome to <span style={{ color: 'var(--primary)' }}>Xoon LMS</span>
                        </h1>
                        <p style={{ fontSize: 'clamp(0.95rem, 1.5vw, 1.15rem)', color: 'var(--text-secondary)', marginBottom: '2.5rem', fontWeight: 300, maxWidth: '540px' }}>
                            Gateway for Smarter Learning. Access high-quality education and expert-led courses from anywhere in the world.
                        </p>

                        <div style={{ display: 'flex', gap: '0.875rem', flexWrap: 'wrap' }}>
                            {!user ? (
                                <>
                                    <Link to="/login" className="btn btn-primary" style={{ padding: '0.875rem 2rem', fontSize: '1rem' }}>
                                        Get Started <ArrowRight size={18} style={{ marginLeft: '0.5rem' }} />
                                    </Link>
                                    <button
                                        onClick={() => setShowLearnMoreModal(true)}
                                        className="btn btn-outline"
                                        style={{ padding: '0.875rem 2rem', fontSize: '1rem' }}
                                    >
                                        Learn More
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link to={user.role === 'admin' ? '/admin/dashboard' : user.role === 'instructor' ? '/instructor/dashboard' : '/student/dashboard'} className="btn btn-primary" style={{ padding: '0.875rem 2rem', fontSize: '1rem' }}>
                                        Go to Dashboard <ArrowRight size={18} style={{ marginLeft: '0.5rem' }} />
                                    </Link>
                                    <Link to="/student/courses" className="btn btn-outline" style={{ padding: '0.875rem 2rem', fontSize: '1rem' }}>
                                        Explore Courses
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="hero-image-wrap animate-fade-in">
                        {/* Soft blob shape sits behind the students, fades to transparent at edges */}
                        <div className="hero-blob" aria-hidden="true" />
                        <img
                            src="/assets/students.png"
                            alt="Students learning illustration"
                            className="hero-img"
                        />
                    </div>
                </div>
            </section>

            {/* Learn More Modal */}
            {
                showLearnMoreModal && (
                    <div style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.6)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 9999,
                        padding: '1rem'
                    }} onClick={() => setShowLearnMoreModal(false)}>
                        <div style={{
                            backgroundColor: 'var(--surface)',
                            borderRadius: '12px',
                            padding: '2.5rem',
                            maxWidth: '600px',
                            width: '100%',
                            position: 'relative',
                            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
                        }} onClick={(e) => e.stopPropagation()}>
                            <button
                                onClick={() => setShowLearnMoreModal(false)}
                                style={{
                                    position: 'absolute',
                                    top: '1rem',
                                    right: '1rem',
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    color: 'var(--text-secondary)',
                                    padding: '0.5rem'
                                }}
                            >
                                <X size={24} />
                            </button>

                            <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem', color: 'var(--primary)' }}>
                                Why Choose Xoon LMS?
                            </h2>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                                    <CheckCircle size={24} style={{ color: 'var(--success)', flexShrink: 0, marginTop: '0.2rem' }} />
                                    <div>
                                        <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Expert-Led Courses</h3>
                                        <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                                            Learn from industry professionals with years of real-world experience
                                        </p>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                                    <CheckCircle size={24} style={{ color: 'var(--success)', flexShrink: 0, marginTop: '0.2rem' }} />
                                    <div>
                                        <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Verified Certificates</h3>
                                        <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                                            Earn recognized certificates upon course completion to boost your career
                                        </p>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                                    <CheckCircle size={24} style={{ color: 'var(--success)', flexShrink: 0, marginTop: '0.2rem' }} />
                                    <div>
                                        <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Flexible Learning</h3>
                                        <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                                            Study at your own pace with lifetime access to course materials
                                        </p>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                                    <CheckCircle size={24} style={{ color: 'var(--success)', flexShrink: 0, marginTop: '0.2rem' }} />
                                    <div>
                                        <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Career-Focused Content</h3>
                                        <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                                            Practical skills and projects that prepare you for real job opportunities
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                                <Link
                                    to="/login"
                                    className="btn btn-primary"
                                    style={{ padding: '0.75rem 2rem' }}
                                    onClick={() => setShowLearnMoreModal(false)}
                                >
                                    Get Started Now
                                </Link>
                                <Link
                                    to="/courses"
                                    className="btn btn-outline"
                                    style={{ padding: '0.75rem 2rem' }}
                                    onClick={() => setShowLearnMoreModal(false)}
                                >
                                    Browse Courses
                                </Link>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Trusted By Section */}
            <section style={{
                padding: '4rem 0',
                backgroundColor: 'var(--surface)',
                borderTop: '1px solid var(--border)',
                borderBottom: '1px solid var(--border)'
            }}>
                <div className="container">
                    <h2 style={{
                        textAlign: 'center',
                        fontSize: '2rem',
                        marginBottom: '3rem',
                        color: 'var(--text-primary)',
                        fontWeight: 600
                    }}>
                        Trusted by Industry Leaders
                    </h2>

                    <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: '4rem',
                        flexWrap: 'wrap',
                        padding: '0 2rem'
                    }}>
                        {[
                            { Component: AccentureLogo, visualHeight: '52px' },
                            { Component: TCSLogo, visualHeight: '44px' },
                            { Component: WiproLogo, visualHeight: '42px' },
                            { Component: InfosysLogo, visualHeight: '48px' },
                            { Component: ZohoLogo, visualHeight: '52px' }
                        ].map(({ Component, visualHeight }, idx) => (
                            <div
                                key={idx}
                                style={{
                                    height: '70px', // Standardized container for perfect vertical centering
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'var(--text-secondary)', // Subdued neutral grey by default
                                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                    cursor: 'default',
                                    filter: 'brightness(var(--logo-brightness, 1))'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.color = 'var(--text)'; // Transitions to Black (Light) or White (Dark)
                                    e.currentTarget.style.filter = 'brightness(1.1)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.color = 'var(--text-secondary)';
                                    e.currentTarget.style.filter = 'brightness(var(--logo-brightness, 1))';
                                }}
                            >
                                <Component
                                    style={{
                                        height: visualHeight,
                                        width: 'auto',
                                        display: 'block',
                                        objectFit: 'contain'
                                    }}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Featured Courses (Limit 3) */}
            <section style={{ padding: '5rem 0' }}>
                <div className="container">
                    <h2 className="text-center mb-4" style={{ fontSize: '2.5rem' }}>Top Picked Courses</h2>

                    {courses.length > 0 ? (
                        <>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
                                {courses.map(course => (
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
                                                <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--primary)', fontWeight: 'bold' }}>{course.category?.name || course.category || 'General'}</span>
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
                                                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                                                    By {course.instructor?.name || course.instructorName || (typeof course.instructor === 'string' ? course.instructor : 'Unknown Instructor')}
                                                </p>
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
                                                    <span style={{ color: 'var(--primary)', fontSize: '0.9rem', fontWeight: 600 }}>View Details</span>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                            <div className="text-center">
                                <Link to="/courses" className="btn btn-outline" style={{ padding: '0.75rem 2rem' }}>
                                    Show All Courses
                                </Link>
                            </div>
                        </>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)', backgroundColor: 'var(--surface-hover)', borderRadius: '12px' }}>
                            <BookOpen size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                            <p style={{ fontSize: '1.1rem' }}>No courses available yet.</p>
                        </div>
                    )}
                </div>
            </section>

            {/* Turn Your Expertise Into Impact - Instructor Marketing Section */}
            <section style={{
                padding: '6rem 0',
                backgroundColor: 'var(--surface)',
                borderTop: '1px solid var(--border)',
                borderBottom: '1px solid var(--border)'
            }}>
                <div className="container">
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                        gap: '5rem',
                        alignItems: 'center'
                    }}>
                        {/* Left Column - Image */}
                        <div style={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center'
                        }}>
                            <div style={{
                                width: '100%',
                                maxWidth: '500px',
                                position: 'relative'
                            }}>
                                <img
                                    src="/instructor_teaching.jpg?v=2"
                                    alt="Professional instructor teaching online course"
                                    style={{
                                        width: '100%',
                                        height: 'auto',
                                        borderRadius: '16px',
                                        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.12)',
                                        objectFit: 'cover'
                                    }}
                                    onError={(e) => {
                                        // Fallback to Unsplash if local image fails
                                        e.target.src = 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=85';
                                    }}
                                />
                            </div>
                        </div>

                        {/* Right Column - Content */}
                        <div style={{ maxWidth: '540px' }}>
                            <h2 style={{
                                fontSize: '2.75rem',
                                fontWeight: '800',
                                marginBottom: '1.25rem',
                                lineHeight: '1.15',
                                color: 'var(--text)',
                                letterSpacing: '-0.02em'
                            }}>
                                Turn Your Expertise Into Impact
                            </h2>
                            <p style={{
                                fontSize: '1.15rem',
                                color: 'var(--text-secondary)',
                                marginBottom: '2.5rem',
                                lineHeight: '1.65'
                            }}>
                                Create courses, inspire learners, and earn by sharing what you know.
                            </p>

                            {/* Benefits List */}
                            <div style={{ marginBottom: '2.5rem' }}>
                                {[
                                    {
                                        title: 'Earn on Your Terms',
                                        desc: 'Set your price and grow your income'
                                    },
                                    {
                                        title: 'Reach Global Learners',
                                        desc: 'Teach students from around the world'
                                    },
                                    {
                                        title: 'Build Authority',
                                        desc: 'Establish yourself as an industry expert'
                                    },
                                    {
                                        title: 'Flexible Creation',
                                        desc: 'Teach at your own pace'
                                    }
                                ].map((benefit, idx) => (
                                    <div key={idx} style={{
                                        display: 'flex',
                                        alignItems: 'flex-start',
                                        gap: '0.875rem',
                                        marginBottom: idx < 3 ? '1.25rem' : '0'
                                    }}>
                                        <div style={{
                                            width: '6px',
                                            height: '6px',
                                            borderRadius: '50%',
                                            backgroundColor: 'var(--primary)',
                                            marginTop: '0.5rem',
                                            flexShrink: 0
                                        }} />
                                        <div>
                                            <strong style={{
                                                fontSize: '1.05rem',
                                                display: 'block',
                                                marginBottom: '0.15rem',
                                                color: 'var(--text)',
                                                fontWeight: '600'
                                            }}>
                                                {benefit.title}
                                            </strong>
                                            <span style={{
                                                fontSize: '0.95rem',
                                                color: 'var(--text-secondary)',
                                                lineHeight: '1.5'
                                            }}>
                                                {benefit.desc}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* CTA */}
                            <div style={{ display: 'flex' }}>
                                <button
                                    onClick={() => navigate('/instructor-landing')}
                                    className="btn btn-primary"
                                    style={{
                                        padding: '0.875rem 2rem',
                                        fontSize: '1rem',
                                        fontWeight: '600',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        border: 'none',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Get Started
                                    <ArrowRight size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Success Stories */}
            <section style={{ padding: '6rem 0', backgroundColor: 'var(--surface-hover)' }}>
                <div className="container">
                    <h2 style={{ textAlign: 'center', marginBottom: '4rem', fontSize: '2.5rem' }}>Success Stories</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2.5rem' }}>
                        {successStories.map((story) => (
                            <div key={story.id} className="card" style={{ padding: '2rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                                    <img
                                        src={story.image}
                                        alt={story.name}
                                        style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover' }}
                                    />
                                    <div>
                                        <h4 style={{ marginBottom: '0.2rem', fontSize: '1.1rem' }}>{story.name}</h4>
                                        <span style={{ fontSize: '0.9rem', color: 'var(--primary)', fontWeight: 500 }}>{story.role}</span>
                                    </div>
                                </div>
                                <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic', lineHeight: '1.7' }}>
                                    "{story.text}"
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div >
    );
};

export default Home;
