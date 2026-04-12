import React, { useState, useEffect } from 'react';
import { attendanceAPI, busesAPI } from '../services/api';

const statusColors = { PRESENT: 'success', ABSENT: 'danger', LATE: 'warning', EXCUSED: 'info' };

const AttendanceTracking = () => {
  const [attendance, setAttendance] = useState([]);
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    date: new Date().toISOString().split('T')[0],
    busId: ''
  });
  const [error, setError] = useState('');

  useEffect(() => {
    busesAPI.getAll().then(res => setBuses(res.data)).catch(() => {});
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    setLoading(true);
    setError('');
    try {
      const params = { date: filters.date };
      if (filters.busId) params.busId = filters.busId;
      const res = await attendanceAPI.getAll(params);
      setAttendance(res.data);
    } catch (err) {
      setError('Failed to load attendance');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchAttendance();
  };

  const stats = {
    total: attendance.length,
    present: attendance.filter(a => a.status === 'PRESENT').length,
    absent: attendance.filter(a => a.status === 'ABSENT').length,
    late: attendance.filter(a => a.status === 'LATE').length,
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Attendance Tracking</h1>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="card">
        <form style={{ display: 'flex', gap: '16px', alignItems: 'flex-end', flexWrap: 'wrap' }} onSubmit={handleSearch}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Date</label>
            <input type="date" className="form-control" value={filters.date}
              onChange={e => setFilters({ ...filters, date: e.target.value })} />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Bus</label>
            <select className="form-control" value={filters.busId}
              onChange={e => setFilters({ ...filters, busId: e.target.value })}>
              <option value="">All Buses</option>
              {buses.map(bus => <option key={bus.id} value={bus.id}>{bus.busNumber}</option>)}
            </select>
          </div>
          <button type="submit" className="btn btn-primary">🔍 Search</button>
          <button type="button" className="btn btn-outline"
            onClick={() => { setFilters({ date: new Date().toISOString().split('T')[0], busId: '' }); setTimeout(fetchAttendance, 0); }}>
            Clear
          </button>
        </form>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#e3f2fd' }}><span>👥</span></div>
          <div className="stat-info"><h3 style={{ color: '#0277bd' }}>{stats.total}</h3><p>Total Records</p></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#e8f5e9' }}><span>✅</span></div>
          <div className="stat-info"><h3 style={{ color: '#2e7d32' }}>{stats.present}</h3><p>Present</p></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#ffebee' }}><span>❌</span></div>
          <div className="stat-info"><h3 style={{ color: '#c62828' }}>{stats.absent}</h3><p>Absent</p></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#fff8e1' }}><span>⏰</span></div>
          <div className="stat-info"><h3 style={{ color: '#f57f17' }}>{stats.late}</h3><p>Late</p></div>
        </div>
      </div>

      <div className="card">
        {loading ? (
          <div className="loading">Loading attendance...</div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Roll No.</th>
                  <th>Student Name</th>
                  <th>Bus</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Location</th>
                </tr>
              </thead>
              <tbody>
                {attendance.length === 0 ? (
                  <tr><td colSpan="7" style={{ textAlign: 'center', padding: '24px', color: '#757575' }}>No attendance records found</td></tr>
                ) : attendance.map(record => (
                  <tr key={record.id}>
                    <td>{record.rollNumber}</td>
                    <td>{record.studentName}</td>
                    <td>{record.busNumber || '-'}</td>
                    <td><span className={`badge badge-${statusColors[record.status] || 'secondary'}`}>{record.status}</span></td>
                    <td>{record.attendanceDate}</td>
                    <td>{record.timestamp ? new Date(record.timestamp).toLocaleTimeString() : '-'}</td>
                    <td>{record.latitude ? `${record.latitude.toFixed(4)}, ${record.longitude.toFixed(4)}` : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendanceTracking;
