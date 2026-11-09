import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const AuthContext = createContext(null);
const API_URL = 'http://localhost:5000/api/auth';

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('campuscare_token') || '');
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('campuscare_user');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  useEffect(() => {
    if (token) {
      localStorage.setItem('campuscare_token', token);
    } else {
      localStorage.removeItem('campuscare_token');
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('campuscare_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('campuscare_user');
    }
  }, [user]);

  const login = async (credentials) => {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    const data = await response.json();

    if (!response.ok) {
      const message = data?.message || data?.errors?.[0]?.msg || 'Login failed. Please try again.';
      throw new Error(message);
    }

    setToken(data.token);
    setUser(data.user);
    return data;
  };

  const register = async (userData) => {
    const response = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();

    if (!response.ok) {
      const message = data?.message || data?.errors?.[0]?.msg || 'Registration failed. Please try again.';
      throw new Error(message);
    }

    setToken(data.token);
    setUser(data.user);
    return data;
  };

  const logout = () => {
    setToken('');
    setUser(null);
  };

  const updateUser = (updatedUser) => {
    setUser((currentUser) => ({ ...currentUser, ...updatedUser }));
  };

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token && user),
      login,
      register,
      logout,
      updateUser,
    }),
    [token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}

export default AuthContext;
