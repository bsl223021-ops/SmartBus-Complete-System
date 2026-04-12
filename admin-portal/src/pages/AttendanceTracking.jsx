import React, { useEffect, useState } from "react";
import { subscribeToAttendance, getBuses } from "../services/firebaseService";
import FilterBar from "../components/FilterBar";

export default function AttendanceTracking() {
  const [attendance, setAttendance] = useState([]);
  const [buses, setBuses] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [selectedBus, setSelectedBus] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getBuses().then(setBuses);
  }, []);

  useEffect(() => {
    setLoading(true);
    const unsub = subscribeToAttendance(selectedDate, selectedBus || null, (data) => {
      setAttendance(data);
      setLoading(false);
    });
    return unsub;
  }, [selectedDate, selectedBus]);

  const filtered = attendance.filter((a) =>
    a.studentName?.toLowerCase().includes(search.toLowerCase()) ||
    a.rollNumber?.toLowerCase().includes(search.toLowerCase())
  );

  const presentCount = filtered.filter((a) => a.status === "present").length;
  const absentCount = filtered.filter((a) => a.status === "absent").length;
  const lateCount = filtered.filter((a) => a.status === "late").length;

  const statusBadge = (status) => {
    const styles = {
      present: "bg-green-100 text-green-700 border border-green-200",
      absent: "bg-red-100 text-red-700 border border-red-200",
      late: "bg-yellow-100 text-yellow-700 border border-yellow-200",
    };
    return (
      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${styles[status] || "bg-gray-100 text-gray-600 border border-gray-200"}`}>
        {status ? status.charAt(0).toUpperCase() + status.slice(1) : "Unknown"}
      </span>
    );
  };

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-[28px] font-bold text-gray-900">Attendance Tracking</h1>
          <p className="text-sm text-gray-500 mt-0.5">{filtered.length} records for {selectedDate}</p>
        </div>
        <div className="flex gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-lg text-sm font-semibold text-green-700">
            ✅ Present: {presentCount}
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-200 rounded-lg text-sm font-semibold text-red-700">
            ❌ Absent: {absentCount}
          </div>
          {lateCount > 0 && (
            <div className="flex items-center gap-2 px-4 py-2 bg-yellow-50 border border-yellow-200 rounded-lg text-sm font-semibold text-yellow-700">
              ⏰ Late: {lateCount}
            </div>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Date</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="input-field"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Bus</label>
          <select
            value={selectedBus}
            onChange={(e) => setSelectedBus(e.target.value)}
            className="select-field"
          >
            <option value="">All Buses</option>
            {buses.map((b) => (
              <option key={b.id} value={b.id}>{b.number}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Search</label>
          <FilterBar value={search} onChange={setSearch} placeholder="Search by name or roll number..." />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: "#FFC107" }} />
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead style={{ background: "#f8f9fa" }}>
              <tr className="text-gray-600 text-xs uppercase tracking-wider">
                {["Student Name", "Roll No", "Bus", "Board Time", "Drop Time", "Status"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-400">
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-3xl">📋</span>
                      <span>No attendance records for this date</span>
                    </div>
                  </td>
                </tr>
              )}
              {filtered.map((a) => (
                <tr key={a.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-semibold text-gray-900">{a.studentName || "—"}</td>
                  <td className="px-4 py-3 text-gray-600">{a.rollNumber || "—"}</td>
                  <td className="px-4 py-3 text-gray-600">{buses.find((b) => b.id === a.busId)?.number || a.busId || "—"}</td>
                  <td className="px-4 py-3 text-gray-600">{a.boardTime || "—"}</td>
                  <td className="px-4 py-3 text-gray-600">{a.dropTime || "—"}</td>
                  <td className="px-4 py-3">{statusBadge(a.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
