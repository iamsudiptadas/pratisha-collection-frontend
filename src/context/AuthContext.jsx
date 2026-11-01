import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [token, setToken]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('pc_token');
    const savedUser  = localStorage.getItem('pc_user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const loginUser = (userData, tokenData) => {
    setUser(userData);
    setToken(tokenData);
    localStorage.setItem('pc_token', tokenData);
    localStorage.setItem('pc_user', JSON.stringify(userData));
  };

  const logoutUser = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('pc_token');
    localStorage.removeItem('pc_user');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, loginUser, logoutUser, isAdmin: user?.role === 'admin' }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
