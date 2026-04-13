import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { onAuthChange } from "./services/authService";
import Navigation from "./components/Navigation";
import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import StudentManagement from "./pages/StudentManagement";
import BusManagement from "./pages/BusManagement";
import RouteManagement from "./pages/RouteManagement";
import AttendanceTracking from "./pages/AttendanceTracking";
import DriverManagement from "./pages/DriverManagement";
import TripManagement from "./pages/TripManagement";
import ProfilePage from "./pages/ProfilePage";
import AlertManagement from "./pages/AlertManagement";

function ProtectedLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Navigation />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(undefined);

  useEffect(() => {
    const unsub = onAuthChange((u) => setUser(u));
    return unsub;
  }, []);

  if (user === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ background: "#FFC107" }}
          >
            <svg className="w-7 h-7 text-black" fill="currentColor" viewBox="0 0 24 24">
              <path d="M4 16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8c0-3-2-5-5-5H9C6 3 4 5 4 8v8z" />
            </svg>
          </div>
          <div
            className="animate-spin rounded-full h-8 w-8 border-b-2"
            style={{ borderColor: "#FFC107" }}
          />
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
        <Route
          path="/dashboard"
          element={user ? <ProtectedLayout><Dashboard /></ProtectedLayout> : <Navigate to="/login" replace />}
        />
        <Route
          path="/students"
          element={user ? <ProtectedLayout><StudentManagement /></ProtectedLayout> : <Navigate to="/login" replace />}
        />
        <Route
          path="/buses"
          element={user ? <ProtectedLayout><BusManagement /></ProtectedLayout> : <Navigate to="/login" replace />}
        />
        <Route
          path="/routes"
          element={user ? <ProtectedLayout><RouteManagement /></ProtectedLayout> : <Navigate to="/login" replace />}
        />
        <Route
          path="/drivers"
          element={user ? <ProtectedLayout><DriverManagement /></ProtectedLayout> : <Navigate to="/login" replace />}
        />
        <Route
          path="/trips"
          element={user ? <ProtectedLayout><TripManagement /></ProtectedLayout> : <Navigate to="/login" replace />}
        />
        <Route
          path="/attendance"
          element={user ? <ProtectedLayout><AttendanceTracking /></ProtectedLayout> : <Navigate to="/login" replace />}
        />
        <Route
          path="/profile"
          element={user ? <ProtectedLayout><ProfilePage /></ProtectedLayout> : <Navigate to="/login" replace />}
        />
        <Route
          path="/alerts"
          element={user ? <ProtectedLayout><AlertManagement /></ProtectedLayout> : <Navigate to="/login" replace />}
        />
        <Route path="*" element={<Navigate to={user ? "/dashboard" : "/login"} replace />} />
      </Routes>
    </BrowserRouter>
  );
}
