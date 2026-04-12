import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';

const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const navItems = [
    { path: '/', label: 'Dashboard', icon: '📊' },
    { path: '/students', label: 'Students', icon: '🎒' },
    { path: '/buses', label: 'Buses', icon: '🚌' },
    { path: '/routes', label: 'Routes', icon: '🗺️' },
    { path: '/attendance', label: 'Attendance', icon: '✅' },
  ];

  const handleLogout = async () => {
    try {
      await authAPI.logout();
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login');
    }
  };

  return (
    <>
      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0, height: '60px',
        background: '#1a237e', color: 'white', display: 'flex',
        alignItems: 'center', padding: '0 24px', zIndex: 100,
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)', gap: '16px'
      }}>
        <button onClick={() => setSidebarOpen(!sidebarOpen)}
          style={{ background: 'none', border: 'none', color: 'white', fontSize: '1.5rem', cursor: 'pointer' }}>
          ☰
        </button>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 700 }}>🚌 SmartBus Admin</h1>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '0.875rem' }}>👤 {user.fullName || 'Admin'}</span>
          <button onClick={handleLogout}
            style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white',
              padding: '6px 14px', borderRadius: '6px', cursor: 'pointer' }}>
            Logout
          </button>
        </div>
      </header>

      <nav style={{
        position: 'fixed', top: '60px', left: 0, bottom: 0,
        width: sidebarOpen ? '260px' : '60px',
        background: '#1e1e2e', color: 'white', padding: '16px 0',
        transition: 'width 0.3s', overflow: 'hidden', zIndex: 90
      }}>
        {navItems.map(item => (
          <Link key={item.path} to={item.path}
            style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              padding: '12px 20px', color: location.pathname === item.path ? '#90caf9' : '#b0bec5',
              textDecoration: 'none', fontWeight: location.pathname === item.path ? 600 : 400,
              background: location.pathname === item.path ? 'rgba(144,202,249,0.1)' : 'transparent',
              borderLeft: location.pathname === item.path ? '3px solid #90caf9' : '3px solid transparent',
              transition: 'all 0.2s', whiteSpace: 'nowrap'
            }}>
            <span style={{ fontSize: '1.2rem', minWidth: '20px' }}>{item.icon}</span>
            {sidebarOpen && <span>{item.label}</span>}
          </Link>
        ))}
      </nav>
    </>
  );
};

export default Navigation;
