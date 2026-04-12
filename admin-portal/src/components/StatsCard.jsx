import React from "react";

const colorMap = {
  blue: { bg: "bg-blue-50", text: "text-blue-700", icon: "bg-blue-100" },
  green: { bg: "bg-green-50", text: "text-green-700", icon: "bg-green-100" },
  purple: { bg: "bg-purple-50", text: "text-purple-700", icon: "bg-purple-100" },
  orange: { bg: "bg-orange-50", text: "text-orange-700", icon: "bg-orange-100" },
  red: { bg: "bg-red-50", text: "text-red-700", icon: "bg-red-100" },
};

export default function StatsCard({ title, value, icon, color = "blue" }) {
  const scheme = colorMap[color] || colorMap.blue;
  return (
    <div className={`${scheme.bg} rounded-xl p-5 flex items-center gap-4`}>
      <div className={`${scheme.icon} rounded-full w-12 h-12 flex items-center justify-center text-2xl`}>
        {icon}
      </div>
      <div>
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{title}</p>
        <p className={`text-3xl font-bold ${scheme.text}`}>{value}</p>
      </div>
    </div>
  );
}
