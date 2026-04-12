import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Text } from 'react-native';
import LoginScreen from '../screens/LoginScreen';
import TrackingScreen from '../screens/TrackingScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import HistoryScreen from '../screens/HistoryScreen';
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
      name="Tracking"
      component={TrackingScreen}
      options={{ tabBarIcon: ({ focused }) => <TabIcon focused={focused} emoji="🗺️" />, tabBarLabel: 'Track Bus' }}
    />
    <Tab.Screen
      name="Notifications"
      component={NotificationsScreen}
      options={{ tabBarIcon: ({ focused }) => <TabIcon focused={focused} emoji="🔔" />, tabBarLabel: 'Alerts' }}
    />
    <Tab.Screen
      name="History"
      component={HistoryScreen}
      options={{ tabBarIcon: ({ focused }) => <TabIcon focused={focused} emoji="📋" />, tabBarLabel: 'History' }}
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
