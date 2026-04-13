import React, { useEffect, useState } from "react";
import {
  subscribeToAlerts,
  markAlertResolved,
  getParentInfo,
} from "../services/firebaseService";

const ALERT_TYPE_META = {
  emergency: { emoji: "🚨", label: "Emergency", color: "#DC2626", bg: "#FEF2F2" },
  delay:     { emoji: "⏰", label: "Bus Delay",  color: "#D97706", bg: "#FFFBEB" },
  absent:    { emoji: "🏠", label: "Child Absent", color: "#6B7280", bg: "#F9FAFB" },
  other:     { emoji: "📝", label: "Other",       color: "#4B5563", bg: "#F3F4F6" },
};

function formatTime(ts) {
  if (!ts) return "—";
  const date = ts.toDate ? ts.toDate() : new Date(ts);
  return date.toLocaleString(undefined, {
    year: "numeric", month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function isResolved(alert) {
  return alert.status === "resolved" || alert.resolved === true;
}

export default function AlertsManagement() {
  const [alerts, setAlerts] = useState([]);
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("active");
  const [search, setSearch] = useState("");
  const [detailAlert, setDetailAlert] = useState(null);
  const [parentInfo, setParentInfo] = useState(null);
  const [loadingParent, setLoadingParent] = useState(false);
  const [resolvingId, setResolvingId] = useState(null);

  useEffect(() => {
    const unsub = subscribeToAlerts(setAlerts);
    return unsub;
  }, []);

  const filtered = alerts.filter((a) => {
    const matchType = typeFilter === "all" || a.type === typeFilter;
    const resolved = isResolved(a);
    const matchStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && !resolved) ||
      (statusFilter === "resolved" && resolved);
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      (a.studentName || "").toLowerCase().includes(q) ||
      (a.parentName || "").toLowerCase().includes(q) ||
      (a.message || "").toLowerCase().includes(q) ||
      (a.busId || "").toLowerCase().includes(q);
    return matchType && matchStatus && matchSearch;
  });

  const totalActive = alerts.filter((a) => !isResolved(a)).length;
  const countByType = Object.keys(ALERT_TYPE_META).reduce((acc, k) => {
    acc[k] = alerts.filter((a) => a.type === k && !isResolved(a)).length;
    return acc;
  }, {});

  const handleViewDetail = async (alert) => {
    setDetailAlert(alert);
    setParentInfo(null);
    if (alert.parentUid || alert.parentId) {
      setLoadingParent(true);
      try {
        const info = await getParentInfo(alert.parentUid || alert.parentId);
        setParentInfo(info);
      } catch (_) {}
      finally { setLoadingParent(false); }
    }
  };

  const handleResolve = async (id) => {
    setResolvingId(id);
    try {
      await markAlertResolved(id);
      if (detailAlert?.id === id) {
        setDetailAlert((prev) => prev ? { ...prev, status: "resolved", resolved: true } : prev);
      }
    } catch (err) {
      console.error("[AlertsManagement] resolve error:", err.message);
    } finally {
      setResolvingId(null);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">🔔 Alerts Management</h1>
          <p className="text-sm text-gray-500 mt-1">Monitor and manage parent alerts in real-time</p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 border border-gray-200 col-span-2 sm:col-span-1">
          <div className="text-3xl font-bold text-red-600">{totalActive}</div>
          <div className="text-sm text-gray-500 mt-1">Unresolved</div>
        </div>
        {Object.entries(ALERT_TYPE_META).map(([k, m]) => (
          <div key={k} className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="text-xl">{m.emoji}</div>
            <div className="text-2xl font-bold mt-1" style={{ color: m.color }}>{countByType[k]}</div>
            <div className="text-xs text-gray-500">{m.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
        <div className="flex flex-wrap gap-3 items-center">
          <input
            type="text"
            placeholder="Search student, parent, message…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 flex-1 min-w-48"
          />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
          >
            <option value="all">All Types</option>
            {Object.entries(ALERT_TYPE_META).map(([k, m]) => (
              <option key={k} value={k}>{m.emoji} {m.label}</option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
          >
            <option value="all">All Status</option>
            <option value="active">🔴 Active</option>
            <option value="resolved">✅ Resolved</option>
          </select>
          <span className="text-sm text-gray-500">{filtered.length} result{filtered.length !== 1 ? "s" : ""}</span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <div className="text-5xl mb-4">✅</div>
            <div className="text-lg font-semibold">No alerts found</div>
            <div className="text-sm mt-1">All clear! No parent alerts match your filters.</div>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Type</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Student</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Parent</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Bus</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Message</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Status</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Time</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((alert) => {
                const meta = ALERT_TYPE_META[alert.type] || ALERT_TYPE_META.other;
                const resolved = isResolved(alert);
                return (
                  <tr key={alert.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <span
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold"
                        style={{ backgroundColor: meta.bg, color: meta.color }}
                      >
                        {meta.emoji} {meta.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {alert.studentName || <span className="text-gray-400 italic">Unknown</span>}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {alert.parentName || <span className="text-gray-400 italic">—</span>}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {alert.busId || <span className="text-gray-400">—</span>}
                    </td>
                    <td className="px-4 py-3 text-gray-600 max-w-xs truncate">
                      {alert.message || <span className="text-gray-400 italic">No message</span>}
                    </td>
                    <td className="px-4 py-3">
                      {resolved ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                          ✅ Resolved
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                          🔴 Active
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                      {formatTime(alert.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleViewDetail(alert)}
                          className="px-2 py-1 rounded-lg text-xs font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                        >
                          View
                        </button>
                        {!resolved && (
                          <button
                            onClick={() => handleResolve(alert.id)}
                            disabled={resolvingId === alert.id}
                            className="px-2 py-1 rounded-lg text-xs font-medium bg-green-50 text-green-700 hover:bg-green-100 transition-colors disabled:opacity-50"
                          >
                            {resolvingId === alert.id ? "…" : "Resolve"}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Detail Modal */}
      {detailAlert && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900">Alert Details</h2>
              <button
                onClick={() => { setDetailAlert(null); setParentInfo(null); }}
                className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
              >
                ×
              </button>
            </div>
            <div className="p-5 space-y-4">
              {/* Type */}
              <div>
                <div className="text-xs font-semibold text-gray-500 uppercase mb-1">Alert Type</div>
                {(() => {
                  const meta = ALERT_TYPE_META[detailAlert.type] || ALERT_TYPE_META.other;
                  return (
                    <span
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold"
                      style={{ backgroundColor: meta.bg, color: meta.color }}
                    >
                      {meta.emoji} {meta.label}
                    </span>
                  );
                })()}
              </div>

              {/* Student */}
              <div>
                <div className="text-xs font-semibold text-gray-500 uppercase mb-1">Student</div>
                <div className="text-gray-900">{detailAlert.studentName || detailAlert.studentId || "—"}</div>
              </div>

              {/* Bus */}
              <div>
                <div className="text-xs font-semibold text-gray-500 uppercase mb-1">Bus</div>
                <div className="text-gray-900">{detailAlert.busId || "—"}</div>
              </div>

              {/* Message */}
              {detailAlert.message && (
                <div>
                  <div className="text-xs font-semibold text-gray-500 uppercase mb-1">Message</div>
                  <div className="bg-gray-50 rounded-lg p-3 text-gray-700 italic">"{detailAlert.message}"</div>
                </div>
              )}

              {/* Parent Info */}
              <div>
                <div className="text-xs font-semibold text-gray-500 uppercase mb-1">Parent Contact</div>
                {loadingParent ? (
                  <div className="text-gray-400 text-sm">Loading parent info…</div>
                ) : parentInfo ? (
                  <div className="bg-gray-50 rounded-lg p-3 space-y-1">
                    <div className="font-semibold text-gray-800">{parentInfo.name || detailAlert.parentName || "—"}</div>
                    {parentInfo.email && (
                      <div className="text-sm text-blue-600">
                        <a href={`mailto:${parentInfo.email}`}>{parentInfo.email}</a>
                      </div>
                    )}
                    {parentInfo.phone && (
                      <div className="text-sm text-green-600">
                        <a href={`tel:${parentInfo.phone}`}>📞 {parentInfo.phone}</a>
                      </div>
                    )}
                  </div>
                ) : detailAlert.parentName ? (
                  <div className="text-gray-700">{detailAlert.parentName}</div>
                ) : (
                  <div className="text-gray-400 text-sm">Parent info not available</div>
                )}
              </div>

              {/* Timestamps */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-xs font-semibold text-gray-500 uppercase mb-1">Sent At</div>
                  <div className="text-gray-700 text-sm">{formatTime(detailAlert.createdAt)}</div>
                </div>
                {detailAlert.resolvedAt && (
                  <div>
                    <div className="text-xs font-semibold text-gray-500 uppercase mb-1">Resolved At</div>
                    <div className="text-gray-700 text-sm">{formatTime(detailAlert.resolvedAt)}</div>
                  </div>
                )}
              </div>

              {/* Status */}
              <div>
                <div className="text-xs font-semibold text-gray-500 uppercase mb-1">Status</div>
                {isResolved(detailAlert) ? (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-700">
                    ✅ Resolved
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold bg-red-100 text-red-700">
                    🔴 Active
                  </span>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 p-5 border-t border-gray-200">
              <button
                onClick={() => { setDetailAlert(null); setParentInfo(null); }}
                className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
              {!isResolved(detailAlert) && (
                <button
                  onClick={() => handleResolve(detailAlert.id)}
                  disabled={resolvingId === detailAlert.id}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors disabled:opacity-50"
                  style={{ backgroundColor: "#059669" }}
                >
                  {resolvingId === detailAlert.id ? "Resolving…" : "✅ Mark as Resolved"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
