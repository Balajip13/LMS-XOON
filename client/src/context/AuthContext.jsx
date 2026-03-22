import { createContext, useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

const normalizeRole = (role) => String(role || '').trim().toLowerCase();

// ✅ FIXED BASE URL (WITH /api)
const api = axios.create({
    baseURL: `${import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000'}/api`, // ✅ FIXED - with /api
    timeout: 10000,
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

// Add a response interceptor to handle 401 errors globally
api.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('API Error:', error);
        console.error('Response:', error.response);
        
        if (error.response?.status === 401) {
            const reqUrl = error.config?.url || '';
            if (reqUrl.includes('/users/login') || reqUrl.includes('/users/register')) {
                return Promise.reject(error);
            }
            console.warn('Session expired or unauthorized request (401). Clearing auth state...');
            window.dispatchEvent(new CustomEvent('auth:unauthorized'));
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

    const clearAuth = useCallback(() => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    }, []);

    useEffect(() => {
        const onUnauthorized = () => {
            clearAuth();
        };
        window.addEventListener('auth:unauthorized', onUnauthorized);
        return () => window.removeEventListener('auth:unauthorized', onUnauthorized);
    }, [clearAuth]);

    useEffect(() => {
        const initializeAuth = async () => {
            const storedToken = localStorage.getItem('token');
            
            if (!storedToken || storedToken === 'null' || storedToken === 'undefined' || storedToken.trim() === '') {
                setLoading(false);
                return;
            }

            try {
                const decoded = jwtDecode(storedToken);
                const currentTime = Date.now() / 1000;
                
                if (decoded.exp < currentTime) {
                    clearAuth();
                    setLoading(false);
                    return;
                }

                setToken(storedToken);
                
                const response = await api.get('/users/profile');
                const userData = response.data?.user;
                
                if (userData && userData._id) {
                    const normalizedUser = { ...userData, role: normalizeRole(userData.role) };
                    setUser(normalizedUser);
                    localStorage.setItem('user', JSON.stringify(normalizedUser));
                } else {
                    clearAuth();
                }
            } catch (error) {
                clearAuth();
            } finally {
                setLoading(false);
            }
        };

        initializeAuth();
    }, [clearAuth]);

    const login = async (email, password) => {
        const response = await api.post('/users/login', { email, password });
        const { token: newToken, user: userData } = response.data;

        const normalizedUser = { ...userData, role: normalizeRole(userData.role) };
        setToken(newToken);
        setUser(normalizedUser);
        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(normalizedUser));

        return response.data;
    };

    const register = async (userData) => {
        const response = await api.post('/users/register', userData);
        return response.data;
    };

    const logout = async () => {
        try {
            await api.post('/users/logout');
        } catch (error) {}
        clearAuth();
    };

    const refreshUser = async (updatedData = null) => {
        let response;
        if (updatedData) {
            response = await api.put('/users/profile', updatedData);
        } else {
            response = await api.get('/users/profile');
        }

        const userData = response.data?.user;
        const normalizedUser = { ...userData, role: normalizeRole(userData.role) };
        setUser(normalizedUser);
        localStorage.setItem('user', JSON.stringify(normalizedUser));
        return normalizedUser;
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
    return useContext(AuthContext);
};

export default AuthContext;