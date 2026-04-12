import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Text } from 'react-native';
import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import QRScannerScreen from '../screens/QRScannerScreen';
import AttendanceHistoryScreen from '../screens/AttendanceHistoryScreen';
import ProfileScreen from '../screens/ProfileScreen';
import theme from '../theme/theme';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const TabIcon = ({ focused, emoji }) => (
  <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.6 }}>{emoji}</Text>
);

const MainTabs = () => (
  <Tab.Navigator
    screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: theme.colors.primary,
      tabBarInactiveTintColor: theme.colors.textSecondary,
      tabBarStyle: { borderTopWidth: 1, borderTopColor: theme.colors.border, paddingBottom: 5, height: 60 },
    }}
  >
    <Tab.Screen
      name="Home"
      component={HomeScreen}
      options={{ tabBarIcon: ({ focused }) => <TabIcon focused={focused} emoji="🏠" />, tabBarLabel: 'Home' }}
    />
    <Tab.Screen
      name="QRScanner"
      component={QRScannerScreen}
      options={{ tabBarIcon: ({ focused }) => <TabIcon focused={focused} emoji="📱" />, tabBarLabel: 'Scan QR' }}
    />
    <Tab.Screen
      name="Attendance"
      component={AttendanceHistoryScreen}
      options={{ tabBarIcon: ({ focused }) => <TabIcon focused={focused} emoji="✅" />, tabBarLabel: 'Attendance' }}
    />
    <Tab.Screen
      name="Profile"
      component={ProfileScreen}
      options={{ tabBarIcon: ({ focused }) => <TabIcon focused={focused} emoji="👤" />, tabBarLabel: 'Profile' }}
    />
  </Tab.Navigator>
);

const AppNavigator = () => (
  <NavigationContainer>
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Main" component={MainTabs} />
    </Stack.Navigator>
  </NavigationContainer>
);

export default AppNavigator;
