import React, { useState, useEffect } from 'react';
import { studentsAPI, busesAPI } from '../services/api';

const StudentManagement = () => {
  const [students, setStudents] = useState([]);
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [form, setForm] = useState({
    rollNumber: '', fullName: '', parentEmail: '', parentPhone: '',
    grade: '', section: '', boardingPoint: '', busId: ''
  });
  const [error, setError] = useState('');
  const [qrModal, setQrModal] = useState(null);

  useEffect(() => {
    fetchStudents();
    busesAPI.getAll().then(res => setBuses(res.data)).catch(() => {});
  }, []);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await studentsAPI.getAll(search ? { name: search } : {});
      setStudents(res.data);
    } catch (err) {
      setError('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchStudents();
  };

  const openAddModal = () => {
    setEditingStudent(null);
    setForm({ rollNumber: '', fullName: '', parentEmail: '', parentPhone: '', grade: '', section: '', boardingPoint: '', busId: '' });
    setError('');
    setShowModal(true);
  };

  const openEditModal = (student) => {
    setEditingStudent(student);
    setForm({
      rollNumber: student.rollNumber, fullName: student.fullName,
      parentEmail: student.parentEmail, parentPhone: student.parentPhone || '',
      grade: student.grade || '', section: student.section || '',
      boardingPoint: student.boardingPoint || '', busId: student.busId || ''
    });
    setError('');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const data = { ...form, busId: form.busId || null };
      if (editingStudent) {
        await studentsAPI.update(editingStudent.id, data);
      } else {
        await studentsAPI.create(data);
      }
      setShowModal(false);
      fetchStudents();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save student');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this student?')) return;
    try {
      await studentsAPI.delete(id);
      fetchStudents();
    } catch (err) {
      setError('Failed to delete student');
    }
  };

  const handleShowQR = async (id) => {
    try {
      const res = await studentsAPI.getQR(id);
      setQrModal(res.data.qrCode);
    } catch (err) {
      setError('Failed to generate QR code');
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Student Management</h1>
        <button className="btn btn-primary" onClick={openAddModal}>➕ Add Student</button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="card">
        <form className="search-bar" onSubmit={handleSearch}>
          <input
            className="search-input"
            placeholder="Search by name..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <button type="submit" className="btn btn-primary btn-sm">Search</button>
          <button type="button" className="btn btn-outline btn-sm" onClick={() => { setSearch(''); setTimeout(fetchStudents, 0); }}>Clear</button>
        </form>

        {loading ? (
          <div className="loading">Loading students...</div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Roll No.</th>
                  <th>Name</th>
                  <th>Grade/Section</th>
                  <th>Parent Email</th>
                  <th>Bus</th>
                  <th>Boarding Point</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.length === 0 ? (
                  <tr><td colSpan="7" style={{ textAlign: 'center', padding: '24px', color: '#757575' }}>No students found</td></tr>
                ) : students.map(student => (
                  <tr key={student.id}>
                    <td><strong>{student.rollNumber}</strong></td>
                    <td>{student.fullName}</td>
                    <td>{student.grade}{student.section ? `-${student.section}` : ''}</td>
                    <td>{student.parentEmail}</td>
                    <td>{student.busNumber || <span style={{ color: '#757575' }}>Unassigned</span>}</td>
                    <td>{student.boardingPoint || '-'}</td>
                    <td style={{ display: 'flex', gap: '6px' }}>
                      <button className="btn btn-outline btn-sm" onClick={() => handleShowQR(student.id)}>📱 QR</button>
                      <button className="btn btn-outline btn-sm" onClick={() => openEditModal(student)}>✏️</button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(student.id)}>🗑️</button>
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
              <h2 className="modal-title">{editingStudent ? 'Edit Student' : 'Add New Student'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            {error && <div className="error-message">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label>Roll Number *</label>
                  <input className="form-control" value={form.rollNumber} onChange={e => setForm({...form, rollNumber: e.target.value})} required disabled={!!editingStudent} />
                </div>
                <div className="form-group">
                  <label>Full Name *</label>
                  <input className="form-control" value={form.fullName} onChange={e => setForm({...form, fullName: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>Parent Email *</label>
                  <input className="form-control" type="email" value={form.parentEmail} onChange={e => setForm({...form, parentEmail: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>Parent Phone</label>
                  <input className="form-control" value={form.parentPhone} onChange={e => setForm({...form, parentPhone: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Grade</label>
                  <input className="form-control" value={form.grade} onChange={e => setForm({...form, grade: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Section</label>
                  <input className="form-control" value={form.section} onChange={e => setForm({...form, section: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Boarding Point</label>
                  <input className="form-control" value={form.boardingPoint} onChange={e => setForm({...form, boardingPoint: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Assigned Bus</label>
                  <select className="form-control" value={form.busId} onChange={e => setForm({...form, busId: e.target.value})}>
                    <option value="">-- None --</option>
                    {buses.map(bus => <option key={bus.id} value={bus.id}>{bus.busNumber}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '16px' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editingStudent ? 'Update' : 'Create'} Student</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {qrModal && (
        <div className="modal-overlay" onClick={() => setQrModal(null)}>
          <div className="modal" style={{ textAlign: 'center', maxWidth: '350px' }}>
            <h2 className="modal-title" style={{ marginBottom: '20px' }}>Student QR Code</h2>
            <img src={`data:image/png;base64,${qrModal}`} alt="QR Code" style={{ width: '100%', maxWidth: '300px' }} />
            <br /><br />
            <button className="btn btn-primary" onClick={() => setQrModal(null)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentManagement;
