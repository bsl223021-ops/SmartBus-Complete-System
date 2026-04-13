import React, { useEffect, useState } from "react";
import { getDrivers, addDriver, updateDriver, deleteDriver } from "../services/firebaseService";
import FilterBar from "../components/FilterBar";

const EMPTY_FORM = { name: "", email: "", phone: "", licenseNumber: "", status: "active", busId: "", uid: "" };
const INPUT = "input-field";
const SELECT = "select-field";

export default function DriverManagement() {
  const [drivers, setDrivers] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadDrivers = async () => {
    const data = await getDrivers();
    setDrivers(data);
  };

  useEffect(() => { loadDrivers(); }, []);

  const filtered = drivers.filter(
    (d) =>
      d.name?.toLowerCase().includes(search.toLowerCase()) ||
      d.phone?.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => { setForm(EMPTY_FORM); setEditingId(null); setShowModal(true); setError(""); };
  const openEdit = (d) => { setForm({ ...d }); setEditingId(d.id); setShowModal(true); setError(""); };
  const closeModal = () => { setShowModal(false); setForm(EMPTY_FORM); setEditingId(null); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      if (editingId) {
        const { uid: _uid, ...updateData } = form;
        await updateDriver(editingId, updateData);
      } else {
        if (!form.uid.trim()) {
          setError("Firebase Auth UID is required. Copy it from Firebase Console → Authentication → Users.");
          setLoading(false);
          return;
        }
        const trimmedUid = form.uid.trim();
        if (!/^[A-Za-z0-9]{20,36}$/.test(trimmedUid)) {
          setError("Invalid Firebase Auth UID format. It should be a 20–36 character alphanumeric string.");
          setLoading(false);
          return;
        }
        const { uid, ...driverData } = form;
        await addDriver(driverData, trimmedUid);
      }
      await loadDrivers();
      closeModal();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this driver?")) return;
    await deleteDriver(id);
    setDrivers((prev) => prev.filter((d) => d.id !== id));
  };

  const statusBadge = (status) => {
    const colors = {
      active: "bg-green-100 text-green-700 border border-green-200",
      inactive: "bg-gray-100 text-gray-600 border border-gray-200",
    };
    return (
      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[status] || colors.inactive}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[28px] font-bold text-gray-900">Driver Management</h1>
          <p className="text-sm text-gray-500 mt-0.5">{filtered.length} drivers registered</p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Driver
        </button>
      </div>

      <FilterBar value={search} onChange={setSearch} placeholder="Search drivers by name or phone..." />

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead style={{ background: "#f8f9fa" }}>
            <tr className="text-gray-600 text-xs uppercase tracking-wider">
              {["Name", "Email", "Phone", "License", "Status", "Actions"].map((h) => (
                <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-12 text-gray-400">
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-3xl">👤</span>
                    <span>No drivers found</span>
                  </div>
                </td>
              </tr>
            )}
            {filtered.map((d) => (
              <tr key={d.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 font-semibold text-gray-900">{d.name}</td>
                <td className="px-4 py-3 text-gray-600">{d.email || "—"}</td>
                <td className="px-4 py-3 text-gray-600">{d.phone}</td>
                <td className="px-4 py-3 text-gray-600">{d.licenseNumber || "—"}</td>
                <td className="px-4 py-3">{statusBadge(d.status)}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEdit(d)}
                      className="text-xs font-medium px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:border-yellow-400 hover:text-yellow-700 hover:bg-yellow-50 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(d.id)}
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

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-[20px] font-bold text-gray-900">{editingId ? "Edit Driver" : "Add Driver"}</h2>
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
                  <input required placeholder="e.g. Robert Johnson" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={INPUT} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                  <input placeholder="driver@email.com" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={INPUT} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone *</label>
                  <input required placeholder="+1 234 567 8900" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={INPUT} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">License Number</label>
                  <input placeholder="e.g. DL-1234567" value={form.licenseNumber} onChange={(e) => setForm({ ...form, licenseNumber: e.target.value })} className={INPUT} />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Firebase Auth UID {!editingId && <span className="text-red-500">*</span>}
                  </label>
                  {editingId ? (
                    <input
                      value={editingId}
                      readOnly
                      className="input-field bg-gray-50 text-gray-500 cursor-not-allowed"
                    />
                  ) : (
                    <input
                      required
                      placeholder="e.g. 9J5p4cdquJQNyWbeCMfk4jANMDr2"
                      value={form.uid}
                      onChange={(e) => setForm({ ...form, uid: e.target.value })}
                      className={INPUT}
                    />
                  )}
                  <p className="text-xs text-gray-400 mt-1">
                    {editingId
                      ? "The document ID cannot be changed after creation."
                      : "Copy the User UID from Firebase Console → Authentication → Users → Select user → Copy UID (20–36 alphanumeric characters)"}
                  </p>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
                  <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className={SELECT}>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <button type="button" onClick={closeModal} className="btn-outline">Cancel</button>
                <button type="submit" disabled={loading} className="btn-primary">
                  {loading ? "Saving..." : "Save Driver"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
