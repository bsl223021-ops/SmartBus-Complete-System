import React, { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from "chart.js";
import { Doughnut, Bar } from "react-chartjs-2";
import StatsCard from "../components/StatsCard";
import { getDashboardStats, getAttendanceByDate } from "../services/firebaseService";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalBuses: 0,
    totalDrivers: 0,
    totalRoutes: 0,
    presentToday: 0,
    absentToday: 0,
  });
  const [loading, setLoading] = useState(true);
  const [weeklyData, setWeeklyData] = useState({ labels: [], datasets: [] });

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await getDashboardStats();
        setStats(data);

        const days = [];
        const labels = [];
        for (let i = 6; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          days.push(d.toISOString().slice(0, 10));
          labels.push(d.toLocaleDateString("en-US", { weekday: "short" }));
        }

        const dailyRecords = await Promise.all(days.map((date) => getAttendanceByDate(date)));
        const presentCounts = dailyRecords.map((records) => records.filter((r) => r.status === "present").length);
        const absentCounts = dailyRecords.map((records) => records.filter((r) => r.status === "absent").length);

        setWeeklyData({
          labels,
          datasets: [
            { label: "Present", data: presentCounts, backgroundColor: "#FFC107", borderRadius: 4 },
            { label: "Absent", data: absentCounts, backgroundColor: "#6C757D", borderRadius: 4 },
          ],
        });
      } catch (err) {
        console.error("Failed to load dashboard stats:", err);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  const attendanceData = {
    labels: ["Present", "Absent"],
    datasets: [
      {
        data: [stats.presentToday, stats.absentToday],
        backgroundColor: ["#FFC107", "#6C757D"],
        borderWidth: 2,
        borderColor: ["#E6AC00", "#5a6268"],
      },
    ],
  };

  const quickActions = [
    { label: "Add Student", icon: "👨‍🎓", href: "/students", color: "bg-yellow-50 border-yellow-200 text-yellow-700" },
    { label: "Add Bus", icon: "🚌", href: "/buses", color: "bg-blue-50 border-blue-200 text-blue-700" },
    { label: "Add Driver", icon: "👤", href: "/drivers", color: "bg-purple-50 border-purple-200 text-purple-700" },
    { label: "Add Route", icon: "🗺️", href: "/routes", color: "bg-green-50 border-green-200 text-green-700" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2" style={{ borderColor: "#FFC107" }} />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[28px] font-bold text-gray-900">Dashboard</h1>
          <p className="text-[16px] text-gray-500 mt-0.5">
            {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>
        <div
          className="px-4 py-2 rounded-lg text-sm font-semibold"
          style={{ background: "#FFC107", color: "#000" }}
        >
          Live
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Students" value={stats.totalStudents} icon="👨‍🎓" color="yellow" />
        <StatsCard title="Active Buses" value={stats.totalBuses} icon="🚌" color="blue" />
        <StatsCard title="Drivers" value={stats.totalDrivers} icon="👤" color="purple" />
        <StatsCard title="Routes" value={stats.totalRoutes} icon="🗺️" color="green" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 lg:col-span-2">
          <h2 className="text-[20px] font-semibold text-gray-800 mb-4">Weekly Attendance</h2>
          <Bar
            data={weeklyData}
            options={{
              responsive: true,
              plugins: { legend: { position: "top" } },
              scales: { x: { stacked: false }, y: { beginAtZero: true } },
            }}
          />
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-[20px] font-semibold text-gray-800 mb-4">Today's Attendance</h2>
          <Doughnut
            data={attendanceData}
            options={{ responsive: true, plugins: { legend: { position: "bottom" } } }}
          />
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-500">
              <span className="font-semibold" style={{ color: "#FFC107" }}>{stats.presentToday}</span>
              {" "}present out of{" "}
              <span className="font-semibold text-gray-700">{stats.totalStudents}</span> students
            </p>
          </div>
        </div>
      </div>

      {/* Attendance summary + Quick actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="grid grid-cols-2 gap-4">
          <StatsCard title="Present Today" value={stats.presentToday} icon="✅" color="green" />
          <StatsCard title="Absent Today" value={stats.absentToday} icon="❌" color="red" />
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-[20px] font-semibold text-gray-800 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map(({ label, icon, href, color }) => (
              <a
                key={href}
                href={href}
                className={`flex items-center gap-2 px-4 py-3 rounded-lg border text-sm font-medium transition-opacity hover:opacity-80 ${color}`}
              >
                <span className="text-lg">{icon}</span>
                {label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
