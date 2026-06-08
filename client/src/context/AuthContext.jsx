import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // Set default axios base URL and authorization header
  axios.defaults.baseURL = ''; // Use Vite server proxy

  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common['Authorization'];
  }

  // Load user data on startup if token exists
  useEffect(() => {
    const loadUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get('/api/auth/me');
        if (response.data.success) {
          setUser(response.data.data);
        } else {
          logout();
        }
      } catch (err) {
        console.error('Failed to load user profile:', err.message);
        logout();
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [token]);

  // Login handler
  const login = async (email, password, accessCode) => {
    try {
      const response = await axios.post('/api/auth/login', { email, password, accessCode });
      if (response.data.success) {
        const userData = response.data.data;
        localStorage.setItem('token', userData.token);
        setToken(userData.token);
        setUser({
          _id: userData._id,
          username: userData.username,
          email: userData.email,
          role: userData.role,
          badgeNumber: userData.badgeNumber
        });
        return { success: true };
      }
      return { success: false, message: response.data.message || 'Login failed' };
    } catch (err) {
      console.error('Login error:', err);
      const errMsg = err.response?.data?.message || 'Invalid email or password';
      return { success: false, message: errMsg };
    }
  };

  // Register handler
  const register = async (username, email, password, role, badgeNumber) => {
    try {
      const payload = { username, email, password };
      if (role) payload.role = role;
      if (badgeNumber) payload.badgeNumber = badgeNumber;

      const response = await axios.post('/api/auth/register', payload);
      
      if (response.data.success) {
        // If registering a citizen, auto-login them
        // If registering an officer (by an admin), do NOT overwrite current admin session token
        const userData = response.data.data;
        if (!user || user.role !== 'admin') {
          localStorage.setItem('token', userData.token);
          setToken(userData.token);
          setUser({
            _id: userData._id,
            username: userData.username,
            email: userData.email,
            role: userData.role,
            badgeNumber: userData.badgeNumber
          });
        }
        return { success: true, data: userData };
      }
      return { success: false, message: response.data.message || 'Registration failed' };
    } catch (err) {
      console.error('Registration error:', err);
      const errMsg = err.response?.data?.message || 'Email or username already exists';
      return { success: false, message: errMsg };
    }
  };

  // Logout handler
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
