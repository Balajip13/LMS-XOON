import { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

const normalizeRole = (role) => String(role || '').trim().toLowerCase();

// Create axios instance with environment variable
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000/api',
    timeout: 10000, // 10 second timeout
});

// Add a request interceptor to add the JWT token to headers
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Temporarily disable response interceptor to debug login issues
// Add a response interceptor to handle 401 errors globally
api.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('API Error:', error);
        console.error('Response:', error.response);
        
        if (error.response?.status === 401) {
            console.warn('Session expired or unauthorized request (401). Clearing auth state...');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            // Redirect to login page if not already there
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        try {
            const cachedUser = localStorage.getItem('user');
            return cachedUser ? JSON.parse(cachedUser) : null;
        } catch (error) {
            console.error('Error parsing cached user:', error);
            localStorage.removeItem('user');
            return null;
        }
    });
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initializeAuth = async () => {
            const storedToken = localStorage.getItem('token');
            
            // Basic validation to ensure token isn't "null", "undefined" or empty
            if (!storedToken || storedToken === 'null' || storedToken === 'undefined' || storedToken.trim() === '') {
                setLoading(false);
                return;
            }

            try {
                // Validate token format and expiration
                const decoded = jwtDecode(storedToken);
                const currentTime = Date.now() / 1000;
                
                if (decoded.exp < currentTime) {
                    console.warn('Token expired during initialization');
                    clearAuth();
                    setLoading(false);
                    return;
                }

                // Token is valid, set it in state
                setToken(storedToken);
                
                // Fetch fresh user data from server
                const response = await api.get('/users/profile');
                const userData = response.data?.user;
                
                if (userData && userData._id) {
                    const normalizedUser = { ...userData, role: normalizeRole(userData.role) };
                    console.log('[AuthContext] initialized user role:', normalizedUser.role);
                    setUser(normalizedUser);
                    localStorage.setItem('user', JSON.stringify(normalizedUser));
                } else {
                    console.warn('Invalid user data received from server');
                    clearAuth();
                }
            } catch (error) {
                console.error('Auth initialization error:', error);
                clearAuth();
            } finally {
                setLoading(false);
            }
        };

        initializeAuth();
    }, []);

    const clearAuth = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    };

    const login = async (email, password) => {
        try {
            console.log('🔍 AuthContext login called with:', { email, passwordLength: password?.length });
            
            const loginData = { email, password };
            console.log('📤 Sending login data:', { email: loginData.email, password: '***' });
            
            const response = await api.post('/users/login', loginData);
            console.log('✅ Login response received:', response.data);
            
            const { token: newToken, user: userData } = response.data;
            
            if (!newToken || !userData) {
                console.error('❌ Invalid login response - missing token or user data');
                throw new Error('Invalid login response');
            }

            console.log('🔐 Setting auth state with token and user data');
            const normalizedUser = { ...userData, role: normalizeRole(userData.role) };
            console.log('[AuthContext] login user role:', normalizedUser.role);
            setToken(newToken);
            setUser(normalizedUser);
            localStorage.setItem('token', newToken);
            localStorage.setItem('user', JSON.stringify(normalizedUser));
            
            return response.data;
        } catch (error) {
            console.error('❌ Login error in AuthContext:', error);
            clearAuth();
            throw error;
        }
    };

    const register = async (userData) => {
        try {
            console.log('🔍 AuthContext register called with:', userData);
            console.log('📤 Making POST request to /users/register with:', JSON.stringify(userData, null, 2));
            
            const response = await api.post('/users/register', userData);
            console.log('✅ Registration response received:', response.data);
            
            // DO NOT set token or user state after registration
            // DO NOT store anything in localStorage
            // Just return the success response
            
            return response.data;
        } catch (error) {
            console.error('❌ Registration error:', error);
            clearAuth();
            throw error;
        }
    };

    const logout = async () => {
        try {
            // Call logout endpoint if available
            await api.post('/users/logout');
        } catch (error) {
            console.warn('Logout endpoint error:', error);
        } finally {
            clearAuth();
        }
    };

    const refreshUser = async (updatedData = null) => {
        try {
            if (!token) {
                throw new Error('No token available for refresh');
            }

            let response;
            if (updatedData) {
                // Update user profile with new data
                response = await api.put('/users/profile', updatedData);
            } else {
                // Just fetch fresh user data
                response = await api.get('/users/profile');
            }

            const userData = response.data?.user;
            if (userData && userData._id) {
                const normalizedUser = { ...userData, role: normalizeRole(userData.role) };
                setUser(normalizedUser);
                localStorage.setItem('user', JSON.stringify(normalizedUser));
                return normalizedUser;
            } else {
                throw new Error('Invalid user data received');
            }
        } catch (error) {
            console.error('Error refreshing user data:', error);
            if (error.response?.status === 401) {
                clearAuth();
            }
            throw error;
        }
    };

    const value = {
        user,
        token,
        loading,
        login,
        register,
        logout,
        refreshUser,
        api,
        isAuthenticated: !!token && !!user
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default AuthContext;
