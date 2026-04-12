import React, { useEffect, useState } from "react";
import { subscribeToBuses, addBus, updateBus, deleteBus, getDrivers, getRoutes } from "../services/firebaseService";
import FilterBar from "../components/FilterBar";

const EMPTY_FORM = { number: "", capacity: "", driverId: "", routeId: "", status: "active", plateNumber: "" };

const INPUT = "input-field";
const SELECT = "select-field";

export default function BusManagement() {
  const [buses, setBuses] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const unsub = subscribeToBuses(setBuses);
    getDrivers().then(setDrivers);
    getRoutes().then(setRoutes);
    return unsub;
  }, []);

  const filtered = buses.filter(
    (b) =>
      b.number?.toLowerCase().includes(search.toLowerCase()) ||
      b.plateNumber?.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => { setForm(EMPTY_FORM); setEditingId(null); setShowModal(true); setError(""); };
  const openEdit = (b) => { setForm({ ...b }); setEditingId(b.id); setShowModal(true); setError(""); };
  const closeModal = () => { setShowModal(false); setForm(EMPTY_FORM); setEditingId(null); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      if (editingId) {
        await updateBus(editingId, form);
      } else {
        await addBus(form);
      }
      closeModal();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this bus?")) return;
    await deleteBus(id);
  };

  const statusBadge = (status) => {
    const colors = {
      active: "bg-green-100 text-green-700 border border-green-200",
      inactive: "bg-gray-100 text-gray-600 border border-gray-200",
      maintenance: "bg-yellow-100 text-yellow-700 border border-yellow-200",
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
          <h1 className="text-[28px] font-bold text-gray-900">Bus Management</h1>
          <p className="text-sm text-gray-500 mt-0.5">{filtered.length} buses total</p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Bus
        </button>
      </div>

      <FilterBar value={search} onChange={setSearch} placeholder="Search buses by number or plate..." />

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead style={{ background: "#f8f9fa" }}>
            <tr className="text-gray-600 text-xs uppercase tracking-wider">
              {["Bus No", "Plate", "Capacity", "Driver", "Route", "Status", "Actions"].map((h) => (
                <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-12 text-gray-400">
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-3xl">🚌</span>
                    <span>No buses found</span>
                  </div>
                </td>
              </tr>
            )}
            {filtered.map((b) => (
              <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 font-semibold text-gray-900">{b.number}</td>
                <td className="px-4 py-3 text-gray-600">{b.plateNumber || "—"}</td>
                <td className="px-4 py-3 text-gray-600">{b.capacity || "—"}</td>
                <td className="px-4 py-3 text-gray-600">
                  {drivers.find((d) => d.id === b.driverId)?.name || "—"}
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {routes.find((r) => r.id === b.routeId)?.name || "—"}
                </td>
                <td className="px-4 py-3">{statusBadge(b.status)}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEdit(b)}
                      className="text-xs font-medium px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:border-yellow-400 hover:text-yellow-700 hover:bg-yellow-50 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(b.id)}
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
              <h2 className="text-[20px] font-bold text-gray-900">{editingId ? "Edit Bus" : "Add Bus"}</h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {error && (
              <div className="bg-red-50 text-red-700 border border-red-200 rounded-lg p-3 mb-4 text-sm">{error}</div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Bus Number *</label>
                  <input required placeholder="e.g. BUS-01" value={form.number} onChange={(e) => setForm({ ...form, number: e.target.value })} className={INPUT} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Plate Number</label>
                  <input placeholder="e.g. KA01AB1234" value={form.plateNumber} onChange={(e) => setForm({ ...form, plateNumber: e.target.value })} className={INPUT} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Capacity</label>
                  <input placeholder="e.g. 40" type="number" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} className={INPUT} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
                  <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className={SELECT}>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Assign Driver</label>
                  <select value={form.driverId} onChange={(e) => setForm({ ...form, driverId: e.target.value })} className={SELECT}>
                    <option value="">No Driver</option>
                    {drivers.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
                <div>
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
                  {loading ? "Saving..." : "Save Bus"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
