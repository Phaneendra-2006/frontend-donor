import { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';

const AuthContext = createContext(null);

const normalizeAuthPayload = (payload) => {
  if (!payload) {
    return { token: null, user: null };
  }

  // Supports both shapes:
  // 1) { token, user: { id, name, email, role } }
  // 2) { token, id, name, email, role }
  const token = payload.token ?? null;
  const user = payload.user
    ? payload.user
    : payload.id || payload.email || payload.role
      ? {
          id: payload.id,
          name: payload.name,
          email: payload.email,
          role: payload.role,
        }
      : null;

  return { token, user };
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setToken(storedToken);
        setUser(parsedUser);
      } catch (error) {
        console.error('Invalid auth data in localStorage, clearing session', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      const { token, user } = normalizeAuthPayload(response.data);

      if (!token || !user) {
        throw new Error('Invalid login response from server');
      }
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setToken(token);
      setUser(user);
      
      toast.success('Login successful!');
      return user;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      const { token, user } = normalizeAuthPayload(response.data);

      if (!token || !user) {
        throw new Error('Invalid registration response from server');
      }
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setToken(token);
      setUser(user);
      
      toast.success('Registration successful!');
      return user;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
      throw error;
    }
  };

  const googleLogin = async (googleToken) => {
    try {
      const response = await api.post('/auth/google', { token: googleToken });
      const { token, user } = normalizeAuthPayload(response.data);

      if (!token || !user) {
        throw new Error('Invalid Google login response from server');
      }
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setToken(token);
      setUser(user);
      
      toast.success('Google login successful!');
      return user;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Google login failed');
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    toast.info('Logged out successfully');
  };

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    register,
    googleLogin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
