import React, { useState, useEffect } from 'react';
import { routesAPI } from '../services/api';

const RouteManagement = () => {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRoute, setEditingRoute] = useState(null);
  const [form, setForm] = useState({ routeName: '', startPoint: '', endPoint: '', stoppages: [] });
  const [error, setError] = useState('');

  useEffect(() => { fetchRoutes(); }, []);

  const fetchRoutes = async () => {
    setLoading(true);
    try {
      const res = await routesAPI.getAll();
      setRoutes(res.data);
    } catch (err) {
      setError('Failed to load routes');
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingRoute(null);
    setForm({ routeName: '', startPoint: '', endPoint: '', stoppages: [] });
    setError('');
    setShowModal(true);
  };

  const openEditModal = (route) => {
    setEditingRoute(route);
    setForm({
      routeName: route.routeName, startPoint: route.startPoint || '',
      endPoint: route.endPoint || '', stoppages: route.stoppages || []
    });
    setError('');
    setShowModal(true);
  };

  const addStoppage = () => {
    setForm(prev => ({
      ...prev,
      stoppages: [...prev.stoppages, { stoppageName: '', latitude: '', longitude: '', sequenceOrder: prev.stoppages.length + 1, estimatedArrivalTime: '' }]
    }));
  };

  const updateStoppage = (idx, field, value) => {
    setForm(prev => ({
      ...prev,
      stoppages: prev.stoppages.map((s, i) => i === idx ? { ...s, [field]: value } : s)
    }));
  };

  const removeStoppage = (idx) => {
    setForm(prev => ({ ...prev, stoppages: prev.stoppages.filter((_, i) => i !== idx) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const data = {
        ...form,
        stoppages: form.stoppages.map(s => ({
          ...s,
          latitude: s.latitude ? parseFloat(s.latitude) : null,
          longitude: s.longitude ? parseFloat(s.longitude) : null,
          sequenceOrder: parseInt(s.sequenceOrder)
        }))
      };
      if (editingRoute) {
        await routesAPI.update(editingRoute.id, data);
      } else {
        await routesAPI.create(data);
      }
      setShowModal(false);
      fetchRoutes();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save route');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this route?')) return;
    try {
      await routesAPI.delete(id);
      fetchRoutes();
    } catch (err) {
      setError('Failed to delete route');
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Route Management</h1>
        <button className="btn btn-primary" onClick={openAddModal}>➕ Add Route</button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="card">
        {loading ? (
          <div className="loading">Loading routes...</div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Route Name</th>
                  <th>Start Point</th>
                  <th>End Point</th>
                  <th>Stoppages</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {routes.length === 0 ? (
                  <tr><td colSpan="6" style={{ textAlign: 'center', padding: '24px', color: '#757575' }}>No routes found</td></tr>
                ) : routes.map(route => (
                  <tr key={route.id}>
                    <td><strong>{route.routeName}</strong></td>
                    <td>{route.startPoint || '-'}</td>
                    <td>{route.endPoint || '-'}</td>
                    <td>{route.stoppages?.length || 0} stops</td>
                    <td>
                      <span className={`badge badge-${route.active !== false ? 'success' : 'secondary'}`}>
                        {route.active !== false ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ display: 'flex', gap: '6px' }}>
                      <button className="btn btn-outline btn-sm" onClick={() => openEditModal(route)}>✏️</button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(route.id)}>🗑️</button>
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
          <div className="modal" style={{ maxWidth: '700px' }}>
            <div className="modal-header">
              <h2 className="modal-title">{editingRoute ? 'Edit Route' : 'Add New Route'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            {error && <div className="error-message">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label>Route Name *</label>
                  <input className="form-control" value={form.routeName} onChange={e => setForm({...form, routeName: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>Start Point</label>
                  <input className="form-control" value={form.startPoint} onChange={e => setForm({...form, startPoint: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>End Point</label>
                  <input className="form-control" value={form.endPoint} onChange={e => setForm({...form, endPoint: e.target.value})} />
                </div>
              </div>

              <div style={{ marginTop: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Stoppages</h3>
                  <button type="button" className="btn btn-outline btn-sm" onClick={addStoppage}>+ Add Stop</button>
                </div>
                {form.stoppages.map((stop, idx) => (
                  <div key={idx} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr auto', gap: '8px', marginBottom: '8px', alignItems: 'end' }}>
                    <div>
                      <label style={{ fontSize: '0.75rem', color: '#757575' }}>Stop Name</label>
                      <input className="form-control" value={stop.stoppageName} onChange={e => updateStoppage(idx, 'stoppageName', e.target.value)} placeholder="Stop name" />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.75rem', color: '#757575' }}>Latitude</label>
                      <input className="form-control" value={stop.latitude} onChange={e => updateStoppage(idx, 'latitude', e.target.value)} placeholder="Lat" type="number" step="any" />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.75rem', color: '#757575' }}>Longitude</label>
                      <input className="form-control" value={stop.longitude} onChange={e => updateStoppage(idx, 'longitude', e.target.value)} placeholder="Lng" type="number" step="any" />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.75rem', color: '#757575' }}>ETA</label>
                      <input className="form-control" value={stop.estimatedArrivalTime} onChange={e => updateStoppage(idx, 'estimatedArrivalTime', e.target.value)} placeholder="e.g. 07:30 AM" />
                    </div>
                    <button type="button" style={{ background: '#ffebee', border: 'none', borderRadius: '6px', padding: '10px', cursor: 'pointer', color: '#c62828' }} onClick={() => removeStoppage(idx)}>✕</button>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '16px' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editingRoute ? 'Update' : 'Create'} Route</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RouteManagement;
