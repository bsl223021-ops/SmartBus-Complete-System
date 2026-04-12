import React, { useEffect, useState } from "react";
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
const INPUT = "input-field";
const SELECT = "select-field";

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
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[28px] font-bold text-gray-900">Student Management</h1>
          <p className="text-sm text-gray-500 mt-0.5">{filtered.length} students enrolled</p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Student
        </button>
      </div>

      <FilterBar value={search} onChange={setSearch} placeholder="Search students by name or roll number..." />

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead style={{ background: "#f8f9fa" }}>
            <tr className="text-gray-600 text-xs uppercase tracking-wider">
              {["Name", "Roll No", "Grade", "Bus", "Parent Phone", "Actions"].map((h) => (
                <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-12 text-gray-400">
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-3xl">👨‍🎓</span>
                    <span>No students found</span>
                  </div>
                </td>
              </tr>
            )}
            {filtered.map((s) => (
              <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 font-semibold text-gray-900">{s.name}</td>
                <td className="px-4 py-3 text-gray-600">{s.rollNumber}</td>
                <td className="px-4 py-3 text-gray-600">{s.grade || "—"}</td>
                <td className="px-4 py-3 text-gray-600">
                  {buses.find((b) => b.id === s.busId)?.number || "—"}
                </td>
                <td className="px-4 py-3 text-gray-600">{s.parentPhone || "—"}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => showQR(s)}
                      className="text-xs font-medium px-3 py-1.5 rounded-lg border border-green-200 text-green-700 hover:bg-green-50 transition-colors"
                    >
                      QR
                    </button>
                    <button
                      onClick={() => openEdit(s)}
                      className="text-xs font-medium px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:border-yellow-400 hover:text-yellow-700 hover:bg-yellow-50 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(s.id)}
                      className="text-xs font-medium px-3 py-1.5 rounded-lg border border-red-100 text-red-600 hover:bg-red-50 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-[20px] font-bold text-gray-900">{editingId ? "Edit Student" : "Add Student"}</h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {error && <div className="bg-red-50 text-red-700 border border-red-200 rounded-lg p-3 mb-4 text-sm">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name *</label>
                  <input required placeholder="e.g. John Doe" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={INPUT} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Roll Number *</label>
                  <input required placeholder="e.g. STD-001" value={form.rollNumber} onChange={(e) => setForm({ ...form, rollNumber: e.target.value })} className={INPUT} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Grade / Class</label>
                  <input placeholder="e.g. Grade 5" value={form.grade} onChange={(e) => setForm({ ...form, grade: e.target.value })} className={INPUT} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Parent Email</label>
                  <input placeholder="parent@email.com" type="email" value={form.parentEmail} onChange={(e) => setForm({ ...form, parentEmail: e.target.value })} className={INPUT} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Parent Phone</label>
                  <input placeholder="+1 234 567 8900" value={form.parentPhone} onChange={(e) => setForm({ ...form, parentPhone: e.target.value })} className={INPUT} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Assign Bus</label>
                  <select value={form.busId} onChange={(e) => setForm({ ...form, busId: e.target.value })} className={SELECT}>
                    <option value="">No Bus</option>
                    {buses.map((b) => <option key={b.id} value={b.id}>{b.number}</option>)}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Assign Route</label>
                  <select value={form.routeId} onChange={(e) => setForm({ ...form, routeId: e.target.value })} className={SELECT}>
                    <option value="">No Route</option>
                    {routes.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <button type="button" onClick={closeModal} className="btn-outline">Cancel</button>
                <button type="submit" disabled={loading} className="btn-primary">
                  {loading ? "Saving..." : "Save Student"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR Modal */}
      {qrModal.open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 text-center max-w-xs w-full">
            <h2 className="text-[20px] font-bold text-gray-900 mb-2">Student QR Code</h2>
            <p className="text-sm text-gray-500 mb-4">{qrModal.name}</p>
            <img src={qrModal.dataUrl} alt="QR Code" className="mx-auto rounded-lg border border-gray-100" />
            <div className="flex gap-3 justify-center mt-6">
              <a
                href={qrModal.dataUrl}
                download={`${qrModal.name}-qr.png`}
                className="btn-primary"
              >
                Download
              </a>
              <button
                onClick={() => setQrModal({ open: false, dataUrl: "", name: "" })}
                className="btn-outline"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
