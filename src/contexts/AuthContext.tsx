
import React, { createContext, useContext, useState, useEffect } from 'react';
import { firebaseAuth } from '@/lib/firebase';

interface User {
  uid: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (userData: User) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Controllo se ci sono credenziali salvate localmente
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
      } catch (error) {
        localStorage.removeItem('user');
      }
    }
    
    // Se Firebase è configurato, monitora lo stato di autenticazione
    if (firebaseAuth.isAuthenticated()) {
      const currentUser = firebaseAuth.getCurrentUser();
      if (currentUser && !savedUser) {
        const userData = {
          uid: currentUser.uid,
          email: currentUser.email,
          name: currentUser.name
        };
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
      }
    }
    
    setIsLoading(false);
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = async () => {
    try {
      await firebaseAuth.logout();
    } catch (error) {
      console.error('Errore durante il logout:', error);
    }
    // Pulisce sempre lo stato locale
    setUser(null);
    localStorage.removeItem('user');
  };

  const value = {
    user,
    isAuthenticated: !!user,
    login,
    logout,
    isLoading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
