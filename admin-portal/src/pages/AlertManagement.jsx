import React, { useEffect, useState } from "react";
import { subscribeToAlerts, updateAlert, deleteAlert } from "../services/firebaseService";

const TYPE_LABELS = {
  emergency: { label: "Emergency", color: "#DC2626", bg: "#FEE2E2" },
  delay: { label: "Delay", color: "#D97706", bg: "#FEF3C7" },
  absent: { label: "Absence", color: "#2563EB", bg: "#DBEAFE" },
  other: { label: "Other", color: "#6B7280", bg: "#F3F4F6" },
};

function formatTime(ts) {
  if (!ts) return "—";
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleString();
}

function AlertBadge({ type }) {
  const meta = TYPE_LABELS[type] || TYPE_LABELS.other;
  return (
    <span
      className="px-2 py-0.5 rounded-full text-xs font-semibold"
      style={{ color: meta.color, background: meta.bg }}
    >
      {meta.label}
    </span>
  );
}

function StatusBadge({ alert }) {
  const isResolved = alert.status === "resolved" || alert.resolved === true;
  return (
    <span
      className="px-2 py-0.5 rounded-full text-xs font-semibold"
      style={
        isResolved
          ? { color: "#059669", background: "#D1FAE5" }
          : { color: "#DC2626", background: "#FEE2E2" }
      }
    >
      {isResolved ? "Resolved" : "Open"}
    </span>
  );
}

export default function AlertManagement() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [filterDate, setFilterDate] = useState("");
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    const unsub = subscribeToAlerts((data) => {
      setAlerts(data);
      setLoading(false);
    });
    return unsub;
  }, []);

  const today = new Date().toISOString().slice(0, 10);

  const filtered = alerts.filter((a) => {
    const isResolved = a.status === "resolved" || a.resolved === true;
    if (filterStatus === "open" && isResolved) return false;
    if (filterStatus === "resolved" && !isResolved) return false;
    if (filterType !== "all" && a.type !== filterType) return false;
    if (filterDate) {
      const alertDate = a.createdAt?.toDate
        ? a.createdAt.toDate().toISOString().slice(0, 10)
        : "";
      if (alertDate !== filterDate) return false;
    }
    return true;
  });

  const todayAlerts = alerts.filter((a) => {
    const d = a.createdAt?.toDate ? a.createdAt.toDate().toISOString().slice(0, 10) : "";
    return d === today;
  });
  const openCount = alerts.filter((a) => a.status !== "resolved" && a.resolved !== true).length;
  const resolvedCount = alerts.filter((a) => a.status === "resolved" || a.resolved === true).length;

  const handleResolve = async (alert) => {
    setActionLoading(alert.id);
    try {
      await updateAlert(alert.id, {
        status: "resolved",
        resolved: true,
        resolvedAt: new Date().toISOString(),
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleReopen = async (alert) => {
    setActionLoading(alert.id);
    try {
      await updateAlert(alert.id, {
        status: "open",
        resolved: false,
        resolvedAt: null,
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (alert) => {
    if (!window.confirm("Delete this alert permanently?")) return;
    setActionLoading(alert.id);
    try {
      await deleteAlert(alert.id);
      if (selectedAlert?.id === alert.id) setSelectedAlert(null);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Alert Management</h1>
        <p className="text-gray-500 text-sm mt-1">View and manage alerts sent by parents</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="text-sm text-gray-500 mb-1">Alerts Today</div>
          <div className="text-3xl font-bold text-gray-900">{todayAlerts.length}</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="text-sm text-gray-500 mb-1">Open Alerts</div>
          <div className="text-3xl font-bold" style={{ color: "#DC2626" }}>{openCount}</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="text-sm text-gray-500 mb-1">Resolved Alerts</div>
          <div className="text-3xl font-bold" style={{ color: "#059669" }}>{resolvedCount}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-6 flex flex-wrap gap-4 items-center">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Status</label>
          <select
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All</option>
            <option value="open">Open</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Type</label>
          <select
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="all">All Types</option>
            <option value="emergency">Emergency</option>
            <option value="delay">Delay</option>
            <option value="absent">Absence</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Date</label>
          <input
            type="date"
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
          />
        </div>
        {(filterStatus !== "all" || filterType !== "all" || filterDate) && (
          <button
            className="mt-4 text-xs text-gray-400 hover:text-gray-700 underline"
            onClick={() => { setFilterStatus("all"); setFilterType("all"); setFilterDate(""); }}
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Alert list */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: "#DC2626" }} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-100">
          <div className="text-5xl mb-3">🔔</div>
          <div className="text-gray-500 text-base">No alerts found</div>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((alert) => {
            const isResolved = alert.status === "resolved" || alert.resolved === true;
            return (
              <div
                key={alert.id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-xl"
                      style={{ background: (TYPE_LABELS[alert.type] || TYPE_LABELS.other).bg }}
                    >
                      {alert.type === "emergency" ? "🚨" : alert.type === "delay" ? "⏰" : alert.type === "absent" ? "🏠" : "📢"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <AlertBadge type={alert.type} />
                        <StatusBadge alert={alert} />
                        <span className="text-xs text-gray-400">{formatTime(alert.createdAt)}</span>
                      </div>
                      <div className="text-sm font-medium text-gray-800 truncate">
                        {alert.message || "No message"}
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs text-gray-500">
                        {alert.studentName && <span>👤 {alert.studentName}</span>}
                        {alert.busId && <span>🚌 Bus: {alert.busId}</span>}
                        {alert.parentEmail && <span>📧 {alert.parentEmail}</span>}
                        {alert.parentPhone && <span>📞 {alert.parentPhone}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      className="text-xs px-3 py-1.5 rounded-lg font-medium transition-colors"
                      style={{ background: "#F3F4F6", color: "#374151" }}
                      onClick={() => setSelectedAlert(selectedAlert?.id === alert.id ? null : alert)}
                    >
                      {selectedAlert?.id === alert.id ? "Hide" : "Details"}
                    </button>
                    {alert.parentPhone && (
                      <a
                        href={`tel:${alert.parentPhone}`}
                        className="text-xs px-3 py-1.5 rounded-lg font-medium transition-colors"
                        style={{ background: "#DBEAFE", color: "#2563EB" }}
                      >
                        📞 Call
                      </a>
                    )}
                    {!isResolved ? (
                      <button
                        className="text-xs px-3 py-1.5 rounded-lg font-medium transition-colors disabled:opacity-60"
                        style={{ background: "#D1FAE5", color: "#059669" }}
                        disabled={actionLoading === alert.id}
                        onClick={() => handleResolve(alert)}
                      >
                        {actionLoading === alert.id ? "..." : "✓ Resolve"}
                      </button>
                    ) : (
                      <button
                        className="text-xs px-3 py-1.5 rounded-lg font-medium transition-colors disabled:opacity-60"
                        style={{ background: "#FEF3C7", color: "#D97706" }}
                        disabled={actionLoading === alert.id}
                        onClick={() => handleReopen(alert)}
                      >
                        {actionLoading === alert.id ? "..." : "↩ Reopen"}
                      </button>
                    )}
                    <button
                      className="text-xs px-3 py-1.5 rounded-lg font-medium transition-colors disabled:opacity-60"
                      style={{ background: "#FEE2E2", color: "#DC2626" }}
                      disabled={actionLoading === alert.id}
                      onClick={() => handleDelete(alert)}
                    >
                      {actionLoading === alert.id ? "..." : "🗑 Delete"}
                    </button>
                  </div>
                </div>

                {/* Expanded details */}
                {selectedAlert?.id === alert.id && (
                  <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-gray-400">Student ID:</span>{" "}
                      <span className="text-gray-700">{alert.studentId || "—"}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Student Name:</span>{" "}
                      <span className="text-gray-700">{alert.studentName || "—"}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Bus ID:</span>{" "}
                      <span className="text-gray-700">{alert.busId || "—"}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Parent UID:</span>{" "}
                      <span className="text-gray-700 text-xs break-all">{alert.parentUid || "—"}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Parent Email:</span>{" "}
                      <span className="text-gray-700">{alert.parentEmail || "—"}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Parent Phone:</span>{" "}
                      <span className="text-gray-700">{alert.parentPhone || "—"}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Sent:</span>{" "}
                      <span className="text-gray-700">{formatTime(alert.createdAt)}</span>
                    </div>
                    {alert.resolvedAt && (
                      <div>
                        <span className="text-gray-400">Resolved At:</span>{" "}
                        <span className="text-gray-700">{formatTime(alert.resolvedAt)}</span>
                      </div>
                    )}
                    <div className="col-span-2">
                      <span className="text-gray-400">Message:</span>{" "}
                      <span className="text-gray-700">{alert.message || "—"}</span>
                    </div>
                    {alert.viewedByDriver !== undefined && (
                      <div>
                        <span className="text-gray-400">Viewed by Driver:</span>{" "}
                        <span className="text-gray-700">{alert.viewedByDriver ? "Yes" : "No"}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
