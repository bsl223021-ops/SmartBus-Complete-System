import React, { useState, useEffect } from 'react';
import { busesAPI, usersAPI, routesAPI } from '../services/api';

const statusColors = { ACTIVE: 'success', INACTIVE: 'secondary', MAINTENANCE: 'warning' };

const BusManagement = () => {
  const [buses, setBuses] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBus, setEditingBus] = useState(null);
  const [form, setForm] = useState({ busNumber: '', busModel: '', capacity: '', driverId: '', status: 'ACTIVE', routeId: '' });
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => {
    fetchBuses();
    usersAPI.getAll({ role: 'DRIVER' }).then(res => setDrivers(res.data)).catch(() => {});
    routesAPI.getAll().then(res => setRoutes(res.data)).catch(() => {});
  }, []);

  const fetchBuses = async () => {
    setLoading(true);
    try {
      const res = await busesAPI.getAll(filterStatus ? { status: filterStatus } : {});
      setBuses(res.data);
    } catch (err) {
      setError('Failed to load buses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBuses(); }, [filterStatus]);

  const openAddModal = () => {
    setEditingBus(null);
    setForm({ busNumber: '', busModel: '', capacity: '', driverId: '', status: 'ACTIVE', routeId: '' });
    setError('');
    setShowModal(true);
  };

  const openEditModal = (bus) => {
    setEditingBus(bus);
    setForm({
      busNumber: bus.busNumber, busModel: bus.busModel || '',
      capacity: bus.capacity || '', driverId: bus.driverId || '',
      status: bus.status, routeId: bus.routeId || ''
    });
    setError('');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const data = { ...form, capacity: form.capacity ? parseInt(form.capacity) : null, driverId: form.driverId || null, routeId: form.routeId || null };
      if (editingBus) {
        await busesAPI.update(editingBus.id, data);
      } else {
        await busesAPI.create(data);
      }
      setShowModal(false);
      fetchBuses();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save bus');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this bus?')) return;
    try {
      await busesAPI.delete(id);
      fetchBuses();
    } catch (err) {
      setError('Failed to delete bus');
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Bus Management</h1>
        <button className="btn btn-primary" onClick={openAddModal}>➕ Add Bus</button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="stats-grid" style={{ marginBottom: '24px' }}>
        {['All', 'ACTIVE', 'INACTIVE', 'MAINTENANCE'].map(s => (
          <button key={s} className={`btn ${filterStatus === (s === 'All' ? '' : s) ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setFilterStatus(s === 'All' ? '' : s)}>
            {s === 'All' ? '📋 All Buses' : s === 'ACTIVE' ? '✅ Active' : s === 'INACTIVE' ? '❌ Inactive' : '🔧 Maintenance'}
          </button>
        ))}
      </div>

      <div className="card">
        {loading ? (
          <div className="loading">Loading buses...</div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Bus Number</th>
                  <th>Model</th>
                  <th>Capacity</th>
                  <th>Driver</th>
                  <th>Route</th>
                  <th>Status</th>
                  <th>Last Location</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {buses.length === 0 ? (
                  <tr><td colSpan="8" style={{ textAlign: 'center', padding: '24px', color: '#757575' }}>No buses found</td></tr>
                ) : buses.map(bus => (
                  <tr key={bus.id}>
                    <td><strong>{bus.busNumber}</strong></td>
                    <td>{bus.busModel || '-'}</td>
                    <td>{bus.capacity || '-'}</td>
                    <td>{bus.driverName || <span style={{ color: '#757575' }}>Unassigned</span>}</td>
                    <td>{bus.routeName || <span style={{ color: '#757575' }}>No Route</span>}</td>
                    <td><span className={`badge badge-${statusColors[bus.status] || 'secondary'}`}>{bus.status}</span></td>
                    <td>
                      {bus.currentLatitude ? `${bus.currentLatitude.toFixed(4)}, ${bus.currentLongitude.toFixed(4)}` : '-'}
                    </td>
                    <td style={{ display: 'flex', gap: '6px' }}>
                      <button className="btn btn-outline btn-sm" onClick={() => openEditModal(bus)}>✏️</button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(bus.id)}>🗑️</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2 className="modal-title">{editingBus ? 'Edit Bus' : 'Add New Bus'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            {error && <div className="error-message">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label>Bus Number *</label>
                  <input className="form-control" value={form.busNumber} onChange={e => setForm({...form, busNumber: e.target.value})} required disabled={!!editingBus} />
                </div>
                <div className="form-group">
                  <label>Bus Model</label>
                  <input className="form-control" value={form.busModel} onChange={e => setForm({...form, busModel: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Capacity</label>
                  <input className="form-control" type="number" value={form.capacity} onChange={e => setForm({...form, capacity: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select className="form-control" value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                    <option value="MAINTENANCE">Maintenance</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Assigned Driver</label>
                  <select className="form-control" value={form.driverId} onChange={e => setForm({...form, driverId: e.target.value})}>
                    <option value="">-- None --</option>
                    {drivers.map(d => <option key={d.id} value={d.id}>{d.fullName}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Assigned Route</label>
                  <select className="form-control" value={form.routeId} onChange={e => setForm({...form, routeId: e.target.value})}>
                    <option value="">-- None --</option>
                    {routes.map(r => <option key={r.id} value={r.id}>{r.routeName}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '16px' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editingBus ? 'Update' : 'Create'} Bus</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BusManagement;
