import React, { useEffect, useState } from "react";
import {
  subscribeToTrips,
  addTrip,
  updateTrip,
  deleteTrip,
  getBuses,
  getDrivers,
  getRoutes,
} from "../services/firebaseService";
import FilterBar from "../components/FilterBar";

const EMPTY_FORM = {
  busId: "",
  driverId: "",
  routeId: "",
  status: "active",
  startTime: "",
  endTime: "",
  date: new Date().toISOString().slice(0, 10),
  notes: "",
};

const SELECT = "select-field";
const INPUT = "input-field";

export default function TripManagement() {
  const [trips, setTrips] = useState([]);
  const [buses, setBuses] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const unsub = subscribeToTrips(setTrips);
    getBuses().then(setBuses);
    getDrivers().then(setDrivers);
    getRoutes().then(setRoutes);
    return unsub;
  }, []);

  const filtered = trips.filter((t) => {
    const matchStatus = statusFilter === "all" || t.status === statusFilter;
    const busName = buses.find((b) => b.id === t.busId)?.number || "";
    const routeName = routes.find((r) => r.id === t.routeId)?.name || "";
    const matchSearch =
      busName.toLowerCase().includes(search.toLowerCase()) ||
      routeName.toLowerCase().includes(search.toLowerCase()) ||
      t.date?.includes(search);
    return matchStatus && matchSearch;
  });

  const openAdd = () => { setForm(EMPTY_FORM); setEditingId(null); setShowModal(true); setError(""); };
  const openEdit = (t) => { setForm({ ...t }); setEditingId(t.id); setShowModal(true); setError(""); };
  const closeModal = () => { setShowModal(false); setForm(EMPTY_FORM); setEditingId(null); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      if (editingId) {
        await updateTrip(editingId, form);
      } else {
        await addTrip(form);
      }
      closeModal();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this trip?")) return;
    await deleteTrip(id);
  };

  const statusBadge = (status) => {
    const colors = {
      active: "bg-green-100 text-green-700 border border-green-200",
      completed: "bg-blue-100 text-blue-700 border border-blue-200",
      cancelled: "bg-red-100 text-red-700 border border-red-200",
      scheduled: "bg-yellow-100 text-yellow-700 border border-yellow-200",
    };
    return (
      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${colors[status] || "bg-gray-100 text-gray-600 border border-gray-200"}`}>
        {status || "unknown"}
      </span>
    );
  };

  const activeCount = trips.filter((t) => t.status === "active").length;
  const completedCount = trips.filter((t) => t.status === "completed").length;

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-[28px] font-bold text-gray-900">Trip Management</h1>
          <p className="text-sm text-gray-500 mt-0.5">{trips.length} trips total</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-lg text-xs font-semibold text-green-700">
            🟢 Active: {activeCount}
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg text-xs font-semibold text-blue-700">
            ✅ Completed: {completedCount}
          </div>
          <button onClick={openAdd} className="btn-primary flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Trip
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="flex-1 min-w-48">
          <FilterBar value={search} onChange={setSearch} placeholder="Search by bus, route, or date..." />
        </div>
        <div className="flex gap-2">
          {["all", "active", "completed", "scheduled", "cancelled"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                statusFilter === s
                  ? "text-black"
                  : "bg-white border border-gray-200 text-gray-600 hover:border-yellow-400"
              }`}
              style={statusFilter === s ? { background: "#FFC107" } : {}}
            >
              {s === "all" ? "All" : s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead style={{ background: "#f8f9fa" }}>
            <tr className="text-gray-600 text-xs uppercase tracking-wider">
              {["Date", "Bus", "Driver", "Route", "Start", "End", "Status", "Actions"].map((h) => (
                <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="text-center py-12 text-gray-400">
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-3xl">🚌</span>
                    <span>No trips found</span>
                  </div>
                </td>
              </tr>
            )}
            {filtered.map((t) => (
              <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 text-gray-700 font-medium">{t.date || "—"}</td>
                <td className="px-4 py-3 text-gray-600">
                  {buses.find((b) => b.id === t.busId)?.number || "—"}
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {drivers.find((d) => d.id === t.driverId)?.name || "—"}
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {routes.find((r) => r.id === t.routeId)?.name || "—"}
                </td>
                <td className="px-4 py-3 text-gray-600">{t.startTime || "—"}</td>
                <td className="px-4 py-3 text-gray-600">{t.endTime || "—"}</td>
                <td className="px-4 py-3">{statusBadge(t.status)}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEdit(t)}
                      className="text-xs font-medium px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:border-yellow-400 hover:text-yellow-700 hover:bg-yellow-50 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(t.id)}
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

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-[20px] font-bold text-gray-900">{editingId ? "Edit Trip" : "New Trip"}</h2>
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
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Date *</label>
                  <input required type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className={INPUT} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
                  <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className={SELECT}>
                    <option value="scheduled">Scheduled</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Bus *</label>
                  <select required value={form.busId} onChange={(e) => setForm({ ...form, busId: e.target.value })} className={SELECT}>
                    <option value="">Select Bus</option>
                    {buses.map((b) => <option key={b.id} value={b.id}>{b.number}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Driver</label>
                  <select value={form.driverId} onChange={(e) => setForm({ ...form, driverId: e.target.value })} className={SELECT}>
                    <option value="">Select Driver</option>
                    {drivers.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Route</label>
                  <select value={form.routeId} onChange={(e) => setForm({ ...form, routeId: e.target.value })} className={SELECT}>
                    <option value="">Select Route</option>
                    {routes.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Start Time</label>
                  <input type="time" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} className={INPUT} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">End Time</label>
                  <input type="time" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} className={INPUT} />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Notes</label>
                  <input placeholder="Optional notes..." value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className={INPUT} />
                </div>
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <button type="button" onClick={closeModal} className="btn-outline">Cancel</button>
                <button type="submit" disabled={loading} className="btn-primary">
                  {loading ? "Saving..." : "Save Trip"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
