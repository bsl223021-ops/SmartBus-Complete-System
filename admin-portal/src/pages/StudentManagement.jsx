import React, { useEffect, useState, useRef } from "react";
import QRCode from "qrcode";
import {
  subscribeToStudents,
  addStudent,
  updateStudent,
  deleteStudent,
  getBuses,
  getRoutes,
} from "../services/firebaseService";
import FilterBar from "../components/FilterBar";

const EMPTY_FORM = { name: "", rollNumber: "", grade: "", busId: "", routeId: "", parentEmail: "", parentPhone: "" };

export default function StudentManagement() {
  const [students, setStudents] = useState([]);
  const [buses, setBuses] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [qrModal, setQrModal] = useState({ open: false, dataUrl: "", name: "" });
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const unsub = subscribeToStudents(setStudents);
    getBuses().then(setBuses);
    getRoutes().then(setRoutes);
    return unsub;
  }, []);

  const filtered = students.filter(
    (s) =>
      s.name?.toLowerCase().includes(search.toLowerCase()) ||
      s.rollNumber?.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => { setForm(EMPTY_FORM); setEditingId(null); setShowModal(true); setError(""); };
  const openEdit = (s) => { setForm({ ...s }); setEditingId(s.id); setShowModal(true); setError(""); };
  const closeModal = () => { setShowModal(false); setForm(EMPTY_FORM); setEditingId(null); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      if (editingId) {
        await updateStudent(editingId, form);
      } else {
        await addStudent(form);
      }
      closeModal();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this student?")) return;
    await deleteStudent(id);
  };

  const showQR = async (student) => {
    const data = JSON.stringify({ id: student.id, rollNumber: student.rollNumber, name: student.name });
    const url = await QRCode.toDataURL(data, { width: 300, margin: 2 });
    setQrModal({ open: true, dataUrl: url, name: student.name });
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Student Management</h1>
        <button onClick={openAdd} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
          + Add Student
        </button>
      </div>

      <FilterBar value={search} onChange={setSearch} placeholder="Search students..." />

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
            <tr>
              {["Name", "Roll No", "Grade", "Bus", "Parent Phone", "Actions"].map((h) => (
                <th key={h} className="px-4 py-3 text-left">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="text-center py-8 text-gray-400">No students found</td></tr>
            )}
            {filtered.map((s) => (
              <tr key={s.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-800">{s.name}</td>
                <td className="px-4 py-3 text-gray-600">{s.rollNumber}</td>
                <td className="px-4 py-3 text-gray-600">{s.grade}</td>
                <td className="px-4 py-3 text-gray-600">
                  {buses.find((b) => b.id === s.busId)?.number || s.busId || "—"}
                </td>
                <td className="px-4 py-3 text-gray-600">{s.parentPhone || "—"}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button onClick={() => showQR(s)} className="text-green-600 hover:text-green-800 font-medium">QR</button>
                    <button onClick={() => openEdit(s)} className="text-blue-600 hover:text-blue-800 font-medium">Edit</button>
                    <button onClick={() => handleDelete(s.id)} className="text-red-600 hover:text-red-800 font-medium">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-lg">
            <h2 className="text-xl font-bold text-gray-800 mb-6">{editingId ? "Edit Student" : "Add Student"}</h2>
            {error && <div className="bg-red-50 text-red-700 border border-red-200 rounded-lg p-3 mb-4 text-sm">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input required placeholder="Full Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="border rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <input required placeholder="Roll Number" value={form.rollNumber} onChange={(e) => setForm({ ...form, rollNumber: e.target.value })} className="border rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <input placeholder="Grade/Class" value={form.grade} onChange={(e) => setForm({ ...form, grade: e.target.value })} className="border rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <input placeholder="Parent Email" type="email" value={form.parentEmail} onChange={(e) => setForm({ ...form, parentEmail: e.target.value })} className="border rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <input placeholder="Parent Phone" value={form.parentPhone} onChange={(e) => setForm({ ...form, parentPhone: e.target.value })} className="border rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <select value={form.busId} onChange={(e) => setForm({ ...form, busId: e.target.value })} className="border rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">Assign Bus</option>
                  {buses.map((b) => <option key={b.id} value={b.id}>{b.number} - {b.route}</option>)}
                </select>
                <select value={form.routeId} onChange={(e) => setForm({ ...form, routeId: e.target.value })} className="border rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">Assign Route</option>
                  {routes.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <button type="button" onClick={closeModal} className="px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60">{loading ? "Saving..." : "Save"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR Modal */}
      {qrModal.open && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <h2 className="text-xl font-bold text-gray-800 mb-4">QR Code – {qrModal.name}</h2>
            <img src={qrModal.dataUrl} alt="QR Code" className="mx-auto" />
            <div className="flex gap-3 justify-center mt-6">
              <a href={qrModal.dataUrl} download={`${qrModal.name}-qr.png`} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Download</a>
              <button onClick={() => setQrModal({ open: false, dataUrl: "", name: "" })} className="px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-50">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
