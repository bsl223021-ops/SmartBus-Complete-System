import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { busesAPI, attendanceAPI } from '../services/api';
import LocationService from '../services/LocationService';
import theme from '../theme/theme';

const HomeScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [bus, setBus] = useState(null);
  const [todayAttendance, setTodayAttendance] = useState([]);
  const [tracking, setTracking] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const userStr = await AsyncStorage.getItem('user');
      if (userStr) {
        const userData = JSON.parse(userStr);
        setUser(userData);
        await loadBusData(userData.id);
      }
    } catch (err) {
      console.error('Failed to load data:', err);
    }
  };

  const loadBusData = async (driverId) => {
    try {
      const busRes = await busesAPI.getAll();
      const driverBus = busRes.data.find(b => b.driverId === driverId);
      if (driverBus) {
        setBus(driverBus);
        const attRes = await attendanceAPI.getTodayAttendance(driverBus.id);
        setTodayAttendance(attRes.data);
      }
    } catch (err) {
      console.error('Failed to load bus data:', err);
    }
  };

  const toggleTracking = async () => {
    if (!bus) {
      Alert.alert('No Bus Assigned', 'You need to be assigned to a bus first.');
      return;
    }
    if (tracking) {
      await LocationService.stopTracking();
      setTracking(false);
      Alert.alert('Tracking Stopped', 'Location tracking has been disabled.');
    } else {
      try {
        await LocationService.startTracking(bus.id);
        setTracking(true);
        Alert.alert('Tracking Started', 'Your location is being shared.');
      } catch (err) {
        Alert.alert('Error', err.message);
      }
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const presentCount = todayAttendance.filter(a => a.status === 'PRESENT').length;

  return (
    <ScrollView style={styles.container} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Good {new Date().getHours() < 12 ? 'Morning' : 'Afternoon'}!</Text>
        <Text style={styles.driverName}>{user?.fullName || 'Driver'}</Text>
      </View>

      {bus ? (
        <View style={styles.busCard}>
          <Text style={styles.cardTitle}>🚌 Your Bus</Text>
          <View style={styles.busInfo}>
            <View style={styles.busInfoItem}>
              <Text style={styles.busInfoLabel}>Bus Number</Text>
              <Text style={styles.busInfoValue}>{bus.busNumber}</Text>
            </View>
            <View style={styles.busInfoItem}>
              <Text style={styles.busInfoLabel}>Route</Text>
              <Text style={styles.busInfoValue}>{bus.routeName || 'Not Assigned'}</Text>
            </View>
            <View style={styles.busInfoItem}>
              <Text style={styles.busInfoLabel}>Status</Text>
              <Text style={[styles.busInfoValue, { color: bus.status === 'ACTIVE' ? theme.colors.success : theme.colors.danger }]}>
                {bus.status}
              </Text>
            </View>
          </View>

          <TouchableOpacity style={[styles.trackingBtn, tracking && styles.trackingBtnActive]} onPress={toggleTracking}>
            <Text style={styles.trackingBtnText}>
              {tracking ? '⏹ Stop Location Tracking' : '▶ Start Location Tracking'}
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.noBusCard}>
          <Text style={styles.noBusText}>⚠️ No bus assigned to you yet.</Text>
          <Text style={styles.noBusSubtext}>Please contact your administrator.</Text>
        </View>
      )}

      <View style={styles.statsRow}>
        <View style={[styles.statBox, { backgroundColor: theme.colors.success }]}>
          <Text style={styles.statValue}>{presentCount}</Text>
          <Text style={styles.statLabel}>Present Today</Text>
        </View>
        <View style={[styles.statBox, { backgroundColor: theme.colors.info }]}>
          <Text style={styles.statValue}>{todayAttendance.length}</Text>
          <Text style={styles.statLabel}>Total Scanned</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.scanBtn} onPress={() => navigation.navigate('QRScanner')}>
        <Text style={styles.scanBtnText}>📱 Scan Student QR Code</Text>
      </TouchableOpacity>

      <View style={styles.recentSection}>
        <Text style={styles.sectionTitle}>Today's Attendance</Text>
        {todayAttendance.length === 0 ? (
          <Text style={styles.emptyText}>No attendance records yet today.</Text>
        ) : (
          todayAttendance.slice(0, 5).map(record => (
            <View key={record.id} style={styles.attendanceItem}>
              <View>
                <Text style={styles.attendanceName}>{record.studentName}</Text>
                <Text style={styles.attendanceRoll}>{record.rollNumber}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: record.status === 'PRESENT' ? '#e8f5e9' : '#ffebee' }]}>
                <Text style={{ color: record.status === 'PRESENT' ? theme.colors.success : theme.colors.danger, fontSize: 12 }}>
                  {record.status}
                </Text>
              </View>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: { backgroundColor: theme.colors.primary, padding: theme.spacing.xl, paddingTop: 50 },
  greeting: { color: 'rgba(255,255,255,0.8)', fontSize: 14 },
  driverName: { color: theme.colors.white, fontSize: 22, fontWeight: 'bold', marginTop: 4 },
  busCard: { margin: theme.spacing.md, backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.lg, padding: theme.spacing.lg, elevation: 2 },
  cardTitle: { fontSize: 16, fontWeight: '600', marginBottom: theme.spacing.md, color: theme.colors.primary },
  busInfo: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: theme.spacing.md },
  busInfoItem: { alignItems: 'center' },
  busInfoLabel: { fontSize: 12, color: theme.colors.textSecondary },
  busInfoValue: { fontSize: 16, fontWeight: '600', color: theme.colors.textPrimary },
  trackingBtn: { backgroundColor: theme.colors.primary, borderRadius: theme.borderRadius.md, padding: theme.spacing.md, alignItems: 'center' },
  trackingBtnActive: { backgroundColor: theme.colors.danger },
  trackingBtnText: { color: theme.colors.white, fontWeight: '600' },
  noBusCard: { margin: theme.spacing.md, backgroundColor: '#fff8e1', borderRadius: theme.borderRadius.lg, padding: theme.spacing.lg },
  noBusText: { fontSize: 16, fontWeight: '500', color: theme.colors.warning },
  noBusSubtext: { fontSize: 13, color: theme.colors.textSecondary, marginTop: 4 },
  statsRow: { flexDirection: 'row', margin: theme.spacing.md, gap: theme.spacing.md },
  statBox: { flex: 1, borderRadius: theme.borderRadius.md, padding: theme.spacing.lg, alignItems: 'center' },
  statValue: { fontSize: 32, fontWeight: 'bold', color: theme.colors.white },
  statLabel: { fontSize: 12, color: 'rgba(255,255,255,0.9)', marginTop: 4 },
  scanBtn: { margin: theme.spacing.md, backgroundColor: theme.colors.secondary, borderRadius: theme.borderRadius.md, padding: theme.spacing.lg, alignItems: 'center' },
  scanBtnText: { color: theme.colors.white, fontSize: 16, fontWeight: '600' },
  recentSection: { margin: theme.spacing.md },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: theme.spacing.md, color: theme.colors.textPrimary },
  attendanceItem: { backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.md, padding: theme.spacing.md, marginBottom: theme.spacing.sm, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', elevation: 1 },
  attendanceName: { fontSize: 14, fontWeight: '500' },
  attendanceRoll: { fontSize: 12, color: theme.colors.textSecondary },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: theme.borderRadius.round },
  emptyText: { textAlign: 'center', color: theme.colors.textSecondary, marginTop: theme.spacing.md },
});

export default HomeScreen;
