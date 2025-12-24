import React, { createContext, useState, useEffect } from 'react';
import { onAuthChange } from '../config/firebase';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentUsername, setCurrentUsername] = useState(
    () => localStorage.getItem('currentUsername') || null
  );
  const [isAdmin, setIsAdmin] = useState(
    () => localStorage.getItem('isAdmin') === 'true'
  );

  useEffect(() => {
    const unsubscribe = onAuthChange((authUser) => {
      setUser(authUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (currentUsername) {
      localStorage.setItem('currentUsername', currentUsername);
    } else {
      localStorage.removeItem('currentUsername');
    }
  }, [currentUsername]);

  useEffect(() => {
    localStorage.setItem('isAdmin', isAdmin ? 'true' : 'false');
  }, [isAdmin]);

  const value = {
    user,
    loading,
    currentUsername,
    setCurrentUsername,
    isAdmin,
    setIsAdmin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
