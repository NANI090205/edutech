import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser && token) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        // Corrupted user data in storage
        logout();
      }
    } else {
      setUser(null);
    }
    setLoading(false);
  }, [token]);

  const login = (data) => {
    localStorage.setItem('token', data.token);
    const userProfile = {
      userId: data.userId,
      name: data.name,
      email: data.email,
      role: data.role,
      profileImage: data.profileImage,
    };
    localStorage.setItem('user', JSON.stringify(userProfile));
    setToken(data.token);
    setUser(userProfile);
  };

  const updateUserProfile = (updatedProfile) => {
    const updatedUser = { ...user, ...updatedProfile };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const isAdmin = () => {
    return user && user.role === 'ADMIN';
  };

  const isStudent = () => {
    return user && user.role === 'STUDENT';
  };

  return (
    <AuthContext.Provider value={{ token, user, loading, login, logout, isAdmin, isStudent, updateUserProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
