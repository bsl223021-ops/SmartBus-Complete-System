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

function ProtectedLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-gray-100">
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
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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
          path="/attendance"
          element={user ? <ProtectedLayout><AttendanceTracking /></ProtectedLayout> : <Navigate to="/login" replace />}
        />
        <Route path="*" element={<Navigate to={user ? "/dashboard" : "/login"} replace />} />
      </Routes>
    </BrowserRouter>
  );
}
