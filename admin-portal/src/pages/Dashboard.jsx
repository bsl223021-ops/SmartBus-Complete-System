import React, { useState, useEffect } from 'react';
import { studentsAPI, busesAPI, routesAPI, attendanceAPI } from '../services/api';

const StatCard = ({ icon, title, value, color }) => (
  <div className="stat-card">
    <div className="stat-icon" style={{ background: `${color}20` }}>
      <span>{icon}</span>
    </div>
    <div className="stat-info">
      <h3 style={{ color }}>{value}</h3>
      <p>{title}</p>
    </div>
  </div>
);

const Dashboard = () => {
  const [stats, setStats] = useState({ students: 0, buses: 0, routes: 0, presentToday: 0 });
  const [recentAttendance, setRecentAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [studentsRes, busesRes, routesRes, attendanceRes] = await Promise.allSettled([
          studentsAPI.getAll(),
          busesAPI.getAll(),
          routesAPI.getAll(),
          attendanceAPI.getAll({ date: new Date().toISOString().split('T')[0] }),
        ]);

        setStats({
          students: studentsRes.status === 'fulfilled' ? studentsRes.value.data.length : 0,
          buses: busesRes.status === 'fulfilled' ? busesRes.value.data.length : 0,
          routes: routesRes.status === 'fulfilled' ? routesRes.value.data.length : 0,
          presentToday: attendanceRes.status === 'fulfilled'
            ? attendanceRes.value.data.filter(a => a.status === 'PRESENT').length : 0,
        });

        if (attendanceRes.status === 'fulfilled') {
          setRecentAttendance(attendanceRes.value.data.slice(0, 5));
        }
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="loading">Loading dashboard...</div>;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <span style={{ color: '#757575', fontSize: '0.875rem' }}>
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </span>
      </div>

      <div className="stats-grid">
        <StatCard icon="🎒" title="Total Students" value={stats.students} color="#1a237e" />
        <StatCard icon="🚌" title="Total Buses" value={stats.buses} color="#ff6f00" />
        <StatCard icon="🗺️" title="Active Routes" value={stats.routes} color="#2e7d32" />
        <StatCard icon="✅" title="Present Today" value={stats.presentToday} color="#0277bd" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        <div className="card">
          <h2 style={{ marginBottom: '16px', fontSize: '1.1rem', fontWeight: 600 }}>Today's Attendance</h2>
          {recentAttendance.length === 0 ? (
            <p style={{ color: '#757575', textAlign: 'center', padding: '20px' }}>No attendance records for today</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Roll No.</th>
                  <th>Status</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {recentAttendance.map(record => (
                  <tr key={record.id}>
                    <td>{record.studentName}</td>
                    <td>{record.rollNumber}</td>
                    <td>
                      <span className={`badge badge-${record.status === 'PRESENT' ? 'success' : record.status === 'ABSENT' ? 'danger' : 'warning'}`}>
                        {record.status}
                      </span>
                    </td>
                    <td>{record.timestamp ? new Date(record.timestamp).toLocaleTimeString() : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="card">
          <h2 style={{ marginBottom: '16px', fontSize: '1.1rem', fontWeight: 600 }}>Quick Actions</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { label: 'Add New Student', icon: '➕', href: '/students' },
              { label: 'Register New Bus', icon: '🚌', href: '/buses' },
              { label: 'Create Route', icon: '🗺️', href: '/routes' },
              { label: 'View Attendance Report', icon: '📊', href: '/attendance' },
            ].map(action => (
              <a key={action.label} href={action.href} style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '12px 16px', background: '#f5f5f5', borderRadius: '8px',
                textDecoration: 'none', color: '#1a237e', fontWeight: 500,
                transition: 'background 0.2s'
              }}>
                <span>{action.icon}</span>
                <span>{action.label}</span>
                <span style={{ marginLeft: 'auto' }}>→</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
