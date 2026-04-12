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

  const statusBadge = (status) => {
    const styles = {
      present: "bg-green-100 text-green-700",
      absent: "bg-red-100 text-red-700",
      late: "bg-yellow-100 text-yellow-700",
    };
    return (
      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${styles[status] || "bg-gray-100 text-gray-600"}`}>
        {status ? status.charAt(0).toUpperCase() + status.slice(1) : "Unknown"}
      </span>
    );
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Attendance Tracking</h1>
        <div className="flex gap-4 text-sm font-medium">
          <span className="text-green-600">✅ Present: {presentCount}</span>
          <span className="text-red-600">❌ Absent: {absentCount}</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Date</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Bus</label>
          <select
            value={selectedBus}
            onChange={(e) => setSelectedBus(e.target.value)}
            className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          >
            <option value="">All Buses</option>
            {buses.map((b) => (
              <option key={b.id} value={b.id}>{b.number}</option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-xs font-medium text-gray-500 mb-1">Search</label>
          <FilterBar value={search} onChange={setSearch} placeholder="Search by name or roll number..." />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
              <tr>
                {["Student Name", "Roll No", "Bus", "Board Time", "Drop Time", "Status"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="text-center py-8 text-gray-400">No attendance records for this date/bus</td></tr>
              )}
              {filtered.map((a) => (
                <tr key={a.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-800">{a.studentName || "—"}</td>
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
