import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-hot-toast';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const { register } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Dynamic handleChange function
    const handleChange = (e) => {
        const { name, value } = e.target;
        console.log(`🔄 Input changed: ${name} = "${value}"`);
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log('🔍 Registration form submitted!');
        console.log('📊 Form data:', formData);
        setError('');
        setIsLoading(true);

        // Extract values from formData
        const { name, email, password, confirmPassword } = formData;

        // Debug: Log the current values
        console.log('Registration attempt with:', { name, email, password, confirmPassword });
        console.log('Name trimmed:', name.trim());
        console.log('Email trimmed:', email.trim());
        console.log('Password length:', password.length);
        console.log('Confirm password length:', confirmPassword.length);

        // Validations
        if (!name.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
            console.log('❌ Validation failed: Empty fields detected');
            setError('Please fill all the required fields');
            setIsLoading(false);
            return;
        }

        if (password !== confirmPassword) {
            console.log('❌ Validation failed: Passwords do not match');
            setError('Passwords do not match');
            setIsLoading(false);
            return;
        }

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
        if (!passwordRegex.test(password)) {
            console.log('❌ Validation failed: Weak password');
            setError('Password must be at least 8 characters and include uppercase, lowercase, number, and special character.');
            setIsLoading(false);
            return;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
            console.log('❌ Validation failed: Invalid email');
            setError('Please provide a valid email address');
            setIsLoading(false);
            return;
        }

        console.log('✅ All validations passed, attempting registration...');

        try {
            const registerData = {
                name: name.trim(),
                email: email.trim(),
                password: password
            };
            console.log('📤 Sending data to backend:', registerData);
            console.log('📤 Raw data being sent:', JSON.stringify(registerData, null, 2));
            
            await register(registerData);
            toast.success('Registration successful! Please login.');
            navigate('/login', {
                state: {
                    message: 'Registration successful! Please login with your credentials.',
                    registeredEmail: registerData.email
                }
            });
        } catch (err) {
            console.error('❌ Registration error:', err);
            console.error('Error response:', err.response);
            const errorMessage = err.response?.data?.message || 'Registration failed';
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
            console.log('🏁 Registration process completed');
        }
    };

    return (
        <div className="auth-wrapper">
            <div className="auth-card">
                <div className="auth-image-side">
                    <img src="/assets/login.jpeg" alt="Authentication" />
                </div>

                <div className="auth-form-side">
                    <h2>Join XOON</h2>
                    <p className="subtitle">
                        Create your account to start learning
                    </p>

                    {error && (
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
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} autoComplete="off">
                        <div style={{ marginBottom: '1.25rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: '500' }}>Full Name</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    autoComplete="off"
                                    placeholder="Enter your full name"
                                />
                            </div>
                        </div>

                        <div style={{ marginBottom: '1.25rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: '500' }}>Email Address</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    autoComplete="off"
                                    placeholder="Enter your email"
                                />
                            </div>
                        </div>

                        <div style={{ marginBottom: '1.25rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: '500' }}>Password</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    autoComplete="new-password"
                                    placeholder="Create a password"
                                    style={{ paddingRight: '2.5rem' }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{
                                        position: 'absolute',
                                        right: '12px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        color: 'var(--text-secondary)',
                                        display: 'flex',
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        padding: '4px'
                                    }}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <div style={{ marginBottom: '2rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: '500' }}>Confirm Password</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    required
                                    autoComplete="new-password"
                                    placeholder="Repeat your password"
                                    style={{ paddingRight: '2.5rem' }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    style={{
                                        position: 'absolute',
                                        right: '12px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        color: 'var(--text-secondary)',
                                        display: 'flex',
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        padding: '4px'
                                    }}
                                >
                                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary"
                            style={{ width: '100%', padding: '0.75rem', fontWeight: '600', opacity: isLoading ? 0.7 : 1 }}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Creating Account...' : 'Register'}
                        </button>
                    </form>

                    <p style={{ marginTop: '1.5rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                        Already have an account? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: '600' }}>Sign In</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;
