import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Home as HomeIcon, Map as MapIcon, Bell, Shield, LogOut, FileText } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export default function CitizenLayout() {
  const { role, logout } = useAuth();
  const location = useLocation();

  if (!role) {
    return <Navigate to="/login" replace />;
  }

  const navItems = [
    { path: '/citizen/dashboard', label: 'Dashboard', icon: HomeIcon },
    { path: '/citizen/map', label: 'Risk Map', icon: MapIcon },
    { path: '/citizen/alerts', label: 'Alerts', icon: Bell },
    { path: '/citizen/report', label: 'Report Incident', icon: FileText },
    { path: '/citizen/safety', label: 'Safety Tips', icon: Shield },
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <header className="bg-blue-600 text-white sticky top-0 z-50 shadow-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between max-w-7xl">
          <div className="flex items-center gap-2 font-bold text-xl">
            <Shield className="w-6 h-6" />
            <span className="hidden sm:inline">Disaster Alert - Citizen</span>
            <span className="sm:hidden">Alerts</span>
          </div>

          <nav className="flex items-center gap-4 sm:gap-6">
            {navItems.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                title={label}
                className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-white/80 ${location.pathname === path ? 'text-white border-b-2 border-white' : 'text-blue-100/70'
                  }`}
              >
                <Icon className="w-5 h-5" />
                <span className="hidden md:inline">{label}</span>
              </Link>
            ))}
            <button onClick={logout} className="flex items-center gap-2 text-sm font-medium text-red-200 hover:text-red-100 ml-4">
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
