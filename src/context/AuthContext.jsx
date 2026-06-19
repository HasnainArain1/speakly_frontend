/**
 * Authentication context provider.
 * Manages user session, token storage, and role-based state.
 */

import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('speakly_token'));
  const [loading, setLoading] = useState(true);
  const [demoModeEnabled, setDemoModeEnabled] = useState(false);

  // On mount: verify existing token + check demo config
  useEffect(() => {
    // Check if demo mode is enabled
    authAPI.getConfig()
      .then((res) => setDemoModeEnabled(res.data.demo_mode_enabled))
      .catch(() => setDemoModeEnabled(false));

    if (token) {
      authAPI.getMe()
        .then((res) => {
          setUser(res.data);
          localStorage.setItem('speakly_user', JSON.stringify(res.data));
        })
        .catch(() => {
          logout();
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const res = await authAPI.login(email, password);
    const { access_token, role, name } = res.data;
    localStorage.setItem('speakly_token', access_token);
    setToken(access_token);

    // Fetch full user profile
    const meRes = await authAPI.getMe();
    setUser(meRes.data);
    localStorage.setItem('speakly_user', JSON.stringify(meRes.data));

    return meRes.data;
  };

  const register = async (data) => {
    const res = await authAPI.register(data);
    return res.data;
  };

  // TEMPORARY — Demo signup for MVP testing
  const demoSignup = async (data) => {
    const res = await authAPI.demoSignup(data);
    const { access_token, role, name } = res.data;
    localStorage.setItem('speakly_token', access_token);
    setToken(access_token);

    // Fetch full user profile
    const meRes = await authAPI.getMe();
    setUser(meRes.data);
    localStorage.setItem('speakly_user', JSON.stringify(meRes.data));

    return meRes.data;
  };

  const logout = () => {
    localStorage.removeItem('speakly_token');
    localStorage.removeItem('speakly_user');
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    loading,
    demoModeEnabled,
    isAuthenticated: !!token && !!user,
    login,
    register,
    demoSignup,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;

