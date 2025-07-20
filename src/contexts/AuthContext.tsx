
import React, { createContext, useContext, useState, useEffect } from 'react';
import { firebaseAuth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { getAuth } from 'firebase/auth';

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
    const auth = getAuth();
    
    // Listener per i cambiamenti di stato dell'autenticazione Firebase
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const userData = {
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Utente'
        };
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
      } else {
        setUser(null);
        localStorage.removeItem('user');
      }
      setIsLoading(false);
    });

    // Cleanup del listener
    return () => unsubscribe();
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = async () => {
    try {
      await firebaseAuth.logout();
      // Lo stato verrà aggiornato automaticamente dal listener onAuthStateChanged
    } catch (error) {
      console.error('Errore durante il logout:', error);
      // Fallback: pulisce manualmente lo stato locale
      setUser(null);
      localStorage.removeItem('user');
    }
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
