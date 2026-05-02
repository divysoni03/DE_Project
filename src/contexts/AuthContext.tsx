import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

export type UserRole = 'citizen' | 'admin' | null;

interface AuthContextType {
  role: UserRole;
  email: string | null;
  login: (role: UserRole, email?: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<UserRole>(() => {
    const saved = localStorage.getItem('disaster_portal_role');
    return (saved as UserRole) || null;
  });

  const [email, setEmail] = useState<string | null>(() =>
    localStorage.getItem('disaster_portal_email') || null
  );

  const login = (newRole: UserRole, userEmail?: string) => {
    setRole(newRole);
    setEmail(userEmail ?? null);
    if (newRole) localStorage.setItem('disaster_portal_role', newRole);
    if (userEmail) localStorage.setItem('disaster_portal_email', userEmail);
  };

  const logout = () => {
    setRole(null);
    setEmail(null);
    localStorage.removeItem('disaster_portal_role');
    localStorage.removeItem('disaster_portal_email');
  };

  return (
    <AuthContext.Provider value={{ role, email, login, logout }}>
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
