import React, { createContext, useContext, useState, ReactNode } from 'react';

export type UserRole = 'citizen' | 'admin' | null;

interface AuthContextType {
  role: UserRole;
  login: (role: UserRole) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  // Initialize from localStorage to survive page refreshes
  const [role, setRole] = useState<UserRole>(() => {
    const saved = localStorage.getItem('disaster_portal_role');
    console.log("Auth Restored from Local Storage:", saved);
    return (saved as UserRole) || null;
  });

  const login = (newRole: UserRole) => {
    setRole(newRole);
    if (newRole) {
      localStorage.setItem('disaster_portal_role', newRole);
    }
  };

  const logout = () => {
    setRole(null);
    localStorage.removeItem('disaster_portal_role');
  };

  return (
    <AuthContext.Provider value={{ role, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
