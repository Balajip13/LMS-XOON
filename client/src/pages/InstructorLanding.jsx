import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    ArrowRight,
    Users,
    Globe,
    Zap,
    Trophy,
    CheckCircle2,
    Palette,
    Clock,
    DollarSign,
    Target
} from 'lucide-react';

const InstructorLanding = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const handleApply = () => {
        // Set the instructor intent flag
        localStorage.setItem('applyInstructorIntent', 'true');
        console.log('DEBUG: InstructorLanding - Set applyInstructorIntent to true');
        
        // Verify it was set
        const verifyFlag = localStorage.getItem('applyInstructorIntent');
        console.log('DEBUG: InstructorLanding - Verification - applyInstructorIntent:', verifyFlag);
        
        if (!user) {
            console.log('DEBUG: InstructorLanding - User not logged in, redirecting to login');
            // Not logged in -> redirect to login with return path
            navigate('/login', { state: { from: '/apply-instructor' } });
        } else if (user.role === 'student') {
            console.log('DEBUG: InstructorLanding - User is student, redirecting to apply-instructor');
            // Student -> go to application form
            navigate('/apply-instructor');
        } else if (user.role === 'instructor') {
            console.log('DEBUG: InstructorLanding - User is instructor, redirecting to instructor dashboard');
            // Already instructor -> go to dashboard
            navigate('/instructor/dashboard');
        } else if (user.role === 'admin') {
            console.log('DEBUG: InstructorLanding - User is admin, redirecting to admin dashboard');
            // Admin
            navigate('/admin/dashboard');
        }
    };

    return (
        <div style={{ backgroundColor: 'var(--background)', minHeight: '100vh', color: 'var(--text)' }}>
            {/* Hero Section */}
            <section style={{
                padding: '100px 0 80px',
                background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.05) 0%, rgba(79, 70, 229, 0.05) 100%)',
                borderBottom: '1px solid var(--border)'
            }}>
                <div className="container" style={{ textAlign: 'center' }}>
                    <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.5rem 1rem',
                        background: 'rgba(37, 99, 235, 0.1)',
                        color: 'var(--primary)',
                        borderRadius: '100px',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        marginBottom: '1.5rem'
                    }}>
                        <Globe size={16} />
                        Join Our Global Teaching Community
                    </div>
                    <h1 style={{
                        fontSize: 'clamp(2.5rem, 5vw, 4rem)',
                        fontWeight: '800',
                        lineHeight: '1.1',
                        marginBottom: '1.5rem',
                        background: 'linear-gradient(to right, var(--text), var(--primary))',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}>
                        Become an Instructor
                    </h1>
                    <p style={{
                        fontSize: '1.25rem',
                        color: 'var(--text-secondary)',
                        maxWidth: '700px',
                        margin: '0 auto 2.5rem',
                        lineHeight: '1.6'
                    }}>
                        Empower students worldwide by sharing your expertise. Join XOON LMS and turn your knowledge into impact.
                    </p>
                    <button
                        onClick={handleApply}
                        className="btn btn-primary"
                        style={{
                            padding: '1rem 2.5rem',
                            fontSize: '1.1rem',
                            fontWeight: '600',
                            borderRadius: '12px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            boxShadow: '0 10px 25px -5px rgba(37, 99, 235, 0.4)'
                        }}
                    >
                        Apply to Teach
                        <ArrowRight size={20} />
                    </button>
                </div>
            </section>

            {/* Why Choose Xoon */}
            <section style={{ padding: '80px 0', backgroundColor: 'var(--surface)' }}>
                <div className="container">
                    <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                        <h2 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '1rem' }}>
                            Why Choose XOON?
                        </h2>
                        <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto' }}>
                            We provide the tools and support you need to succeed as an online educator.
                        </p>
                    </div>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                        gap: '2rem'
                    }}>
                        <div className="card" style={{ padding: '2.5rem', textAlign: 'center', transition: 'transform 0.3s' }}>
                            <div style={{
                                width: '60px',
                                height: '60px',
                                background: 'rgba(37, 99, 235, 0.1)',
                                color: 'var(--primary)',
                                borderRadius: '16px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 1.5rem'
                            }}>
                                <Users size={32} />
                            </div>
                            <h3 style={{ marginBottom: '1rem', fontWeight: '700' }}>Global Reach</h3>
                            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                                Connect with millions of students from every corner of the globe.
                            </p>
                        </div>

                        <div className="card" style={{ padding: '2.5rem', textAlign: 'center' }}>
                            <div style={{
                                width: '60px',
                                height: '60px',
                                background: 'rgba(16, 185, 129, 0.1)',
                                color: '#10b981',
                                borderRadius: '16px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 1.5rem'
                            }}>
                                <Zap size={32} />
                            </div>
                            <h3 style={{ marginBottom: '1rem', fontWeight: '700' }}>Easy to Use</h3>
                            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                                Powerful course creation tools that let you focus on what matters: teaching.
                            </p>
                        </div>

                        <div className="card" style={{ padding: '2.5rem', textAlign: 'center' }}>
                            <div style={{
                                width: '60px',
                                height: '60px',
                                background: 'rgba(245, 158, 11, 0.1)',
                                color: '#f59e0b',
                                borderRadius: '16px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 1.5rem'
                            }}>
                                <Trophy size={32} />
                            </div>
                            <h3 style={{ marginBottom: '1rem', fontWeight: '700' }}>Build Your Brand</h3>
                            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                                Establish yourself as an industry expert and grow your professional presence.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Benefits Section */}
            <section style={{ padding: '80px 0' }}>
                <div className="container">
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
                        gap: '4rem',
                        alignItems: 'center'
                    }}>
                        <div>
                            <h2 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '1.5rem', lineHeight: '1.2' }}>
                                Extraordinary Benefits for Our Instructors
                            </h2>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', marginBottom: '2.5rem', lineHeight: '1.6' }}>
                                We're committed to your success. Our platform is built to help you earn, grow, and inspire.
                            </p>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                {[
                                    { icon: <DollarSign size={20} />, title: "Earn Competitive Revenue", desc: "Keep a large share of your sales with our fair payout models." },
                                    { icon: <Target size={20} />, title: "Market Your Courses", desc: "Gain visibility through our integrated marketing and promotion tools." },
                                    { icon: <CheckCircle2 size={20} />, title: "Dedicated Support", desc: "Expert guidance to help you craft premium content." }
                                ].map((item, i) => (
                                    <div key={i} style={{ display: 'flex', gap: '1.25rem' }}>
                                        <div style={{ color: 'var(--primary)', marginTop: '4px' }}>{item.icon}</div>
                                        <div>
                                            <h4 style={{ fontWeight: '700', marginBottom: '0.25rem' }}>{item.title}</h4>
                                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: '1.5rem'
                        }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                <div className="card" style={{ padding: '2rem', background: 'var(--surface)' }}>
                                    <Palette size={24} style={{ color: 'var(--primary)', marginBottom: '1rem' }} />
                                    <h5 style={{ fontWeight: '700', marginBottom: '0.5rem' }}>Total Creative Control</h5>
                                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>You own your content and your brand.</p>
                                </div>
                                <div className="card" style={{ padding: '2rem', background: 'var(--surface)' }}>
                                    <Clock size={24} style={{ color: 'var(--primary)', marginBottom: '1rem' }} />
                                    <h5 style={{ fontWeight: '700', marginBottom: '0.5rem' }}>Teach on Your Schedule</h5>
                                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Flexible lifestyle with passive income potential.</p>
                                </div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingTop: '2.5rem' }}>
                                <div className="card" style={{ padding: '2rem', background: 'var(--surface)' }}>
                                    <Globe size={24} style={{ color: 'var(--primary)', marginBottom: '1rem' }} />
                                    <h5 style={{ fontWeight: '700', marginBottom: '0.5rem' }}>Global Community</h5>
                                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Join thousands of educators worldwide.</p>
                                </div>
                                <div className="card" style={{ padding: '2rem', background: 'var(--surface)' }}>
                                    <Users size={24} style={{ color: 'var(--primary)', marginBottom: '1rem' }} />
                                    <h5 style={{ fontWeight: '700', marginBottom: '0.5rem' }}>Student Insights</h5>
                                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Deep analytics to understand your audience.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Contact Section */}
            <section style={{ padding: '80px 0', borderTop: '1px solid var(--border)' }}>
                <div className="container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <div style={{
                        padding: '3.5rem 3rem',
                        background: 'linear-gradient(to right, #f8f9fc 0%, #f0f4ff 100%)',
                        borderRadius: '14px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        textAlign: 'center',
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
                    }}>
                        <h2 style={{
                            fontSize: '2rem',
                            fontWeight: '700',
                            marginBottom: '0.75rem',
                            color: 'var(--text)'
                        }}>
                            Have Questions?
                        </h2>
                        <p style={{
                            fontSize: '1.05rem',
                            color: 'var(--text-secondary)',
                            maxWidth: '500px',
                            margin: '0 auto 2.5rem',
                            lineHeight: '1.6'
                        }}>
                            Our team is here to help you every step of the way. Reach out and we'll help you get started.
                        </p>
                        <Link
                            to="/contact"
                            className="btn btn-primary"
                            style={{
                                padding: '0.875rem 2rem',
                                fontSize: '1rem',
                                fontWeight: '600',
                                borderRadius: '12px',
                                textDecoration: 'none',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}
                        >
                            Get Support
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default InstructorLanding;
