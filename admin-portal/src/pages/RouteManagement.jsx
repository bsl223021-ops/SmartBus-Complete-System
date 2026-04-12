import React, { useEffect, useState } from "react";
import { getRoutes, addRoute, updateRoute, deleteRoute } from "../services/firebaseService";
import FilterBar from "../components/FilterBar";

const EMPTY_FORM = { name: "", startPoint: "", endPoint: "", stoppages: "", distance: "", duration: "" };

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
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Route Management</h1>
        <button onClick={openAdd} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
          + Add Route
        </button>
      </div>

      <FilterBar value={search} onChange={setSearch} placeholder="Search routes..." />

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
            <tr>
              {["Route Name", "From", "To", "Stoppages", "Distance", "Duration", "Actions"].map((h) => (
                <th key={h} className="px-4 py-3 text-left">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.length === 0 && (
              <tr><td colSpan={7} className="text-center py-8 text-gray-400">No routes found</td></tr>
            )}
            {filtered.map((r) => (
              <tr key={r.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-800">{r.name}</td>
                <td className="px-4 py-3 text-gray-600">{r.startPoint}</td>
                <td className="px-4 py-3 text-gray-600">{r.endPoint}</td>
                <td className="px-4 py-3 text-gray-600 max-w-xs truncate">
                  {Array.isArray(r.stoppages) ? r.stoppages.join(", ") : r.stoppages || "—"}
                </td>
                <td className="px-4 py-3 text-gray-600">{r.distance ? `${r.distance} km` : "—"}</td>
                <td className="px-4 py-3 text-gray-600">{r.duration ? `${r.duration} min` : "—"}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(r)} className="text-blue-600 hover:text-blue-800 font-medium">Edit</button>
                    <button onClick={() => handleDelete(r.id)} className="text-red-600 hover:text-red-800 font-medium">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-lg">
            <h2 className="text-xl font-bold text-gray-800 mb-6">{editingId ? "Edit Route" : "Add Route"}</h2>
            {error && <div className="bg-red-50 text-red-700 border border-red-200 rounded-lg p-3 mb-4 text-sm">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <input required placeholder="Route Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="border rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <div className="grid grid-cols-2 gap-4">
                <input placeholder="Start Point" value={form.startPoint} onChange={(e) => setForm({ ...form, startPoint: e.target.value })} className="border rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <input placeholder="End Point" value={form.endPoint} onChange={(e) => setForm({ ...form, endPoint: e.target.value })} className="border rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <input placeholder="Distance (km)" type="number" value={form.distance} onChange={(e) => setForm({ ...form, distance: e.target.value })} className="border rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <input placeholder="Duration (minutes)" type="number" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} className="border rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <textarea
                placeholder="Stoppages (comma separated, e.g. Stop A, Stop B, Stop C)"
                value={form.stoppages}
                onChange={(e) => setForm({ ...form, stoppages: e.target.value })}
                rows={3}
                className="border rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex gap-3 justify-end pt-2">
                <button type="button" onClick={closeModal} className="px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60">{loading ? "Saving..." : "Save"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
