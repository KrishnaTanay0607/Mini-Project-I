import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [token, setToken]     = useState(() => localStorage.getItem('sh_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) { setLoading(false); return; }
    const verify = async () => {
      try {
        const res  = await fetch('http://localhost:5000/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const text = await res.text();
        let data;
        try { data = JSON.parse(text); } catch { throw new Error('Invalid response'); }
        if (res.ok) {
          setUser(data.user);
          localStorage.setItem('sh_user', JSON.stringify(data.user));
        } else {
          logout();
        }
      } catch {
        // Backend offline — restore cached user
        const saved = localStorage.getItem('sh_user');
        if (saved) { try { setUser(JSON.parse(saved)); } catch {} }
      } finally {
        setLoading(false);
      }
    };
    verify();
  }, [token]);

  const login = (userData, jwt) => {
    setUser(userData);
    if (jwt) {
      setToken(jwt);
      localStorage.setItem('sh_token', jwt);
    }
    localStorage.setItem('sh_user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('sh_token');
    localStorage.removeItem('sh_user');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
