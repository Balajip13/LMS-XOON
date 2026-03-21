import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const Login = () => {
    const { api, setUser } = useAuth();
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const { data } = await api.post('/users/login', { email, password }); // ✅ CORRECT

            setUser(data.user);

            toast.success('Login successful');

            if (data.user.role === 'admin') {
                navigate('/admin-dashboard');
            } else if (data.user.role === 'instructor') {
                navigate('/teacher-dashboard');
            } else {
                navigate('/dashboard');
            }

        } catch (err) {
            const msg = err.response?.data?.message || 'Login failed';
            setError(msg);
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h2>Login</h2>

            {error && <p style={{ color: 'red' }}>{error}</p>}

            <form onSubmit={handleSubmit}>
                <input
                    type="email"
                    placeholder="Email"
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />

                <input
                    type="password"
                    placeholder="Password"
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />

                <button type="submit" disabled={loading}>
                    {loading ? 'Loading...' : 'Login'}
                </button>
            </form>

            <Link to="/register">Register</Link>
        </div>
    );
};

export default Login;