import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';

const LoginPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await authAPI.login(form);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify({
        id: response.data.userId,
        email: response.data.email,
        fullName: response.data.fullName,
        role: response.data.role
      }));
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #1a237e 0%, #283593 50%, #3949ab 100%)'
    }}>
      <div style={{
        background: 'white', borderRadius: '12px', padding: '48px', width: '100%', maxWidth: '420px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🚌</div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#1a237e' }}>SmartBus Admin</h1>
          <p style={{ color: '#757575', marginTop: '8px' }}>Attendance & Safety Monitoring</p>
        </div>

        {error && (
          <div style={{
            background: '#ffebee', color: '#c62828', padding: '12px 16px',
            borderRadius: '8px', marginBottom: '20px', fontSize: '0.875rem'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: 500, fontSize: '0.875rem', color: '#757575' }}>
              Email Address
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="admin@smartbus.com"
              required
              style={{
                width: '100%', padding: '12px 14px', border: '1px solid #e0e0e0',
                borderRadius: '8px', fontSize: '0.9rem', outline: 'none'
              }}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: 500, fontSize: '0.875rem', color: '#757575' }}>
              Password
            </label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="Enter your password"
              required
              style={{
                width: '100%', padding: '12px 14px', border: '1px solid #e0e0e0',
                borderRadius: '8px', fontSize: '0.9rem', outline: 'none'
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', padding: '14px', background: loading ? '#9fa8da' : '#1a237e',
              color: 'white', border: 'none', borderRadius: '8px', fontSize: '1rem',
              fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', transition: 'background 0.2s'
            }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
