import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import toast from 'react-hot-toast';

const normalizeRole = (role) => String(role || '').trim().toLowerCase();

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { login, user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [authError, setAuthError] = useState('');

    // Show registration success message if coming from register
    useEffect(() => {
        if (location.state?.message) {
            toast.success(location.state.message);
            // Clear the state to prevent showing again on refresh
            navigate(location.pathname, { replace: true, state: null });
        }
        
        // Pre-fill email if provided from registration
        if (location.state?.registeredEmail) {
            setEmail(location.state.registeredEmail);
        }
    }, [location.state, navigate, location.pathname]);

    // handleSubmit handles post-login navigation
    const handleSubmit = async (e) => {
        e.preventDefault();
        setAuthError('');
        setIsLoading(true);

        // Debug: Log the current values
        console.log('Login attempt with:', { email, password });
        console.log('Email length:', email.length);
        console.log('Password length:', password.length);
        console.log('Email trimmed:', email.trim());
        console.log('Password trimmed:', password.trim());

        if (!email.trim() || !password.trim()) {
            setAuthError('Please fill all fields');
            setIsLoading(false);
            return;
        }

        try {
            console.log('🔍 Attempting login with:', { email: email.trim(), password: '***' });
            console.log('📊 Email to be sent:', email.trim());
            console.log('🔑 Password length to be sent:', password.length);
            
            const loginResponse = await login(email.trim(), password);
            const role = normalizeRole(loginResponse?.user?.role);
            const instructorRequestStatus = loginResponse?.user?.instructorRequestStatus;

            console.log('✅ Login successful, response:', loginResponse);
            console.log('👤 Normalized role for routing:', role);
            console.log('👤 instructorRequestStatus:', instructorRequestStatus);
            console.log('🎯 Role check for routing:');
            console.log(`  - Is admin: ${role === 'admin'}`);
            console.log(`  - Is instructor: ${role === 'instructor'}`);
            console.log(`  - Is student: ${role === 'student'}`);
            
            toast.success('Login Successful');

            // STEP 1A: Check location.state.from (HIGHEST PRIORITY)
            const from = location.state?.from?.pathname || location.state?.from;
            
            if (from) {
                console.log('[Login] redirecting to "from":', from);
                navigate(from);
                return; // STOP execution
            }

            // STEP 1B: Check applyInstructorIntent (SECOND PRIORITY)
            const applyInstructorIntent = localStorage.getItem("applyInstructorIntent");
            
            if (applyInstructorIntent === "true") {
                // Redirect immediately to /apply-instructor 
                localStorage.removeItem("applyInstructorIntent");
                navigate("/apply-instructor");
                return; // STOP execution
            }

            // STEP 2: Check instructorStatus (THIRD PRIORITY)
            if (instructorRequestStatus === "pending") {
                navigate("/apply-instructor");
                return; // STOP execution
            }

            // STEP 3: Only if NO from, NO intent, and NO pending status, run role-based logic
            const destination =
                role === 'admin' ? '/admin-dashboard' :
                role === 'instructor' ? '/teacher-dashboard' :
                '/dashboard';

            console.log('[Login] role-based destination:', destination);
            navigate(destination);
        } catch (err) {
            const msg = err.response?.data?.message || 'Login failed';
            setAuthError(msg);
            toast.error(msg);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-wrapper">
            <div className="auth-card">
                <div className="auth-image-side">
                    <img src="/assets/login.jpeg" alt="Authentication" />
                </div>

                <div className="auth-form-side">
                    <h2>Welcome Back</h2>
                    <p className="subtitle">
                        Login to your XOON account
                    </p>

                    {authError && (
                        <div style={{
                            backgroundColor: 'rgba(239, 68, 68, 0.08)',
                            color: 'var(--error)',
                            padding: '0.75rem',
                            borderRadius: 'var(--radius)',
                            marginBottom: '1.5rem',
                            fontSize: '0.875rem',
                            border: '1px solid var(--error)',
                            textAlign: 'center'
                        }}>
                            {authError}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} autoComplete="off">
                        <div style={{ marginBottom: '1.25rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: '500' }}>Email Address</label>
                            <div style={{ position: 'relative' }}>
                                <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                                <input
                                    type="email"
                                    name="xlms_user_email"
                                    id="xlms_user_email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    style={{ paddingLeft: '2.5rem' }}
                                    placeholder="Enter your email"
                                    autoComplete="new-off"
                                />
                            </div>
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: '500' }}>Password</label>
                            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                                <Lock size={18} style={{ position: 'absolute', left: '12px', color: 'var(--text-secondary)', pointerEvents: 'none', zIndex: 1 }} />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="xlms_user_password"
                                    id="xlms_user_password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    style={{
                                        paddingLeft: '2.5rem',
                                        paddingRight: '3rem', // Increased padding for eye icon and browser icons
                                        width: '100%'
                                    }}
                                    placeholder="Enter your password"
                                    autoComplete="new-password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{
                                        position: 'absolute',
                                        right: '8px',
                                        background: 'none',
                                        border: 'none',
                                        padding: '8px',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'var(--text-secondary)',
                                        zIndex: 2,
                                        transition: 'color 0.2s',
                                        outline: 'none'
                                    }}
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary"
                            style={{ width: '100%', padding: '0.75rem', fontWeight: '600', opacity: isLoading ? 0.7 : 1 }}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Signing In...' : 'Sign In'}
                        </button>
                    </form>

                    <p style={{ marginTop: '2rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                        Don't have an account? <Link to="/register" state={{ from: location.state?.from }} style={{ color: 'var(--primary)', fontWeight: '600' }}>Create account</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
