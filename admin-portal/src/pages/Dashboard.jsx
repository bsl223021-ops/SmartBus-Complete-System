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

        // Build weekly attendance from real Firestore data (last 7 days)
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
            { label: "Present", data: presentCounts, backgroundColor: "rgba(59, 130, 246, 0.7)", borderRadius: 4 },
            { label: "Absent", data: absentCounts, backgroundColor: "rgba(239, 68, 68, 0.7)", borderRadius: 4 },
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
        backgroundColor: ["#3B82F6", "#EF4444"],
        borderWidth: 2,
        borderColor: ["#2563EB", "#DC2626"],
      },
    ],
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Welcome back! Here's what's happening today.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Students" value={stats.totalStudents} icon="👨‍🎓" color="blue" />
        <StatsCard title="Active Buses" value={stats.totalBuses} icon="🚌" color="green" />
        <StatsCard title="Drivers" value={stats.totalDrivers} icon="👨‍✈️" color="purple" />
        <StatsCard title="Routes" value={stats.totalRoutes} icon="🗺️" color="orange" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 lg:col-span-2">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Weekly Attendance</h2>
          <Bar
            data={weeklyData}
            options={{
              responsive: true,
              plugins: { legend: { position: "top" } },
              scales: { x: { stacked: false }, y: { beginAtZero: true } },
            }}
          />
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Today's Attendance</h2>
          <Doughnut data={attendanceData} options={{ responsive: true, plugins: { legend: { position: "bottom" } } }} />
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-500">
              <span className="font-semibold text-blue-600">{stats.presentToday}</span> present out of{" "}
              <span className="font-semibold">{stats.totalStudents}</span> students
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatsCard title="Present Today" value={stats.presentToday} icon="✅" color="green" />
        <StatsCard title="Absent Today" value={stats.absentToday} icon="❌" color="red" />
      </div>
    </div>
  );
}
