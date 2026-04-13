import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Text, View } from "react-native";
import { useAuth } from "../context/AuthContext";

import LoginScreen from "../screens/AuthStack/LoginScreen";
import SignUpScreen from "../screens/AuthStack/SignUpScreen";
import HomeScreen from "../screens/AppStack/HomeScreen";
import QRScannerScreen from "../screens/AppStack/QRScannerScreen";
import AttendanceHistoryScreen from "../screens/AppStack/AttendanceHistoryScreen";
import GPSTrackingScreen from "../screens/AppStack/GPSTrackingScreen";
import ProfileScreen from "../screens/AppStack/ProfileScreen";
import AlertsScreen from "../screens/AppStack/AlertsScreen";
import { getAssignedBus, getAlertCount } from "../services/firebaseService";

const AuthStack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="SignUp" component={SignUpScreen} />
    </AuthStack.Navigator>
  );
}

function AppNavigator() {
  const { user } = useAuth();
  const [alertBadge, setAlertBadge] = useState(0);

  useEffect(() => {
    if (!user?.uid) return;
    let interval;
    const fetchCount = async () => {
      try {
        const bus = await getAssignedBus(user.uid);
        if (bus) {
          const count = await getAlertCount(bus.id);
          setAlertBadge(count);
        }
      } catch (_) {}
    };
    fetchCount();
    interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, [user?.uid]);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: "#1D4ED8",
        tabBarInactiveTintColor: "#9CA3AF",
        tabBarStyle: { paddingBottom: 6, height: 60 },
        tabBarIcon: ({ focused, color }) => {
          const icons = {
            Home: "🏠",
            QRScanner: "📷",
            AttendanceHistory: "📋",
            GPSTracking: "📍",
            Alerts: "🔔",
            Profile: "👤",
          };
          if (route.name === "Alerts" && alertBadge > 0) {
            return (
              <View>
                <Text style={{ fontSize: 22 }}>{icons[route.name]}</Text>
                <View style={{
                  position: "absolute", top: -2, right: -6,
                  backgroundColor: "#DC2626", borderRadius: 8,
                  minWidth: 16, height: 16, alignItems: "center", justifyContent: "center",
                }}>
                  <Text style={{ color: "#fff", fontSize: 9, fontWeight: "bold" }}>
                    {alertBadge > 9 ? "9+" : alertBadge}
                  </Text>
                </View>
              </View>
            );
          }
          return <Text style={{ fontSize: 22 }}>{icons[route.name] || "●"}</Text>;
        },
        tabBarLabel: ({ focused, color }) => {
          const labels = {
            Home: "Home",
            QRScanner: "Scan QR",
            AttendanceHistory: "History",
            GPSTracking: "GPS",
            Alerts: "Alerts",
            Profile: "Profile",
          };
          return <Text style={{ color, fontSize: 11 }}>{labels[route.name]}</Text>;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="QRScanner" component={QRScannerScreen} />
      <Tab.Screen name="AttendanceHistory" component={AttendanceHistoryScreen} />
      <Tab.Screen name="GPSTracking" component={GPSTrackingScreen} />
      <Tab.Screen name="Alerts" component={AlertsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function Navigation() {
  const { user, loading } = useAuth();
  if (loading) return null;
  return (
    <NavigationContainer>
      {user ? <AppNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}
