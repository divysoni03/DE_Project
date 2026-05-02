import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ShieldAlert, LogOut, LayoutDashboard, Users } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export default function AdminLayout() {
  const { role, logout } = useAuth();
  const location = useLocation();

  // Only block if explicitly not admin (allow during first render while localStorage hydrates)
  if (role !== null && role !== 'admin') {
    return <Navigate to="/login" replace />;
  }

  // If role is still null (initial hydration), show loading state instead of redirecting
  if (role === null) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-slate-400 text-sm animate-pulse">Loading admin panel...</div>
      </div>
    );
  }

  const navItems = [
    { path: '/admin/dashboard', label: 'Command Center', icon: LayoutDashboard },
    { path: '/admin/teams',     label: 'Rescue Teams',  icon: Users },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans">
      <header className="bg-slate-950 border-b border-slate-800 sticky top-0 z-50 shadow-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between max-w-7xl">
          <div className="flex items-center gap-3 font-bold text-xl text-red-500">
            <ShieldAlert className="w-6 h-6" />
            <span>HQ Command</span>
          </div>

          <nav className="flex items-center gap-6">
            {navItems.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-red-400 ${
                  location.pathname === path ? 'text-red-500' : 'text-slate-400'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="hidden md:inline">{label}</span>
              </Link>
            ))}
            <button onClick={logout} className="flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-white ml-4">
              <LogOut className="w-5 h-5" />
              <span className="hidden md:inline">Logout</span>
            </button>
          </nav>
        </div>
      </header>
      <main className="container mx-auto max-w-7xl py-6 px-4 md:px-8">
        <Outlet />
      </main>
    </div>
  );
}
