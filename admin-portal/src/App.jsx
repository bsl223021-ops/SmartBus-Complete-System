import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './styles/global.css';
import Navigation from './components/Navigation';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import StudentManagement from './pages/StudentManagement';
import BusManagement from './pages/BusManagement';
import RouteManagement from './pages/RouteManagement';
import AttendanceTracking from './pages/AttendanceTracking';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" replace />;
  return children;
};

const AppLayout = ({ children }) => (
  <div className="app-layout">
    <Navigation />
    <main className="main-content">{children}</main>
  </div>
);

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<ProtectedRoute><AppLayout><Dashboard /></AppLayout></ProtectedRoute>} />
        <Route path="/students" element={<ProtectedRoute><AppLayout><StudentManagement /></AppLayout></ProtectedRoute>} />
        <Route path="/buses" element={<ProtectedRoute><AppLayout><BusManagement /></AppLayout></ProtectedRoute>} />
        <Route path="/routes" element={<ProtectedRoute><AppLayout><RouteManagement /></AppLayout></ProtectedRoute>} />
        <Route path="/attendance" element={<ProtectedRoute><AppLayout><AttendanceTracking /></AppLayout></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
