import React, { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { AuthProvider } from "./src/context/AuthContext";
import Navigation from "./src/navigation/Navigation";
import {
  registerForPushNotifications,
  addNotificationListener,
  addNotificationResponseListener,
} from "./src/services/notificationService";

export default function App() {
  useEffect(() => {
    registerForPushNotifications(null);

    const sub1 = addNotificationListener((notification) => {
      console.log("Notification received:", notification);
    });

    const sub2 = addNotificationResponseListener((response) => {
      console.log("Notification response:", response);
    });

    return () => {
      sub1.remove();
      sub2.remove();
    };
  }, []);

  return (
    <AuthProvider>
      <StatusBar style="light" />
      <Navigation />
    </AuthProvider>
  );
}
