import { Routes, Route, Navigate } from 'react-router-dom';

import Login from './pages/Login';
import CitizenLayout from './components/layout/CitizenLayout';
import AdminLayout from './components/layout/AdminLayout';

import CitizenDashboard from './pages/CitizenDashboard';
import CitizenMap from './pages/CitizenMap';
import ReportIncident from './pages/ReportIncident';
import SafetyTips from './pages/SafetyTips';
import Alerts from './pages/Alerts';

import AdminDashboard from './pages/AdminDashboard';
import RescueTeams from './pages/RescueTeams';
import { useAuth } from './contexts/AuthContext';

export default function App() {
  const { role } = useAuth();
  
  return (
    <Routes>
      <Route 
        path="/" 
        element={
          role === 'admin' ? <Navigate to="/admin/dashboard" replace /> 
          : role === 'citizen' ? <Navigate to="/citizen/dashboard" replace /> 
          : <Navigate to="/login" replace />
        } 
      />
      <Route path="/login" element={<Login />} />

      {/* Citizen Routes */}
      <Route path="/citizen" element={<CitizenLayout />}>
        <Route path="dashboard" element={<CitizenDashboard />} />
        <Route path="map" element={<CitizenMap />} />
        <Route path="report" element={<ReportIncident />} />
        <Route path="safety" element={<SafetyTips />} />
        <Route path="alerts" element={<Alerts />} />
      </Route>

      {/* Admin Routes */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="teams"     element={<RescueTeams />} />
      </Route>
    </Routes>
  );
}
