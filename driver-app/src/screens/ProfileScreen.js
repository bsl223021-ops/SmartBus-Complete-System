import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI } from '../services/api';
import theme from '../theme/theme';

const ProfileScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userStr = await AsyncStorage.getItem('user');
      if (userStr) setUser(JSON.parse(userStr));
    } catch (err) {
      console.error('Failed to load user:', err);
    }
  };

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          try {
            await authAPI.logout();
          } finally {
            await AsyncStorage.multiRemove(['token', 'user']);
            navigation.replace('Login');
          }
        }
      }
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user?.fullName?.charAt(0) || 'D'}</Text>
        </View>
        <Text style={styles.name}>{user?.fullName || 'Driver'}</Text>
        <Text style={styles.role}>🚌 Bus Driver</Text>
      </View>

      <View style={styles.infoCard}>
        <InfoRow label="Email" value={user?.email || '-'} />
        <InfoRow label="Role" value={user?.role || 'DRIVER'} />
        <InfoRow label="User ID" value={user?.id?.toString() || '-'} />
      </View>

      <View style={styles.actionsSection}>
        <TouchableOpacity style={styles.actionItem}>
          <Text style={styles.actionText}>🔔 Notification Settings</Text>
          <Text style={styles.actionArrow}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionItem}>
          <Text style={styles.actionText}>🔒 Change Password</Text>
          <Text style={styles.actionArrow}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionItem}>
          <Text style={styles.actionText}>📞 Contact Support</Text>
          <Text style={styles.actionArrow}>›</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>🚪 Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

const InfoRow = ({ label, value }) => (
  <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: theme.colors.border }}>
    <Text style={{ color: theme.colors.textSecondary, fontSize: 14 }}>{label}</Text>
    <Text style={{ color: theme.colors.textPrimary, fontSize: 14, fontWeight: '500' }}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: { backgroundColor: theme.colors.primary, padding: theme.spacing.xl, paddingTop: 50, alignItems: 'center' },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: theme.colors.secondary, justifyContent: 'center', alignItems: 'center', marginBottom: theme.spacing.md },
  avatarText: { fontSize: 32, color: theme.colors.white, fontWeight: 'bold' },
  name: { color: theme.colors.white, fontSize: 22, fontWeight: 'bold' },
  role: { color: 'rgba(255,255,255,0.8)', fontSize: 14, marginTop: 4 },
  infoCard: { backgroundColor: theme.colors.surface, margin: theme.spacing.md, borderRadius: theme.borderRadius.lg, padding: theme.spacing.lg, elevation: 1 },
  actionsSection: { backgroundColor: theme.colors.surface, margin: theme.spacing.md, borderRadius: theme.borderRadius.lg, elevation: 1 },
  actionItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: theme.spacing.md, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
  actionText: { fontSize: 15, color: theme.colors.textPrimary },
  actionArrow: { fontSize: 20, color: theme.colors.textSecondary },
  logoutBtn: { margin: theme.spacing.md, backgroundColor: '#ffebee', borderRadius: theme.borderRadius.md, padding: theme.spacing.lg, alignItems: 'center', borderWidth: 1, borderColor: '#ffcdd2' },
  logoutText: { color: theme.colors.danger, fontSize: 16, fontWeight: '600' },
});

export default ProfileScreen;
