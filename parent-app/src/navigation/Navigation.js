import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Text, View } from "react-native";
import { useAuth } from "../context/AuthContext";
import { subscribeToNotifications } from "../services/firebaseService";

import LoginScreen from "../screens/AuthStack/LoginScreen";
import SignUpScreen from "../screens/AuthStack/SignUpScreen";
import TrackingScreen from "../screens/AppStack/TrackingScreen";
import NotificationsScreen from "../screens/AppStack/NotificationsScreen";
import StudentProfileScreen from "../screens/AppStack/StudentProfileScreen";
import AlertScreen from "../screens/AppStack/AlertScreen";
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
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeToNotifications(user.uid, (notifications) => {
      setUnreadCount(notifications.filter((n) => !n.read).length);
    });
    return unsub;
  }, [user]);

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
            Profile: "👤",
          };
          if (route.name === "Notifications" && unreadCount > 0) {
            return (
              <View>
                <Text style={{ fontSize: 22 }}>{icons[route.name]}</Text>
                <View style={{
                  position: "absolute", top: -4, right: -8,
                  backgroundColor: "#DC2626", borderRadius: 8,
                  minWidth: 16, height: 16,
                  justifyContent: "center", alignItems: "center", paddingHorizontal: 2,
                }}>
                  <Text style={{ color: "#fff", fontSize: 10, fontWeight: "bold" }}>
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </Text>
                </View>
              </View>
            );
          }
          return <Text style={{ fontSize: 22 }}>{icons[route.name] || "●"}</Text>;
        },
        tabBarLabel: ({ color }) => {
          const labels = {
            Tracking: "Track Bus",
            Notifications: "Alerts",
            StudentProfile: "My Child",
            Alert: "SOS",
            Profile: "Profile",
          };
          return <Text style={{ color, fontSize: 11 }}>{labels[route.name]}</Text>;
        },
      })}
    >
      <Tab.Screen name="Tracking" component={TrackingScreen} />
      <Tab.Screen name="Notifications" component={NotificationsScreen} />
      <Tab.Screen name="StudentProfile" component={StudentProfileScreen} />
      <Tab.Screen name="Alert" component={AlertScreen} />
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
