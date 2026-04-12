import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Text } from "react-native";
import { useAuth } from "../context/AuthContext";

import LoginScreen from "../screens/AuthStack/LoginScreen";
import SignUpScreen from "../screens/AuthStack/SignUpScreen";
import TrackingScreen from "../screens/AppStack/TrackingScreen";
import NotificationsScreen from "../screens/AppStack/NotificationsScreen";
import StudentProfileScreen from "../screens/AppStack/StudentProfileScreen";
import AlertScreen from "../screens/AppStack/AlertScreen";

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
        tabBarActiveTintColor: "#059669",
        tabBarInactiveTintColor: "#9CA3AF",
        tabBarStyle: { paddingBottom: 6, height: 60 },
        tabBarIcon: ({ color }) => {
          const icons = {
            Tracking: "🚌",
            Notifications: "🔔",
            StudentProfile: "👧",
            Alert: "🚨",
          };
          return <Text style={{ fontSize: 22 }}>{icons[route.name] || "●"}</Text>;
        },
        tabBarLabel: ({ color }) => {
          const labels = {
            Tracking: "Track Bus",
            Notifications: "Alerts",
            StudentProfile: "My Child",
            Alert: "SOS",
          };
          return <Text style={{ color, fontSize: 11 }}>{labels[route.name]}</Text>;
        },
      })}
    >
      <Tab.Screen name="Tracking" component={TrackingScreen} />
      <Tab.Screen name="Notifications" component={NotificationsScreen} />
      <Tab.Screen name="StudentProfile" component={StudentProfileScreen} />
      <Tab.Screen name="Alert" component={AlertScreen} />
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
