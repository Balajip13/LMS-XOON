import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { ArrowRight, Lock, Mail, AlertCircle } from 'lucide-react';

const InstructorLogin = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login, logout } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (error) setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // 1. Attempt standard login
            const response = await login(formData.email, formData.password);

            // 2. Check Role Strictness
            const role = String(response.user?.role || response.role || '').trim().toLowerCase();

            if (role === 'instructor') {
                toast.success('Welcome back, Instructor!');
                navigate('/teacher-dashboard');
            } else if (role === 'admin') {
                toast.success('Welcome back, Admin!');
                navigate('/admin-dashboard');
            } else {
                // 3. If Student tries to log in, Logout immediately
                await logout();
                setError('This account is not registered as an instructor.');
                toast.error('Access Denied: Instructor account required.');
            }
        } catch (err) {
            console.error('Login error:', err);
            const msg = err.response?.data?.message || 'Invalid email or password';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f1f5f9', // Slightly darker neutral for distinction
            padding: '1rem'
        }}>
            <div style={{
                width: '100%',
                maxWidth: '480px',
                backgroundColor: '#ffffff',
                borderRadius: '24px', // More modern rounding
                boxShadow: '0 20px 40px -5px rgba(0, 0, 0, 0.1), 0 10px 20px -5px rgba(0, 0, 0, 0.04)', // Deeper shadow
                padding: '3rem',
                border: '1px solid rgba(226, 232, 240, 0.8)'
            }}>
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                    <h1 style={{
                        fontSize: '2rem',
                        fontWeight: '800',
                        color: '#0f172a',
                        marginBottom: '0.75rem',
                        letterSpacing: '-0.025em'
                    }}>
                        Instructor Portal
                    </h1>
                    <p style={{
                        fontSize: '1.1rem',
                        color: '#64748b',
                        lineHeight: '1.5'
                    }}>
                        Access your dashboard to manage courses and students
                    </p>
                </div>

                {/* Error Alert */}
                {error && (
                    <div style={{
                        backgroundColor: '#fef2f2',
                        border: '1px solid #fecaca',
                        borderRadius: '12px',
                        padding: '1rem',
                        marginBottom: '2rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        color: '#b91c1c'
                    }}>
                        <AlertCircle size={20} style={{ flexShrink: 0 }} />
                        <span style={{ fontSize: '0.95rem', fontWeight: 500 }}>{error}</span>
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit}>
                    {/* Email Field */}
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label
                            htmlFor="email"
                            style={{
                                display: 'block',
                                fontSize: '0.9rem',
                                fontWeight: '600',
                                color: '#334155',
                                marginBottom: '0.5rem'
                            }}
                        >
                            Email Address
                        </label>
                        <div style={{ position: 'relative' }}>
                            <div style={{
                                position: 'absolute',
                                left: '1.25rem',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                color: '#94a3b8'
                            }}>
                                <Mail size={20} />
                            </div>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="instructor@example.com"
                                style={{
                                    width: '100%',
                                    padding: '0.875rem 1.25rem 0.875rem 3.5rem',
                                    borderRadius: '12px',
                                    border: '2px solid #e2e8f0',
                                    fontSize: '1rem',
                                    outline: 'none',
                                    transition: 'all 0.2s',
                                    backgroundColor: '#f8fafc'
                                }}
                                onFocus={(e) => {
                                    e.target.style.borderColor = 'var(--primary, #2563eb)';
                                    e.target.style.backgroundColor = '#fff';
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = '#e2e8f0';
                                    e.target.style.backgroundColor = '#f8fafc';
                                }}
                            />
                        </div>
                    </div>

                    {/* Password Field */}
                    <div style={{ marginBottom: '2rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <label
                                htmlFor="password"
                                style={{
                                    fontSize: '0.9rem',
                                    fontWeight: '600',
                                    color: '#334155'
                                }}
                            >
                                Password
                            </label>
                            <Link
                                to="/forgot-password"
                                tabIndex="-1"
                                style={{
                                    fontSize: '0.85rem',
                                    color: 'var(--primary, #2563eb)',
                                    textDecoration: 'none',
                                    fontWeight: '500'
                                }}
                            >
                                Forgot password?
                            </Link>
                        </div>
                        <div style={{ position: 'relative' }}>
                            <div style={{
                                position: 'absolute',
                                left: '1.25rem',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                color: '#94a3b8'
                            }}>
                                <Lock size={20} />
                            </div>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="••••••••"
                                style={{
                                    width: '100%',
                                    padding: '0.875rem 1.25rem 0.875rem 3.5rem',
                                    borderRadius: '12px',
                                    border: '2px solid #e2e8f0',
                                    fontSize: '1rem',
                                    outline: 'none',
                                    transition: 'all 0.2s',
                                    backgroundColor: '#f8fafc'
                                }}
                                onFocus={(e) => {
                                    e.target.style.borderColor = 'var(--primary, #2563eb)';
                                    e.target.style.backgroundColor = '#fff';
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = '#e2e8f0';
                                    e.target.style.backgroundColor = '#f8fafc';
                                }}
                            />
                        </div>
                    </div>

                    {/* Login Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: '1rem',
                            backgroundColor: 'var(--primary, #2563eb)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '12px',
                            fontSize: '1.1rem',
                            fontWeight: '600',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.75rem',
                            opacity: loading ? 0.8 : 1,
                            transition: 'opacity 0.2s',
                            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)'
                        }}
                    >
                        {loading ? 'Authenticating...' : 'Access Dashboard'}
                        {!loading && <ArrowRight size={20} />}
                    </button>
                </form>

                {/* Footer Link */}
                <div style={{
                    marginTop: '2.5rem',
                    textAlign: 'center',
                    borderTop: '1px solid #f1f5f9',
                    paddingTop: '2rem'
                }}>
                    <span style={{ color: '#64748b', fontSize: '0.95rem' }}>
                        Want to become an instructor?{' '}
                    </span>
                    <Link
                        to="/instructor-landing"
                        style={{
                            color: 'var(--primary, #2563eb)',
                            textDecoration: 'none',
                            fontWeight: '600',
                            fontSize: '0.95rem',
                            marginLeft: '0.25rem'
                        }}
                    >
                        Apply Today
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default InstructorLogin;
