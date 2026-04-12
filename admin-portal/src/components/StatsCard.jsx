import React from "react";

const colorMap = {
  yellow: { bg: "bg-yellow-50", text: "text-yellow-700", icon: "bg-yellow-100", border: "border-yellow-200" },
  green: { bg: "bg-green-50", text: "text-green-700", icon: "bg-green-100", border: "border-green-200" },
  blue: { bg: "bg-blue-50", text: "text-blue-700", icon: "bg-blue-100", border: "border-blue-200" },
  purple: { bg: "bg-purple-50", text: "text-purple-700", icon: "bg-purple-100", border: "border-purple-200" },
  orange: { bg: "bg-orange-50", text: "text-orange-700", icon: "bg-orange-100", border: "border-orange-200" },
  red: { bg: "bg-red-50", text: "text-red-700", icon: "bg-red-100", border: "border-red-200" },
};

export default function StatsCard({ title, value, icon, color = "yellow", trend }) {
  const scheme = colorMap[color] || colorMap.yellow;
  return (
    <div className={`bg-white rounded-xl p-5 border ${scheme.border} shadow-sm flex items-center gap-4`}>
      <div className={`${scheme.icon} rounded-xl w-12 h-12 flex items-center justify-center text-2xl flex-shrink-0`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide truncate">{title}</p>
        <p className={`text-3xl font-bold ${scheme.text}`}>{value}</p>
        {trend && <p className="text-xs text-gray-400 mt-0.5">{trend}</p>}
      </div>
    </div>
  );
}
