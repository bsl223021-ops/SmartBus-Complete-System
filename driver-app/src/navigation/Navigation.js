import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Text } from "react-native";
import { useAuth } from "../context/AuthContext";

import LoginScreen from "../screens/AuthStack/LoginScreen";
import SignUpScreen from "../screens/AuthStack/SignUpScreen";
import HomeScreen from "../screens/AppStack/HomeScreen";
import QRScannerScreen from "../screens/AppStack/QRScannerScreen";
import AttendanceHistoryScreen from "../screens/AppStack/AttendanceHistoryScreen";
import GPSTrackingScreen from "../screens/AppStack/GPSTrackingScreen";
import ProfileScreen from "../screens/AppStack/ProfileScreen";

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
            Profile: "👤",
          };
          return <Text style={{ fontSize: 22 }}>{icons[route.name] || "●"}</Text>;
        },
        tabBarLabel: ({ focused, color }) => {
          const labels = {
            Home: "Home",
            QRScanner: "Scan QR",
            AttendanceHistory: "History",
            GPSTracking: "GPS",
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
