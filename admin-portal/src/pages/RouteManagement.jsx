import React, { useEffect, useState } from "react";
import { getRoutes, addRoute, updateRoute, deleteRoute } from "../services/firebaseService";
import FilterBar from "../components/FilterBar";

const EMPTY_FORM = { name: "", startPoint: "", endPoint: "", stoppages: "", distance: "", duration: "" };
const INPUT = "input-field";

export default function RouteManagement() {
  const [routes, setRoutes] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadRoutes = async () => {
    const data = await getRoutes();
    setRoutes(data);
  };

  useEffect(() => { loadRoutes(); }, []);

  const filtered = routes.filter((r) => r.name?.toLowerCase().includes(search.toLowerCase()));

  const openAdd = () => { setForm(EMPTY_FORM); setEditingId(null); setShowModal(true); setError(""); };
  const openEdit = (r) => {
    setForm({ ...r, stoppages: Array.isArray(r.stoppages) ? r.stoppages.join(", ") : r.stoppages });
    setEditingId(r.id);
    setShowModal(true);
    setError("");
  };
  const closeModal = () => { setShowModal(false); setForm(EMPTY_FORM); setEditingId(null); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const payload = {
        ...form,
        stoppages: form.stoppages.split(",").map((s) => s.trim()).filter(Boolean),
      };
      if (editingId) {
        await updateRoute(editingId, payload);
      } else {
        await addRoute(payload);
      }
      await loadRoutes();
      closeModal();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this route?")) return;
    await deleteRoute(id);
    setRoutes((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[28px] font-bold text-gray-900">Route Management</h1>
          <p className="text-sm text-gray-500 mt-0.5">{filtered.length} routes configured</p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Route
        </button>
      </div>

      <FilterBar value={search} onChange={setSearch} placeholder="Search routes by name..." />

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead style={{ background: "#f8f9fa" }}>
            <tr className="text-gray-600 text-xs uppercase tracking-wider">
              {["Route Name", "From", "To", "Stoppages", "Distance", "Duration", "Actions"].map((h) => (
                <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-12 text-gray-400">
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-3xl">🗺️</span>
                    <span>No routes found</span>
                  </div>
                </td>
              </tr>
            )}
            {filtered.map((r) => (
              <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 font-semibold text-gray-900">{r.name}</td>
                <td className="px-4 py-3 text-gray-600">{r.startPoint || "—"}</td>
                <td className="px-4 py-3 text-gray-600">{r.endPoint || "—"}</td>
                <td className="px-4 py-3 text-gray-600 max-w-xs truncate">
                  {Array.isArray(r.stoppages) ? r.stoppages.join(", ") : r.stoppages || "—"}
                </td>
                <td className="px-4 py-3 text-gray-600">{r.distance ? `${r.distance} km` : "—"}</td>
                <td className="px-4 py-3 text-gray-600">{r.duration ? `${r.duration} min` : "—"}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEdit(r)}
                      className="text-xs font-medium px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:border-yellow-400 hover:text-yellow-700 hover:bg-yellow-50 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(r.id)}
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
              <h2 className="text-[20px] font-bold text-gray-900">{editingId ? "Edit Route" : "Add Route"}</h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {error && <div className="bg-red-50 text-red-700 border border-red-200 rounded-lg p-3 mb-4 text-sm">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Route Name *</label>
                <input required placeholder="e.g. North Ring Route" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={INPUT} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Start Point</label>
                  <input placeholder="e.g. City Center" value={form.startPoint} onChange={(e) => setForm({ ...form, startPoint: e.target.value })} className={INPUT} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">End Point</label>
                  <input placeholder="e.g. School Campus" value={form.endPoint} onChange={(e) => setForm({ ...form, endPoint: e.target.value })} className={INPUT} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Distance (km)</label>
                  <input placeholder="e.g. 12" type="number" value={form.distance} onChange={(e) => setForm({ ...form, distance: e.target.value })} className={INPUT} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Duration (min)</label>
                  <input placeholder="e.g. 45" type="number" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} className={INPUT} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Stoppages</label>
                <textarea
                  placeholder="Comma separated: Stop A, Stop B, Stop C"
                  value={form.stoppages}
                  onChange={(e) => setForm({ ...form, stoppages: e.target.value })}
                  rows={3}
                  className="w-full border border-gray-300 rounded-[6px] px-3 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-colors"
                />
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <button type="button" onClick={closeModal} className="btn-outline">Cancel</button>
                <button type="submit" disabled={loading} className="btn-primary">
                  {loading ? "Saving..." : "Save Route"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
