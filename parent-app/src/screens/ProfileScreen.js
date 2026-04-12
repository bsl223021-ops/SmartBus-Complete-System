import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI, studentsAPI } from '../services/api';
import theme from '../theme/theme';

const ProfileScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [student, setStudent] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const userStr = await AsyncStorage.getItem('user');
      if (userStr) {
        const userData = JSON.parse(userStr);
        setUser(userData);
        const studentsRes = await studentsAPI.getByParentEmail(userData.email);
        if (studentsRes.data.length > 0) {
          setStudent(studentsRes.data[0]);
        }
      }
    } catch (err) {
      console.error('Failed to load profile:', err);
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
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user?.fullName?.charAt(0) || 'P'}</Text>
        </View>
        <Text style={styles.name}>{user?.fullName || 'Parent'}</Text>
        <Text style={styles.role}>👨‍👩‍👧 Parent Account</Text>
      </View>

      {student && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>👶 Child Information</Text>
          <InfoRow label="Name" value={student.fullName} />
          <InfoRow label="Roll Number" value={student.rollNumber} />
          <InfoRow label="Grade" value={`${student.grade || ''} ${student.section || ''}`.trim() || 'N/A'} />
          <InfoRow label="Boarding Point" value={student.boardingPoint || 'N/A'} />
          <InfoRow label="Assigned Bus" value={student.busNumber || 'Not Assigned'} />
        </View>
      )}

      <View style={styles.card}>
        <Text style={styles.cardTitle}>👤 Account Information</Text>
        <InfoRow label="Email" value={user?.email || '-'} />
        <InfoRow label="Role" value="Parent" />
      </View>

      <View style={styles.actionsSection}>
        <TouchableOpacity style={styles.actionItem}>
          <Text style={styles.actionText}>🔔 Notification Preferences</Text>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionItem}>
          <Text style={styles.actionText}>🔒 Change Password</Text>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionItem}>
          <Text style={styles.actionText}>📞 Contact School</Text>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionItem}>
          <Text style={styles.actionText}>📋 Terms & Privacy Policy</Text>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>🚪 Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const InfoRow = ({ label, value }) => (
  <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: theme.colors.border }}>
    <Text style={{ color: theme.colors.textSecondary, fontSize: 13 }}>{label}</Text>
    <Text style={{ color: theme.colors.textPrimary, fontSize: 13, fontWeight: '500' }}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: { backgroundColor: theme.colors.primary, padding: theme.spacing.xl, paddingTop: 50, alignItems: 'center' },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: theme.colors.secondary, justifyContent: 'center', alignItems: 'center', marginBottom: theme.spacing.md },
  avatarText: { fontSize: 32, color: theme.colors.white, fontWeight: 'bold' },
  name: { color: theme.colors.white, fontSize: 22, fontWeight: 'bold' },
  role: { color: 'rgba(255,255,255,0.8)', fontSize: 14, marginTop: 4 },
  card: { margin: theme.spacing.md, backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.lg, padding: theme.spacing.lg, elevation: 1 },
  cardTitle: { fontSize: 15, fontWeight: '600', color: theme.colors.primary, marginBottom: theme.spacing.md },
  actionsSection: { backgroundColor: theme.colors.surface, margin: theme.spacing.md, borderRadius: theme.borderRadius.lg, elevation: 1 },
  actionItem: { flexDirection: 'row', justifyContent: 'space-between', padding: theme.spacing.md, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
  actionText: { fontSize: 14, color: theme.colors.textPrimary },
  arrow: { fontSize: 20, color: theme.colors.textSecondary },
  logoutBtn: { margin: theme.spacing.md, marginBottom: theme.spacing.xl, backgroundColor: '#ffebee', borderRadius: theme.borderRadius.md, padding: theme.spacing.lg, alignItems: 'center', borderWidth: 1, borderColor: '#ffcdd2' },
  logoutText: { color: theme.colors.danger, fontSize: 16, fontWeight: '600' },
});

export default ProfileScreen;
